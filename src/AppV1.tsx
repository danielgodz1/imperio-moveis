/**
 * Versão 1 do site (layout anterior), guardada em /v1 caso a Império queira voltar a ela.
 * Fora do Google (noindex no HTML de /v1). Toda a navegação interna fica debaixo de /v1.
 * Para voltar a usar a V1 na raiz: em App.tsx, trocar a condição de emV1.
 */

import React, { Suspense, useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroScrollytelling } from './components/heroScroll/HeroScrollytelling';
import { FaixaServicos } from './components/FaixaServicos';
import { Donos } from './components/Donos';
import { Obras } from './components/Obras';
import { ProcessoSection } from './components/ProcessoSection';
import { ChamadaProjeto3D } from './components/ChamadaProjeto3D';
import { Diferencial } from './components/Diferencial';
import { DOCUMENTOS_LEGAIS } from './data/legal';
import { ReviewsSection } from './components/ReviewsSection';
import { Fechamento } from './components/Fechamento';
import { BriefingOrcamento } from './components/BriefingOrcamento';
import { JsonLdSchema } from './components/JsonLdSchema';
import { Footer } from './components/Footer';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { AvisoProjeto3D } from './components/AvisoProjeto3D';
import { FiltroLapis, LinhaLapis } from './components/LinhaLapis';
import { ContactQuotationPage, PaginaAmbienteLocal, PaginaLegal, PaginaObras, PaginaProjetar, VisitBookingModal } from './paginasSobDemanda';
import { useNivel } from './vitrine/nivel';
import {
  METADADOS_ROTAS_SEO,
  PAGINAS_AMBIENTES_LOCAIS,
  RotaPublica,
} from './data/paginasLocais';


export const BASE_V1 = '/v1';

/** Endereço da V1 → rota interna (sem o /v1 da frente). */
function normalizarRota(pathname: string): RotaPublica {
  const semBase = pathname.startsWith(BASE_V1) ? pathname.slice(BASE_V1.length) : pathname;
  const limpa = semBase.replace(/\/+$/, '') || '/';
  if (limpa in METADADOS_ROTAS_SEO) {
    return limpa as RotaPublica;
  }
  return '/';
}

export default function AppV1({ headerRef }: { headerRef: React.RefObject<HTMLElement | null> }) {
  const [currentPath, setCurrentPath] = useState<RotaPublica>(() =>
    typeof window !== 'undefined' ? normalizarRota(window.location.pathname) : '/'
  );
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [briefingPainelAberto, setBriefingPainelAberto] = useState(false);
  const [briefingAmbienteInicial, setBriefingAmbienteInicial] = useState<
    string | undefined
  >(undefined);

  const nivel = useNivel();

  useEffect(() => {
    const meta = METADADOS_ROTAS_SEO[currentPath] ?? METADADOS_ROTAS_SEO['/'];
    document.title = meta.title;

    const descEl = document.querySelector('meta[name="description"]');
    if (descEl) {
      descEl.setAttribute('content', meta.description);
    }

    // A V1 não concorre com o site atual: o canônico aponta para a mesma página na raiz.
    const canonEl = document.querySelector('link[rel="canonical"]');
    if (canonEl) {
      canonEl.setAttribute('href', meta.canonical);
    }
    document.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex, follow');
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
    window.history.pushState({}, '', rota === '/' ? BASE_V1 : `${BASE_V1}${rota}`);
    // Troca de página vai direto ao topo (rolagem suave do rodapé até o início levava segundos).
    window.scrollTo({ top: 0, behavior: 'instant' });
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
      {/* Trocar de nível remonta o conteúdo, para cada seção iniciar no modo certo */}
      <main key={nivel} className="flex-1">
        {/* Páginas internas chegam sob demanda (ver paginasSobDemanda.ts) */}
        <Suspense fallback={<div className="min-h-screen" />}>
        {currentPath === '/contato' ? (
          <ContactQuotationPage
            onBackToHome={() => handleNavigateRoute('/')}
            ambienteInicial={briefingAmbienteInicial}
          />
        ) : currentPath === '/projetar' ? (
          <PaginaProjetar
            onVoltar={() => handleNavigateRoute('/')}
            onOpenBriefing={() => handleOpenBriefing('Outro')}
          />
        ) : currentPath === '/obras' ? (
          <PaginaObras onNavegar={handleNavigateRoute} onOpenBriefing={handleOpenBriefing} />
        ) : currentPath in DOCUMENTOS_LEGAIS ? (
          <PaginaLegal
            documento={DOCUMENTOS_LEGAIS[currentPath as keyof typeof DOCUMENTOS_LEGAIS]}
            onNavegar={handleNavigateRoute}
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
            <HeroScrollytelling onNavigateContact={() => handleOpenBriefing()} />

            {/* A única faixa em movimento do site, com os serviços reais */}
            <FaixaServicos />

            {/* Momento 2: a prova primeiro, com convite para orçamento logo depois */}
            <Obras onOpenBriefing={handleOpenBriefing} />

            {/* O diferencial dito com todas as letras: projeto de arquitetura incluso */}
            <Diferencial onOpenBriefing={() => handleOpenBriefing()} />

            {/* Momento 3: Do risco à obra em 4 passos */}
            <ProcessoSection />

            {/* Momento 4: convite para o 3D. O editor mora em /projetar e só carrega lá */}
            <ChamadaProjeto3D onAbrir={() => handleNavigateRoute('/projetar')} />

            {/* Avaliações */}
            <ReviewsSection />

            {/* Momento 5: Os donos */}
            <Donos />

            {/* Momento 6: Fechamento (CTA, perguntas curtas, onde estamos) */}
            <Fechamento
              onNavigateContact={() => handleOpenBriefing()}
              onOpenVisitBooking={() => setIsVisitModalOpen(true)}
            />
          </>
        )}
        </Suspense>
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

      {/* Botão flutuante: abre o pedido de orçamento (WhatsApp direto fica no painel) */}
      <WhatsAppWidget aguardarHero={currentPath === '/'} onAbrirOrcamento={() => handleOpenBriefing()} />

      {/* Lembrete do 3D online (uma vez por semana, fora da página do 3D) */}
      <AvisoProjeto3D rota={currentPath} onAbrir={() => handleNavigateRoute('/projetar')} />

      {/* Modal opcional de agendamento de visita */}
      {isVisitModalOpen && (
        <Suspense fallback={null}>
          <VisitBookingModal isOpen onClose={() => setIsVisitModalOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}
