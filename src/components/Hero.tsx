import React, { useEffect, useRef } from 'react';
import { Ruler, Camera, MessageSquare } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PlantaCozinha } from './hero/PlantaCozinha';
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

  // 3 Mouse Parallax Layers (igual ao commit bc0aefc, aprimorado)
  const layerOutlineRef = useRef<HTMLDivElement>(null);
  const layerArchRef = useRef<HTMLDivElement>(null);
  const layerSwatchesRef = useRef<HTMLDivElement>(null);

  // Floating & Shadow refs
  const archInnerRef = useRef<HTMLDivElement>(null);
  const archShadowRef = useRef<HTMLDivElement>(null);
  const swatch1Ref = useRef<HTMLDivElement>(null);
  const swatch2Ref = useRef<HTMLDivElement>(null);
  const swatch3Ref = useRef<HTMLDivElement>(null);

  // Planta baixa da cozinha e brilho LED dentro do arco flutuante
  const svgRef = useRef<SVGSVGElement>(null);
  const plantaContainerRef = useRef<HTMLDivElement>(null);
  const brilhoLedRef = useRef<HTMLDivElement>(null);
  const avisoLarguraExibidoRef = useRef(false);

  // Marquee Ribbons
  const ribbonContainerRef = useRef<HTMLDivElement>(null);
  const marqueeTrack1Ref = useRef<HTMLDivElement>(null);
  const marqueeTrack2Ref = useRef<HTMLDivElement>(null);

  const marqueeItem =
    'SOB MEDIDA ✳ ARQUITETURA E MARCENARIA ✳ PROJETO 3D ✳ JAÚ E REGIÃO ✳ ';
  const subMarqueeItem =
    'OFICINA PRÓPRIA ✳ RIPADO DE MADEIRA ✳ GRANITO E ILUMINAÇÃO LED ✳ DESDE 2015 ✳ ';

  const handleHeroImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (
      img.naturalWidth > 0 &&
      img.naturalWidth < 1600 &&
      !avisoLarguraExibidoRef.current
    ) {
      avisoLarguraExibidoRef.current = true;
      console.warn(
        `[Império Hero] A foto tem ${img.naturalWidth}px de largura (< 1600px recomendados). Exibindo com image-rendering: auto.`
      );
    }
  };

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
        if (plantaContainerRef.current) {
          gsap.set(plantaContainerRef.current, { opacity: 0.42 });
        }
        if (brilhoLedRef.current) {
          gsap.set(brilhoLedRef.current, { opacity: 1 });
        }
        return;
      }

      // Preparação do traço da planta baixa da cozinha com cotas (medidas da ilha)
      const gruposPlanta = [
        '.planta-paredes .traco-desenho',
        '.planta-bancada .traco-desenho',
        '.planta-ilha .traco-desenho',
        '.planta-cotas-linhas .traco-desenho',
      ];
      gruposPlanta.forEach((seletor) => {
        svgRef.current
          ?.querySelectorAll<SVGGeometryElement>(seletor)
          .forEach((el) => {
            const comp = el.getTotalLength ? el.getTotalLength() : 600;
            gsap.set(el, { strokeDasharray: comp, strokeDashoffset: comp });
          });
      });
      const textosCota = svgRef.current?.querySelectorAll(
        '.planta-cotas-textos text'
      );
      if (textosCota && textosCota.length > 0) {
        gsap.set(textosCota, { opacity: 0 });
      }
      if (brilhoLedRef.current) {
        gsap.set(brilhoLedRef.current, { opacity: 0 });
      }

      // =======================================================================
      // 1. TIMELINE DE ENTRADA FLUIDA + DESENHO DO PROJETO DA ILHA
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

      // (b) Linhas do Título revelando por máscara (translateY 100% -> 0, stagger 0.1s)
      masterTl.fromTo(
        ['.hero-line-1', '.hero-line-2', '.hero-line-3'],
        { y: '105%' },
        { y: '0%', duration: 0.95, stagger: 0.1, ease: 'power3.out' },
        0.15
      );

      // (c) Subtítulo
      masterTl.fromTo(
        '.hero-desc',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.75 },
        0.55
      );

      // (d) CTAs (Orçamento + Obras + Instagram)
      masterTl.fromTo(
        '.hero-ctas',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.75 },
        0.7
      );

      // (e) Indicação discreta de rolagem
      masterTl.fromTo(
        '.hero-scroll-ind',
        { opacity: 0 },
        { opacity: 0.7, duration: 0.6 },
        0.9
      );

      // (f) Palavra gigante IMPÉRIO em amarelo/dourado brilhante atrás da imagem flutuante
      if (layerOutlineRef.current) {
        masterTl.fromTo(
          layerOutlineRef.current,
          { opacity: 0, scale: 0.9, y: 28 },
          { opacity: 0.95, scale: 1, y: 0, duration: 1.3, ease: 'power2.out' },
          0.1
        );
      }

      // (g) Imagem principal flutuante em arco (maior): entrada com spring
      if (layerArchRef.current) {
        masterTl.fromTo(
          layerArchRef.current,
          { opacity: 0, y: 80, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 1.25, ease: 'back.out(1.45)' },
          0.18
        );
      }

      // (h) Sombra elíptica no chão abre junto com o objeto
      if (archShadowRef.current) {
        masterTl.fromTo(
          archShadowRef.current,
          { opacity: 0, scale: 0.4 },
          { opacity: 0.85, scale: 1, duration: 1.25, ease: 'back.out(1.45)' },
          0.18
        );
      }

      // (i) Desenho da planta baixa medindo a cozinha e a ilha sobre a imagem flutuante
      masterTl
        .to(
          '.planta-paredes .traco-desenho',
          { strokeDashoffset: 0, duration: 0.55, stagger: 0.06 },
          0.45
        )
        .to(
          '.planta-bancada .traco-desenho',
          { strokeDashoffset: 0, duration: 0.55, stagger: 0.04 },
          0.7
        )
        .to(
          '.planta-ilha .traco-desenho',
          { strokeDashoffset: 0, duration: 0.55, stagger: 0.03 },
          0.95
        )
        .to(
          '.planta-cotas-linhas .traco-desenho',
          { strokeDashoffset: 0, duration: 0.45, stagger: 0.03 },
          1.25
        );

      if (textosCota && textosCota.length > 0) {
        masterTl.to(
          textosCota,
          { opacity: 1, duration: 0.4, stagger: 0.05 },
          1.4
        );
      }

      // Ao concluir o traçado da planta, acende o brilho de LED sobre a ilha e suaviza a planta para 42%
      if (plantaContainerRef.current) {
        masterTl.to(
          plantaContainerRef.current,
          { opacity: 0.42, duration: 0.9, ease: 'power2.out' },
          2.1
        );
      }
      if (brilhoLedRef.current) {
        masterTl.to(
          brilhoLedRef.current,
          { opacity: 1, duration: 0.85, ease: 'power2.out' },
          1.85
        );
      }

      // (j) 3 Amostras dos materiais reais da foto e medição da ilha entram em sequência
      const swatches = [
        swatch1Ref.current,
        swatch2Ref.current,
        swatch3Ref.current,
      ].filter(Boolean);
      if (swatches.length > 0) {
        masterTl.fromTo(
          swatches,
          { opacity: 0, scale: 0.4, y: 25 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.14,
            ease: 'back.out(1.8)',
          },
          0.75
        );
      }

      // (k) Faixa diagonal desliza na base
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
            y: -14,
            rotation: 1.3,
            duration: 3.2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        }

        if (archShadowRef.current) {
          gsap.to(archShadowRef.current, {
            scale: 0.85,
            opacity: 0.5,
            duration: 3.2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        }

        if (!isMobile) {
          if (swatch1Ref.current) {
            gsap.to(swatch1Ref.current, {
              y: -10,
              rotation: -2.5,
              duration: 4.1,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
            });
          }

          if (swatch2Ref.current) {
            gsap.to(swatch2Ref.current, {
              y: 12,
              rotation: 2.4,
              duration: 4.8,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
              delay: 0.4,
            });
          }

          if (swatch3Ref.current) {
            gsap.to(swatch3Ref.current, {
              y: -9,
              rotation: -2.0,
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
          y: -65,
          scale: 1.05,
          rotation: 2.5,
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
          y: 40,
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
          y: 80,
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
              x: normX * 20,
              y: normY * 16,
              duration: 0.65,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          }

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
        className="absolute top-1/2 right-[2%] sm:right-[8%] -translate-y-1/2 w-[580px] sm:w-[780px] h-[580px] sm:h-[780px] rounded-full pointer-events-none opacity-65 z-0"
        style={{
          background:
            'radial-gradient(circle, rgba(201, 160, 78, 0.24) 0%, rgba(201, 160, 78, 0.08) 42%, rgba(21, 16, 12, 0) 70%)',
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

      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* ========================================================================= */}
          {/* COLUNA ESQUERDA: Rótulo + Título Animado + Subtítulo + CTAs + Instagram   */}
          {/* ========================================================================= */}
          <div
            ref={textColRef}
            className="lg:col-span-6 flex flex-col items-start space-y-6 sm:space-y-7 z-10 will-change-transform"
          >
            {/* Rótulo superior em caixa-alta espaçada */}
            <div className="hero-eyebrow inline-flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#c9a04e] shadow-[0_0_8px_rgba(201,160,78,0.8)]" />
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#c9a04e] uppercase">
                MARCENARIA E ARQUITETURA — JAÚ E REGIÃO
              </span>
            </div>

            {/* H1 com Revelação por Máscara nas 3 Linhas */}
            <h1 className="font-serif-atelier font-bold text-[#f2e8d8] text-[clamp(2.85rem,6.8vw,6.8rem)] leading-[0.98] tracking-tight">
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

            {/* Subtítulo aprovado */}
            <p className="hero-desc text-base sm:text-lg lg:text-xl text-[#f2e8d8]/85 leading-relaxed max-w-xl font-light">
              A Tatiane projeta, o Wellington fabrica. Cozinhas, quartos, closets e lojas em Jaú e região com precisão milimétrica desde 2015.
            </p>

            {/* CTAs: WhatsApp / Orçamento + Ver as Obras + Instagram Oficial */}
            <div className="hero-ctas flex flex-wrap items-center gap-3.5 sm:gap-4 w-full pt-2">
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
          {/* COLUNA DIREITA: Palavra IMPÉRIO + Imagem Flutuante Maior + Planta + Chips */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 relative flex flex-col items-center justify-center mt-8 lg:mt-0">
            {/* Camada 1 (Mouse Parallax): Palavra "IMPÉRIO" Gigante atrás da Imagem Flutuante */}
            <div
              ref={layerOutlineRef}
              aria-hidden="true"
              className="absolute -top-12 sm:-top-16 left-1/2 -translate-x-1/2 w-[120%] text-center pointer-events-none select-none z-0 will-change-transform"
            >
              <span className="text-[clamp(5.2rem,14vw,12.8rem)] font-serif-atelier font-black uppercase tracking-[0.13em] leading-none block text-[#fed488] drop-shadow-[0_10px_40px_rgba(201,160,78,0.45)] opacity-95">
                IMPÉRIO
              </span>
            </div>

            {/* Camada 2 (Spring Drop + Float Contínuo + Mouse Parallax): Imagem Flutuante Maior em Arco */}
            <div
              ref={layerArchRef}
              className="relative z-10 w-full max-w-[420px] sm:max-w-[500px] lg:max-w-[520px] will-change-transform"
            >
              <div ref={archInnerRef} className="will-change-transform">
                <div className="relative w-full aspect-[3.4/4.3] rounded-[999px_999px_28px_28px] overflow-hidden border border-[#c9a04e]/50 shadow-[0_32px_90px_rgba(0,0,0,0.88)] bg-[#1d1612]">
                  {/* Foto 4K da Cozinha Real */}
                  <Foto
                    srcBase="/obras/cozinha-gringa-4k"
                    alt="Cozinha planejada com ilha em verde-sálvia, ripado de madeira, bancada em granito e LED executada pela Império em Jaú"
                    prioridade
                    sizes="(min-width: 1024px) 520px, 92vw"
                    className="w-full h-full"
                    onImgLoad={handleHeroImageLoad}
                    imgStyle={{
                      objectFit: 'cover',
                      objectPosition: '50% 60%',
                      imageRendering: 'auto',
                    }}
                  />

                  {/* Brilho de LED quente acendendo sobre a ilha */}
                  <div
                    ref={brilhoLedRef}
                    aria-hidden="true"
                    className="absolute inset-x-[10%] bottom-[16%] h-[45%] pointer-events-none z-10"
                    style={{
                      background:
                        'radial-gradient(ellipse at 50% 55%, rgba(212, 168, 79, 0.28) 0%, rgba(212, 168, 79, 0.10) 45%, transparent 72%)',
                    }}
                  />

                  {/* Degradê interno sutil para leitura da planta no topo e da legenda na base */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#15100c]/90 via-[#15100c]/15 to-[#15100c]/45 pointer-events-none"
                  />

                  {/* Planta Técnica da Cozinha em L com Medidas da Ilha (2,40m x 0,95m) desenhada sobre o arco */}
                  <div
                    ref={plantaContainerRef}
                    className="absolute top-8 inset-x-6 sm:inset-x-10 z-20 pointer-events-none"
                  >
                    <PlantaCozinha svgRef={svgRef} />
                  </div>

                  {/* Legenda no rodapé interno do arco flutuante */}
                  <div className="absolute bottom-5 left-5 right-5 z-20 flex items-center justify-between text-[#f2e8d8] text-xs">
                    <div>
                      <p className="font-serif-atelier font-bold text-sm sm:text-base text-[#f2e8d8]">
                        Cozinha Gourmet Jaú
                      </p>
                      <p className="text-[11px] text-[#c9a04e]">
                        Ilha em Verde-Sálvia, Ripado &amp; Granito Preto
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-[10px] uppercase font-mono tracking-wider border border-[#c9a04e]/40 text-[#c9a04e]">
                      Jaú/SP
                    </span>
                  </div>
                </div>
              </div>

              {/* Sombra elíptica no chão sob a imagem flutuante */}
              <div
                ref={archShadowRef}
                aria-hidden="true"
                className="w-[84%] h-7 mx-auto -mt-3.5 bg-black/85 rounded-[100%] blur-md pointer-events-none will-change-transform"
              />

              {/* ===================================================================== */}
              {/* Camada 3 (Mouse Parallax + Float): Materiais Reais da Foto & Medição  */}
              {/* ===================================================================== */}
              <div
                ref={layerSwatchesRef}
                className="absolute inset-0 pointer-events-none will-change-transform"
              >
                {/* Material 1: Ripado de Madeira & Verde-Sálvia (Superior Esquerda) */}
                <div
                  ref={swatch1Ref}
                  className="flex absolute top-8 sm:top-12 -left-2 sm:-left-10 z-30 items-center gap-2.5 p-2 sm:p-2.5 pr-3.5 rounded-xl bg-[#1d1612]/92 backdrop-blur-md border border-[#c9a04e]/45 shadow-[0_12px_24px_rgba(0,0,0,0.55)] pointer-events-auto will-change-transform"
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
                      Ripado &amp; Verde-Sálvia
                    </span>
                  </div>
                </div>

                {/* Material 2: Granito Preto & Fita de LED (Centro Direita) */}
                <div
                  ref={swatch2Ref}
                  className="flex absolute top-[44%] -right-2 sm:-right-10 z-30 items-center gap-2.5 p-2 sm:p-2.5 pr-3.5 rounded-xl bg-[#1d1612]/92 backdrop-blur-md border border-[#c9a04e]/45 shadow-[0_12px_24px_rgba(0,0,0,0.55)] pointer-events-auto will-change-transform"
                >
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-[#c9a04e]/60 shadow-inner shrink-0"
                    style={{
                      background:
                        'linear-gradient(135deg, #2b2b29 0%, #141413 70%, #d4a84f 100%)',
                    }}
                  />
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] uppercase tracking-wider text-[#c9a04e] font-bold">
                      Bancada &amp; Luz
                    </span>
                    <span className="text-[11px] sm:text-xs font-serif-atelier font-semibold text-[#f2e8d8]">
                      Granito Preto &amp; LED
                    </span>
                  </div>
                </div>

                {/* Material 3: Cota da Ilha & Precisão 1mm (Inferior Esquerda) */}
                <div
                  ref={swatch3Ref}
                  className="flex absolute bottom-16 sm:bottom-12 -left-2 sm:-left-8 z-30 items-center gap-2.5 p-2 sm:p-2.5 pr-3.5 rounded-xl bg-[#1d1612]/92 backdrop-blur-md border border-[#c9a04e]/45 shadow-[0_12px_24px_rgba(0,0,0,0.55)] pointer-events-auto will-change-transform"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#c9a04e] text-[#15100c] flex items-center justify-center font-bold shrink-0">
                    <Ruler className="w-4 h-4 text-[#15100c]" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] uppercase tracking-wider text-[#c9a04e] font-bold">
                      Planta da Ilha
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold text-[#f2e8d8]">
                      2,40m × 0,95m (1mm)
                    </span>
                  </div>
                </div>
              </div>
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
