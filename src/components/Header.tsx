import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Phone, ChevronDown, MessageSquare } from 'lucide-react';
import { EMPRESA } from '../data/empresa';
import { getWhatsAppUrl, trackWhatsAppClick } from '../utils/helpers';
import { scrollToTarget } from '../hooks/useScrollytelling';

export interface HeaderProps {
  onNavigatePath: (path: string) => void;
  onOpenBriefing: (ambienteInicial?: string) => void;
  currentPath: string;
  headerRef: React.RefObject<HTMLElement | null>;
}

const SECOES_OBSERVADAS = ['hero', 'donos', 'obras', 'quarto-3d', 'avaliacoes'] as const;

export const Header: React.FC<HeaderProps> = ({
  onNavigatePath,
  currentPath,
  headerRef,
}) => {
  const [menuAberto, setMenuAberto] = useState(false);
  const [dropdownAmbientes, setDropdownAmbientes] = useState(false);
  const [secaoAtiva, setSecaoAtiva] = useState<string>('hero');
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const naHome = currentPath === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver para destacar o link ativo conforme a seção visível
  useEffect(() => {
    if (!naHome) {
      setSecaoAtiva('');
      return;
    }

    const elementos = SECOES_OBSERVADAS.map((id) => document.getElementById(id)).filter(
      Boolean
    ) as HTMLElement[];
    if (elementos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visiveis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visiveis[0]?.target?.id) {
          setSecaoAtiva(visiveis[0].target.id);
        }
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0.1, 0.4] }
    );

    elementos.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [naHome]);

  // Fecha menu suspenso ao clicar fora ou pressionar Esc
  useEffect(() => {
    const aoClicarFora = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownAmbientes(false);
      }
    };
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownAmbientes(false);
        setMenuAberto(false);
      }
    };
    document.addEventListener('mousedown', aoClicarFora);
    window.addEventListener('keydown', aoTeclar);
    return () => {
      document.removeEventListener('mousedown', aoClicarFora);
      window.removeEventListener('keydown', aoTeclar);
    };
  }, []);

  const irParaSecao = (id: string) => {
    setMenuAberto(false);
    setDropdownAmbientes(false);
    if (!naHome) {
      onNavigatePath('/');
      setTimeout(() => {
        scrollToTarget(`#${id}`, -80);
      }, 150);
    } else {
      scrollToTarget(`#${id}`, -80);
    }
  };

  const irParaRota = (path: string) => {
    setMenuAberto(false);
    setDropdownAmbientes(false);
    onNavigatePath(path);
  };

  // Escuro apenas ao abrir a página no topo do Hero; fica claro/branco ao clicar no menu, rolar ou abrir página interna
  const modoClaro = menuAberto || dropdownAmbientes || isScrolled || !naHome;

  const linkClasse = (ativo: boolean) => {
    if (modoClaro) {
      return `text-xs font-semibold uppercase tracking-[0.08em] py-1 cursor-pointer transition-colors ${
        ativo
          ? 'text-[#15100c] font-bold border-b-2 border-[#c9a04e]'
          : 'text-[#262624]/85 hover:text-[#15100c]'
      }`;
    }
    return `text-xs font-semibold uppercase tracking-[0.08em] py-1 cursor-pointer transition-colors ${
      ativo
        ? 'text-[#c9a04e] font-bold border-b-2 border-[#c9a04e]'
        : 'text-[#f2e8d8]/90 hover:text-[#c9a04e]'
    }`;
  };

  return (
    <header
      ref={headerRef}
      data-tema={modoClaro ? 'dia' : 'noite'}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 will-change-transform ${
        modoClaro
          ? 'bg-[#F4F2ED]/98 backdrop-blur-md text-[#262624] shadow-[0_6px_24px_rgba(0,0,0,0.08)] border-b border-[#262624]/15'
          : 'bg-[#15100c]/88 backdrop-blur-md text-[#f2e8d8] border-b border-[#c9a04e]/15'
      }`}
    >
      <div className="h-20 max-w-[1360px] mx-auto px-4 sm:px-8 flex items-center justify-between gap-3 sm:gap-6">
        {/* Marca & Logo Oficial à esquerda */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            setMenuAberto(false);
            if (!naHome) {
              irParaRota('/');
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex items-center gap-3 shrink-0 group cursor-pointer"
        >
          <img
            src="/logo-quadrado.jpg"
            alt={EMPRESA.nome}
            className={`h-10 w-10 sm:h-11 sm:w-11 object-cover rounded-lg shadow-sm border bg-[#1b1b1b] group-hover:scale-105 transition-transform ${
              modoClaro ? 'border-[#262624]/25' : 'border-[#c9a04e]/40'
            }`}
          />
          <div className="flex flex-col">
            <span
              className={`tipo-logo text-2xl sm:text-[26px] tracking-tight leading-none transition-colors ${
                modoClaro ? 'text-[#15100c]' : 'text-[#f2e8d8]'
              }`}
            >
              {EMPRESA.nomeCurto}
            </span>
            <span
              className={`text-[9px] sm:text-[10px] font-semibold tracking-[0.22em] uppercase leading-tight mt-1 transition-colors ${
                modoClaro ? 'text-[#52371c]' : 'text-[#c9a04e]'
              }`}
            >
              {EMPRESA.subtitulo}
            </span>
          </div>
        </a>

        {/* Navegação Desktop */}
        <nav
          aria-label="Navegação principal"
          className="hidden lg:flex items-center gap-7"
        >
          <button
            type="button"
            onClick={() => {
              if (!naHome) irParaRota('/');
              else window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={linkClasse(naHome && secaoAtiva === 'hero')}
          >
            Home
          </button>

          {/* Menu suspenso Ambientes */}
          <div
            ref={dropdownRef}
            className="relative py-2"
            onMouseEnter={() => setDropdownAmbientes(true)}
            onMouseLeave={() => setDropdownAmbientes(false)}
          >
            <button
              type="button"
              onClick={() => setDropdownAmbientes((prev) => !prev)}
              aria-expanded={dropdownAmbientes}
              aria-haspopup="true"
              className={`inline-flex items-center gap-1 ${linkClasse(
                currentPath.includes('-jau') || secaoAtiva === 'quarto-3d'
              )}`}
            >
              <span>Ambientes</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  dropdownAmbientes ? 'rotate-180' : ''
                } ${modoClaro ? 'text-[#52371c]' : 'text-[#c9a04e]'}`}
              />
            </button>

            {dropdownAmbientes && (
              <div
                role="menu"
                className="absolute left-0 top-full flex flex-col w-60 p-2 rounded-xl bg-[#F4F2ED] text-[#262624] shadow-[0_16px_36px_rgba(0,0,0,0.16)] border border-[#262624]/15 z-50"
              >
                <a
                  href="/cozinhas-planejadas-jau"
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault();
                    irParaRota('/cozinhas-planejadas-jau');
                  }}
                  className="px-4 py-2.5 rounded-lg text-left text-xs font-semibold uppercase tracking-wider text-[#262624] hover:bg-[#262624]/5 transition-colors"
                >
                  Cozinhas Planejadas
                </a>
                <a
                  href="/quartos-planejados-jau"
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault();
                    irParaRota('/quartos-planejados-jau');
                  }}
                  className="px-4 py-2.5 rounded-lg text-left text-xs font-semibold uppercase tracking-wider text-[#262624] hover:bg-[#262624]/5 transition-colors"
                >
                  Quartos &amp; Suítes
                </a>
                <a
                  href="/closets-sob-medida-jau"
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault();
                    irParaRota('/closets-sob-medida-jau');
                  }}
                  className="px-4 py-2.5 rounded-lg text-left text-xs font-semibold uppercase tracking-wider text-[#262624] hover:bg-[#262624]/5 transition-colors"
                >
                  Closets Sob Medida
                </a>
                <a
                  href="/home-office-planejado-jau"
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault();
                    irParaRota('/home-office-planejado-jau');
                  }}
                  className="px-4 py-2.5 rounded-lg text-left text-xs font-semibold uppercase tracking-wider text-[#262624] hover:bg-[#262624]/5 transition-colors"
                >
                  Home Office Executivo
                </a>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => irParaSecao('quarto-3d')}
                  className="px-4 py-2.5 rounded-lg text-left text-xs font-bold uppercase tracking-wider text-[#52371c] hover:bg-[#c9a04e]/15 border-t border-[#262624]/10 mt-1 pt-2.5 cursor-pointer"
                >
                  Projete em 3D →
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => irParaSecao('obras')}
            className={linkClasse(naHome && secaoAtiva === 'obras')}
          >
            Obras
          </button>

          <button
            type="button"
            onClick={() => irParaSecao('processo')}
            className={linkClasse(false)}
          >
            Processo
          </button>

          <button
            type="button"
            onClick={() => irParaSecao('quarto-3d')}
            className={linkClasse(naHome && secaoAtiva === 'quarto-3d')}
          >
            Quarto 3D
          </button>

          <button
            type="button"
            onClick={() => irParaSecao('donos')}
            className={linkClasse(naHome && secaoAtiva === 'donos')}
          >
            Sobre Nós
          </button>

          <a
            href="/contato"
            onClick={(e) => {
              e.preventDefault();
              irParaRota('/contato');
            }}
            className={linkClasse(currentPath === '/contato')}
          >
            Contato
          </a>
        </nav>

        {/* Telefone + Botão "PEDIR ORÇAMENTO ↗" sempre visível + Botão Hamburger */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <a
            href={`tel:+${EMPRESA.whatsapp}`}
            className={`hidden xl:flex items-center gap-1.5 text-xs font-semibold transition-colors ${
              modoClaro
                ? 'text-[#262624] hover:text-[#52371c]'
                : 'text-[#f2e8d8]/85 hover:text-[#c9a04e]'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-[#c9a04e]" />
            <span>{EMPRESA.telefone}</span>
          </a>

          <button
            type="button"
            onClick={() => irParaRota('/contato')}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-6 py-2.5 rounded-lg bg-[#c9a04e] hover:bg-[#d8af5c] text-[#15100c] transition-all duration-200 shadow-[0_4px_16px_rgba(201,160,78,0.25)] font-bold text-[11px] sm:text-xs uppercase tracking-wider cursor-pointer shrink-0"
          >
            <span>Pedir Orçamento</span>
            <span className="text-sm leading-none">↗</span>
          </button>

          <button
            type="button"
            onClick={() => setMenuAberto((prev) => !prev)}
            aria-expanded={menuAberto}
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            className={`lg:hidden p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${
              modoClaro
                ? 'bg-transparent text-[#262624] border-[#262624]/20 hover:bg-[#262624]/5'
                : 'bg-[#251d18] text-[#f2e8d8] border-[#c9a04e]/30'
            }`}
          >
            {menuAberto ? (
              <X className="w-6 h-6 text-[#262624]" strokeWidth={1.75} />
            ) : (
              <Menu
                className={`w-6 h-6 ${
                  modoClaro ? 'text-[#262624]' : 'text-[#f2e8d8]'
                }`}
              />
            )}
          </button>
        </div>
      </div>

      {/* Menu Móvel em Branco/Papel Claro (idêntico à referência visual enviada) */}
      {menuAberto && (
        <div className="lg:hidden bg-[#F4F2ED] text-[#262624] border-t border-[#262624]/12 px-6 py-6 flex flex-col gap-2 shadow-2xl max-h-[85vh] overflow-y-auto">
          <button
            type="button"
            onClick={() => irParaSecao('obras')}
            className="text-left py-4 text-xl font-bold text-[#262624] border-b border-[#262624]/12 hover:text-[#52371c] cursor-pointer"
          >
            Obras
          </button>

          <button
            type="button"
            onClick={() => irParaSecao('processo')}
            className="text-left py-4 text-xl font-bold text-[#262624] border-b border-[#262624]/12 hover:text-[#52371c] cursor-pointer"
          >
            Processo
          </button>

          <button
            type="button"
            onClick={() => irParaSecao('quarto-3d')}
            className="text-left py-4 text-xl font-bold text-[#262624] border-b border-[#262624]/12 hover:text-[#52371c] cursor-pointer"
          >
            Quarto 3D
          </button>

          <button
            type="button"
            onClick={() => irParaSecao('donos')}
            className="text-left py-4 text-xl font-bold text-[#262624] border-b border-[#262624]/12 hover:text-[#52371c] cursor-pointer"
          >
            Sobre Nós
          </button>

          <button
            type="button"
            onClick={() => irParaRota('/contato')}
            className="text-left py-4 text-xl font-bold text-[#52371c] border-b border-[#262624]/12 cursor-pointer"
          >
            Pedir Orçamento (Formulário)
          </button>

          <div className="pt-4 flex flex-col gap-3">
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick('menu_mobile')}
              className="w-full h-[52px] bg-[#D4A84F] hover:bg-[#c5983e] text-[#15100c] text-sm font-semibold rounded-sm flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#15100c]" />
              <span>Chamar no WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
