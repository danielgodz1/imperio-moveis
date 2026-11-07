import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const TEXTO_FAIXA = 'Cozinhas. Quartos. Closets. Lojas. Projeto 3D.';

export const FaixaServicos: React.FC = () => {
  const trilhaRef = useRef<HTMLDivElement>(null);
  const pausadoRef = useRef(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let xPercent = 0;
    const velocidade = -0.025;

    const animar = () => {
      if (pausadoRef.current) return;
      xPercent += velocidade;
      if (xPercent <= -50) {
        xPercent += 50;
      }
      if (trilhaRef.current) {
        trilhaRef.current.style.transform = `translate3d(${xPercent}%, 0, 0)`;
      }
    };

    gsap.ticker.add(animar);
    return () => {
      gsap.ticker.remove(animar);
    };
  }, []);

  const repeticoes = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div
      role="region"
      aria-label="Serviços da Império Móveis Planejados"
      tabIndex={0}
      onMouseEnter={() => {
        pausadoRef.current = true;
      }}
      onMouseLeave={() => {
        pausadoRef.current = false;
      }}
      onFocus={() => {
        pausadoRef.current = true;
      }}
      onBlur={() => {
        pausadoRef.current = false;
      }}
      className="w-full h-48 bg-papel-2 border-y border-grafite/20 overflow-hidden flex items-center select-none"
    >
      <div
        ref={trilhaRef}
        className="flex items-center whitespace-nowrap w-max will-change-transform"
      >
        <div className="flex items-center">
          {repeticoes.map((item) => (
            <span key={`a-${item}`} className="tipo-faixa text-grafite pr-32">
              {TEXTO_FAIXA}
            </span>
          ))}
        </div>
        <div className="flex items-center" aria-hidden="true">
          {repeticoes.map((item) => (
            <span key={`b-${item}`} className="tipo-faixa text-grafite pr-32">
              {TEXTO_FAIXA}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

