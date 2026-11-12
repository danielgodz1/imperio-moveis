import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Star } from 'lucide-react';
import { Foto } from '../components/Foto';
import { AnotacoesObra } from '../components/AnotacoesObra';
import { BriefingOrcamento } from '../components/BriefingOrcamento';
import { OBRAS_REAIS } from '../data/portfolioData';
import { AVALIACOES_PUBLICADAS, LINK_PERFIL_GOOGLE, RESUMO_GOOGLE } from '../data/avaliacoesGoogle';
import { EMPRESA } from '../data/empresa';
import { getWhatsAppUrl, trackWhatsAppClick } from '../utils/helpers';
import { ComItalico } from './Serif';
import { MANIFESTO_V2, NUMEROS_V2, PROCESSO_V2 } from './textosV2';

gsap.registerPlugin(ScrollTrigger);

const reduzido = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const MARGEM = 'px-16 sm:px-32 lg:px-64';

const Titulo: React.FC<{ texto: string; className?: string; as?: 'h2' | 'h3' }> = ({ texto, className = '', as = 'h2' }) => {
  const Tag = as;
  return (
    <Tag className={`v2-serif v2-titulo ${className}`}>
      <ComItalico texto={texto} />
    </Tag>
  );
};

/** Capítulo 2: o manifesto acende palavra por palavra com a rolagem. */
export const ManifestoV2: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    if (!ref.current || reduzido()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-palavra]',
        { opacity: 0.14 },
        { opacity: 1, stagger: 0.06, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top 72%', end: 'bottom 55%', scrub: 0.6 } }
      );
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={ref} className={`v2-claro ${MARGEM} py-[18vh] lg:py-[24vh]`}>
      <p className="v2-cota mb-32">O que a gente acredita</p>
      <p className="v2-serif text-[clamp(2rem,4.6vw,4.25rem)] leading-[1.08] max-w-[22ch]">
        {MANIFESTO_V2.split(' ').map((palavra, i) => (
          <span key={i} data-palavra className="inline-block mr-[0.22em]">
            {palavra}
          </span>
        ))}
      </p>
    </section>
  );
};

/**
 * Capítulo 3: caderno de obra. Cada foto entra e os fios dourados saem de cada peça até o
 * acabamento usado nela (mesmas anotações da V1). Vertical: igual no celular e no computador.
 */
