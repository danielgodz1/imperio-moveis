import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Filtro SVG global para o leve tremor da linha de lápis de marceneiro
 * (baseFrequency 0.02, scale 1.5 — aplicado apenas no traço).
 */
export const FiltroLapis: React.FC = () => (
  <svg
    aria-hidden="true"
    className="fixed w-0 h-0 pointer-events-none overflow-hidden"
  >
    <defs>
      <filter id="traco-lapis" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.02"
          numOctaves={2}
          result="ruidoLapis"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="ruidoLapis"
          scale={1.5}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
      <filter id="filtro-lapis" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.02"
          numOctaves={2}
          result="ruidoLapis2"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="ruidoLapis2"
          scale={1.5}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
);

export const LinhaLapis: React.FC = () => {
  const pathDesktopRef = useRef<SVGPathElement>(null);
  const barraMobileRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReduced) {
        if (pathDesktopRef.current) {
          gsap.set(pathDesktopRef.current, { strokeDashoffset: 0 });
        }
        if (barraMobileRef.current) {
          gsap.set(barraMobileRef.current, { scaleX: 1 });
        }
        return;
      }

      if (pathDesktopRef.current) {
        gsap.fromTo(
          pathDesktopRef.current,
          { strokeDashoffset: 1000 },
          {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: {
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.2,
            },
          }
        );
      }

      if (barraMobileRef.current) {
        gsap.fromTo(
          barraMobileRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              start: 'top top',
              end: 'bottom bottom',
              scrub: 0.2,
            },
          }
        );
      }

      // Troca de cor (--grafite sobre papel, --dourado no traço de lápis sobre seções --preto)
      const secoesNoite = document.querySelectorAll('[data-tema="noite"]');
      secoesNoite.forEach((secao) => {
        ScrollTrigger.create({
          trigger: secao,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => {
            if (containerRef.current) {
              containerRef.current.setAttribute(
                'data-modo',
                self.isActive ? 'noite' : 'dia'
              );
            }
          },
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      data-modo="noite"
      aria-hidden="true"
      className="hidden lg:block pointer-events-none fixed z-40 group"
    >
      {/* Desktop: linha de lápis vertical na margem esquerda */}
      <div className="fixed top-0 left-3 h-screen w-3 z-40">
        <svg
          viewBox="0 0 12 1000"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          {/* Guia sutil de fundo */}
          <path
            d="M 6 24 L 6 976"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-grafite/15 group-data-[modo=noite]:text-dourado/20 transition-colors duration-300"
          />
          {/* Traço de lápis preenchido conforme rolagem */}
          <path
            ref={pathDesktopRef}
            d="M 6 24 L 6 976"
            pathLength={1000}
            strokeDasharray={1000}
            strokeDashoffset={1000}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            filter="url(#traco-lapis)"
            className="text-grafite group-data-[modo=noite]:text-dourado transition-colors duration-300"
          />
        </svg>
      </div>
    </div>
  );
};
