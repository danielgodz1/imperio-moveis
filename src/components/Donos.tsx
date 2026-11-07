import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Foto } from './Foto';

gsap.registerPlugin(ScrollTrigger);

/**
 * Coordenadas do holofote sobre a foto `fundadores` (666x1178).
 * Mantidas no topo do arquivo para ajuste fino ou futura troca por retratos individuais.
 */
export const COORDENADAS_HOLOFOTE = {
  wellington: { x: 50, y: 25, raio: 38 },
  tatiane: { x: 70, y: 47, raio: 38 },
  juntos: { x: 58, y: 40, raio: 150 },
} as const;

export interface RetratoHolofoteProps {
  srcBase: string;
  alt: string;
  proporcao?: string;
  x: number;
  y: number;
  raio: number;
  camadaColoridaRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
}

export const RetratoHolofote: React.FC<RetratoHolofoteProps> = ({
  srcBase,
  alt,
  proporcao = '666 / 1178',
  x,
  y,
  raio,
  camadaColoridaRef,
  className = '',
}) => {
  const gradienteMascara = `radial-gradient(circle at ${x}% ${y}%, #000000 0%, #000000 ${
    raio * 0.65
  }%, transparent ${raio}%)`;

  return (
    <div
      className={`relative overflow-hidden bg-preto select-none ${className}`}
      style={{ aspectRatio: proporcao }}
    >
      {/* Camada Base: escala de cinza com brilho reduzido */}
      <div className="w-full h-full [filter:grayscale(1)_brightness(0.55)]">
        <Foto
          srcBase={srcBase}
          alt={alt}
          proporcao={proporcao}
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="w-full h-full"
        />
      </div>

      {/* Camada Superior Colorida: revelada pela máscara radial animada */}
      <div
        ref={camadaColoridaRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none will-change-transform"
        style={{
          maskImage: gradienteMascara,
          WebkitMaskImage: gradienteMascara,
        }}
      >
        <Foto
          srcBase={srcBase}
          alt=""
          proporcao={proporcao}
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

const MARCOS_LINHA_TEMPO = [
  {
    titulo: 'Auxiliar de marcenaria em Jaú',
    detalhe: 'Wellington inicia o ofício numa marcenaria pequena da cidade.',
  },
  {
    titulo: 'Primeiros projetos próprios',
    detalhe: 'Mais de 15 anos de evolução prática no chão de oficina.',
  },
  {
    titulo: '2015 [CONFIRMAR o que aconteceu]',
    detalhe: 'Atuação consolidada no ramo em Jaú e região.',
  },
  {
    titulo: 'Marcenaria e arquitetura juntas',
    detalhe: 'Tatiane na arquitetura e logística; Wellington na fabricação.',
  },
];

export const Donos: React.FC = () => {
  const secaoRef = useRef<HTMLElement>(null);
  const palcoDesktopRef = useRef<HTMLDivElement>(null);
  const mascaraDesktopRef = useRef<HTMLDivElement>(null);
  const mascaraMobileRef = useRef<HTMLDivElement>(null);
  const linhaTempoPathRef = useRef<SVGPathElement>(null);

  const bloco1DesktopRef = useRef<HTMLDivElement>(null);
  const bloco2DesktopRef = useRef<HTMLDivElement>(null);
  const bloco3DesktopRef = useRef<HTMLDivElement>(null);

  const bloco1MobileRef = useRef<HTMLDivElement>(null);
  const bloco2MobileRef = useRef<HTMLDivElement>(null);
  const bloco3MobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 1024;

    const aplicarMascara = (
      el: HTMLDivElement | null,
      x: number,
      y: number,
      raio: number
    ) => {
      if (!el) return;
      const g = `radial-gradient(circle at ${x}% ${y}%, #000000 0%, #000000 ${
        raio * 0.65
      }%, transparent ${raio}%)`;
      el.style.maskImage = g;
      el.style.webkitMaskImage = g;
    };

    const ctx = gsap.context(() => {
      if (prefersReduced) {
        aplicarMascara(
          mascaraDesktopRef.current,
          COORDENADAS_HOLOFOTE.juntos.x,
          COORDENADAS_HOLOFOTE.juntos.y,
          COORDENADAS_HOLOFOTE.juntos.raio
        );
        aplicarMascara(
          mascaraMobileRef.current,
          COORDENADAS_HOLOFOTE.juntos.x,
          COORDENADAS_HOLOFOTE.juntos.y,
          COORDENADAS_HOLOFOTE.juntos.raio
        );
        if (linhaTempoPathRef.current) {
          gsap.set(linhaTempoPathRef.current, { strokeDashoffset: 0 });
        }
        return;
      }

      const estado = {
        x: COORDENADAS_HOLOFOTE.wellington.x,
        y: COORDENADAS_HOLOFOTE.wellington.y,
        raio: COORDENADAS_HOLOFOTE.wellington.raio,
      };

      if (!isMobile && palcoDesktopRef.current) {
        // Estado inicial no desktop: Wellington visível, Tatiane e Juntos aguardando
        gsap.set(bloco1DesktopRef.current, { opacity: 1, y: 0 });
        gsap.set([bloco2DesktopRef.current, bloco3DesktopRef.current], {
          opacity: 0,
          y: 24,
        });

        if (linhaTempoPathRef.current) {
          gsap.set(linhaTempoPathRef.current, { strokeDashoffset: 400 });
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: palcoDesktopRef.current,
            start: 'top top',
            end: '+=240%',
            pin: true,
            scrub: 0.6,
          },
        });

        // Transição 1 -> 2 (Wellington para Tatiane)
        tl.to(
          estado,
          {
            x: COORDENADAS_HOLOFOTE.tatiane.x,
            y: COORDENADAS_HOLOFOTE.tatiane.y,
            raio: COORDENADAS_HOLOFOTE.tatiane.raio,
            duration: 1,
            ease: 'power2.inOut',
            onUpdate: () => {
              aplicarMascara(mascaraDesktopRef.current, estado.x, estado.y, estado.raio);
            },
          },
          0.3
        )
          .to(
            bloco1DesktopRef.current,
            { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in' },
            0.3
          )
          .to(
            bloco2DesktopRef.current,
            { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
            0.7
          );

        // Transição 2 -> 3 (Tatiane para Juntos + Linha do Tempo)
        tl.to(
          estado,
          {
            x: COORDENADAS_HOLOFOTE.juntos.x,
            y: COORDENADAS_HOLOFOTE.juntos.y,
            raio: COORDENADAS_HOLOFOTE.juntos.raio,
            duration: 1.1,
            ease: 'power2.inOut',
            onUpdate: () => {
              aplicarMascara(mascaraDesktopRef.current, estado.x, estado.y, estado.raio);
            },
          },
          1.6
        )
          .to(
            bloco2DesktopRef.current,
            { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in' },
            1.6
          )
          .to(
            bloco3DesktopRef.current,
            { opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' },
            2.0
          );

        if (linhaTempoPathRef.current) {
          tl.to(
            linhaTempoPathRef.current,
            { strokeDashoffset: 0, duration: 1.8, ease: 'none' },
            0.2
          );
        }
      } else {
        // Mobile: sem pin; foto sticky no topo trocando o holofote conforme os 3 blocos passam
        const animarPara = (alvo: { x: number; y: number; raio: number }) => {
          gsap.to(estado, {
            x: alvo.x,
            y: alvo.y,
            raio: alvo.raio,
            duration: 0.65,
            ease: 'power3.out',
            onUpdate: () => {
              aplicarMascara(mascaraMobileRef.current, estado.x, estado.y, estado.raio);
            },
          });
        };

        if (bloco1MobileRef.current) {
          ScrollTrigger.create({
            trigger: bloco1MobileRef.current,
            start: 'top 75%',
            end: 'bottom 50%',
            onEnter: () => animarPara(COORDENADAS_HOLOFOTE.wellington),
            onEnterBack: () => animarPara(COORDENADAS_HOLOFOTE.wellington),
          });
        }

        if (bloco2MobileRef.current) {
          ScrollTrigger.create({
            trigger: bloco2MobileRef.current,
            start: 'top 75%',
            end: 'bottom 50%',
            onEnter: () => animarPara(COORDENADAS_HOLOFOTE.tatiane),
            onEnterBack: () => animarPara(COORDENADAS_HOLOFOTE.tatiane),
          });
        }

        if (bloco3MobileRef.current) {
          ScrollTrigger.create({
            trigger: bloco3MobileRef.current,
            start: 'top 75%',
            end: 'bottom 50%',
            onEnter: () => animarPara(COORDENADAS_HOLOFOTE.juntos),
            onEnterBack: () => animarPara(COORDENADAS_HOLOFOTE.juntos),
          });
        }
      }
    }, secaoRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={secaoRef}
      id="donos"
      data-tema="noite"
      aria-label="Quem faz a Império: Wellington e Tatiane Cabral"
      className="w-full bg-preto text-papel"
    >
      {/* Layout Desktop: Pin de ~300vh com 3 estados e linha do tempo */}
      <div
        ref={palcoDesktopRef}
        className="hidden lg:flex min-h-screen w-full items-center py-64"
      >
        <div className="max-w-[1280px] w-full mx-auto px-32 grid grid-cols-12 gap-48 items-center">
          {/* Coluna Esquerda (7 colunas): Textos dos 3 estados + Linha do tempo em traço de lápis */}
          <div className="col-span-7 flex flex-col justify-between gap-48">
            <div className="relative min-h-[260px] flex items-center">
              {/* Estado 1: Wellington */}
              <div
                ref={bloco1DesktopRef}
                className="w-full flex flex-col items-start gap-16"
              >
                <h2 className="tipo-h2 text-papel">Wellington Cabral</h2>
                <blockquote className="tipo-voz text-papel/95">
                  “Comecei como auxiliar numa marcenaria pequena aqui em Jaú. Fui aprendendo no chão da oficina e crescendo projeto a projeto, há mais de 15 anos.”
                </blockquote>
                <p className="tipo-cota text-dourado">
                  Marceneiro e fundador [CONFIRMAR e pedir a fala dele]
                </p>
              </div>

              {/* Estado 2: Tatiane */}
              <div
                ref={bloco2DesktopRef}
                className="absolute inset-0 w-full flex flex-col justify-center items-start gap-16"
              >
                <h2 className="tipo-h2 text-papel">Tatiane Cabral</h2>
                <blockquote className="tipo-voz text-papel/95">
                  “Sou arquiteta e estudei logística. Cuido do projeto de interiores e de cada detalhe que deixa o ambiente com a cara de quem mora.”
                </blockquote>
                <p className="tipo-cota text-dourado">
                  Arquiteta e fundadora [CONFIRMAR e pedir a fala dela]
                </p>
              </div>

              {/* Estado 3: Juntos */}
              <div
                ref={bloco3DesktopRef}
                className="absolute inset-0 w-full flex flex-col justify-center items-start gap-16"
              >
                <h2 className="tipo-h1 text-papel">
                  A casa inteira, projetada e construída por quem assina embaixo.
                </h2>
                <p className="tipo-corpo text-papel/85">
                  Da planta de interiores e iluminação até o corte, montagem e entrega final na sua obra em Jaú e região.{' '}
                  <span className="tipo-cota text-dourado">[CONFIRMAR]</span>
                </p>
              </div>
            </div>

            {/* Linha do tempo vertical desenhada a lápis (--dourado sobre --preto) */}
            <div className="relative pl-32 pt-16 border-t border-papel/15">
              <svg
                aria-hidden="true"
                viewBox="0 0 12 400"
                preserveAspectRatio="none"
                className="absolute left-0 top-16 bottom-0 w-3 h-[calc(100%-16px)] overflow-visible"
              >
                <path
                  d="M 6 0 L 6 400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-papel/20"
                />
                <path
                  ref={linhaTempoPathRef}
                  d="M 6 0 L 6 400"
                  pathLength={400}
                  strokeDasharray={400}
                  strokeDashoffset={0}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  filter="url(#traco-lapis)"
                  className="text-dourado"
                />
              </svg>

              <ol className="grid grid-cols-2 gap-x-32 gap-y-24">
                {MARCOS_LINHA_TEMPO.map((marco, idx) => (
                  <li key={idx} className="flex flex-col gap-4">
                    <span className="tipo-h3 text-papel">{marco.titulo}</span>
                    <span className="tipo-cota text-papel/75">{marco.detalhe}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Coluna Direita (5 colunas): Retrato com holofote */}
          <div className="col-span-5">
            <RetratoHolofote
              srcBase="/obras/fundadores"
              alt="Wellington e Tatiane Cabral, fundadores da Império, sorrindo lado a lado"
              x={COORDENADAS_HOLOFOTE.wellington.x}
              y={COORDENADAS_HOLOFOTE.wellington.y}
              raio={COORDENADAS_HOLOFOTE.wellington.raio}
              camadaColoridaRef={mascaraDesktopRef}
              className="w-full max-h-[78vh] halo-luz"
            />
          </div>
        </div>
      </div>

      {/* Layout Celular (< 1024px): Sem pin; foto sticky no topo (60vh) e 3 blocos empilhados */}
      <div className="lg:hidden relative px-16 sm:px-32 py-64">
        <div className="sticky top-64 z-10 h-[56vh] mb-32 bg-preto">
          <RetratoHolofote
            srcBase="/obras/fundadores"
            alt="Wellington e Tatiane Cabral, fundadores da Império, sorrindo lado a lado"
            x={COORDENADAS_HOLOFOTE.wellington.x}
            y={COORDENADAS_HOLOFOTE.wellington.y}
            raio={COORDENADAS_HOLOFOTE.wellington.raio}
            camadaColoridaRef={mascaraMobileRef}
            className="w-full h-full"
          />
        </div>

        <div className="relative z-20 flex flex-col gap-64 bg-preto/95 pt-24">
          <div ref={bloco1MobileRef} className="flex flex-col gap-16 py-24 border-t border-papel/20">
            <h2 className="tipo-h2 text-papel">Wellington Cabral</h2>
            <blockquote className="tipo-voz text-papel/95">
              “Comecei como auxiliar numa marcenaria pequena aqui em Jaú. Fui aprendendo no chão da oficina e crescendo projeto a projeto, há mais de 15 anos.”
            </blockquote>
            <p className="tipo-cota text-dourado">
              Marceneiro e fundador [CONFIRMAR e pedir a fala dele]
            </p>
          </div>

          <div ref={bloco2MobileRef} className="flex flex-col gap-16 py-24 border-t border-papel/20">
            <h2 className="tipo-h2 text-papel">Tatiane Cabral</h2>
            <blockquote className="tipo-voz text-papel/95">
              “Sou arquiteta e estudei logística. Cuido do projeto de interiores e de cada detalhe que deixa o ambiente com a cara de quem mora.”
            </blockquote>
            <p className="tipo-cota text-dourado">
              Arquiteta e fundadora [CONFIRMAR e pedir a fala dela]
            </p>
          </div>

          <div ref={bloco3MobileRef} className="flex flex-col gap-24 py-24 border-t border-papel/20">
            <h2 className="tipo-h2 text-papel">
              A casa inteira, projetada e construída por quem assina embaixo.
            </h2>
            <p className="tipo-corpo text-papel/85">
              Da planta de interiores e iluminação até o corte, montagem e entrega final na sua obra em Jaú e região. [CONFIRMAR]
            </p>

            {/* Linha do tempo vertical mobile */}
            <ol className="relative pl-24 flex flex-col gap-24 border-l-[2px] border-dourado mt-16">
              {MARCOS_LINHA_TEMPO.map((marco, idx) => (
                <li key={idx} className="flex flex-col gap-4">
                  <span className="tipo-h3 text-papel">{marco.titulo}</span>
                  <span className="tipo-cota text-papel/75">{marco.detalhe}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};

