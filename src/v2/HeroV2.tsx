import React, { useEffect, useRef, useState } from 'react';
import { Foto } from '../components/Foto';
import { PalcoNotebook } from '../components/heroScroll/PalcoNotebook';
import { FASES, RECORTE_FOTO, faseAtual, progressoNaFaixa, useHeroScrollStore } from '../components/heroScroll/useHeroScrollStore';
import { useNarrativaScroll } from '../components/heroScroll/useNarrativaScroll';
import { ALT_FOTO_COZINHA } from '../components/heroScroll/HeroScrollConteudo';
import { scrollToTarget } from '../hooks/useScrollytelling';
import { ComItalico } from './Serif';
import { FASES_V2, HERO_V2 } from './textosV2';


function podeAnimar(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Monta o 3D só na primeira interação (o custo fica fora do carregamento inicial). */
function useAtivarNaInteracao(): boolean {
  const [ativo, setAtivo] = useState(() => typeof window !== 'undefined' && window.scrollY > 0);
  useEffect(() => {
    if (ativo) return;
    const eventos = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'keydown'];
    if (window.matchMedia('(pointer: fine)').matches) eventos.push('pointermove');
    const ativar = () => setAtivo(true);
    eventos.forEach((e) => window.addEventListener(e, ativar, { once: true, passive: true }));
    return () => eventos.forEach((e) => window.removeEventListener(e, ativar));
  }, [ativo]);
  return ativo;
}

interface HeroV2Props {
  onOrcamento: () => void;
}

/**
 * Capítulo 1: a cozinha se monta em tela cheia enquanto a pessoa rola.
 * O título se dissolve quando as paredes sobem; as fases correm numa faixa embaixo;
 * no fim entra a foto da obra real e o fechamento do capítulo.
 */
