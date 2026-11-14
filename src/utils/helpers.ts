import { EMPRESA } from '../data/empresa';

export const WHATSAPP_NUMBER = EMPRESA.whatsapp;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

/**
 * Dispara eventos GA4 (whatsapp_click e generate_lead) sem dados pessoais (PII).
 */
export function trackEvent(
  eventName: 'whatsapp_click' | 'generate_lead' | 'projeto_3d' | 'conversa_flutuante',
  params: Record<string, string | number | boolean> = {}
): void {
  if (typeof window === 'undefined') return;
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: eventName, ...params });
    }
  } catch {
    // Ignora caso bloqueadores de anúncio interceptem o analytics
  }
}

/** Ações no projeto 3D (sem dados pessoais): iniciar, salvar, abrir_salvo, baixar_imagem, baixar_pdf, copiar_link, enviar. */
export function trackProjeto3D(acao: string, params: Record<string, string | number | boolean> = {}): void {
  trackEvent('projeto_3d', { acao, ...params });
}

export function trackWhatsAppClick(origem: string): void {
  trackEvent('whatsapp_click', { origin: origem });
}

export function trackGenerateLead(ambiente: string, fase: string): void {
  trackEvent('generate_lead', {
    ambiente,
    fase_obra: fase,
  });
}

export function getWhatsAppUrl(customMessage?: string, utmCampaign = 'orcamento_jau'): string {
  const defaultMsg =
    'Olá! Vim pelo site da Império Móveis Planejados em Jaú e gostaria de solicitar um Projeto 3D e orçamento.';
  const text = encodeURIComponent(customMessage || defaultMsg);
  return `https://wa.me/${EMPRESA.whatsapp}?text=${text}&utm_source=site&utm_medium=cta_whatsapp&utm_campaign=${encodeURIComponent(utmCampaign)}`;
}
