import React, { useEffect, useRef } from 'react';
import { useHeroScrollStore } from './useHeroScrollStore';

/**
 * Palco do hero em vídeo (render feito no Google Flow a partir do 3D do site).
 * A rolagem controla o tempo do vídeo, igual ao 3D: o mesmo progress do store.
 * Teste: abra o site com ?hero=video.
 */
export const HeroVideoCena: React.FC = () => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    let quadro = 0;
    const aplicar = (progress: number) => {
      if (quadro) return;
      quadro = requestAnimationFrame(() => {
        quadro = 0;
        if (!v.duration || v.seeking) return;
        const alvo = Math.min(v.duration - 0.05, Math.max(0, progress * v.duration));
        if (Math.abs(v.currentTime - alvo) > 0.03) v.currentTime = alvo;
      });
    };
    const atual = () => aplicar(useHeroScrollStore.getState().progress);
    v.addEventListener('loadedmetadata', atual);
    // Seek terminou: se a rolagem andou nesse meio tempo, alcança.
    v.addEventListener('seeked', atual);
    atual();
    const parar = useHeroScrollStore.subscribe(({ progress }) => aplicar(progress));
    return () => {
      parar();
      cancelAnimationFrame(quadro);
      v.removeEventListener('loadedmetadata', atual);
      v.removeEventListener('seeked', atual);
    };
  }, []);

  return (
    <video
      ref={ref}
      src="/videos/hero-cozinha.mp4"
      poster="/videos/hero-cozinha-poster.jpg"
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
};
