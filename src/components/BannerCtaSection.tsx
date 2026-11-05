import React, { useEffect, useRef } from 'react';
import { Phone, MessageSquare, Sparkles } from 'lucide-react';
import { playWoodChimeSound, getWhatsAppUrl } from '../utils/helpers';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface BannerCtaSectionProps {
  onNavigateContact: () => void;
}

export const BannerCtaSection: React.FC<BannerCtaSectionProps> = ({ onNavigateContact }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const wordsContainerRef = useRef<HTMLHeadingElement>(null);
  const magneticButtonRef = useRef<HTMLButtonElement>(null);

  const headline = 'Pronto para transformar sua casa com marcenaria sob medida de alto padrão em Jaú?';
  const words = headline.split(' ');

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // 1. Scrubbed Word-by-Word Reveal on Scroll
      const wordElements = wordsContainerRef.current?.querySelectorAll('.cta-word');
      if (wordElements && wordElements.length > 0) {
        gsap.fromTo(
          wordElements,
          { opacity: 0.2, y: 10 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.05,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              end: 'center 45%',
              scrub: 0.8,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // 2. Magnetic Effect on Quote Button
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = magneticButtonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(btn, {
      x: x * 0.35,
      y: y * 0.35,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    const btn = magneticButtonRef.current;
    if (!btn) return;
    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.4)',
    });
  };

  return (
    <section
      ref={sectionRef}
      className="w-full py-20 lg:py-28 bg-[#52371c] text-white relative overflow-hidden border-t border-[#775a19]/40"
    >
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c5a059]/12 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#c5a059]/8 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
          
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#fed488] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#fed488]" />
              Marcenaria de Alto Padrão em Jaú & Região
            </span>

            {/* Scrubbed Word-by-Word Title */}
            <h2
              ref={wordsContainerRef}
              className="font-serif-atelier text-3xl sm:text-4xl lg:text-5xl text-white font-semibold leading-tight flex flex-wrap gap-x-2.5 gap-y-1 justify-center lg:justify-start"
            >
              {words.map((word, idx) => (
                <span
                  key={idx}
                  className="cta-word inline-block will-change-transform opacity-20"
                >
                  {word}
                </span>
              ))}
            </h2>

            <p className="text-sm sm:text-base text-[#ffdcbf] leading-relaxed max-w-xl">
              Agende hoje uma medição sem custo em Jaú e receba seu projeto 3D fotorrealista personalizado com consultoria técnica de quem fabrica na própria cidade.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto">
            {/* Magnetic CTA Button */}
            <button
              ref={magneticButtonRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => {
                playWoodChimeSound();
                onNavigateContact();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-5 rounded-xl bg-[#fed488] hover:bg-white text-[#261900] transition-colors text-xs font-bold uppercase tracking-widest shadow-[0_12px_28px_rgba(0,0,0,0.25)] will-change-transform cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-[#261900]" />
              <span>Solicitar Orçamento Gratuito</span>
            </button>

            <a
              href="tel:+5514998492834"
              onClick={playWoodChimeSound}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-5 rounded-xl bg-[#6c4e31] text-white hover:bg-white/15 transition-colors text-xs font-semibold uppercase tracking-wider border border-white/20"
            >
              <Phone className="w-4 h-4 text-[#fed488]" />
              <span>(14) 99849-2834</span>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
};
