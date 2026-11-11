import React, { useEffect, useRef, useState } from 'react';
import { useHeroScrollStore } from './useHeroScrollStore';
import { FonteVideo, escolherVideoDoAparelho, tempoDoVideo } from './escolherVideo';

interface HeroVideoCenaProps {
  /** Só baixa o vídeo depois da primeira interação; antes disso aparece o poster. */
  carregar: boolean;
  /** O vídeo não abriu (formato, rede, bloqueio): o hero volta ao 3D. */
  onFalha: () => void;
}

/**
 * Palco do hero em vídeo (render do Google Flow a partir do 3D do site).
 * A rolagem controla o tempo do vídeo, igual ao 3D: o mesmo progress do store.
 * Dois vídeos (vertical e horizontal), cada um em 1080p e 720p, escolhidos pelo aparelho.
 */
export const HeroVideoCena: React.FC<HeroVideoCenaProps> = ({ carregar, onFalha }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [fonte, setFonte] = useState<FonteVideo>(() => escolherVideoDoAparelho());

  // Girou o aparelho ou mudou a janela de formato: troca de vídeo (só se a orientação mudar).
  useEffect(() => {
    let espera = 0;
    const reavaliar = () => {
      window.clearTimeout(espera);
      espera = window.setTimeout(() => {
        const nova = escolherVideoDoAparelho();
        setFonte((atual) => (nova.orientacao !== atual.orientacao ? nova : atual));
      }, 250);
    };
    window.addEventListener('resize', reavaliar);
    window.addEventListener('orientationchange', reavaliar);
    return () => {
      window.clearTimeout(espera);
      window.removeEventListener('resize', reavaliar);
      window.removeEventListener('orientationchange', reavaliar);
    };
  }, []);

  // Rolagem -> tempo do vídeo.
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    let quadro = 0;
    const aplicar = (progress: number) => {
      if (quadro) return;
      quadro = requestAnimationFrame(() => {
        quadro = 0;
        if (!v.duration || v.seeking) return;
        const alvo = tempoDoVideo(progress, v.duration);
        if (Math.abs(v.currentTime - alvo) > 0.03) v.currentTime = alvo;
      });
    };
    const atual = () => aplicar(useHeroScrollStore.getState().progress);
    v.addEventListener('loadedmetadata', atual);
    // Quando um seek termina, alcança a rolagem que andou nesse meio tempo.
    v.addEventListener('seeked', atual);
    atual();
    const parar = useHeroScrollStore.subscribe(({ progress }) => aplicar(progress));
    return () => {
      parar();
      cancelAnimationFrame(quadro);
      v.removeEventListener('loadedmetadata', atual);
      v.removeEventListener('seeked', atual);
    };
  }, [fonte.src]);

  // iOS só libera o seek depois de um play/pause iniciado por gesto (o vídeo é mudo e sem som).
  useEffect(() => {
    const v = ref.current;
    if (!carregar || !v) return;
    const liberar = () => v.play().then(() => v.pause()).catch(() => undefined);
    if (v.readyState >= 1) liberar();
    else v.addEventListener('loadedmetadata', liberar, { once: true });
    return () => v.removeEventListener('loadedmetadata', liberar);
  }, [carregar, fonte.src]);

  return (
    <video
      ref={ref}
      key={fonte.orientacao}
      src={carregar ? fonte.src : undefined}
      poster={fonte.poster}
      muted
      playsInline
      preload={carregar ? 'auto' : 'none'}
      disablePictureInPicture
      disableRemotePlayback
      onError={onFalha}
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
};
