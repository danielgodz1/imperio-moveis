import { create } from 'zustand';

/**
 * Faixas de progresso (0 a 1) da narrativa do hero da Cozinha Gourmet.
 * Fonte única de verdade para a timeline Three.js e para o overlay DOM.
 */
export const FASES = {
  traco: { inicio: 0.0, fim: 0.18 },
  profundidade: { inicio: 0.18, fim: 0.32 },
  construcao: { inicio: 0.32, fim: 0.74 },
  acabamento: { inicio: 0.74, fim: 0.88 },
  obra: { inicio: 0.88, fim: 1.0 },
} as const;

/** Largura do painel de texto no desktop; a câmera desloca a cena para fora dele. */
export const PAINEL_DESKTOP = { min: 440, vw: 0.38, max: 600, breakpoint: 1024 } as const;

export function larguraPainel(larguraTela: number): number {
  if (larguraTela < PAINEL_DESKTOP.breakpoint) return 0;
  return Math.min(PAINEL_DESKTOP.max, Math.max(PAINEL_DESKTOP.min, larguraTela * PAINEL_DESKTOP.vw));
}

/** Recorte object-position da foto final; a câmera 3D usa o mesmo recorte. */
export const RECORTE_FOTO = { x: 0.5, y: 0.55 } as const;

export type FaseId = keyof typeof FASES;

export interface FaseInfo {
  id: FaseId;
  numero: string;
  titulo: string;
  detalhe: string;
}

export const METADADOS_FASES: Record<FaseId, FaseInfo> = {
  traco: {
    id: 'traco',
    numero: '01',
    titulo: 'O traço',
    detalhe: 'Paredes, ilha e armários riscados na planta.',
  },
  profundidade: {
    id: 'profundidade',
    numero: '02',
    titulo: 'Profundidade',
    detalhe: 'O piso assenta e as paredes sobem.',
  },
  construcao: {
    id: 'construcao',
    numero: '03',
    titulo: 'Construção',
    detalhe: 'Caixas, gavetas, portas e tampo, peça por peça.',
  },
  acabamento: {
    id: 'acabamento',
    numero: '04',
    titulo: 'Acabamento',
    detalhe: 'Laca, pedra, inox e a fita de LED acesa.',
  },
  obra: {
    id: 'obra',
    numero: '05',
    titulo: 'Obra real',
    detalhe: 'A mesma cozinha, fotografada depois de instalada.',
  },
};

export function faseAtual(p: number): FaseId {
  if (p < FASES.traco.fim) return 'traco';
  if (p < FASES.profundidade.fim) return 'profundidade';
  if (p < FASES.construcao.fim) return 'construcao';
  if (p < FASES.acabamento.fim) return 'acabamento';
  return 'obra';
}

/** Progresso normalizado (0 a 1) dentro de uma faixa específica. */
export function progressoNaFaixa(p: number, inicio: number, fim: number): number {
  if (p <= inicio) return 0;
  if (p >= fim) return 1;
  return (p - inicio) / (fim - inicio);
}

interface HeroScrollState {
  progress: number;
  setProgress: (p: number) => void;
  /** true quando o cliente navegou por um link (ou abriu numa âncora): a montagem não segura a página. */
  liberado: boolean;
}

export const useHeroScrollStore = create<HeroScrollState>()((set) => ({
  progress: 0,
  setProgress: (p) => set({ progress: Math.min(1, Math.max(0, p)) }),
  liberado: false,
}));

/** Libera a rolagem além do hero (links do menu, rodapé e botões levam direto à seção). */
export const liberarNarrativa = () => useHeroScrollStore.setState({ liberado: true });
