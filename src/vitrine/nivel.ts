import { useSyncExternalStore } from 'react';

/**
 * Níveis de experiência do site, usados para demonstrar o mesmo projeto em três entregas.
 * Sem `?nivel=` na URL o site roda completo e o seletor não aparece para o visitante.
 */
export type Nivel = 'essencial' | 'profissional' | 'cinematografico';

export interface DefinicaoNivel {
  id: Nivel;
  nome: string;
  resumo: string;
  inclui: string[];
}

export const NIVEIS: DefinicaoNivel[] = [
  {
    id: 'essencial',
    nome: 'Essencial',
    resumo: 'Foto real, texto direto e orçamento pelo WhatsApp.',
    inclui: ['Hero com foto da obra', 'Galeria de obras', 'Orçamento em 3 passos', 'Páginas por ambiente'],
  },
  {
    id: 'profissional',
    nome: 'Profissional',
    resumo: 'O essencial com movimento que explica o trabalho.',
    inclui: ['Tudo do Essencial', 'Linhas de material nas fotos', 'Holofote nos fundadores'],
  },
  {
    id: 'cinematografico',
    nome: 'Cinematográfico',
    resumo: 'A experiência completa, com 3D guiado pela rolagem.',
    inclui: ['Tudo do Profissional', 'Hero 3D que constrói a cozinha', 'Editor de ambiente em 3D'],
  },
];

const PARAMETRO = 'nivel';
const PADRAO: Nivel = 'cinematografico';

interface Estado {
  nivel: Nivel;
  vitrine: boolean;
}

function lerDaUrl(): Estado {
  if (typeof window === 'undefined') return { nivel: PADRAO, vitrine: false };
  const valor = new URLSearchParams(window.location.search).get(PARAMETRO);
  const definicao = NIVEIS.find((n) => n.id === valor);
  return { nivel: definicao?.id ?? PADRAO, vitrine: valor !== null };
}

let estado = lerDaUrl();
const ouvintes = new Set<() => void>();

export function definirNivel(nivel: Nivel) {
  const url = new URL(window.location.href);
  url.searchParams.set(PARAMETRO, nivel);
  window.history.replaceState(window.history.state, '', url);
  estado = { nivel, vitrine: true };
  window.scrollTo(0, 0);
  ouvintes.forEach((avisar) => avisar());
}

function assinar(avisar: () => void) {
  ouvintes.add(avisar);
  return () => ouvintes.delete(avisar);
}

const lerEstado = () => estado;

export function useNivel(): Nivel {
  return useSyncExternalStore(assinar, lerEstado, lerEstado).nivel;
}

export function useVitrineAtiva(): boolean {
  return useSyncExternalStore(assinar, lerEstado, lerEstado).vitrine;
}

export const tem3D = (nivel: Nivel) => nivel === 'cinematografico';
export const temMovimento = (nivel: Nivel) => nivel !== 'essencial';
