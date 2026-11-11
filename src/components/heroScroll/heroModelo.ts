import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { MateriaisHero, TexturasHero } from './heroMateriais';

/**
 * Cozinha modelada a partir da fotografia /obras/cozinha-gringa-4k.
 * Medidas em metros, extraídas dos pontos de fuga da foto.
 * Origem no canto das paredes: X ao longo da parede dos armários, Z saindo dela.
 */
export const CAMERA_FOTO = {
  posicao: [4.25, 1.38, 3.34] as const,
  /** Ângulo horizontal em relação a -Z, em direção à parede esquerda. */
  guinada: THREE.MathUtils.degToRad(44.3),
  /** Tangentes do quadro completo da foto (câmera nivelada, com deslocamento de lente). */
  esquerda: -0.6248,
  direita: 0.6248,
  topo: 0.892,
  base: -0.97,
  aspecto: 1600 / 2385,
};

const CHAPA = 0.018;
const PLANTA_INICIAL = 0.28;
const FOLGA = 0.003;
const ALTURA_PE_DIREITO = 3.0;
export const PISO = { x: 5.4, z: 5.4, placa: 0.9 };

type V3 = [number, number, number];

/** Etapas da fase 3, na ordem de montagem. */
export const PESO_ETAPAS = [0.08, 0.1, 0.08, 0.06, 0.08, 0.16, 0.1, 0.16, 0.08, 0.1];

export interface Peca {
  etapa: number;
  ordem: number;
  aplicar: (t: number) => void;
}

interface OpcoesPeca {
  giro?: { eixo: 'x' | 'y'; angulo: number };
  interna?: boolean;
  ordem?: number;
  sombra?: boolean;
  espelho?: boolean;
}

function naoIndexada(g: THREE.BufferGeometry) {
  return g.index ? g.toNonIndexed() : g;
}

/** Qualidade do modelo por aparelho: sombras reais e segmentos do chanfro nas quinas. */
export interface QualidadeModelo {
  sombras: boolean;
  bisel: number;
}

/** Raio das quinas dos móveis (MDF real tem quina de 1 a 3 mm; 3,5 mm aparece sem exagerar). */
const RAIO_BISEL = 0.0035;

