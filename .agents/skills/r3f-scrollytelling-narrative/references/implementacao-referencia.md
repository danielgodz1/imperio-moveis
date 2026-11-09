# Implementação de referência — Hero scrollytelling

Esqueleto tipado dos quatro arquivos descritos no `SKILL.md`. Ele mostra **como as peças se conectam**. A direção visual final (cores exatas, textos de legenda, número de peças) deve seguir `DESIGN.md` e a skill `imperio-design-direction`.

Os blocos usam `~~~` em vez de três crases, para poderem ser colados no chat sem cortar.

---

## 1. `src/components/heroScroll/useHeroScrollStore.ts`

~~~ts
import { create } from 'zustand';

/** Faixas de progress (0 a 1) de cada fase. Fonte única para timeline e overlay. */
export const FASES = {
  traco: { inicio: 0.0, fim: 0.2 },
  profundidade: { inicio: 0.2, fim: 0.4 },
  construcao: { inicio: 0.4, fim: 0.7 },
  instalacao: { inicio: 0.7, fim: 0.85 },
  crossfade: { inicio: 0.85, fim: 1.0 },
} as const;

export type FaseId = keyof typeof FASES;

export function faseAtual(p: number): FaseId {
  const ids = Object.keys(FASES) as FaseId[];
  return ids.find((id) => p < FASES[id].fim) ?? 'crossfade';
}

/** Progresso local (0 a 1) dentro de uma faixa. */
export function progressoNaFaixa(p: number, inicio: number, fim: number): number {
  return Math.min(1, Math.max(0, (p - inicio) / (fim - inicio)));
}

interface HeroScrollState {
  progress: number;
  setProgress: (p: number) => void;
}

export const useHeroScrollStore = create<HeroScrollState>()((set) => ({
  progress: 0,
  setProgress: (p) => set({ progress: Math.min(1, Math.max(0, p)) }),
}));
~~~

---

## 2. `src/components/heroScroll/HeroScrollytelling.tsx`

~~~tsx
import React, { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Foto } from '../Foto';
import { HeroScrollFallback } from './HeroScrollFallback';
import { FASES, faseAtual, progressoNaFaixa, useHeroScrollStore } from './useHeroScrollStore';

gsap.registerPlugin(ScrollTrigger);

const HeroScrollCena = lazy(() =>
  import('./HeroScrollCena').then((m) => ({ default: m.HeroScrollCena }))
);

