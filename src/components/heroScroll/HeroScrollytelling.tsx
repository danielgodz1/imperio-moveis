import React, {
  Suspense,
  lazy,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Camera, Layers, MessageSquare, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Foto } from '../Foto';
import { HeroScrollFallback } from './HeroScrollFallback';
import {
  FASES,
  METADADOS_FASES,
  faseAtual,
  progressoNaFaixa,
  useHeroScrollStore,
} from './useHeroScrollStore';
import { getWhatsAppUrl, trackWhatsAppClick } from '../../utils/helpers';
import { scrollToTarget } from '../../hooks/useScrollytelling';

gsap.registerPlugin(ScrollTrigger);

// Carregamento sob demanda do Canvas 3D para manter o bundle inicial super leve
const HeroScrollCena = lazy(() =>
  import('./HeroScrollCena').then((mod) => ({ default: mod.HeroScrollCena }))
);

/** Verifica disponibilidade de WebGL no dispositivo do cliente */
function verificarSuporteWebGL(): boolean {
  if (typeof window === 'undefined') return false;
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

/** Determina se o modo estático deve ser ativado imediatamente */
function deveAtivarModoEstatico(): boolean {
  if (typeof window === 'undefined') return true;
  const prefereReducaoMovimento = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  return prefereReducaoMovimento || !verificarSuporteWebGL();
}

interface HeroScrollytellingProps {
  onNavigateContact?: () => void;
}

export const HeroScrollytelling: React.FC<HeroScrollytellingProps> = ({
  onNavigateContact,
}) => {
  const containerRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const fotoFinalRef = useRef<HTMLDivElement>(null);

  // Refs de elementos do overlay atualizados diretamente sem re-render React
  const badgeNumeroRef = useRef<HTMLSpanElement>(null);
  const badgeTituloRef = useRef<HTMLSpanElement>(null);
  const badgeDetalheRef = useRef<HTMLParagraphElement>(null);
  const barraProgressoRef = useRef<HTMLDivElement>(null);
  const overlayTextoRef = useRef<HTMLDivElement>(null);

  const [modoEstatico] = useState(deveAtivarModoEstatico);

  // ---------------------------------------------------------------------------
  // 1. SCROLLTRIGGER COM SCRUB REAL VIA OBJETO PROXY
  // ---------------------------------------------------------------------------
  useLayoutEffect(() => {
    if (modoEstatico || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const proxy = { progress: 0 };

      gsap.to(proxy, {
        progress: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          useHeroScrollStore.getState().setProgress(proxy.progress);
        },
      });
    }, containerRef);

    return () => {
      ctx.revert();
      useHeroScrollStore.getState().setProgress(0);
    };
  }, [modoEstatico]);

  // ---------------------------------------------------------------------------
  // 2. SINCRONIZAÇÃO DAS CAMADAS DOM (Crossfade e Legendas)
  // Conecta ao store Zustand sem disparar re-render no componente React
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (modoEstatico) return;

    let ultimaFaseRegistrada = '';

    const unsubscribe = useHeroScrollStore.subscribe(({ progress }) => {
      // (a) Crossfade da foto real dormitorio-led-1 (Fase 5: 0.85 -> 1.00)
      if (fotoFinalRef.current) {
        const opacidadeFoto = progressoNaFaixa(
          progress,
          FASES.crossfade.inicio,
          FASES.crossfade.fim
        );
        fotoFinalRef.current.style.opacity = opacidadeFoto.toFixed(3);
      }

      // (b) Barra de progresso contínua no topo
      if (barraProgressoRef.current) {
        barraProgressoRef.current.style.transform = `scaleX(${progress.toFixed(4)})`;
      }

      // (c) Atualização dos textos da fase atual (apenas quando a fase muda)
      const faseId = faseAtual(progress);
      if (faseId !== ultimaFaseRegistrada) {
        ultimaFaseRegistrada = faseId;
        const meta = METADADOS_FASES[faseId];

        if (badgeNumeroRef.current) {
          badgeNumeroRef.current.textContent = `ETAPA ${meta.numero}/05`;
        }
        if (badgeTituloRef.current) {
          badgeTituloRef.current.textContent = meta.titulo;
        }
        if (badgeDetalheRef.current) {
          badgeDetalheRef.current.textContent = meta.detalhe;
        }
      }

      // (d) Leve atenuação do texto no crossfade final para priorizar a fotografia
      if (overlayTextoRef.current) {
        if (progress > 0.88) {
          const atenuacao = 1 - (progress - 0.88) / 0.12 * 0.45;
          overlayTextoRef.current.style.opacity = atenuacao.toFixed(2);
        } else {
          overlayTextoRef.current.style.opacity = '1';
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [modoEstatico]);

  // Se o usuário prefere movimentos reduzidos ou não há WebGL, exibe o fallback estático
  if (modoEstatico) {
    return (
      <section
        id="hero"
        data-tema="noite"
        className="relative w-full bg-[#15100c] text-[#f2e8d8]"
      >
        <HeroScrollFallback onNavigateContact={onNavigateContact} />
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      id="hero"
      data-tema="noite"
      className="relative w-full bg-[#15100c] text-[#f2e8d8] border-b border-[#251d18]"
      style={{ minHeight: '300vh' }}
    >
      {/* ===================================================================== */}
      {/* CONTÊINER STICKY: Fixa a viewport (100vh / 100svh) sem pin destrutivo */}
      {/* ===================================================================== */}
      <div
        ref={stickyRef}
        className="sticky top-0 h-screen h-[100svh] w-full overflow-hidden flex flex-col justify-between"
      >
        {/* 1. Brilho radial quente de iluminação ambiente */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 right-[4%] -translate-y-1/2 w-[650px] sm:w-[850px] h-[650px] sm:h-[850px] rounded-full pointer-events-none opacity-60 z-0"
          style={{
            background:
              'radial-gradient(circle, rgba(201, 160, 78, 0.22) 0%, rgba(201, 160, 78, 0.06) 46%, transparent 70%)',
          }}
        />

        {/* 2. Textura sutil de granulação cinematográfica (4% opacidade) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.035] z-0 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* 3. Camada Three.js (Canvas 3D Único) */}
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <Suspense fallback={null}>
            <HeroScrollCena />
          </Suspense>
        </div>

        {/* 4. Camada de Crossfade: Fotografia Real do Dormitório Executado */}
        <div
          ref={fotoFinalRef}
          aria-hidden="true"
          className="absolute inset-0 z-10 pointer-events-none opacity-0 will-change-transform"
        >
          <Foto
            srcBase="/obras/dormitorio-led-1"
            alt="Dormitório planejado com guarda-roupa iluminado por LED executado pela Império em Jaú"
            prioridade
            sizes="100vw"
            className="w-full h-full"
            imgStyle={{
              objectFit: 'cover',
              objectPosition: 'center 45%',
            }}
          />
          {/* Degradê quente de leitura na base e nas laterais */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#15100c]/90 via-[#15100c]/25 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#15100c]/80 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* 5. Linha indicadora de progresso no topo */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 h-[2px] bg-[#251d18] z-30 pointer-events-none"
        >
          <div
            ref={barraProgressoRef}
            className="h-full bg-gradient-to-r from-[#c9a04e] via-[#eed59b] to-[#c9a04e] origin-left will-change-transform"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>

        {/* ===================================================================== */}
        {/* OVERLAY HTML DE CONTEÚDO (SEO, H1 & CONVERSÃO COMERCIAL)              */}
        {/* ===================================================================== */}
        <div
          ref={overlayTextoRef}
          className="relative z-20 w-full max-w-[1400px] mx-auto px-4 sm:px-8 pt-24 sm:pt-32 lg:pt-36 flex flex-col justify-between flex-1 pb-6 pointer-events-none will-change-transform"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Bloco de Headline e CTAs (Coluna Esquerda, 6 colunas) */}
            <div className="lg:col-span-6 flex flex-col items-start space-y-5 sm:space-y-6 pointer-events-auto">
              {/* Eyebrow de Marca */}
              <div className="inline-flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#c9a04e] shadow-[0_0_8px_rgba(201,160,78,0.8)]" />
                <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#c9a04e] uppercase">
                  MARCENARIA E ARQUITETURA — JAÚ E REGIÃO
                </span>
              </div>

              {/* H1 Semântico e Canônico */}
              <h1 className="font-serif-atelier font-bold text-[#f2e8d8] text-[clamp(2.5rem,5.6vw,5.4rem)] leading-[0.98] tracking-tight">
                <span className="block">Arquitetura e</span>
                <span className="block">marcenaria na</span>
                <span className="block italic text-[#c9a04e] font-normal font-serif mt-1">
                  mesma mesa.
                </span>
              </h1>

              {/* Subtítulo */}
              <p className="text-sm sm:text-base text-[#f2e8d8]/85 leading-relaxed max-w-lg font-light">
                A Tatiane projeta, o Wellington fabrica. Cozinhas, quartos, closets e lojas em Jaú e região com precisão milimétrica desde 2015.
              </p>

              {/* CTAs Comerciais */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-3.5 w-full pt-1">
                {onNavigateContact ? (
                  <button
                    type="button"
                    onClick={onNavigateContact}
                    className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-xl bg-[#c9a04e] hover:bg-[#d8af5c] text-[#15100c] text-xs font-bold uppercase tracking-widest transition-all duration-200 shadow-[0_12px_28px_rgba(201,160,78,0.28)] hover:scale-[1.02] cursor-pointer"
                  >
                    <span>Pedir orçamento</span>
                    <span className="text-sm font-semibold">↗</span>
                  </button>
                ) : (
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackWhatsAppClick('hero_cta')}
                    className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-xl bg-[#c9a04e] hover:bg-[#d8af5c] text-[#15100c] text-xs font-bold uppercase tracking-widest transition-all duration-200 shadow-[0_12px_28px_rgba(201,160,78,0.28)] hover:scale-[1.02] cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chamar no WhatsApp</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => scrollToTarget('#obras', -80)}
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-xl border border-[#f2e8d8]/30 hover:border-[#c9a04e] text-[#f2e8d8] hover:text-[#c9a04e] text-xs font-semibold uppercase tracking-wider transition-all duration-200 hover:bg-[#c9a04e]/10 cursor-pointer"
                >
                  <span>Ver as obras</span>
                </button>

                <a
                  href="https://www.instagram.com/imperio.moveis.jau"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-[#c9a04e]/40 bg-[#1d1612]/80 hover:border-[#c9a04e] text-[#f2e8d8] hover:text-[#c9a04e] text-xs font-semibold tracking-wider transition-all duration-200 hover:bg-[#c9a04e]/10"
                  title="Siga @imperio.moveis.jau no Instagram"
                >
                  <Camera className="w-4 h-4 text-[#c9a04e]" />
                  <span>@imperio.moveis.jau</span>
                </a>
              </div>
            </div>

            {/* Painel Flutuante com o Indicador da Fase Narrativa Atual (Coluna Direita) */}
            <div className="lg:col-span-6 flex flex-col items-end pointer-events-auto">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#1d1612]/90 backdrop-blur-md border border-[#c9a04e]/45 shadow-[0_16px_36px_rgba(0,0,0,0.7)] max-w-sm w-full">
                <div className="flex items-center justify-between pb-2 border-b border-[#c9a04e]/20">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#c9a04e]" />
                    <span
                      ref={badgeNumeroRef}
                      className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase font-bold text-[#c9a04e]"
                    >
                      ETAPA 01/05
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-[#f2e8d8]/60">
                    <Layers className="w-3 h-3 text-[#c9a04e]" />
                    <span>3D Realtime</span>
                  </span>
                </div>

                <div className="pt-2.5">
                  <span
                    ref={badgeTituloRef}
                    className="block font-serif-atelier font-semibold text-sm sm:text-base text-[#f2e8d8]"
                  >
                    O traço técnico inicial
                  </span>
                  <p
                    ref={badgeDetalheRef}
                    className="text-xs text-[#f2e8d8]/75 font-light leading-snug mt-1"
                  >
                    Planta baixa 2D com cotas precisas e vão de esquadrias
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de Rodapé do Hero: Indicação de Rolagem */}
          <div className="w-full flex items-center justify-between pt-4 border-t border-[#f2e8d8]/10 text-xs text-[#f2e8d8]/60 pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9a04e] animate-ping" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#c9a04e]">
                Role para ver a construção
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] tracking-wider uppercase text-[#f2e8d8]/50">
              <span>Do traço à obra pronta</span>
              <span className="text-[#c9a04e] text-sm animate-bounce">↓</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

