import React, { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Foto } from '../Foto';
import { HeroScrollFallback } from './HeroScrollFallback';
import { ALT_FOTO_COZINHA, HeroScrollConteudo } from './HeroScrollConteudo';
import {
  FASES,
  METADADOS_FASES,
  PAINEL_DESKTOP,
  RECORTE_FOTO,
  faseAtual,
  progressoNaFaixa,
  useHeroScrollStore,
} from './useHeroScrollStore';

gsap.registerPlugin(ScrollTrigger);

// Canvas sob demanda: three e R3F ficam fora do bundle inicial
const HeroScrollCena = lazy(() =>
  import('./HeroScrollCena').then((mod) => ({ default: mod.HeroScrollCena }))
);

const LARGURA_PAINEL_CSS = `clamp(${PAINEL_DESKTOP.min}px, ${PAINEL_DESKTOP.vw * 100}vw, ${PAINEL_DESKTOP.max}px)`;

function verificarSuporteWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

function deveAtivarModoEstatico(): boolean {
  if (typeof window === 'undefined') return true;
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return reduzido || !verificarSuporteWebGL();
}

interface HeroScrollytellingProps {
  onNavigateContact?: () => void;
}

export const HeroScrollytelling: React.FC<HeroScrollytellingProps> = ({ onNavigateContact }) => {
  const containerRef = useRef<HTMLElement>(null);
  const fotoRef = useRef<HTMLDivElement>(null);
  const fundoPainelRef = useRef<HTMLDivElement>(null);
  const conteudoRef = useRef<HTMLDivElement>(null);
  const numeroRef = useRef<HTMLSpanElement>(null);
  const tituloRef = useRef<HTMLSpanElement>(null);
  const detalheRef = useRef<HTMLParagraphElement>(null);
  const linhaRef = useRef<HTMLDivElement>(null);
  const avisoRef = useRef<HTMLSpanElement>(null);

  const [modoEstatico] = useState(deveAtivarModoEstatico);

  // Sem âncora, a narrativa sempre abre em 01/05: nada de restaurar o scroll no meio.
  useLayoutEffect(() => {
    if (modoEstatico || window.location.hash) return;
    const anterior = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    return () => {
      window.history.scrollRestoration = anterior;
    };
  }, [modoEstatico]);

  // Única fonte de tempo: tween proxy com scrub.
  useLayoutEffect(() => {
    if (modoEstatico || !containerRef.current) return;
    const toque = window.matchMedia('(pointer: coarse)').matches;
    useHeroScrollStore.getState().setProgress(0);

    const ctx = gsap.context(() => {
      const proxy = { progress: 0 };
      gsap.to(proxy, {
        progress: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: toque ? 0.5 : 1,
          invalidateOnRefresh: true,
        },
        onUpdate: () => useHeroScrollStore.getState().setProgress(proxy.progress),
      });
    }, containerRef);

    return () => {
      ctx.revert();
      useHeroScrollStore.getState().setProgress(0);
    };
  }, [modoEstatico]);

  // Camadas DOM leem o mesmo progress, sem re-render do React.
  useEffect(() => {
    if (modoEstatico) return;
    let faseEscrita = '';

    const aplicar = (progress: number) => {
      const { inicio, fim } = FASES.obra;
      const obra = progressoNaFaixa(progress, inicio, fim);

      if (fotoRef.current) {
        fotoRef.current.style.opacity = obra.toFixed(3);
      }
      if (fundoPainelRef.current && conteudoRef.current) {
        // No desktop o painel recolhe até o bloco de texto e a foto toma a tela.
        const topo = conteudoRef.current.offsetTop * progressoNaFaixa(obra, 0.25, 1);
        fundoPainelRef.current.style.clipPath = `inset(${topo.toFixed(1)}px 0 0 0)`;
      }
      if (linhaRef.current) {
        linhaRef.current.style.transform = `scaleX(${progress.toFixed(4)})`;
      }
      if (avisoRef.current) {
        avisoRef.current.style.opacity = (1 - progressoNaFaixa(progress, 0.02, 0.08)).toFixed(2);
      }

      const fase = faseAtual(progress);
      if (fase !== faseEscrita) {
        faseEscrita = fase;
        const meta = METADADOS_FASES[fase];
        if (numeroRef.current) numeroRef.current.textContent = `${meta.numero}/05`;
        if (tituloRef.current) tituloRef.current.textContent = meta.titulo;
        if (detalheRef.current) detalheRef.current.textContent = meta.detalhe;
      }
    };

    aplicar(useHeroScrollStore.getState().progress);
    return useHeroScrollStore.subscribe(({ progress }) => aplicar(progress));
  }, [modoEstatico]);

  if (modoEstatico) {
    return (
      <section id="hero" data-tema="noite" className="relative w-full bg-preto text-papel">
        <HeroScrollFallback onNavigateContact={onNavigateContact} />
      </section>
    );
  }

  const inicial = METADADOS_FASES.traco;

  return (
    <section
      ref={containerRef}
      id="hero"
      data-tema="noite"
      className="relative w-full bg-preto text-papel"
      style={{ minHeight: '300vh' }}
    >
      {/* Sticky: nenhum ancestral pode ter overflow hidden/auto */}
      <div className="sticky top-0 h-screen h-[100svh] w-full overflow-hidden flex flex-col lg:block">
        {/* Palco: em tela cheia no desktop, acima do texto no celular */}
        <div className="relative flex-1 min-h-0 lg:absolute lg:inset-0" aria-hidden="true">
          <Suspense fallback={null}>
            <HeroScrollCena />
          </Suspense>

          <div ref={fotoRef} className="absolute inset-0 opacity-0 pointer-events-none">
            <Foto
              srcBase="/obras/cozinha-gringa-4k"
              alt={ALT_FOTO_COZINHA}
              prioridade
              sizes="100vw"
              className="w-full h-full"
              imgStyle={{
                objectFit: 'cover',
                objectPosition: `${RECORTE_FOTO.x * 100}% ${RECORTE_FOTO.y * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Painel em --preto: o texto nunca depende do que está atrás dele */}
        <div
          className="relative shrink-0 flex flex-col justify-end lg:absolute lg:inset-y-0 lg:left-0 lg:w-[var(--painel)]"
          style={{ '--painel': LARGURA_PAINEL_CSS } as React.CSSProperties}
        >
          <div ref={fundoPainelRef} className="absolute inset-0 bg-preto" />

          <div ref={conteudoRef} className="relative px-16 sm:px-32 lg:px-48 pt-24 lg:pt-48 pb-24 lg:pb-48">
            <div aria-hidden="true" className="mb-16 lg:mb-24">
              <p className="tipo-cota text-papel flex items-baseline gap-8">
                <span ref={numeroRef} className="text-dourado">{inicial.numero}/05</span>
                <span ref={tituloRef}>{inicial.titulo}</span>
              </p>
              <p ref={detalheRef} className="tipo-cota text-papel/70 mt-4 hidden sm:block">
                {inicial.detalhe}
              </p>
              <div className="relative h-[2px] mt-8 bg-papel/20">
                <div
                  ref={linhaRef}
                  className="absolute inset-0 bg-dourado origin-left will-change-transform"
                  style={{ transform: 'scaleX(0)' }}
                />
              </div>
              <span ref={avisoRef} className="tipo-cota text-papel/70 inline-block mt-8">
                Role para construir a cozinha
              </span>
            </div>

            <HeroScrollConteudo onNavigateContact={onNavigateContact} />
          </div>
        </div>
      </div>
    </section>
  );
};
