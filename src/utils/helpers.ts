import { EMPRESA } from '../data/empresa';

export const WHATSAPP_NUMBER = EMPRESA.whatsapp;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Array<Record<string, unknown>>;
  }
}

let resumo3DAtivo = '';

export function salvarResumo3DAtivo(resumo: string): void {
  resumo3DAtivo = resumo;
}

export function obterResumo3DAtivo(): string {
  return resumo3DAtivo;
}

/**
 * Dispara eventos GA4 (whatsapp_click e generate_lead) sem dados pessoais (PII).
 */
export function trackEvent(
  eventName: 'whatsapp_click' | 'generate_lead',
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

export function trackWhatsAppClick(origem: string): void {
  trackEvent('whatsapp_click', { origin: origem });
}

export function trackGenerateLead(ambiente: string, fase: string): void {
  trackEvent('generate_lead', {
    ambiente,
    fase_obra: fase,
  });
}

export function getWhatsAppUrl(customMessage?: string): string {
  const defaultMsg =
    'Oi! Vi o site da Império e quero conversar sobre um projeto.';
  const text = encodeURIComponent(customMessage || defaultMsg);
  return `https://wa.me/${EMPRESA.whatsapp}?text=${text}`;
}
