import React, { useEffect, useRef, useState } from 'react';
import { Box, ClipboardList, MessageCircle, X } from 'lucide-react';
import { EMPRESA } from '../data/empresa';
import { getWhatsAppUrl, trackEvent, trackWhatsAppClick } from '../utils/helpers';
import { LinkV2, LogoImperio, useNavV2 } from './NavegacaoV2';

/** Segundos até o balão de "oi" aparecer (uma vez por visita). */
const ESPERA_BALAO_MS = 6000;
const CHAVE_BALAO = 'imperio_balao_conversa_visto';

const lerSessao = (chave: string) => {
  try {
    return window.sessionStorage.getItem(chave);
  } catch {
    return null;
  }
};
const gravarSessao = (chave: string) => {
  try {
    window.sessionStorage.setItem(chave, '1');
  } catch {
    // navegação privada: o balão só volta a aparecer na próxima página
  }
};

/**
 * Atalho de conversa no canto inferior direito, em todas as páginas (menos no editor 3D).
 * O "mascote" por enquanto é a coroa da Império num avatar redondo; para usar uma ilustração
 * de mascote, troque o <LogoImperio> do botão e do cartão por uma <img>.
 * Um toque abre um cartão com as três saídas: WhatsApp, orçamento em 3 perguntas e projeto 3D.
 */
