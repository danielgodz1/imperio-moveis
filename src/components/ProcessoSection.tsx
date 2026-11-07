import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Foto } from './Foto';

gsap.registerPlugin(ScrollTrigger);

const ETAPAS_PROCESSO = [
  {
    numero: '01',
    titulo: 'Conversa inicial',
    texto:
      'Você chama no WhatsApp, conta o que imagina para o ambiente ou para a casa inteira e alinhamos prioridades.',
  },
  {
    numero: '02',
    titulo: 'Medição técnica no imóvel',
    texto:
      'Vamos até a obra em Jaú e região [CONFIRMAR raio de atendimento] para conferir paredes, pontos de água, elétrica e esquadro.',
  },
  {
    numero: '03',
    titulo: 'Apresentação 3D e proposta',
    texto:
      'A Tatiane desenvolve o projeto de interiores em 3D e detalhamos materiais, divisões internas e orçamento.',
  },
  {
    numero: '04',
    titulo: 'Fabricação e instalação',
    texto:
      'Fabricamos na oficina e instalamos na sua casa. Quando o acesso é difícil, até guindaste entra na conta. [CONFIRMAR o contexto da foto]',
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
      className="w-full py-96 md:py-144 bg-papel-2 text-grafite border-b border-grafite/20"
    >
      <div className="max-w-[1280px] mx-auto px-16 sm:px-32 grid grid-cols-1 lg:grid-cols-12 gap-48 items-start">
        {/* Coluna Esquerda (7 colunas): As 4 etapas numeradas ligadas pela linha de lápis */}
        <div className="lg:col-span-7 flex flex-col gap-48">
          <div className="flex flex-col items-start gap-16">
            <h2 className="tipo-h1 text-grafite">Do risco à obra em 4 etapas</h2>
            <p className="tipo-corpo text-grafite-suave">
              Da primeira medida na parede até a entrega final instalada.
            </p>
          </div>

          <div className="relative pl-32">
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

            <ol className="flex flex-col gap-32">
              {ETAPAS_PROCESSO.map((etapa) => (
                <li
                  key={etapa.numero}
                  className="flex flex-col gap-8 pb-24 border-b border-grafite/15 last:border-b-0"
                >
                  <div className="flex items-baseline gap-16">
                    <span className="tipo-cota text-grafite-suave font-bold">
                      {etapa.numero}
                    </span>
                    <h3 className="tipo-h2 text-grafite">{etapa.titulo}</h3>
                  </div>
                  <p className="tipo-corpo text-grafite-suave">{etapa.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Coluna Direita (5 colunas): Foto real do guindaste na etapa 04 */}
        <div className="lg:col-span-5 flex flex-col gap-12">
          <Foto
            srcBase="/obras/entrega-guindaste"
            alt="Operação com guindaste em frente a edifício acompanhada pela equipe da Império Móveis Planejados"
            proporcao="483 / 722"
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="w-full"
          />
          <p className="tipo-cota text-grafite-suave">
            Operação com guindaste registrada pela Império em Jaú/SP [CONFIRMAR contexto exato da foto]
          </p>
        </div>
      </div>
    </section>
  );
};
