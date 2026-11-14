import { lazy } from 'react';

/**
 * Pedaços sob demanda. O site (V2) vem no código principal; a V1 (em /v1) e as páginas dela
 * ficam em pedaços separados. O main.tsx espera o pedaço da página aberta antes de montar o
 * React; assim o HTML pré-renderizado fica na tela até a página de verdade estar pronta.
 */
const carregar = {
  projetar: () => import('./components/PaginaProjetar'),
  legal: () => import('./components/PaginaLegal'),
  obras: () => import('./components/PaginaObras'),
  contato: () => import('./components/ContactQuotationPage'),
  ambiente: () => import('./components/PaginaAmbienteLocal'),
  visita: () => import('./components/VisitBookingModal'),
  v1: () => import('./AppV1'),
};

export const PaginaProjetar = lazy(() => carregar.projetar().then((m) => ({ default: m.PaginaProjetar })));
export const PaginaLegal = lazy(() => carregar.legal().then((m) => ({ default: m.PaginaLegal })));
export const PaginaObras = lazy(() => carregar.obras().then((m) => ({ default: m.PaginaObras })));
export const ContactQuotationPage = lazy(() => carregar.contato().then((m) => ({ default: m.ContactQuotationPage })));
export const PaginaAmbienteLocal = lazy(() => carregar.ambiente().then((m) => ({ default: m.PaginaAmbienteLocal })));
export const VisitBookingModal = lazy(() => carregar.visita().then((m) => ({ default: m.VisitBookingModal })));

const AMBIENTES = [
  '/marcenaria-em-jau',
  '/cozinhas-planejadas-jau',
  '/quartos-e-closets-planejados-jau',
  '/quartos-planejados-jau',
  '/closets-sob-medida-jau',
  '/home-office-planejado-jau',
];

/** Baixa os pedaços da página do endereço atual (só a V1, em /v1, tem pedaços próprios). */
export function precarregarRota(pathname: string): Promise<unknown> {
  if (!/^\/v1(\/|$)/.test(pathname)) return Promise.resolve();
  const rota = pathname.slice(3).replace(/\/+$/, '') || '/';
  return Promise.all([carregar.v1(), precarregarPaginaV1(rota)]);
}

function precarregarPaginaV1(rota: string): Promise<unknown> {
  if (rota === '/projetar') return carregar.projetar();
  if (rota === '/obras') return carregar.obras();
  if (rota === '/contato') return carregar.contato();
  if (rota === '/privacidade' || rota === '/termos') return carregar.legal();
  if (AMBIENTES.includes(rota)) return carregar.ambiente();
  return Promise.resolve();
}