export const HeroV2: React.FC<HeroV2Props> = ({ onOrcamento }) => {
  const secaoRef = useRef<HTMLElement>(null);
  const tituloRef = useRef<HTMLDivElement>(null);
  const fotoRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);
  const linhaRef = useRef<HTMLDivElement>(null);
  const numeroRef = useRef<HTMLSpanElement>(null);
  const faseRef = useRef<HTMLSpanElement>(null);
  const fraseRef = useRef<HTMLSpanElement>(null);
  const [animado] = useState(podeAnimar);
  const [computador] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  const cenaAtiva = useAtivarNaInteracao();

  useNarrativaScroll(secaoRef, !animado);

  useEffect(() => {
    if (!animado) return;
    let faseEscrita = '';
    const aplicar = (p: number) => {
      const obra = progressoNaFaixa(p, FASES.obra.inicio, FASES.obra.fim);
      if (tituloRef.current) {
        const sai = progressoNaFaixa(p, 0.15, 0.27);
        tituloRef.current.style.opacity = (1 - sai).toFixed(3);
        tituloRef.current.style.transform = `translateY(${(-sai * 40).toFixed(1)}px)`;
      }
      if (fotoRef.current) fotoRef.current.style.opacity = obra.toFixed(3);
      if (finalRef.current) {
        const entra = progressoNaFaixa(obra, 0.45, 1);
        finalRef.current.style.opacity = entra.toFixed(3);
        finalRef.current.style.transform = `translateY(${((1 - entra) * 24).toFixed(1)}px)`;
        finalRef.current.style.pointerEvents = entra > 0.6 ? 'auto' : 'none';
      }
      if (linhaRef.current) linhaRef.current.style.transform = `scaleX(${p.toFixed(4)})`;
      const fase = faseAtual(p);
      if (fase !== faseEscrita) {
        faseEscrita = fase;
        const f = FASES_V2[fase];
        if (numeroRef.current) numeroRef.current.textContent = f.numero;
        if (faseRef.current) faseRef.current.textContent = f.titulo;
        if (fraseRef.current) fraseRef.current.textContent = f.frase;
      }
    };
    aplicar(useHeroScrollStore.getState().progress);
    return useHeroScrollStore.subscribe(({ progress }) => aplicar(progress));
  }, [animado]);

  const botoes = (
    <div className="flex flex-wrap items-center gap-16">
      <button type="button" onClick={onOrcamento} className="v2-botao v2-botao-claro">
        Quero o meu projeto
      </button>
      <button type="button" onClick={() => scrollToTarget('#v2-obras', 0)} className="v2-botao v2-botao-linha">
        Ver as obras
      </button>
    </div>
  );

  if (!animado) {
    return (
      <section id="hero" className="v2-escuro relative w-full min-h-[100svh] flex items-end">
        <div className="absolute inset-0">
          <Foto srcBase="/obras/cozinha-gringa-4k" alt={ALT_FOTO_COZINHA} prioridade sizes="100vw" className="w-full h-full" imgStyle={{ objectFit: 'cover' }} />
          <div className="absolute inset-0 bg-[var(--v2-noite)]/55" />
        </div>
        <div className="relative px-16 sm:px-32 lg:px-64 pb-64 pt-144 flex flex-col gap-24 max-w-[1100px]">
          <h1 className="v2-serif v2-display">
            <ComItalico texto={HERO_V2.titulo} />
          </h1>
          <p className="v2-corpo max-w-[46ch] text-[var(--v2-texto)]/85">{HERO_V2.apoio}</p>
          {botoes}
        </div>
      </section>
    );
  }

  const inicial = FASES_V2.traco;
  return (
    <section ref={secaoRef} id="hero" className="v2-escuro relative w-full" style={{ minHeight: '320vh' }}>
      <div className="sticky top-0 h-screen h-[100svh] w-full overflow-hidden">
        {/* Palco: o notebook abre, a cozinha se monta na tela e a câmera entra nela */}
        <div className="absolute inset-0" aria-hidden="true">
          <PalcoNotebook ativo={cenaAtiva} deslocY={0.17} escalaInicial={computador ? 0.7 : 0.98} />
          <div ref={fotoRef} className="absolute inset-0 opacity-0">
            <Foto
              srcBase="/obras/cozinha-gringa-4k"
              alt=""
              prioridade
              sizes="100vw"
              className="w-full h-full"
              imgStyle={{ objectFit: 'cover', objectPosition: `${RECORTE_FOTO.x * 100}% ${RECORTE_FOTO.y * 100}%` }}
            />
          </div>
        </div>

        {/* Abertura: o título fica sobre o traço escuro e se dissolve quando as paredes sobem */}
        <div ref={tituloRef} className="absolute inset-x-0 top-0 pt-[12svh] lg:pt-[11vh] px-16 sm:px-32 lg:px-64 lg:text-center lg:flex lg:flex-col lg:items-center will-change-transform">
          <h1 className="v2-serif v2-display text-[clamp(2.5rem,4.4vw,4.75rem)] max-w-[13ch] lg:max-w-[22ch]">
            <ComItalico texto={HERO_V2.titulo} />
          </h1>
          <p className="v2-corpo mt-16 lg:mt-24 max-w-[44ch]">{HERO_V2.apoio}</p>
          <p className="v2-cota mt-16 lg:mt-24">Role a página. A cozinha vai se montar na tela.</p>
        </div>

        {/* Fechamento do capítulo, sobre a foto da obra real */}
        <div
          ref={finalRef}
          className="absolute left-16 right-16 sm:left-32 sm:right-auto lg:left-64 bottom-[96px] sm:max-w-[560px] bg-[var(--v2-noite)] p-24 sm:p-32 flex flex-col gap-24 opacity-0"
          style={{ pointerEvents: 'none' }}
        >
          <p className="v2-serif v2-h3">
            <ComItalico texto={HERO_V2.final} />
          </p>
          {botoes}
        </div>

        {/* Faixa das fases: sempre sobre fundo sólido (legível sobre qualquer quadro da cena) */}
        <div className="absolute inset-x-0 bottom-0 bg-[var(--v2-noite)] px-16 sm:px-32 lg:px-64 pt-16 pb-[max(16px,env(safe-area-inset-bottom))]" aria-hidden="true">
          <div className="flex items-baseline gap-16">
            <span ref={numeroRef} className="v2-serif v2-italico text-[1.75rem] leading-none text-[var(--v2-acento)] w-[44px]">
              {inicial.numero}
            </span>
            <span ref={faseRef} className="v2-serif text-[1.375rem] leading-none">
              {inicial.titulo}
            </span>
            <span ref={fraseRef} className="v2-cota hidden sm:inline ml-auto">
              {inicial.frase}
            </span>
          </div>
          <div className="relative h-px mt-16 bg-[var(--v2-texto)]/15">
            <div ref={linhaRef} className="absolute inset-0 bg-[var(--v2-acento)] origin-left will-change-transform" style={{ transform: 'scaleX(0)' }} />
          </div>
        </div>
      </div>
    </section>
  );
};
