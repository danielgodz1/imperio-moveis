import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, Menu, X, ChevronDown } from 'lucide-react';
import { getWhatsAppUrl, playWoodChimeSound } from '../utils/helpers';
import { scrollToTarget } from '../hooks/useScrollytelling';

interface HeaderProps {
  onOpenVisitBooking: () => void;
  onNavigateContact: () => void;
  onNavigateHome: () => void;
  currentView: 'home' | 'contato';
  headerRef: React.RefObject<HTMLElement | null>;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigateContact,
  onNavigateHome,
  currentView,
  headerRef,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ambientesDropdown, setAmbientesDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    playWoodChimeSound();
    setMobileMenuOpen(false);
    setAmbientesDropdown(false);

    if (currentView !== 'home') {
      onNavigateHome();
      setTimeout(() => {
        scrollToTarget(`#${sectionId}`, -80);
      }, 100);
    } else {
      scrollToTarget(`#${sectionId}`, -80);
    }
  };

  const isTransparent = currentView === 'home' && !isScrolled;

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isTransparent
          ? 'bg-transparent border-b border-transparent py-2'
          : 'bg-[#15100c]/95 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.35)] border-b border-[#c9a04e]/20 py-0'
      }`}
    >
      <div className="h-20 max-w-[1340px] mx-auto px-4 sm:px-8 flex items-center justify-between gap-6">
        
        {/* Brand & Logo */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            playWoodChimeSound();
            onNavigateHome();
            scrollToTarget('#hero', -100);
          }}
          className="flex items-center gap-3.5 shrink-0 group cursor-pointer"
        >
          <img
            src="https://instagram.fbau1-1.fna.fbcdn.net/v/t51.82787-19/881676383_18027770813870048_1008026097534673996_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=111&_nc_map=urlgen_bucketless&ig_cache_key=GF9QjTTg73N7KQxAAEyk4BtlOv0NbmNDAQAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=bYmoz-fD-60Q7kNvwHzGbxo&_nc_oc=Adp7wtGW7XFZEoX3MiRK6WIk1iMJl57gSivbvXCo5dipQuMb_JwFeW93tTLo-HQn14AcfMlh2pVmxaO40rjQ1qrL&_nc_zt=24&_nc_ht=instagram.fbau1-1.fna&_nc_gid=vbgtSlQvxHdbkAfyRDHUlg&_nc_ss=7b6a8&oh=00_AQTKbfEuZzYYl6BEyJOLw8m93xZc9td-yOU_Mt6_EL6hfQ&oe=6AF1CE87"
            alt="Império Móveis Planejados Logo"
            className="h-10 w-10 sm:h-11 sm:w-11 object-cover rounded-lg shadow-sm border border-[#c9a04e]/40 bg-white group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <span className="font-serif-atelier text-xl sm:text-2xl font-bold tracking-tight text-[#f2e8d8] leading-none">
              IMPÉRIO
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.25em] uppercase text-[#c9a04e] leading-tight mt-1">
              Móveis Planejados
            </span>
          </div>
        </a>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold uppercase tracking-[0.08em] text-[#f2e8d8]/90">
          <button
            onClick={() => {
              playWoodChimeSound();
              onNavigateHome();
              scrollToTarget('#hero', -100);
            }}
            className={`transition-colors py-1 cursor-pointer ${
              currentView === 'home' ? 'text-[#c9a04e] font-bold border-b-2 border-[#c9a04e]' : 'hover:text-[#c9a04e]'
            }`}
          >
            Home
          </button>

          {/* Ambientes Dropdown */}
          <div
            className="relative py-2"
            onMouseEnter={() => setAmbientesDropdown(true)}
            onMouseLeave={() => setAmbientesDropdown(false)}
          >
            <button
              onClick={() => handleNavClick('ambientes')}
              className="hover:text-[#c9a04e] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Ambientes</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#c9a04e]" />
            </button>

            {ambientesDropdown && (
              <div className="absolute left-0 top-full flex flex-col w-60 p-2 rounded-xl bg-[#1d1612] shadow-[0_16px_36px_rgba(0,0,0,0.5)] border border-[#c9a04e]/30 z-50 animate-in fade-in-50 duration-150">
                <button
                  onClick={() => handleNavClick('ambientes')}
                  className="px-3 py-2 text-left rounded-lg text-xs font-medium text-[#f2e8d8] hover:bg-[#c9a04e]/15 hover:text-[#c9a04e] transition-colors cursor-pointer"
                >
                  Cozinhas Planejadas
                </button>
                <button
                  onClick={() => handleNavClick('ambientes')}
                  className="px-3 py-2 text-left rounded-lg text-xs font-medium text-[#f2e8d8] hover:bg-[#c9a04e]/15 hover:text-[#c9a04e] transition-colors cursor-pointer"
                >
                  Dormitórios & Closets
                </button>
                <button
                  onClick={() => handleNavClick('ambientes')}
                  className="px-3 py-2 text-left rounded-lg text-xs font-medium text-[#f2e8d8] hover:bg-[#c9a04e]/15 hover:text-[#c9a04e] transition-colors cursor-pointer"
                >
                  Salas & Home Theater
                </button>
                <button
                  onClick={() => handleNavClick('ambientes')}
                  className="px-3 py-2 text-left rounded-lg text-xs font-medium text-[#f2e8d8] hover:bg-[#c9a04e]/15 hover:text-[#c9a04e] transition-colors cursor-pointer"
                >
                  Home Office Executivo
                </button>
                <button
                  onClick={() => handleNavClick('ambientes')}
                  className="px-3 py-2 text-left rounded-lg text-xs font-medium text-[#f2e8d8] hover:bg-[#c9a04e]/15 hover:text-[#c9a04e] transition-colors cursor-pointer"
                >
                  Lavanderias Inteligentes
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => handleNavClick('projetos')}
            className="hover:text-[#c9a04e] transition-colors py-1 cursor-pointer"
          >
            Projetos
          </button>

          <button
            onClick={() => handleNavClick('sobre-nos')}
            className="hover:text-[#c9a04e] transition-colors py-1 cursor-pointer"
          >
            Sobre Nós
          </button>

          <button
            onClick={() => handleNavClick('avaliacoes')}
            className="hover:text-[#c9a04e] transition-colors py-1 cursor-pointer"
          >
            Avaliações
          </button>

          <button
            onClick={() => {
              playWoodChimeSound();
              onNavigateContact();
            }}
            className={`transition-colors py-1 cursor-pointer ${
              currentView === 'contato' ? 'text-[#c9a04e] font-bold border-b-2 border-[#c9a04e]' : 'hover:text-[#c9a04e]'
            }`}
          >
            Contato
          </button>
        </nav>

        {/* Desktop CTA Action in Brass */}
        <div className="flex items-center gap-4">
          <a
            href="tel:+5514998492834"
            className="hidden xl:flex items-center gap-1.5 text-xs text-[#f2e8d8]/80 hover:text-[#c9a04e] font-semibold transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#c9a04e]" />
            <span>(14) 99849-2834</span>
          </a>

          <button
            onClick={() => {
              playWoodChimeSound();
              onNavigateContact();
            }}
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-lg bg-[#c9a04e] hover:bg-[#d8af5c] text-[#15100c] transition-all duration-200 shadow-[0_4px_16px_rgba(201,160,78,0.25)] font-bold text-xs uppercase tracking-wider cursor-pointer"
          >
            <span>Pedir Orçamento</span>
            <span className="text-sm">↗</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-[#251d18] text-[#f2e8d8] border border-[#c9a04e]/30 cursor-pointer"
            aria-label="Abrir Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#c9a04e]" /> : <Menu className="w-6 h-6 text-[#f2e8d8]" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#15100c] border-b border-[#c9a04e]/30 px-6 py-6 space-y-4 animate-in slide-in-from-top-2 shadow-2xl">
          <div className="flex flex-col space-y-3 font-semibold uppercase tracking-wider text-xs text-[#f2e8d8]">
            <button
              onClick={() => {
                onNavigateHome();
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 border-b border-[#251d18] hover:text-[#c9a04e]"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('ambientes')}
              className="text-left py-2 border-b border-[#251d18] hover:text-[#c9a04e]"
            >
              Ambientes Planejados
            </button>
            <button
              onClick={() => handleNavClick('projetos')}
              className="text-left py-2 border-b border-[#251d18] hover:text-[#c9a04e]"
            >
              Projetos & Portfólio
            </button>
            <button
              onClick={() => handleNavClick('sobre-nos')}
              className="text-left py-2 border-b border-[#251d18] hover:text-[#c9a04e]"
            >
              Sobre Nós
            </button>
            <button
              onClick={() => handleNavClick('avaliacoes')}
              className="text-left py-2 border-b border-[#251d18] hover:text-[#c9a04e]"
            >
              Avaliações Google
            </button>
            <button
              onClick={() => {
                onNavigateContact();
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 font-bold text-[#c9a04e]"
            >
              Contato & Orçamento
            </button>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => {
                onNavigateContact();
                setMobileMenuOpen(false);
              }}
              className="w-full bg-[#c9a04e] text-[#15100c] text-xs uppercase tracking-wider py-3 rounded-lg font-bold text-center cursor-pointer"
            >
              Pedir Orçamento ↗
            </button>
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
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
