import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { X, ZoomIn } from 'lucide-react';
import { OBRAS_REAIS } from '../data/portfolioData';
import { AmbienteCategoria, ObraItem } from '../types';
import { Foto } from './Foto';

gsap.registerPlugin(ScrollTrigger);

const CATEGORIAS: Array<{ valor: AmbienteCategoria | 'todas'; rotulo: string }> = [
  { valor: 'todas', rotulo: 'Todas' },
  { valor: 'cozinhas', rotulo: 'Cozinhas' },
  { valor: 'quartos', rotulo: 'Quartos' },
  { valor: 'lojas', rotulo: 'Lojas' },
];

export const Obras: React.FC = () => {
  const [categoriaAtiva, setCategoriaAtiva] = useState<AmbienteCategoria | 'todas'>('todas');
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const [obraAmpliada, setObraAmpliada] = useState<ObraItem | null>(null);

  const secaoRef = useRef<HTMLElement>(null);
  const trilhaScrollRef = useRef<HTMLDivElement>(null);
  const anotacoesSvgRef = useRef<SVGSVGElement>(null);
  const botaoFecharLightboxRef = useRef<HTMLButtonElement>(null);
  const travaCliqueManualAteRef = useRef<number>(0);

  const obrasFiltradas =
    categoriaAtiva === 'todas'
      ? OBRAS_REAIS
      : OBRAS_REAIS.filter((o) => o.ambiente === categoriaAtiva);

  const obraAtual = obrasFiltradas[indiceAtivo] || obrasFiltradas[0];

  const trocarCategoria = (nova: AmbienteCategoria | 'todas') => {
    travaCliqueManualAteRef.current = Date.now() + 900;
    setCategoriaAtiva(nova);
    setIndiceAtivo(0);
  };

  const selecionarProjetoManual = (idx: number) => {
    travaCliqueManualAteRef.current = Date.now() + 1200;
    setIndiceAtivo(idx);
  };

  // Avança automaticamente entre os projetos conforme o usuário rola a página (rápido e fluido)
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const trilhaEl = trilhaScrollRef.current;
    if (prefersReduced || !trilhaEl || obrasFiltradas.length <= 1) return;

    const total = obrasFiltradas.length;

    const st = ScrollTrigger.create({
      trigger: trilhaEl,
      start: 'top top+=90',
      end: 'bottom bottom',
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (Date.now() < travaCliqueManualAteRef.current) return;
        const novoIndice = Math.min(
          total - 1,
          Math.max(0, Math.floor(self.progress * total))
        );
        setIndiceAtivo((atual) => (atual !== novoIndice ? novoIndice : atual));
      },
    });

    return () => {
      st.kill();
    };
  }, [categoriaAtiva, obrasFiltradas.length]);

  // Anima o traço de lápis das linhas de chamada quando a obra entra ou muda
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !anotacoesSvgRef.current) return;

    const ctx = gsap.context(() => {
      const linhas = anotacoesSvgRef.current?.querySelectorAll<SVGGeometryElement>('.linha-chamada');
      const textos = secaoRef.current?.querySelectorAll('.texto-chamada');

      linhas?.forEach((l) => {
        gsap.set(l, { strokeDasharray: 200, strokeDashoffset: 200 });
      });
      if (textos && textos.length > 0) {
        gsap.set(textos, { opacity: 0 });
      }

      const tl = gsap.timeline();

      if (linhas && linhas.length > 0) {
        tl.to(linhas, {
          strokeDashoffset: 0,
          duration: 0.45,
          stagger: 0.1,
          ease: 'power3.out',
        });
      }
      if (textos && textos.length > 0) {
        tl.to(
          textos,
          {
            opacity: 1,
            duration: 0.3,
            stagger: 0.1,
            ease: 'power3.out',
          },
          0.15
        );
      }
    }, secaoRef);

    return () => ctx.revert();
  }, [obraAtual.id]);

  // Acessibilidade do Lightbox: Esc fecha + foco preso no botão de fechar
  useEffect(() => {
    if (!obraAmpliada) return;
    botaoFecharLightboxRef.current?.focus();

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setObraAmpliada(null);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        botaoFecharLightboxRef.current?.focus();
      }
    };

    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [obraAmpliada]);

  // Altura rápida de scroll (~34vh por projeto) para trocar de projeto com fluidez enquanto rola
  const alturaTrilhaVh = Math.max(130, obrasFiltradas.length * 34);
  const progressoPercentual =
    obrasFiltradas.length > 1
      ? ((indiceAtivo + 1) / obrasFiltradas.length) * 100
      : 100;

  return (
    <section
      ref={secaoRef}
      id="obras"
      className="w-full bg-papel text-grafite border-b border-grafite/20"
    >
      <div
        ref={trilhaScrollRef}
        className="relative w-full"
        style={{ minHeight: `${alturaTrilhaVh}vh` }}
      >
        <div className="sticky top-20 lg:top-24 py-24 sm:py-32">
          <div className="max-w-[1280px] mx-auto px-16 sm:px-32 flex flex-col gap-24 lg:gap-32">
            {/* Cabeçalho da seção e navegação por links de texto */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-end">
              <div className="lg:col-span-6 flex flex-col items-start gap-8">
                <h2 className="tipo-h1 text-grafite">As obras</h2>
                <p className="tipo-cota sm:tipo-corpo text-grafite-suave">
                  Role para navegar pelos projetos ou clique na foto para ampliar em tela cheia.
                </p>
              </div>

              <div className="lg:col-span-6 flex flex-wrap items-center gap-16 sm:gap-24 lg:justify-end">
                <nav
                  aria-label="Filtrar obras por ambiente"
                  className="flex flex-wrap items-center gap-16 sm:gap-24"
                >
                  {CATEGORIAS.map((cat) => {
                    const ativo = categoriaAtiva === cat.valor;
                    return (
                      <button
                        key={cat.valor}
                        type="button"
                        onClick={() => trocarCategoria(cat.valor)}
                        aria-current={ativo ? 'true' : undefined}
                        className={`tipo-h3 cursor-pointer transition-colors ${
                          ativo
                            ? 'text-preto link-traco font-bold'
                            : 'text-grafite-suave hover:text-grafite'
                        }`}
                      >
                        {cat.rotulo}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Barra de progresso rápida dos projetos */}
            <div className="w-full h-1 bg-grafite/15 overflow-hidden">
              <div
                className="h-full bg-preto transition-all duration-200"
                style={{ width: `${progressoPercentual}%` }}
              />
            </div>

            {/* Grade assimétrica 12 colunas: 5 colunas de dados + 7 colunas da foto 4K anotada */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 lg:gap-32 items-start">
              {/* Coluna Esquerda (5 colunas): Índice das obras + Notas na foto */}
              <div className="lg:col-span-5 flex flex-col gap-20 lg:gap-24">
                <div className="flex flex-col gap-6 pt-4">
                  <span className="tipo-cota text-grafite-suave font-semibold">
                    Obra {String(indiceAtivo + 1).padStart(2, '0')} de{' '}
                    {String(obrasFiltradas.length).padStart(2, '0')}
                  </span>
                  <h3 className="tipo-h2 text-grafite">{obraAtual.titulo}</h3>
                  <p className="tipo-cota text-grafite-suave pt-2">
                    {obraAtual.cota}
                  </p>
                </div>

                {/* Lista das anotações técnicas visíveis na foto */}
                <div className="hidden sm:flex flex-col gap-8">
                  <span className="tipo-cota text-grafite font-semibold">
                    Notas na foto:
                  </span>
                  <ul className="flex flex-col gap-6 border-l-[1.5px] border-grafite pl-16">
                    {obraAtual.anotacoes.map((anot, i) => (
                      <li key={i} className="tipo-cota text-grafite-suave">
                        {anot.texto}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Navegação direta por botões numerados + lista */}
                <div className="flex flex-col gap-12 pt-8 border-t border-grafite/20">
                  <div className="flex flex-wrap items-center gap-6">
                    {obrasFiltradas.map((item, idx) => {
                      const selecionado = idx === indiceAtivo;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => selecionarProjetoManual(idx)}
                          title={item.titulo}
                          className={`px-10 py-6 rounded-curto border tipo-cota cursor-pointer transition-colors ${
                            selecionado
                              ? 'bg-preto text-papel border-preto font-bold'
                              : 'bg-papel-2 text-grafite border-grafite/25 hover:border-grafite'
                          }`}
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </button>
                      );
                    })}
                  </div>

                  <div className="hidden lg:flex flex-col items-start gap-6 max-h-[180px] overflow-y-auto pr-4">
                    {obrasFiltradas.map((item, idx) => {
                      const selecionado = idx === indiceAtivo;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => selecionarProjetoManual(idx)}
                          className={`text-left tipo-cota cursor-pointer transition-colors ${
                            selecionado
                              ? 'text-preto link-traco font-semibold'
                              : 'text-grafite-suave hover:text-grafite'
                          }`}
                        >
                          {String(idx + 1).padStart(2, '0')}. {item.titulo}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-24 pt-4">
                    <button
                      type="button"
                      onClick={() =>
                        selecionarProjetoManual(
                          indiceAtivo === 0
                            ? obrasFiltradas.length - 1
                            : indiceAtivo - 1
                        )
                      }
                      className="tipo-cota text-grafite link-traco cursor-pointer"
                    >
                      ← Anterior
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        selecionarProjetoManual(
                          (indiceAtivo + 1) % obrasFiltradas.length
                        )
                      }
                      className="tipo-cota text-grafite link-traco cursor-pointer"
                    >
                      Próxima →
                    </button>
                    <button
                      type="button"
                      onClick={() => setObraAmpliada(obraAtual)}
                      className="inline-flex items-center gap-4 tipo-cota text-preto link-traco font-semibold cursor-pointer ml-auto"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>Ampliar foto</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Coluna Direita (7 colunas): Foto grande 4K + Anotações desenhadas a lápis */}
              <div className="lg:col-span-7 relative w-full bg-papel-2">
                <button
                  type="button"
                  onClick={() => setObraAmpliada(obraAtual)}
                  className="block w-full text-left cursor-pointer relative group overflow-hidden"
                  aria-label={`Ampliar foto: ${obraAtual.titulo}`}
                >
                  <Foto
                    srcBase={obraAtual.arquivo}
                    alt={obraAtual.alt}
                    proporcao={obraAtual.proporcao}
                    sizes="(min-width: 1024px) 58vw, 100vw"
                    className="w-full h-[50vh] sm:h-[62vh] lg:h-[68vh]"
                    imgClassName="w-full h-full object-cover"
                  />

                  {/* Camada SVG de chamadas desenhadas a lápis sobre a foto */}
                  <svg
                    ref={anotacoesSvgRef}
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                  >
                    {obraAtual.anotacoes.map((anot, idx) => (
                      <g key={`${obraAtual.id}-anot-${idx}`}>
                        <circle
                          cx={anot.x}
                          cy={anot.y}
                          r="0.9"
                          className="fill-dourado stroke-preto"
                          strokeWidth="0.3"
                        />
                        <path
                          className="linha-chamada text-dourado"
                          d={`M ${anot.x} ${anot.y} L ${anot.ex} ${anot.ey}`}
                          pathLength={200}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="0.45"
                          strokeLinecap="round"
                          filter="url(#traco-lapis)"
                        />
                      </g>
                    ))}
                  </svg>

                  {/* Rótulos HTML posicionados sobre os pontos finais das chamadas */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none"
                  >
                    {obraAtual.anotacoes.map((anot, idx) => (
                      <span
                        key={`${obraAtual.id}-label-${idx}`}
                        style={{
                          left: `${anot.ex}%`,
                          top: `${anot.ey}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                        className="texto-chamada absolute bg-preto text-papel tipo-cota px-8 py-4 rounded-curto border border-papel/30 whitespace-nowrap"
                      >
                        {anot.texto}
                      </span>
                    ))}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox simples e acessível */}
      {obraAmpliada && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={obraAmpliada.titulo}
          onClick={() => setObraAmpliada(null)}
          className="fixed inset-0 z-50 bg-preto/95 text-papel flex flex-col items-center justify-center p-16 sm:p-32"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-[1100px] w-full flex flex-col gap-16"
          >
            <div className="flex items-center justify-between gap-16 border-b border-papel/20 pb-16">
              <div className="flex flex-col">
                <h3 className="tipo-h3 text-papel">{obraAmpliada.titulo}</h3>
                <span className="tipo-cota text-papel/75">
                  {obraAmpliada.cota}
                </span>
              </div>
              <button
                ref={botaoFecharLightboxRef}
                type="button"
                onClick={() => setObraAmpliada(null)}
                aria-label="Fechar foto ampliada"
                className="inline-flex items-center gap-8 px-16 h-[40px] rounded-curto border border-papel text-papel hover:bg-dourado hover:text-preto hover:border-dourado transition-colors tipo-cota cursor-pointer"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
                <span>Fechar (Esc)</span>
              </button>
            </div>

            <div className="max-h-[78vh] w-full flex items-center justify-center overflow-hidden bg-preto">
              <Foto
                srcBase={obraAmpliada.arquivo}
                alt={obraAmpliada.alt}
                sizes="95vw"
                className="max-h-[76vh] w-auto"
                imgClassName="object-contain max-h-[76vh] w-auto mx-auto"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
