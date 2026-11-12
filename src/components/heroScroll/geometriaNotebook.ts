/**
 * Geometria do palco do notebook no hero: o vídeo do notebook abrindo, a tela onde a cozinha se
 * monta e o zoom até a tela tomar o palco inteiro. Funções puras (testadas).
 */

/** Proporção do vídeo do notebook (1920x1080). */
export const ASPECTO_VIDEO = 16 / 9;

/** Área da tela acesa no quadro com o notebook aberto, em fração do vídeo (medida no quadro de 5,0 s). */
export const TELA_NO_VIDEO = { x0: 508 / 1920, x1: 1412 / 1920, y0: 212 / 1080, y1: 741 / 1080 } as const;

/** Tempo do vídeo em que o notebook termina de abrir (o vídeo publicado tem 5,2 s). */
export const TEMPO_ABERTO_S = 5.0;

/** Faixas do progresso do hero (0 a 1) para cada movimento do palco. */
export const FAIXAS_NOTEBOOK = {
  /** A tampa abre enquanto o traço é desenhado. */
  abrir: { inicio: 0, fim: 0.14 },
  /** A tela acende mostrando a montagem. */
  acender: { inicio: 0.11, fim: 0.16 },
  /** A câmera se aproxima da tela enquanto os móveis se montam. */
  aproximar: { inicio: 0.16, fim: 0.86 },
} as const;

export interface Retangulo {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Retângulo normalizado (0 a 1) dentro do palco: u da esquerda, v do topo. */
export interface TelaNormalizada {
  u0: number;
  u1: number;
  v0: number;
  v1: number;
}

export interface LayoutNotebook {
  /** Largura e altura do vídeo sem zoom (px). */
  videoW: number;
  videoH: number;
  /** Transform do vídeo: translação (px) e escala, com origem no canto superior esquerdo. */
  tx: number;
  ty: number;
  escala: number;
  /** Tela do notebook no palco (px). */
  tela: Retangulo;
  /** Tela usada para encaixar a câmera 3D (vai para o palco inteiro no fim do zoom). */
  telaCamera: TelaNormalizada;
  /** Recorte visível do canvas 3D (a própria tela, limitada ao palco). */
  recorte: { topo: number; direita: number; base: number; esquerda: number };
}

export interface OpcoesLayout {
  /** Tamanho do palco (px). */
  largura: number;
  altura: number;
  /** Aproximação de 0 (notebook inteiro) a 1 (tela cobre o palco). */
  zoom: number;
  /** Deslocamento horizontal do notebook no começo (px), para fugir de um painel de texto. */
  deslocX?: number;
  /** Deslocamento vertical do notebook no começo (px), para dar espaço a um título em cima. */
  deslocY?: number;
  /** Escala do notebook no começo (1 = vídeo cobrindo o palco no computador). */
  escalaInicial?: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const limitar = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

/** Suaviza o zoom: começa devagar e acelera no fim, como uma câmera que entra na tela. */
export function suavizarZoom(t: number): number {
  const x = limitar(t);
  return x * x * (3 - 2 * x);
}

/** Avanço (0 a 1) dentro de uma faixa do progresso. */
export function naFaixa(p: number, faixa: { inicio: number; fim: number }): number {
  return limitar((p - faixa.inicio) / (faixa.fim - faixa.inicio));
}

/** Tempo do vídeo (s) para o progresso do hero: abre a tampa e para aberto. */
export function tempoNotebook(p: number): number {
  return naFaixa(p, FAIXAS_NOTEBOOK.abrir) * TEMPO_ABERTO_S;
}

export function calcularLayout(o: OpcoesLayout): LayoutNotebook {
  const { largura: W, altura: H } = o;
  const retrato = W < H;
  // Computador: o vídeo cobre o palco. Celular em pé: o notebook ocupa a largura com folga.
  // O corpo do notebook ocupa ~64% da largura do vídeo: limita para ele caber inteiro em palcos estreitos.
  const base = retrato ? W * 1.45 : Math.min(Math.max(W, H * ASPECTO_VIDEO), W * 1.48);
  const videoW = base * (o.escalaInicial ?? 1);
  const videoH = videoW / ASPECTO_VIDEO;

  const telaW0 = videoW * (TELA_NO_VIDEO.x1 - TELA_NO_VIDEO.x0);
  const telaH0 = videoH * (TELA_NO_VIDEO.y1 - TELA_NO_VIDEO.y0);
  const centroTelaVideo = {
    x: videoW * (TELA_NO_VIDEO.x0 + TELA_NO_VIDEO.x1) / 2,
    y: videoH * (TELA_NO_VIDEO.y0 + TELA_NO_VIDEO.y1) / 2,
  };

  // Começo: vídeo centrado no palco (mais o deslocamento); fim: centro da tela no centro do palco.
  const inicioVideo = { x: (W - videoW) / 2 + (o.deslocX ?? 0), y: (H - videoH) / 2 + (o.deslocY ?? 0) };
  const centroInicial = { x: inicioVideo.x + centroTelaVideo.x, y: inicioVideo.y + centroTelaVideo.y };
  const z = suavizarZoom(o.zoom);
  const escalaFinal = Math.max(W / telaW0, H / telaH0) * 1.02;
  const escala = lerp(1, escalaFinal, z);
  const centro = { x: lerp(centroInicial.x, W / 2, z), y: lerp(centroInicial.y, H / 2, z) };

  const tx = centro.x - centroTelaVideo.x * escala;
  const ty = centro.y - centroTelaVideo.y * escala;
  const tela = { x: tx + videoW * TELA_NO_VIDEO.x0 * escala, y: ty + videoH * TELA_NO_VIDEO.y0 * escala, w: telaW0 * escala, h: telaH0 * escala };

  const telaNorm = { u0: tela.x / W, u1: (tela.x + tela.w) / W, v0: tela.y / H, v1: (tela.y + tela.h) / H };
  // No fim do zoom a tela já cobre o palco: a câmera passa a enquadrar o palco inteiro
  // (assim a passagem para a foto real casa com o recorte da foto em tela cheia).
  const paraCheio = limitar((z - 0.9) / 0.1);
  const telaCamera = {
    u0: lerp(telaNorm.u0, 0, paraCheio),
    u1: lerp(telaNorm.u1, 1, paraCheio),
    v0: lerp(telaNorm.v0, 0, paraCheio),
    v1: lerp(telaNorm.v1, 1, paraCheio),
  };
  const recorte = {
    topo: Math.max(0, tela.y),
    esquerda: Math.max(0, tela.x),
    direita: Math.max(0, W - (tela.x + tela.w)),
    base: Math.max(0, H - (tela.y + tela.h)),
  };
  return { videoW, videoH, tx, ty, escala, tela, telaCamera, recorte };
}
