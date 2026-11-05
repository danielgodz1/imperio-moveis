// WhatsApp helper for Império Móveis Planejados (Jaú, SP)
export function getWhatsAppUrl(customText?: string): string {
  const phoneNumber = '5514998492834'; // Império Móveis Planejados Jaú
  const defaultMessage = 'Olá, Império Móveis Planejados! Gostaria de agendar uma consulta técnica / solicitar orçamento sem compromisso em Jaú.';
  const message = encodeURIComponent(customText || defaultMessage);
  return `https://wa.me/${phoneNumber}?text=${message}`;
}

// Format Currency BRL
export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(value);
}

// Play a subtle wooden audio feedback chime (using Web Audio API, zero external asset dependency)
export const SOUND_ENABLED = false;
export function playWoodChimeSound() {
  if (!SOUND_ENABLED) return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Create soft marimba/wood block sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
}
