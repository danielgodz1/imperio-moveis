import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CATALOGO, MaterialCatalogo, RUGOSIDADE, deslocamentoVeio, materialPorId, materiaisPorUso } from '../../data/materiais/catalogo';
import { TipoMapas, gerarMapas, texturaDeCanvas } from './texturasPbr';
import {
  Desenho,
  desenharEscovado,
  desenharFreijo,
  desenharParede,
  textura,
  texturaBrilhoLed,
  texturaOclusao,
} from '../heroScroll/heroMateriais';

export const OPCOES_PISO = [
  { id: 'madeira-clara', nome: 'Vinílico madeirado', cor: '#C7A77F' },
  { id: 'porcelanato-claro', nome: 'Porcelanato', cor: '#E7E2D9' },
  { id: 'cimento', nome: 'Cimento queimado', cor: '#A5A29B' },
] as const;

export const OPCOES_PAREDE = [
  { id: 'gelo', nome: 'Branco gelo', cor: '#E9E5DD' },
  { id: 'areia', nome: 'Areia', cor: '#D5C7B2' },
  { id: 'salvia', nome: 'Verde-sálvia', cor: '#8E9C8F' },
  { id: 'grafite', nome: 'Grafite', cor: '#4B4A47' },
] as const;

/** Tampos vêm do catálogo (uso "tampo"). */
export const OPCOES_TAMPO = materiaisPorUso('tampo').map((m) => ({ id: m.id, nome: m.nome, cor: m.cor }));

function tipoMapas(m: MaterialCatalogo): TipoMapas | null {
  if (m.tipo === 'madeirado') return 'madeira';
  if (m.tipo === 'metal') return 'escovado';
  if (m.tipo === 'pedra') return m.acabamento === 'brilho' ? 'granito' : 'quartzo';
  if (m.tipo === 'vidro') return null;
  return m.acabamento === 'fosco' ? 'tx' : null;
}

/** Tábuas corridas: fibra no sentido U, emendas desencontradas. */
const desenharAssoalho: Desenho = (ctx, tam, r) => {
  desenharFreijo('#C4A47C')(ctx, tam, r);
  const fiadas = 6;
  const alt = tam / fiadas;
  for (let f = 0; f < fiadas; f++) {
    ctx.fillStyle = `rgba(${r() > 0.5 ? '255,236,206' : '84,56,30'},${0.04 + r() * 0.1})`;
    ctx.fillRect(0, f * alt, tam, alt);
    ctx.fillStyle = 'rgba(58,38,20,0.55)';
    ctx.fillRect(0, f * alt, tam, 1.6);
    const emenda = r() * tam;
    ctx.fillRect(emenda, f * alt, 1.6, alt);
  }
};

const desenharPorcelanato: Desenho = (ctx, tam, r) => {
  ctx.fillStyle = '#E7E2D9';
  ctx.fillRect(0, 0, tam, tam);
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = r() > 0.5 ? 'rgba(255,252,246,0.05)' : 'rgba(198,188,172,0.05)';
    ctx.beginPath();
    ctx.ellipse(r() * tam, r() * tam, (0.08 + r() * 0.26) * tam, (0.04 + r() * 0.12) * tam, r() * 3.14, 0, 6.3);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(150,142,128,0.7)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, tam, tam);
};

const desenharCimento: Desenho = (ctx, tam, r) => {
  ctx.fillStyle = '#A5A29B';
  ctx.fillRect(0, 0, tam, tam);
  for (let i = 0; i < 140; i++) {
    ctx.fillStyle = r() > 0.5 ? 'rgba(214,212,206,0.05)' : 'rgba(84,82,78,0.05)';
    ctx.beginPath();
    ctx.ellipse(r() * tam, r() * tam, (0.04 + r() * 0.24) * tam, (0.03 + r() * 0.14) * tam, r() * 3.14, 0, 6.3);
    ctx.fill();
  }
};

type Veio = 'x' | 'y';

