import React from 'react';
import { MessageSquare, Star } from 'lucide-react';
import { getWhatsAppUrl, trackWhatsAppClick } from '../../utils/helpers';
import { scrollToTarget } from '../../hooks/useScrollytelling';
import { TEXTO_HERO } from '../../data/paginasLocais';
import { RESUMO_GOOGLE } from '../../data/avaliacoesGoogle';

export const ALT_FOTO_COZINHA =
  'Cozinha planejada com ilha verde-sálvia, tampo de pedra clara, armários brancos e verdes, geladeira inox e fita de LED, executada pela Império em Jaú';

const BOTAO_PRINCIPAL =
  'inline-flex items-center justify-center gap-2 h-[52px] px-6 rounded-curto bg-dourado text-preto font-semibold transition-colors duration-200 hover:bg-preto hover:text-dourado cursor-pointer';
const BOTAO_SECUNDARIO =
  'inline-flex items-center justify-center h-[52px] px-6 rounded-curto border-[1.5px] border-papel text-papel font-semibold transition-colors duration-200 hover:bg-papel hover:text-preto cursor-pointer';

interface HeroScrollConteudoProps {
  onNavigateContact?: () => void;
}

/** H1, texto e CTAs; compartilhado pela narrativa 3D e pelo fallback estático. */
export const HeroScrollConteudo: React.FC<HeroScrollConteudoProps> = ({ onNavigateContact }) => (
  <>
    {/* A linha de cima leva a busca principal ("móveis planejados em Jaú") para dentro do H1. */}
    <h1 className="tipo-h1 text-papel">
      <span className="block tipo-cota text-dourado mb-8">{TEXTO_HERO.chamada}</span>
      {TEXTO_HERO.titulo}
    </h1>

    <p className="tipo-corpo text-papel/85 mt-16 max-w-[46ch]">{TEXTO_HERO.texto}</p>

    <div className="flex flex-wrap items-center gap-x-16 gap-y-8 mt-24">
      {onNavigateContact ? (
        <button type="button" onClick={onNavigateContact} className={BOTAO_PRINCIPAL}>
          Pedir orçamento
        </button>
      ) : (
        <a
          href={getWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick('hero_cta')}
          className={BOTAO_PRINCIPAL}
        >
          <MessageSquare className="w-[16px] h-[16px]" strokeWidth={1.5} />
          Chamar no WhatsApp
        </a>
      )}

      <button type="button" onClick={() => scrollToTarget('#obras', -80)} className={BOTAO_SECUNDARIO}>
        Ver as obras
      </button>
    </div>

    {/* Prova social ao lado do pedido de orçamento; leva às avaliações desta página (não tira o
        visitante do site no momento de decisão; o Instagram fica no rodapé). */}
    <button
      type="button"
      onClick={() => scrollToTarget('#avaliacoes', -80)}
      className="inline-flex items-center gap-8 mt-16 tipo-cota text-papel underline underline-offset-4 decoration-1 cursor-pointer"
    >
      <span className="flex items-center gap-[2px]" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className="w-[14px] h-[14px] fill-dourado text-dourado" strokeWidth={1.5} />
        ))}
      </span>
      {String(RESUMO_GOOGLE.nota).replace('.', ',')} no Google, {RESUMO_GOOGLE.total} avaliações
    </button>
  </>
);
