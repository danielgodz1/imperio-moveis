import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const CraftsmanshipScrollyLayer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Outer containers for scroll-scrub translation
  const drillRef = useRef<HTMLDivElement>(null);
  const squareRef = useRef<HTMLDivElement>(null);
  const pencilRef = useRef<HTMLDivElement>(null);
  const shaving1Ref = useRef<HTMLDivElement>(null);
  const shaving2Ref = useRef<HTMLDivElement>(null);

  // Inner containers for organic "breathing" hover animation (repeat: -1, yoyo: true)
  const drillInnerRef = useRef<HTMLDivElement>(null);
  const squareInnerRef = useRef<HTMLDivElement>(null);
  const pencilInnerRef = useRef<HTMLDivElement>(null);
  const shaving1InnerRef = useRef<HTMLDivElement>(null);
  const shaving2InnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    const ctx = gsap.context(() => {
      // =========================================================================
      // 1. GENTLE "BREATHING" HOVER EFFECT (repeat: -1, yoyo: true, ease: sine.inOut)
      // =========================================================================

      // Parafusadeira: Gentle rhythmic floating hover
      if (drillInnerRef.current) {
        gsap.to(drillInnerRef.current, {
          y: -14,
          x: 4,
          rotation: 3,
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      // Esquadro de marceneiro: Floating breathing sway
      if (squareInnerRef.current) {
        gsap.to(squareInnerRef.current, {
          y: 16,
          x: -3,
          rotation: -4,
          duration: 3.8,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 0.5,
        });
      }

      // Lápis de marceneiro: Subtle micro-hover
      if (pencilInnerRef.current) {
        gsap.to(pencilInnerRef.current, {
          y: -10,
          rotation: 2.5,
          duration: 4.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 0.8,
        });
      }

      // Fitas de madeira Freijó/Nogueira: Organic breathing & expansion
      if (shaving1InnerRef.current) {
        gsap.to(shaving1InnerRef.current, {
          y: -12,
          scale: 1.07,
          rotation: 6,
          duration: 4.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      if (shaving2InnerRef.current) {
        gsap.to(shaving2InnerRef.current, {
          y: 14,
          scale: 1.05,
          rotation: -8,
          duration: 5.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 0.6,
        });
      }

      // =========================================================================
      // 2. SCROLL-TRIGGERED PROGRESSION & GLIDE (Desktop)
      // =========================================================================

      // Parafusadeira: glides along the right viewport as user explores
      if (drillRef.current && !isMobile) {
        gsap.fromTo(
          drillRef.current,
          { y: 60, rotation: -12, opacity: 0.85 },
          {
            y: 650,
            rotation: 26,
            opacity: 0.95,
            ease: 'none',
            scrollTrigger: {
              trigger: document.body,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1.5,
            },
          }
        );
      }

      // Esquadro de Marceneiro: tilts and descends down the left side
      if (squareRef.current && !isMobile) {
        gsap.fromTo(
          squareRef.current,
          { y: 130, rotation: 8, opacity: 0.75 },
          {
            y: 800,
            rotation: -22,
            opacity: 0.9,
            ease: 'none',
            scrollTrigger: {
              trigger: document.body,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 2,
            },
          }
        );
      }

      // Lápis de Marceneiro
      if (pencilRef.current && !isMobile) {
        gsap.fromTo(
          pencilRef.current,
          { y: 320, rotation: -35, opacity: 0.6 },
          {
            y: 1100,
            rotation: -10,
            opacity: 0.85,
            ease: 'none',
            scrollTrigger: {
              trigger: document.body,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1.8,
            },
          }
        );
      }

      // Fitas de Madeira
      if (shaving1Ref.current) {
        gsap.to(shaving1Ref.current, {
          y: isMobile ? 300 : 750,
          rotation: 45,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 2.2,
          },
        });
      }

      if (shaving2Ref.current) {
        gsap.to(shaving2Ref.current, {
          y: isMobile ? 400 : 900,
          rotation: -60,
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.6,
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="hidden md:block fixed inset-0 pointer-events-none z-20 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 1. Parafusadeira de Precisão em Estilo Arquitetônico Minimalista (Lado Direito) */}
      <div
        ref={drillRef}
        className="hidden lg:block absolute top-[15%] right-6 xl:right-12 w-28 h-28 filter drop-shadow-[0_12px_24px_rgba(36,34,32,0.18)] will-change-transform"
      >
        <div ref={drillInnerRef} className="w-full h-full will-change-transform">
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Mandril / Ponta do Parafuso */}
            <path d="M112 58L98 54V66L112 62V58Z" fill="#C5A059" />
            <line x1="112" y1="60" x2="119" y2="60" stroke="#81756B" strokeWidth="2.5" strokeLinecap="round" />
            {/* Mandril de aperto rápido */}
            <rect x="86" y="52" width="12" height="16" rx="2" fill="#32302E" />
            <line x1="89" y1="52" x2="89" y2="68" stroke="#C5A059" strokeWidth="1" />
            <line x1="93" y1="52" x2="93" y2="68" stroke="#C5A059" strokeWidth="1" />
            {/* Corpo principal da parafusadeira (Cinza grafite / nogueira) */}
            <path
              d="M36 44C36 39.5817 39.5817 36 44 36H82C84.2091 36 86 37.7909 86 40V80C86 82.2091 84.2091 84 82 84H44C39.5817 84 36 80.4183 36 76V44Z"
              fill="#242220"
            />
            {/* Detalhe Dourado da Carcaça */}
            <path d="M48 40H76V48H48V40Z" fill="#C5A059" fillOpacity="0.85" />
            {/* Saída de Ar / Resfriamento */}
            <line x1="52" y1="54" x2="68" y2="54" stroke="#81756B" strokeWidth="2" strokeLinecap="round" />
            <line x1="52" y1="59" x2="68" y2="59" stroke="#81756B" strokeWidth="2" strokeLinecap="round" />
            <line x1="52" y1="64" x2="68" y2="64" stroke="#81756B" strokeWidth="2" strokeLinecap="round" />
            {/* Empunhadura Ergonômica */}
            <path
              d="M42 80L32 108C31.5 109.5 32.5 111 34 111H52C53.5 111 54.8 109.8 55.2 108.3L62 84H42Z"
              fill="#32302E"
            />
            {/* Gatilho de acionamento em Latão */}
            <path d="M62 66H67C68.5 66 69.5 67.5 69 69L67 74H62V66Z" fill="#C5A059" />
            {/* Bateria recarregável na base */}
            <rect x="22" y="108" width="40" height="10" rx="2.5" fill="#1D1B19" />
            <circle cx="30" cy="113" r="1.5" fill="#40E575" />
            {/* Feixe LED indicador de precisão */}
            <line x1="86" y1="74" x2="114" y2="78" stroke="#FED488" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.7" />
          </svg>
        </div>
      </div>

      {/* 2. Esquadro Metálico de Marceneiro com Graduação em Milímetros (Lado Esquerdo) */}
      <div
        ref={squareRef}
        className="hidden lg:block absolute top-[28%] left-4 xl:left-8 w-24 h-24 filter drop-shadow-[0_10px_20px_rgba(36,34,32,0.15)] will-change-transform"
      >
        <div ref={squareInnerRef} className="w-full h-full will-change-transform">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Lâmina vertical de aço inox */}
            <path d="M12 8H26V92H12V8Z" fill="#DDD7CD" stroke="#81756B" strokeWidth="1" />
            {/* Marcas milimétricas */}
            <line x1="12" y1="18" x2="20" y2="18" stroke="#52371C" strokeWidth="1" />
            <line x1="12" y1="28" x2="17" y2="28" stroke="#81756B" strokeWidth="1" />
            <line x1="12" y1="38" x2="20" y2="38" stroke="#52371C" strokeWidth="1" />
            <line x1="12" y1="48" x2="17" y2="48" stroke="#81756B" strokeWidth="1" />
            <line x1="12" y1="58" x2="20" y2="58" stroke="#52371C" strokeWidth="1" />
            <line x1="12" y1="68" x2="17" y2="68" stroke="#81756B" strokeWidth="1" />
            <line x1="12" y1="78" x2="20" y2="78" stroke="#52371C" strokeWidth="1" />
            {/* Base / Cabo de latão e nogueira */}
            <path d="M12 76H86C88 76 90 78 90 80V92H12V76Z" fill="#6C4E31" stroke="#C5A059" strokeWidth="1.5" />
            {/* Rebite de fixação de latão dourado */}
            <circle cx="20" cy="84" r="3" fill="#C5A059" />
            <circle cx="32" cy="84" r="2.5" fill="#FED488" />
          </svg>
        </div>
      </div>

      {/* 3. Lápis Tradicional de Marceneiro (Octogonal com grafite) */}
      <div
        ref={pencilRef}
        className="hidden xl:block absolute top-[48%] right-8 w-6 h-28 filter drop-shadow-[0_8px_16px_rgba(36,34,32,0.12)] will-change-transform"
      >
        <div ref={pencilInnerRef} className="w-full h-full will-change-transform">
          <svg viewBox="0 0 24 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Corpo em madeira Freijó tratada */}
            <rect x="5" y="16" width="14" height="88" rx="2" fill="#B28247" />
            <line x1="12" y1="16" x2="12" y2="104" stroke="#6C4E31" strokeWidth="1" />
            {/* Gravação da marca Império */}
            <rect x="7" y="40" width="10" height="28" rx="1" fill="#52371C" />
            {/* Apontamento cônico da ponta */}
            <path d="M5 16L12 2L19 16H5Z" fill="#D3C4B9" />
            {/* Ponta grafite de corte */}
            <path d="M10 6L12 2L14 6H10Z" fill="#1D1B19" />
          </svg>
        </div>
      </div>

      {/* 4. Fita Fluida de Lâmina de Madeira (Freijó Curvado - Superior Direito) */}
      <div
        ref={shaving1Ref}
        className="absolute top-[35%] right-2 sm:right-16 w-20 sm:w-28 h-20 opacity-30 blur-[0.5px] will-change-transform"
      >
        <div ref={shaving1InnerRef} className="w-full h-full will-change-transform">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d="M10 80C30 50 20 20 50 15C80 10 70 60 90 70C95 72 85 85 70 80C50 75 60 40 40 45C25 50 20 85 10 80Z"
              fill="url(#wood-grain-gradient-1)"
            />
            <defs>
              <linearGradient id="wood-grain-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C5A059" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#6C4E31" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#52371C" stopOpacity="0.4" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* 5. Segunda Fita de Madeira (Nogueira Suave - Inferior Esquerdo) */}
      <div
        ref={shaving2Ref}
        className="absolute top-[65%] left-2 sm:left-12 w-24 sm:w-32 h-24 opacity-25 blur-[0.5px] will-change-transform"
      >
        <div ref={shaving2InnerRef} className="w-full h-full will-change-transform">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              d="M85 20C65 40 75 75 45 80C20 85 25 35 15 25C10 20 20 10 35 15C55 20 45 55 65 50C80 45 80 15 85 20Z"
              fill="url(#wood-grain-gradient-2)"
            />
            <defs>
              <linearGradient id="wood-grain-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#775A19" stopOpacity="0.7" />
                <stop offset="60%" stopColor="#52371C" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#242220" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
};
