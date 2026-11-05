/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PortfolioGallery } from './components/PortfolioGallery';
import { SobreNosSection } from './components/SobreNosSection';
import { ProcessoSection } from './components/ProcessoSection';
import { CraftsmanshipScrollyLayer } from './components/CraftsmanshipScrollyLayer';
import { ReviewsSection } from './components/ReviewsSection';
import { InstagramFeedSection } from './components/InstagramFeedSection';
import { WorkshopLocation } from './components/WorkshopLocation';
import { FaqSection } from './components/FaqSection';
import { BannerCtaSection } from './components/BannerCtaSection';
import { ContactQuotationPage } from './components/ContactQuotationPage';
import { Footer } from './components/Footer';
import { VisitBookingModal } from './components/VisitBookingModal';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { useScrollytelling } from './hooks/useScrollytelling';
import { playWoodChimeSound } from './utils/helpers';

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'contato'>(() => (window.location.pathname.startsWith('/contato') ? 'contato' : 'home'));
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);

  // Initialize Item 1: Lenis Smooth Scroll + Golden Progress Bar + Smart Header
  const { progressBarRef, headerRef } = useScrollytelling();

  useEffect(() => {
    const titles = { home: 'Móveis Planejados em Jaú SP | Império Móveis Planejados', contato: 'Pedir orçamento | Império Móveis Planejados Jaú SP' };
    document.title = titles[currentView];
  }, [currentView]);

  useEffect(() => {
    const onPop = () => setCurrentView(window.location.pathname.startsWith('/contato') ? 'contato' : 'home');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const handleNavigateContact = () => {
    playWoodChimeSound();
    setCurrentView('contato');
    window.history.pushState({}, '', '/contato');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    playWoodChimeSound();
    setCurrentView('home');
    window.history.pushState({}, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#fef8f4] text-[#1d1b19] font-sans-atelier selection:bg-[#c5a059] selection:text-white flex flex-col">
      {/* 1. Global Reading Progress Bar (Golden #c5a059 - Desktop only) */}
      <div
        ref={progressBarRef}
        className="hidden md:block fixed top-0 left-0 w-full h-[3px] bg-[#c5a059] z-[100] origin-left scale-x-0 pointer-events-none shadow-sm"
      />

      {/* 2. Smart Header with hide-on-scroll-down, reveal-on-scroll-up */}
      <Header
        headerRef={headerRef}
        onOpenVisitBooking={() => setIsVisitModalOpen(true)}
        onNavigateContact={handleNavigateContact}
        onNavigateHome={handleNavigateHome}
        currentView={currentView}
      />

      {/* 3. Main Content Views */}
      <main className={currentView === 'home' ? 'flex-1' : 'flex-1 pt-24 sm:pt-28'}>
        {currentView === 'contato' ? (
          <ContactQuotationPage onBackToHome={handleNavigateHome} />
        ) : (
          <>
            {/* Item 2: Hero Section (Line-by-line title reveal, light parallax card, image zoom, sequential seals) */}
            <Hero
              onNavigateContact={handleNavigateContact}
            />

            {/* Ambientes Planejados em Destaque */}
            <PortfolioGallery
              onNavigateContact={handleNavigateContact}
            />

            {/* Sobre Nós / Tradição & Compromisso em Jaú */}
            <SobreNosSection
              onOpenBooking={() => setIsVisitModalOpen(true)}
            />

            {/* Processo Sob Medida em 4 Etapas */}
            <ProcessoSection />

            {/* Floating Craftsmanship Tools Layer (Parafusadeira, Esquadro, Lápis e Fitas de Freijó) */}
            <CraftsmanshipScrollyLayer />

            {/* Avaliações Verificadas & Badge Google 5.0 */}
            <ReviewsSection />

            {/* Inspirações no Instagram (@imperio.moveis.jau) */}
            <InstagramFeedSection />

            {/* Onde Estamos: Marcenaria Própria em Jaú/SP com Mapa */}
            <WorkshopLocation
              onOpenVisitBooking={() => setIsVisitModalOpen(true)}
            />

            {/* FAQ: Perguntas Frequentes */}
            <FaqSection />

            {/* Banner CTA Final de Conversão */}
            <BannerCtaSection
              onNavigateContact={handleNavigateContact}
            />
          </>
        )}
      </main>

      {/* 4. Footer */}
      <Footer
        onNavigateContact={handleNavigateContact}
      />

      {/* 5. Floating WhatsApp Action Widget (Stitch design) */}
      <WhatsAppWidget />

      {/* 6. Technical Visit / Showroom Booking Modal */}
      <VisitBookingModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
      />
    </div>
  );
}
