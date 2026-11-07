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
      setIsScrolled(window.scrollY > 40);
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

  const linkClasse = (ativo: boolean) =>
    `text-xs font-semibold uppercase tracking-[0.08em] py-1 cursor-pointer transition-colors ${
      ativo
        ? 'text-[#c9a04e] font-bold border-b-2 border-[#c9a04e]'
        : 'text-[#f2e8d8]/90 hover:text-[#c9a04e]'
    }`;

  const isTransparent = naHome && !isScrolled && !menuAberto;

  return (
    <header
      ref={headerRef}
      data-tema="noite"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 will-change-transform ${
        isTransparent
          ? 'bg-transparent border-b border-transparent py-1'
          : 'bg-[#15100c]/95 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.35)] border-b border-[#c9a04e]/20 py-0'
      }`}
    >
      <div className="h-20 max-w-[1340px] mx-auto px-4 sm:px-8 flex items-center justify-between gap-3 sm:gap-6">
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
            className="h-10 w-10 sm:h-11 sm:w-11 object-cover rounded-lg shadow-sm border border-[#c9a04e]/40 bg-[#1b1b1b] group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-serif-atelier text-xl sm:text-2xl font-bold tracking-tight text-[#f2e8d8] leading-none">
              {EMPRESA.nomeCurto}
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.25em] uppercase text-[#c9a04e] leading-tight mt-1">
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
                className={`w-3.5 h-3.5 text-[#c9a04e] transition-transform ${
                  dropdownAmbientes ? 'rotate-180' : ''
                }`}
              />
            </button>

            {dropdownAmbientes && (
              <div
                role="menu"
                className="absolute left-0 top-full flex flex-col w-60 p-2 rounded-xl bg-[#1d1612] shadow-[0_16px_36px_rgba(0,0,0,0.5)] border border-[#c9a04e]/30 z-50"
              >
                <a
                  href="/cozinhas-planejadas-jau"
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault();
                    irParaRota('/cozinhas-planejadas-jau');
                  }}
                  className="px-4 py-2.5 rounded-lg text-left text-xs font-semibold uppercase tracking-wider text-[#f2e8d8]/90 hover:text-[#c9a04e] hover:bg-[#c9a04e]/10 transition-colors"
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
                  className="px-4 py-2.5 rounded-lg text-left text-xs font-semibold uppercase tracking-wider text-[#f2e8d8]/90 hover:text-[#c9a04e] hover:bg-[#c9a04e]/10 transition-colors"
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
                  className="px-4 py-2.5 rounded-lg text-left text-xs font-semibold uppercase tracking-wider text-[#f2e8d8]/90 hover:text-[#c9a04e] hover:bg-[#c9a04e]/10 transition-colors"
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
                  className="px-4 py-2.5 rounded-lg text-left text-xs font-semibold uppercase tracking-wider text-[#f2e8d8]/90 hover:text-[#c9a04e] hover:bg-[#c9a04e]/10 transition-colors"
                >
                  Home Office Executivo
                </a>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => irParaSecao('quarto-3d')}
                  className="px-4 py-2.5 rounded-lg text-left text-xs font-bold uppercase tracking-wider text-[#c9a04e] hover:bg-[#c9a04e]/10 border-t border-[#c9a04e]/20 mt-1 pt-2.5 cursor-pointer"
                >
                  Projete em 3D
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => irParaSecao('obras')}
            className={linkClasse(naHome && secaoAtiva === 'obras')}
          >
            Projetos
          </button>

          <button
            type="button"
            onClick={() => irParaSecao('donos')}
            className={linkClasse(naHome && secaoAtiva === 'donos')}
          >
            Sobre Nós
          </button>

          <button
            type="button"
            onClick={() => irParaSecao('avaliacoes')}
            className={linkClasse(naHome && secaoAtiva === 'avaliacoes')}
          >
            Avaliações
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

        {/* Telefone + Botão "PEDIR ORÇAMENTO ↗" sempre visível (inclusive mobile) + Botão Hamburger */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <a
            href={`tel:+${EMPRESA.whatsapp}`}
            className="hidden xl:flex items-center gap-1.5 text-xs text-[#f2e8d8]/80 hover:text-[#c9a04e] font-semibold transition-colors"
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
            className="lg:hidden p-2 rounded-lg bg-[#251d18] text-[#f2e8d8] border border-[#c9a04e]/30 cursor-pointer shrink-0"
          >
            {menuAberto ? (
              <X className="w-6 h-6 text-[#c9a04e]" />
            ) : (
              <Menu className="w-6 h-6 text-[#f2e8d8]" />
            )}
          </button>
        </div>
      </div>

      {/* Menu Móvel Acessível */}
      {menuAberto && (
        <div className="lg:hidden bg-[#15100c] border-b border-[#c9a04e]/30 px-6 py-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
          <div className="flex flex-col space-y-3 font-semibold uppercase tracking-wider text-xs text-[#f2e8d8]">
            <button
              type="button"
              onClick={() => irParaRota('/')}
              className="text-left py-2 border-b border-[#251d18] hover:text-[#c9a04e] cursor-pointer"
            >
              Home
            </button>

            <div className="py-2 border-b border-[#251d18] flex flex-col gap-2">
              <span className="text-[#c9a04e] font-bold">Ambientes Planejados</span>
              <div className="grid grid-cols-2 gap-2 pl-2 pt-1">
                <button
                  type="button"
                  onClick={() => irParaRota('/cozinhas-planejadas-jau')}
                  className="text-left py-1.5 text-[11px] text-[#f2e8d8]/85 hover:text-[#c9a04e] cursor-pointer"
                >
                  Cozinhas
                </button>
                <button
                  type="button"
                  onClick={() => irParaRota('/quartos-planejados-jau')}
                  className="text-left py-1.5 text-[11px] text-[#f2e8d8]/85 hover:text-[#c9a04e] cursor-pointer"
                >
                  Quartos
                </button>
                <button
                  type="button"
                  onClick={() => irParaRota('/closets-sob-medida-jau')}
                  className="text-left py-1.5 text-[11px] text-[#f2e8d8]/85 hover:text-[#c9a04e] cursor-pointer"
                >
                  Closets
                </button>
                <button
                  type="button"
                  onClick={() => irParaRota('/home-office-planejado-jau')}
                  className="text-left py-1.5 text-[11px] text-[#f2e8d8]/85 hover:text-[#c9a04e] cursor-pointer"
                >
                  Home Office
                </button>
                <button
                  type="button"
                  onClick={() => irParaSecao('quarto-3d')}
                  className="text-left py-1.5 text-[11px] text-[#c9a04e] font-bold col-span-2 cursor-pointer"
                >
                  Projete em 3D →
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => irParaSecao('obras')}
              className="text-left py-2 border-b border-[#251d18] hover:text-[#c9a04e] cursor-pointer"
            >
              Projetos &amp; Portfólio
            </button>
            <button
              type="button"
              onClick={() => irParaSecao('donos')}
              className="text-left py-2 border-b border-[#251d18] hover:text-[#c9a04e] cursor-pointer"
            >
              Sobre Nós
            </button>
            <button
              type="button"
              onClick={() => irParaSecao('avaliacoes')}
              className="text-left py-2 border-b border-[#251d18] hover:text-[#c9a04e] cursor-pointer"
            >
              Avaliações Google
            </button>
            <button
              type="button"
              onClick={() => irParaRota('/contato')}
              className="text-left py-2 font-bold text-[#c9a04e] cursor-pointer"
            >
              Contato &amp; Orçamento
            </button>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => irParaRota('/contato')}
              className="w-full bg-[#c9a04e] text-[#15100c] text-xs uppercase tracking-wider py-3 rounded-lg font-bold text-center cursor-pointer"
            >
              Pedir Orçamento ↗
            </button>
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick('menu_mobile')}
              className="w-full bg-[#251d18] text-[#f2e8d8] hover:text-[#c9a04e] border border-[#c9a04e]/40 text-xs uppercase tracking-wider py-3 rounded-lg font-semibold text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#c9a04e]" />
              WhatsApp Direto Jaú
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
