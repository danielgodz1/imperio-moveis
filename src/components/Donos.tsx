import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Foto } from './Foto';

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
    detalhe: 'Pacote completo de arquitetura, maquinário industrial e marcenaria em Jaú e região.',
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
        duration: 0.75,
        ease: 'power3.out',
        overwrite: true,
      });
    });
  }, [passoAtivo]);

  // Cria os ScrollTriggers para os 3 <article data-passo>
  // No celular, o texto fica na metade inferior da tela (abaixo da foto sticky z-30),
  // portanto o gatilho dispara assim que o artigo entra na metade inferior (top 80% -> bottom 55%)!
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
          start: isMobile ? 'top 82%' : 'top 58%',
          end: isMobile ? 'bottom 58%' : 'bottom 45%',
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

  const irParaPasso = (passo: 1 | 2 | 3) => {
    setPassoAtivo(passo);
    const el = artigosRef.current[passo - 1];
    if (el) {
      const isMobile = window.innerWidth < 1024;
      const offsetTop =
        el.getBoundingClientRect().top +
        window.scrollY -
        (isMobile ? window.innerHeight * 0.56 : 160);
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  const classeOpacidadePasso = (passo: 1 | 2 | 3) => {
    if (reducedMotion) return 'opacity-100';
    return passoAtivo === passo
      ? 'opacity-100 border-[#c9a04e]/50'
      : 'opacity-40 border-papel/10';
  };

  return (
    <section
      ref={secaoRef}
      id="donos"
      data-tema="noite"
      aria-label="Quem faz a Império: Wellington e Tatiane Cabral"
      className="w-full bg-preto text-papel py-64 md:py-144 border-b border-papel/15"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-col gap-32 lg:gap-64">
        {/* Frase de abertura da seção */}
        <header className="max-w-3xl flex flex-col items-start gap-12">
          <span className="tipo-cota text-dourado uppercase tracking-wider">
            Quem assina cada projeto
          </span>
          <h2 className="tipo-h1 text-papel">Do chão da oficina à casa inteira.</h2>
        </header>

        {/*
          Bloco exclusivo dos 3 passos + Retrato com Holofote.
          No celular: o painel da foto fica no topo com z-30 e fundo preto opaco, ocupando a metade superior da tela,
          enquanto os textos rolam na metade inferior (z-10) SEM NUNCA cobrir o rosto dos fundadores!
        */}
        <div className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 lg:gap-48 items-start">
          {/* Painel Sticky da Foto no Celular (< 1024px): z-30 opaco no topo para nunca ter texto em cima dos rostos */}
          <div className="lg:hidden sticky top-20 z-30 bg-preto pt-2 pb-3 border-b border-[#c9a04e]/30 shadow-[0_16px_32px_rgba(10,10,10,0.98)]">
            <div className="relative w-full h-[38vh] sm:h-[42vh] rounded-xl overflow-hidden border border-papel/15 bg-preto">
              <RetratoHolofote
                srcBase="/obras/fundadores"
                alt="Wellington e Tatiane Cabral, fundadores da Império Móveis Planejados"
                proporcao=""
                camadaColoridaRef={mascaraMobileRef}
                onImgLoad={handleImageLoad}
                className="w-full h-full"
              />

              {/* Rótulo flutuante discreto no canto da foto indicando o foco atual */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-auto">
                {[
                  { passo: 1 as const, label: '01. Wellington' },
                  { passo: 2 as const, label: '02. Tatiane' },
                  { passo: 3 as const, label: '03. Juntos' },
                ].map((item) => (
                  <button
                    key={item.passo}
                    type="button"
                    onClick={() => irParaPasso(item.passo)}
                    className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-semibold tracking-wide transition-colors cursor-pointer ${
                      passoAtivo === item.passo
                        ? 'bg-[#c9a04e] text-[#15100c] font-bold shadow-sm'
                        : 'bg-preto/80 text-papel/80 border border-papel/20'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Coluna do texto: 3 blocos <article data-passo> lidos abaixo da foto no celular e ao lado no desktop */}
          <div className="relative z-10 flex flex-col gap-20 lg:gap-0 pt-4 pb-12 lg:py-0">
            {/* Passo 1: Wellington Cabral */}
            <article
              ref={(el) => {
                artigosRef.current[0] = el;
              }}
              data-passo="1"
              onClick={() => setPassoAtivo(1)}
              className={`min-h-[38vh] lg:min-h-[85vh] flex flex-col justify-center items-start gap-12 lg:gap-24 p-20 sm:p-24 lg:p-0 lg:py-48 rounded-xl lg:rounded-none bg-[#14110f] lg:bg-transparent border lg:border-0 transition-all duration-500 ${classeOpacidadePasso(
                1
              )}`}
            >
              <span className="tipo-cota text-dourado font-semibold">
                01 / 03 — Fundador e mestre marceneiro
              </span>
              <h3 className="tipo-h2 text-papel">Wellington Cabral</h3>
              <blockquote className="tipo-voz text-papel text-lg sm:text-2xl">
                “Comecei como auxiliar numa marcenaria pequena aqui em Jaú. Mas nunca quis só seguir o padrão: quis fazer diferente. Fui aprendendo, me superando e, durante anos, eu mesmo desenhava e fabricava cada projeto.”
              </blockquote>
              <p className="tipo-corpo text-papel/85 text-sm sm:text-base">
                Mais de 15 anos de marcenaria e muitas batalhas depois, ele fundou a Império e passou a pensar totalmente fora da caixa.
              </p>
            </article>

            {/* Passo 2: Tatiane Cabral */}
            <article
              ref={(el) => {
                artigosRef.current[1] = el;
              }}
              data-passo="2"
              onClick={() => setPassoAtivo(2)}
              className={`min-h-[38vh] lg:min-h-[85vh] flex flex-col justify-center items-start gap-12 lg:gap-24 p-20 sm:p-24 lg:p-0 lg:py-48 rounded-xl lg:rounded-none bg-[#14110f] lg:bg-transparent border lg:border-0 transition-all duration-500 ${classeOpacidadePasso(
                2
              )}`}
            >
              <span className="tipo-cota text-dourado font-semibold">
                02 / 03 — Arquiteta e designer de interiores
              </span>
              <h3 className="tipo-h2 text-papel">Tatiane Cabral</h3>
              <blockquote className="tipo-voz text-papel text-lg sm:text-2xl">
                “Quando entrei, o objetivo era levar o projeto para outro nível: interiores, personalização e cada detalhe com a cara de quem vai morar ali.”
              </blockquote>
              <p className="tipo-corpo text-papel/85 text-sm sm:text-base">
                Formada em arquitetura e em logística, cuida do projeto de interiores de cada ambiente e da personalização.
              </p>
            </article>

            {/* Passo 3: Juntos */}
            <article
              ref={(el) => {
                artigosRef.current[2] = el;
              }}
              data-passo="3"
              onClick={() => setPassoAtivo(3)}
              className={`min-h-[38vh] lg:min-h-[85vh] flex flex-col justify-center items-start gap-12 lg:gap-24 p-20 sm:p-24 lg:p-0 lg:py-48 rounded-xl lg:rounded-none bg-[#14110f] lg:bg-transparent border lg:border-0 transition-all duration-500 ${classeOpacidadePasso(
                3
              )}`}
            >
              <span className="tipo-cota text-dourado font-semibold">
                03 / 03 — Pacote completo desde 2015
              </span>
              <h3 className="tipo-h2 lg:tipo-h1 text-papel">
                Marcenaria e arquitetura na mesma mesa. A casa inteira, do risco à obra.
              </h3>
              <p className="tipo-corpo text-papel/85 text-sm sm:text-base">
                Do desenho de interiores e iluminação até a fabricação própria com maquinário industrial e montagem na sua obra em Jaú e região.
              </p>
            </article>
          </div>

          {/* Coluna da foto no desktop: sticky top: 12vh, height: 76vh */}
          <div className="hidden lg:flex flex-col gap-12 sticky top-[12vh] h-[78vh]">
            <RetratoHolofote
              srcBase="/obras/fundadores"
              alt="Wellington e Tatiane Cabral, fundadores da Império Móveis Planejados"
              camadaColoridaRef={mascaraDesktopRef}
              onImgLoad={handleImageLoad}
              className="w-full h-full rounded-xl border border-papel/15 halo-luz"
            />
            <div className="flex items-center justify-between gap-2">
              {[
                { passo: 1 as const, label: '01. Foco em Wellington' },
                { passo: 2 as const, label: '02. Foco em Tatiane' },
                { passo: 3 as const, label: '03. O Casal (Império)' },
              ].map((item) => (
                <button
                  key={item.passo}
                  type="button"
                  onClick={() => irParaPasso(item.passo)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    passoAtivo === item.passo
                      ? 'bg-[#c9a04e] text-[#15100c] font-bold'
                      : 'bg-[#14110f] text-papel/75 border border-papel/15 hover:border-[#c9a04e]/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Linha do tempo fora do container sticky: 100% visível e livre de sobreposição */}
        <div className="relative z-30 bg-preto pt-48 lg:pt-64 border-t border-papel/15 flex flex-col gap-32">
          <div className="flex flex-col gap-8">
            <span className="tipo-cota text-dourado uppercase tracking-wider">
              Trajetória da Império
            </span>
            <h3 className="tipo-h2 text-papel">
              Mais de 15 anos de ofício e evolução em Jaú
            </h3>
          </div>

          <div className="relative pl-20 sm:pl-32">
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

            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 sm:gap-24 lg:gap-32">
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
