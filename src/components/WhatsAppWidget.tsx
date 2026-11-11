import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { trackWhatsAppClick } from '../utils/helpers';

interface WhatsAppWidgetProps {
  /** Na home, o botão só aparece depois do hero, que já tem os próprios CTAs. */
  aguardarHero?: boolean;
  /** Abre o pedido de orçamento (o cliente escolhe o que quer antes de cair no WhatsApp). */
  onAbrirOrcamento: () => void;
}

/**
 * Botão flutuante de orçamento (único círculo completo permitido pelo DESIGN.md).
 * Abre o painel de orçamento; o WhatsApp direto continua no rodapé do painel.
 */
export const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({ aguardarHero = false, onAbrirOrcamento }) => {
  const [visivel, setVisivel] = useState(!aguardarHero);

  useEffect(() => {
    const hero = aguardarHero ? document.getElementById('hero') : null;
    if (!hero) {
      setVisivel(true);
      return;
    }
    const observador = new IntersectionObserver(([e]) => setVisivel(!e.isIntersecting));
    observador.observe(hero);
    return () => observador.disconnect();
  }, [aguardarHero]);

  if (!visivel) return null;

  return (
    <div className="fixed bottom-[max(16px,env(safe-area-inset-bottom))] right-16 sm:bottom-24 sm:right-24 z-40">
      <button
        type="button"
        onClick={() => {
          trackWhatsAppClick('widget_flutuante');
          onAbrirOrcamento();
        }}
        aria-label="Pedir orçamento"
        title="Pedir orçamento"
        className="w-14 h-14 rounded-full bg-dourado text-preto hover:bg-preto hover:text-dourado border border-preto flex items-center justify-center transition-colors duration-200 cursor-pointer"
      >
        <MessageSquare className="w-6 h-6" strokeWidth={1.5} />
      </button>
    </div>
  );
};
