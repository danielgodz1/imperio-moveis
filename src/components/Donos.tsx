import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Foto } from './Foto';

gsap.registerPlugin(ScrollTrigger);

export const COORDENADAS_HOLOFOTE = {
  1: { mx: '50%', my: '25%', r: '34%' },
  2: { mx: '70%', my: '47%', r: '36%' },
  3: { mx: '58%', my: '40%', r: '150%' },
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
    'radial-gradient(circle at var(--mx, 50%) var(--my, 25%), #000 var(--r, 34%), transparent calc(var(--r, 34%) + 20%))';

  return (
    <div
      className={`relative overflow-hidden bg-preto select-none ${className}`}
      style={{ aspectRatio: proporcao }}
    >
      {/* Camada Base: escala de cinza com brilho 0.5 */}
      <div className="w-full h-full [filter:grayscale(1)_brightness(0.5)]">
        <Foto
          srcBase={srcBase}
          alt={alt}
          proporcao={proporcao}
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="w-full h-full"
          onImgLoad={onImgLoad}
        />
      </div>

      {/* Camada Superior Colorida: controlada apenas pelas variáveis CSS --mx, --my, --r */}
      <div
        ref={camadaColoridaRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={
          {
            '--mx': '50%',
            '--my': '25%',
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
        />
      </div>
    </div>
  );
};

const MARCOS_LINHA_TEMPO = [
  {
    titulo: 'Auxiliar de marcenaria',
    detalhe: 'Wellington inicia o ofício numa marcenaria pequena em Jaú.',
  },
  {
    titulo: 'Fundou a Império',
    detalhe: 'Mais de 15 anos de evolução prática e projetos próprios desde 2015.',
  },
  {
    titulo: 'Projetos da casa inteira com a Tatiane',
    detalhe: 'Arquitetura de interiores, logística e personalização integradas à fábrica.',
  },
  {
    titulo: 'Hoje',
    detalhe: 'Pacote completo de arquitetura e marcenaria para residências e comércios em Jaú e região.',
  },
];

export const Donos: React.FC = () => {
  const secaoRef = useRef<HTMLElement>(null);
  const mascaraDesktopRef = useRef<HTMLDivElement>(null);
  const mascaraMobileRef = useRef<HTMLDivElement>(null);
  const artigosRef = useRef<Array<HTMLElement | null>>([]);
  const [passoAtivo, setPassoAtivo] = useState<1 | 2 | 3>(1);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Atualiza variáveis CSS --mx, --my, --r via GSAP quando o passo muda
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
        duration: 0.9,
        ease: 'power3.out',
        overwrite: true,
      });
    });
  }, [passoAtivo]);

  // Cria os ScrollTriggers para os 3 <article data-passo> sem pin e sem scrub
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setPassoAtivo(3);
      return;
    }

    const ctx = gsap.context(() => {
      artigosRef.current.forEach((artigo, index) => {
        if (!artigo) return;
        const numeroPasso = (index + 1) as 1 | 2 | 3;

        ScrollTrigger.create({
          trigger: artigo,
          start: 'top 62%',
          end: 'bottom 45%',
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
    if (reducedMotion) return 'opacity-100';
    return passoAtivo === passo ? 'opacity-100' : 'opacity-45 lg:opacity-35';
  };

  return (
    <section
      ref={secaoRef}
      id="donos"
      data-tema="noite"
      aria-label="Quem faz a Império: Wellington e Tatiane Cabral"
      className="w-full bg-preto text-papel py-64 md:py-144 border-b border-papel/15"
    >
      <div className="max-w-[1280px] mx-auto px-16 sm:px-32 flex flex-col gap-48 lg:gap-64">
        {/* Frase de abertura da seção */}
        <header className="max-w-3xl flex flex-col items-start gap-16">
          <span className="tipo-cota text-dourado">Quem assina cada projeto</span>
          <h2 className="tipo-h1 text-papel">Do chão da oficina à casa inteira.</h2>
        </header>

        {/*
          Container exclusivo dos 3 passos + foto sticky.
          Como a foto sticky no celular está DENTRO deste bloco, assim que o 3º passo termina,
          a foto para de ficar presa e a seção "Trajetória da Império" abaixo NUNCA passa por trás nem por cima da foto!
        */}
        <div className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-24 lg:gap-48 items-start">
          {/* Foto sticky no topo apenas no celular (< 1024px): contida apenas durante os 3 passos */}
          <div className="lg:hidden sticky top-20 z-10 h-[38vh] sm:h-[44vh] bg-preto rounded-xl overflow-hidden border border-papel/15 shadow-[0_12px_32px_rgba(0,0,0,0.85)]">
            <RetratoHolofote
              srcBase="/obras/fundadores"
              alt="Wellington e Tatiane Cabral, fundadores da Império Móveis Planejados"
              camadaColoridaRef={mascaraMobileRef}
              onImgLoad={handleImageLoad}
              className="w-full h-full"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-preto to-transparent pointer-events-none"
            />
          </div>

          {/* Coluna do texto: 3 blocos <article data-passo> com fundo sólido no celular para leitura perfeita */}
          <div className="relative z-20 flex flex-col gap-24 lg:gap-0 pt-8 lg:pt-0">
            {/* Passo 1: Wellington Cabral */}
            <article
              ref={(el) => {
                artigosRef.current[0] = el;
              }}
              data-passo="1"
              className={`min-h-[42vh] lg:min-h-screen flex flex-col justify-center items-start gap-16 lg:gap-24 p-24 lg:p-0 lg:py-48 rounded-xl lg:rounded-none bg-[#14110f]/95 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border border-papel/15 lg:border-0 shadow-[0_-8px_32px_rgba(0,0,0,0.8)] lg:shadow-none transition-opacity duration-500 ${classeOpacidadePasso(
                1
              )}`}
            >
              <span className="tipo-cota text-dourado">
                01 / 03 — Fundador e gerente de negócios
              </span>
              <h3 className="tipo-h2 text-papel">Wellington Cabral</h3>
              <blockquote className="tipo-voz text-papel">
                “Comecei como auxiliar numa marcenaria pequena aqui em Jaú. Mas nunca quis só seguir o padrão: quis fazer diferente. Fui aprendendo, me superando e, durante anos, eu mesmo desenhava e fabricava cada projeto.”
              </blockquote>
              <p className="tipo-corpo text-papel/85">
                Mais de 15 anos de marcenaria e muitas batalhas depois, ele fundou a Império e passou a pensar totalmente fora da caixa.
              </p>
            </article>

            {/* Passo 2: Tatiane Cabral */}
            <article
              ref={(el) => {
                artigosRef.current[1] = el;
              }}
              data-passo="2"
              className={`min-h-[42vh] lg:min-h-screen flex flex-col justify-center items-start gap-16 lg:gap-24 p-24 lg:p-0 lg:py-48 rounded-xl lg:rounded-none bg-[#14110f]/95 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border border-papel/15 lg:border-0 shadow-[0_-8px_32px_rgba(0,0,0,0.8)] lg:shadow-none transition-opacity duration-500 ${classeOpacidadePasso(
                2
              )}`}
            >
              <span className="tipo-cota text-dourado">
                02 / 03 — Arquiteta e designer de interiores
              </span>
              <h3 className="tipo-h2 text-papel">Tatiane Cabral</h3>
              <blockquote className="tipo-voz text-papel">
                “Quando entrei, o objetivo era levar o projeto para outro nível: interiores, personalização e cada detalhe com a cara de quem vai morar ali.”
              </blockquote>
              <p className="tipo-corpo text-papel/85">
                Formada em arquitetura e em logística, cuida do projeto de interiores de cada ambiente e da personalização.
              </p>
            </article>

            {/* Passo 3: Juntos */}
            <article
              ref={(el) => {
                artigosRef.current[2] = el;
              }}
              data-passo="3"
              className={`min-h-[42vh] lg:min-h-screen flex flex-col justify-center items-start gap-16 lg:gap-24 p-24 lg:p-0 lg:py-48 rounded-xl lg:rounded-none bg-[#14110f]/95 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border border-papel/15 lg:border-0 shadow-[0_-8px_32px_rgba(0,0,0,0.8)] lg:shadow-none transition-opacity duration-500 ${classeOpacidadePasso(
                3
              )}`}
            >
              <span className="tipo-cota text-dourado">
                03 / 03 — Pacote completo desde 2015
              </span>
              <h3 className="tipo-h2 lg:tipo-h1 text-papel">
                Marcenaria e arquitetura na mesma mesa. A casa inteira, do risco à obra.
              </h3>
              <p className="tipo-corpo text-papel/85">
                Do desenho de interiores e iluminação até a fabricação própria e montagem na sua obra em Jaú e região.
              </p>
            </article>
          </div>

          {/* Coluna da foto no desktop: sticky top: 12vh, height: 76vh */}
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

        {/* Linha do tempo fora do container sticky: 100% visível e livre de sobreposição no celular e no desktop */}
        <div className="relative z-30 bg-preto pt-48 lg:pt-64 border-t border-papel/15 flex flex-col gap-32">
          <div className="flex flex-col gap-8">
            <span className="tipo-cota text-dourado uppercase tracking-wider">
              Trajetória da Império
            </span>
            <h3 className="tipo-h2 text-papel">
              Mais de 15 anos de ofício e evolução em Jaú
            </h3>
          </div>

          <div className="relative pl-24 sm:pl-32">
            {/* Linha de lápis vertical */}
            <svg
              aria-hidden="true"
              viewBox="0 0 12 400"
              preserveAspectRatio="none"
              className="absolute left-0 top-0 bottom-0 w-3 h-full overflow-visible"
            >
              <path
                d="M 6 4 L 6 396"
                fill="none"
                stroke="var(--dourado)"
                strokeWidth="1.5"
                strokeLinecap="round"
                filter="url(#traco-lapis)"
              />
            </svg>

            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-24 lg:gap-32">
              {MARCOS_LINHA_TEMPO.map((marco, idx) => (
                <li
                  key={idx}
                  className="flex flex-col gap-8 p-16 sm:p-20 rounded-xl bg-[#14110f] border border-papel/15"
                >
                  <span className="tipo-cota text-dourado font-bold">
                    0{idx + 1}
                  </span>
                  <h4 className="tipo-h3 text-papel">{marco.titulo}</h4>
                  <p className="tipo-cota text-papel/80">{marco.detalhe}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};
