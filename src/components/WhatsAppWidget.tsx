import React, { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { getWhatsAppUrl, trackWhatsAppClick } from '../utils/helpers';

interface WhatsAppWidgetProps {
  /** Na home, o botão só aparece depois do hero, que já tem os próprios CTAs. */
  aguardarHero?: boolean;
}

/**
 * Botão flutuante do WhatsApp (único círculo completo permitido pelo DESIGN.md).
 */
export const WhatsAppWidget: React.FC<WhatsAppWidgetProps> = ({ aguardarHero = false }) => {
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
    <div className="fixed bottom-24 right-16 sm:right-24 z-40">
      <a
        href={getWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsAppClick('widget_flutuante')}
        aria-label="Chamar no WhatsApp"
        title="Chamar no WhatsApp"
        className="w-14 h-14 rounded-full bg-dourado text-preto hover:bg-preto hover:text-dourado border border-preto flex items-center justify-center transition-colors duration-200"
      >
        <MessageSquare className="w-6 h-6" strokeWidth={1.5} />
      </a>
    </div>
  );
};
