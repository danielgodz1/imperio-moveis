import React, { useEffect, useRef } from 'react';
import { Sparkles, Camera, MessageSquare, Layers } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Foto } from './Foto';
import { getWhatsAppUrl, trackWhatsAppClick } from '../utils/helpers';
import { scrollToTarget } from '../hooks/useScrollytelling';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  onNavigateContact?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigateContact }) => {
  const heroRootRef = useRef<HTMLElement>(null);
  const textColRef = useRef<HTMLDivElement>(null);

  // 3 Camadas de Parallax de Mouse
  const layerOutlineRef = useRef<HTMLDivElement>(null);
  const layerArchRef = useRef<HTMLDivElement>(null);
  const layerSwatchesRef = useRef<HTMLDivElement>(null);

  // Refs de Flutuação, Sombra, Fios de Chamada e Cartões de Material
  const archInnerRef = useRef<HTMLDivElement>(null);
  const archShadowRef = useRef<HTMLDivElement>(null);
  const fiosSvgRef = useRef<SVGSVGElement>(null);
  const swatch1Ref = useRef<HTMLDivElement>(null);
  const swatch2Ref = useRef<HTMLDivElement>(null);
  const swatch3Ref = useRef<HTMLDivElement>(null);
  const brilhoLedRef = useRef<HTMLDivElement>(null);

  // Faixas Diagonais (Marquee)
  const ribbonContainerRef = useRef<HTMLDivElement>(null);
  const marqueeTrack1Ref = useRef<HTMLDivElement>(null);
  const marqueeTrack2Ref = useRef<HTMLDivElement>(null);

  const marqueeItem =
    'SOB MEDIDA ✳ ARQUITETURA E MARCENARIA ✳ PROJETO 3D ✳ JAÚ E REGIÃO ✳ ';
  const subMarqueeItem =
    'OFICINA PRÓPRIA ✳ RIPADO DE MADEIRA ✳ GRANITO E ILUMINAÇÃO LED ✳ DESDE 2015 ✳ ';

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set(
          [
            '.hero-line-1',
            '.hero-line-2',
            '.hero-line-3',
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
        if (brilhoLedRef.current) {
          gsap.set(brilhoLedRef.current, { opacity: 1 });
        }
        return;
      }

      // Prepara os fios (linhas de chamada) que puxam dos pontos da foto até os cartões
      const fiosPaths =
        fiosSvgRef.current?.querySelectorAll<SVGPathElement>('.fio-chamada');
      const fiosPontos =
        fiosSvgRef.current?.querySelectorAll<SVGCircleElement>('.ponto-chamada');

      fiosPaths?.forEach((p) => {
        const comp = p.getTotalLength ? p.getTotalLength() : 320;
        gsap.set(p, { strokeDasharray: comp, strokeDashoffset: comp });
      });
      if (fiosPontos && fiosPontos.length > 0) {
        gsap.set(fiosPontos, { scale: 0, opacity: 0, transformOrigin: 'center' });
      }
      if (brilhoLedRef.current) {
        gsap.set(brilhoLedRef.current, { opacity: 0 });
      }

      // =======================================================================
      // 1. TIMELINE DE ENTRADA FLUIDA + FIOS PUXANDO OS MATERIAIS DA IMAGEM
      // =======================================================================
      const masterTl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          startFloatingLoop();
        },
      });

      // (a) Rótulo superior
      masterTl.fromTo(
        '.hero-eyebrow',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.65 },
        0
      );

      // (b) Linhas do Título revelando por máscara (translateY 105% -> 0, stagger 0.1s)
      masterTl.fromTo(
        ['.hero-line-1', '.hero-line-2', '.hero-line-3'],
        { y: '105%' },
        { y: '0%', duration: 0.95, stagger: 0.1, ease: 'power3.out' },
        0.12
      );

      // (c) Subtítulo
      masterTl.fromTo(
        '.hero-desc',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.75 },
        0.5
      );

      // (d) CTAs (Orçamento + Obras + Instagram)
      masterTl.fromTo(
        '.hero-ctas',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.75 },
        0.65
      );

      // (e) Indicação discreta de rolagem
      masterTl.fromTo(
        '.hero-scroll-ind',
        { opacity: 0 },
        { opacity: 0.7, duration: 0.6 },
        0.85
      );

      // (f) Palavra gigante IMPÉRIO atrás da imagem flutuante
      if (layerOutlineRef.current) {
        masterTl.fromTo(
          layerOutlineRef.current,
          { opacity: 0, scale: 0.9, y: 28 },
          { opacity: 0.95, scale: 1, y: 0, duration: 1.25, ease: 'power2.out' },
          0.08
        );
      }

      // (g) Imagem principal flutuante em arco (ampliada): entrada com spring
      if (layerArchRef.current) {
        masterTl.fromTo(
          layerArchRef.current,
          { opacity: 0, y: 80, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'back.out(1.45)' },
          0.16
        );
      }

      // (h) Sombra elíptica no chão abre junto com o objeto
      if (archShadowRef.current) {
        masterTl.fromTo(
          archShadowRef.current,
          { opacity: 0, scale: 0.4 },
          { opacity: 0.85, scale: 1, duration: 1.2, ease: 'back.out(1.45)' },
          0.16
        );
      }

      // (i) Acende o brilho de LED sobre a ilha e a bancada
      if (brilhoLedRef.current) {
        masterTl.to(
          brilhoLedRef.current,
          { opacity: 1, duration: 0.9, ease: 'power2.out' },
          0.65
        );
      }

      // (j) Puxa os fios dourados a partir dos pontos exatos da foto até os cartões de materiais
      if (fiosPontos && fiosPontos.length > 0) {
        masterTl.to(
          fiosPontos,
          {
            scale: 1,
            opacity: 1,
            duration: 0.35,
            stagger: 0.16,
            ease: 'back.out(2)',
          },
          0.7
        );
      }

      if (fiosPaths && fiosPaths.length > 0) {
        masterTl.to(
          fiosPaths,
          {
            strokeDashoffset: 0,
            duration: 0.65,
            stagger: 0.16,
            ease: 'power2.inOut',
          },
          0.8
        );
      }

      // (k) Os 3 cartões de material abrem exatamente quando cada fio chega à ponta
      const swatches = [
        swatch1Ref.current,
        swatch2Ref.current,
        swatch3Ref.current,
      ].filter(Boolean);
      if (swatches.length > 0) {
        masterTl.fromTo(
          swatches,
          { opacity: 0, scale: 0.6, y: 16 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.16,
            ease: 'back.out(1.7)',
          },
          1.05
        );
      }

      // (l) Faixa diagonal desliza na base
      if (ribbonContainerRef.current) {
        masterTl.fromTo(
          ribbonContainerRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' },
          0.85
        );
      }

      // =======================================================================
      // 2. FLUTUAÇÃO CONTÍNUA (Loop suave em senoide)
      // =======================================================================
      function startFloatingLoop() {
        if (prefersReduced) return;

        if (archInnerRef.current) {
          gsap.to(archInnerRef.current, {
            y: -12,
            rotation: 1.1,
            duration: 3.3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        }

        if (archShadowRef.current) {
          gsap.to(archShadowRef.current, {
            scale: 0.86,
            opacity: 0.5,
            duration: 3.3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        }

        if (!isMobile) {
          if (swatch1Ref.current) {
            gsap.to(swatch1Ref.current, {
              y: -7,
              duration: 3.8,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
            });
          }

          if (swatch2Ref.current) {
            gsap.to(swatch2Ref.current, {
              y: 8,
              duration: 4.4,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
              delay: 0.4,
            });
          }

          if (swatch3Ref.current) {
            gsap.to(swatch3Ref.current, {
              y: -6,
              duration: 3.6,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
              delay: 0.8,
            });
          }
        }
      }

      // =======================================================================
      // 3. FAIXA DIAGONAL EM MOVIMENTO CONTÍNUO
      // =======================================================================
      const speed1 = -0.0012;
      const speed2 = 0.0012;
      let posX1 = 0;
      let posX2 = 0;

      const tickerFn = () => {
        posX1 += speed1;
        if (posX1 <= -50) posX1 += 50;
        if (marqueeTrack1Ref.current) {
          marqueeTrack1Ref.current.style.transform = `translate3d(${posX1}%, 0, 0)`;
        }

        posX2 += speed2;
        if (posX2 >= 0) posX2 -= 50;
        if (marqueeTrack2Ref.current) {
          marqueeTrack2Ref.current.style.transform = `translate3d(${posX2}%, 0, 0)`;
        }
      };

      gsap.ticker.add(tickerFn);

      // =======================================================================
      // 4. SAÍDA POR SCROLL (ScrollTrigger leve e fluido)
      // =======================================================================
      if (layerArchRef.current && !isMobile) {
        gsap.to(layerArchRef.current, {
          y: -55,
          scale: 1.04,
          rotation: 1.8,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRootRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.1,
          },
        });
      }

      if (textColRef.current && !isMobile) {
        gsap.to(textColRef.current, {
          y: 35,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRootRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.3,
          },
        });
      }

      if (layerOutlineRef.current && !isMobile) {
        gsap.to(layerOutlineRef.current, {
          y: 75,
          opacity: 0.3,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRootRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
      }

      // =======================================================================
      // 5. PARALLAX DO MOUSE EM 3 CAMADAS (Desktop >= 768px)
      // =======================================================================
      if (!isMobile) {
        const handleMouseMove = (e: MouseEvent) => {
          const heroEl = heroRootRef.current;
          if (!heroEl) return;
          const rect = heroEl.getBoundingClientRect();
          const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
          const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

          if (layerOutlineRef.current) {
            gsap.to(layerOutlineRef.current, {
              x: -normX * 14,
              y: -normY * 9,
              duration: 0.8,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          }

          if (layerArchRef.current) {
            gsap.to(layerArchRef.current, {
              x: normX * 18,
              y: normY * 14,
              duration: 0.65,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          }

          if (layerSwatchesRef.current) {
            gsap.to(layerSwatchesRef.current, {
              x: normX * 26,
              y: normY * 20,
              duration: 0.5,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          }
        };

        const handleMouseLeave = () => {
          gsap.to(
            [
              layerOutlineRef.current,
              layerArchRef.current,
              layerSwatchesRef.current,
            ],
            {
              x: 0,
              y: 0,
              duration: 0.8,
              ease: 'power2.out',
              overwrite: 'auto',
            }
          );
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
      data-tema="noite"
      className="relative w-full bg-[#15100c] text-[#f2e8d8] overflow-hidden pt-28 sm:pt-36 lg:pt-40 pb-4 sm:pb-6 border-b border-[#251d18]"
    >
      {/* 1. Brilho radial quente atrás da imagem flutuante */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 right-[2%] sm:right-[6%] -translate-y-1/2 w-[620px] sm:w-[860px] h-[620px] sm:h-[860px] rounded-full pointer-events-none opacity-70 z-0"
        style={{
          background:
            'radial-gradient(circle, rgba(201, 160, 78, 0.25) 0%, rgba(201, 160, 78, 0.08) 44%, rgba(21, 16, 12, 0) 70%)',
        }}
      />

      {/* 2. Textura sutil de granulação cinematográfica (4% opacidade) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.04] z-0 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-6 items-center">
          {/* ========================================================================= */}
          {/* COLUNA ESQUERDA (5 colunas no desktop): Título Animado + CTAs + Instagram */}
          {/* ========================================================================= */}
          <div
            ref={textColRef}
            className="lg:col-span-5 flex flex-col items-start space-y-6 sm:space-y-7 z-10 will-change-transform"
          >
            {/* Rótulo superior em caixa-alta espaçada */}
            <div className="hero-eyebrow inline-flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#c9a04e] shadow-[0_0_8px_rgba(201,160,78,0.8)]" />
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#c9a04e] uppercase">
                MARCENARIA E ARQUITETURA — JAÚ E REGIÃO
              </span>
            </div>

            {/* H1 com Revelação por Máscara nas 3 Linhas */}
            <h1 className="font-serif-atelier font-bold text-[#f2e8d8] text-[clamp(2.85rem,6.4vw,6.4rem)] leading-[0.98] tracking-tight">
              <span className="block overflow-hidden pb-1">
                <span className="hero-line-1 block transform will-change-transform">
                  Arquitetura e
                </span>
              </span>
              <span className="block overflow-hidden pb-1">
                <span className="hero-line-2 block transform will-change-transform">
                  marcenaria na
                </span>
              </span>
              <span className="block overflow-hidden">
                <span className="hero-line-3 block transform will-change-transform italic text-[#c9a04e] font-normal font-serif mt-1">
                  mesma mesa.
                </span>
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="hero-desc text-base sm:text-lg text-[#f2e8d8]/85 leading-relaxed max-w-xl font-light">
              A Tatiane projeta, o Wellington fabrica. Cozinhas, quartos, closets e lojas em Jaú e região com precisão milimétrica desde 2015.
            </p>

            {/* CTAs: Orçamento + Ver as Obras + Instagram Oficial */}
            <div className="hero-ctas flex flex-wrap items-center gap-3 sm:gap-3.5 w-full pt-2">
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

            {/* Indicação Discreta de Rolagem */}
            <div className="hero-scroll-ind pt-2 flex items-center gap-2.5 text-xs text-[#f2e8d8]/60 font-medium tracking-widest uppercase">
              <span>Role para ver os projetos</span>
              <span className="text-[#c9a04e] text-sm animate-bounce">↓</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* COLUNA DIREITA (7 colunas): IMPÉRIO + Imagem Flutuante Grande + Fios      */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 relative flex flex-col items-center justify-center mt-8 lg:mt-0">
            {/* Camada 1 (Mouse Parallax): Palavra "IMPÉRIO" Gigante atrás da Imagem Flutuante */}
            <div
              ref={layerOutlineRef}
              aria-hidden="true"
              className="absolute -top-10 sm:-top-16 left-1/2 -translate-x-1/2 w-[125%] text-center pointer-events-none select-none z-0 will-change-transform"
            >
              <span className="text-[clamp(5.4rem,15vw,13.8rem)] font-serif-atelier font-black uppercase tracking-[0.13em] leading-none block text-[#fed488] drop-shadow-[0_10px_40px_rgba(201,160,78,0.45)] opacity-95">
                IMPÉRIO
              </span>
            </div>

            {/* Camada 2 (Spring Drop + Float Contínuo + Mouse Parallax): Imagem Flutuante Ampliada */}
            <div
              ref={layerArchRef}
              className="relative z-10 w-full max-w-[460px] sm:max-w-[560px] lg:max-w-[610px] will-change-transform"
            >
              <div ref={archInnerRef} className="relative will-change-transform">
                <div className="relative w-full aspect-[3.7/4.3] rounded-[999px_999px_32px_32px] overflow-hidden border-[1.5px] border-[#c9a04e]/55 shadow-[0_36px_95px_rgba(0,0,0,0.9)] bg-[#1d1612]">
                  {/* Foto 4K da Cozinha Real */}
                  <Foto
                    srcBase="/obras/cozinha-gringa-4k"
                    alt="Cozinha planejada com ilha em verde-sálvia, ripado de madeira, bancada em granito e LED executada pela Império em Jaú"
                    prioridade
                    sizes="(min-width: 1024px) 610px, 95vw"
                    className="w-full h-full"
                    imgStyle={{
                      objectFit: 'cover',
                      objectPosition: '50% 58%',
                      imageRendering: 'auto',
                    }}
                  />

                  {/* Brilho de LED quente acendendo sobre a ilha e os armários */}
                  <div
                    ref={brilhoLedRef}
                    aria-hidden="true"
                    className="absolute inset-x-[8%] bottom-[14%] h-[48%] pointer-events-none z-10"
                    style={{
                      background:
                        'radial-gradient(ellipse at 50% 55%, rgba(212, 168, 79, 0.25) 0%, rgba(212, 168, 79, 0.08) 46%, transparent 74%)',
                    }}
                  />

                  {/* Degradê interno sutil apenas na base para leitura da legenda */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#15100c]/90 via-transparent to-transparent pointer-events-none"
                  />

                  {/* Legenda no rodapé interno do arco flutuante */}
                  <div className="absolute bottom-5 left-6 right-6 z-20 flex items-center justify-between text-[#f2e8d8] text-xs">
                    <div>
                      <p className="font-serif-atelier font-bold text-sm sm:text-base text-[#f2e8d8]">
                        Cozinha Gourmet Jaú
                      </p>
                      <p className="text-[11px] text-[#c9a04e]">
                        Ilha em Verde-Sálvia, Cristaleira LED &amp; Granito Preto
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-[10px] uppercase font-mono tracking-wider border border-[#c9a04e]/40 text-[#c9a04e]">
                      Jaú/SP
                    </span>
                  </div>
                </div>

                {/* ===================================================================== */}
                {/* SVG DOS FIOS DE CHAMADA: Puxam do ponto exato na foto até os cartões  */}
                {/* ===================================================================== */}
                <svg
                  ref={fiosSvgRef}
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
                >
                  {/* Fio 1: Armário Superior / Cristaleira Iluminada (x:44, y:30) -> Cartão Superior Esquerdo (x:6, y:18) */}
                  <g>
                    <circle
                      cx="44"
                      cy="30"
                      r="1.3"
                      className="ponto-chamada fill-[#c9a04e] stroke-[#15100c]"
                      strokeWidth="0.4"
                    />
                    <path
                      className="fio-chamada"
                      d="M 44 30 L 26 18 L 6 18"
                      fill="none"
                      stroke="#c9a04e"
                      strokeWidth="0.45"
                      strokeLinecap="round"
                    />
                  </g>

                  {/* Fio 2: Bancada de Granito Preto & Fita de LED (x:58, y:53) -> Cartão Direito (x:94, y:45) */}
                  <g>
                    <circle
                      cx="58"
                      cy="53"
                      r="1.3"
                      className="ponto-chamada fill-[#c9a04e] stroke-[#15100c]"
                      strokeWidth="0.4"
                    />
                    <path
                      className="fio-chamada"
                      d="M 58 53 L 76 45 L 94 45"
                      fill="none"
                      stroke="#c9a04e"
                      strokeWidth="0.45"
                      strokeLinecap="round"
                    />
                  </g>

                  {/* Fio 3: Corpo da Ilha em Verde-Sálvia e Ripado (x:46, y:74) -> Cartão Inferior Esquerdo (x:6, y:76) */}
                  <g>
                    <circle
                      cx="46"
                      cy="74"
                      r="1.3"
                      className="ponto-chamada fill-[#c9a04e] stroke-[#15100c]"
                      strokeWidth="0.4"
                    />
                    <path
                      className="fio-chamada"
                      d="M 46 74 L 24 76 L 6 76"
                      fill="none"
                      stroke="#c9a04e"
                      strokeWidth="0.45"
                      strokeLinecap="round"
                    />
                  </g>
                </svg>

                {/* ===================================================================== */}
                {/* Camada 3 (Mouse Parallax + Float): Cartões conectados pelos fios      */}
                {/* ===================================================================== */}
                <div
                  ref={layerSwatchesRef}
                  className="absolute inset-0 pointer-events-none z-30 will-change-transform"
                >
                  {/* Cartão 1: Acabamento Real (Conectado ao Fio 1) */}
                  <div
                    ref={swatch1Ref}
                    className="flex absolute top-[12%] -left-2 sm:-left-8 items-center gap-2.5 p-2 sm:p-2.5 pr-3.5 rounded-xl bg-[#1d1612]/95 backdrop-blur-md border border-[#c9a04e]/55 shadow-[0_12px_28px_rgba(0,0,0,0.65)] pointer-events-auto will-change-transform"
                  >
                    <div
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-[#c9a04e]/60 shadow-inner shrink-0"
                      style={{
                        background:
                          'linear-gradient(135deg, #7e8c79 0%, #8a5a36 100%)',
                      }}
                    />
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] uppercase tracking-wider text-[#c9a04e] font-bold">
                        Acabamento Real
                      </span>
                      <span className="text-[11px] sm:text-xs font-serif-atelier font-semibold text-[#f2e8d8]">
                        Verde-Sálvia &amp; Freijó
                      </span>
                    </div>
                  </div>

                  {/* Cartão 2: Bancada & Luz (Conectado ao Fio 2) */}
                  <div
                    ref={swatch2Ref}
                    className="flex absolute top-[39%] -right-2 sm:-right-8 items-center gap-2.5 p-2 sm:p-2.5 pr-3.5 rounded-xl bg-[#1d1612]/95 backdrop-blur-md border border-[#c9a04e]/55 shadow-[0_12px_28px_rgba(0,0,0,0.65)] pointer-events-auto will-change-transform"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#23201d] border border-[#c9a04e]/60 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-[#c9a04e]" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] uppercase tracking-wider text-[#c9a04e] font-bold">
                        Bancada &amp; Luz
                      </span>
                      <span className="text-[11px] sm:text-xs font-serif-atelier font-semibold text-[#f2e8d8]">
                        Granito Preto &amp; Fita LED
                      </span>
                    </div>
                  </div>

                  {/* Cartão 3: Ilha Central sob Medida (Conectado ao Fio 3) */}
                  <div
                    ref={swatch3Ref}
                    className="flex absolute bottom-[18%] -left-2 sm:-left-8 items-center gap-2.5 p-2 sm:p-2.5 pr-3.5 rounded-xl bg-[#1d1612]/95 backdrop-blur-md border border-[#c9a04e]/55 shadow-[0_12px_28px_rgba(0,0,0,0.65)] pointer-events-auto will-change-transform"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#c9a04e] text-[#15100c] flex items-center justify-center font-bold shrink-0">
                      <Layers className="w-4 h-4 text-[#15100c]" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] uppercase tracking-wider text-[#c9a04e] font-bold">
                        Ilha Central
                      </span>
                      <span className="text-[11px] sm:text-xs font-semibold text-[#f2e8d8]">
                        Marcenaria Sob Medida
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sombra elíptica no chão sob a imagem flutuante */}
              <div
                ref={archShadowRef}
                aria-hidden="true"
                className="w-[86%] h-7 mx-auto -mt-3.5 bg-black/85 rounded-[100%] blur-md pointer-events-none will-change-transform"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. FAIXA DIAGONAL DE LATÃO DOURADO (De ponta a ponta, estilo 1º commit)   */}
      {/* ========================================================================= */}
      <div
        ref={ribbonContainerRef}
        className="relative mt-8 sm:mt-12 z-30 w-full overflow-hidden py-10 sm:py-14 pointer-events-none select-none will-change-transform"
      >
        <div className="w-[160vw] -left-[30vw] relative py-2.5 border-y border-[#c9a04e]/60 bg-[#15100c]/90 text-[#c9a04e] text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] whitespace-nowrap transform rotate-[-2deg]">
          <div
            ref={marqueeTrack2Ref}
            className="flex items-center w-max will-change-transform"
          >
            <span className="inline-block pr-6 whitespace-nowrap">
              {subMarqueeItem.repeat(10)}
            </span>
            <span
              className="inline-block pr-6 whitespace-nowrap"
              aria-hidden="true"
            >
              {subMarqueeItem.repeat(10)}
            </span>
          </div>
        </div>

        <div className="w-[160vw] -left-[30vw] relative py-4 sm:py-4.5 bg-[#c9a04e] text-[#15100c] font-black uppercase text-xs sm:text-sm tracking-[0.25em] shadow-[0_10px_35px_rgba(0,0,0,0.5)] whitespace-nowrap transform rotate-[-2.8deg] -mt-3">
          <div
            ref={marqueeTrack1Ref}
            className="flex items-center w-max will-change-transform"
          >
            <span className="inline-block pr-6 whitespace-nowrap">
              {marqueeItem.repeat(10)}
            </span>
            <span
              className="inline-block pr-6 whitespace-nowrap"
              aria-hidden="true"
            >
              {marqueeItem.repeat(10)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
