import React from 'react';

interface PlantaCozinhaProps {
  svgRef?: React.RefObject<SVGSVGElement | null>;
  className?: string;
}

export const PlantaCozinha: React.FC<PlantaCozinhaProps> = ({ svgRef, className = '' }) => {
  return (
    <svg
      ref={svgRef}
      viewBox="0 0 600 440"
      fill="none"
      aria-label="Planta baixa técnica de cozinha em L com ilha central e 3 cotas em metros"
      className={`w-full h-auto block select-none ${className}`}
    >
      <g filter="url(#filtro-lapis)" stroke="var(--dourado)" strokeLinecap="round" strokeLinejoin="round">
        {/* Grupo 1: Paredes externas da cozinha em L (1.5px) */}
        <g className="planta-paredes" strokeWidth="1.5">
          <path d="M 60 56 L 540 56 L 540 384 L 60 384 Z" className="traco-desenho" />
          <path d="M 70 66 L 530 66 L 530 374 L 70 374 Z" className="traco-desenho" />
        </g>

        {/* Grupo 2: Bancada em L, pia de cuba dupla e geladeira (1.5px) */}
        <g className="planta-bancada" strokeWidth="1.5">
          <path d="M 70 142 L 430 142 L 430 66" className="traco-desenho" />
          <path d="M 146 142 L 146 374" className="traco-desenho" />
          {/* Cuba dupla na bancada norte */}
          <rect x="200" y="78" width="48" height="44" className="traco-desenho" />
          <rect x="254" y="78" width="48" height="44" className="traco-desenho" />
          {/* Torre de fornos e geladeira na extremidade leste */}
          <rect x="438" y="66" width="88" height="82" className="traco-desenho" />
          <line x1="438" y1="66" x2="526" y2="148" className="traco-desenho" opacity="0.6" />
        </g>

        {/* Grupo 3: Ilha central com ripado, granito e cooktop (1.5px) */}
        <g className="planta-ilha" strokeWidth="1.5">
          <rect x="218" y="210" width="230" height="106" className="traco-desenho" />
          {/* Detalhe de bancada ripada frontal */}
          <rect x="218" y="292" width="230" height="24" className="traco-desenho" />
          <line x1="250" y1="292" x2="250" y2="316" className="traco-desenho" />
          <line x1="282" y1="292" x2="282" y2="316" className="traco-desenho" />
          <line x1="314" y1="292" x2="314" y2="316" className="traco-desenho" />
          <line x1="346" y1="292" x2="346" y2="316" className="traco-desenho" />
          <line x1="378" y1="292" x2="378" y2="316" className="traco-desenho" />
          <line x1="410" y1="292" x2="410" y2="316" className="traco-desenho" />
          {/* Cooktop 5 bocas no tampo de granito */}
          <rect x="292" y="224" width="82" height="48" className="traco-desenho" />
          <circle cx="312" cy="238" r="7" className="traco-desenho" />
          <circle cx="354" cy="238" r="7" className="traco-desenho" />
          <circle cx="333" cy="248" r="9" className="traco-desenho" />
          <circle cx="312" cy="258" r="7" className="traco-desenho" />
          <circle cx="354" cy="258" r="7" className="traco-desenho" />
        </g>

        {/* Grupo 4: Linhas das 3 cotas arquitetônicas (1.5px) */}
        <g className="planta-cotas-linhas" strokeWidth="1.5">
          {/* Cota 1: Largura da bancada norte (3,20 m) */}
          <line x1="70" y1="34" x2="530" y2="34" className="traco-desenho" />
          <line x1="70" y1="26" x2="70" y2="42" className="traco-desenho" />
          <line x1="530" y1="26" x2="530" y2="42" className="traco-desenho" />

          {/* Cota 2: Profundidade em L (2,65 m) */}
          <line x1="34" y1="66" x2="34" y2="374" className="traco-desenho" />
          <line x1="26" y1="66" x2="42" y2="66" className="traco-desenho" />
          <line x1="26" y1="374" x2="42" y2="374" className="traco-desenho" />

          {/* Cota 3: Ilha central (1,80 m × 0,90 m) */}
          <line x1="218" y1="344" x2="448" y2="344" className="traco-desenho" />
          <line x1="218" y1="336" x2="218" y2="352" className="traco-desenho" />
          <line x1="448" y1="336" x2="448" y2="352" className="traco-desenho" />
        </g>
      </g>

      {/* Textos das 3 cotas em estilo cota tabular-nums */}
      <g
        className="planta-cotas-textos tipo-cota"
        fill="var(--dourado)"
        style={{ paintOrder: 'stroke', stroke: 'var(--preto)', strokeWidth: '4px' }}
      >
        <text x="300" y="25" textAnchor="middle">
          3,20 m
        </text>
        <text x="22" y="220" textAnchor="middle" transform="rotate(-90 22 220)">
          2,65 m
        </text>
        <text x="333" y="364" textAnchor="middle">
          Ilha 1,80 m × 0,90 m
        </text>
      </g>
    </svg>
  );
};
