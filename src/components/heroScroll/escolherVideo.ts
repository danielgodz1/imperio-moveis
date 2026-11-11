/**
 * Qual arquivo de vídeo do hero servir a cada visitante.
 * - Orientação: tela em pé usa o vídeo vertical (celular); tela deitada usa o horizontal (computador, tablet).
 * - Resolução: 1080p só quando a tela realmente mostra esses pixels e a conexão aguenta;
 *   senão 720p (metade do peso, quase igual a olho nu numa tela pequena).
 */
export type Orientacao = 'celular' | 'desktop';
export type Resolucao = 720 | 1080;

export interface EntradaVideo {
  larguraCss: number;
  alturaCss: number;
  dpr: number;
  /** Modo "economizar dados" do navegador. */
  economiaDados?: boolean;
  /** `effectiveType` da Network Information API (quando existe). */
  rede?: string;
}

export interface FonteVideo {
  orientacao: Orientacao;
  resolucao: Resolucao;
  src: string;
  poster: string;
}

/** Pixels reais da largura necessários para o 1080p valer a pena. */
const PIXELS_PARA_1080 = { celular: 900, desktop: 1500 } as const;
const REDES_LENTAS = new Set(['slow-2g', '2g', '3g']);

export function escolherVideo(e: EntradaVideo): FonteVideo {
  const orientacao: Orientacao = e.alturaCss > e.larguraCss ? 'celular' : 'desktop';
  const pixels = e.larguraCss * Math.max(1, e.dpr);
  const conexaoOk = !e.economiaDados && !(e.rede && REDES_LENTAS.has(e.rede));
  const resolucao: Resolucao = conexaoOk && pixels >= PIXELS_PARA_1080[orientacao] ? 1080 : 720;
  return {
    orientacao,
    resolucao,
    src: `/videos/hero-${orientacao}-${resolucao}.mp4`,
    poster: `/videos/hero-${orientacao}-poster.jpg`,
  };
}

/** Lê o aparelho atual (só no navegador). */
export function escolherVideoDoAparelho(): FonteVideo {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
  return escolherVideo({
    larguraCss: window.innerWidth,
    alturaCss: window.innerHeight,
    dpr: window.devicePixelRatio || 1,
    economiaDados: nav.connection?.saveData,
    rede: nav.connection?.effectiveType,
  });
}

/** Em que ponto do progresso do hero o vídeo chega ao fim (a foto real assume depois). */
export const FIM_DO_VIDEO = 0.88;

/** Progresso do hero (0..1) -> tempo do vídeo em segundos. */
export function tempoDoVideo(progresso: number, duracao: number): number {
  const p = Math.min(1, Math.max(0, progresso / FIM_DO_VIDEO));
  return Math.min(duracao - 0.04, p * duracao);
}
