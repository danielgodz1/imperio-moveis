import React from 'react';
import { MapPin, Phone, Clock, ShieldCheck, ChevronRight, MessageSquare, Camera } from 'lucide-react';
import { getWhatsAppUrl, playWoodChimeSound } from '../utils/helpers';
import { scrollToTarget } from '../hooks/useScrollytelling';

interface FooterProps {
  onNavigateContact: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateContact }) => {
  return (
    <footer className="w-full bg-[#f8f2ef] text-[#4f453c] text-xs border-t border-[#ddd7cd]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img
                src="https://instagram.fbau1-1.fna.fbcdn.net/v/t51.82787-19/881676383_18027770813870048_1008026097534673996_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=111&_nc_map=urlgen_bucketless&ig_cache_key=GF9QjTTg73N7KQxAAEyk4BtlOv0NbmNDAQAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=bYmoz-fD-60Q7kNvwHzGbxo&_nc_oc=Adp7wtGW7XFZEoX3MiRK6WIk1iMJl57gSivbvXCo5dipQuMb_JwFeW93tTLo-HQn14AcfMlh2pVmxaO40rjQ1qrL&_nc_zt=24&_nc_ht=instagram.fbau1-1.fna&_nc_gid=vbgtSlQvxHdbkAfyRDHUlg&_nc_ss=7b6a8&oh=00_AQTKbfEuZzYYl6BEyJOLw8m93xZc9td-yOU_Mt6_EL6hfQ&oe=6AF1CE87"
                alt="Império Móveis Planejados Logo"
                className="h-10 w-10 object-cover rounded-lg shadow-sm border border-[#ddd7cd] bg-white"
              />
              <span className="font-serif-atelier text-xl font-bold text-[#52371c]">
                IMPÉRIO
              </span>
            </div>

            <p className="text-xs text-[#4f453c] leading-relaxed">
              Marcenaria sob medida de alto padrão em Jaú e região central de São Paulo. Precisão milimétrica, ferragens nobres e compromisso arquitetônico em cada detalhe.
            </p>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#f3ede9] border border-[#ddd7cd]">
              <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
              <span className="text-[11px] font-bold text-[#1d1b19] uppercase tracking-wider">
                Garantia & Montagem Própria
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/imperio.moveis.jau/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={playWoodChimeSound}
                className="w-9 h-9 rounded-full bg-[#f3ede9] border border-[#ddd7cd] flex items-center justify-center hover:bg-[#52371c] hover:text-white transition-colors"
                title="Instagram"
              >
                <Camera className="w-4 h-4" />
              </a>
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={playWoodChimeSound}
                className="w-9 h-9 rounded-full bg-[#f3ede9] border border-[#ddd7cd] flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors"
                title="WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Ambientes Column */}
          <div className="flex flex-col gap-3">
            <h3 className="font-serif-atelier text-base font-bold text-[#1d1b19] mb-1">
              Ambientes Planejados
            </h3>
            <ul className="flex flex-col gap-2">
              {[
                { label: 'Cozinhas Planejadas', id: 'ambientes' },
                { label: 'Quartos & Suítes', id: 'ambientes' },
                { label: 'Closets Sob Medida', id: 'ambientes' },
                { label: 'Salas & Home Theater', id: 'ambientes' },
                { label: 'Home Office Executivo', id: 'ambientes' },
                { label: 'Lavanderias Inteligentes', id: 'ambientes' },
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-[#81756b]" />
                  <button
                    onClick={() => {
                      playWoodChimeSound();
                      scrollToTarget(`#${item.id}`, -80);
                    }}
                    className="hover:text-[#52371c] transition-colors cursor-pointer text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Institucional Column */}
          <div className="flex flex-col gap-3">
            <h3 className="font-serif-atelier text-base font-bold text-[#1d1b19] mb-1">
              Institucional
            </h3>
            <ul className="flex flex-col gap-2">
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#81756b]" />
                <button
                  onClick={() => {
                    playWoodChimeSound();
                    scrollToTarget('#sobre-nos', -80);
                  }}
                  className="hover:text-[#52371c] transition-colors cursor-pointer"
                >
                  Sobre a Império
                </button>
              </li>

              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#81756b]" />
                <button
                  onClick={() => {
                    playWoodChimeSound();
                    scrollToTarget('#projetos', -80);
                  }}
                  className="hover:text-[#52371c] transition-colors cursor-pointer"
                >
                  Projetos Autorais
                </button>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#81756b]" />
                <button
                  onClick={() => {
                    playWoodChimeSound();
                    scrollToTarget('#avaliacoes', -80);
                  }}
                  className="hover:text-[#52371c] transition-colors cursor-pointer"
                >
                  Depoimentos no Google
                </button>
              </li>
              <li className="flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#81756b]" />
                <button
                  onClick={() => {
                    playWoodChimeSound();
                    onNavigateContact();
                  }}
                  className="hover:text-[#52371c] transition-colors cursor-pointer font-bold text-[#52371c]"
                >
                  Solicitar Cotação
                </button>
              </li>
            </ul>
          </div>

          {/* Atendimento Local Column */}
          <div className="flex flex-col gap-3">
            <h3 className="font-serif-atelier text-base font-bold text-[#1d1b19] mb-1">
              Atendimento Local
            </h3>
            
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-[#1d1b19]">Jardim Itamarati, Jaú - SP</p>
                <p className="text-[11px] text-[#4f453c]">R. Doná Djanira Werneck de Almeida e Silva, 280</p>
                <p className="text-[10px] text-[#81756b]">Atendimento e Showroom sob agendamento</p>
                <a
                  href="https://share.google/aSjoGjafHAMz8qsOe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#52371c] hover:underline font-bold inline-block mt-0.5"
                >
                  Ver no Google Maps →
                </a>
              </div>
            </div>

            <div className="flex items-start gap-2.5 mt-2">
              <Clock className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#1d1b19]">Horário de Funcionamento</p>
                <p className="text-[11px]">Seg à Sex: 08h às 18h</p>
                <p className="text-[11px]">Sábados: 08h às 12h</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 mt-2">
              <Phone className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#1d1b19]">Central Telefônica</p>
                <p className="text-[11px] font-mono font-bold">(14) 99849-2834</p>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-[#f3ede9] py-6 border-t border-[#ddd7cd]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#81756b] text-center md:text-left">
          <p>© 2025 Império Móveis Planejados Jaú. Todos os direitos reservados. Marcenaria sob medida de alto padrão.</p>
          <div className="flex items-center gap-6">
            <span>Privacidade</span>
            <span>•</span>
            <span>Termos de Uso</span>
            <span>•</span>
            <span className="font-bold text-[#52371c]">Jaú / SP</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
