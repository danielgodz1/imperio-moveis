import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Global lenis instance reference for programmatic scrolling
export let globalLenis: Lenis | null = null;

export function scrollToTarget(target: string | HTMLElement, offset = -80) {
  if (globalLenis) {
    globalLenis.scrollTo(target, { offset, duration: 1.2 });
  } else {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

export function useScrollytelling() {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Check user accessibility preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
      duration: prefersReducedMotion ? 0.1 : 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 1.5,
    });
    globalLenis = lenis;

    // Synchronize Lenis scroll with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // 2. Reading Progress Bar Animation (Golden Bar at Top)
    if (progressBarRef.current) {
      gsap.to(progressBarRef.current, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.2,
        },
      });
    }

    // 3. Smart Header Hide on Scroll Down, Reveal on Scroll Up (Transforms only for 60fps)
    if (headerRef.current) {
      ScrollTrigger.create({
        start: 'top top',
        end: 'max',
        onUpdate: (self) => {
          const currentScroll = self.scroll();
          const header = headerRef.current;
          if (!header) return;

          // If scrolled down past 120px, hide header smoothly
          if (currentScroll > 120 && self.direction === 1) {
            gsap.to(header, {
              yPercent: -100,
              duration: 0.35,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          } else if (self.direction === -1 || currentScroll <= 40) {
            // Scrolling up or at the top: reveal header
            gsap.to(header, {
              yPercent: 0,
              duration: 0.35,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          }
        },
      });
    }

    // 4. Handle Window Resize & Image Load Refresh to prevent blank areas / layout shift
    const handleLoad = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener('load', handleLoad);
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('load', handleLoad);
      clearTimeout(refreshTimer);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      globalLenis = null;
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return { progressBarRef, headerRef };
}
