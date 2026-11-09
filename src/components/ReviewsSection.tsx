/**
 * EXCEÇÃO CONSCIENTE AO DESIGN.md:
 * Esta seção mantém os cartões arredondados por solicitação explícita.
 * Nota do Google e números de resultado só voltam quando houver dados reais.
 */

import React from 'react';
import { Star } from 'lucide-react';
import { ehExemplo, REVIEWS_OVERVIEW, CLIENT_REVIEWS } from '../data/reviewsData';

export const ReviewsSection: React.FC = () => (
  <section id="avaliacoes" className="w-full py-96 md:py-144 bg-papel-2 text-grafite">
    <div className="max-w-[1280px] mx-auto px-16 sm:px-32 flex flex-col gap-48">
      <div className="flex flex-col items-start gap-16">
        {ehExemplo && (
          <span className="inline-flex items-center px-12 py-4 rounded-curto bg-papel text-grafite-suave border border-grafite/20 tipo-cota">
            Exemplo (dados de demonstração)
          </span>
        )}
        <h2 className="tipo-display text-grafite max-w-[14ch]">{REVIEWS_OVERVIEW.title}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
        {CLIENT_REVIEWS.map((rev) => (
          <div key={rev.id} className="p-24 rounded-2xl bg-papel border border-grafite/15 flex flex-col justify-between gap-24">
            <div className="flex flex-col gap-16">
              <div className="flex items-center gap-4">
                {[...Array(rev.starRating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-dourado text-dourado" strokeWidth={1.5} />
                ))}
              </div>
              <p className="font-voz italic text-lg text-grafite leading-relaxed">“{rev.text}”</p>
            </div>
            <div className="pt-16 border-t border-grafite/15 flex flex-col">
              <p className="tipo-cota font-semibold text-grafite">{rev.authorName}</p>
              <p className="tipo-cota text-grafite-suave">{rev.projectType}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