export function criarKit3D(mobile: boolean) {
  const tam = mobile ? 512 : 1024;
  const aniso = mobile ? 2 : 8;
  const texturas: THREE.Texture[] = [];
  const mats: THREE.Material[] = [];
  const geos = new Map<string, THREE.BufferGeometry>();
  const reg = <T extends THREE.Texture>(t: T) => (texturas.push(t), t);
  const padrao = (p: THREE.MeshStandardMaterialParameters) => {
    const mat = new THREE.MeshStandardMaterial(p);
    mats.push(mat);
    return mat;
  };
  const basico = (p: THREE.MeshBasicMaterialParameters) => {
    const mat = new THREE.MeshBasicMaterial(p);
    mats.push(mat);
    return mat;
  };

  const fisico = (p: THREE.MeshPhysicalMaterialParameters) => {
    const mat = new THREE.MeshPhysicalMaterial(p);
    mats.push(mat);
    return mat;
  };
  const carregador = new THREE.TextureLoader();
  const foto = (url: string, metros: number, cor: boolean) => {
    const t = reg(carregador.load(url));
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1 / metros, 1 / metros);
    t.colorSpace = cor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = aniso;
    return t;
  };

  /** Material PBR de um item do catálogo: fotos dos mapas quando houver, senão mapas gerados. */
  function deCatalogo(item: MaterialCatalogo, semente: number): THREE.MeshStandardMaterial {
    const metros = item.escalaCm / 100;
    const rug = RUGOSIDADE[item.acabamento];
    const brilho = item.acabamento === 'brilho';
    const base: THREE.MeshPhysicalMaterialParameters = { color: item.cor, roughness: rug, metalness: item.tipo === 'metal' ? 1 : 0 };
    if (item.tipo === 'vidro') {
      return fisico({ color: item.cor, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.24, envMapIntensity: 1.6, clearcoat: 1, clearcoatRoughness: 0.03 });
    }
    const tipo = tipoMapas(item);
    if (item.mapas.baseColor || item.mapas.normal || item.mapas.roughness) {
      if (item.mapas.baseColor) {
        base.map = foto(item.mapas.baseColor, metros, true);
        base.color = '#FFFFFF';
      }
      if (item.mapas.normal) base.normalMap = foto(item.mapas.normal, metros, false);
      if (item.mapas.roughness) {
        base.roughnessMap = foto(item.mapas.roughness, metros, false);
        base.roughness = 1;
      }
    } else if (tipo) {
      const mapas = gerarMapas(tipo, item.cor, tam, rug, semente);
      if (mapas.cor) {
        base.map = reg(texturaDeCanvas(mapas.cor, metros, aniso, true));
        base.color = '#FFFFFF';
      }
      const metrosRelevo = tipo === 'tx' ? 0.12 : metros;
      const escala = tipo === 'madeira' ? 0.35 : 0.2;
      base.normalMap = reg(texturaDeCanvas(mapas.normal, metrosRelevo, aniso, false));
      base.normalScale = new THREE.Vector2(escala, escala);
      base.roughnessMap = reg(texturaDeCanvas(mapas.rugosidade, metrosRelevo, aniso, false));
      base.roughness = 1;
    }
    // Brilho (laca, pedra polida) ganha verniz: reflexo nítido por cima da cor.
    return brilho ? fisico({ ...base, clearcoat: 1, clearcoatRoughness: 0.06 }) : padrao(base as THREE.MeshStandardMaterialParameters);
  }

  // Criado só na primeira vez que aparece na cena: aparelho fraco não gera mapas que não usa.
  const doCatalogo = new Map<string, THREE.MeshStandardMaterial>();
  const porId = (id: string, reserva: string) => {
    const item = materialPorId(id) ?? materialPorId(reserva)!;
    let mat = doCatalogo.get(item.id);
    if (!mat) {
      mat = deCatalogo(item, 80 + CATALOGO.indexOf(item));
      doCatalogo.set(item.id, mat);
    }
    return mat;
  };

  /** Fita de borda: mesmo acabamento, sem relevo, um pouco mais escura e mais fosca (PVC). */
  const fitas = new Map<THREE.Material, THREE.Material>();
  function fitaDe(mat: THREE.Material): THREE.Material {
    let f = fitas.get(mat);
    if (!f) {
      const c = (mat as THREE.MeshStandardMaterial).clone();
      c.normalMap = null;
      c.color.multiplyScalar(0.9);
      c.roughness = Math.min(1, c.roughness + 0.08);
      mats.push(c);
      fitas.set(mat, c);
      f = c;
    }
    return f;
  }

  const inox = reg(textura(tam / 2, 0.6, aniso, 61, desenharEscovado(true)));
  const parede = reg(textura(256, 0.8, 1, 53, desenharParede));
  const oclusao = reg(texturaOclusao());
  const brilho = reg(texturaBrilhoLed());
  const pisos: Record<string, THREE.MeshStandardMaterial> = {
    'madeira-clara': padrao({ map: reg(textura(tam, 1.2, aniso, 71, desenharAssoalho)), roughness: 0.42 }),
    'porcelanato-claro': padrao({ map: reg(textura(tam, 0.9, aniso, 31, desenharPorcelanato)), roughness: 0.16 }),
    cimento: padrao({ map: reg(textura(tam, 2, aniso, 37, desenharCimento)), roughness: 0.55 }),
  };

  const m = {
    // Caixaria em Branco TX do catálogo.
    corpo: porId('branco-neve', 'branco-neve'),
    puxador: porId('aluminio-escovado', 'aluminio-escovado'),
    tecidoClaro: padrao({ color: '#EDE8DF', roughness: 0.95 }),
    tecidoAreia: padrao({ color: '#CDBBA2', roughness: 0.92 }),
    tecidoEscuro: padrao({ color: '#58544D', roughness: 0.95 }),
    tela: padrao({ color: '#101112', roughness: 0.16, metalness: 0.5 }),
    preto: padrao({ color: '#1E1D1B', roughness: 0.42, metalness: 0.25 }),
    cromo: padrao({ color: '#D8D8D6', roughness: 0.22, metalness: 1 }),
    latao: padrao({ color: '#C4A15A', roughness: 0.28, metalness: 1 }),
    inox: padrao({ map: inox, roughness: 0.38, metalness: 0.85 }),
    espelho: padrao({ color: '#DCE3E4', roughness: 0.04, metalness: 1 }),
    vidro: porId('vidro-incolor', 'vidro-incolor'),
    folga: basico({ color: '#2B2925' }),
    parede: padrao({ map: parede, roughness: 0.92 }),
    rodape: padrao({ color: '#F1EEE7', roughness: 0.6 }),
    laje: padrao({ color: '#26251F', roughness: 0.9 }),
    esquadria: padrao({ color: '#1C1B19', roughness: 0.5, metalness: 0.5 }),
    ledLigado: basico({ color: new THREE.Color('#FFB46B').multiplyScalar(3) }),
    ledDesligado: padrao({ color: '#BDB7AC', roughness: 0.5 }),
    ceramica: padrao({ color: '#F1EFEA', roughness: 0.3 }),
    livroA: padrao({ color: '#8A4F35', roughness: 0.8 }),
    livroB: padrao({ color: '#3F5247', roughness: 0.8 }),
    livroC: padrao({ color: '#D8CFBD', roughness: 0.8 }),
    folha: padrao({ color: '#4E6E3A', roughness: 0.65, side: THREE.DoubleSide }),
    brilho: basico({
      color: '#FFC58E',
      map: brilho,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.42,
      side: THREE.DoubleSide,
    }),
    oclusao: basico({ color: 0x000000, alphaMap: oclusao, transparent: true, depthWrite: false, opacity: 0.46 }),
    oclusaoSuave: basico({ color: 0x000000, alphaMap: oclusao, transparent: true, depthWrite: false, opacity: 0.18 }),
  };

  const tampo = (id: string) => porId(materialPorId(id)?.uso.includes('tampo') ? id : 'pedra-clara', 'pedra-clara');

  const paredesCor = new Map<string, THREE.Color>(
    [...OPCOES_PAREDE].map((p) => [p.id, new THREE.Color(p.cor)])
  );

  /**
   * Caixa com UV em metros, cacheada pelas medidas em milímetros.
   * `semente` desloca o veio para peças vizinhas não repetirem o mesmo desenho.
   */
  function caixa(l: number, a: number, p: number, veio: Veio = 'y', semente?: number) {
    const chave = `${Math.round(l * 1000)}:${Math.round(a * 1000)}:${Math.round(p * 1000)}:${veio}:${semente ?? ''}`;
    const [du, dv] = semente === undefined ? [0, 0] : deslocamentoVeio(semente);
    const pronta = geos.get(chave);
    if (pronta) return pronta;
    const g = new THREE.BoxGeometry(l, a, p);
    const uv = g.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) {
      const f = Math.floor(i / 4);
      const [U, V] = f < 2 ? [p, a] : f < 4 ? [l, p] : [l, a];
      let u = uv.getX(i) * U;
      let v = uv.getY(i) * V;
      if (veio === 'y' && f !== 2 && f !== 3) [u, v] = [v, u];
      uv.setXY(i, u + du, v + dv);
    }
    geos.set(chave, g);
    return g;
  }

  /** Conjunto de ripas verticais fundido num único desenho. */
  function ripas(l: number, a: number, passo: number, largura: number, e: number) {
    const chave = `ripas:${Math.round(l * 1000)}:${Math.round(a * 1000)}:${passo}:${largura}:${e}`;
    const pronta = geos.get(chave);
    if (pronta) return pronta;
    const n = Math.max(2, Math.floor(l / passo));
    const real = l / n;
    const partes = Array.from({ length: n }, (_, i) => {
      const g = new THREE.BoxGeometry(largura, a, e).toNonIndexed();
      const uv = g.attributes.uv as THREE.BufferAttribute;
      for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getY(k) * a + i * 0.37, uv.getX(k) * largura);
      g.translate(-l / 2 + real * (i + 0.5), 0, 0);
      return g;
    });
    const g = mergeGeometries(partes, false);
    partes.forEach((p) => p.dispose());
    geos.set(chave, g);
    return g;
  }

  const planos = new Map<string, THREE.BufferGeometry>();
  function plano(l: number, a: number) {
    const chave = `${Math.round(l * 100)}:${Math.round(a * 100)}`;
    let g = planos.get(chave);
    if (!g) {
      g = new THREE.PlaneGeometry(l, a);
      planos.set(chave, g);
    }
    return g;
  }

  function dispose() {
    geos.forEach((g) => g.dispose());
    planos.forEach((g) => g.dispose());
    mats.forEach((mat) => mat.dispose());
    texturas.forEach((t) => t.dispose());
  }

  return {
    mobile,
    m,
    pisos,
    tampo,
    acabamento: (id: string) => porId(id, 'freijo-ripado'),
    fitaDe,
    corParede: (id: string) => paredesCor.get(id) ?? paredesCor.get('gelo')!,
    caixa,
    ripas,
    plano,
    dispose,
  };
}

export type Kit3D = ReturnType<typeof criarKit3D>;
