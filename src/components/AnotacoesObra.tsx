import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnotacaoObra } from '../types';

gsap.registerPlugin(ScrollTrigger);

const ESPACO_MINIMO = 30;

/** Ponto final da linha, já ajustado ao espaço que o rótulo precisa. */
const fimX = (a: AnotacaoObra) =>
  a.x <= a.ex ? Math.min(a.ex, 100 - ESPACO_MINIMO) : Math.max(a.ex, ESPACO_MINIMO);

interface AnotacoesObraProps {
  anotacoes: AnotacaoObra[];
}

/**
 * Linhas de lápis que saem de cada móvel até o material usado nele.
 * As coordenadas são em % da foto, então o contêiner precisa ter a proporção da própria foto.
 * O rótulo cresce para o lado em que há espaço, sem passar da borda.
 */
export const AnotacoesObra: React.FC<AnotacoesObraProps> = ({ anotacoes }) => {
  const raizRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raiz = raizRef.current;
    if (!raiz || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const linhas = raiz.querySelectorAll<SVGPathElement>('.linha-material');
      const pontos = raiz.querySelectorAll<HTMLElement>('.ponto-material');
      const rotulos = raiz.querySelectorAll<HTMLElement>('.rotulo-material');

      gsap.set(linhas, { strokeDasharray: 100, strokeDashoffset: 100 });
      gsap.set([pontos, rotulos], { opacity: 0 });

      gsap
        .timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: { trigger: raiz, start: 'top 75%', once: true },
        })
        .to(pontos, { opacity: 1, duration: 0.3, stagger: 0.18 }, 0.2)
        .to(linhas, { strokeDashoffset: 0, duration: 0.7, stagger: 0.18 }, 0.3)
        .to(rotulos, { opacity: 1, duration: 0.4, stagger: 0.18 }, 0.7);
    }, raiz);

    return () => ctx.revert();
  }, [anotacoes]);

  return (
    <div ref={raizRef} aria-hidden="true" className="absolute inset-0 pointer-events-none">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full overflow-visible"
      >
        {anotacoes.map((a, i) => (
          <path
            key={i}
            className="linha-material"
            d={`M ${a.x} ${a.y} L ${fimX(a)} ${a.ey}`}
            pathLength={100}
            fill="none"
            stroke="var(--dourado)"
            strokeWidth="0.5"
            strokeLinecap="round"
            filter="url(#traco-lapis)"
          />
        ))}
      </svg>

      {anotacoes.map((a, i) => {
        const paraDireita = a.x <= a.ex;
        // O rótulo precisa de largura mínima para não virar uma coluna de palavras.
        const ex = paraDireita ? Math.min(a.ex, 100 - ESPACO_MINIMO) : Math.max(a.ex, ESPACO_MINIMO);
        const espaco = paraDireita ? 100 - ex : ex;
        return (
          <React.Fragment key={i}>
            <span
              className="ponto-material absolute block w-8 h-8 bg-dourado border border-preto"
              style={{ left: `${a.x}%`, top: `${a.y}%`, transform: 'translate(-50%, -50%)' }}
            />
            <span
              className="rotulo-material absolute bg-preto text-papel tipo-rotulo px-8 py-4"
              style={{
                top: `${a.ey}%`,
                transform: 'translateY(-50%)',
                maxWidth: `calc(${espaco}% - 4px)`,
                width: 'max-content',
                ...(paraDireita ? { left: `${ex}%` } : { right: `${100 - ex}%` }),
              }}
            >
              {a.texto}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
};
