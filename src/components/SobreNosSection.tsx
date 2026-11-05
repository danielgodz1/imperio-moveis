import React from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, Ruler, Award, Calendar } from 'lucide-react';
import { playWoodChimeSound, getWhatsAppUrl } from '../utils/helpers';

interface SobreNosSectionProps {
  onOpenBooking: () => void;
}

export const SobreNosSection: React.FC<SobreNosSectionProps> = ({ onOpenBooking }) => {
  return (
    <section id="sobre-nos" className="w-full py-16 lg:py-24 bg-[#f8f2ef] border-b border-[#ddd7cd]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Visual Column (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-wood-lg bg-[#e7e1de] aspect-[4/5] border border-[#ddd7cd] group">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDor5bd2hxM8GG03YC255wo6k9ay2ur42Q_aLkoZ58EkItjn7-9eu54Lrf3Zk4OkQU8BWhIySm-m3fvojzEvslpQE32ojeh84LsYevYfQED1SeQmRS6BldVngHlc-wljJTI4hauwbSLUwGORbeK7bMS9qxviuZZR0eAW0bekCi2B7a0G4yOeOsRan7T1lOoWG1OtlILxyInYu6wumSIFIf1-PeOmOdewFga1lWxjMM"
                alt="Marcenaria Império Móveis Planejados em Jaú"
                className="gsap-parallax-img w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              
              {/* Badge Overlay */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-[#fef8f4]/95 backdrop-blur-md shadow-wood-md border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#52371c] text-[#fef8f4] flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-[#c5a059]" />
                  </div>
                  <div>
                    <p className="font-serif-atelier text-base font-bold text-[#1d1b19]">
                      Fabricação Própria em Jaú
                    </p>
                    <p className="text-xs text-[#4f453c]">
                      Controle total de cada corte, fita de borda e ajuste milimétrico.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Text Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            
            <div className="gsap-reveal inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#775a19] font-bold">
              <span>Tradição & Compromisso</span>
              <span className="text-[#d3c4b9]">•</span>
              <span>Jaú e Região</span>
            </div>

            <h2 className="gsap-reveal font-serif-atelier text-3xl sm:text-4xl text-[#1d1b19] font-semibold leading-tight">
              Móveis Planejados com Alma e Precisão Artesanal em Jaú
            </h2>

            <div className="gsap-reveal space-y-4 text-base text-[#4f453c] leading-relaxed">
              <p>
                Há mais de uma década transformando lares em Jaú e região, a <strong>Império Móveis Planejados</strong> une marcenaria de alto padrão, atendimento próximo e projetos desenhados para o estilo de vida de cada família.
              </p>
              <p>
                Na Império, cada projeto começa com uma medição detalhada e uma conversa sobre como você realmente usa sua casa — garantindo móveis de verdade: sob medida, com acabamento impecável e prazo rigorosamente cumprido.
              </p>
            </div>

            {/* Pilares de Valor (Grid 2x2) with GSAP Stagger */}
            <div className="gsap-stagger-parent grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              
              <div className="gsap-stagger-child p-4 rounded-xl bg-[#f3ede9] border border-[#ddd7cd] flex items-start gap-3.5 shadow-sm">
                <div className="p-2 rounded-lg bg-white text-[#52371c] shrink-0 border border-[#ddd7cd]">
                  <Ruler className="w-5 h-5 text-[#c5a059]" />
                </div>
                <div>
                  <h4 className="font-serif-atelier text-base font-bold text-[#1d1b19] mb-1">
                    1. Projeto 3D Realista
                  </h4>
                  <p className="text-xs text-[#4f453c] leading-relaxed">
                    Visualize seu ambiente renderizado em alta definição antes de cortar a primeira chapa.
                  </p>
                </div>
              </div>

              <div className="gsap-stagger-child p-4 rounded-xl bg-[#f3ede9] border border-[#ddd7cd] flex items-start gap-3.5 shadow-sm">
                <div className="p-2 rounded-lg bg-white text-[#52371c] shrink-0 border border-[#ddd7cd]">
                  <ShieldCheck className="w-5 h-5 text-[#c5a059]" />
                </div>
                <div>
                  <h4 className="font-serif-atelier text-base font-bold text-[#1d1b19] mb-1">
                    2. MDF Certificado
                  </h4>
                  <p className="text-xs text-[#4f453c] leading-relaxed">
                    Chapas de alta densidade e resistência à umidade das melhores marcas do mercado nacional.
                  </p>
                </div>
              </div>

              <div className="gsap-stagger-child p-4 rounded-xl bg-[#f3ede9] border border-[#ddd7cd] flex items-start gap-3.5 shadow-sm">
                <div className="p-2 rounded-lg bg-white text-[#52371c] shrink-0 border border-[#ddd7cd]">
                  <Sparkles className="w-5 h-5 text-[#c5a059]" />
                </div>
                <div>
                  <h4 className="font-serif-atelier text-base font-bold text-[#1d1b19] mb-1">
                    3. Ferragens de Precisão
                  </h4>
                  <p className="text-xs text-[#4f453c] leading-relaxed">
                    Dobradiças e corrediças telescópicas com amortecimento suave que duram décadas.
                  </p>
                </div>
              </div>

              <div className="gsap-stagger-child p-4 rounded-xl bg-[#f3ede9] border border-[#ddd7cd] flex items-start gap-3.5 shadow-sm">
                <div className="p-2 rounded-lg bg-white text-[#52371c] shrink-0 border border-[#ddd7cd]">
                  <CheckCircle2 className="w-5 h-5 text-[#c5a059]" />
                </div>
                <div>
                  <h4 className="font-serif-atelier text-base font-bold text-[#1d1b19] mb-1">
                    4. Montagem Cuidadosa
                  </h4>
                  <p className="text-xs text-[#4f453c] leading-relaxed">
                    Equipe própria com protocolo de montagem silenciosa, limpeza completa e checagem final.
                  </p>
                </div>
              </div>

            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  playWoodChimeSound();
                  onOpenBooking();
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#52371c] hover:bg-[#32302e] text-white transition-all text-xs uppercase tracking-wider font-semibold shadow-wood-sm cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#c5a059]" />
                <span>Agendar Consulta com Projetista</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
