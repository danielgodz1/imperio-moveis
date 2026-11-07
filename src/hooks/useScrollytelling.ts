import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export let globalLenis: Lenis | null = null;

export function scrollToTarget(target: string | HTMLElement, offset = -72) {
  if (globalLenis) {
    globalLenis.scrollTo(target, { offset, duration: 1.0 });
  } else {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

export function useScrollytelling() {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

    let lenis: Lenis | null = null;
    let tickerCallback: ((time: number) => void) | null = null;

    // Lenis mantido apenas no desktop (desligado em toque e em reduced-motion)
    if (!prefersReducedMotion && !isTouchDevice) {
      lenis = new Lenis({
        duration: 1.05,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        syncTouch: false,
      });
      globalLenis = lenis;

      lenis.on('scroll', ScrollTrigger.update);

      tickerCallback = (time: number) => {
        lenis?.raf(time * 1000);
      };

      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);
    }

    // Cabeçalho inteligente: esconde ao rolar para baixo, volta ao subir
    if (headerRef.current) {
      ScrollTrigger.create({
        start: 'top top',
        end: 'max',
        onUpdate: (self) => {
          const currentScroll = self.scroll();
          const header = headerRef.current;
          if (!header) return;

          if (currentScroll > 120 && self.direction === 1) {
            gsap.to(header, {
              yPercent: -100,
              duration: 0.35,
              ease: 'power3.out',
              overwrite: 'auto',
            });
          } else if (self.direction === -1 || currentScroll <= 40) {
            gsap.to(header, {
              yPercent: 0,
              duration: 0.35,
              ease: 'power3.out',
              overwrite: 'auto',
            });
          }
        },
      });
    }

    const handleLoad = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('load', handleLoad);
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 450);

    return () => {
      window.removeEventListener('load', handleLoad);
      clearTimeout(refreshTimer);
      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
      }
      if (lenis) {
        lenis.destroy();
      }
      globalLenis = null;
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return { headerRef };
}
