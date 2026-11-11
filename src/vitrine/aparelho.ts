/**
 * Classificação do aparelho em 4 faixas, sem dependência externa nem chamada de rede.
 * 0: sem 3D (sem WebGL, render por software, movimento reduzido)
 * 1: fraco (gráfico integrado antigo, celular de entrada, pouca memória ou CPU)
 * 2: intermediário (integrado moderno, celular médio)
 * 3: forte (placa dedicada, Apple Silicon)
 */
export type FaixaAparelho = 0 | 1 | 2 | 3;

export interface Aparelho {
  faixa: FaixaAparelho;
  gpu: string;
  movel: boolean;
  motivo: string;
}

export interface PerfilQualidade {
  /** Texturas menores e sem luzes extras. */
  leve: boolean;
  /** Sombras reais projetadas pela luz principal. */
  sombras: boolean;
  dpr: [number, number];
  /** MSAA: bordas sem degraus. Custa pouco em GPU de celular e é o que mais tira o aspecto de jogo. */
  antialias: boolean;
  /** Lado do mapa de sombra em pixels (0 = sem sombra real). */
  mapaSombra: number;
  /** Segmentos do chanfro nas quinas dos móveis (0 = quina viva). */
  bisel: number;
}

const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic/i;
const INTEGRADA_FRACA =
  /\bhd graphics\b|uhd graphics(?!\s*7\d\d)|\bgma\b|mali-(4|t)\d|mali-g(31|51|52|57)\b|adreno[^0-9]*[1-5]\d\d\b|powervr|videocore|vivante/i;
const INTEGRADA_MEDIA = /iris|uhd graphics\s*7\d\d|radeon(\(tm\))? graphics|vega \d|mali-g(68|7\d)|adreno[^0-9]*6\d\d/i;
const FORTE = /nvidia|geforce|quadro|rtx|radeon (rx|pro)|apple m\d|apple gpu|adreno[^0-9]*7\d\d|mali-g7\d\d|immortalis/i;

interface NavegadorExtra {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

function lerGpu(): string | null {
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return null;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const nome = String(
      info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)
    );
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return nome;
  } catch {
    return null;
  }
}

let cache: Aparelho | null = null;

export function detectarAparelho(): Aparelho {
  if (cache) return cache;
  if (typeof window === 'undefined') {
    return { faixa: 0, gpu: '', movel: false, motivo: 'sem navegador' };
  }

  const nav = navigator as Navigator & NavegadorExtra;
  const movel = window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;
  const nucleos = nav.hardwareConcurrency || 4;
  const memoria = nav.deviceMemory ?? 8;
  const gpu = lerGpu();

  const resultado = (faixa: FaixaAparelho, motivo: string): Aparelho => {
    cache = { faixa, gpu: gpu ?? '', movel, motivo };
    return cache;
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return resultado(0, 'movimento reduzido');
  // ?qualidade=0..3 força a faixa (testes de qualidade e de desempenho em qualquer aparelho).
  const forcada = new URLSearchParams(window.location.search).get('qualidade');
  if (forcada !== null && /^[0-3]$/.test(forcada)) return resultado(Number(forcada) as FaixaAparelho, 'faixa forçada pela URL');
  if (!gpu) return resultado(0, 'sem WebGL');
  if (SOFTWARE.test(gpu)) return resultado(0, 'render por software');
  if (nav.connection?.saveData) return resultado(1, 'economia de dados');
  if (memoria <= 2 || nucleos <= 2) return resultado(1, 'pouca memória ou CPU');
  if (INTEGRADA_FRACA.test(gpu)) return resultado(1, 'gráfico integrado de entrada');
  if (movel && (memoria <= 4 || nucleos <= 4)) return resultado(1, 'celular de entrada');
  if (FORTE.test(gpu)) return resultado(3, 'placa de vídeo forte');
  if (INTEGRADA_MEDIA.test(gpu)) return resultado(2, 'gráfico integrado moderno');
  return resultado(movel ? 2 : 2, 'aparelho intermediário');
}

/** Ajustes do 3D para a faixa do aparelho. */
export function perfilQualidade(aparelho = detectarAparelho()): PerfilQualidade {
  const { faixa, movel } = aparelho;
  // Computador com placa forte: tudo ligado.
  if (faixa >= 3 && !movel) return { leve: false, sombras: true, dpr: [1, 2], antialias: true, mapaSombra: 2048, bisel: 2 };
  // Intermediário (celular bom, integrado moderno): sombras suaves e MSAA, texturas menores no celular.
  if (faixa >= 2) return { leve: movel, sombras: true, dpr: [1, 2], antialias: true, mapaSombra: movel ? 1024 : 1536, bisel: movel ? 1 : 2 };
  // Entrada: sem sombra real (as manchas de oclusão seguram o visual), mas com MSAA e chanfro simples.
  return { leve: true, sombras: false, dpr: [1, 1.5], antialias: true, mapaSombra: 0, bisel: 1 };
}
