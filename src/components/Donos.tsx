import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Foto } from './Foto';
import { temMovimento, useNivel } from '../vitrine/nivel';
import { FRASE_DESTAQUE_ATUAL } from '../data/frases';

gsap.registerPlugin(ScrollTrigger);

export const COORDENADAS_HOLOFOTE = {
  1: { mx: '46%', my: '24%', r: '34%' },
  2: { mx: '72%', my: '46%', r: '36%' },
  3: { mx: '58%', my: '38%', r: '150%' },
} as const;

export interface RetratoHolofoteProps {
  srcBase: string;
  alt: string;
  proporcao?: string;
  camadaColoridaRef?: React.RefObject<HTMLDivElement | null>;
  onImgLoad?: () => void;
  className?: string;
}

export const RetratoHolofote: React.FC<RetratoHolofoteProps> = ({
  srcBase,
  alt,
  proporcao = '666 / 1178',
  camadaColoridaRef,
  onImgLoad,
  className = '',
}) => {
  const mascaraCss =
    'radial-gradient(circle at var(--mx, 46%) var(--my, 24%), #000 var(--r, 34%), transparent calc(var(--r, 34%) + 18%))';

  return (
    <div
      className={`relative overflow-hidden bg-preto select-none ${className}`}
      style={proporcao ? { aspectRatio: proporcao } : undefined}
    >
      {/* Camada Base: escala de cinza com brilho 0.42 para alto contraste do foco */}
      <div className="w-full h-full [filter:grayscale(1)_brightness(0.42)]">
        <Foto
          srcBase={srcBase}
          alt={alt}
          proporcao={proporcao}
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="w-full h-full"
          imgStyle={{ objectPosition: '50% 22%' }}
          onImgLoad={onImgLoad}
        />
      </div>

      {/* Camada Superior Colorida: controlada pelas variáveis CSS --mx, --my, --r */}
      <div
        ref={camadaColoridaRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={
          {
            '--mx': '46%',
            '--my': '24%',
            '--r': '34%',
            maskImage: mascaraCss,
            WebkitMaskImage: mascaraCss,
          } as React.CSSProperties
        }
      >
        <Foto
          srcBase={srcBase}
          alt=""
          proporcao={proporcao}
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="w-full h-full"
          imgStyle={{ objectPosition: '50% 22%' }}
        />
      </div>
    </div>
  );
};

export const Donos: React.FC = () => {
  // No nível essencial a seção fica estática, como em prefers-reduced-motion.
  const semMovimento = !temMovimento(useNivel());
  const secaoRef = useRef<HTMLElement>(null);
  const mascaraDesktopRef = useRef<HTMLDivElement>(null);
  const mascaraMobileRef = useRef<HTMLDivElement>(null);
  const artigosRef = useRef<Array<HTMLElement | null>>([]);
  const [passoAtivo, setPassoAtivo] = useState<1 | 2 | 3>(1);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Atualiza variáveis CSS --mx, --my, --r via GSAP quando o passo muda
  useEffect(() => {
    const prefersReduced =
      semMovimento || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(prefersReduced);

    const alvos = [mascaraDesktopRef.current, mascaraMobileRef.current].filter(
      Boolean
    ) as HTMLDivElement[];
    if (alvos.length === 0) return;

    if (prefersReduced) {
      alvos.forEach((el) => {
        el.style.setProperty('--mx', COORDENADAS_HOLOFOTE[3].mx);
        el.style.setProperty('--my', COORDENADAS_HOLOFOTE[3].my);
        el.style.setProperty('--r', COORDENADAS_HOLOFOTE[3].r);
      });
      return;
    }

    const coord = COORDENADAS_HOLOFOTE[passoAtivo];
    alvos.forEach((el) => {
      gsap.to(el, {
        '--mx': coord.mx,
        '--my': coord.my,
        '--r': coord.r,
        duration: 0.75,
        ease: 'power3.out',
        overwrite: true,
      });
    });
  }, [passoAtivo, semMovimento]);

  // Cria os ScrollTriggers para os 3 <article data-passo>
  // No celular, o texto fica na metade inferior da tela (abaixo da foto sticky z-30),
  // portanto o gatilho dispara assim que o artigo entra na metade inferior (top 80% -> bottom 55%)!
  useEffect(() => {
    const prefersReduced =
      semMovimento || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setPassoAtivo(3);
      return;
    }

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 1024;
      artigosRef.current.forEach((artigo, index) => {
        if (!artigo) return;
        const numeroPasso = (index + 1) as 1 | 2 | 3;

        ScrollTrigger.create({
          trigger: artigo,
          start: isMobile ? 'top 75%' : 'top 58%',
          end: isMobile ? 'bottom 55%' : 'bottom 45%',
          invalidateOnRefresh: true,
          onToggle: (self) => {
            if (self.isActive) {
              setPassoAtivo(numeroPasso);
            }
          },
        });
      });
    }, secaoRef);

    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    return () => ctx.revert();
  }, []);

  const handleImageLoad = () => {
    ScrollTrigger.refresh();
  };

  const classeOpacidadePasso = (passo: 1 | 2 | 3) => {
    if (reducedMotion || passoAtivo === passo) return 'opacity-100';
    return 'opacity-50';
  };

  return (
    <section
      ref={secaoRef}
      id="donos"
      data-tema="noite"
      aria-label="Quem faz a Império: Wellington e Tatiane Cabral"
      className="w-full bg-preto text-papel py-96 md:py-144"
    >
      <div className="max-w-[1280px] mx-auto px-16 sm:px-32 flex flex-col gap-48">
        <header className="flex flex-col items-start gap-16">
          <h2 className="tipo-display text-papel max-w-[13ch]">Do chão da oficina à casa inteira.</h2>
          <p className="tipo-voz text-papel/85">“{FRASE_DESTAQUE_ATUAL}”</p>
        </header>

        <div className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 lg:gap-48 items-start">
          {/* No celular a foto fica presa no topo e o texto passa abaixo dela */}
          <div className="lg:hidden sticky top-0 z-30 bg-preto pb-8">
            <div className="relative w-full h-[34svh] sm:h-[44svh] overflow-hidden">
              <RetratoHolofote
                srcBase="/obras/fundadores"
                alt="Wellington e Tatiane Cabral, fundadores da Império Móveis Planejados"
                proporcao=""
                camadaColoridaRef={mascaraMobileRef}
                onImgLoad={handleImageLoad}
                className="w-full h-full"
              />
            </div>
          </div>

          <div className="relative z-10 flex flex-col">
            <article
              ref={(el) => {
                artigosRef.current[0] = el;
              }}
              data-passo="1"
              className={`py-32 lg:py-0 lg:min-h-[62vh] flex flex-col justify-center items-start gap-16 transition-opacity duration-500 ${classeOpacidadePasso(1)}`}
            >
              <h3 className="tipo-h1 text-papel">Wellington Cabral</h3>
              <p className="tipo-cota text-dourado">Fundador e marceneiro, mais de 15 anos de ofício</p>
              <blockquote className="tipo-voz text-papel">
                “Comecei como auxiliar numa marcenaria pequena aqui em Jaú. Mas nunca quis só seguir o padrão: quis fazer diferente.”
              </blockquote>
            </article>

            <article
              ref={(el) => {
                artigosRef.current[1] = el;
              }}
              data-passo="2"
              className={`py-32 lg:py-0 lg:min-h-[62vh] flex flex-col justify-center items-start gap-16 transition-opacity duration-500 ${classeOpacidadePasso(2)}`}
            >
              <h3 className="tipo-h1 text-papel">Tatiane Cabral</h3>
              <p className="tipo-cota text-dourado">Arquiteta e designer de interiores</p>
              <blockquote className="tipo-voz text-papel">
                “Interiores, personalização e cada detalhe com a cara de quem vai morar ali.”
              </blockquote>
            </article>

            <article
              ref={(el) => {
                artigosRef.current[2] = el;
              }}
              data-passo="3"
              className={`py-32 lg:py-0 lg:min-h-[62vh] flex flex-col justify-center items-start gap-16 transition-opacity duration-500 ${classeOpacidadePasso(3)}`}
            >
              <h3 className="tipo-h1 text-papel">A casa inteira, do risco à obra.</h3>
              <p className="tipo-corpo text-papel/85">
                Projeto de interiores, iluminação, fabricação própria e montagem em Jaú e região.
              </p>
            </article>
          </div>

          <div className="hidden lg:block sticky top-[12vh] h-[76vh]">
            <RetratoHolofote
              srcBase="/obras/fundadores"
              alt="Wellington e Tatiane Cabral, fundadores da Império Móveis Planejados"
              camadaColoridaRef={mascaraDesktopRef}
              onImgLoad={handleImageLoad}
              className="w-full h-full halo-luz"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
