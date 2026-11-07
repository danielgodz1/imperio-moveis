import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Phone, ChevronDown } from 'lucide-react';
import { EMPRESA } from '../data/empresa';
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
  onOpenBriefing,
  currentPath,
  headerRef,
}) => {
  const [menuAberto, setMenuAberto] = useState(false);
  const [dropdownAmbientes, setDropdownAmbientes] = useState(false);
  const [secaoAtiva, setSecaoAtiva] = useState<string>('hero');
  const [logoErro, setLogoErro] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const naHome = currentPath === '/';

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
        scrollToTarget(`#${id}`, -72);
      }, 150);
    } else {
      scrollToTarget(`#${id}`, -72);
    }
  };

  const irParaRota = (path: string) => {
    setMenuAberto(false);
    setDropdownAmbientes(false);
    onNavigatePath(path);
  };

  const linkClasse = (ativo: boolean) =>
    `tipo-cota cursor-pointer transition-colors ${
      ativo
        ? 'text-dourado link-traco font-semibold'
        : 'text-papel/85 hover:text-dourado'
    }`;

  return (
    <header
      ref={headerRef}
      data-tema="noite"
      className="fixed top-0 left-0 w-full z-50 bg-preto text-papel border-b border-papel/15 transition-transform duration-300 will-change-transform"
    >
      <div className="max-w-[1280px] mx-auto px-16 sm:px-32 h-64 flex items-center justify-between gap-16">
        {/* Logo à esquerda: public/logo-imperio.png com fallback tipográfico */}
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
          className="flex items-center gap-12 text-papel shrink-0"
        >
          {!logoErro ? (
            <img
              src="/logo-imperio.png"
              alt={EMPRESA.nome}
              onError={() => setLogoErro(true)}
              className="h-11 w-auto object-contain block"
            />
          ) : (
            <div className="flex flex-col">
              <span className="tipo-logo text-2xl text-papel leading-none">
                {EMPRESA.nomeCurto}
              </span>
              <span className="tipo-cota text-[11px] text-dourado leading-tight">
                {EMPRESA.subtitulo}
              </span>
            </div>
          )}
        </a>

        {/* Navegação Desktop */}
        <nav
          aria-label="Navegação principal"
          className="hidden lg:flex items-center gap-24"
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
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setDropdownAmbientes((prev) => !prev)}
              aria-expanded={dropdownAmbientes}
              aria-haspopup="true"
              className={`inline-flex items-center gap-4 ${linkClasse(
                currentPath.includes('-jau') || secaoAtiva === 'quarto-3d'
              )}`}
            >
              <span>Ambientes</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  dropdownAmbientes ? 'rotate-180 text-dourado' : ''
                }`}
                strokeWidth={1.5}
              />
            </button>

            {dropdownAmbientes && (
              <div
                role="menu"
                className="absolute left-0 top-full mt-12 w-56 bg-preto border border-papel/20 py-8 flex flex-col z-50"
              >
                <a
                  href="/cozinhas-planejadas-jau"
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault();
                    irParaRota('/cozinhas-planejadas-jau');
                  }}
                  className="px-16 py-8 text-left tipo-cota text-papel/85 hover:text-dourado hover:bg-papel/5"
                >
                  Cozinhas
                </a>
                <a
                  href="/quartos-planejados-jau"
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault();
                    irParaRota('/quartos-planejados-jau');
                  }}
                  className="px-16 py-8 text-left tipo-cota text-papel/85 hover:text-dourado hover:bg-papel/5"
                >
                  Quartos
                </a>
                <a
                  href="/closets-sob-medida-jau"
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault();
                    irParaRota('/closets-sob-medida-jau');
                  }}
                  className="px-16 py-8 text-left tipo-cota text-papel/85 hover:text-dourado hover:bg-papel/5"
                >
                  Closets
                </a>
                <a
                  href="/home-office-planejado-jau"
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault();
                    irParaRota('/home-office-planejado-jau');
                  }}
                  className="px-16 py-8 text-left tipo-cota text-papel/85 hover:text-dourado hover:bg-papel/5"
                >
                  Home Office
                </a>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => irParaSecao('quarto-3d')}
                  className="px-16 py-8 text-left tipo-cota text-dourado hover:bg-papel/5 border-t border-papel/15 mt-4 pt-8 cursor-pointer"
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

        {/* Telefone com ícone + Botão "Pedir orçamento" em dourado */}
        <div className="flex items-center gap-16">
          <a
            href={`tel:${EMPRESA.whatsapp}`}
            className="hidden xl:inline-flex items-center gap-8 tipo-cota text-papel/85 hover:text-dourado transition-colors"
          >
            <Phone className="w-4 h-4 text-dourado" strokeWidth={1.5} />
            <span>{EMPRESA.telefone}</span>
          </a>

          <button
            type="button"
            onClick={() => onOpenBriefing()}
            className="hidden sm:inline-flex items-center justify-center px-16 h-[40px] rounded-curto bg-dourado text-preto hover:bg-papel hover:text-preto transition-colors duration-200 tipo-cota font-semibold cursor-pointer"
          >
            Pedir orçamento
          </button>

          <button
            type="button"
            onClick={() => setMenuAberto((prev) => !prev)}
            aria-expanded={menuAberto}
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            className="lg:hidden p-8 text-papel cursor-pointer"
          >
            {menuAberto ? (
              <X className="w-6 h-6" strokeWidth={1.5} />
            ) : (
              <Menu className="w-6 h-6" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {/* Menu Móvel Acessível */}
      {menuAberto && (
        <div className="lg:hidden bg-preto border-t border-papel/15 px-16 py-24 flex flex-col gap-12 max-h-[85vh] overflow-y-auto">
          <button
            type="button"
            onClick={() => irParaRota('/')}
            className="text-left py-8 tipo-h3 text-papel border-b border-papel/10 cursor-pointer"
          >
            Home
          </button>

          <div className="py-8 border-b border-papel/10 flex flex-col gap-8">
            <span className="tipo-cota text-dourado">Ambientes</span>
            <div className="grid grid-cols-2 gap-8 pl-8">
              <button
                type="button"
                onClick={() => irParaRota('/cozinhas-planejadas-jau')}
                className="text-left py-4 tipo-cota text-papel/85 hover:text-dourado cursor-pointer"
              >
                Cozinhas
              </button>
              <button
                type="button"
                onClick={() => irParaRota('/quartos-planejados-jau')}
                className="text-left py-4 tipo-cota text-papel/85 hover:text-dourado cursor-pointer"
              >
                Quartos
              </button>
              <button
                type="button"
                onClick={() => irParaRota('/closets-sob-medida-jau')}
                className="text-left py-4 tipo-cota text-papel/85 hover:text-dourado cursor-pointer"
              >
                Closets
              </button>
              <button
                type="button"
                onClick={() => irParaRota('/home-office-planejado-jau')}
                className="text-left py-4 tipo-cota text-papel/85 hover:text-dourado cursor-pointer"
              >
                Home Office
              </button>
              <button
                type="button"
                onClick={() => irParaSecao('quarto-3d')}
                className="text-left py-4 tipo-cota text-dourado font-semibold col-span-2 cursor-pointer"
              >
                Projete em 3D
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => irParaSecao('obras')}
            className="text-left py-8 tipo-h3 text-papel border-b border-papel/10 cursor-pointer"
          >
            Projetos
          </button>
          <button
            type="button"
            onClick={() => irParaSecao('donos')}
            className="text-left py-8 tipo-h3 text-papel border-b border-papel/10 cursor-pointer"
          >
            Sobre Nós
          </button>
          <button
            type="button"
            onClick={() => irParaSecao('avaliacoes')}
            className="text-left py-8 tipo-h3 text-papel border-b border-papel/10 cursor-pointer"
          >
            Avaliações
          </button>
          <button
            type="button"
            onClick={() => irParaRota('/contato')}
            className="text-left py-8 tipo-h3 text-papel border-b border-papel/10 cursor-pointer"
          >
            Contato
          </button>

          <div className="pt-8 flex flex-col gap-12">
            <a
              href={`tel:${EMPRESA.whatsapp}`}
              className="inline-flex items-center gap-8 tipo-cota text-papel/85"
            >
              <Phone className="w-4 h-4 text-dourado" strokeWidth={1.5} />
              <span>{EMPRESA.telefone}</span>
            </a>

            <button
              type="button"
              onClick={() => {
                setMenuAberto(false);
                onOpenBriefing();
              }}
              className="w-full h-[52px] rounded-curto bg-dourado text-preto hover:bg-papel hover:text-preto transition-colors flex items-center justify-center tipo-cota font-semibold cursor-pointer"
            >
              Pedir orçamento
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
