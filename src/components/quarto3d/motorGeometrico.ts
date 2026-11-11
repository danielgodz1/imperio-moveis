import {
  Ambiente,
  CATALOGO_MODULOS_CENARIO,
  ModuloId,
  ParedeCardeal,
} from '../../data/cenarios';

/**
 * Motor geométrico puro do configurador: as mesmas medidas valem para validar e desenhar.
 * Cada móvel vive num referencial próprio: X é a largura, Y a altura (base em 0) e
 * Z sai da parede. Em móveis soltos ("centro"), Z é centrado.
 */

export interface Dimensoes {
  largura_m: number;
  profundidade_m: number;
  pe_direito_m: number;
}

export interface InstanciaBase {
  id: ModuloId;
  parede: ParedeCardeal;
  largura_m: number;
  altura_m: number;
  acabamento: string;
  uid?: string;
  profundidade_m?: number;
  offset_m?: number;
  z_m?: number;
  rotacao?: number;
  tampo?: string;
  /** Guarda-roupa: portas de abrir (padrão) ou de correr. */
  portas?: 'abrir' | 'correr';
}

export type Instancia = InstanciaBase & {
  uid: string;
  profundidade_m: number;
  offset_m: number;
  z_m: number;
  rotacao: number;
};

export interface Abertura {
  tipo: 'porta' | 'janela';
  parede: 'N' | 'S' | 'L' | 'O';
  largura_m: number;
  /** Posição do centro no eixo da parede: X nas paredes N/S, Z nas paredes O/L (mesmo eixo dos móveis). */
  posicaoOffset_m: number;
  peitoril_m?: number;
  altura_m?: number;
}

export const PASSO_MOVER = 0.05;
export const NOME_PAREDE: Record<ParedeCardeal, string> = {
  N: 'Fundo',
  O: 'Esquerda',
  L: 'Direita',
  S: 'Frente',
  centro: 'Solto',
};

export const COM_TAMPO: ModuloId[] = ['bancada-l', 'ilha'];

let contadorUid = 0;
export function novoUid(id: string): string {
  contadorUid += 1;
  return `${id}-${Date.now().toString(36)}-${contadorUid}`;
}

const arredondar = (v: number) => Math.round(v / PASSO_MOVER) * PASSO_MOVER;
const limitar = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Altura da base em relação ao piso. */
export function elevacao(id: ModuloId, H: number, h: number): number {
  switch (id) {
    case 'armarios-altos':
      return ALTURA_BANCADA + VAO_AEREO;
    case 'armario-aereo-office':
      return Math.max(1.5, H - h - 0.35);
    case 'criado-mudo':
      return 0.36;
    case 'forro-ripado-teto':
      return H - h;
    case 'gabinete-banheiro':
      return 0.3;
    case 'espelheira-led':
      return Math.min(1.05, H - h - 0.1);
    default:
      return 0;
  }
}

export function comprimentoParede(parede: ParedeCardeal, dim: Dimensoes): number {
  return parede === 'N' || parede === 'S' ? dim.largura_m : dim.profundidade_m;
}

/** Limites de edição respeitando o catálogo e o tamanho da parede. */
export function limitesModulo(inst: Pick<InstanciaBase, 'id' | 'parede'>, dim: Dimensoes) {
  const regra = CATALOGO_MODULOS_CENARIO[inst.id];
  const geo = regra.gerarGeometria(dim);
  const r = regra.regraEncaixe;
  const parede = inst.parede === 'centro' ? Math.max(dim.largura_m, dim.profundidade_m) - 0.6 : comprimentoParede(inst.parede, dim);
  const larguraMax = Math.max(r.larguraMin, Math.min(r.larguraMax, parede));
  const tetoLivre = dim.pe_direito_m - elevacao(inst.id, dim.pe_direito_m, geo.altura);
  return {
    largura: { min: Math.min(r.larguraMin, larguraMax), max: larguraMax },
    altura: {
      min: Math.max(0.05, geo.altura * 0.6),
      max: Math.max(geo.altura, Math.min(dim.pe_direito_m, Math.max(geo.altura * 1.25, tetoLivre))),
    },
    profundidade: { min: geo.profundidade * 0.7, max: geo.profundidade * 1.5 },
  };
}

