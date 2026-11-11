import { materiaisPorUso } from './materiais/catalogo';

export interface Acabamento3D {
  id: string;
  nome: string;
  hex: string;
  textura?: string;
  confirmado: boolean;
}

/**
 * Acabamentos de frente, lidos de `materiais/catalogo.json` (fonte única).
 * Enquanto `confirmado` for `false`, a interface trata o acabamento como exemplo.
 * Os ids antigos foram mantidos para não quebrar projetos salvos nem o hero.
 */
export const ACABAMENTOS_3D: Acabamento3D[] = materiaisPorUso('frente').map((m) => ({
  id: m.id,
  nome: m.nome,
  hex: m.cor,
  textura: m.tipo === 'madeirado' ? 'madeira' : undefined,
  confirmado: m.confirmado,
}));
