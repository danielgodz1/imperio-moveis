import React from 'react';
import { MapPin, Clock, ExternalLink, Calendar, Compass, Phone } from 'lucide-react';
import { playWoodChimeSound, getWhatsAppUrl } from '../utils/helpers';

interface WorkshopLocationProps {
  onOpenVisitBooking: () => void;
}

export const WorkshopLocation: React.FC<WorkshopLocationProps> = ({ onOpenVisitBooking }) => {
  return (
    <section id="oficina" className="w-full py-16 lg:py-24 bg-[#f8f2ef] border-b border-[#ddd7cd]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Text & Local Details (Desktop 6 cols) */}
          <div className="lg:col-span-6 flex flex-col space-y-6">
            
            <div className="gsap-reveal inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#775a19] font-bold">
              <span>Presença Física em Jaú</span>
              <span className="text-[#d3c4b9]">•</span>
              <span>Showroom & Oficina</span>
            </div>

            <h2 className="gsap-reveal font-serif-atelier text-3xl sm:text-4xl text-[#1d1b19] font-semibold">
              Onde Estamos: Marcenaria Própria em Jaú/SP
            </h2>

            <p className="gsap-reveal text-sm sm:text-base text-[#4f453c] leading-relaxed">
              Visite nosso espaço para conferir mostruários reais de MDF, lâminas naturais, espelhos reflecta e as melhores ferragens europeias com amortecimento.
            </p>

            <div className="space-y-4 pt-2">
              
              {/* Endereço */}
              <div className="gsap-reveal flex items-start gap-3 p-4 rounded-xl bg-[#f3ede9] border border-[#ddd7cd]">
                <MapPin className="w-6 h-6 text-[#775a19] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-serif-atelier text-base font-bold text-[#1d1b19]">
                    Endereço do Ateliê & Showroom
                  </p>
                  <p className="text-xs text-[#4f453c] leading-relaxed">
                    R. Doná Djanira Werneck de Almeida e Silva, 280 - Jardim Itamarati, Jaú - SP, 17209-450
                  </p>
                </div>
              </div>

              {/* Horários & Cidades */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#f3ede9] border border-[#ddd7cd] space-y-1">
                  <span className="text-xs uppercase tracking-wider text-[#81756b] font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
                    Horários
                  </span>
                  <p className="text-xs text-[#1d1b19] font-bold">Segunda a Sexta: 08h às 18h</p>
                  <p className="text-xs text-[#4f453c]">Sábados: 08h às 12h</p>
                </div>

                <div className="p-4 rounded-xl bg-[#f3ede9] border border-[#ddd7cd] space-y-1">
                  <span className="text-xs uppercase tracking-wider text-[#81756b] font-bold flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#c5a059]" />
                    Região Atendida
                  </span>
                  <p className="text-xs text-[#1d1b19] font-bold">Jaú e cidades vizinhas</p>
                  <p className="text-xs text-[#4f453c]">Bauru, Barra Bonita, Itaju, Dois Córregos e região.</p>
                </div>
              </div>

            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <a
                href="https://share.google/aSjoGjafHAMz8qsOe"
                target="_blank"
                rel="noopener noreferrer"
                onClick={playWoodChimeSound}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#775a19] hover:bg-[#c5a059] text-white transition-all text-xs uppercase tracking-wider font-bold shadow-wood-sm"
              >
                <MapPin className="w-4 h-4" />
                <span>Abrir no Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => {
                  playWoodChimeSound();
                  onOpenVisitBooking();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#f3ede9] hover:bg-[#ede7e3] text-[#52371c] transition-colors text-xs uppercase tracking-wider font-semibold border border-[#ddd7cd] cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#c5a059]" />
                <span>Agendar Visita ao Showroom</span>
              </button>
            </div>

          </div>

          {/* Map Snippet Box (Desktop 6 cols) */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden shadow-wood-lg bg-[#f3ede9] border border-[#ddd7cd] relative">
              <iframe
                className="w-full h-[400px] border-0"
                src="https://maps.google.com/maps?q=R.+Don%C3%A1+Djanira+Werneck+de+Almeida+e+Silva%2C+280+-+Jardim+Itamarati%2C+Ja%C3%BA+-+SP%2C+17209-450&t=&z=16&ie=UTF8&iwloc=&output=embed"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização Império Móveis Planejados Jaú"
              />

              {/* Floating Overlay Badge */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-[#fef8f4]/95 backdrop-blur-md shadow-wood-md border border-[#ddd7cd] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#fed488] text-[#785a1a] flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5 text-[#785a1a]" />
                  </div>
                  <div>
                    <p className="font-serif-atelier text-sm font-bold text-[#1d1b19]">
                      Império Móveis Planejados
                    </p>
                    <p className="text-[11px] text-[#4f453c]">
                      Jaú, SP • Atendimento local prioritário
                    </p>
                  </div>
                </div>

                <a
                  href="https://share.google/aSjoGjafHAMz8qsOe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-[#f3ede9] hover:bg-[#52371c] hover:text-white transition-colors text-[#52371c]"
                  title="Traçar Rota"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