export const ConversaFlutuanteV2: React.FC<{ visivel: boolean }> = ({ visivel }) => {
  const { abrirOrcamento } = useNavV2();
  const [aberto, setAberto] = useState(false);
  const [balao, setBalao] = useState(false);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const cartaoRef = useRef<HTMLDivElement>(null);

  // Balão de convite depois de alguns segundos, uma vez por visita.
  useEffect(() => {
    if (!visivel || lerSessao(CHAVE_BALAO)) return;
    const t = window.setTimeout(() => {
      setBalao(true);
      gravarSessao(CHAVE_BALAO);
      trackEvent('conversa_flutuante', { acao: 'balao_exibido' });
    }, ESPERA_BALAO_MS);
    return () => window.clearTimeout(t);
  }, [visivel]);

  // Escape fecha; foco vai para a primeira opção ao abrir e volta ao botão ao fechar.
  useEffect(() => {
    if (!aberto) return;
    cartaoRef.current?.querySelector<HTMLElement>('a,button')?.focus();
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAberto(false);
        botaoRef.current?.focus();
      }
    };
    const fora = (e: PointerEvent) => {
      const alvo = e.target as Node;
      if (!cartaoRef.current?.contains(alvo) && !botaoRef.current?.contains(alvo)) setAberto(false);
    };
    window.addEventListener('keydown', tecla);
    window.addEventListener('pointerdown', fora);
    return () => {
      window.removeEventListener('keydown', tecla);
      window.removeEventListener('pointerdown', fora);
    };
  }, [aberto]);

  useEffect(() => {
    if (!visivel) setAberto(false);
  }, [visivel]);

  const alternar = () => {
    setBalao(false);
    setAberto((a) => {
      if (!a) trackEvent('conversa_flutuante', { acao: 'abrir' });
      return !a;
    });
  };

  const opcao = 'flex items-center gap-16 w-full p-16 text-left rounded-[14px] transition-colors cursor-pointer';

  return (
    <div
      className={`fixed z-40 right-16 bottom-16 md:right-24 md:bottom-24 flex flex-col items-end gap-[12px] transition-[opacity,transform] duration-500 ${
        visivel ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[120%] pointer-events-none'
      }`}
      aria-hidden={!visivel}
    >
      {aberto && (
        <div
          ref={cartaoRef}
          id="v2-conversa"
          role="dialog"
          aria-label="Fale com a Império"
          className="v2-conversa-cartao w-[min(340px,calc(100vw-32px))] bg-[#F4EFE6] text-[#1B1915] rounded-[20px] shadow-[0_24px_60px_rgba(0,0,0,0.35)] overflow-hidden"
        >
          <div className="flex items-center gap-[12px] p-16 bg-[#1B1915] text-[#F4EFE6]">
            <span className="w-[44px] h-[44px] shrink-0 rounded-full bg-[#F4EFE6] flex items-center justify-center text-[#1B1915]">
              <LogoImperio className="h-[28px]" />
            </span>
            <span className="flex flex-col gap-4 leading-tight">
              <span className="v2-serif text-[1.35rem]">Oi! Como podemos ajudar?</span>
              <span className="text-[0.8125rem] opacity-80">{EMPRESA.horarios.semana}</span>
            </span>
          </div>
          <div className="p-8 flex flex-col gap-4">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackWhatsAppClick('v2_flutuante');
                setAberto(false);
              }}
              className={`${opcao} bg-[#1F7A4D] text-white hover:bg-[#19663f]`}
            >
              <MessageCircle className="w-[22px] h-[22px] shrink-0" strokeWidth={1.75} />
              <span className="flex flex-col gap-4">
                <span className="font-[550]">Falar agora no WhatsApp</span>
                <span className="text-[0.8125rem] opacity-90">Direto com a equipe, sem formulário</span>
              </span>
            </a>
            <button
              type="button"
              onClick={() => {
                trackEvent('conversa_flutuante', { acao: 'orcamento' });
                setAberto(false);
                abrirOrcamento();
              }}
              className={`${opcao} hover:bg-[#1B1915]/[0.06]`}
            >
              <ClipboardList className="w-[22px] h-[22px] shrink-0 text-[#765a2d]" strokeWidth={1.75} />
              <span className="flex flex-col gap-4">
                <span className="font-[550]">Pedir orçamento</span>
                <span className="text-[0.8125rem] text-[#1B1915]/70">3 perguntas rápidas, resposta no WhatsApp</span>
              </span>
            </button>
            <LinkV2
              para="/projetar"
              onClick={() => setAberto(false)}
              className={`${opcao} hover:bg-[#1B1915]/[0.06]`}
            >
              <Box className="w-[22px] h-[22px] shrink-0 text-[#765a2d]" strokeWidth={1.75} />
              <span className="flex flex-col gap-4">
                <span className="font-[550]">Projetar em 3D</span>
                <span className="text-[0.8125rem] text-[#1B1915]/70">Monte o ambiente grátis, no navegador</span>
              </span>
            </LinkV2>
          </div>
        </div>
      )}

      {balao && !aberto && (
        <div className="v2-conversa-balao relative max-w-[260px] bg-[#F4EFE6] text-[#1B1915] rounded-[16px] rounded-br-[4px] shadow-[0_12px_32px_rgba(0,0,0,0.3)] pl-16 pr-[40px] py-[12px]">
          <button type="button" onClick={alternar} className="text-left text-[0.9375rem] leading-snug cursor-pointer" tabIndex={visivel ? 0 : -1}>
            <span className="font-[550]">Oi! Quer um orçamento?</span> Fale com a gente pelo WhatsApp ou em 3 perguntas.
          </button>
          <button
            type="button"
            onClick={() => setBalao(false)}
            aria-label="Fechar aviso"
            tabIndex={visivel ? 0 : -1}
            className="absolute top-8 right-8 w-[24px] h-[24px] flex items-center justify-center rounded-full hover:bg-[#1B1915]/10 cursor-pointer"
          >
            <X className="w-[14px] h-[14px]" />
          </button>
        </div>
      )}

      <button
        ref={botaoRef}
        type="button"
        onClick={alternar}
        tabIndex={visivel ? 0 : -1}
        aria-expanded={aberto}
        aria-controls={aberto ? 'v2-conversa' : undefined}
        aria-label={aberto ? 'Fechar opções de conversa' : 'Conversar com a Império: WhatsApp ou orçamento'}
        className="v2-conversa-botao group relative w-[64px] h-[64px] rounded-full bg-[#F4EFE6] text-[#1B1915] border-2 border-[#c9a46c] shadow-[0_12px_32px_rgba(0,0,0,0.4)] flex items-center justify-center cursor-pointer transition-transform hover:scale-[1.06]"
      >
        {aberto ? <X className="w-[24px] h-[24px]" /> : <LogoImperio className="h-[38px]" />}
        {!aberto && (
          <span className="absolute -top-[2px] -right-[2px] w-[24px] h-[24px] rounded-full bg-[#1F7A4D] text-white flex items-center justify-center border-2 border-[#F4EFE6]" aria-hidden="true">
            <MessageCircle className="w-[13px] h-[13px]" strokeWidth={2.25} />
          </span>
        )}
      </button>
    </div>
  );
};