function webglDisponivel(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

function deveUsarModoEstatico(): boolean {
  if (typeof window === 'undefined') return true;
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return reduzido || !webglDisponivel();
}

interface HeroScrollytellingProps {
  onNavigateContact?: () => void;
}

export const HeroScrollytelling: React.FC<HeroScrollytellingProps> = ({ onNavigateContact }) => {
  const containerRef = useRef<HTMLElement>(null);
  const fotoFinalRef = useRef<HTMLDivElement>(null);
  const legendaRef = useRef<HTMLParagraphElement>(null);
  const [modoEstatico] = useState(deveUsarModoEstatico);

  // Única fonte de tempo: tween proxy com scrub (scrub sem animação seria ignorado).
  useLayoutEffect(() => {
    if (modoEstatico || !containerRef.current) return;
    const ctx = gsap.context(() => {
      const proxy = { p: 0 };
      gsap.to(proxy, {
        p: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
        onUpdate: () => useHeroScrollStore.getState().setProgress(proxy.p),
      });
    }, containerRef);
    return () => {
      ctx.revert();
      useHeroScrollStore.getState().setProgress(0);
    };
  }, [modoEstatico]);

  // Camadas DOM leem o MESMO progress, sem re-render do React.
  useEffect(() => {
    if (modoEstatico) return;
    return useHeroScrollStore.subscribe(({ progress }) => {
      if (fotoFinalRef.current) {
        const { inicio, fim } = FASES.crossfade;
        fotoFinalRef.current.style.opacity = String(progressoNaFaixa(progress, inicio, fim));
      }
      if (legendaRef.current) {
        const fase = faseAtual(progress);
        if (legendaRef.current.dataset.fase !== fase) {
          legendaRef.current.dataset.fase = fase;
          // textos por fase vêm de um objeto local (LEGENDAS[fase])
        }
      }
    });
  }, [modoEstatico]);

  if (modoEstatico) {
    return (
      <section id="hero" data-tema="noite" className="relative bg-[#15100c] text-[#f2e8d8]">
        <HeroScrollFallback onNavigateContact={onNavigateContact} />
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      id="hero"
      data-tema="noite"
      className="relative bg-[#15100c] text-[#f2e8d8]"
      style={{ minHeight: '300vh' }}
    >
      {/* Sticky: nenhum ancestral pode ter overflow hidden/auto */}
      <div className="sticky top-0 h-screen h-[100svh] overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <Suspense fallback={null}>
            <HeroScrollCena />
          </Suspense>
        </div>

        <div ref={fotoFinalRef} className="absolute inset-0 opacity-0 pointer-events-none">
          <Foto
            srcBase="/obras/cozinha-gringa-4k"
            alt="Cozinha planejada com ilha em verde-sálvia, ripado de madeira freijó, bancada em granito preto e LED executada pela Império em Jaú"
            sizes="100vw"
            className="w-full h-full"
          />
        </div>

        {/* Overlay HTML: H1 idêntico a h1Inicial, subtítulo e CTAs do hero atual */}
        <div className="relative z-10 h-full">
          <h1>Arquitetura e marcenaria na mesma mesa.</h1>
          <p ref={legendaRef} data-fase="traco" />
          {/* CTAs: Pedir orçamento / WhatsApp, Ver as obras, Instagram */}
        </div>
      </div>
    </section>
  );
};
~~~

---

## 3. `src/components/heroScroll/HeroScrollCena.tsx`

~~~tsx
import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';
import { FASES, useHeroScrollStore } from './useHeroScrollStore';

const ESPESSURA = 0.018; // chapa de 18 mm

function Narrativa() {
  const { camera, invalidate, scene } = useThree();
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const alvo = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  const linhasPlanta = useRef<THREE.Mesh[]>([]);
  const paredes = useRef<THREE.Group>(null);
  const pecas = useRef<THREE.Mesh[]>([]);
  const led = useRef<THREE.PointLight>(null);

  // Timeline construída UMA vez; duração total exatamente 1.
  useLayoutEffect(() => {
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });

    // Fase 1 — Traço: cada linha cresce em scale.x (geometria ancorada em x=0)
    const f1 = FASES.traco;
    const passo1 = (f1.fim - f1.inicio) / Math.max(1, linhasPlanta.current.length);
    linhasPlanta.current.forEach((m, i) => {
      tl.fromTo(m.scale, { x: 0.0001 }, { x: 1, duration: passo1 }, f1.inicio + i * passo1);
    });

    // Fase 2 — Profundidade: paredes sobem e câmera desce para 3/4
    const f2 = FASES.profundidade;
    if (paredes.current) {
      tl.fromTo(paredes.current.scale, { y: 0.0001 }, { y: 1, duration: f2.fim - f2.inicio }, f2.inicio);
    }
    tl.to(camera.position, { x: 4, y: 4.5, z: 5.5, duration: f2.fim - f2.inicio }, f2.inicio);

    // Fase 3 — Construção: peças entram de fora do frame e encaixam
    const f3 = FASES.construcao;
    const passo3 = (f3.fim - f3.inicio) / Math.max(1, pecas.current.length);
    pecas.current.forEach((m, i) => {
      const final = m.userData.posicaoFinal as THREE.Vector3;
      tl.fromTo(
        m.position,
        { x: final.x + 3, y: final.y + 2, z: final.z },
        { x: final.x, y: final.y, z: final.z, duration: passo3, ease: 'power2.out' },
        f3.inicio + i * passo3
      );
    });
    tl.to(alvo, { x: -0.6, y: 1.2, z: -1.2, duration: f3.fim - f3.inicio }, f3.inicio);

    // Fase 4 — Instalação: LED acende e câmera recua
    const f4 = FASES.instalacao;
    if (led.current) {
      tl.fromTo(led.current, { intensity: 0 }, { intensity: 2, duration: f4.fim - f4.inicio }, f4.inicio);
    }
    tl.to(camera.position, { x: 3, y: 2.2, z: 6.5, duration: f4.fim - f4.inicio }, f4.inicio);

    // Fase 5 (crossfade) é DOM; garante duração total = 1
    tl.set({}, {}, 1);

    tlRef.current = tl;
    tl.progress(useHeroScrollStore.getState().progress);
    invalidate();

    const cancelar = useHeroScrollStore.subscribe(() => invalidate());
    return () => {
      cancelar();
      tl.kill();
      tlRef.current = null;
    };
  }, [camera, invalidate, alvo]);

  useFrame(() => {
    const tl = tlRef.current;
    if (!tl) return;
    const p = useHeroScrollStore.getState().progress;
    if (tl.progress() !== p) tl.progress(p);
    camera.lookAt(alvo);
  });

  // Rede de segurança de dispose (o R3F já libera o que é declarado em JSX)
  useEffect(
    () => () => {
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry?.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((mat) => {
          Object.values(mat).forEach((v) => {
            if (v && (v as THREE.Texture).isTexture) (v as THREE.Texture).dispose();
          });
          mat.dispose();
        });
      });
    },
    [scene]
  );

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 8, 5]} intensity={1.1} />
      <pointLight ref={led} color="#ffb46b" intensity={0} distance={3} position={[-0.6, 2.2, -1.2]} />
      {/* planta (linhasPlanta), piso, paredes (group com âncora na base), módulos da cozinha e ilha central */}
    </>
  );
}