export function instanciaPadrao(
  id: ModuloId,
  dim: Dimensoes,
  acabamento: string,
  desloc = 0
): Instancia {
  const regra = CATALOGO_MODULOS_CENARIO[id];
  const geo = regra.gerarGeometria(dim);
  const parede = regra.regraEncaixe.parede;
  const ao = parede === 'L' || parede === 'O' ? geo.posicao[2] : geo.posicao[0];
  return normalizarInstancia(
    {
      id,
      parede,
      largura_m: geo.largura,
      altura_m: geo.altura,
      profundidade_m: geo.profundidade,
      acabamento,
      offset_m: ao + desloc,
      z_m: parede === 'centro' ? geo.posicao[2] : 0,
      rotacao: 0,
      tampo: COM_TAMPO.includes(id) ? 'pedra-clara' : undefined,
    },
    dim
  );
}

/** Completa campos opcionais e devolve a peça dentro do ambiente. */
export function normalizarInstancia(inst: InstanciaBase, dim: Dimensoes): Instancia {
  const regra = CATALOGO_MODULOS_CENARIO[inst.id];
  const lim = limitesModulo(inst, dim);
  const largura_m = limitar(inst.largura_m, lim.largura.min, lim.largura.max);
  const altura_m = limitar(inst.altura_m, lim.altura.min, lim.altura.max);
  const profundidade_m = limitar(
    inst.profundidade_m ?? regra.gerarGeometria(dim).profundidade,
    lim.profundidade.min,
    lim.profundidade.max
  );
  const rotacao = inst.rotacao ?? 0;
  const base: Instancia = {
    ...inst,
    uid: inst.uid ?? novoUid(inst.id),
    largura_m,
    altura_m,
    profundidade_m,
    rotacao,
    offset_m: inst.offset_m ?? 0,
    z_m: inst.z_m ?? 0,
  };
  return prenderAoAmbiente(base, dim);
}

function semiExtensao(inst: Instancia): { x: number; z: number } {
  const gira = Math.abs(Math.sin(inst.rotacao)) > 0.5;
  const x = inst.largura_m / 2;
  const z = inst.profundidade_m / 2;
  return gira ? { x: z, z: x } : { x, z };
}

export function prenderAoAmbiente(inst: Instancia, dim: Dimensoes): Instancia {
  if (inst.parede === 'centro') {
    const s = semiExtensao(inst);
    return {
      ...inst,
      offset_m: limitar(inst.offset_m, -dim.largura_m / 2 + s.x, dim.largura_m / 2 - s.x),
      z_m: limitar(inst.z_m, -dim.profundidade_m / 2 + s.z, dim.profundidade_m / 2 - s.z),
    };
  }
  const folga = Math.max(0, (comprimentoParede(inst.parede, dim) - inst.largura_m) / 2);
  return { ...inst, offset_m: limitar(inst.offset_m, -folga, folga) };
}

export function moverPara(inst: Instancia, x: number, z: number, dim: Dimensoes): Instancia {
  if (inst.parede === 'centro') {
    return prenderAoAmbiente({ ...inst, offset_m: arredondar(x), z_m: arredondar(z) }, dim);
  }
  const ao = inst.parede === 'N' || inst.parede === 'S' ? x : z;
  return prenderAoAmbiente({ ...inst, offset_m: arredondar(ao) }, dim);
}

export interface Pose {
  posicao: [number, number, number];
  rotY: number;
}

export function poseModulo(inst: Instancia, dim: Dimensoes): Pose {
  const W = dim.largura_m;
  const D = dim.profundidade_m;
  const y = elevacao(inst.id, dim.pe_direito_m, inst.altura_m);
  switch (inst.parede) {
    case 'N':
      return { posicao: [inst.offset_m, y, -D / 2], rotY: 0 };
    case 'S':
      return { posicao: [inst.offset_m, y, D / 2], rotY: Math.PI };
    case 'O':
      return { posicao: [-W / 2, y, inst.offset_m], rotY: Math.PI / 2 };
    case 'L':
      return { posicao: [W / 2, y, inst.offset_m], rotY: -Math.PI / 2 };
    default:
      return { posicao: [inst.offset_m, y, inst.z_m], rotY: inst.rotacao };
  }
}

export interface Caixa2D {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY: number;
  maxY: number;
}

