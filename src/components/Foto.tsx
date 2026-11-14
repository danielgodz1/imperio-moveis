import React from 'react';

export interface FotoProps {
  /** Caminho base sem extensão (ex: "/obras/cozinha-ilha-ripado") */
  srcBase: string;
  /** Texto alternativo descritivo obrigatório */
  alt: string;
  /** Proporção para reservar espaço e garantir CLS 0 (ex: "612 / 852" ou "16 / 10") */
  proporcao?: string;
  /** Define carregamento imediato e alta prioridade para o Hero */
  prioridade?: boolean;
  /** Atributo sizes responsivo */
  sizes?: string;
  /** Classes adicionais para o elemento picture */
  className?: string;
  /** Classes adicionais para a tag img interna */
  imgClassName?: string;
  /** Estilo inline opcional para a tag img (ex: objectPosition, imageRendering) */
  imgStyle?: React.CSSProperties;
  /** Callback ao carregar a imagem */
  onImgLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export const Foto: React.FC<FotoProps> = ({
  srcBase,
  alt,
  proporcao,
  prioridade = false,
  sizes = '100vw',
  className = '',
  imgClassName = '',
  imgStyle,
  onImgLoad,
}) => {
  const avifSrcSet = `${srcBase}-800.avif 800w, ${srcBase}-1600.avif 1600w`;
  const webpSrcSet = `${srcBase}-800.webp 800w, ${srcBase}-1600.webp 1600w`;
  const fallbackSrc = `${srcBase}.jpg`;
  const [rawW, rawH] = (proporcao ?? '16 / 10')
    .split('/')
    .map((n) => Math.round(parseFloat(n)) || 1);
  const w = rawW || 16;
  const h = rawH || 10;

  return (
    <picture
      className={`block overflow-hidden rounded-none shadow-none ${className}`}
      style={proporcao ? { aspectRatio: proporcao } : undefined}
    >
      <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />
      <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      <img
        src={fallbackSrc}
        alt={alt}
        width={w}
        height={h}
        loading={prioridade ? 'eager' : 'lazy'}
        fetchPriority={prioridade ? 'high' : 'auto'}
        decoding={prioridade ? 'sync' : 'async'}
        onLoad={onImgLoad}
        style={{
          ...(proporcao ? { aspectRatio: proporcao } : {}),
          ...imgStyle,
        }}
        className={`w-full h-full object-cover rounded-none shadow-none block ${imgClassName}`}
      />
    </picture>
  );
};
