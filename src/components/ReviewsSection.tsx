import React, { useEffect, useRef } from 'react';
import { CLIENT_REVIEWS } from '../data/reviewsData';
import { Star, CheckCircle, ShieldCheck, Home, Calendar } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const ReviewsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const countRatingRef = useRef<HTMLSpanElement>(null);
  const countLaresRef = useRef<HTMLSpanElement>(null);
  const countMdfRef = useRef<HTMLSpanElement>(null);
  const countYearsRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (prefersReduced) {
        if (countRatingRef.current) countRatingRef.current.textContent = '5.0';
        if (countLaresRef.current) countLaresRef.current.textContent = '250';
        if (countMdfRef.current) countMdfRef.current.textContent = '100';
        if (countYearsRef.current) countYearsRef.current.textContent = '10';
        return;
      }

      // 1. Animated Numbers Counters
      const statsObj = { rating: 0, lares: 0, mdf: 0, years: 0 };

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(statsObj, {
            rating: 5.0,
            lares: 250,
            mdf: 100,
            years: 10,
            duration: 2.2,
            ease: 'power2.out',
            onUpdate: () => {
              if (countRatingRef.current) {
                countRatingRef.current.textContent = statsObj.rating.toFixed(1);
              }
              if (countLaresRef.current) {
                countLaresRef.current.textContent = Math.floor(statsObj.lares).toString();
              }
              if (countMdfRef.current) {
                countMdfRef.current.textContent = Math.floor(statsObj.mdf).toString();
              }
              if (countYearsRef.current) {
                countYearsRef.current.textContent = Math.floor(statsObj.years).toString();
              }
            },
          });
        },
      });

      // 2. Testimonial Cards Staggered Reveal
      const cards = sectionRef.current?.querySelectorAll('.review-card-item');
      if (cards && cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.16,
            ease: 'power2.out',
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
    <section ref={sectionRef} id="avaliacoes" className="w-full py-16 lg:py-24 bg-[#f8f2ef] border-b border-[#ddd7cd]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-col space-y-14">
        
        {/* Section Header with Google Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#775a19] font-bold">
              <span>Avaliações Verificadas</span>
              <span className="text-[#d3c4b9]">•</span>
              <span>Clientes de Jaú & Região</span>
            </div>
            <h2 className="font-serif-atelier text-3xl sm:text-4xl text-[#1d1b19] font-semibold">
              O que dizem os clientes de Jaú e região
            </h2>
            <p className="text-sm text-[#4f453c] leading-relaxed">
              A confiança de quem escolheu a Império para projetar e transformar o seu lar sob medida.
            </p>
          </div>

          {/* Badge Google 5.0 */}
          <div className="p-4 rounded-xl bg-white shadow-wood-sm border border-[#ddd7cd] flex items-center gap-4 self-start md:self-auto">
            <div className="w-10 h-10 rounded-full bg-[#f3ede9] flex items-center justify-center font-bold text-[#52371c] text-xl font-serif">
              G
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-[#c5a059]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#c5a059] text-[#c5a059]" />
                ))}
                <span className="text-xs font-bold text-[#1d1b19] ml-1">5.0 / 5.0</span>
              </div>
              <span className="text-xs text-[#4f453c]">Satisfação comprovada no Google</span>
            </div>
          </div>
        </div>

        {/* Item 6: Animated Number Counters Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Stat 1 */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#ddd7cd] shadow-wood-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 text-[#c5a059]">
              <Star className="w-5 h-5 fill-[#c5a059]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#81756b]">Avaliação</span>
            </div>
            <div>
              <div className="font-serif-atelier text-3xl sm:text-4xl font-bold text-[#52371c] tracking-tight">
                <span ref={countRatingRef}>5.0</span>
                <span className="text-xl sm:text-2xl text-[#c5a059]">★</span>
              </div>
              <p className="text-xs font-semibold text-[#1d1b19] mt-1">Classificação Máxima</p>
              <p className="text-[11px] text-[#81756b]">Excelência no atendimento</p>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#ddd7cd] shadow-wood-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 text-[#c5a059]">
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#81756b]">Residências</span>
            </div>
            <div>
              <div className="font-serif-atelier text-3xl sm:text-4xl font-bold text-[#52371c] tracking-tight">
                +<span ref={countLaresRef}>250</span>
              </div>
              <p className="text-xs font-semibold text-[#1d1b19] mt-1">Lares Transformados</p>
              <p className="text-[11px] text-[#81756b]">Projetos entregues em Jaú e região</p>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#ddd7cd] shadow-wood-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 text-[#c5a059]">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#81756b]">Qualidade</span>
            </div>
            <div>
              <div className="font-serif-atelier text-3xl sm:text-4xl font-bold text-[#52371c] tracking-tight">
                <span ref={countMdfRef}>100</span>
                <span className="text-xl sm:text-2xl text-[#c5a059]">%</span>
              </div>
              <p className="text-xs font-semibold text-[#1d1b19] mt-1">MDF Certificado</p>
              <p className="text-[11px] text-[#81756b]">Sem aglomerado, ferragens premium</p>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#ddd7cd] shadow-wood-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 text-[#c5a059]">
              <Calendar className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#81756b]">Experiência</span>
            </div>
            <div>
              <div className="font-serif-atelier text-3xl sm:text-4xl font-bold text-[#52371c] tracking-tight">
                +<span ref={countYearsRef}>10</span>
                <span className="text-xl sm:text-2xl text-[#c5a059]"> Anos</span>
              </div>
              <p className="text-xs font-semibold text-[#1d1b19] mt-1">Marcenaria Própria</p>
              <p className="text-[11px] text-[#81756b]">Tradição e oficina local em Jaú</p>
            </div>
          </div>
        </div>

        {/* Reviews Grid (Depoimentos com Fade e Deslocamento Escalonado) */}
        <div className="reviews-cards-container grid grid-cols-1 md:grid-cols-3 gap-6">
          {CLIENT_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="review-card-item p-6 rounded-2xl bg-white border border-[#ddd7cd] flex flex-col justify-between space-y-6 shadow-wood-sm hover:shadow-wood-md transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex text-[#c5a059]">
                    {[...Array(rev.starRating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#c5a059] text-[#c5a059]" />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#81756b]">{rev.date}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#4f453c] italic leading-relaxed">
                  "{rev.text}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#ddd7cd]/70 flex items-center justify-between">
                <div>
                  <p className="font-serif-atelier text-sm font-bold text-[#1d1b19]">
                    {rev.authorName}
                  </p>
                  <p className="text-[11px] text-[#81756b]">{rev.location}</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-[#f3ede9] text-[10px] font-bold uppercase tracking-wider text-[#775a19] border border-[#ddd7cd]">
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
