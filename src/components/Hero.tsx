import React, { useEffect, useRef } from 'react';
import { Ruler } from 'lucide-react';
import { playWoodChimeSound } from '../utils/helpers';
import { scrollToTarget } from '../hooks/useScrollytelling';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  onNavigateContact: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigateContact }) => {
  const heroRootRef = useRef<HTMLElement>(null);
  const textColRef = useRef<HTMLDivElement>(null);
  
  // 3 Mouse Parallax Layers
  const layerOutlineRef = useRef<HTMLDivElement>(null);
  const layerArchRef = useRef<HTMLDivElement>(null);
  const layerSwatchesRef = useRef<HTMLDivElement>(null);

  // Floating & Shadow refs
  const archInnerRef = useRef<HTMLDivElement>(null);
  const archShadowRef = useRef<HTMLDivElement>(null);
  const swatch1Ref = useRef<HTMLDivElement>(null);
  const swatch2Ref = useRef<HTMLDivElement>(null);
  const swatch3Ref = useRef<HTMLDivElement>(null);

  // Marquee Ribbons
  const ribbonContainerRef = useRef<HTMLDivElement>(null);
  const marqueeTrack1Ref = useRef<HTMLDivElement>(null);
  const marqueeTrack2Ref = useRef<HTMLDivElement>(null);

  const heroKitchenImage =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDGRLfXCnlfjC8EzZCbcB0G7kp0TSGMRUV4Vk95fM2SOx0PG_GOi33ZETMP6P8ZMzpvu5wyuEC4A9hSZy1AcWXwLtOKEJUlJMgTgePLrTK_HS7jXwKbBnnj9o-0sUALGQyXq18ptbOhtCP5R4QfnH6i02CXftMNaFb5Ub0ivysYSxA7bNGNCWEJBafdjAnPUVvGaKqrcpOAYM9bHSt1q7zpftmlhc2Py0FZyP3grlA';

  const marqueeItem = 'SOB MEDIDA ✳ MDF PREMIUM ✳ PROJETO 3D ✳ JAÚ ✳ ';
  const subMarqueeItem = 'ATELIÊ PRÓPRIO ✳ FERRAGENS AMORTECIDAS ✳ DESIGN AUTORAL ✳ ';

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      // If user prefers reduced motion, render clean static layout immediately
      if (prefersReduced) {
        gsap.set(
          [
            '.hero-line-1',
            '.hero-line-2',
            '.hero-eyebrow',
            '.hero-desc',
            '.hero-ctas',
            '.hero-scroll-ind',
            layerArchRef.current,
            layerOutlineRef.current,
            swatch1Ref.current,
            swatch2Ref.current,
            swatch3Ref.current,
            ribbonContainerRef.current,
          ],
          { opacity: 1, y: 0, x: 0, scale: 1, transform: 'none' }
        );
        return;
      }

      // =======================================================================
      // 1. TIMELINE DE ENTRADA (~1.6s)
      // =======================================================================
      const masterTl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          // Iniciar flutuação contínua somente após a entrada concluir
          startFloatingLoop();
        },
      });

      // (a) Rótulo superior
      masterTl.fromTo(
        '.hero-eyebrow',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.65 }
      );

      // (b) Linhas do Título revelando por máscara (translateY 100% -> 0, stagger 0.1s)
      masterTl.fromTo(
        ['.hero-line-1', '.hero-line-2'],
        { y: '100%' },
        { y: '0%', duration: 0.95, stagger: 0.1, ease: 'power3.out' },
        '-=0.35'
      );

      // (c) Subtítulo aspiracional
      masterTl.fromTo(
        '.hero-desc',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.75 },
        '-=0.5'
      );

      // (d) CTAs em fade e leve subida
      masterTl.fromTo(
        '.hero-ctas',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.75 },
        '-=0.55'
      );

      // (e) Indicação discreta de rolagem
      masterTl.fromTo(
        '.hero-scroll-ind',
        { opacity: 0 },
        { opacity: 0.65, duration: 0.6 },
        '-=0.4'
      );

      // (f) Palavra gigante IMPÉRIO em amarelo/dourado brilhante no fundo
      if (layerOutlineRef.current) {
        masterTl.fromTo(
          layerOutlineRef.current,
          { opacity: 0, scale: 0.92, y: 25 },
          { opacity: 0.95, scale: 1, y: 0, duration: 1.3, ease: 'power2.out' },
          0.1
        );
      }

      // (g) Objeto principal (o arco): cai com spring (y:80, scale:0.9 -> 1, ease back.out)
      if (layerArchRef.current) {
        masterTl.fromTo(
          layerArchRef.current,
          { opacity: 0, y: 80, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 1.25, ease: 'back.out(1.5)' },
          0.2
        );
      }

      // (h) Sombra elíptica no chão abre junto com o objeto
      if (archShadowRef.current) {
        masterTl.fromTo(
          archShadowRef.current,
          { opacity: 0, scale: 0.4 },
          { opacity: 0.8, scale: 1, duration: 1.25, ease: 'back.out(1.5)' },
          0.2
        );
      }

      // (i) 3 Amostras de madeira e trena entram em sequência
      const swatches = [swatch1Ref.current, swatch2Ref.current, swatch3Ref.current].filter(Boolean);
      if (swatches.length > 0) {
        masterTl.fromTo(
          swatches,
          { opacity: 0, scale: 0.4, y: 25 },
          { opacity: 1, scale: 1, y: 0, duration: 0.75, stagger: 0.14, ease: 'back.out(1.8)' },
          0.7
        );
      }

      // (j) A faixa diagonal desliza da lateral
      if (ribbonContainerRef.current) {
        masterTl.fromTo(
          ribbonContainerRef.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out' },
          0.8
        );
      }

      // =======================================================================
      // 2. FLUTUAÇÃO CONTÍNUA (Loop de ~6s, repeat: -1, yoyo: true)
      // =======================================================================
      function startFloatingLoop() {
        if (prefersReduced) return;

        // Objeto em arco: translateY ±14px e rotate ±1.5deg em loop de ~6s
        if (archInnerRef.current) {
          gsap.to(archInnerRef.current, {
            y: -14,
            rotation: 1.5,
            duration: 3.1,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        }

        // Sombra elíptica no chão escala de forma inversa
        if (archShadowRef.current) {
          gsap.to(archShadowRef.current, {
            scale: 0.85,
            opacity: 0.5,
            duration: 3.1,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        }

        // Amostras de madeira e régua flutuando (Apenas Desktop >= 768px)
        if (!isMobile) {
          // Amostra Nogueira (ritmo próprio)
          if (swatch1Ref.current) {
            gsap.to(swatch1Ref.current, {
              y: -11,
              rotation: -3,
              duration: 4.1,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
            });
          }

          // Amostra Freijó (ritmo próprio com delay de fase)
          if (swatch2Ref.current) {
            gsap.to(swatch2Ref.current, {
              y: 13,
              rotation: 2.8,
              duration: 4.9,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
              delay: 0.4,
            });
          }

          // Amostra Régua / Trena (ritmo próprio)
          if (swatch3Ref.current) {
            gsap.to(swatch3Ref.current, {
              y: -9,
              rotation: -2.2,
              duration: 3.7,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
              delay: 0.8,
            });
          }
        }
      }

      // =======================================================================
      // 3. FAIXA EM MOVIMENTO (Velocidade Constante, Serena e Contínua)
      // =======================================================================
      const speed1 = -0.0012; // Deslizamento ultralento e cinematográfico para a esquerda
      const speed2 = 0.0012;  // Deslizamento ultralento para a direita

      let posX1 = 0;
      let posX2 = 0;

      const tickerFn = () => {
        // Track 1 (Faixa principal latão)
        posX1 += speed1;
        if (posX1 <= -50) posX1 += 50;
        if (marqueeTrack1Ref.current) {
          marqueeTrack1Ref.current.style.transform = `translate3d(${posX1}%, 0, 0)`;
        }

        // Track 2 (Faixa fina em contorno)
        posX2 += speed2;
        if (posX2 >= 0) posX2 -= 50;
        if (marqueeTrack2Ref.current) {
          marqueeTrack2Ref.current.style.transform = `translate3d(${posX2}%, 0, 0)`;
        }
      };

      gsap.ticker.add(tickerFn);

      // =======================================================================
      // 4. SAÍDA POR SCROLL (ScrollTrigger)
      // =======================================================================
      // Ao rolar, o objeto sobe com leve escala (1 -> 1.08) e rotação (até 4deg)
      if (layerArchRef.current && !isMobile) {
        gsap.to(layerArchRef.current, {
          y: -75,
          scale: 1.08,
          rotation: 4,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRootRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
          },
        });
      }

      // O título e texto se movem mais devagar que a página (subtle counter-parallax)
      if (textColRef.current && !isMobile) {
        gsap.to(textColRef.current, {
          y: 45,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRootRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.4,
          },
        });
      }

      // Palavra gigante "IMPÉRIO" ao fundo se desloca em parallax ainda mais lento
      if (layerOutlineRef.current && !isMobile) {
        gsap.to(layerOutlineRef.current, {
          y: 90,
          opacity: 0.3,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRootRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.6,
          },
        });
      }

      // =======================================================================
      // 5. PARALLAX DO MOUSE (Apenas Desktop >= 768px)
      // =======================================================================
      if (!isMobile) {
        const handleMouseMove = (e: MouseEvent) => {
          const heroEl = heroRootRef.current;
          if (!heroEl) return;
          const rect = heroEl.getBoundingClientRect();
          // Normalizado de -1 a 1
          const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
          const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

          // Camada 1: Palavra gigante ao fundo (profundidade lenta: 12px)
          if (layerOutlineRef.current) {
            gsap.to(layerOutlineRef.current, {
              x: -normX * 12,
              y: -normY * 8,
              duration: 0.8,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          }

          // Camada 2: Objeto protagonista em arco (profundidade média: 22px)
          if (layerArchRef.current) {
            gsap.to(layerArchRef.current, {
              x: normX * 20,
              y: normY * 16,
              duration: 0.65,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          }

          // Camada 3: Amostras e trena (profundidade mais rápida: 34px)
          if (layerSwatchesRef.current) {
            gsap.to(layerSwatchesRef.current, {
              x: normX * 32,
              y: normY * 26,
              duration: 0.5,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          }
        };

        const handleMouseLeave = () => {
          gsap.to([layerOutlineRef.current, layerArchRef.current, layerSwatchesRef.current], {
            x: 0,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        };

        const heroEl = heroRootRef.current;
        if (heroEl) {
          heroEl.addEventListener('mousemove', handleMouseMove);
          heroEl.addEventListener('mouseleave', handleMouseLeave);
        }

        return () => {
          gsap.ticker.remove(tickerFn);
          if (heroEl) {
            heroEl.removeEventListener('mousemove', handleMouseMove);
            heroEl.removeEventListener('mouseleave', handleMouseLeave);
          }
        };
      }

      return () => {
        gsap.ticker.remove(tickerFn);
      };
    }, heroRootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRootRef}
      id="hero"
      className="relative w-full bg-[#15100c] text-[#f2e8d8] overflow-hidden pt-32 sm:pt-36 lg:pt-40 pb-4 sm:pb-6 border-b border-[#251d18]"
    >
      {/* 1. Warm Radial Glow behind the protagonist object */}
      <div
        className="absolute top-1/2 right-[5%] sm:right-[12%] -translate-y-1/2 w-[550px] sm:w-[720px] h-[550px] sm:h-[720px] rounded-full pointer-events-none opacity-60 z-0"
        style={{
          background:
            'radial-gradient(circle, rgba(201, 160, 78, 0.22) 0%, rgba(201, 160, 78, 0.07) 40%, rgba(21, 16, 12, 0) 70%)',
        }}
      />

      {/* 2. Subtle Grain Overlay (4% opacity) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04] z-0 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-[1340px] mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Eyebrow + Gigantic Typography + CTAs + Scroll Indicator     */}
          {/* ========================================================================= */}
          <div ref={textColRef} className="lg:col-span-7 flex flex-col items-start space-y-7 z-10 will-change-transform">
            
            {/* Rótulo superior em caixa-alta espaçada */}
            <div className="hero-eyebrow inline-flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#c9a04e] shadow-[0_0_8px_rgba(201,160,78,0.8)]" />
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#c9a04e] uppercase">
                MARCENARIA SOB MEDIDA — JAÚ E REGIÃO
              </span>
            </div>

            {/* H1 Enorme: Linha 1 Creme + Linha 2 em Itálico Dourado com Máscara de Revelação */}
            <h1 className="font-serif-atelier font-bold text-[#f2e8d8] text-[clamp(2.8rem,7.5vw,7.8rem)] leading-[0.98] tracking-tight">
              <span className="block overflow-hidden pb-1">
                <span className="hero-line-1 block transform translate-y-full will-change-transform">
                  Móveis planejados em Jaú
                </span>
              </span>
              <span className="block overflow-hidden">
                <span className="hero-line-2 block transform translate-y-full will-change-transform italic text-[#c9a04e] font-normal font-serif mt-1">
                  sob medida para você.
                </span>
              </span>
            </h1>

            {/* Subtítulo Aspiracional Direto */}
            <p className="hero-desc text-base sm:text-lg lg:text-xl text-[#f2e8d8]/80 leading-relaxed max-w-xl font-light">
              Projetos exclusivos com a nobreza de madeiras selecionadas, ferragens de alta durabilidade e a precisão milimétrica de quem fabrica com paixão no interior paulista.
            </p>

            {/* CTAs de Alto Impacto */}
            <div className="hero-ctas flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-2">
              <button
                onClick={() => {
                  playWoodChimeSound();
                  onNavigateContact();
                }}
                className="inline-flex items-center justify-center gap-3 px-8 sm:px-9 py-4 sm:py-4.5 rounded-xl bg-[#c9a04e] hover:bg-[#d8af5c] text-[#15100c] text-xs font-bold uppercase tracking-widest transition-all duration-200 shadow-[0_12px_28px_rgba(201,160,78,0.28)] hover:scale-[1.02] cursor-pointer"
              >
                <span>Pedir orçamento</span>
                <span className="text-sm font-semibold">↗</span>
              </button>

              <button
                onClick={() => {
                  playWoodChimeSound();
                  scrollToTarget('#ambientes', -80);
                }}
                className="inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-4 sm:py-4.5 rounded-xl border border-[#f2e8d8]/30 hover:border-[#c9a04e] text-[#f2e8d8] hover:text-[#c9a04e] text-xs font-semibold uppercase tracking-wider transition-all duration-200 hover:bg-[#c9a04e]/10 cursor-pointer"
              >
                <span>Ver projetos</span>
              </button>
            </div>

            {/* Indicação Discreta de Rolagem */}
            <div className="hero-scroll-ind pt-4 flex items-center gap-2.5 text-xs text-[#f2e8d8]/60 font-medium tracking-widest uppercase">
              <span>Role para ver os projetos</span>
              <span className="text-[#c9a04e] text-sm animate-bounce">↓</span>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: Protagonist Arch Object + Giant Outline Text + Wood Swatches */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center mt-6 lg:mt-0">
            
            {/* Camada 1 (Mouse Parallax): Palavra "IMPÉRIO" Gigante em Amarelo Dourado atrás da Imagem */}
            <div
              ref={layerOutlineRef}
              className="absolute -top-10 sm:-top-16 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none z-0 will-change-transform"
            >
              <span
                className="text-[clamp(5.2rem,14vw,12.5rem)] font-serif-atelier font-black uppercase tracking-[0.14em] leading-none block text-[#fed488] drop-shadow-[0_10px_40px_rgba(201,160,78,0.45)] opacity-95"
              >
                IMPÉRIO
              </span>
            </div>

            {/* Camada 2 (Mouse Parallax + Spring Drop + Continuous Float): Objeto em Arco */}
            <div
              ref={layerArchRef}
              className="relative z-10 w-full max-w-[360px] sm:max-w-[420px] will-change-transform"
            >
              <div ref={archInnerRef} className="will-change-transform">
                <div className="relative w-full aspect-[3.2/4.4] rounded-[999px_999px_28px_28px] overflow-hidden border border-[#c9a04e]/40 shadow-[0_32px_80px_rgba(0,0,0,0.85)] bg-[#1d1612]">
                  <img
                    src={heroKitchenImage}
                    alt="Móveis Planejados de Alto Padrão em Jaú"
                    className="w-full h-full object-cover scale-100 will-change-transform"
                    width={800}
                    height={1100}
                    loading="eager"
                  />
                  
                  {/* Degradê interno de iluminação cenográfica */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#15100c]/90 via-[#15100c]/20 to-transparent opacity-75" />
                  
                  {/* Legenda sutil no rodapé do arco */}
                  <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-[#f2e8d8] text-xs">
                    <div>
                      <p className="font-serif-atelier font-bold text-sm text-[#f2e8d8]">
                        Cozinha Gourmet Jaú
                      </p>
                      <p className="text-[10px] text-[#c9a04e]">
                        Lâmina Nogueira & Ferragens Blum
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] uppercase font-mono tracking-wider border border-[#c9a04e]/40 text-[#c9a04e]">
                      Jaú/SP
                    </span>
                  </div>
                </div>
              </div>

              {/* Sombra elíptica no chão sob o arco (escala inversamente) */}
              <div
                ref={archShadowRef}
                className="w-[82%] h-7 mx-auto -mt-3.5 bg-black/80 rounded-[100%] blur-md pointer-events-none will-change-transform"
              />

              {/* ===================================================================== */}
              {/* Camada 3 (Mouse Parallax + Float): Amostras de Madeira e Trena        */}
              {/* ===================================================================== */}
              <div ref={layerSwatchesRef} className="absolute inset-0 pointer-events-none will-change-transform">
                
                {/* Amostra 1: Nogueira Americana (Superior Esquerda - apenas desktop) */}
                <div
                  ref={swatch1Ref}
                  className="hidden md:flex absolute -top-4 -left-4 sm:-left-8 z-20 items-center gap-2.5 p-2 pr-3.5 rounded-xl bg-[#1d1612]/90 backdrop-blur-md border border-[#c9a04e]/40 shadow-[0_12px_24px_rgba(0,0,0,0.5)] pointer-events-auto will-change-transform"
                >
                  <div
                    className="w-7 h-7 rounded-lg border border-[#c9a04e]/60 shadow-inner"
                    style={{
                      background: 'linear-gradient(135deg, #422a1d 0%, #2b1810 100%)',
                    }}
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] uppercase tracking-wider text-[#c9a04e] font-bold">
                      Lâmina Natural
                    </span>
                    <span className="text-xs font-serif-atelier font-semibold text-[#f2e8d8]">
                      Nogueira
                    </span>
                  </div>
                </div>

                {/* Amostra 2: Freijó Brasileiro (Centro Direita - apenas desktop) */}
                <div
                  ref={swatch2Ref}
                  className="hidden md:flex absolute top-[42%] -right-4 sm:-right-8 z-20 items-center gap-2.5 p-2 pr-3.5 rounded-xl bg-[#1d1612]/90 backdrop-blur-md border border-[#c9a04e]/40 shadow-[0_12px_24px_rgba(0,0,0,0.5)] pointer-events-auto will-change-transform"
                >
                  <div
                    className="w-7 h-7 rounded-lg border border-[#c9a04e]/60 shadow-inner"
                    style={{
                      background: 'linear-gradient(135deg, #b28247 0%, #875c2e 100%)',
                    }}
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] uppercase tracking-wider text-[#c9a04e] font-bold">
                      Acabamento
                    </span>
                    <span className="text-xs font-serif-atelier font-semibold text-[#f2e8d8]">
                      Freijó Dourado
                    </span>
                  </div>
                </div>

                {/* Amostra 3: Trena/Régua Milimétrica de Precisão (Inferior Esquerda - apenas desktop) */}
                <div
                  ref={swatch3Ref}
                  className="hidden md:flex absolute bottom-6 -left-3 sm:-left-6 z-20 items-center gap-2 p-2 pr-3 rounded-xl bg-[#1d1612]/90 backdrop-blur-md border border-[#c9a04e]/40 shadow-[0_12px_24px_rgba(0,0,0,0.5)] pointer-events-auto will-change-transform"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#c9a04e] text-[#15100c] flex items-center justify-center font-bold">
                    <Ruler className="w-4 h-4 text-[#15100c]" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] uppercase tracking-wider text-[#c9a04e] font-bold">
                      Conferência
                    </span>
                    <span className="text-[11px] font-semibold text-[#f2e8d8]">
                      Precisão 1mm
                    </span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. FAIXA DIAGONAL DE LATÃO DOURADO (Sem cortes, de ponta a ponta)        */}
      {/* ========================================================================= */}
      <div
        ref={ribbonContainerRef}
        className="relative mt-8 sm:mt-12 z-30 w-full overflow-hidden py-10 sm:py-14 pointer-events-none select-none will-change-transform"
      >
        {/* Faixa Secundária em Contorno (sentido oposto, estendendo 30vw para fora em ambos os lados) */}
        <div className="w-[160vw] -left-[30vw] relative py-2.5 border-y border-[#c9a04e]/60 bg-[#15100c]/90 text-[#c9a04e] text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] whitespace-nowrap transform rotate-[-2deg]">
          <div ref={marqueeTrack2Ref} className="flex items-center w-max will-change-transform">
            <span className="inline-block pr-6 whitespace-nowrap">{subMarqueeItem.repeat(10)}</span>
            <span className="inline-block pr-6 whitespace-nowrap" aria-hidden="true">{subMarqueeItem.repeat(10)}</span>
          </div>
        </div>

        {/* Faixa Principal em Latão Dourado Sólido (rotate -2.8deg, estendendo 30vw para fora em ambos os lados) */}
        <div className="w-[160vw] -left-[30vw] relative py-4 sm:py-4.5 bg-[#c9a04e] text-[#15100c] font-black uppercase text-xs sm:text-sm tracking-[0.25em] shadow-[0_10px_35px_rgba(0,0,0,0.5)] whitespace-nowrap transform rotate-[-2.8deg] -mt-3">
          <div ref={marqueeTrack1Ref} className="flex items-center w-max will-change-transform">
            <span className="inline-block pr-6 whitespace-nowrap">{marqueeItem.repeat(10)}</span>
            <span className="inline-block pr-6 whitespace-nowrap" aria-hidden="true">{marqueeItem.repeat(10)}</span>
          </div>
        </div>
      </div>

    </section>
  );
};
