import React from 'react';
import { Foto } from '../Foto';
import { ALT_FOTO_COZINHA, HeroScrollConteudo } from './HeroScrollConteudo';

interface HeroScrollFallbackProps {
  onNavigateContact?: () => void;
}

/**
 * Hero estático: foto real e conteúdo comercial, usado em prefers-reduced-motion
 * ou sem WebGL. Tem altura natural, sem os 300vh da narrativa.
 */
export const HeroScrollFallback: React.FC<HeroScrollFallbackProps> = ({ onNavigateContact }) => (
  <div className="relative flex flex-col lg:block lg:min-h-[100svh]">
    <div className="relative h-[52svh] lg:absolute lg:inset-0 lg:h-auto">
      <Foto
        srcBase="/obras/cozinha-gringa-4k"
        alt={ALT_FOTO_COZINHA}
        prioridade
        sizes="100vw"
        className="w-full h-full"
        imgStyle={{ objectFit: 'cover', objectPosition: '50% 55%' }}
      />
    </div>
    <div className="relative bg-preto px-16 sm:px-32 pt-32 pb-48 lg:absolute lg:left-0 lg:bottom-0 lg:w-[clamp(440px,38vw,600px)] lg:px-48 lg:pt-48">
      <HeroScrollConteudo onNavigateContact={onNavigateContact} />
    </div>
  </div>
);
