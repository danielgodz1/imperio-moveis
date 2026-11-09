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
  posicaoOffset_m: number;
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
      return H - h - 0.03;
    case 'armario-aereo-office':
      return Math.max(1.5, H - h - 0.35);
    case 'criado-mudo':
      return 0.36;
    case 'forro-ripado-teto':
      return H - h;
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

/** Retângulos ocupados no referencial local do móvel: [x0, x1, z0, z1, y0, y1]. */
function pegadasLocais(inst: Instancia, dim: Dimensoes): number[][] {
  const w = inst.largura_m;
  const h = inst.altura_m;
  const d = inst.profundidade_m;
  if (inst.id === 'cabeceira-ripada-led') return [[-0.8, 0.8, 0, 2.08, 0, 0.62]];
  if (inst.id === 'bancada-l') {
    return [
      [-w / 2, w / 2, 0, d, 0, h],
      [-w / 2, -w / 2 + 0.62, d, d + retornoBancada(dim), 0, h],
    ];
  }
  if (inst.parede === 'centro') return [[-w / 2, w / 2, -d / 2, d / 2, 0, h]];
  return [[-w / 2, w / 2, 0, d, 0, h]];
}

export function caixasModulo(inst: Instancia, dim: Dimensoes): Caixa2D[] {
  const { posicao, rotY } = poseModulo(inst, dim);
  const c = Math.round(Math.cos(rotY));
  const s = Math.round(Math.sin(rotY));
  return pegadasLocais(inst, dim).map(([x0, x1, z0, z1, y0, y1]) => {
    const pontos = [
      [x0, z0],
      [x1, z0],
      [x1, z1],
      [x0, z1],
    ].map(([x, z]) => [posicao[0] + x * c + z * s, posicao[2] - x * s + z * c]);
    const xs = pontos.map((p) => p[0]);
    const zs = pontos.map((p) => p[1]);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minZ: Math.min(...zs),
      maxZ: Math.max(...zs),
      minY: posicao[1] + y0,
      maxY: posicao[1] + y1,
    };
  });
}

const TOLERANCIA = 0.012;

function sobrepoe(a: Caixa2D, b: Caixa2D): boolean {
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

function extensaoAbertura(ab: Abertura) {
  return ab.tipo === 'janela' ? { y0: 1.0, y1: 2.05 } : { y0: 0, y1: 2.1 };
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
      const bate = caixas[i].some((a) => caixas[j].some((b) => sobrepoe(a, b)));
      if (bate) {
        problemas.set(m.uid, `encosta em ${rotulo(modulos[j].id)}`);
        problemas.set(modulos[j].uid, `encosta em ${rotulo(m.id)}`);
      }
    }

    if (m.parede === 'centro') return;
    const metade = m.largura_m / 2;
    aberturas
      .filter((ab) => ab.parede === m.parede)
      .forEach((ab) => {
        const { y0, y1 } = extensaoAbertura(ab);
        const ocupa = caixas[i][0];
        const cruzaLado = Math.abs(m.offset_m - ab.posicaoOffset_m) < metade + ab.largura_m / 2 - TOLERANCIA;
        if (cruzaLado && ocupa.minY < y1 && ocupa.maxY > y0) {
          problemas.set(m.uid, ab.tipo === 'janela' ? 'cobre a janela' : 'bloqueia a porta');
        }
      });
  });

  return problemas;
}

export function paredesDoAmbiente(_ambiente: Ambiente): ParedeCardeal[] {
  return ['N', 'O', 'L', 'S', 'centro'];
}
