// WhatsApp helper for Império Móveis Planejados (Jaú, SP)
export const WHATSAPP_NUMERO = '5514998492834';
export const WHATSAPP_MSG_PADRAO =
  'Oi! Vi o site da Império e quero conversar sobre um projeto.';

export function getWhatsAppUrl(customText?: string): string {
  const message = encodeURIComponent(customText || WHATSAPP_MSG_PADRAO);
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${message}`;
}

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}