/** Comprimento do retorno da bancada em L. */
export function retornoBancada(dim: Dimensoes): number {
  return Math.max(0.6, Math.min(2.1, dim.profundidade_m - 1.4));
}

/** Cama desenhada junto da cabeceira (referencial da cabeceira). Usada no desenho e na colisão. */
export const CAMA = { largura: 1.62, comprimento: 2.02, recuo: 0.07, altura: 0.62 } as const;

/** Medidas de cozinha usadas pelo desenho e pelas regras. */
export const ALTURA_BANCADA = 0.9;
export const VAO_AEREO = 0.65;
/** Centro da tela no painel de TV, medido do piso. */
export const CENTRO_TELA_TV = 1.1;

/** Pia na bancada em L e cooktop na ilha, no referencial local de cada móvel ([x, z]). */
export const posPia = (w: number, d: number): [number, number] => [w * 0.08, d * 0.5];
export const posCooktopIlha = (w: number, _d: number): [number, number] => [w * 0.14, -0.05];

type Retangulo = [number, number, number, number, number, number];

/** Retângulos ocupados no referencial local do móvel: [x0, x1, z0, z1, y0, y1]. */
function pegadasLocais(inst: Instancia, dim: Dimensoes): Retangulo[] {
  const w = inst.largura_m;
  const h = inst.altura_m;
  const d = inst.profundidade_m;
  if (inst.id === 'cabeceira-ripada-led') {
    const meia = CAMA.largura / 2;
    return [
      [-w / 2, w / 2, 0, d, 0, h],
      [-meia, meia, CAMA.recuo, CAMA.recuo + CAMA.comprimento, 0, CAMA.altura],
    ];
  }
  if (inst.id === 'bancada-l') {
    return [
      [-w / 2, w / 2, 0, d, 0, h],
      [-w / 2, -w / 2 + 0.62, d, d + retornoBancada(dim), 0, h],
    ];
  }
  if (inst.parede === 'centro') return [[-w / 2, w / 2, -d / 2, d / 2, 0, h]];
  return [[-w / 2, w / 2, 0, d, 0, h]];
}

/** Profundidade livre exigida na frente do guarda-roupa. */
export const frenteGuardaRoupa = (inst: Pick<InstanciaBase, 'portas'>) => (inst.portas === 'correr' ? 0.4 : 0.6);
export const CIRCULACAO_CAMA = 0.6;
export const CIRCULACAO_COZINHA = 0.9;
const ALTURA_ZONA = 2.0;

/** Área livre de uso na frente/lados do móvel (referencial local). Vazio quando não há exigência. */
function zonasLocais(inst: Instancia, dim: Dimensoes): Retangulo[] {
  const w = inst.largura_m;
  const d = inst.profundidade_m;
  switch (inst.id) {
    case 'guarda-roupa': {
      const f = frenteGuardaRoupa(inst);
      return [[-w / 2, w / 2, d, d + f, 0, ALTURA_ZONA]];
    }
    case 'cabeceira-ripada-led': {
      const meia = CAMA.largura / 2;
      const z0 = CAMA.recuo;
      const z1 = CAMA.recuo + CAMA.comprimento;
      return [
        [-meia - CIRCULACAO_CAMA, -meia, z0, z1, 0, ALTURA_ZONA],
        [meia, meia + CIRCULACAO_CAMA, z0, z1, 0, ALTURA_ZONA],
      ];
    }
    case 'bancada-l': {
      const ret = retornoBancada(dim);
      const x0 = -w / 2 + 0.62;
      return [
        [x0, w / 2, d, d + CIRCULACAO_COZINHA, 0, ALTURA_ZONA],
        [x0, x0 + CIRCULACAO_COZINHA, d, d + ret, 0, ALTURA_ZONA],
      ];
    }
    case 'ilha':
      return [
        [-w / 2, w / 2, -d / 2 - CIRCULACAO_COZINHA, -d / 2, 0, ALTURA_ZONA],
        [-w / 2, w / 2, d / 2, d / 2 + CIRCULACAO_COZINHA, 0, ALTURA_ZONA],
      ];
    case 'nicho-geladeira':
      return [[-w / 2, w / 2, d, d + CIRCULACAO_COZINHA, 0, ALTURA_ZONA]];
    default:
      return [];
  }
}

