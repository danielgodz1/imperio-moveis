import { lazy } from 'react';

/**
 * Páginas internas em pedaços separados: quem abre a home não baixa o código delas, e vice-versa.
 * O main.tsx espera o pedaço da página aberta antes de montar o React; assim o HTML
 * pré-renderizado fica na tela até a página de verdade estar pronta (sem tela vazia nem pulo).
 */
const carregar = {
  projetar: () => import('./components/PaginaProjetar'),
  legal: () => import('./components/PaginaLegal'),
  obras: () => import('./components/PaginaObras'),
  contato: () => import('./components/ContactQuotationPage'),
  ambiente: () => import('./components/PaginaAmbienteLocal'),
  visita: () => import('./components/VisitBookingModal'),
  v2: () => import('./v2/PaginaV2'),
};

export const PaginaProjetar = lazy(() => carregar.projetar().then((m) => ({ default: m.PaginaProjetar })));
export const PaginaLegal = lazy(() => carregar.legal().then((m) => ({ default: m.PaginaLegal })));
export const PaginaObras = lazy(() => carregar.obras().then((m) => ({ default: m.PaginaObras })));
export const ContactQuotationPage = lazy(() => carregar.contato().then((m) => ({ default: m.ContactQuotationPage })));
export const PaginaAmbienteLocal = lazy(() => carregar.ambiente().then((m) => ({ default: m.PaginaAmbienteLocal })));
export const VisitBookingModal = lazy(() => carregar.visita().then((m) => ({ default: m.VisitBookingModal })));
export const PaginaV2 = lazy(() => carregar.v2());

const AMBIENTES = ['/cozinhas-planejadas-jau', '/quartos-planejados-jau', '/closets-sob-medida-jau', '/home-office-planejado-jau'];

/** Baixa o pedaço da página do endereço atual (a home não tem pedaço próprio). */
export function precarregarRota(pathname: string): Promise<unknown> {
  const rota = pathname.replace(/\/+$/, '') || '/';
  if (/^\/v2(\/|$)/.test(rota)) return carregar.v2();
  if (rota === '/projetar') return carregar.projetar();
  if (rota === '/obras') return carregar.obras();
  if (rota === '/contato') return carregar.contato();
  if (rota === '/privacidade' || rota === '/termos') return carregar.legal();
  if (AMBIENTES.includes(rota)) return carregar.ambiente();
  return Promise.resolve();
}
