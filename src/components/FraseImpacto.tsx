import React from 'react';
import { FRASE_DESTAQUE_ATUAL } from '../data/frases';

export const FraseImpacto: React.FC = () => {
  return (
    <section
      aria-label="Manifesto da Império Móveis Planejados"
      className="w-full py-64 md:py-96 bg-papel text-grafite border-b border-grafite/15"
    >
      <div className="max-w-[1280px] mx-auto px-16 sm:px-32">
        <p className="tipo-h1 text-grafite max-w-4xl">
          “{FRASE_DESTAQUE_ATUAL}”
        </p>
      </div>
    </section>
  );
};