function paraMundo(inst: Instancia, dim: Dimensoes, retangulos: Retangulo[]): Caixa2D[] {
  const { posicao, rotY } = poseModulo(inst, dim);
  const c = Math.round(Math.cos(rotY));
  const s = Math.round(Math.sin(rotY));
  return retangulos.map(([x0, x1, z0, z1, y0, y1]) => {
    const pontos = [
      [x0, z0],
      [x1, z0],
      [x1, z1],
      [x0, z1],
    ].map(([x, z]) => [posicao[0] + x * c + z * s, posicao[2] - x * s + z * c]);
    const xs = pontos.map((p) => p[0]);
    const zs = pontos.map((p) => p[1]);
    const zona = y0 === 0 && y1 === ALTURA_ZONA;
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minZ: Math.min(...zs),
      maxZ: Math.max(...zs),
      // Zonas de uso vão do piso até 2 m, independentemente da elevação do móvel.
      minY: zona ? 0 : posicao[1] + y0,
      maxY: zona ? ALTURA_ZONA : posicao[1] + y1,
    };
  });
}

export function caixasModulo(inst: Instancia, dim: Dimensoes): Caixa2D[] {
  return paraMundo(inst, dim, pegadasLocais(inst, dim));
}

export function zonasDeUso(inst: Instancia, dim: Dimensoes): Caixa2D[] {
  return paraMundo(inst, dim, zonasLocais(inst, dim));
}

/** Ponto do referencial local do móvel no mundo ([x, z]). */
export function pontoNoMundo(inst: Instancia, dim: Dimensoes, x: number, z: number): [number, number] {
  const { posicao, rotY } = poseModulo(inst, dim);
  const c = Math.round(Math.cos(rotY));
  const s = Math.round(Math.sin(rotY));
  return [posicao[0] + x * c + z * s, posicao[2] - x * s + z * c];
}

export const TOLERANCIA = 0.012;

export function sobrepoe(a: Caixa2D, b: Caixa2D): boolean {
  return (
    a.minX < b.maxX - TOLERANCIA &&
    a.maxX > b.minX + TOLERANCIA &&
    a.minZ < b.maxZ - TOLERANCIA &&
    a.maxZ > b.minZ + TOLERANCIA &&
    a.minY < b.maxY - TOLERANCIA &&
    a.maxY > b.minY + TOLERANCIA
  );
}

/** Gaveteiro volante fica sob a bancada de propósito. */
function podeSobrepor(a: Instancia, b: Instancia): boolean {
  const par = [a.id, b.id];
  return par.includes('gaveteiro') && par.includes('bancada-trabalho');
}

/** Faixa vertical ocupada pela abertura. A mesma usada para desenhar a parede. */
export function faixaAbertura(ab: Abertura): { y0: number; y1: number } {
  const janela = ab.tipo === 'janela';
  const y0 = ab.peitoril_m ?? (janela ? 1.0 : 0);
  const altura = ab.altura_m ?? (janela ? 1.1 : 2.1);
  return { y0, y1: y0 + altura };
}

/** Converte a posição da abertura (eixo do mundo) para o X local do grupo da parede. */
export function xLocalNaParede(parede: Abertura['parede'], posicao: number): number {
  return parede === 'N' || parede === 'L' ? posicao : -posicao;
}

const AFASTAMENTO_CANTO = 0.05;

/** Mantém a abertura inteira dentro da parede e abaixo do teto, com medidas em passos de 5 cm. */
export function prenderAbertura(ab: Abertura, dim: Dimensoes): Abertura {
  const comprimento = comprimentoParede(ab.parede, dim);
  const largura_m = limitar(arredondar(ab.largura_m), 0.4, Math.max(0.4, comprimento - 2 * AFASTAMENTO_CANTO));
  const folga = Math.max(0, comprimento / 2 - largura_m / 2 - AFASTAMENTO_CANTO);
  const { y0, y1 } = faixaAbertura(ab);
  const peitoril_m = ab.tipo === 'porta' ? 0 : limitar(arredondar(y0), 0.1, dim.pe_direito_m - 0.4);
  const altura_m = limitar(arredondar(y1 - y0), 0.3, dim.pe_direito_m - peitoril_m - 0.05);
  return { ...ab, largura_m, peitoril_m, altura_m, posicaoOffset_m: limitar(arredondar(ab.posicaoOffset_m), -folga, folga) };
}