export const HeroScrollCena: React.FC = () => {
  const mobile = useMemo(
    () => window.matchMedia('(max-width: 767px), (pointer: coarse)').matches,
    []
  );
  return (
    <Canvas
      frameloop="demand"
      dpr={mobile ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 9, 0.001], fov: 35, near: 0.1, far: 50 }}
      gl={{ antialias: !mobile, powerPreference: 'high-performance' }}
    >
      <Narrativa />
    </Canvas>
  );
};
~~~

---

## 4. `src/components/heroScroll/HeroScrollFallback.tsx`

~~~tsx
import React from 'react';
import { Foto } from '../Foto';

interface HeroScrollFallbackProps {
  onNavigateContact?: () => void;
}

/** Cena final estática: usada em reduced-motion, sem WebGL e como fallback do Suspense. */
export const HeroScrollFallback: React.FC<HeroScrollFallbackProps> = ({ onNavigateContact }) => (
  <div className="relative min-h-[100svh]">
    <Foto
      srcBase="/obras/cozinha-gringa-4k"
      alt="Cozinha planejada com ilha em verde-sálvia, ripado de madeira freijó, bancada em granito preto e LED executada pela Império em Jaú"
      prioridade
      sizes="100vw"
      className="absolute inset-0 w-full h-full"
    />
    <div className="relative z-10">
      {/* Mesmo H1, subtítulo e CTAs do overlay principal */}
    </div>
  </div>
);
~~~

> Observação: quando usado como `fallback` do `Suspense` dentro da cena sticky, renderize apenas a imagem (sem repetir o H1), para não haver dois `<h1>` na página.

---

## 5. Alteração em `src/App.tsx` (única)

~~~tsx
// antes
import { Hero } from './components/Hero';
<Hero onNavigateContact={() => handleNavigateRoute('/contato')} />

// depois
import { HeroScrollytelling } from './components/heroScroll/HeroScrollytelling';
<HeroScrollytelling onNavigateContact={() => handleNavigateRoute('/contato')} />
~~~

Nenhuma outra linha do `App.tsx` muda.

