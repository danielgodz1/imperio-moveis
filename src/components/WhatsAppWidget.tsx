import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { getWhatsAppUrl, playWoodChimeSound } from '../utils/helpers';

export const WhatsAppWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    {
      label: '📐 Solicitar Orçamento Sob Medida',
      msg: 'Olá! Vim pelo site da Império Móveis e gostaria de solicitar um orçamento para meu imóvel em Jaú.'
    },
    {
      label: '🪵 Dúvidas sobre Materiais & MDF',
      msg: 'Olá! Gostaria de tirar dúvidas sobre acabamentos, MDF naval e ferragens para meu projeto.'
    },
    {
      label: '🏢 Agendar Visita ao Showroom em Jaú',
      msg: 'Olá! Gostaria de agendar uma visita ao showroom da Império Móveis no Jardim Itamarati em Jaú.'
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Popover Card */}
      {isOpen && (
        <div className="mb-3 w-80 bg-white border border-[#ddd7cd] rounded-2xl p-4 shadow-wood-lg animate-in slide-in-from-bottom-4 duration-200">
          
          <div className="flex items-center justify-between border-b border-[#ddd7cd] pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#006229] text-white flex items-center justify-center">
                <MessageSquare className="w-4 h-4 fill-white" />
              </div>
              <div>
                <h4 className="font-serif-atelier text-sm font-bold text-[#1d1b19]">Império Móveis</h4>
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Online em Jaú • Resposta Rápida
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-[#81756b] hover:text-[#1d1b19] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-[#4f453c] mb-3">
            Olá! Como podemos te ajudar com seu projeto sob medida hoje?
          </p>

          <div className="space-y-2">
            {options.map((opt, idx) => (
              <a
                key={idx}
                href={getWhatsAppUrl(opt.msg)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  playWoodChimeSound();
                  setIsOpen(false);
                }}
                className="w-full text-left p-2.5 rounded-xl border border-[#ddd7cd] bg-[#f8f2ef] hover:bg-[#52371c] hover:text-white hover:border-[#52371c] text-xs font-semibold transition-all block cursor-pointer"
              >
                {opt.label}
              </a>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-[#ddd7cd] text-[10px] text-[#81756b] text-center">
            Atendimento direto com projetista técnico de Jaú
          </div>

        </div>
      )}

      {/* Floating Main Button restyled in Brass Gold (#c9a04e) */}
      <button
        onClick={() => {
          playWoodChimeSound();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-3 px-4.5 py-3.5 rounded-full bg-[#c9a04e] hover:bg-[#d8af5c] text-[#15100c] shadow-[0_16px_36px_rgba(201,160,78,0.35)] transition-all duration-300 group cursor-pointer border border-[#f2e8d8]/30"
        aria-label="Fale com o Projetista no WhatsApp"
      >
        <div className="relative flex items-center justify-center">
          <MessageSquare className="w-5 h-5 fill-[#15100c] text-[#15100c]" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#15100c] animate-ping" />
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-[10px] uppercase tracking-wider text-[#15100c]/80 leading-tight font-extrabold">
            Online em Jaú
          </span>
          <span className="text-xs text-[#15100c] font-bold leading-tight">
            Fale com o Projetista
          </span>
        </div>
      </button>

    </div>
  );
};
