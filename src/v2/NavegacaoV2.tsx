import React, { createContext, useContext } from 'react';

/** Navegação da V2: troca de página sem sair da prévia e abre o painel de orçamento. */
export interface NavegacaoV2 {
  /** Destino com caminho e, se quiser, âncora: '/obras', '/#v2-processo'. */
  ir: (destino: string) => void;
  abrirOrcamento: (ambiente?: string) => void;
}

export const ContextoNavV2 = createContext<NavegacaoV2>({
  ir: () => undefined,
  abrirOrcamento: () => undefined,
});

export const useNavV2 = () => useContext(ContextoNavV2);

/** Link interno da V2: abre na mesma aba sem recarregar; Ctrl/Cmd+clique continua abrindo em outra aba. */
export const LinkV2: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement> & { para: string }> = ({ para, onClick, children, ...resto }) => {
  const { ir } = useNavV2();
  return (
    <a
      href={para}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        ir(para);
      }}
      {...resto}
    >
      {children}
    </a>
  );
};

/** Logo da Império na cor do texto da seção (o PNG vira máscara). */
export const LogoImperio: React.FC<{ className?: string; rotulo?: string }> = ({ className = '', rotulo }) => (
  <span
    role={rotulo ? 'img' : undefined}
    aria-label={rotulo}
    aria-hidden={rotulo ? undefined : true}
    className={`v2-logo inline-block ${className}`}
  />
);
