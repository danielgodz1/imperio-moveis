/**
 * EXCEÇÃO CONSCIENTE AO DESIGN.md:
 * Esta seção mantém os cartões arredondados (`rounded-xl`, `rounded-2xl`) e o layout original
 * (selo "G" com nota, 4 cartões de estatísticas e 3 cartões de depoimentos) por solicitação explícita,
 * utilizando os tokens de cor (`--papel`, `--papel-2`, `--grafite`, `--grafite-suave`, `--preto`, `--dourado`),
 * fontes (`Archivo` e `Newsreader`) e escala de espaçamento do sistema visual.
 */

import React, { useEffect, useRef } from 'react';
import { Star, ShieldCheck, Home, Calendar } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ehExemplo,
  REVIEWS_OVERVIEW,
  REVIEW_STATS,
  CLIENT_REVIEWS,
} from '../data/reviewsData';
import { ReviewStat } from '../types';

gsap.registerPlugin(ScrollTrigger);

export const ReviewsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const statRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  const renderStatIcon = (id: ReviewStat['id']) => {
    switch (id) {
      case 'rating':
        return <Star className="w-5 h-5 fill-dourado text-dourado" strokeWidth={1.5} />;
      case 'lares':
        return <Home className="w-5 h-5 text-grafite" strokeWidth={1.5} />;
      case 'mdf':
        return <ShieldCheck className="w-5 h-5 text-grafite" strokeWidth={1.5} />;
      case 'years':
        return <Calendar className="w-5 h-5 text-grafite" strokeWidth={1.5} />;
    }
  };

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReduced) {
        REVIEW_STATS.forEach((stat) => {
          const el = statRefs.current[stat.id];
          if (el) {
            el.textContent = stat.targetValue.toFixed(stat.decimals);
          }
        });
        return;
      }

      const counters: Record<string, number> = {};
      const targets: Record<string, number> = {};
      REVIEW_STATS.forEach((stat) => {
        counters[stat.id] = 0;
        targets[stat.id] = stat.targetValue;
      });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(counters, {
            ...targets,
            duration: 2.0,
            ease: 'power2.out',
            onUpdate: () => {
              REVIEW_STATS.forEach((stat) => {
                const el = statRefs.current[stat.id];
                if (el) {
                  el.textContent =
                    stat.decimals > 0
                      ? counters[stat.id].toFixed(stat.decimals)
                      : Math.floor(counters[stat.id]).toString();
                }
              });
            },
          });
        },
      });

      const cards = sectionRef.current?.querySelectorAll('.review-card-item');
      if (cards && cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.14,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '.reviews-cards-container',
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="avaliacoes"
      className="w-full py-96 md:py-144 bg-papel-2 text-grafite border-b border-grafite/15"
    >
      <div className="max-w-[1280px] mx-auto px-16 sm:px-32 flex flex-col gap-48">
        {/* Selo pequeno e discreto exibido apenas enquanto ehExemplo === true */}
        {ehExemplo && (
          <div className="flex items-center">
            <span className="inline-flex items-center px-12 py-4 rounded-curto bg-papel text-grafite-suave border border-grafite/20 tipo-cota">
              Exemplo (dados de demonstração)
            </span>
          </div>
        )}

        {/* Cabeçalho da Seção com Selo "G" e Nota */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-24">
          <div className="max-w-xl flex flex-col gap-8">
            <div className="inline-flex items-center gap-8 tipo-cota text-grafite-suave">
              <span>{REVIEWS_OVERVIEW.eyebrowLeft}</span>
              <span aria-hidden="true">/</span>
              <span>{REVIEWS_OVERVIEW.eyebrowRight}</span>
            </div>
            <h2 className="tipo-h2 text-grafite">{REVIEWS_OVERVIEW.title}</h2>
            <p className="tipo-corpo text-grafite-suave">
              {REVIEWS_OVERVIEW.description}
            </p>
          </div>

          {/* Selo Google 5.0 (arredondado conforme exceção consciente ao DESIGN.md) */}
          <div className="p-16 rounded-xl bg-papel border border-grafite/15 flex items-center gap-16 self-start md:self-auto">
            <div className="w-10 h-10 rounded-full bg-papel-2 flex items-center justify-center font-bold text-grafite text-xl font-voz not-italic border border-grafite/15">
              {REVIEWS_OVERVIEW.googleBadgeLetter}
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                {[...Array(REVIEWS_OVERVIEW.starCount)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-dourado text-dourado"
                    strokeWidth={1.5}
                  />
                ))}
                <span className="tipo-cota font-semibold text-grafite ml-4">
                  {REVIEWS_OVERVIEW.googleRatingText}
                </span>
              </div>
              <span className="tipo-cota text-grafite-suave">
                {REVIEWS_OVERVIEW.googleSubtitle}
              </span>
            </div>
          </div>
        </div>

        {/* Linha de 4 Cartões de Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-16 sm:gap-24">
          {REVIEW_STATS.map((stat) => (
            <div
              key={stat.id}
              className="p-24 rounded-2xl bg-papel border border-grafite/15 flex flex-col justify-between gap-16"
            >
              <div className="flex items-center justify-between">
                {renderStatIcon(stat.id)}
                <span className="tipo-cota text-grafite-suave">
                  {stat.categoryLabel}
                </span>
              </div>
              <div className="flex flex-col gap-4">
                <div className="tipo-h2 text-grafite tabular-nums">
                  {stat.prefix}
                  <span
                    ref={(el) => {
                      statRefs.current[stat.id] = el;
                    }}
                  >
                    {stat.targetValue.toFixed(stat.decimals)}
                  </span>
                  {stat.suffix && (
                    <span className="text-xl sm:text-2xl text-grafite ml-1">
                      {stat.suffix}
                    </span>
                  )}
                </div>
                <p className="tipo-cota font-semibold text-grafite">
                  {stat.title}
                </p>
                <p className="tipo-cota text-grafite-suave">{stat.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Grade de 3 Cartões de Depoimentos */}
        <div className="reviews-cards-container grid grid-cols-1 md:grid-cols-3 gap-24">
          {CLIENT_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="review-card-item p-24 rounded-2xl bg-papel border border-grafite/15 flex flex-col justify-between gap-24"
            >
              <div className="flex flex-col gap-16">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {[...Array(rev.starRating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-dourado text-dourado"
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <span className="tipo-cota text-grafite-suave">{rev.date}</span>
                </div>
                <p className="font-voz italic text-base sm:text-lg text-grafite leading-relaxed">
                  “{rev.text}”
                </p>
              </div>

              <div className="pt-16 border-t border-grafite/15 flex items-center justify-between gap-12">
                <div className="flex flex-col">
                  <p className="tipo-cota font-semibold text-grafite">
                    {rev.authorName}
                  </p>
                  <p className="tipo-cota text-grafite-suave">{rev.location}</p>
                </div>
                <span className="px-8 py-4 rounded-curto bg-papel-2 tipo-cota text-grafite border border-grafite/15">
                  {rev.projectType}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

