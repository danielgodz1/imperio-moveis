import { EMPRESA } from './empresa';

/**
 * Resumo do Perfil da Empresa no Google, usado enquanto a API do Google Places não estiver
 * configurada na Vercel (GOOGLE_PLACES_API_KEY). Com a chave, a seção mostra nota, total e
 * avaliações ao vivo (`/api/avaliacoes`) e este resumo deixa de aparecer.
 * Atualize os números e a data se a chave demorar para ser configurada.
 */
export const RESUMO_GOOGLE = {
  nota: 4.9,
  total: 8,
  conferidoEm: '11/11/2026',
};

/** Ficha da Império no Google Maps: ver todas as avaliações e escrever uma. */
export const LINK_PERFIL_GOOGLE = EMPRESA.googleProfileUrl ?? EMPRESA.mapsUrl;
