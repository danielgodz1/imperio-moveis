import React from 'react';
import { MessageSquare } from 'lucide-react';
import { getWhatsAppUrl } from '../utils/helpers';

/**
 * Botão flutuante do WhatsApp (único círculo completo permitido pelo DESIGN.md).
 */
export const WhatsAppWidget: React.FC = () => {
  return (
    <div className="fixed bottom-24 right-24 z-40">
      <a
        href={getWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chamar no WhatsApp"
        title="Chamar no WhatsApp"
        className="w-14 h-14 rounded-full bg-dourado text-preto hover:bg-preto hover:text-dourado border border-preto flex items-center justify-center transition-colors duration-200"
      >
        <MessageSquare className="w-6 h-6" strokeWidth={1.5} />
      </a>
    </div>
  );
};
