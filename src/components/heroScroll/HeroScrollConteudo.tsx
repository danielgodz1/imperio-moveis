import React from 'react';
import { MessageSquare } from 'lucide-react';
import { getWhatsAppUrl, trackWhatsAppClick } from '../../utils/helpers';
import { scrollToTarget } from '../../hooks/useScrollytelling';

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
    <h1 className="tipo-h1 text-papel">Arquitetura e marcenaria na mesma mesa.</h1>

    <p className="tipo-corpo text-papel/85 mt-16 max-w-[46ch]">
      A Tatiane projeta, o Wellington fabrica. Móveis planejados para cozinhas, quartos, closets e
      lojas em Jaú e região, com precisão milimétrica desde 2015.
    </p>

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

    <a
      href="https://www.instagram.com/imperio.moveis.jau"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block mt-16 tipo-cota text-papel underline underline-offset-4 decoration-1"
    >
      @imperio.moveis.jau
    </a>
  </>
);
