import React, { useState, useEffect } from 'react';
import { Menu, X, MessageSquare } from 'lucide-react';
import { getWhatsAppUrl } from '../utils/helpers';
import { scrollToTarget } from '../hooks/useScrollytelling';

interface HeaderProps {
  onNavigateContact: () => void;
  onNavigateHome: () => void;
  currentView: 'home' | 'contato';
  headerRef: React.RefObject<HTMLElement | null>;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigateHome,
  currentView,
  headerRef,
}) => {
  const [menuAberto, setMenuAberto] = useState(false);
  const [sobreHero, setSobreHero] = useState(true);

  useEffect(() => {
    const verificarScroll = () => {
      const limiteHero = Math.max(window.innerHeight * 0.82, 480);
      setSobreHero(window.scrollY < limiteHero);
    };
    verificarScroll();
    window.addEventListener('scroll', verificarScroll, { passive: true });
    window.addEventListener('resize', verificarScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', verificarScroll);
      window.removeEventListener('resize', verificarScroll);
    };
  }, []);

  const transparenteSobreFoto = currentView === 'home' && sobreHero && !menuAberto;

  const irParaSecao = (id: string) => {
    setMenuAberto(false);
    if (currentView !== 'home') {
      onNavigateHome();
      setTimeout(() => {
        scrollToTarget(`#${id}`, -72);
      }, 120);
    } else {
      scrollToTarget(`#${id}`, -72);
    }
  };

  return (
    <header
      ref={headerRef}
      data-tema={transparenteSobreFoto ? 'noite' : undefined}
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 will-change-transform ${
        transparenteSobreFoto
          ? 'bg-transparent border-b border-transparent text-papel'
          : 'bg-papel border-b border-grafite/15 text-grafite'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-16 sm:px-32 h-64 flex items-center justify-between">
        {/* Marca à esquerda */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            setMenuAberto(false);
            if (currentView !== 'home') {
              onNavigateHome();
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className={`flex items-baseline gap-8 transition-colors ${
            transparenteSobreFoto ? 'text-papel' : 'text-grafite'
          }`}
        >
          <span className="tipo-logo text-2xl sm:text-3xl">IMPÉRIO</span>
          <span
            className={`tipo-cota hidden sm:inline ${
              transparenteSobreFoto ? 'text-papel/80' : 'text-grafite-suave'
            }`}
          >
            Marcenaria e Arquitetura
          </span>
        </a>

        {/* Três links de navegação — Desktop */}
        <nav
          aria-label="Navegação principal"
          className="hidden md:flex items-center gap-32"
        >
          <button
            type="button"
            onClick={() => irParaSecao('obras')}
            className={`tipo-corpo cursor-pointer hover:underline underline-offset-4 decoration-1 transition-colors ${
              transparenteSobreFoto
                ? 'text-papel/90 hover:text-papel'
                : 'text-grafite hover:text-preto'
            }`}
          >
            Obras
          </button>
          <button
            type="button"
            onClick={() => irParaSecao('processo')}
            className={`tipo-corpo cursor-pointer hover:underline underline-offset-4 decoration-1 transition-colors ${
              transparenteSobreFoto
                ? 'text-papel/90 hover:text-papel'
                : 'text-grafite hover:text-preto'
            }`}
          >
            Processo
          </button>
          <button
            type="button"
            onClick={() => irParaSecao('quarto-3d')}
            className={`tipo-corpo cursor-pointer hover:underline underline-offset-4 decoration-1 transition-colors ${
              transparenteSobreFoto
                ? 'text-papel/90 hover:text-papel'
                : 'text-grafite hover:text-preto'
            }`}
          >
            Quarto 3D
          </button>
        </nav>

        {/* Botão WhatsApp à direita */}
        <div className="flex items-center gap-16">
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-8 px-16 h-[40px] rounded-curto bg-dourado text-preto hover:bg-preto hover:text-dourado border border-dourado transition-colors duration-200 tipo-cota font-semibold"
          >
            <MessageSquare className="w-4 h-4 stroke-[1.5]" />
            <span>Chamar no WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={() => setMenuAberto((prev) => !prev)}
            aria-expanded={menuAberto}
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            className={`md:hidden p-8 cursor-pointer ${
              transparenteSobreFoto ? 'text-papel' : 'text-grafite'
            }`}
          >
            {menuAberto ? (
              <X className="w-6 h-6 stroke-[1.5]" />
            ) : (
              <Menu className="w-6 h-6 stroke-[1.5]" />
            )}
          </button>
        </div>
      </div>

      {/* Menu Mobile */}
      {menuAberto && (
        <div className="md:hidden bg-papel border-t border-grafite/15 px-16 py-24 flex flex-col gap-16">
          <button
            type="button"
            onClick={() => irParaSecao('obras')}
            className="text-left py-8 tipo-h3 text-grafite border-b border-grafite/10"
          >
            Obras
          </button>
          <button
            type="button"
            onClick={() => irParaSecao('processo')}
            className="text-left py-8 tipo-h3 text-grafite border-b border-grafite/10"
          >
            Processo
          </button>
          <button
            type="button"
            onClick={() => irParaSecao('quarto-3d')}
            className="text-left py-8 tipo-h3 text-grafite border-b border-grafite/10"
          >
            Quarto 3D
          </button>
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuAberto(false)}
            className="mt-8 w-full h-[52px] rounded-curto bg-dourado text-preto hover:bg-preto hover:text-dourado transition-colors flex items-center justify-center gap-8 tipo-cota font-semibold"
          >
            <MessageSquare className="w-4 h-4 stroke-[1.5]" />
            <span>Chamar no WhatsApp</span>
          </a>
        </div>
      )}
    </header>
  );
};