export function construirCozinha(mobile: boolean, m: MateriaisHero, t: TexturasHero, q: QualidadeModelo = { sombras: !mobile, bisel: mobile ? 0 : 2 }) {
  const raiz = new THREE.Group();
  const internos = new THREE.Group();
  const espelho = new THREE.Group();
  espelho.scale.y = -1;
  raiz.add(internos, espelho);

  const geometrias = new Set<THREE.BufferGeometry>();
  const materiaisAvulsos: THREE.Material[] = [];
  const pecas: Peca[] = [];

  const reg = <G extends THREE.BufferGeometry>(g: G): G => {
    geometrias.add(g);
    return g;
  };

  /** Caixa com UV em metros, para a textura manter a escala em qualquer peça. */
  let deslocUv = 0;
  function caixa(l: number, a: number, p: number, veio: 'x' | 'y' = 'y') {
    // Quina chanfrada: pega um fio de luz e separa as peças brancas umas das outras.
    const raio = q.bisel > 0 ? Math.min(RAIO_BISEL, Math.min(l, a, p) * 0.45) : 0;
    const g: THREE.BufferGeometry = raio > 0.0006 ? new RoundedBoxGeometry(l, a, p, q.bisel, raio) : new THREE.BoxGeometry(l, a, p);
    const uv = g.attributes.uv as THREE.BufferAttribute;
    const pos = g.attributes.position as THREE.BufferAttribute;
    const nor = g.attributes.normal as THREE.BufferAttribute;
    deslocUv += 0.37;
    for (let i = 0; i < uv.count; i++) {
      // Projeção em caixa: o rosto dominante da normal decide quais eixos viram U e V (em metros).
      const nx = Math.abs(nor.getX(i));
      const ny = Math.abs(nor.getY(i));
      const nz = Math.abs(nor.getZ(i));
      let u: number;
      let v: number;
      let topoOuBase = false;
      if (nx >= ny && nx >= nz) {
        u = pos.getZ(i) + p / 2;
        v = pos.getY(i) + a / 2;
      } else if (ny >= nz) {
        u = pos.getX(i) + l / 2;
        v = pos.getZ(i) + p / 2;
        topoOuBase = true;
      } else {
        u = pos.getX(i) + l / 2;
        v = pos.getY(i) + a / 2;
      }
      if (veio === 'y' && !topoOuBase) [u, v] = [v, u];
      uv.setXY(i, u + deslocUv, v + deslocUv * 0.6);
    }
    return g;
  }

  function fundir(partes: THREE.BufferGeometry[]) {
    const lista = partes.map(naoIndexada);
    const g = mergeGeometries(lista, false);
    partes.forEach((p) => p.dispose());
    lista.forEach((p) => p.dispose());
    return reg(g);
  }

  const em = <G extends THREE.BufferGeometry>(g: G, x: number, y: number, z: number): G => {
    g.translate(x, y, z);
    return g;
  };

  /** Registra uma peça que entra de `entrada` (deslocamento) e encaixa em `centro`. */
  function peca(
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    centro: V3,
    etapa: number,
    entrada: V3,
    op: OpcoesPeca = {}
  ) {
    const malha = new THREE.Mesh(geo, mat);
    const final = new THREE.Vector3(...centro);
    const origem = final.clone().add(new THREE.Vector3(...entrada));
    malha.castShadow = q.sombras && op.sombra !== false && !op.interna;
    malha.receiveShadow = q.sombras;
    (op.interna ? internos : raiz).add(malha);

    const reflexo = op.espelho ? new THREE.Mesh(geo, mat) : null;
    if (reflexo) espelho.add(reflexo);

    const aplicar = (v: number) => {
      const visivel = v > 0.002;
      malha.visible = visivel;
      if (reflexo) reflexo.visible = visivel;
      if (!visivel) return;
      malha.position.lerpVectors(origem, final, v);
      malha.scale.setScalar(Math.min(1, v / 0.14));
      if (op.giro) malha.rotation[op.giro.eixo] = op.giro.angulo * (1 - v);
      if (reflexo) {
        reflexo.position.copy(malha.position);
        reflexo.scale.copy(malha.scale);
      }
    };
    aplicar(0);
    pecas.push({ etapa, ordem: op.ordem ?? centro[0], aplicar });
    return malha;
  }

  // -------------------------------------------------------------------------
  // Frente shaker: quadro de 18 mm, almofada rebaixada e chanfro interno.
  // -------------------------------------------------------------------------
  function trapezio(a: V3, b: V3, c: V3, d: V3) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([...a, ...b, ...c, ...a, ...c, ...d], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1], 2));
    g.computeVertexNormals();
    return g;
  }

  function frenteShaker(l: number, a: number, quadro = 0.062) {
    const z = CHAPA / 2;
    const fundoZ = z - 0.008;
    const xi = l / 2 - quadro;
    const yi = a / 2 - quadro;
    const c = 0.007;
    const partes: THREE.BufferGeometry[] = [
      em(caixa(l, quadro, CHAPA, 'x'), 0, a / 2 - quadro / 2, 0),
      em(caixa(l, quadro, CHAPA, 'x'), 0, -a / 2 + quadro / 2, 0),
      em(caixa(quadro, a - 2 * quadro, CHAPA), -l / 2 + quadro / 2, 0, 0),
      em(caixa(quadro, a - 2 * quadro, CHAPA), l / 2 - quadro / 2, 0, 0),
      em(caixa(l - 2 * quadro, a - 2 * quadro, 0.006), 0, 0, fundoZ - 0.003),
      trapezio([xi, -yi, z], [xi, yi, z], [xi - c, yi - c, fundoZ], [xi - c, -yi + c, fundoZ]),
      trapezio([-xi, yi, z], [-xi, -yi, z], [-xi + c, -yi + c, fundoZ], [-xi + c, yi - c, fundoZ]),
      trapezio([xi, yi, z], [-xi, yi, z], [-xi + c, yi - c, fundoZ], [xi - c, yi - c, fundoZ]),
      trapezio([-xi, -yi, z], [xi, -yi, z], [xi - c, -yi + c, fundoZ], [-xi + c, -yi + c, fundoZ]),
    ];
    return partes;
  }

  /** Porta com pivô na dobradiça: fecha girando conforme o scroll. */
  function portaShaker(
    x0: number,
    x1: number,
    y0: number,
    y1: number,
    z: number,
    lado: 'esq' | 'dir',
    mat: THREE.Material,
    ordemBase: number
  ) {
    const l = x1 - x0;
    const a = y1 - y0;
    const sinal = lado === 'esq' ? 1 : -1;
    const geo = fundir(frenteShaker(l, a));
    geo.translate((sinal * l) / 2, 0, 0);
    peca(geo, mat, [lado === 'esq' ? x0 : x1, (y0 + y1) / 2, z], 6, [0, 0, 0.1], {
      giro: { eixo: 'y', angulo: -sinal * 1.25 },
      ordem: ordemBase + x0,
    });
  }

  /** Porta basculante: pivô no topo. */
  function basculaShaker(x0: number, x1: number, y0: number, y1: number, z: number, mat: THREE.Material, ordemBase: number) {
    const a = y1 - y0;
    const geo = fundir(frenteShaker(x1 - x0, a));
    geo.translate(0, -a / 2, 0);
    peca(geo, mat, [(x0 + x1) / 2, y1, z], 6, [0, 0, 0.1], {
      giro: { eixo: 'x', angulo: -1.15 },
      ordem: ordemBase + x0,
    });
  }

  // Coletores dos puxadores: entram juntos no acabamento, numa única malha por material.
  const puxadores: THREE.BufferGeometry[] = [];

  function concha(x: number, y: number, z: number) {
    const g = new THREE.CylinderGeometry(0.018, 0.018, 0.085, 10, 1, false, 0, Math.PI);
    g.rotateZ(Math.PI / 2);
    g.scale(1, 0.85, 0.75);
    puxadores.push(em(g, x, y, z));
  }

  function pomo(x: number, y: number, z: number) {
    const g = new THREE.SphereGeometry(0.014, mobile ? 8 : 12, 8);
    g.scale(1, 1, 0.8);
    puxadores.push(em(g, x, y, z));
  }

  function barra(x: number, y0: number, y1: number, z: number) {
    const a = y1 - y0;
    puxadores.push(em(new THREE.CylinderGeometry(0.013, 0.013, a, 12), x, (y0 + y1) / 2, z));
    for (const yb of [y0 + 0.03, y1 - 0.03]) {
      puxadores.push(em(new THREE.BoxGeometry(0.018, 0.018, 0.05), x, yb, z - 0.03));
    }
  }

  // -------------------------------------------------------------------------
  // Armários inferiores (parede do fundo)
  // -------------------------------------------------------------------------
  const BASE = { yPiso: 0.1, yTopo: 0.86, zFundo: 0.02, zFrente: 0.6, yGaveta: 0.7 };

  function moduloBase(x0: number, x1: number, portas: 1 | 2, ordem: number) {
    const l = x1 - x0;
    const p = BASE.zFrente - BASE.zFundo;
    const zc = (BASE.zFundo + BASE.zFrente) / 2;
    const yc = (BASE.yPiso + BASE.yTopo) / 2;
    const a = BASE.yTopo - BASE.yPiso;

    peca(reg(caixa(l - 0.02, BASE.yPiso, p - 0.05, 'x')), m.preto, [(x0 + x1) / 2, BASE.yPiso / 2, zc - 0.02], 1, [0, 0.5, 0], { ordem });
    peca(reg(caixa(l, CHAPA, p, 'x')), m.branco, [(x0 + x1) / 2, BASE.yPiso + CHAPA / 2, zc], 1, [0, 0.6, 0], { ordem: ordem + 0.1 });
    peca(reg(caixa(CHAPA, a, p)), m.branco, [x0 + CHAPA / 2, yc, zc], 2, [0, 0.9, 0], { ordem });
    peca(reg(caixa(CHAPA, a, p)), m.branco, [x1 - CHAPA / 2, yc, zc], 2, [0, 0.9, 0], { ordem: ordem + 0.1 });
    if (!mobile) peca(reg(caixa(l - 2 * CHAPA, a, 0.006, 'x')), m.branco, [(x0 + x1) / 2, yc, BASE.zFundo + 0.003], 3, [0, 0, 0.7], { ordem, sombra: false });
    peca(reg(caixa(l - 2 * CHAPA, CHAPA, p, 'x')), m.branco, [(x0 + x1) / 2, BASE.yTopo - CHAPA / 2, zc], 3, [0, 0.6, 0.3], { ordem: ordem + 0.1, sombra: false });
    if (l > 0.8) {
      peca(reg(caixa(CHAPA, a - 2 * CHAPA, p)), m.branco, [(x0 + x1) / 2, yc, zc], 3, [0, 0, 0.7], { ordem: ordem + 0.2, interna: true });
    }
    if (!mobile) {
      peca(reg(caixa(l - 2 * CHAPA, CHAPA, p - 0.03, 'x')), m.branco, [(x0 + x1) / 2, 0.4, zc], 4, [0, 0, 0.7], { ordem, interna: true });
    }

    // Gaveta: frente shaker baixa + caixa interna, desliza como na obra.
    const zFrente = BASE.zFrente + CHAPA / 2 + 0.001;
    const lGaveta = l - FOLGA;
    const aGaveta = BASE.yTopo - BASE.yGaveta - FOLGA;
    const caixaGaveta = mobile
      ? []
      : [
          em(caixa(CHAPA / 1.2, 0.09, 0.42), -lGaveta / 2 + 0.03, 0, -0.22),
          em(caixa(CHAPA / 1.2, 0.09, 0.42), lGaveta / 2 - 0.03, 0, -0.22),
          em(caixa(lGaveta - 0.06, 0.09, CHAPA / 1.2, 'x'), 0, 0, -0.43),
          em(caixa(lGaveta - 0.06, 0.006, 0.42, 'x'), 0, -0.042, -0.22),
        ];
    peca(fundir([...frenteShaker(lGaveta, aGaveta, 0.042), ...caixaGaveta]), m.branco, [(x0 + x1) / 2, BASE.yGaveta + aGaveta / 2 + FOLGA / 2, zFrente], 5, [0, 0, 0.5], { ordem });

    const pz = zFrente + CHAPA / 2 + 0.012;
    const larg = (x1 - x0) / (l > 0.8 ? 2 : 1);
    if (l > 0.8) {
      concha(x0 + larg / 2, BASE.yGaveta + aGaveta * 0.62, pz);
      concha(x1 - larg / 2, BASE.yGaveta + aGaveta * 0.62, pz);
    } else {
      concha((x0 + x1) / 2, BASE.yGaveta + aGaveta * 0.62, pz);
    }

    const y0p = BASE.yPiso + FOLGA;
    const y1p = BASE.yGaveta - FOLGA;
    if (portas === 2) {
      const meio = (x0 + x1) / 2;
      portaShaker(x0 + FOLGA / 2, meio - FOLGA / 2, y0p, y1p, zFrente, 'esq', m.branco, ordem);
      portaShaker(meio + FOLGA / 2, x1 - FOLGA / 2, y0p, y1p, zFrente, 'dir', m.branco, ordem + 0.1);
    } else {
      portaShaker(x0 + FOLGA / 2, x1 - FOLGA / 2, y0p, y1p, zFrente, 'esq', m.branco, ordem);
    }
  }

  moduloBase(0, 1.03, 2, 0);
  moduloBase(1.03, 1.54, 1, 1);
  moduloBase(1.54, 2.06, 1, 2);

  // -------------------------------------------------------------------------
  // Armários aéreos: fileira verde sobre a bancada, fileira branca até o forro
  // -------------------------------------------------------------------------
  function moduloAereo(
    x0: number,
    x1: number,
    y0: number,
    y1: number,
    zFrente: number,
    mat: THREE.Material,
    ordem: number,
    tipo: 'dupla' | 'basculante'
  ) {
    const l = x1 - x0;
    const a = y1 - y0;
    const zf = 0.02;
    const p = zFrente - zf;
    const zc = zf + p / 2;
    const xc = (x0 + x1) / 2;
    const yc = (y0 + y1) / 2;

    peca(reg(caixa(l, a, 0.009, 'x')), m.branco, [xc, yc, zf + 0.0045], 2, [0, 0, 0.8], { ordem: ordem, sombra: false });
    peca(reg(caixa(CHAPA, a, p)), m.branco, [x0 + CHAPA / 2, yc, zc], 2, [0, 0.7, 0], { ordem: ordem + 0.1 });
    peca(reg(caixa(CHAPA, a, p)), m.branco, [x1 - CHAPA / 2, yc, zc], 2, [0, 0.7, 0], { ordem: ordem + 0.2 });
    peca(reg(caixa(l - 2 * CHAPA, CHAPA, p, 'x')), m.fundoAereo, [xc, y0 + CHAPA / 2, zc], 3, [0, 0, 0.7], { ordem });
    peca(reg(caixa(l - 2 * CHAPA, CHAPA, p, 'x')), m.branco, [xc, y1 - CHAPA / 2, zc], 3, [0, 0, 0.7], { ordem: ordem + 0.1, sombra: false });
    if (!mobile) {
      peca(reg(caixa(l - 2 * CHAPA, CHAPA, p - 0.02, 'x')), m.branco, [xc, yc, zc], 4, [0, 0, 0.7], { ordem, interna: true });
    }

    const z = zFrente + CHAPA / 2 + 0.001;
    const pz = z + CHAPA / 2 + 0.012;
    if (tipo === 'dupla') {
      const meio = xc;
      portaShaker(x0 + FOLGA / 2, meio - FOLGA / 2, y0 + FOLGA, y1 - FOLGA, z, 'esq', mat, ordem);
      portaShaker(meio + FOLGA / 2, x1 - FOLGA / 2, y0 + FOLGA, y1 - FOLGA, z, 'dir', mat, ordem + 0.1);
      pomo(meio - 0.035, y0 + 0.05, pz);
      pomo(meio + 0.035, y0 + 0.05, pz);
    } else {
      basculaShaker(x0 + FOLGA / 2, x1 - FOLGA / 2, y0 + FOLGA, y1 - FOLGA, z, mat, ordem);
      concha(xc, y0 + 0.04, pz);
    }
  }

  const Y_LED = 1.59;
  const Y_BRANCOS = 2.07;
  [[0, 0.92], [0.92, 1.83], [1.83, 2.77]].forEach(([a, b], i) =>
    moduloAereo(a, b, Y_LED, Y_BRANCOS, 0.33, m.verde, 10 + i, 'basculante')
  );
  [[0, 0.92], [0.92, 1.84], [1.84, 2.76], [2.78, 3.72]].forEach(([a, b], i) =>
    moduloAereo(a, b, Y_BRANCOS, ALTURA_PE_DIREITO, 0.54, m.branco, 20 + i, 'dupla')
  );

  // -------------------------------------------------------------------------
  // Painéis e eletrodomésticos
  // -------------------------------------------------------------------------
  // Fundo escuro atrás das frentes: é o que desenha as folgas de 3 mm entre as portas.
  const sombraFolga = (x0: number, x1: number, y0: number, y1: number, z: number, ordem: number) =>
    peca(reg(new THREE.PlaneGeometry(x1 - x0, y1 - y0)), m.folga, [(x0 + x1) / 2, (y0 + y1) / 2, z], 7, [0, 0, -0.02], { ordem, sombra: false });
  sombraFolga(0, 2.06, BASE.yPiso, BASE.yTopo, BASE.zFrente + 0.0002, -1);
  sombraFolga(0, 2.77, Y_LED, Y_BRANCOS, 0.3302, -0.9);
  sombraFolga(0, 3.72, Y_BRANCOS, ALTURA_PE_DIREITO, 0.5402, -0.8);

  const inoxFrente = (l: number, a: number) => reg(caixa(l, a, 0.02, 'x'));

  peca(reg(caixa(2.78, Y_LED - 0.9, 0.012, 'x')), m.revestimento, [1.39, (Y_LED + 0.9) / 2, 0.006], 7, [0, 0, 0.5], { ordem: 0, sombra: false });

  // Lava-louças
  peca(reg(caixa(0.596, 0.8, 0.58, 'x')), m.inox, [2.37, 0.46, 0.31], 7, [0, 0, 0.8], { ordem: 1, espelho: true });
  peca(reg(caixa(0.596, 0.085, 0.008, 'x')), m.preto, [2.37, 0.815, 0.604], 10, [0, 0, 0.3], { ordem: 2, sombra: false });

  // Geladeira French door
  const GEL = { x0: 2.78, x1: 3.7, y0: 0.05, y1: 1.95, zCorpo: 0.68, zPorta: 0.77 };
  const gelXc = (GEL.x0 + GEL.x1) / 2;
  peca(reg(caixa(GEL.x1 - GEL.x0, GEL.y1 - GEL.y0, GEL.zCorpo - 0.02, 'x')), m.inox, [gelXc, (GEL.y0 + GEL.y1) / 2, (GEL.zCorpo + 0.02) / 2], 7, [0, 0.8, 0.2], { ordem: 3, espelho: true });
  const gelFrenteZ = GEL.zPorta - 0.045;
  const gelFolga = 0.008;
  const gelAltaL = (GEL.x1 - GEL.x0 - gelFolga) / 2;
  const gelMeioY = 0.97;
  const gelAltaA = GEL.y1 - gelMeioY - gelFolga;
  const gelBaixaA = gelMeioY - GEL.y0 - gelFolga;
  const portaGeladeira = (l: number, a: number) => reg(caixa(l, a, 0.09, 'x'));
  const gelEsq = portaGeladeira(gelAltaL, gelAltaA);
  gelEsq.translate(gelAltaL / 2, 0, 0);
  peca(gelEsq, m.inox, [GEL.x0, gelMeioY + gelFolga + gelAltaA / 2, gelFrenteZ], 7, [0, 0, 0.1], { giro: { eixo: 'y', angulo: -1.2 }, ordem: 4, espelho: true });
  const gelDir = portaGeladeira(gelAltaL, gelAltaA);
  gelDir.translate(-gelAltaL / 2, 0, 0);
  peca(gelDir, m.inox, [GEL.x1, gelMeioY + gelFolga + gelAltaA / 2, gelFrenteZ], 7, [0, 0, 0.1], { giro: { eixo: 'y', angulo: 1.2 }, ordem: 5, espelho: true });
  peca(portaGeladeira(GEL.x1 - GEL.x0, gelBaixaA), m.inox, [gelXc, GEL.y0 + gelBaixaA / 2, gelFrenteZ], 7, [0, 0, 0.6], { ordem: 6, espelho: true });
  peca(reg(new THREE.BoxGeometry(0.25, 0.15, 0.004)), m.tela, [gelXc + 0.24, 1.54, GEL.zPorta + 0.002], 10, [0, 0, 0.2], { ordem: 7, sombra: false });

  barra(gelXc - 0.03, 1.08, 1.68, GEL.zPorta + 0.05);
  barra(gelXc + 0.03, 1.08, 1.68, GEL.zPorta + 0.05);
  barra(2.37 - 0.2, 0.75, 0.75, 0.62);
  puxadores.push(em(new THREE.CylinderGeometry(0.009, 0.009, 0.5, 10).rotateZ(Math.PI / 2), 2.37, 0.755, 0.63));

  // Tampo da parede com o vão real da cuba
  const TAMPO = { x1: 2.72, z1: 0.63, y0: 0.86, y1: 0.9 };
  const CUBA = { x0: 1.13, x1: 1.67, z0: 0.14, z1: 0.5, y0: 0.72 };
  const eTampo = TAMPO.y1 - TAMPO.y0;
  const yTampo = (TAMPO.y0 + TAMPO.y1) / 2;
  peca(
    fundir([
      em(caixa(CUBA.x0, eTampo, TAMPO.z1, 'x'), CUBA.x0 / 2, 0, TAMPO.z1 / 2),
      em(caixa(TAMPO.x1 - CUBA.x1, eTampo, TAMPO.z1, 'x'), (TAMPO.x1 + CUBA.x1) / 2, 0, TAMPO.z1 / 2),
      em(caixa(CUBA.x1 - CUBA.x0, eTampo, CUBA.z0, 'x'), (CUBA.x0 + CUBA.x1) / 2, 0, CUBA.z0 / 2),
      em(caixa(CUBA.x1 - CUBA.x0, eTampo, TAMPO.z1 - CUBA.z1, 'x'), (CUBA.x0 + CUBA.x1) / 2, 0, (TAMPO.z1 + CUBA.z1) / 2),
    ]),
    m.pedra,
    [0, yTampo, 0],
    9,
    [0, 0.9, 0],
    { ordem: 0 }
  );
  peca(reg(caixa(2.78, 0.09, 0.015, 'x')), m.pedra, [1.39, TAMPO.y1 + 0.045, 0.02], 9, [0, 0.5, 0.2], { ordem: 0.5, sombra: false });

  // Cuba inox
  const cubaL = CUBA.x1 - CUBA.x0;
  const cubaP = CUBA.z1 - CUBA.z0;
  const cubaA = TAMPO.y0 - CUBA.y0 + eTampo;
  peca(
    fundir([
      em(caixa(cubaL, 0.004, cubaP, 'x'), 0, -cubaA / 2, 0),
      em(caixa(cubaL, cubaA, 0.004, 'x'), 0, 0, -cubaP / 2),
      em(caixa(cubaL, cubaA, 0.004, 'x'), 0, 0, cubaP / 2),
      em(caixa(0.004, cubaA, cubaP), -cubaL / 2, 0, 0),
      em(caixa(0.004, cubaA, cubaP), cubaL / 2, 0, 0),
    ]),
    m.inox,
    [(CUBA.x0 + CUBA.x1) / 2, TAMPO.y1 - cubaA / 2 + 0.001, (CUBA.z0 + CUBA.z1) / 2],
    10,
    [0, 0.5, 0],
    { ordem: 0, sombra: false }
  );

  // Torneira gourmet
  const curvaTorneira = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0.26, 0),
    new THREE.Vector3(0, 0.36, 0.05),
    new THREE.Vector3(0, 0.33, 0.16),
    new THREE.Vector3(0, 0.25, 0.18),
  ]);
  peca(
    fundir([
      new THREE.TubeGeometry(curvaTorneira, mobile ? 14 : 30, 0.011, 8),
      em(new THREE.CylinderGeometry(0.024, 0.026, 0.05, 12), 0, 0.025, 0),
    ]),
    m.cromo,
    [1.4, TAMPO.y1, 0.08],
    10,
    [0, 0.5, 0],
    { ordem: 1, sombra: false }
  );

  // -------------------------------------------------------------------------
  // Ilha central: corpo verde-sálvia liso, rodapé claro e tampo de pedra
  // -------------------------------------------------------------------------
  const ILHA = { x0: 0.6, x1: 2.9, z0: 1.745, z1: 2.52, yPiso: 0.09, yTopo: 0.86 };
  const ilhaXc = (ILHA.x0 + ILHA.x1) / 2;
  const ilhaZc = (ILHA.z0 + ILHA.z1) / 2;
  const ilhaL = ILHA.x1 - ILHA.x0;
  const ilhaP = ILHA.z1 - ILHA.z0;
  const ilhaYc = (ILHA.yPiso + ILHA.yTopo) / 2;
  const ilhaA = ILHA.yTopo - ILHA.yPiso;

  peca(reg(caixa(ilhaL - 0.03, ILHA.yPiso, ilhaP - 0.03, 'x')), m.branco, [ilhaXc, ILHA.yPiso / 2, ilhaZc], 8, [0, 0.6, 0], { ordem: 0, espelho: true });
  peca(reg(caixa(ilhaL, CHAPA, ilhaP, 'x')), m.branco, [ilhaXc, ILHA.yPiso + CHAPA / 2, ilhaZc], 8, [0, 0.8, 0], { ordem: 1 });
  [0.2, 0.5, 0.8].forEach((f, i) => {
    peca(reg(caixa(CHAPA, ilhaA - CHAPA, ilhaP - 0.04)), m.branco, [ILHA.x0 + ilhaL * f, ilhaYc, ilhaZc], 8, [0, 1, 0], { ordem: 2 + i * 0.1, interna: true });
  });
  peca(reg(caixa(ilhaL, ilhaA, CHAPA, 'x')), m.verde, [ilhaXc, ilhaYc, ILHA.z0 + CHAPA / 2], 8, [0, 0, -0.9], { ordem: 3 });
  peca(reg(caixa(CHAPA, ilhaA, ilhaP)), m.verde, [ILHA.x0 + CHAPA / 2, ilhaYc, ilhaZc], 8, [-0.9, 0, 0], { ordem: 4 });
  peca(reg(caixa(CHAPA, ilhaA, ilhaP)), m.verde, [ILHA.x1 - CHAPA / 2, ilhaYc, ilhaZc], 8, [0.9, 0, 0], { ordem: 5, espelho: true });
  peca(reg(caixa(ilhaL, ilhaA, CHAPA, 'x')), m.verde, [ilhaXc, ilhaYc, ILHA.z1 - CHAPA / 2], 8, [0, 0, 0.9], { ordem: 6, espelho: true });

  const SLAB = { x0: 0.55, x1: 2.93, z0: 1.61, z1: 2.66, y0: 0.86, y1: 0.905 };
  peca(reg(caixa(SLAB.x1 - SLAB.x0, SLAB.y1 - SLAB.y0, SLAB.z1 - SLAB.z0, 'x')), m.pedra, [(SLAB.x0 + SLAB.x1) / 2, (SLAB.y0 + SLAB.y1) / 2, (SLAB.z0 + SLAB.z1) / 2], 9, [0, 1.3, 0], { ordem: 1 });

  // Cooktop: chapa preta, trempes e queimadores
  const trempes: THREE.BufferGeometry[] = [];
  const queimadores: [number, number][] = [[-0.26, -0.12], [-0.26, 0.12], [0, 0], [0.26, -0.12], [0.26, 0.12]];
  for (const [qx, qz] of queimadores) {
    trempes.push(em(new THREE.CylinderGeometry(0.038, 0.042, 0.018, 12), qx, 0.013, qz));
    trempes.push(em(caixa(0.18, 0.012, 0.012, 'x'), qx, 0.034, qz));
    trempes.push(em(caixa(0.012, 0.012, 0.18), qx, 0.034, qz));
  }
  trempes.push(em(caixa(0.76, 0.006, 0.52, 'x'), 0, 0, 0));
  peca(fundir(trempes), m.fogao, [1.72, SLAB.y1 + 0.004, 2.02], 10, [0, 0.5, 0], { ordem: 2, sombra: false });

  // Chaleira branca
  const perfilChaleira = [
    [0.001, 0], [0.09, 0], [0.105, 0.03], [0.1, 0.09], [0.07, 0.15], [0.03, 0.17], [0.001, 0.175],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  peca(
    fundir([
      new THREE.LatheGeometry(perfilChaleira, mobile ? 14 : 28),
      em(new THREE.TorusGeometry(0.075, 0.006, 8, 18, Math.PI).rotateY(Math.PI / 4), 0, 0.17, 0),
      em(new THREE.CylinderGeometry(0.012, 0.02, 0.1, 8).rotateZ(-0.9), 0.12, 0.1, 0),
    ]),
    m.ceramica,
    [1.84, SLAB.y1 + 0.04, 1.86],
    10,
    [0, 0.5, 0],
    { ordem: 3 }
  );

  // -------------------------------------------------------------------------
  // Banquetas pretas e cadeiras estofadas
  // -------------------------------------------------------------------------
  function banqueta(x: number, z: number, ordem: number) {
    const altura = 0.7;
    const abertura = 0.11;
    const partes: THREE.BufferGeometry[] = [
      em(new THREE.CylinderGeometry(0.165, 0.165, 0.035, mobile ? 18 : 32), 0, altura - 0.018, 0),
    ];
    for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      const leg = new THREE.CylinderGeometry(0.014, 0.013, altura, 8);
      leg.rotateX((sz * abertura) / 0.7);
      leg.rotateZ((-sx * abertura) / 0.7);
      partes.push(em(leg, (sx * (0.1 + abertura / 2)), altura / 2 - 0.02, (sz * (0.1 + abertura / 2))));
    }
    const yAro = 0.27;
    const r = 0.16;
    partes.push(em(caixa(2 * r, 0.014, 0.014, 'x'), 0, yAro, r), em(caixa(2 * r, 0.014, 0.014, 'x'), 0, yAro, -r));
    partes.push(em(caixa(0.014, 0.014, 2 * r), r, yAro, 0), em(caixa(0.014, 0.014, 2 * r), -r, yAro, 0));
    peca(fundir(partes), m.preto, [x, 0, z], 10, [0, 0.8, 0.5], { ordem: 4 + ordem, espelho: true });
  }
  banqueta(2.07, 2.95, 0);
  banqueta(1.22, 2.95, 0.1);

  /** Cadeira estofada: origem no centro do assento, encosto curvo do lado -X. */
  function cadeira(x: number, z: number, giro: number, ordem: number) {
    const raio = 0.3;
    const abertura = 0.82;
    const concha = new THREE.Shape();
    concha.absarc(0, 0, raio, Math.PI - abertura, Math.PI + abertura, false);
    concha.absarc(0, 0, raio - 0.028, Math.PI + abertura, Math.PI - abertura, true);
    concha.closePath();
    const encosto = new THREE.ExtrudeGeometry(concha, {
      depth: 0.26,
      bevelEnabled: true,
      bevelSize: 0.012,
      bevelThickness: 0.012,
      bevelSegments: 2,
      curveSegments: mobile ? 10 : 20,
    });
    encosto.rotateX(Math.PI / 2);
    encosto.translate(0.04, 0.86, 0);
    const assento = new RoundedBoxGeometry(0.46, 0.08, 0.46, 3, 0.035);
    const estofado = fundir([em(assento, 0, 0.47, 0), encosto]);
    estofado.rotateY(giro);

    const pernas: THREE.BufferGeometry[] = [];
    for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      const altura = sx < 0 ? 0.66 : 0.44;
      const perna = caixa(0.032, altura, 0.032);
      perna.rotateZ(-sx * 0.06);
      perna.rotateX(sz * 0.05);
      pernas.push(em(perna, sx * 0.2, altura / 2, sz * 0.19));
    }
    const madeira = fundir(pernas);
    madeira.rotateY(giro);

    peca(estofado, m.estofado, [x, 0, z], 10, [0.4, 0.6, 0], { ordem: 6 + ordem });
    peca(madeira, m.freijo, [x, 0, z], 10, [0.4, 0.6, 0], { ordem: 6 + ordem });
  }
  cadeira(3.97, 2.07, -0.35, 0);
  cadeira(3.93, 1.41, -0.2, 0.1);

  const MESA = { x0: 4.15, x1: 5.05, z0: 0.7, z1: 2.3, y: 0.75 };
  peca(
    fundir([
      em(caixa(MESA.x1 - MESA.x0, 0.035, MESA.z1 - MESA.z0, 'x'), 0, MESA.y - 0.0175, 0),
      ...[[1, 1], [-1, 1], [1, -1], [-1, -1]].map(([sx, sz]) =>
        em(caixa(0.05, MESA.y - 0.035, 0.05), sx * 0.38, (MESA.y - 0.035) / 2, sz * 0.72)
      ),
    ]),
    m.freijo,
    [(MESA.x0 + MESA.x1) / 2, 0, (MESA.z0 + MESA.z1) / 2],
    10,
    [0.6, 0.6, 0],
    { ordem: 5.5, espelho: true }
  );

  // -------------------------------------------------------------------------
  // Objetos da bancada (só desktop: pequenos demais para o celular)
  // -------------------------------------------------------------------------
  peca(reg(new RoundedBoxGeometry(0.25, 0.4, 0.32, 2, 0.02)), m.ceramica, [2.44, TAMPO.y1 + 0.2, 0.27], 10, [0, 0.5, 0], { ordem: 3.1 });
  if (!mobile) {
    const folhas: THREE.BufferGeometry[] = [];
    let a = 0;
    for (let i = 0; i < 46; i++) {
      a += 2.399;
      const raio = 0.02 + (i / 46) * 0.09;
      const folha = new THREE.PlaneGeometry(0.03, 0.14);
      folha.translate(0, 0.07, 0);
      folha.rotateX(0.2 + (i / 46) * 0.85);
      folha.rotateY(a);
      folhas.push(em(folha, Math.sin(a) * raio * 0.3, 0.1, Math.cos(a) * raio * 0.3));
    }
    peca(fundir(folhas), m.folha, [0.3, TAMPO.y1 + 0.08, 0.2], 10, [0, 0.4, 0], { ordem: 3.2, sombra: false });
    peca(reg(new THREE.CylinderGeometry(0.058, 0.05, 0.11, 12)), m.vaso, [0.3, TAMPO.y1 + 0.055, 0.2], 10, [0, 0.4, 0], { ordem: 3.15, sombra: false });

    const tabua = (l: number, a2: number, z: number, inclina: number, ordem2: number, x: number) => {
      const g = caixa(l, a2, 0.02);
      g.translate(0, a2 / 2, 0);
      g.rotateX(inclina);
      peca(reg(g), m.freijo, [x, TAMPO.y1, z], 10, [0, 0.4, 0.2], { ordem: ordem2, sombra: false });
    };
    tabua(0.15, 0.38, 0.05, -0.1, 3.3, 0.55);
    tabua(0.12, 0.3, 0.08, -0.14, 3.35, 0.67);

    peca(reg(new THREE.CylinderGeometry(0.05, 0.05, 0.13, 12)), m.preto, [0.86, TAMPO.y1 + 0.065, 0.22], 10, [0, 0.4, 0], { ordem: 3.4, sombra: false });
    const colheres = [-0.25, 0.05, 0.3].map((ang, i) => {
      const c = caixa(0.03, 0.26, 0.012);
      c.translate(0, 0.13, 0);
      c.rotateZ(ang);
      return em(c, (i - 1) * 0.025, 0, 0);
    });
    peca(fundir(colheres), m.freijo, [0.86, TAMPO.y1 + 0.05, 0.22], 10, [0, 0.4, 0], { ordem: 3.45, sombra: false });

    const porta = fundir([
      em(caixa(0.13, 0.18, 0.02, 'x'), 0, 0, 0),
      ...[-0.06, 0, 0.06].flatMap((y) =>
        [-0.035, 0.035].map((x) => em(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 10).rotateX(Math.PI / 2), x, y, 0.02))
      ),
    ]);
    peca(porta, m.vaso, [2.2, 1.48, 0.03], 10, [0, 0, 0.4], { ordem: 3.5, sombra: false });
  }

  // Interruptores da parede esquerda
  peca(reg(new THREE.BoxGeometry(0.008, 0.12, 0.08)), m.ceramica, [0.004, 1.18, 2.0], 10, [0.25, 0, 0], { ordem: 9, sombra: false });
  peca(reg(new THREE.BoxGeometry(0.008, 0.12, 0.08)), m.ceramica, [0.004, 1.18, 0.64], 10, [0.25, 0, 0], { ordem: 9.1, sombra: false });

  // Esquadria preta com vidro e o vão de serviço atrás dela
  const VAO = { z0: 0.74, z1: 1.9, y1: 2.21 };
  const e = 0.055;
  const vaoL = VAO.z1 - VAO.z0;
  const vaoZc = (VAO.z0 + VAO.z1) / 2;
  peca(
    fundir([
      em(caixa(0.09, VAO.y1, e), 0, VAO.y1 / 2, VAO.z0 + e / 2),
      em(caixa(0.09, VAO.y1, e), 0, VAO.y1 / 2, VAO.z1 - e / 2),
      em(caixa(0.09, e, vaoL), 0, VAO.y1 - e / 2, vaoZc),
      em(caixa(0.09, e * 0.5, vaoL), 0, e * 0.25, vaoZc),
    ]),
    m.esquadria,
    [0, 0, 0],
    7,
    [0.7, 0, 0],
    { ordem: 7, sombra: false }
  );
  peca(reg(new THREE.BoxGeometry(0.006, VAO.y1 - 0.08, vaoL - 0.1)), m.vidro, [-0.02, VAO.y1 / 2, vaoZc], 7, [0.6, 0, 0], { ordem: 7.1, sombra: false });

  // Porta de madeira ao fundo da parede esquerda
  const PM = { z0: 2.18, z1: 3.02, y1: 2.32 };
  peca(
    fundir([
      em(caixa(0.03, PM.y1, 0.07), 0.012, PM.y1 / 2, PM.z0 + 0.035),
      em(caixa(0.03, PM.y1, 0.07), 0.012, PM.y1 / 2, PM.z1 - 0.035),
      em(caixa(0.03, 0.07, PM.z1 - PM.z0), 0.012, PM.y1 - 0.035, (PM.z0 + PM.z1) / 2),
      em(caixa(0.012, PM.y1 - 0.07, PM.z1 - PM.z0 - 0.14), 0.003, (PM.y1 - 0.07) / 2, (PM.z0 + PM.z1) / 2),
    ]),
    m.freijo,
    [0, 0, 0],
    7,
    [0.6, 0, 0],
    { ordem: 8, sombra: false }
  );

  // Puxadores numa malha só; entram no fim, com o acabamento
  peca(fundir(puxadores), m.cromo, [0, 0, 0], 10, [0, 0, 0.14], { ordem: 8, sombra: false });

  // -------------------------------------------------------------------------
  // Oclusão no piso (substitui sombra no celular e assenta os móveis no desktop)
  // -------------------------------------------------------------------------
  const oclusoes: Peca[] = [];
  const planoOclusao = reg(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2));
  function oclusao(x0: number, x1: number, z0: number, z1: number, forca: number, etapa: number) {
    const mat = new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: t.oclusao, transparent: true, depthWrite: false, opacity: 0 });
    materiaisAvulsos.push(mat);
    const ma = new THREE.Mesh(planoOclusao, mat);
    ma.position.set((x0 + x1) / 2, 0.003, (z0 + z1) / 2);
    ma.scale.set((x1 - x0) / 0.6, 1, (z1 - z0) / 0.6);
    ma.renderOrder = 2;
    raiz.add(ma);
    oclusoes.push({ etapa, ordem: 0, aplicar: (v) => (mat.opacity = v * forca) });
  }
  oclusao(ILHA.x0, ILHA.x1, ILHA.z0, ILHA.z1, 0.5, 8);
  oclusao(0, 2.7, 0, 0.62, 0.42, 1);
  oclusao(GEL.x0, GEL.x1, 0, GEL.zPorta, 0.5, 7);
  oclusao(1.92, 2.22, 2.8, 3.1, 0.28, 10);
  oclusao(1.07, 1.37, 2.8, 3.1, 0.28, 10);
  oclusao(MESA.x0, MESA.x1, MESA.z0, MESA.z1, 0.2, 10);

  // -------------------------------------------------------------------------
  // Fase 2: piso em placas (instanciado) e paredes que sobem
  // -------------------------------------------------------------------------
  const nx = Math.round(PISO.x / PISO.placa);
  const nz = Math.round(PISO.z / PISO.placa);
  const placaGeo = reg(new THREE.BoxGeometry(PISO.placa - 0.002, 0.012, PISO.placa - 0.002));
  const uvPlaca = placaGeo.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uvPlaca.count; i++) uvPlaca.setXY(i, uvPlaca.getX(i) * PISO.placa, uvPlaca.getY(i) * PISO.placa);
  const piso = new THREE.InstancedMesh(placaGeo, m.piso, nx * nz);
  piso.receiveShadow = q.sombras;
  piso.frustumCulled = false;
  piso.renderOrder = 1;
  raiz.add(piso);
  const auxPiso = new THREE.Object3D();
  const assentarPiso = (v: number) => {
    let k = 0;
    for (let ix = 0; ix < nx; ix++) {
      for (let iz = 0; iz < nz; iz++) {
        const atraso = (ix + iz) / (nx + nz - 2);
        const s = THREE.MathUtils.smoothstep(v, atraso * 0.7, atraso * 0.7 + 0.3);
        auxPiso.position.set((ix + 0.5) * PISO.placa, -0.006, (iz + 0.5) * PISO.placa);
        auxPiso.scale.set(Math.max(s, 0.0001), 1, Math.max(s, 0.0001));
        auxPiso.updateMatrix();
        piso.setMatrixAt(k++, auxPiso.matrix);
      }
    }
    piso.instanceMatrix.needsUpdate = true;
  };
  assentarPiso(0);

  const paredes: ((v: number) => void)[] = [];
  function parede(cx: number, cz: number, l: number, a: number, p: number, y0 = 0) {
    const g = reg(caixa(l, a, p, 'x'));
    g.translate(0, a / 2, 0);
    const ma = new THREE.Mesh(g, m.parede);
    ma.position.set(cx, y0, cz);
    ma.receiveShadow = q.sombras;
    raiz.add(ma);
    const aplicar = (v: number) => {
      ma.visible = v > 0.002;
      ma.scale.y = Math.max(v, 0.0001);
    };
    aplicar(0);
    paredes.push(aplicar);
  }
  const E_PAREDE = 0.15;
  parede(PISO.x / 2 - E_PAREDE / 2, -E_PAREDE / 2, PISO.x + E_PAREDE, ALTURA_PE_DIREITO, E_PAREDE);
  const lateral = (z0: number, z1: number, a: number, y0 = 0) =>
    parede(-E_PAREDE / 2, (z0 + z1) / 2, E_PAREDE, a, z1 - z0, y0);
  lateral(0, VAO.z0, ALTURA_PE_DIREITO);
  lateral(VAO.z0, VAO.z1, ALTURA_PE_DIREITO - VAO.y1, VAO.y1);
  lateral(VAO.z1, PISO.z, ALTURA_PE_DIREITO);

  // Vão de serviço visto através do vidro
  const fundoVao = fundir([
    em(caixa(0.02, 2.4, vaoL + 0.8), -1.5, 1.2, vaoZc),
    em(caixa(1.5, 0.02, vaoL + 0.8, 'x'), -0.75, 0.002, vaoZc),
    em(caixa(1.5, 2.4, 0.02, 'x'), -0.75, 1.2, vaoZc - vaoL / 2 - 0.4),
    em(caixa(1.5, 2.4, 0.02, 'x'), -0.75, 1.2, vaoZc + vaoL / 2 + 0.4),
    em(caixa(0.9, 0.04, 0.9, 'x'), -0.7, 0.88, vaoZc),
  ]);
  const vaoServico = new THREE.Mesh(fundoVao, m.fundoVao);
  raiz.add(vaoServico);
  vaoServico.visible = false;
  const revelarVao = (v: number) => {
    vaoServico.visible = v > 0.5;
  };

  // -------------------------------------------------------------------------
  // Forro: chega no acabamento, junto com a luz embutida
  // -------------------------------------------------------------------------
  const forro = new THREE.Group();
  const placaForro = (x0: number, x1: number, y: number) => {
    const ma = new THREE.Mesh(reg(new THREE.BoxGeometry(x1 - x0, 0.08, PISO.z + E_PAREDE)), m.teto);
    ma.position.set((x0 + x1) / 2, y + 0.04, PISO.z / 2 - E_PAREDE / 2);
    forro.add(ma);
  };
  placaForro(-E_PAREDE, 3.1, ALTURA_PE_DIREITO);
  placaForro(3.1, PISO.x, ALTURA_PE_DIREITO + 0.05);

  const rasgo = new THREE.Mesh(reg(new THREE.BoxGeometry(2.66, 0.004, 0.028)), m.led);
  rasgo.position.set(1.73, ALTURA_PE_DIREITO - 0.002, 1.27);
  forro.add(rasgo);

  const spotsCorpo: THREE.BufferGeometry[] = [];
  const spotsLente: THREE.BufferGeometry[] = [];
  for (const x of [1.72, 2.18, 2.66]) {
    spotsCorpo.push(em(new THREE.CylinderGeometry(0.052, 0.052, 0.15, 18, 1, true), x, ALTURA_PE_DIREITO - 0.075, 2.39));
    spotsLente.push(em(new THREE.CircleGeometry(0.034, 18).rotateX(Math.PI / 2), x, ALTURA_PE_DIREITO - 0.13, 2.39));
  }
  const corpoSpots = new THREE.Mesh(fundir(spotsCorpo), m.ceramica);
  const lentesSpots = new THREE.Mesh(fundir(spotsLente), m.lente);
  forro.add(corpoSpots, lentesSpots);

  raiz.add(forro);
  const yForroFinal = 0;
  const descerForro = (v: number) => {
    forro.visible = v > 0.002;
    forro.position.y = yForroFinal + (1 - v) * 1.6;
  };
  descerForro(0);

  // Fita de LED sob a fileira verde
  const fita = new THREE.Mesh(reg(new THREE.BoxGeometry(2.74, 0.006, 0.012)), m.led);
  fita.position.set(1.39, Y_LED - 0.004, 0.27);
  raiz.add(fita);

  const brilhoMat = () => {
    const mat = new THREE.MeshBasicMaterial({
      color: '#FFC58E',
      map: t.brilhoLed,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0,
    });
    materiaisAvulsos.push(mat);
    return mat;
  };
  const matBrilho = brilhoMat();
  const brilhoFundo = new THREE.Mesh(reg(new THREE.PlaneGeometry(2.74, Y_LED - 0.9)), matBrilho);
  brilhoFundo.position.set(1.39, (Y_LED + 0.9) / 2, 0.014);
  raiz.add(brilhoFundo);

  const matBrilhoTampo = brilhoMat();
  const geoTampo = reg(new THREE.PlaneGeometry(2.7, 0.6).rotateX(-Math.PI / 2));
  const brilhoTampo = new THREE.Mesh(geoTampo, matBrilhoTampo);
  brilhoTampo.position.set(1.36, TAMPO.y1 + 0.002, 0.3);
  raiz.add(brilhoTampo);

  const matBrilhoForro = brilhoMat();
  const brilhoForro = new THREE.Mesh(reg(new THREE.PlaneGeometry(2.66, 0.6).rotateX(Math.PI / 2)), matBrilhoForro);
  brilhoForro.position.set(1.73, ALTURA_PE_DIREITO - 0.001, 1.27);
  forro.add(brilhoForro);

  const cor2700 = new THREE.Color('#FFB46B');
  const acenderLed = (v: number) => {
    m.led.color.copy(cor2700).multiplyScalar(v * 3.2);
    m.lente.color.set('#2a2520').lerp(cor2700, v).multiplyScalar(1 + v * 1.6);
    matBrilho.opacity = v * 0.17;
    matBrilhoTampo.opacity = v * 0.14;
    matBrilhoForro.opacity = v * 0.22;
    fita.visible = v > 0.002;
    brilhoFundo.visible = v > 0.002;
    brilhoTampo.visible = v > 0.002;
  };
  acenderLed(0);

  // -------------------------------------------------------------------------
  // Fase 1: planta em traço único, desenhada com drawRange
  // -------------------------------------------------------------------------
  type P2 = [number, number];
  const tracos: P2[][] = [];
  const ret = (x0: number, z0: number, x1: number, z1: number) => {
    tracos.push([[x0, z0], [x1, z0]], [[x1, z0], [x1, z1]], [[x1, z1], [x0, z1]], [[x0, z1], [x0, z0]]);
  };
  const x = E_PAREDE;
  // Paredes (face externa e interna)
  tracos.push([[-x, PISO.z], [-x, -x]], [[-x, -x], [PISO.x, -x]]);
  tracos.push([[0, 0], [PISO.x, 0]]);
  tracos.push([[0, 0], [0, VAO.z0]], [[0, VAO.z1], [0, PISO.z]]);
  // Vão da esquadria e folga da porta de madeira
  tracos.push([[-x, VAO.z0], [0, VAO.z0]], [[-x, VAO.z1], [0, VAO.z1]]);
  const raioArco = PM.z1 - PM.z0;
  tracos.push(
    Array.from({ length: 26 }, (_, i) => {
      const a = (i / 25) * (Math.PI / 2);
      return [Math.sin(a) * raioArco, PM.z1 - Math.cos(a) * raioArco] as P2;
    })
  );
  // Bancada, módulos e projeção dos aéreos
  tracos.push([[0, TAMPO.z1], [TAMPO.x1, TAMPO.z1]], [[TAMPO.x1, 0], [TAMPO.x1, TAMPO.z1]]);
  for (const xm of [1.03, 1.54, 2.06, 2.67]) tracos.push([[xm, 0], [xm, 0.6]]);
  ret(CUBA.x0, CUBA.z0, CUBA.x1, CUBA.z1);
  // Geladeira com diagonais de símbolo
  ret(GEL.x0, 0.02, GEL.x1, GEL.zPorta);
  tracos.push([[GEL.x0, 0.02], [GEL.x1, GEL.zPorta]], [[GEL.x1, 0.02], [GEL.x0, GEL.zPorta]]);
  // Aéreos tracejados
  for (let xa = 0; xa < 3.72; xa += 0.2) tracos.push([[xa, 0.56], [Math.min(xa + 0.11, 3.72), 0.56]]);
  // Ilha, tampo e cooktop
  ret(SLAB.x0, SLAB.z0, SLAB.x1, SLAB.z1);
  for (let xa = ILHA.x0; xa < ILHA.x1; xa += 0.18) tracos.push([[xa, ILHA.z1], [Math.min(xa + 0.1, ILHA.x1), ILHA.z1]]);
  ret(1.34, 1.76, 2.1, 2.28);
  const circulo = (cx: number, cz: number, r: number, n: number) => {
    tracos.push(
      Array.from({ length: n + 1 }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        return [cx + Math.cos(a) * r, cz + Math.sin(a) * r] as P2;
      })
    );
  };
  for (const [qx, qz] of queimadores) circulo(1.72 + qx, 2.02 + qz, 0.05, 14);
  circulo(2.07, 2.95, 0.165, 28);
  circulo(1.22, 2.95, 0.165, 28);
  // Linhas de cota sem número: as medidas reais ainda não foram confirmadas
  const yc = -0.42;
  tracos.push([[0, yc], [3.72, yc]], [[0, yc - 0.06], [0, yc + 0.06]], [[3.72, yc - 0.06], [3.72, yc + 0.06]]);
  const zc = 3.45;
  tracos.push([[SLAB.x0, zc], [SLAB.x1, zc]], [[SLAB.x0, zc - 0.06], [SLAB.x0, zc + 0.06]], [[SLAB.x1, zc - 0.06], [SLAB.x1, zc + 0.06]]);

  const largura = mobile ? 0.03 : 0.015;
  const pos: number[] = [];
  const idx: number[] = [];
  let n = 0;
  let sem = 0;
  for (const traco of tracos) {
    sem += 1.7;
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i < traco.length - 1; i++) {
      const a = new THREE.Vector2(...traco[i]);
      const b = new THREE.Vector2(...traco[i + 1]);
      const passos = Math.max(1, Math.round(a.distanceTo(b) / 0.05));
      for (let k = 0; k < passos; k++) pts.push(a.clone().lerp(b, k / passos));
    }
    pts.push(new THREE.Vector2(...traco[traco.length - 1]));

    // Passada do lápis: tremor de mão e pequena sobra nas pontas.
    if (pts.length >= 2 && traco.length === 2) {
      const dir = pts[1].clone().sub(pts[0]).normalize();
      pts.unshift(pts[0].clone().addScaledVector(dir, -0.035));
      pts.push(pts[pts.length - 1].clone().addScaledVector(dir, 0.035));
    }
    pts.forEach((p, i) => {
      const prox = pts[Math.min(i + 1, pts.length - 1)];
      const ant = pts[Math.max(i - 1, 0)];
      const d = prox.clone().sub(ant).normalize();
      const perp = new THREE.Vector2(-d.y, d.x);
      const tremor = (Math.sin(i * 0.31 + sem) + Math.sin(i * 0.79 + sem * 2.1) * 0.5) * 0.0045;
      const c = p.clone().addScaledVector(perp, tremor);
      const meio = largura / 2;
      pos.push(c.x + perp.x * meio, 0, c.y + perp.y * meio, c.x - perp.x * meio, 0, c.y - perp.y * meio);
      if (i < pts.length - 1) {
        idx.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
      }
      n += 2;
    });
  }
  const plantaGeo = reg(new THREE.BufferGeometry());
  plantaGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  plantaGeo.setIndex(idx);
  const matPlanta = new THREE.MeshBasicMaterial({ color: '#D4A84F', transparent: true, toneMapped: false, side: THREE.DoubleSide, depthWrite: false });
  materiaisAvulsos.push(matPlanta);
  const planta = new THREE.Mesh(plantaGeo, matPlanta);
  planta.position.y = 0.012;
  planta.renderOrder = 3;
  planta.frustumCulled = false;
  raiz.add(planta);
  const totalPlanta = idx.length;
  const desenharPlanta = (v: number) => {
    // O primeiro quadro já mostra parte do traço: o hero nunca abre vazio.
    plantaGeo.setDrawRange(0, Math.floor((PLANTA_INICIAL + (1 - PLANTA_INICIAL) * v) * totalPlanta / 6) * 6);
  };
  desenharPlanta(0);
  const apagarPlanta = (v: number) => {
    matPlanta.opacity = 1 - v;
  };

  pecas.sort((a, b) => a.etapa - b.etapa || a.ordem - b.ordem);

  return {
    raiz,
    internos,
    pecas,
    oclusoes,
    paredes,
    assentarPiso,
    revelarVao,
    descerForro,
    acenderLed,
    desenharPlanta,
    apagarPlanta,
    geometrias,
    materiaisAvulsos,
  };
}

export type ModeloCozinha = ReturnType<typeof construirCozinha>;
