import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Foto } from '../Foto';

const Quarto3DExperienciaLazy = React.lazy(() => import('./Quarto3DExperiencia'));

function verificarWebGLDisponivel(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

function verificarAparelhoFraco(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nucleos = navigator.hardwareConcurrency || 8;
  const memoria = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 8;
  return nucleos <= 4 || memoria <= 4;
}

export const Quarto3DLoader: React.FC = () => {
  const secaoRef = useRef<HTMLElement>(null);
  const [entrouNaTela, setEntrouNaTela] = useState(false);
  const [temWebGL, setTemWebGL] = useState(true);
  const [aparelhoFraco, setAparelhoFraco] = useState(false);
  const [forcar3D, setForcar3D] = useState(false);

  useEffect(() => {
    setTemWebGL(verificarWebGLDisponivel());
    setAparelhoFraco(verificarAparelhoFraco());

    const el = secaoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setEntrouNaTela(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const mostrarExperiencia3D = entrouNaTela && temWebGL && (!aparelhoFraco || forcar3D);

  return (
    <section
      ref={secaoRef}
      id="quarto-3d"
      data-tema="noite"
      className="w-full py-96 md:py-144 bg-preto text-papel border-b border-papel/15"
    >
      <div className="max-w-[1280px] mx-auto px-16 sm:px-32 flex flex-col gap-48">
        <div className="max-w-2xl flex flex-col items-start gap-16">
          <h2 className="tipo-h1 text-papel">Projete seu quarto em 3D</h2>
          <p className="tipo-corpo text-papel/80">
            Ajuste as medidas da sua parede, escolha os módulos, experimente o acabamento amadeirado e acenda a fita de LED antes de enviar para o nosso orçamento.
          </p>
        </div>

        {mostrarExperiencia3D ? (
          <Suspense
            fallback={
              <div className="w-full h-[460px] border border-papel/20 flex flex-col items-center justify-center gap-16 p-32">
                <span className="tipo-cota text-dourado">
                  Desenhando o contorno 3D do ambiente...
                </span>
              </div>
            }
          >
            <Quarto3DExperienciaLazy />
          </Suspense>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-32 items-center border border-papel/20 p-24 sm:p-32">
            <div className="lg:col-span-6 flex flex-col items-start gap-16">
              <p className="tipo-cota text-dourado">
                Visualização aproximada. O projeto final é detalhado após a medição.
              </p>
              <h3 className="tipo-h2 text-papel">
                {!temWebGL
                  ? 'Visualização estática do dormitório com LED'
                  : 'Modo leve ativado para economizar bateria'}
              </h3>
              <p className="tipo-corpo text-papel/80">
                {!temWebGL
                  ? 'Seu navegador atual está com o 3D desativado. Veja ao lado um dormitório real com cabeceira em LED feito pela Império.'
                  : 'Identificamos um aparelho com economia de recursos. Você pode abrir o simulador 3D interativo clicando abaixo.'}
              </p>
              {temWebGL && (
                <button
                  type="button"
                  onClick={() => {
                    setEntrouNaTela(true);
                    setForcar3D(true);
                  }}
                  className="px-24 h-[52px] rounded-curto bg-dourado text-preto hover:bg-papel hover:text-preto transition-colors tipo-cota font-semibold cursor-pointer"
                >
                  Ver mesmo assim
                </button>
              )}
            </div>

            <div className="lg:col-span-6">
              <Foto
                srcBase="/obras/dormitorio-led-1"
                alt="Dormitório planejado pela Império com cabeceira contínua iluminada por fita de LED"
                proporcao="478 / 773"
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="w-full max-h-[420px]"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

