import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Foto } from './Foto';

gsap.registerPlugin(ScrollTrigger);

const ETAPAS_PROCESSO = [
  {
    numero: '01',
    tag: 'Alinhamento Inicial',
    titulo: 'Conversa e briefing direto',
    texto:
      'Você chama no WhatsApp, conta o que imagina para o ambiente ou para a casa inteira e alinhamos prioridades de uso, estilo e investimento.',
  },
  {
    numero: '02',
    tag: 'Levantamento em Obra',
    titulo: 'Medição técnica no imóvel',
    texto:
      'Vamos até a obra em Jaú e região para conferir paredes, pontos hidráulicos, elétrica, prumo e esquadro antes de cortar qualquer chapa.',
  },
  {
    numero: '03',
    tag: 'Arquitetura & Interiores',
    titulo: 'Apresentação 3D e detalhamento',
    texto:
      'A Tatiane Cabral desenvolve o projeto de interiores em 3D e especificamos chapas, ferragens, iluminação em LED, divisões internas e orçamento transparente.',
  },
  {
    numero: '04',
    tag: 'Oficina Própria & Entrega',
    titulo: 'Usinagem industrial e montagem própria',
    texto:
      'Fabricamos na nossa marcenaria com maquinário industrial Titanium de alta precisão e instalamos com equipe própria até o ajuste fino de cada porta.',
  },
];

export const ProcessoSection: React.FC = () => {
  const secaoRef = useRef<HTMLElement>(null);
  const linhaPathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !linhaPathRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        linhaPathRef.current,
        { strokeDashoffset: 800 },
        {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: secaoRef.current,
            start: 'top 70%',
            end: 'bottom 60%',
            scrub: 0.5,
          },
        }
      );
    }, secaoRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={secaoRef}
      id="processo"
      className="w-full py-64 sm:py-96 md:py-128 bg-papel-2 text-grafite border-b border-grafite/20"
    >
      <div className="max-w-[1280px] mx-auto px-16 sm:px-32 grid grid-cols-1 lg:grid-cols-12 gap-32 lg:gap-48 items-start">
        {/* Coluna Esquerda (7 colunas): Cabeçalho reestilizado + 4 etapas ligadas pelo traço de lápis */}
        <div className="lg:col-span-7 flex flex-col gap-32 sm:gap-40">
          <div className="flex flex-col items-start gap-12 border-l-2 border-dourado pl-16 sm:pl-24">
            <div className="inline-flex items-center gap-8 px-10 py-4 rounded-curto bg-preto text-dourado text-[11px] uppercase tracking-[0.2em] font-semibold">
              <span>Método Império — Do Traço à Instalação</span>
            </div>
            <h2 className="tipo-h1 text-grafite leading-[1.05]">
              Do risco à obra,{' '}
              <span className="italic font-normal text-grafite-suave">
                em 4 etapas de precisão.
              </span>
            </h2>
            <p className="tipo-corpo text-grafite-suave max-w-[58ch]">
              Da primeira conferência a laser na parede ao corte industrial na nossa fábrica em Jaú: cada etapa é acompanhada diretamente pelo Wellington e pela Tatiane.
            </p>
          </div>

          <div className="relative pl-24 sm:pl-36">
            {/* Linha de lápis vertical conectando as 4 etapas */}
            <svg
              aria-hidden="true"
              viewBox="0 0 12 800"
              preserveAspectRatio="none"
              className="absolute left-0 top-8 bottom-8 w-3 h-[calc(100%-16px)] overflow-visible"
            >
              <path
                d="M 6 0 L 6 800"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-grafite/20"
              />
              <path
                ref={linhaPathRef}
                d="M 6 0 L 6 800"
                pathLength={800}
                strokeDasharray={800}
                strokeDashoffset={0}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                filter="url(#traco-lapis)"
                className="text-grafite"
              />
            </svg>

            <ol className="flex flex-col gap-20 sm:gap-24">
              {ETAPAS_PROCESSO.map((etapa) => (
                <li
                  key={etapa.numero}
                  className="bg-papel p-16 sm:p-24 rounded-curto border border-grafite/15 shadow-xs flex flex-col gap-8 transition-colors hover:border-grafite/35"
                >
                  <div className="flex flex-wrap items-center justify-between gap-8">
                    <div className="flex items-baseline gap-12">
                      <span className="px-8 py-2 rounded-curto bg-preto text-dourado text-xs font-bold tracking-wider">
                        {etapa.numero}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-grafite">
                        {etapa.titulo}
                      </h3>
                    </div>
                    <span className="text-[11px] uppercase tracking-[0.14em] text-grafite-suave font-semibold">
                      {etapa.tag}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-grafite-suave leading-relaxed">
                    {etapa.texto}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Coluna Direita (5 colunas): Foto real do guindaste descarregando o Maquinário Industrial Titanium */}
        <div className="lg:col-span-5 flex flex-col gap-16 lg:sticky lg:top-28">
          <div className="relative bg-preto p-8 sm:p-12 rounded-curto border border-grafite/20 shadow-lg overflow-hidden">
            <div className="relative overflow-hidden rounded-curto">
              <Foto
                srcBase="/obras/entrega-guindaste"
                alt="Guindaste Munck realizando o içamento do maquinário industrial Titanium para a fábrica da Império Móveis Planejados em Jaú/SP"
                proporcao="1696 / 2528"
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="w-full max-h-[540px]"
                imgClassName="w-full h-full object-cover"
              />
              <div className="absolute top-12 left-12 bg-preto/90 backdrop-blur-xs border border-dourado/50 px-12 py-6 rounded-curto">
                <span className="text-[10px] uppercase tracking-[0.18em] text-dourado font-bold block">
                  Investimento em Tecnologia
                </span>
                <span className="text-xs text-papel font-semibold">
                  Maquinário Industrial Titanium
                </span>
              </div>
            </div>

            <div className="pt-16 px-4 pb-4 flex flex-col gap-8 text-papel">
              <div className="flex items-center justify-between gap-8 border-b border-papel/15 pb-8">
                <span className="text-xs uppercase tracking-[0.14em] text-dourado font-semibold">
                  Estrutura Fabril Própria — Jaú/SP
                </span>
                <span className="text-[11px] text-papel/70">Precisão 1mm</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-papel leading-snug">
                Novo maquinário industrial chegando de guindaste à nossa fábrica
              </h3>
              <p className="text-xs sm:text-sm text-papel/80 leading-relaxed">
                Registro real do içamento por caminhão Munck do equipamento industrial{' '}
                <strong className="text-papel">Titanium</strong> da Império Móveis Planejados. Investimos continuamente em tecnologia pesada de corte e colagem de borda para garantir acabamento sem frestas, esquadro milimétrico e durabilidade superior em cada ambiente entregue.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