export const ObrasV2: React.FC = () => {
  const obras = OBRAS_REAIS.filter((o) => o.anotacoes && o.anotacoes.length > 0).slice(0, 5);
  return (
    <section id="v2-obras" className={`v2-claro ${MARGEM} py-[14vh]`}>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-24 mb-[10vh]">
        <Titulo texto="Obras que *já moram* em Jaú." className="max-w-[12ch]" />
        <p className="v2-corpo max-w-[40ch]">Fotos reais de casas e lojas reais. Os fios dourados mostram o acabamento de cada peça.</p>
      </div>
      <div className="flex flex-col gap-[14vh]">
        {obras.map((o, i) => (
          <article key={o.id} className={`grid grid-cols-1 lg:grid-cols-12 gap-32 lg:gap-64 items-center`}>
            <figure className={`lg:col-span-7 relative ${i % 2 ? 'lg:order-2' : ''}`} style={{ aspectRatio: o.proporcao }}>
              <Foto srcBase={o.arquivo} alt={o.alt} proporcao={o.proporcao} sizes="(min-width: 1024px) 56vw, 100vw" className="w-full h-full" imgStyle={{ objectFit: 'cover' }} />
              <AnotacoesObra anotacoes={o.anotacoes ?? []} />
            </figure>
            <div className={`lg:col-span-5 flex flex-col gap-16 ${i % 2 ? 'lg:order-1' : ''}`}>
              <span className="v2-serif v2-italico v2-acento text-[2.5rem] leading-none">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="v2-serif v2-h3">{o.titulo}</h3>
              <p className="v2-corpo max-w-[40ch]">{o.cota}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

/** O diferencial em números. Quieto: só tipografia e linhas. */
export const NumerosV2: React.FC = () => (
  <section className={`v2-salvia ${MARGEM} py-[16vh]`}>
    <Titulo texto="Arquitetura e marcenaria *na mesma mesa.*" className="max-w-[14ch]" />
    <dl className="mt-64 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t v2-linha-fina">
      {NUMEROS_V2.map((n) => (
        <div key={n.valor} className="py-32 lg:pr-32 border-b lg:border-b-0 v2-linha-fina flex flex-col gap-16">
          <dt className="v2-serif text-[clamp(3.5rem,6vw,5.5rem)] leading-none">{n.valor}</dt>
          <dd className="v2-cota max-w-[26ch]">{n.rotulo}</dd>
        </div>
      ))}
    </dl>
  </section>
);

/** Do risco à chave: quatro passos em lista editorial, numerais grandes em serifa. */
export const ProcessoV2: React.FC = () => (
  <section id="v2-processo" className={`v2-claro ${MARGEM} py-[14vh] grid grid-cols-1 lg:grid-cols-12 gap-48`}>
    <div className="lg:col-span-5 lg:sticky lg:top-[18vh] self-start flex flex-col gap-24">
      <Titulo texto="Do risco *à chave na mão.*" />
      <p className="v2-corpo max-w-[36ch]">Uma equipe só cuida de tudo. Você não precisa coordenar arquiteto, marceneiro e montador.</p>
    </div>
    <ol className="lg:col-span-7 flex flex-col">
      {PROCESSO_V2.map((p) => (
        <li key={p.numero} className="grid grid-cols-[72px_1fr] sm:grid-cols-[120px_1fr] gap-16 py-48 border-t v2-linha-fina">
          <span className="v2-serif v2-italico v2-acento text-[clamp(2.5rem,5vw,4rem)] leading-none">{p.numero}</span>
          <div className="flex flex-col gap-8">
            <h3 className="v2-serif v2-h3">{p.titulo}</h3>
            <p className="v2-corpo max-w-[40ch]">{p.texto}</p>
          </div>
        </li>
      ))}
    </ol>
  </section>
);

/** Convite para o 3D online (abre a página /projetar, que já existe). */
export const Projeto3DV2: React.FC<{ onAbrir: () => void }> = ({ onAbrir }) => (
  <section className={`v2-escuro ${MARGEM} py-[14vh] grid grid-cols-1 lg:grid-cols-12 gap-48 items-center`}>
    <div className="lg:col-span-5 flex flex-col gap-24 lg:order-2">
      <Titulo texto="Veja a sua cozinha *antes de ela existir.*" />
      <p className="v2-corpo max-w-[40ch]">Monte o ambiente em 3D aqui no site, de graça. Mude medidas, cores e a luz. Depois mande a imagem para a gente orçar.</p>
      <div>
        <a
          href="/projetar"
          onClick={(e) => {
            e.preventDefault();
            onAbrir();
          }}
          className="v2-botao v2-botao-claro"
        >
          Projetar em 3D <ArrowUpRight className="w-[18px] h-[18px]" strokeWidth={1.5} />
        </a>
      </div>
    </div>
    <a
      href="/projetar"
      onClick={(e) => {
        e.preventDefault();
        onAbrir();
      }}
      className="lg:col-span-7 lg:order-1 block overflow-hidden group"
      aria-label="Abrir o projeto 3D online"
    >
      <Foto
        srcBase="/projetar/cozinha-render"
        alt="Projeto 3D de cozinha planejada com ilha verde e armários brancos"
        proporcao="16 / 9"
        sizes="(min-width: 1024px) 58vw, 100vw"
        className="w-full transition-transform duration-[1.2s] group-hover:scale-[1.02]"
      />
    </a>
  </section>
);

/** Avaliações reais do Google, como citações grandes. */
export const AvaliacoesV2: React.FC = () => (
  <section className={`v2-claro ${MARGEM} py-[14vh]`}>
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-24">
      <Titulo texto="Quem já mora *numa Império.*" className="max-w-[12ch]" />
      <a href={LINK_PERFIL_GOOGLE} target="_blank" rel="noopener noreferrer" className="v2-cota flex items-center gap-8 hover:text-[var(--v2-texto)]">
        <Star className="w-[14px] h-[14px] fill-[var(--v2-acento)] text-[var(--v2-acento)]" />
        {String(RESUMO_GOOGLE.nota).replace('.', ',')} no Google, {RESUMO_GOOGLE.total} avaliações
      </a>
    </div>
    <ul className="mt-64 grid grid-cols-1 lg:grid-cols-2 gap-x-64">
      {AVALIACOES_PUBLICADAS.map((a, i) => (
        <li key={i} className="py-32 border-t v2-linha-fina flex flex-col gap-16">
          <blockquote className="v2-serif text-[clamp(1.4rem,2.2vw,1.9rem)] leading-[1.2]">“{a.texto.trim()}”</blockquote>
          <p className="v2-cota">
            {a.autor}, avaliação no Google
          </p>
        </li>
      ))}
    </ul>
  </section>
);

/** Nossa história: aqui (e só aqui) os nomes dos donos. */
export const HistoriaV2: React.FC = () => (
  <section id="v2-historia" className={`v2-salvia ${MARGEM} py-[14vh] grid grid-cols-1 lg:grid-cols-12 gap-48 items-center`}>
    <div className="lg:col-span-5">
      <Foto srcBase="/obras/fundadores" alt="Wellington e Tatiane Cabral, fundadores da Império Móveis Planejados" proporcao="666 / 1178" sizes="(min-width: 1024px) 36vw, 100vw" className="w-full max-h-[78vh] grayscale" imgStyle={{ objectFit: 'cover' }} />
    </div>
    <div className="lg:col-span-6 lg:col-start-7 flex flex-col gap-32">
      <Titulo texto="Feito por mãos que *medem duas vezes.*" />
      <p className="v2-corpo">
        A Império nasceu em Jaú, em 2015, quando o <span className="text-[var(--v2-texto)]">Wellington Cabral</span>, marceneiro desde cedo, decidiu que não queria só seguir o padrão. A <span className="text-[var(--v2-texto)]">Tatiane Cabral</span>, arquiteta e designer de interiores, trouxe o projeto para dentro da oficina.
      </p>
      <p className="v2-corpo">Hoje, quem desenha e quem fabrica trabalham lado a lado. É por isso que o projeto de arquitetura vem junto, sem custo à parte.</p>
      <p className="v2-serif v2-italico text-[1.6rem] leading-tight">“Cada detalhe com a cara de quem vai morar ali.”</p>
    </div>
  </section>
);

/** Fechamento: frase grande, formulário num cartão marfim e o contato direto. */
export const FechamentoV2: React.FC = () => (
  <section id="v2-orcamento" className={`v2-escuro ${MARGEM} py-[14vh] grid grid-cols-1 lg:grid-cols-12 gap-48`}>
    <div className="lg:col-span-5 flex flex-col gap-24">
      <h2 className="v2-serif v2-display">
        <ComItalico texto="Vamos construir *o seu?*" />
      </h2>
      <p className="v2-corpo max-w-[38ch]">Conte o que você quer planejar. A gente responde pelo WhatsApp com os próximos passos.</p>
      <a
        href={getWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsAppClick('v2_fechamento')}
        className="v2-cota hover:text-[var(--v2-texto)] self-start underline underline-offset-4"
      >
        Prefere falar direto? WhatsApp {EMPRESA.telefone}
      </a>
    </div>
    <div className="lg:col-span-7 bg-[var(--v2-marfim)] text-[#1B1915] p-24 sm:p-48">
      <BriefingOrcamento modo="inline" />
    </div>
  </section>
);

/** Rodapé enxuto. */
export const RodapeV2: React.FC<{ onRota: (r: string) => void }> = ({ onRota }) => {
  const link = (rota: string, rotulo: string) => (
    <a
      href={rota}
      onClick={(e) => {
        e.preventDefault();
        onRota(rota);
      }}
      className="v2-cota hover:text-[var(--v2-texto)]"
    >
      {rotulo}
    </a>
  );
  return (
    <footer className={`v2-escuro ${MARGEM} pt-96 pb-48 border-t v2-linha-fina`}>
      <p className="v2-serif text-[clamp(4rem,14vw,12rem)] leading-[0.85] tracking-[-0.02em]">Império</p>
      <div className="mt-48 flex flex-col sm:flex-row sm:flex-wrap gap-x-32 gap-y-16 justify-between">
        <p className="v2-cota max-w-[44ch]">
          {EMPRESA.endereco.logradouro}, {EMPRESA.endereco.bairro}, {EMPRESA.endereco.cidade}/{EMPRESA.endereco.uf}. WhatsApp {EMPRESA.telefone}.
        </p>
        <nav aria-label="Rodapé" className="flex flex-wrap gap-x-24 gap-y-8">
          {link('/projetar', 'Projetar em 3D')}
          {link('/contato', 'Contato e suporte')}
          {link('/privacidade', 'Privacidade (LGPD)')}
          {link('/termos', 'Termos de uso')}
          <a href={EMPRESA.instagramUrl} target="_blank" rel="noopener noreferrer" className="v2-cota hover:text-[var(--v2-texto)]">
            {EMPRESA.instagram}
          </a>
        </nav>
      </div>
      <p className="v2-cota mt-32 text-[var(--v2-suave)]/70">© {new Date().getFullYear()} {EMPRESA.nome}. Versão 2, em prévia.</p>
    </footer>
  );
};
