import { RefObject, useLayoutEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ANDAMENTO_CONCLUIDO, avancarAndamento, posicaoSegura } from './ritmoNarrativa';
import { globalLenis } from '../../hooks/useScrollytelling';
import { liberarNarrativa, useHeroScrollStore } from './useHeroScrollStore';

/**
 * Motor da narrativa do hero (V1 e V2): a rolagem define o alvo; o andamento exibido persegue
 * esse alvo com velocidade máxima (ritmoNarrativa), então rolar rápido não pula a montagem.
 * Enquanto a montagem não termina, a página fica presa no fim do hero; depois, fica livre.
 */
export function useNarrativaScroll(containerRef: RefObject<HTMLElement | null>, desligado: boolean) {
  useLayoutEffect(() => {
    if (desligado || !containerRef.current) return;
    const store = useHeroScrollStore;
    store.getState().setProgress(0);
    if (window.location.hash) liberarNarrativa();

    let alvo = 0;
    let atual = 0;
    let ultimo = 0;
    let quadro = 0;
    let concluida = false;

    const segurar = () => {
      if (concluida) return;
      const pos = posicaoSegura(window.scrollY, gatilho.end, atual, store.getState().liberado);
      if (pos === null) return;
      if (globalLenis) globalLenis.scrollTo(pos, { immediate: true, force: true });
      else window.scrollTo(0, pos);
    };

    const passo = (t: number) => {
      quadro = 0;
      const dt = Math.min(0.05, Math.max(0, (t - ultimo) / 1000));
      ultimo = t;
      atual = avancarAndamento(atual, alvo, dt);
      store.getState().setProgress(atual);
      if (atual >= ANDAMENTO_CONCLUIDO) concluida = true;
      segurar();
      if (atual !== alvo) quadro = requestAnimationFrame(passo);
    };
    const acordar = () => {
      if (quadro) return;
      ultimo = performance.now();
      quadro = requestAnimationFrame(passo);
    };

    const gatilho = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        alvo = self.progress;
        acordar();
      },
    });
    // Rolagem além do hero não chama onUpdate: a trava escuta a rolagem diretamente.
    const aoRolar = () => {
      if (concluida) return;
      if (window.scrollY > gatilho.end) alvo = 1;
      segurar();
      acordar();
    };
    window.addEventListener('scroll', aoRolar, { passive: true });

    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener('scroll', aoRolar);
      gatilho.kill();
      store.getState().setProgress(0);
    };
  }, [desligado, containerRef]);
}
