/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { FaixaServicos } from './components/FaixaServicos';
import { Donos } from './components/Donos';
import { Obras } from './components/Obras';
import { ProcessoSection } from './components/ProcessoSection';
import { Quarto3DLoader } from './components/quarto3d/Quarto3DLoader';
import { ReviewsSection } from './components/ReviewsSection';
import { Fechamento } from './components/Fechamento';
import { ContactQuotationPage } from './components/ContactQuotationPage';
import { Footer } from './components/Footer';
import { VisitBookingModal } from './components/VisitBookingModal';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { FiltroLapis, LinhaLapis } from './components/LinhaLapis';
import { useScrollytelling } from './hooks/useScrollytelling';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'contato'>(() =>
    window.location.pathname.startsWith('/contato') ? 'contato' : 'home'
  );
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);

  const { headerRef } = useScrollytelling();

  useEffect(() => {
    const titles = {
      home: 'Móveis Planejados e Arquitetura em Jaú/SP — Império Móveis Planejados',
      contato: 'Pedir orçamento — Império Móveis Planejados Jaú/SP',
    };
    document.title = titles[currentView];
  }, [currentView]);

  useEffect(() => {
    const onPop = () =>
      setCurrentView(window.location.pathname.startsWith('/contato') ? 'contato' : 'home');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const handleNavigateContact = () => {
    setCurrentView('contato');
    window.history.pushState({}, '', '/contato');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    setCurrentView('home');
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-papel text-grafite flex flex-col">
      {/* Filtro SVG global para textura orgânica de traço de lápis */}
      <FiltroLapis />

      {/* Indicador de rolagem em traço de lápis (lateral no desktop, topo 2px no celular) */}
      <LinhaLapis />

      {/* Cabeçalho inteligente (transparente sobre a foto do hero) */}
      <Header
        headerRef={headerRef}
        onNavigateContact={handleNavigateContact}
        onNavigateHome={handleNavigateHome}
        currentView={currentView}
      />

      {/* Conteúdo principal */}
      <main className="flex-1">
        {currentView === 'contato' ? (
          <ContactQuotationPage onBackToHome={handleNavigateHome} />
        ) : (
          <>
            {/* Momento 1: Hero "Do risco à obra" + Faixa única de serviços */}
            <Hero />
            <FaixaServicos />

            {/* Momento 2: Os donos (Wellington, Tatiane, Juntos + Linha do tempo) */}
            <Donos />

            {/* Momento 3: As obras (Projetos reais anotados com traço de lápis + Lightbox) */}
            <Obras />

            {/* Momento 4: Do risco à obra em 4 etapas (com foto da instalação por guindaste) */}
            <ProcessoSection />

            {/* Momento 5: Projete seu quarto em 3D (lazy-loaded em chunk separado) */}
            <Quarto3DLoader />

            {/* Avaliações (posicionada depois de "As obras" e antes do "Fechamento") */}
            <ReviewsSection />

            {/* Momento 6: Fechamento (Orçamento WhatsApp, Onde estamos, Perguntas curtas) */}
            <Fechamento
              onNavigateContact={handleNavigateContact}
              onOpenVisitBooking={() => setIsVisitModalOpen(true)}
            />
          </>
        )}
      </main>

      {/* Rodapé em --preto */}
      <Footer onNavigateContact={handleNavigateContact} />

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
