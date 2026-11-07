import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PlantaCozinha } from './hero/PlantaCozinha';
import { Foto } from './Foto';
import { getWhatsAppUrl } from '../utils/helpers';
import { scrollToTarget } from '../hooks/useScrollytelling';

gsap.registerPlugin(ScrollTrigger);

export const Hero: React.FC = () => {
  const secaoRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const plantaContainerRef = useRef<HTMLDivElement>(null);
  const brilhoLedRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const avisoLarguraExibidoRef = useRef(false);

  const handleHeroImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth > 0 && img.naturalWidth < 1600 && !avisoLarguraExibidoRef.current) {
      avisoLarguraExibidoRef.current = true;
      console.warn(
        `[Império Hero] A foto "cozinha-ilha-ripado" tem ${img.naturalWidth}px de largura (< 1600px recomendados). Exibindo com image-rendering: auto sem aumento artificial.`
      );
    }
  };

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReduced) {
        if (plantaContainerRef.current) {
          gsap.set(plantaContainerRef.current, { opacity: 0.25 });
        }
        if (brilhoLedRef.current) {
          gsap.set(brilhoLedRef.current, { opacity: 1 });
        }
        return;
      }

      const grupos = [
        '.planta-paredes .traco-desenho',
        '.planta-bancada .traco-desenho',
        '.planta-ilha .traco-desenho',
        '.planta-cotas-linhas .traco-desenho',
      ];

      grupos.forEach((seletor) => {
        svgRef.current?.querySelectorAll<SVGGeometryElement>(seletor).forEach((el) => {
          const comp = el.getTotalLength ? el.getTotalLength() : 600;
          gsap.set(el, { strokeDasharray: comp, strokeDashoffset: comp });
        });
      });

      const textosCota = svgRef.current?.querySelectorAll('.planta-cotas-textos text');
      if (textosCota && textosCota.length > 0) gsap.set(textosCota, { opacity: 0 });
      if (brilhoLedRef.current) gsap.set(brilhoLedRef.current, { opacity: 0 });
      if (chipsRef.current) gsap.set(chipsRef.current, { opacity: 0 });

      // 1. Nos primeiros 2s: desenha a planta em L com 3 cotas em traço --dourado (1.5px)
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to('.planta-paredes .traco-desenho', { strokeDashoffset: 0, duration: 0.55, stagger: 0.08 }, 0)
        .to('.planta-bancada .traco-desenho', { strokeDashoffset: 0, duration: 0.55, stagger: 0.04 }, 0.35)
        .to('.planta-ilha .traco-desenho', { strokeDashoffset: 0, duration: 0.55, stagger: 0.03 }, 0.8)
        .to('.planta-cotas-linhas .traco-desenho', { strokeDashoffset: 0, duration: 0.45, stagger: 0.03 }, 1.3);

      if (textosCota && textosCota.length > 0) {
        tl.to(textosCota, { opacity: 1, duration: 0.4, stagger: 0.06 }, 1.5);
      }

      // 2. Ao terminar o desenho (2.0s): a planta se apaga devagar até 25% de opacidade e fica como anotação,
      // enquanto o brilho de LED (--luz-brilho) acende junto da ilha de ripado e os chips aparecem.
      if (plantaContainerRef.current) {
        tl.to(
          plantaContainerRef.current,
          { opacity: 0.25, duration: 1.1, ease: 'power2.out' },
          2.0
        );
      }

      if (brilhoLedRef.current) {
        tl.to(
          brilhoLedRef.current,
          { opacity: 1, duration: 0.9, ease: 'power2.out' },
          2.0
        );
      }

      if (chipsRef.current) {
        tl.to(
          chipsRef.current,
          { opacity: 1, duration: 0.7, ease: 'power2.out' },
          2.05
        );
      }

      // 3. Transição curta ao rolar (máximo 40vh, sem pin longo)
      if (secaoRef.current && plantaContainerRef.current) {
        gsap.to(plantaContainerRef.current, {
          yPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: secaoRef.current,
            start: 'top top',
            end: '+=40%',
            scrub: true,
          },
        });
      }
    }, secaoRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={secaoRef}
      id="hero"
      data-tema="noite"
      className="relative w-full min-h-screen bg-preto text-papel flex items-end overflow-hidden"
    >
      {/* 1. Foto real da cozinha em tela cheia (enquadrando ilha de ripado e granito preto) */}
      <div className="absolute inset-0 z-0">
        <Foto
          srcBase="/obras/cozinha-ilha-ripado"
          alt="Cozinha planejada com ilha de ripado de madeira e tampo de granito preto executada pela Império em Jaú"
          prioridade
          sizes="100vw"
          className="w-full h-full"
          onImgLoad={handleHeroImageLoad}
          imgStyle={{
            objectFit: 'cover',
            objectPosition: '32% 72%',
            imageRendering: 'auto',
          }}
        />

        {/* Degradê sutil apenas na base (atrás do título) e leve vinheta no topo para o cabeçalho transparente */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(10,10,10,0.48) 0%, rgba(10,10,10,0) 18%, rgba(10,10,10,0) 44%, rgba(10,10,10,0.58) 72%, rgba(10,10,10,0.92) 100%)',
          }}
        />
      </div>

      {/* 2. Brilho de LED (--luz-brilho) que acende junto da ilha de ripado ao fim do desenho */}
      <div
        ref={brilhoLedRef}
        aria-hidden="true"
        className="absolute z-10 pointer-events-none inset-x-[8%] bottom-[12%] h-[46%] md:left-[18%] md:right-[18%] md:bottom-[14%] md:h-[48%]"
        style={{
          background:
            'radial-gradient(ellipse at 50% 55%, var(--luz-brilho) 0%, rgba(212, 168, 79, 0.10) 42%, transparent 72%)',
        }}
      />

      {/* 3. Planta baixa da cozinha em L na metade direita (desenha em --dourado nos primeiros 2s e fica em 25%) */}
      <div
        ref={plantaContainerRef}
        className="absolute z-10 pointer-events-none right-16 sm:right-32 top-80 md:top-[14%] w-[86%] sm:w-[62%] lg:w-[46%] max-w-[620px]"
      >
        <PlantaCozinha svgRef={svgRef} />
      </div>

      {/* 4. Dois chips informativos ("Ripado de madeira" e "Granito preto") ligados à foto por linha de lápis curta */}
      <div
        ref={chipsRef}
        className="absolute inset-0 z-20 pointer-events-none max-w-[1280px] mx-auto"
      >
        {/* Chip 1: Granito preto (aponta para o tampo da ilha) */}
        <div className=" hidden sm:flex items-center absolute right-[12%] md:right-[18%] top-[48%] md:top-[46%]">
          <svg
            width="56"
            height="28"
            viewBox="0 0 56 28"
            fill="none"
            aria-hidden="true"
            className="overflow-visible shrink-0"
          >
            <g filter="url(#filtro-lapis)" stroke="var(--dourado)" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="4" cy="22" r="3" fill="var(--dourado)" />
              <path d="M 4 22 L 24 8 L 54 8" />
            </g>
          </svg>
          <span className="bg-preto text-papel border border-papel/30 rounded-curto px-12 py-4 tipo-cota">
            Granito preto
          </span>
        </div>

        {/* Chip 2: Ripado de madeira (aponta para o corpo ripado da ilha) */}
        <div className="flex items-center absolute right-16 sm:right-[10%] md:right-[14%] bottom-[38%] sm:bottom-[28%] md:bottom-[26%]">
          <svg
            width="56"
            height="28"
            viewBox="0 0 56 28"
            fill="none"
            aria-hidden="true"
            className="overflow-visible shrink-0"
          >
            <g filter="url(#filtro-lapis)" stroke="var(--dourado)" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="4" cy="6" r="3" fill="var(--dourado)" />
              <path d="M 4 6 L 22 18 L 54 18" />
            </g>
          </svg>
          <span className="bg-preto text-papel border border-papel/30 rounded-curto px-12 py-4 tipo-cota">
            Ripado de madeira
          </span>
        </div>
      </div>

      {/* 5. Conteúdo principal alinhado à esquerda embaixo */}
      <div className="relative z-30 max-w-[1280px] w-full mx-auto px-16 sm:px-32 pb-48 md:pb-64 pt-144">
        <div className="max-w-3xl flex flex-col items-start gap-24 text-left">
          {/* Chips visíveis também em telas muito estreitas (<640px) com linha curta */}
          <div className="flex sm:hidden flex-wrap items-center gap-8">
            <span className="inline-flex items-center gap-8 bg-preto text-papel border border-papel/30 rounded-curto px-12 py-4 tipo-cota">
              <span className="w-8 h-[1.5px] bg-dourado inline-block" />
              Ripado de madeira
            </span>
            <span className="inline-flex items-center gap-8 bg-preto text-papel border border-papel/30 rounded-curto px-12 py-4 tipo-cota">
              <span className="w-8 h-[1.5px] bg-dourado inline-block" />
              Granito preto
            </span>
          </div>

          {/* Título em display, --papel, alinhado à esquerda embaixo, MÁXIMO 3 linhas */}
          <h1
            className="tipo-display text-papel"
            style={{
              fontSize: 'clamp(3rem, 7.5vw, 7rem)',
              textWrap: 'balance',
            }}
          >
            <span className="block">Arquitetura e</span>
            <span className="block">marcenaria na</span>
            <span className="block">mesma mesa.</span>
          </h1>

          <p className="tipo-corpo text-papel/90">
            A Tatiane projeta, o Wellington fabrica. Cozinhas, quartos, closets e lojas em Jaú e região.
          </p>

          <div className="flex flex-wrap items-center gap-16 pt-4">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-24 h-[52px] rounded-curto bg-dourado text-preto hover:bg-preto hover:text-dourado border border-dourado transition-colors duration-200 tipo-cota font-semibold"
            >
              Chamar no WhatsApp
            </a>

            <button
              type="button"
              onClick={() => scrollToTarget('#obras', -72)}
              className="inline-flex items-center justify-center px-24 h-[52px] rounded-curto border-[1.5px] border-papel bg-transparent text-papel hover:bg-papel hover:text-preto transition-colors duration-200 tipo-cota cursor-pointer"
            >
              Ver as obras
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
