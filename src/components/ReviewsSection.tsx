/**
 * EXCEÇÃO CONSCIENTE AO DESIGN.md:
 * Esta seção mantém os cartões arredondados por solicitação explícita.
 *
 * Avaliações reais do Perfil da Empresa no Google: ao vivo pela API do Google Places
 * (`/api/avaliacoes`, com crédito ao Google e ao autor) ou, sem a chave configurada,
 * só o resumo da nota com link para ler e escrever avaliações no Google.
 */

import React, { useEffect, useState } from 'react';
import { ExternalLink, Star } from 'lucide-react';
import { LINK_PERFIL_GOOGLE, RESUMO_GOOGLE } from '../data/avaliacoesGoogle';

interface AvaliacaoGoogle {
  autor: string;
  autorUrl?: string;
  foto?: string;
  nota: number;
  texto: string;
  quando: string;
}

interface DadosGoogle {
  nota: number;
  total: number;
  url?: string;
  avaliacoes: AvaliacaoGoogle[];
}

const decimal = (n: number) => n.toFixed(1).replace('.', ',');

const Estrelas: React.FC<{ nota: number; tamanho?: string }> = ({ nota, tamanho = 'w-4 h-4' }) => (
  <span className="flex items-center gap-[2px]" aria-label={`${decimal(nota)} de 5 estrelas`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        aria-hidden="true"
        className={`${tamanho} ${i <= Math.round(nota) ? 'fill-dourado text-dourado' : 'text-grafite/30'}`}
        strokeWidth={1.5}
      />
    ))}
  </span>
);

export const ReviewsSection: React.FC = () => {
  const [dados, setDados] = useState<DadosGoogle | null>(null);

  useEffect(() => {
    let ativo = true;
    fetch('/api/avaliacoes')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: DadosGoogle | null) => {
        if (ativo && d && d.total > 0) setDados(d);
      })
      .catch(() => undefined);
    return () => {
      ativo = false;
    };
  }, []);

  const nota = dados?.nota ?? RESUMO_GOOGLE.nota;
  const total = dados?.total ?? RESUMO_GOOGLE.total;
  const link = dados?.url ?? LINK_PERFIL_GOOGLE;

  return (
    <section id="avaliacoes" className="w-full py-96 md:py-144 bg-papel-2 text-grafite">
      <div className="max-w-[1280px] mx-auto px-16 sm:px-32 flex flex-col gap-48">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-32">
          <h2 className="tipo-display text-grafite max-w-[14ch]">O que dizem os clientes no Google</h2>
          <div className="flex flex-col gap-16 md:items-end">
            <div className="flex items-center gap-16">
              <span className="tipo-display text-grafite leading-none">{decimal(nota)}</span>
              <div className="flex flex-col gap-4">
                <Estrelas nota={nota} tamanho="w-5 h-5" />
                <span className="tipo-cota text-grafite-suave">
                  {total} {total === 1 ? 'avaliação' : 'avaliações'} no Google
                  {!dados && ` (em ${RESUMO_GOOGLE.conferidoEm})`}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-8">
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-8 px-16 h-[44px] rounded-curto border-[1.5px] border-grafite text-grafite hover:bg-grafite hover:text-papel transition-colors tipo-cota font-semibold"
              >
                Ver avaliações no Google
                <ExternalLink className="w-4 h-4" strokeWidth={1.5} aria-hidden="true" />
              </a>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-16 h-[44px] tipo-cota text-grafite link-traco"
              >
                Avaliar a Império
              </a>
            </div>
          </div>
        </div>

        {dados && dados.avaliacoes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
            {dados.avaliacoes.slice(0, 6).map((a, i) => (
              <article key={i} className="p-24 rounded-2xl bg-papel border border-grafite/15 flex flex-col justify-between gap-24">
                <div className="flex flex-col gap-16">
                  <div className="flex items-center justify-between gap-8">
                    <Estrelas nota={a.nota} />
                    <span className="tipo-cota text-grafite-suave">{a.quando}</span>
                  </div>
                  <p className="font-voz italic text-lg text-grafite leading-relaxed line-clamp-[8]">“{a.texto}”</p>
                </div>
                <div className="pt-16 border-t border-grafite/15 flex items-center gap-8">
                  {a.foto && (
                    <img src={a.foto} alt="" width={32} height={32} loading="lazy" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full" />
                  )}
                  <div className="flex flex-col">
                    {a.autorUrl ? (
                      <a href={a.autorUrl} target="_blank" rel="noopener noreferrer" className="tipo-cota font-semibold text-grafite link-traco">
                        {a.autor}
                      </a>
                    ) : (
                      <span className="tipo-cota font-semibold text-grafite">{a.autor}</span>
                    )}
                    <span className="tipo-cota text-grafite-suave">Avaliação publicada no Google</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