/** Altura máxima de um móvel que pode ficar sob a janela. */
export const ALTURA_SOB_JANELA = 0.9;
/** Faixa à frente da janela que um móvel alto não pode ocupar. */
const PROFUNDIDADE_JANELA = 0.3;

/** Raio de abertura da porta do ambiente (abre para dentro): quadrado da largura da folha. */
export function giroDaPorta(ab: Abertura, dim: Dimensoes): Caixa2D {
  return caixaAbertura(ab, dim, ab.largura_m);
}

/** Caixa no mundo ocupada pela abertura, colada na face interna da parede, com a profundidade pedida. */
export function caixaAbertura(ab: Abertura, dim: Dimensoes, e = 0.03): Caixa2D {
  const W = dim.largura_m / 2;
  const D = dim.profundidade_m / 2;
  const { y0, y1 } = faixaAbertura(ab);
  const meia = ab.largura_m / 2;
  switch (ab.parede) {
    case 'N':
      return { minX: ab.posicaoOffset_m - meia, maxX: ab.posicaoOffset_m + meia, minZ: -D, maxZ: -D + e, minY: y0, maxY: y1 };
    case 'S':
      return { minX: ab.posicaoOffset_m - meia, maxX: ab.posicaoOffset_m + meia, minZ: D - e, maxZ: D, minY: y0, maxY: y1 };
    case 'O':
      return { minX: -W, maxX: -W + e, minZ: ab.posicaoOffset_m - meia, maxZ: ab.posicaoOffset_m + meia, minY: y0, maxY: y1 };
    default:
      return { minX: W - e, maxX: W, minZ: ab.posicaoOffset_m - meia, maxZ: ab.posicaoOffset_m + meia, minY: y0, maxY: y1 };
  }
}

/**
 * Mesa de cabeceira suspensa é fixada no painel ripado: contra a cabeceira, só conta a cama.
 */
function caixasColisao(a: Instancia, b: Instancia, caixas: Caixa2D[]): Caixa2D[] {
  if (a.id === 'cabeceira-ripada-led' && b.id === 'criado-mudo') return caixas.slice(1);
  return caixas;
}

/** Problemas encontrados por peça. Mapa vazio significa projeto sem conflitos. */
export function validarLayout(
  modulos: Instancia[],
  aberturas: Abertura[],
  dim: Dimensoes,
  rotulo: (id: ModuloId) => string
): Map<string, string> {
  const problemas = new Map<string, string>();
  const W = dim.largura_m / 2;
  const D = dim.profundidade_m / 2;
  const caixas = modulos.map((m) => caixasModulo(m, dim));

  modulos.forEach((m, i) => {
    const fora = caixas[i].some(
      (c) =>
        c.minX < -W - TOLERANCIA ||
        c.maxX > W + TOLERANCIA ||
        c.minZ < -D - TOLERANCIA ||
        c.maxZ > D + TOLERANCIA
    );
    if (fora) problemas.set(m.uid, 'passa do limite do ambiente');

    for (let j = i + 1; j < modulos.length; j++) {
      if (podeSobrepor(m, modulos[j])) continue;
      const bate = caixasColisao(m, modulos[j], caixas[i]).some((a) =>
        caixasColisao(modulos[j], m, caixas[j]).some((b) => sobrepoe(a, b))
      );
      if (bate) {
        problemas.set(m.uid, `encosta em ${rotulo(modulos[j].id)}`);
        problemas.set(modulos[j].uid, `encosta em ${rotulo(m.id)}`);
      }
    }

    aberturas.forEach((ab) => {
      if (ab.tipo === 'janela') {
        // Móvel de até 90 cm pode ficar sob a janela; acima disso, não pode cobri-la.
        const frente = caixaAbertura(ab, dim, PROFUNDIDADE_JANELA);
        if (caixas[i].some((c) => c.maxY > ALTURA_SOB_JANELA + TOLERANCIA && sobrepoe(c, frente))) {
          problemas.set(m.uid, 'cobre a janela');
        }
      } else if (caixas[i].some((c) => sobrepoe(c, giroDaPorta(ab, dim)))) {
        problemas.set(m.uid, 'bloqueia a porta');
      }
    });
  });

  return problemas;
}

export function paredesDoAmbiente(_ambiente: Ambiente): ParedeCardeal[] {
  return ['N', 'O', 'L', 'S', 'centro'];
}
