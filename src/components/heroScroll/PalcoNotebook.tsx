import React, { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { larguraPainel, useHeroScrollStore } from './useHeroScrollStore';
import { FAIXAS_NOTEBOOK, calcularLayout, naFaixa, tempoNotebook } from './geometriaNotebook';

const HeroScrollCena = lazy(() => import('./HeroScrollCena').then((m) => ({ default: m.HeroScrollCena })));

interface PalcoNotebookProps {
  /** O 3D e o vídeo só carregam depois da primeira interação. */
  ativo: boolean;
  /** Deslocamento do notebook no começo, em fração da largura do palco (V1: foge do painel de texto). */
  deslocX?: number;
  /** Deslocamento vertical no começo, em fração da altura (V2: espaço para o título). */
  deslocY?: number;
  /** Escala do notebook no começo (1 = cobre o palco no computador). */
  escalaInicial?: number;
  /** V1 no computador: começa no espaço à direita do painel de texto. */
  fugirDoPainel?: boolean;
  onLento?: () => void;
  /**
   * Classe CSS que posiciona o pôster (index.css): a mesma do HTML inicial, para o pôster do React
   * ficar no mesmo lugar e do mesmo tamanho (sem pulo e sem "roubar" o LCP do HTML inicial).
   */
  classePoster?: 'poster-notebook-estatico' | 'poster-notebook-v2';
}

const POSTER = '/videos/notebook-poster.jpg';
const ALT_POSTER =
  'Apresentação de Projeto 3D de Cozinha Planejada Sob Medida em Jaú SP - Império Móveis Planejados';

function escolherVideo(): string {
  const px = window.innerWidth * Math.min(2, window.devicePixelRatio || 1);
  const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
  const lenta = nav.connection?.saveData || /(^|-)2g|3g/.test(nav.connection?.effectiveType ?? '');
  return !lenta && px >= 1500 ? '/videos/notebook-1080.mp4' : '/videos/notebook-720.mp4';
}

/**
 * Abertura cinematográfica do hero: o notebook abre com a rolagem, a tela acende com a cozinha
 * sendo montada em 3D e a câmera entra na tela até ela tomar o palco inteiro. Quem decide o
 * momento é o progress do hero (o mesmo da montagem); a foto real entra por cima, no componente pai.
 *
 * O canvas 3D tem sempre o tamanho do palco (nítido em qualquer zoom); só a área da tela fica
 * visível (clip-path) e a câmera encaixa o quadro nessa área (tela no store).
 */
export const PalcoNotebook: React.FC<PalcoNotebookProps> = ({ ativo, deslocX = 0, deslocY = 0, escalaInicial = 1, fugirDoPainel = false, onLento, classePoster = 'poster-notebook-estatico' }) => {
  // Até o vídeo ter o primeiro quadro, o pôster é uma <img> posicionada por CSS (igual ao HTML inicial).
  const [temQuadro, setTemQuadro] = useState(false);
  const posterRef = useRef<HTMLImageElement | null>(null);

  // Antes da primeira pintura: reaproveita o <img> do HTML inicial (se for o mesmo pôster) ou cria um.
  useLayoutEffect(() => {
    const palco = palcoRef.current;
    if (!palco || temQuadro) return;
    const global = window as Window & { __posterInicial?: Element | null };
    const inicial = global.__posterInicial;
    let img: HTMLImageElement;
    if (inicial instanceof HTMLImageElement && inicial.classList.contains(classePoster)) {
      img = inicial;
      if (!img.alt) img.alt = ALT_POSTER;
      global.__posterInicial = null;
    } else {
      img = document.createElement('img');
      img.className = classePoster;
      img.src = POSTER;
      img.alt = ALT_POSTER;
      img.width = 1280;
      img.height = 720;
      img.setAttribute('fetchpriority', 'high');
      img.decoding = 'async';
    }
    palco.insertBefore(img, palco.firstChild);
    posterRef.current = img;
    return () => {
      img.remove();
      posterRef.current = null;
    };
  }, [classePoster, temQuadro]);
  const palcoRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cenaRef = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  // Adia o carregamento do vídeo pesado para fora da pintura inicial (LCP < 2.5s / INP < 200ms)
  // usando IntersectionObserver + requestIdleCallback.
  useEffect(() => {
    if (!ativo || src) return;
    const palco = palcoRef.current;
    let cancelado = false;
    let idleId: number | null = null;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const agendarCarregamentoVideo = () => {
      const w = window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        cancelIdleCallback?: (id: number) => void;
      };
      if (typeof w.requestIdleCallback === 'function') {
        idleId = w.requestIdleCallback(
          () => {
            if (!cancelado) setSrc(escolherVideo());
          },
          { timeout: 1200 }
        );
      } else {
        timerId = setTimeout(() => {
          if (!cancelado) setSrc(escolherVideo());
        }, 120);
      }
    };

    if (typeof IntersectionObserver !== 'undefined' && palco) {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io.disconnect();
            agendarCarregamentoVideo();
          }
        },
        { rootMargin: '100px' }
      );
      io.observe(palco);
      return () => {
        cancelado = true;
        io.disconnect();
        const w = window as Window & { cancelIdleCallback?: (id: number) => void };
        if (idleId !== null && typeof w.cancelIdleCallback === 'function') w.cancelIdleCallback(idleId);
        if (timerId !== null) clearTimeout(timerId);
      };
    }

    agendarCarregamentoVideo();
    return () => {
      cancelado = true;
      const w = window as Window & { cancelIdleCallback?: (id: number) => void };
      if (idleId !== null && typeof w.cancelIdleCallback === 'function') w.cancelIdleCallback(idleId);
      if (timerId !== null) clearTimeout(timerId);
    };
  }, [ativo, src]);

  useEffect(() => {
    const palco = palcoRef.current;
    const video = videoRef.current;
    if (!palco || !video) return;
    let tamanho = { w: palco.clientWidth, h: palco.clientHeight };
    let ultimoP = -1;
    let quadro = 0;

    const aplicar = (p: number, forcar = false) => {
      if (!forcar && Math.abs(p - ultimoP) < 1e-5) return;
      ultimoP = p;
      const zoom = naFaixa(p, FAIXAS_NOTEBOOK.aproximar);
      const l = calcularLayout({
        largura: tamanho.w,
        altura: tamanho.h,
        zoom,
        deslocX: deslocX * tamanho.w + (fugirDoPainel ? larguraPainel(tamanho.w) / 2 : 0),
        deslocY: deslocY * tamanho.h,
        escalaInicial: fugirDoPainel && larguraPainel(tamanho.w) > 0 ? escalaInicial * 0.78 : escalaInicial,
      });
      video.style.width = `${l.videoW}px`;
      video.style.height = `${l.videoH}px`;
      video.style.transform = `translate3d(${l.tx.toFixed(2)}px, ${l.ty.toFixed(2)}px, 0) scale(${l.escala.toFixed(5)})`;
      if (cenaRef.current) {
        const r = l.recorte;
        cenaRef.current.style.clipPath = `inset(${r.topo.toFixed(1)}px ${r.direita.toFixed(1)}px ${r.base.toFixed(1)}px ${r.esquerda.toFixed(1)}px)`;
        cenaRef.current.style.opacity = naFaixa(p, FAIXAS_NOTEBOOK.acender).toFixed(3);
      }
      useHeroScrollStore.setState({ tela: l.telaCamera });

      // Tampa: o tempo do vídeo acompanha o começo da rolagem (seek só quando o anterior terminou).
      if (video.readyState >= 1 && !video.seeking) {
        const alvo = Math.min(tempoNotebook(p), (video.duration || 5.2) - 0.05);
        if (Math.abs(video.currentTime - alvo) > 0.02) video.currentTime = alvo;
      }
    };

    const agendar = (p: number) => {
      cancelAnimationFrame(quadro);
      quadro = requestAnimationFrame(() => aplicar(p));
    };
    const aoRedimensionar = () => {
      tamanho = { w: palco.clientWidth, h: palco.clientHeight };
      aplicar(useHeroScrollStore.getState().progress, true);
    };
    const aoBuscar = () => aplicar(useHeroScrollStore.getState().progress, true);

    aoRedimensionar();
    const obs = new ResizeObserver(aoRedimensionar);
    obs.observe(palco);
    video.addEventListener('seeked', aoBuscar);
    video.addEventListener('loadedmetadata', aoBuscar);
    let anterior = useHeroScrollStore.getState().progress;
    const parar = useHeroScrollStore.subscribe((s) => {
      if (s.progress === anterior) return;
      anterior = s.progress;
      agendar(s.progress);
    });
    return () => {
      parar();
      obs.disconnect();
      cancelAnimationFrame(quadro);
      video.removeEventListener('seeked', aoBuscar);
      video.removeEventListener('loadedmetadata', aoBuscar);
      useHeroScrollStore.setState({ tela: null });
    };
  }, [deslocX, deslocY, escalaInicial, fugirDoPainel]);

  // iOS só libera o seek depois de um play/pause iniciado por gesto (vídeo mudo).
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !src) return;
    const liberar = () => v.play().then(() => v.pause()).catch(() => undefined);
    v.addEventListener('loadedmetadata', liberar, { once: true });
    return () => v.removeEventListener('loadedmetadata', liberar);
  }, [src]);

  return (
    <div ref={palcoRef} className="palco-estatico absolute inset-0 overflow-hidden bg-[#050505]" aria-hidden="true">
      <video
        ref={videoRef}
        src={src ?? undefined}
        poster={POSTER}
        onLoadedData={() => setTemQuadro(true)}
        muted
        playsInline
        loop
        preload={src ? 'metadata' : 'none'}
        disablePictureInPicture
        disableRemotePlayback
        className="absolute left-0 top-0 max-w-none origin-top-left will-change-transform object-cover"
      />
      <div ref={cenaRef} className="absolute inset-0 will-change-[clip-path]" style={{ opacity: 0 }}>
        {ativo && (
          <Suspense fallback={null}>
            <HeroScrollCena onLento={onLento} />
          </Suspense>
        )}
      </div>
    </div>
  );
};
