import React from 'react';

/**
 * Primeiro quadro do hero enquanto o 3D não carrega: a cozinha só em traço de lápis dourado
 * (aéreos, balcão, torre, ilha). SVG estático, sem custo de processamento.
 */
export const PosterTraco: React.FC = () => (
  <svg
    viewBox="0 0 400 300"
    preserveAspectRatio="xMidYMid meet"
    // Abaixo do cabeçalho fixo (cerca de 80 px) e com respiro nas bordas.
    className="absolute left-16 right-16 top-[96px] bottom-16 w-[calc(100%-32px)] h-[calc(100%-112px)] lg:left-[45%] lg:right-48 lg:top-[120px] lg:bottom-48 lg:w-auto lg:h-[calc(100%-168px)]"
    aria-hidden="true"
    fill="none"
    stroke="var(--dourado)"
    strokeWidth={1.5}
    strokeLinecap="round"
    vectorEffect="non-scaling-stroke"
    opacity={0.6}
  >
    {/* piso e teto */}
    <path d="M30 262 H370" opacity={0.5} />
    <path d="M30 34 H370" opacity={0.3} />
    {/* aéreos até o teto */}
    <rect x={60} y={40} width={210} height={62} />
    <path d="M102 40 V102 M144 40 V102 M186 40 V102 M228 40 V102" />
    {/* bancada e balcão */}
    <path d="M56 160 H274" />
    <rect x={60} y={164} width={210} height={84} />
    <path d="M102 164 V248 M144 164 V248 M186 164 V248 M228 164 V248" />
    <path d="M62 252 H268" opacity={0.5} />
    {/* torre quente */}
    <rect x={282} y={40} width={58} height={208} />
    <rect x={290} y={92} width={42} height={30} opacity={0.7} />
    <rect x={290} y={128} width={42} height={22} opacity={0.7} />
    {/* ilha em perspectiva leve */}
    <path d="M110 214 L150 196 H300 L260 214 Z" opacity={0.85} />
    <path d="M110 214 V256 H260 V214 M300 196 V238 L260 256" opacity={0.85} />
  </svg>
);
