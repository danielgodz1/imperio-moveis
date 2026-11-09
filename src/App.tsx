/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroScrollytelling } from './components/heroScroll/HeroScrollytelling';
import { FaixaServicos } from './components/FaixaServicos';
import { FraseImpacto } from './components/FraseImpacto';
import { Donos } from './components/Donos';
import { Obras } from './components/Obras';
import { ProcessoSection } from './components/ProcessoSection';
import { Quarto3DLoader } from './components/quarto3d/Quarto3DLoader';
import { ReviewsSection } from './components/ReviewsSection';
import { Fechamento } from './components/Fechamento';
import { ContactQuotationPage } from './components/ContactQuotationPage';
import { PaginaAmbienteLocal } from './components/PaginaAmbienteLocal';
import { BriefingOrcamento } from './components/BriefingOrcamento';
import { JsonLdSchema } from './components/JsonLdSchema';
import { Footer } from './components/Footer';
import { VisitBookingModal } from './components/VisitBookingModal';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { FiltroLapis, LinhaLapis } from './components/LinhaLapis';
import { useScrollytelling } from './hooks/useScrollytelling';
import {
  METADADOS_ROTAS_SEO,
  PAGINAS_AMBIENTES_LOCAIS,
  RotaPublica,
} from './data/paginasLocais';

function normalizarRota(pathname: string): RotaPublica {
  const limpa = pathname.replace(/\/+$/, '') || '/';
  if (limpa in METADADOS_ROTAS_SEO) {
    return limpa as RotaPublica;
  }
  return '/';
}

export default function App() {
  const [currentPath, setCurrentPath] = useState<RotaPublica>(() =>
    typeof window !== 'undefined' ? normalizarRota(window.location.pathname) : '/'
  );
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [briefingPainelAberto, setBriefingPainelAberto] = useState(false);
  const [briefingAmbienteInicial, setBriefingAmbienteInicial] = useState<
    string | undefined
  >(undefined);

  const { headerRef } = useScrollytelling();

  useEffect(() => {
    const meta = METADADOS_ROTAS_SEO[currentPath] ?? METADADOS_ROTAS_SEO['/'];
    document.title = meta.title;

    const descEl = document.querySelector('meta[name="description"]');
    if (descEl) {
      descEl.setAttribute('content', meta.description);
    }

    const canonEl = document.querySelector('link[rel="canonical"]');
    if (canonEl) {
      canonEl.setAttribute('href', meta.canonical);
    }
  }, [currentPath]);

  useEffect(() => {
    const onPop = () => {
      setCurrentPath(normalizarRota(window.location.pathname));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const handleNavigateRoute = (path: string) => {
    const rota = normalizarRota(path);
    setCurrentPath(rota);
    window.history.pushState({}, '', rota);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBriefing = (ambienteInicial?: string) => {
    setBriefingAmbienteInicial(ambienteInicial);
    setBriefingPainelAberto(true);
  };

  const configAmbienteLocal =
    currentPath in PAGINAS_AMBIENTES_LOCAIS
      ? PAGINAS_AMBIENTES_LOCAIS[
          currentPath as keyof typeof PAGINAS_AMBIENTES_LOCAIS
        ]
      : null;

  return (
    <div className="min-h-screen bg-papel text-grafite flex flex-col">
      {/* Dados estruturados FurnitureStore gerados de empresa.ts */}
      <JsonLdSchema />

      {/* Filtro SVG global para textura orgânica de traço de lápis */}
      <FiltroLapis />

      {/* Indicador de rolagem em traço de lápis (lateral no desktop, topo 2px no celular) */}
      <LinhaLapis />

      {/* Cabeçalho fixo em --preto com destaque de seção ativa */}
      <Header
        headerRef={headerRef}
        currentPath={currentPath}
        onNavigatePath={handleNavigateRoute}
        onOpenBriefing={handleOpenBriefing}
      />

      {/* Conteúdo principal */}
      <main className="flex-1">
        {currentPath === '/contato' ? (
          <ContactQuotationPage
            onBackToHome={() => handleNavigateRoute('/')}
            ambienteInicial={briefingAmbienteInicial}
          />
        ) : configAmbienteLocal ? (
          <PaginaAmbienteLocal
            config={configAmbienteLocal}
            onNavigateHome={() => handleNavigateRoute('/')}
            onOpenBriefing={(amb) => handleOpenBriefing(amb)}
          />
        ) : (
          <>
            {/* Momento 1: Hero imersivo com scrollytelling 3D */}
            <HeroScrollytelling onNavigateContact={() => handleNavigateRoute('/contato')} />

            {/* Frase de impacto entre o Hero e a seção Os donos */}
            <FraseImpacto />

            {/* Momento 2: Os donos (Wellington, Tatiane, Juntos + Linha do tempo) */}
            <Donos />

            {/* Momento 3: As obras (Projetos reais anotados com traço de lápis + Scroll rápido + Lightbox) */}
            <Obras />

            {/* Momento 4: Do risco à obra em 4 etapas (com foto da instalação por guindaste) */}
            <ProcessoSection />

            {/* Momento 5: Projete seu ambiente em 3D (lazy-loaded em chunk separado) */}
            <Quarto3DLoader
              onOpenBriefingOutro={() => handleOpenBriefing('Outro')}
            />

            {/* Avaliações (posicionada depois de "As obras" e antes do "Fechamento") */}
            <ReviewsSection />

            {/* Momento 6: Fechamento (Orçamento WhatsApp, Onde estamos, Perguntas curtas) */}
            <Fechamento
              onNavigateContact={() => handleNavigateRoute('/contato')}
              onOpenVisitBooking={() => setIsVisitModalOpen(true)}
            />
          </>
        )}
      </main>

      {/* Rodapé em --preto com 4 colunas vindas de empresa.ts */}
      <Footer
        onNavigateRoute={handleNavigateRoute}
        onOpenBriefing={() => handleOpenBriefing()}
      />

      {/* Painel lateral de orçamento rápido (3 passos -> WhatsApp) */}
      <BriefingOrcamento
        modo="painel"
        aberto={briefingPainelAberto}
        onFechar={() => setBriefingPainelAberto(false)}
        ambienteInicial={briefingAmbienteInicial}
      />

      {/* Botão flutuante discreto de WhatsApp */}
      <WhatsAppWidget />

      {/* Modal opcional de agendamento de visita */}
      <VisitBookingModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
      />
    </div>
  );
}
