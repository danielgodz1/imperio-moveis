import React from 'react';
import { Camera, MessageSquare, Sparkles } from 'lucide-react';
import { Foto } from '../Foto';
import { getWhatsAppUrl, trackWhatsAppClick } from '../../utils/helpers';
import { scrollToTarget } from '../../hooks/useScrollytelling';

interface HeroScrollFallbackProps {
  onNavigateContact?: () => void;
}

/**
 * Fallback estático da experiência Hero.
 * Exibido quando prefers-reduced-motion está ativo ou quando o dispositivo
 * não possui suporte a WebGL/hardware 3D, garantindo CLS 0, SEO intacto
 * e altura natural sem área de rolagem vazia de 300vh.
 */
export const HeroScrollFallback: React.FC<HeroScrollFallbackProps> = ({
  onNavigateContact,
}) => {
  return (
    <div className="relative w-full overflow-hidden pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-20 border-b border-[#251d18]">
      {/* Brilho radial quente de fundo */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 right-[5%] -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none opacity-60 z-0"
        style={{
          background:
            'radial-gradient(circle, rgba(201, 160, 78, 0.22) 0%, rgba(201, 160, 78, 0.05) 50%, transparent 70%)',
        }}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Coluna Esquerda: Texto + CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start space-y-6 sm:space-y-7">
            <div className="inline-flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#c9a04e] shadow-[0_0_8px_rgba(201,160,78,0.8)]" />
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#c9a04e] uppercase">
                MARCENARIA E ARQUITETURA — JAÚ E REGIÃO
              </span>
            </div>

            <h1 className="font-serif-atelier font-bold text-[#f2e8d8] text-[clamp(2.85rem,6.2vw,5.8rem)] leading-[0.98] tracking-tight">
              <span className="block">Arquitetura e</span>
              <span className="block">marcenaria na</span>
              <span className="block italic text-[#c9a04e] font-normal font-serif mt-1">
                mesma mesa.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#f2e8d8]/85 leading-relaxed max-w-xl font-light">
              A Tatiane projeta, o Wellington fabrica. Cozinhas, quartos, closets e lojas em Jaú e região com precisão milimétrica desde 2015.
            </p>

            {/* CTAs comerciais */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-3.5 w-full pt-2">
              {onNavigateContact ? (
                <button
                  type="button"
                  onClick={onNavigateContact}
                  className="inline-flex items-center justify-center gap-2.5 px-7 sm:px-8 py-4 rounded-xl bg-[#c9a04e] hover:bg-[#d8af5c] text-[#15100c] text-xs font-bold uppercase tracking-widest transition-all duration-200 shadow-[0_12px_28px_rgba(201,160,78,0.28)] hover:scale-[1.02] cursor-pointer"
                >
                  <span>Pedir orçamento</span>
                  <span className="text-sm font-semibold">↗</span>
                </button>
              ) : (
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppClick('hero_cta')}
                  className="inline-flex items-center justify-center gap-2.5 px-7 sm:px-8 py-4 rounded-xl bg-[#c9a04e] hover:bg-[#d8af5c] text-[#15100c] text-xs font-bold uppercase tracking-widest transition-all duration-200 shadow-[0_12px_28px_rgba(201,160,78,0.28)] hover:scale-[1.02] cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chamar no WhatsApp</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => scrollToTarget('#obras', -80)}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-4 rounded-xl border border-[#f2e8d8]/30 hover:border-[#c9a04e] text-[#f2e8d8] hover:text-[#c9a04e] text-xs font-semibold uppercase tracking-wider transition-all duration-200 hover:bg-[#c9a04e]/10 cursor-pointer"
              >
                <span>Ver as obras</span>
              </button>

              <a
                href="https://www.instagram.com/imperio.moveis.jau"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-xl border border-[#c9a04e]/40 bg-[#1d1612]/80 hover:border-[#c9a04e] text-[#f2e8d8] hover:text-[#c9a04e] text-xs font-semibold tracking-wider transition-all duration-200 hover:bg-[#c9a04e]/10"
                title="Siga @imperio.moveis.jau no Instagram"
              >
                <Camera className="w-4 h-4 text-[#c9a04e]" />
                <span>@imperio.moveis.jau</span>
              </a>
            </div>
          </div>

          {/* Coluna Direita: Fotografia Real do Dormitório Executado */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[560px] aspect-[4/3] sm:aspect-[16/11] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#c9a04e]/40 shadow-[0_24px_60px_rgba(0,0,0,0.85)] bg-[#1d1612]">
              <Foto
                srcBase="/obras/dormitorio-led-1"
                alt="Dormitório planejado com guarda-roupa iluminado por LED, executado pela Império Móveis Planejados em Jaú"
                prioridade
                sizes="(min-width: 1024px) 560px, 95vw"
                className="w-full h-full"
                imgStyle={{ objectFit: 'cover' }}
              />

              {/* Degradê na base para legenda */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#15100c]/90 via-transparent to-transparent pointer-events-none"
              />

              <div className="absolute bottom-4 left-5 right-5 z-20 flex items-center justify-between text-[#f2e8d8] text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#c9a04e]" />
                    <p className="font-serif-atelier font-semibold text-sm text-[#f2e8d8]">
                      Dormitório Master com LED
                    </p>
                  </div>
                  <p className="text-[11px] text-[#c9a04e]">
                    Guarda-roupa sob medida &bull; Executado em Jaú/SP
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] uppercase font-mono tracking-wider border border-[#c9a04e]/40 text-[#c9a04e]">
                  Obra Real
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

