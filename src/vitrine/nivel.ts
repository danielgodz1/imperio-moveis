import { useSyncExternalStore } from 'react';
import { FaixaAparelho, detectarAparelho } from './aparelho';

/**
 * Níveis de experiência do site. O site público é sempre o Cinematográfico (sem seletor).
 * Os outros dois ficam como rede de segurança automática: Essencial quando o aparelho não tem
 * WebGL ou pede menos movimento, e Profissional quando o 3D fica lento no próprio aparelho.
 * `?nivel=` na URL ainda força um nível, para testes.
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
const PORTE_POR_FAIXA: Record<FaixaAparelho, Nivel> = {
  // Sem WebGL, renderização por software ou "reduzir movimento" no sistema: sem 3D.
  0: 'essencial',
  // Aparelho modesto também abre no Cinematográfico; se travar, rebaixarPorDesempenho cuida.
  1: 'cinematografico',
  2: 'cinematografico',
  3: 'cinematografico',
};

interface Estado {
  nivel: Nivel;
  /** true quando o nível veio da detecção do aparelho, não de uma escolha. */
  automatico: boolean;
}

function nivelDoAparelho(): Nivel {
  return PORTE_POR_FAIXA[detectarAparelho().faixa];
}

function lerDaUrl(): Estado {
  if (typeof window === 'undefined') return { nivel: 'essencial', automatico: true };
  const valor = new URLSearchParams(window.location.search).get(PARAMETRO);
  const definicao = NIVEIS.find((n) => n.id === valor);
  return definicao ? { nivel: definicao.id, automatico: false } : { nivel: nivelDoAparelho(), automatico: true };
}

let estado = lerDaUrl();
const ouvintes = new Set<() => void>();

export function definirNivel(nivel: Nivel) {
  const url = new URL(window.location.href);
  url.searchParams.set(PARAMETRO, nivel);
  window.history.replaceState(window.history.state, '', url);
  estado = { nivel, automatico: false };
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

export function useNivelAutomatico(): boolean {
  return useSyncExternalStore(assinar, lerEstado, lerEstado).automatico;
}

/** Rebaixa o nível quando o próprio aparelho mostra que não aguenta o 3D. */
export function rebaixarPorDesempenho() {
  if (estado.nivel !== 'cinematografico') return;
  estado = { nivel: 'profissional', automatico: true };
  // O hero estático é mais curto: quem estava no meio da narrativa volta ao início.
  if (window.scrollY < window.innerHeight * 3) window.scrollTo(0, 0);
  ouvintes.forEach((avisar) => avisar());
}

export const tem3D = (nivel: Nivel) => nivel === 'cinematografico';
export const temMovimento = (nivel: Nivel) => nivel !== 'essencial';
