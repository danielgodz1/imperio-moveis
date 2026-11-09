import { create } from 'zustand';

/**
 * Faixas de progresso (0 a 1) da narrativa do hero da Cozinha Gourmet.
 * Fonte única de verdade para a timeline Three.js e para o overlay DOM.
 */
export const FASES = {
  traco: { inicio: 0.0, fim: 0.2 },
  profundidade: { inicio: 0.2, fim: 0.4 },
  construcao: { inicio: 0.4, fim: 0.7 },
  instalacao: { inicio: 0.7, fim: 0.85 },
  crossfade: { inicio: 0.85, fim: 1.0 },
} as const;

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
    titulo: 'O traço técnico inicial',
    detalhe: 'Planta baixa 2D com bancada em L, ilha central e cotas precisas',
  },
  profundidade: {
    id: 'profundidade',
    numero: '02',
    titulo: 'A arquitetura ganha volume',
    detalhe: 'Elevação das paredes, piso porcelanato e perspectiva 3D',
  },
  construcao: {
    id: 'construcao',
    numero: '03',
    titulo: 'Montagem milimétrica',
    detalhe: 'Ilha em verde-sálvia, painel ripado em freijó e armários em L',
  },
  instalacao: {
    id: 'instalacao',
    numero: '04',
    titulo: 'Bancada de granito & fita LED',
    detalhe: 'Tampo em granito preto, cristaleira iluminada e luz quente 2700K',
  },
  crossfade: {
    id: 'crossfade',
    numero: '05',
    titulo: 'A realidade executada',
    detalhe: 'Cozinha Gourmet real executada pela marcenaria Império em Jaú',
  },
};

export function faseAtual(p: number): FaseId {
  if (p < FASES.traco.fim) return 'traco';
  if (p < FASES.profundidade.fim) return 'profundidade';
  if (p < FASES.construcao.fim) return 'construcao';
  if (p < FASES.instalacao.fim) return 'instalacao';
  return 'crossfade';
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
}

export const useHeroScrollStore = create<HeroScrollState>()((set) => ({
  progress: 0,
  setProgress: (p) => set({ progress: Math.min(1, Math.max(0, p)) }),
}));
