import React, { useEffect, useState } from 'react';
import { Box, X } from 'lucide-react';

const CHAVE = 'imperio-aviso-3d';
/** Depois de fechado ou usado, o aviso só volta depois de uma semana. */
const INTERVALO_MS = 7 * 24 * 60 * 60 * 1000;
/** Fora da home: espera antes de aparecer. */
const ATRASO_MS = 7000;

function podeMostrar(): boolean {
  try {
    const ultimo = Number(window.localStorage.getItem(CHAVE) ?? 0);
    return !ultimo || Date.now() - ultimo > INTERVALO_MS;
  } catch {
    return true;
  }
}

function lembrarQueViu() {
  try {
    window.localStorage.setItem(CHAVE, String(Date.now()));
  } catch {
    // Sem armazenamento (modo privado): o aviso pode voltar na próxima visita.
  }
}

interface AvisoProjeto3DProps {
  /** Rota atual: na própria página do 3D o aviso não aparece. */
  rota: string;
  onAbrir: () => void;
}

/** Lembrete discreto de que dá para projetar em 3D no site. */
export const AvisoProjeto3D: React.FC<AvisoProjeto3DProps> = ({ rota, onAbrir }) => {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    if (rota === '/projetar' || !podeMostrar()) return;
    let t = 0;
    const hero = rota === '/' ? document.getElementById('hero') : null;
    if (!hero) {
      t = window.setTimeout(() => setVisivel(true), ATRASO_MS);
      return () => window.clearTimeout(t);
    }
    // Na home, só depois que o cliente passa do hero (não cobre o título nem os botões).
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting && e.boundingClientRect.top < 0) {
        obs.disconnect();
        t = window.setTimeout(() => setVisivel(true), 1200);
      }
    });
    obs.observe(hero);
    return () => {
      obs.disconnect();
      window.clearTimeout(t);
    };
  }, [rota]);

  useEffect(() => {
    if (rota === '/projetar') setVisivel(false);
  }, [rota]);

  if (!visivel) return null;

  const fechar = () => {
    lembrarQueViu();
    setVisivel(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Novidade: projeto 3D online"
      className="fixed z-40 left-16 right-[88px] bottom-[max(16px,env(safe-area-inset-bottom))] sm:left-24 sm:right-auto sm:bottom-24 sm:w-[360px] bg-preto text-papel border border-dourado/50 shadow-[0_16px_48px_rgba(0,0,0,0.35)] p-16 flex gap-16 items-start animate-[surgir_400ms_ease-out] motion-reduce:animate-none"
    >
      <span className="hidden sm:flex w-[40px] h-[40px] shrink-0 items-center justify-center bg-dourado text-preto rounded-curto" aria-hidden="true">
        <Box className="w-[20px] h-[20px]" strokeWidth={1.75} />
      </span>
      <div className="flex-1 flex flex-col gap-8 min-w-0">
        <p className="tipo-cota text-papel font-semibold">Projete seu planejado em 3D, grátis</p>
        <p className="hidden sm:block tipo-cota text-papel/75">Monte o ambiente aqui no site, baixe a imagem e mande para a gente orçar.</p>
        <button
          type="button"
          onClick={() => {
            lembrarQueViu();
            setVisivel(false);
            onAbrir();
          }}
          className="self-start px-16 h-[40px] rounded-curto bg-dourado text-preto tipo-cota font-semibold hover:bg-papel transition-colors cursor-pointer"
        >
          Experimentar agora
        </button>
      </div>
      <button
        type="button"
        onClick={fechar}
        aria-label="Fechar aviso"
        className="w-[32px] h-[32px] -mt-4 -mr-4 shrink-0 flex items-center justify-center text-papel/70 hover:text-papel cursor-pointer"
      >
        <X className="w-[16px] h-[16px]" />
      </button>
    </div>
  );
};
