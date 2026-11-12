import React, { Suspense, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Foto } from './Foto';
import { useAtivarNaInteracao } from '../hooks/useAtivarNaInteracao';
import { temProjetoSalvo } from './quarto3d/projetosSalvos';

// O editor 3D (three.js, React Three Fiber) fica num pedaço separado: só baixa nesta página.
const Quarto3DExperiencia = React.lazy(() => import('./quarto3d/Quarto3DExperiencia'));

interface PaginaProjetarProps {
  onVoltar: () => void;
  onOpenBriefing: () => void;
}

function temWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

const Carregando = () => (
  <div className="w-full h-[70svh] min-h-[420px] border border-papel/20 flex flex-col items-center justify-center gap-16 p-32">
    <span className="w-32 h-32 rounded-full border-2 border-papel/20 border-t-dourado animate-spin" aria-hidden="true" />
    <span className="tipo-cota text-dourado">Preparando o ambiente 3D...</span>
  </div>
);

/** Página própria do configurador 3D (/projetar). */
export const PaginaProjetar: React.FC<PaginaProjetarProps> = ({ onVoltar, onOpenBriefing }) => {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  // O editor (three.js) custa segundos de processador: monta na primeira interação.
  const [interagiu, abrirEditor] = useAtivarNaInteracao(typeof window !== 'undefined' && (window.location.hash.startsWith('#projeto=') || temProjetoSalvo()));
  // WebGL testado só quando o editor vai abrir (o teste custa segundos sem aceleração).
  useEffect(() => {
    if (interagiu) setWebgl(temWebGL());
  }, [interagiu]);

  return (
    <section data-tema="noite" className="w-full min-h-screen bg-preto text-papel pt-96 pb-64">
      <div className="max-w-[1440px] mx-auto px-16 sm:px-32 flex flex-col gap-32">
        <div className="flex flex-col gap-16">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onVoltar();
            }}
            className="inline-flex items-center gap-8 tipo-cota text-papel/70 hover:text-dourado self-start"
          >
            <ArrowLeft className="w-[16px] h-[16px]" strokeWidth={1.5} />
            Voltar ao site
          </a>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-16">
            <div className="flex flex-col gap-8 max-w-[60ch]">
              <h1 className="tipo-h1 text-papel">Projete seu planejado em 3D</h1>
              <p className="tipo-corpo text-papel/80">
                Escolha o ambiente, ajuste as medidas, os móveis e as cores. Na etapa Enviar, baixe a imagem de frente do projeto e mande para a gente orçar.
              </p>
            </div>
            <p className="tipo-cota text-papel/60 lg:max-w-[36ch]">
              Visualização aproximada. O projeto final é detalhado depois da medição no local.
            </p>
          </div>
        </div>

        {!interagiu ? (
          <div className="relative w-full h-[70svh] min-h-[420px] border border-papel/20 overflow-hidden">
            <Foto srcBase="/projetar/cozinha-render" alt="Exemplo de projeto 3D de cozinha planejada feito no editor" proporcao="16 / 9" prioridade sizes="100vw" className="w-full h-full" imgStyle={{ objectFit: 'cover' }} />
            <div className="absolute inset-0 bg-preto/40 flex items-center justify-center p-24">
              <button
                type="button"
                onClick={abrirEditor}
                className="px-32 h-[56px] rounded-curto bg-dourado text-preto hover:bg-papel transition-colors font-semibold cursor-pointer"
              >
                Abrir o editor 3D
              </button>
            </div>
          </div>
        ) : webgl === null ? (
          <Carregando />
        ) : webgl ? (
          <Suspense fallback={<Carregando />}>
            <Quarto3DExperiencia onOpenBriefingOutro={onOpenBriefing} />
          </Suspense>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-32 items-center border border-papel/20 p-24 sm:p-32">
            <div className="lg:col-span-5 flex flex-col items-start gap-16">
              <h2 className="tipo-h2 text-papel">O 3D está desligado neste navegador</h2>
              <p className="tipo-corpo text-papel/80">
                Tente pelo Chrome ou Safari atualizados, ou mande as medidas que a nossa arquiteta monta o projeto para você.
              </p>
              <button
                type="button"
                onClick={onOpenBriefing}
                className="px-24 h-[52px] rounded-curto bg-dourado text-preto hover:bg-papel transition-colors font-semibold cursor-pointer"
              >
                Pedir orçamento
              </button>
            </div>
            <div className="lg:col-span-7">
              <Foto srcBase="/projetar/cozinha-render" alt="Exemplo de projeto 3D de cozinha planejada" proporcao="16 / 9" sizes="(min-width: 1024px) 58vw, 100vw" className="w-full" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PaginaProjetar;
