import React, { useEffect, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const ProcessoSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const steps = [
    {
      num: '01',
      title: 'Visita & Medição Técnica',
      desc: 'Vamos até o seu imóvel em Jaú e região para coletar medidas milimétricas, entender a rotina da sua família e alinhar prioridades.',
      badge: 'Sem custo e sem compromisso'
    },
    {
      num: '02',
      title: 'Projeto 3D Personalizado',
      desc: 'Desenvolvemos a maquete tridimensional com texturas fiéis, disposições ergonômicas e iluminação para aprovação conjunta.',
      badge: 'Ajustes até sua aprovação'
    },
    {
      num: '03',
      title: 'Fabricação de Precisão',
      desc: 'Seu projeto entra na nossa oficina com maquinário de corte digital, fitamento térmico e seleção de ferragens amortecidas.',
      badge: 'Matéria-prima 100% MDF'
    },
    {
      num: '04',
      title: 'Instalação & Limpeza',
      desc: 'Equipe própria de montadores experientes realiza a instalação com isolamento do local, deixando o ambiente impecável e pronto para uso.',
      badge: 'Garantia contratual documentada'
    }
  ];

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReduced) return;

      // Golden ruler progress fill across the steps on desktop
      if (progressBarRef.current) {
        gsap.fromTo(
          progressBarRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: '.steps-grid-container',
              start: 'top 75%',
              end: 'bottom 60%',
              scrub: 0.8,
            },
          }
        );
      }

      // Step cards staggered entrance
      const stepCards = document.querySelectorAll('.step-card-box');
      gsap.fromTo(
        stepCards,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.14,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.steps-grid-container',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full py-16 lg:py-24 bg-[#fef8f4] border-b border-[#ddd7cd] relative">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-col space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#775a19] font-bold">
            <span>Como Funciona</span>
            <span className="text-[#d3c4b9]">•</span>
            <span>Do Esboço à Chave</span>
          </div>
          <h2 className="font-serif-atelier text-3xl sm:text-4xl text-[#1d1b19] font-semibold">
            Nosso Processo Sob Medida em 4 Etapas
          </h2>
          <p className="text-sm sm:text-base text-[#4f453c] leading-relaxed">
            Sem imprevistos, sem atrasos. Um método estruturado para transformar seu sonho em realidade com segurança e tranquilidade.
          </p>
        </div>

        {/* 4 Steps Grid with connecting golden ruler */}
        <div className="steps-grid-container relative">
          
          {/* Connecting Ruler Track on Desktop */}
          <div className="hidden lg:block absolute top-12 left-8 right-8 h-[2px] bg-[#ddd7cd] z-0">
            <div
              ref={progressBarRef}
              className="h-full bg-[#c5a059] origin-left scale-x-0 will-change-transform"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {steps.map((step) => (
              <div
                key={step.num}
                className="step-card-box p-6 rounded-2xl bg-[#f3ede9] border border-[#ddd7cd] flex flex-col justify-between space-y-6 shadow-wood-sm hover:shadow-wood-md hover:border-[#c5a059] transition-all duration-300 group"
              >
                <div className="space-y-4">
                  <span className="font-serif-atelier text-4xl text-[#775a19]/50 font-bold leading-none block group-hover:text-[#c5a059] group-hover:scale-105 transition-all">
                    {step.num}
                  </span>
                  <div className="space-y-2">
                    <h3 className="font-serif-atelier text-lg text-[#1d1b19] font-semibold">
                      {step.title}
                    </h3>
                    <p className="text-xs text-[#4f453c] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 text-[#52371c] text-xs font-semibold pt-2 border-t border-[#ddd7cd]/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{step.badge}</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
