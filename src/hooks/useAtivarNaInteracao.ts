import { useEffect, useState } from 'react';

/**
 * Liga algo pesado (o editor 3D) só quando a pessoa mostra que está ali: rolar, tocar, teclar,
 * clicar ou, no computador, mover o mouse. Até lá a página fica leve e rápida para pintar.
 * `jaAtivo` liga na hora (ex.: link de projeto compartilhado).
 */
export function useAtivarNaInteracao(jaAtivo = false): [boolean, () => void] {
  const [ativo, setAtivo] = useState(() => jaAtivo || (typeof window !== 'undefined' && window.scrollY > 0));
  useEffect(() => {
    if (ativo) return;
    const eventos = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'keydown'];
    if (window.matchMedia('(pointer: fine)').matches) eventos.push('pointermove');
    const ativar = () => setAtivo(true);
    eventos.forEach((e) => window.addEventListener(e, ativar, { once: true, passive: true }));
    return () => eventos.forEach((e) => window.removeEventListener(e, ativar));
  }, [ativo]);
  return [ativo, () => setAtivo(true)];
}
