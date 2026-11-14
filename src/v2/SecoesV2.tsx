import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Box, Check, ExternalLink, MapPin, Minus, Star } from 'lucide-react';
import { Foto } from '../components/Foto';
import { AnotacoesObra } from '../components/AnotacoesObra';
import { BriefingOrcamento } from '../components/BriefingOrcamento';
import { OBRAS_REAIS } from '../data/portfolioData';
import { AVALIACOES_PUBLICADAS, LINK_PERFIL_GOOGLE, RESUMO_GOOGLE } from '../data/avaliacoesGoogle';
import { EMPRESA } from '../data/empresa';
import { getWhatsAppUrl, trackWhatsAppClick } from '../utils/helpers';
import { ComItalico } from './Serif';
import { ChamadaOrcamentoV2, MARGEM } from './CromoV2';
import { LinkV2, useNavV2 } from './NavegacaoV2';
import { caminhoFoto } from './rotasV2';
import { MANIFESTO_V2, NUMEROS_V2, PROJETO_INCLUSO_V2, PASSOS_3D_V2 } from './textosV2';
import { perguntasConfirmadas } from '../data/perguntas';

gsap.registerPlugin(ScrollTrigger);

const reduzido = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Título de seção. `olho`: linha pequena dentro do título com as palavras que o Google procura. */
export const Titulo: React.FC<{ texto: string; className?: string; as?: 'h1' | 'h2' | 'h3'; olho?: string }> = ({ texto, className = '', as = 'h2', olho }) => {
  const Tag = as;
  return (
    <Tag className={`v2-serif v2-titulo ${className}`}>
      {olho && <span className="v2-olho block mb-16">{olho}</span>}
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

/** Cartão de obra da galeria: foto, título e cota; abre a página da foto. */
export const CartaoObraV2: React.FC<{ obra: (typeof OBRAS_REAIS)[number]; sizes?: string }> = ({ obra, sizes = '(max-width: 639px) 60vw, (min-width: 1024px) 30vw, 50vw' }) => (
  <LinkV2 para={caminhoFoto(obra)} className="group flex flex-col gap-16" aria-label={`Ver a obra: ${obra.titulo}`}>
    <span className="block overflow-hidden" style={{ aspectRatio: obra.proporcao }}>
      <Foto
        srcBase={obra.arquivo}
        alt={obra.alt}
        proporcao={obra.proporcao}
        sizes={sizes}
        className="w-full h-full transition-transform duration-[1.2s] group-hover:scale-[1.03]"
        imgStyle={{ objectFit: 'cover' }}
      />
    </span>
    <span className="flex items-start justify-between gap-16">
      <span className="flex flex-col gap-4">
        <span className="v2-serif text-[1.5rem] leading-tight">{obra.titulo}</span>
        <span className="v2-cota">{obra.cota}</span>
      </span>
      <ArrowUpRight className="w-[20px] h-[20px] shrink-0 mt-4 v2-acento transition-transform group-hover:-translate-y-[2px] group-hover:translate-x-[2px]" strokeWidth={1.5} />
    </span>
  </LinkV2>
);

/** Temas de obra mostrados na home (cada um abre a seção dele em /obras). */
const TEMAS_OBRA_HOME: { id: (typeof OBRAS_REAIS)[number]['ambiente']; rotulo: string; capa: string }[] = [
  { id: 'cozinhas', rotulo: 'Cozinhas', capa: 'cozinha-ilha-ripado' },
  { id: 'quartos', rotulo: 'Quartos', capa: 'quarto-infantil-casinha' },
  { id: 'lojas', rotulo: 'Lojas e comércio', capa: 'comercial-gocoffee-interior' },
];

/** Obra grande da home: diferente da cozinha que fecha a abertura (cozinha-gringa-4k). */
const DESTAQUE_HOME = 'cozinha-forro-ripado';

/**
 * Capítulo 3: caderno de obra, curto. Uma obra grande com os fios dourados do acabamento,
 * um cartão por ambiente (levando à seção dele em /obras) e o botão para ver todas.
 * As outras fotos ficam em /obras, para a home não virar uma rolagem só de fotos.
 */
export const ObrasV2: React.FC = () => {
  const destaque = OBRAS_REAIS.find((o) => o.id === DESTAQUE_HOME) ?? OBRAS_REAIS[0];
  const temas = TEMAS_OBRA_HOME.map((t) => {
    const doTema = OBRAS_REAIS.filter((o) => o.ambiente === t.id);
    return { ...t, total: doTema.length, capa: doTema.find((o) => o.id === t.capa) ?? doTema[0] };
  }).filter((t) => t.capa);
  return (
    <section id="v2-obras" className={`v2-claro ${MARGEM} py-[14vh]`}>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-24 mb-64">
        <Titulo texto="Obras que *já moram* em Jaú." className="max-w-[12ch]" />
        <p className="v2-corpo max-w-[40ch] lg:text-right">Fotos reais de casas e lojas reais. Os fios dourados mostram o acabamento de cada peça.</p>
      </div>

      <article className="grid grid-cols-1 lg:grid-cols-12 gap-32 lg:gap-64 items-center">
        <figure className="lg:col-span-7 relative" style={{ aspectRatio: destaque.proporcao }}>
          <LinkV2 para={caminhoFoto(destaque)} className="block w-full h-full" aria-label={`Ver a obra: ${destaque.titulo}`}>
            <Foto srcBase={destaque.arquivo} alt={destaque.alt} proporcao={destaque.proporcao} sizes="(min-width: 1024px) 56vw, 100vw" className="w-full h-full" imgStyle={{ objectFit: 'cover' }} />
          </LinkV2>
          <AnotacoesObra anotacoes={destaque.anotacoes ?? []} />
        </figure>
        <div className="lg:col-span-5 flex flex-col items-start gap-16">
          <p className="v2-cota uppercase tracking-[0.08em] v2-acento">Obra em destaque</p>
          <h3 className="v2-serif v2-h3">{destaque.titulo}</h3>
          <p className="v2-corpo max-w-[40ch]">{destaque.cota}</p>
          <LinkV2 para={caminhoFoto(destaque)} className="v2-cota underline underline-offset-4 hover:text-[var(--v2-texto)]">
            Ver esta obra em detalhe
          </LinkV2>
        </div>
      </article>

      <div className="mt-[12vh] flex flex-col gap-32">
        <h3 className="v2-serif v2-h3">
          <ComItalico texto="Escolha o ambiente *e veja as obras.*" />
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-16 lg:gap-32">
          {temas.map((t) => (
            <li key={t.id}>
              <LinkV2 para={`/obras#${t.id}`} className="group relative block overflow-hidden aspect-[4/5] sm:aspect-[3/4]" aria-label={`Ver obras de ${t.rotulo.toLowerCase()} (${t.total})`}>
                <Foto
                  srcBase={t.capa!.arquivo}
                  alt={t.capa!.alt}
                  proporcao={t.capa!.proporcao}
                  sizes="(max-width: 639px) 60vw, 30vw"
                  className="absolute inset-0 w-full h-full transition-transform duration-[1.2s] group-hover:scale-[1.04]"
                  imgStyle={{ objectFit: 'cover', aspectRatio: 'auto' }}
                />
                <span className="absolute inset-0 bg-gradient-to-t from-[#0b0a08]/85 via-[#0b0a08]/10 to-transparent" aria-hidden="true" />
                <span className="absolute inset-x-0 bottom-0 p-24 flex items-end justify-between gap-16 text-[#F4EFE6]">
                  <span className="flex flex-col gap-4">
                    <span className="v2-serif text-[2rem] leading-none">{t.rotulo}</span>
                    <span className="text-[0.875rem] opacity-85">
                      {t.total} {t.total === 1 ? 'obra' : 'obras'}
                    </span>
                  </span>
                  <span className="w-[44px] h-[44px] shrink-0 rounded-full bg-[#F4EFE6] text-[#1B1915] flex items-center justify-center transition-transform group-hover:-translate-y-[2px] group-hover:translate-x-[2px]" aria-hidden="true">
                    <ArrowUpRight className="w-[20px] h-[20px]" strokeWidth={1.5} />
                  </span>
                </span>
              </LinkV2>
            </li>
          ))}
        </ul>
        <div className="flex flex-col sm:flex-row sm:items-center gap-16 pt-16">
          <LinkV2 para="/obras" className="v2-botao v2-botao-claro h-[56px] px-32 text-[1.0625rem] justify-center">
            Ver todas as {OBRAS_REAIS.length} obras <ArrowUpRight className="w-[20px] h-[20px]" strokeWidth={1.5} />
          </LinkV2>
          <LinkV2 para="/projetos-3d" className="v2-botao v2-botao-linha h-[56px] px-24 justify-center">
            <Box className="w-[18px] h-[18px]" strokeWidth={1.5} /> Ver projetos 3D
          </LinkV2>
        </div>
      </div>
    </section>
  );
};

const AMBIENTES_CATALOGO_SEO = [
  {
    id: 'cozinhas',
    titulo: 'Cozinhas Planejadas Sob Medida em Jaú',
    rota: '/cozinhas-planejadas-jau',
    briefing: 'Cozinha',
    texto:
      'Projetamos e fabricamos cozinhas planejadas 100% MDF em Jaú com ilha central em ripado ou pedra, torre quente ventilada para forno e micro-ondas, armários superiores até o teto e gabinetes inferiores em MDF naval (hidrófugo) resistente à umidade. Incluímos porta-temperos, perfis puxadores em alumínio, iluminação linear em LED quente e ferragens com amortecimento slow motion (corrediças telescópicas ou ocultas).',
  },
  {
    id: 'closets',
    titulo: 'Dormitórios, Guarda-Roupas e Closets Planejados',
    rota: '/closets-sob-medida-jau',
    briefing: 'Closet',
    texto:
      'Guarda-roupas até o teto e closets sob medida em L, em U ou corredor com portas de correr com amortecimento, portas em vidro reflecta bronze/fumê, sapateiras telescópicas de extração total, cabideiros iluminados por fita de LED e gavetas com divisórias em veludo para joias e relógios. Também executamos quartos de casal com cabeceira ripada e quartos infantis/bebê sob medida.',
  },
  {
    id: 'salas',
    titulo: 'Salas de Estar, Painéis Ripados de TV e Home Theater',
    rota: '/quartos-planejados-jau',
    briefing: 'Sala',
    texto:
      'Painéis ripados autênticos em MDF amadeirado (Freijó, Nogueira, Carvalho) do piso ao forro com passagem oculta de cabos, racks suspensos com gavetões chanfrados, portas mimetizadas (invisíveis) no painel e cristaleiras iluminadas em LED com prateleiras de vidro e perfil metálico.',
  },
  {
    id: 'gourmet',
    titulo: 'Móveis Planejados para Área Gourmet, Churrasqueira e Lavanderia',
    rota: '/cozinhas-planejadas-jau',
    briefing: 'Área Gourmet',
    texto:
      'Marcenaria sob medida dimensionada para suportar calor e umidade ao redor da churrasqueira e da piscina: gabinetes em MDF naval hidrófugo, portas com respiro técnico, gaveteiros de talheres sob medida, nichos para cervejeira e adega climatizada, além de lavanderias planejadas com armários para vassouras, cesto basculante e bancada de apoio.',
  },
  {
    id: 'banheiros',
    titulo: 'Banheiros e Lavabos Planejados',
    rota: '/quartos-planejados-jau',
    briefing: 'Banheiro',
    texto:
      'Gabinetes sob medida 100% MDF naval com fitamento de borda em PVC colado a quente para máxima proteção contra vapor e água, tulhas deslizantes, nichos organizadores e espelheiras até o teto com iluminação frontal ou indireta em LED.',
  },
  {
    id: 'corporativo',
    titulo: 'Móveis Planejados Corporativos, Escritórios, Clínicas e Lojas em Jaú',
    rota: '/home-office-planejado-jau',
    briefing: 'Comercial',
    texto:
      'Marcenaria comercial e corporativa de alto padrão em Jaú e região: balcões de recepção, estações de trabalho ergonômicas com calhas ocultas de energia, salas de reunião, consultórios médicos e odontológicos dentro das normas sanitárias, escritórios de advocacia, cafeterias e expositores comerciais iluminados.',
  },
] as const;

/**
 * Catálogo semântico completo dos 6 ambientes 100% MDF sob medida em Jaú (H2 -> H3).
 */
export const CatalogoAmbientesSeoV2: React.FC = () => {
  const { abrirOrcamento } = useNavV2();
  return (
    <section id="ambientes" className={`v2-areia ${MARGEM} py-[14vh] flex flex-col gap-48`}>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-24">
        <div className="flex flex-col gap-16">
          <p className="v2-cota uppercase tracking-[0.08em] v2-acento">Marcenaria própria em Jaú/SP</p>
          <Titulo texto="Ambientes Planejados 100% MDF *Sob Medida em Jaú.*" className="max-w-[20ch]" />
        </div>
        <p className="v2-corpo max-w-[44ch]">
          Fabricamos com chapas 100% MDF de 15mm, 18mm e 25mm, MDF naval hidrófugo para áreas úmidas e ferragens com amortecimento slow motion.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-24 lg:gap-32">
        {AMBIENTES_CATALOGO_SEO.map((item) => (
          <article
            key={item.id}
            id={item.id}
            className="scroll-mt-[88px] p-24 sm:p-32 bg-[var(--v2-cartao)] border v2-linha-fina flex flex-col justify-between gap-24"
          >
            <div className="flex flex-col gap-16">
              <h3 className="v2-serif text-[1.6rem] leading-tight">{item.titulo}</h3>
              <p className="v2-corpo text-[0.95rem]">{item.texto}</p>
            </div>
            <div className="pt-16 border-t v2-linha-fina flex flex-wrap items-center justify-between gap-12">
              <LinkV2 para={item.rota} className="v2-cota underline underline-offset-4 hover:text-[var(--v2-texto)]">
                Ver fotos e detalhes
              </LinkV2>
              <button
                type="button"
                onClick={() => abrirOrcamento(item.briefing)}
                className="v2-cota v2-acento font-[500] hover:underline underline-offset-4 cursor-pointer"
              >
                Orçar este ambiente →
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

/**
 * O diferencial dito com todas as letras: o projeto de arquitetura vem junto. Primeiro a
 * comparação com o jeito comum; depois, item por item, o que o projeto inclui.
 */
export const ProjetoInclusoV2: React.FC = () => {
  const { abrirOrcamento } = useNavV2();
  return (
    <section id="v2-projeto-incluso" className={`v2-claro ${MARGEM} py-[14vh]`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-48">
        <div className="lg:col-span-5 flex flex-col items-start gap-24">
          <p className="v2-cota uppercase tracking-[0.08em] v2-acento">Sem custo à parte</p>
          <Titulo texto="O projeto de arquitetura *já vem junto.*" />
          <p className="v2-corpo max-w-[38ch]">
            Na maioria dos lugares você paga um profissional para projetar e outro para fabricar. Aqui é uma coisa só: a arquiteta desenha e a nossa oficina fabrica, na mesma conversa.
          </p>
          <div className="flex flex-wrap items-center gap-x-24 gap-y-16">
            <button type="button" onClick={() => abrirOrcamento()} className="v2-botao v2-botao-claro">
              Pedir orçamento com projeto <ArrowUpRight className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </button>
            <LinkV2 para="/#v2-processo" className="v2-cota underline underline-offset-4 hover:text-[var(--v2-texto)]">
              Ver como funciona, passo a passo
            </LinkV2>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="hidden sm:grid grid-cols-2 gap-32 pb-16 border-b v2-linha-forte">
            <span className="v2-cota">Do jeito comum</span>
            <span className="v2-cota text-[var(--v2-texto)]">Na Império</span>
          </div>
          <ul className="flex flex-col">
            {PROJETO_INCLUSO_V2.comparacao.map((l) => (
              <li key={l.imperio} className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-32 py-24 border-b v2-linha-fina">
                <p className="flex items-start gap-8 v2-corpo">
                  <Minus className="w-[18px] h-[18px] mt-[4px] shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  <span>
                    <span className="sr-only">Do jeito comum: </span>
                    {l.comum}
                  </span>
                </p>
                <p className="flex items-start gap-8 text-[1rem] leading-[1.6] text-[var(--v2-texto)] font-[450]">
                  <Check className="w-[18px] h-[18px] mt-[4px] shrink-0 v2-acento" strokeWidth={2} aria-hidden="true" />
                  <span>
                    <span className="sr-only">Na Império: </span>
                    {l.imperio}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </div>
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

/**
 * Como trabalhamos: os seis passos, uma lista só.
 * Título fixo à esquerda; à direita, numerais grandes e um fio de latão que desce com a rolagem.
 */
export const ProcessoV2: React.FC = () => {
  const listaRef = useRef<HTMLOListElement>(null);
  const fioRef = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    if (!listaRef.current || !fioRef.current || reduzido()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        fioRef.current,
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: listaRef.current, start: 'top 70%', end: 'bottom 60%', scrub: 0.4 } }
      );
    });
    return () => ctx.revert();
  }, []);
  return (
    <section id="v2-processo" className={`v2-claro ${MARGEM} py-[14vh] grid grid-cols-1 lg:grid-cols-12 gap-48`}>
      <div className="lg:col-span-5 lg:sticky lg:top-[18vh] self-start flex flex-col gap-24">
        <p className="v2-cota uppercase tracking-[0.08em] v2-acento">Como trabalhamos</p>
        <Titulo texto="Da primeira conversa *à montagem na sua casa.*" />
        <p className="v2-corpo max-w-[38ch]">
          Uma equipe só cuida de tudo. A gente mede a sua casa como ela está hoje, e o projeto se encaixa nela. Você não precisa coordenar arquiteto, marceneiro e montador.
        </p>
      </div>
      <ol ref={listaRef} className="lg:col-span-7 relative flex flex-col pl-24 sm:pl-32">
        <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-px bg-[var(--v2-linha)]" />
        <span ref={fioRef} aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-[2px] -ml-[0.5px] bg-[var(--v2-acento)] origin-top" />
        {PROJETO_INCLUSO_V2.itens.map((p, i) => (
          <li key={p.titulo} className={`grid grid-cols-[64px_1fr] sm:grid-cols-[112px_1fr] gap-16 py-[40px] ${i ? 'border-t v2-linha-fina' : ''}`}>
            <span className="v2-serif v2-italico v2-acento text-[clamp(2.5rem,5vw,4rem)] leading-none">{String(i + 1).padStart(2, '0')}</span>
            <div className="flex flex-col gap-8">
              <h3 className="v2-serif v2-h3">{p.titulo}</h3>
              <p className="v2-corpo max-w-[42ch]">{p.texto}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};

/**
 * Diferencial do Notebook 3D e convite para o Configurador 3D online (#projetos / #v2-3d).
 */
export const Projeto3DV2: React.FC = () => {
  const { abrirOrcamento } = useNavV2();
  return (
    <section id="projetos" className={`v2-escuro ${MARGEM} py-[14vh] flex flex-col gap-64 scroll-mt-[72px]`}>
      <span id="v2-3d" className="sr-only" aria-hidden="true" />
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-24">
        <div className="flex flex-col gap-24">
          <p className="v2-cota uppercase tracking-[0.08em] v2-acento flex items-center gap-8">
            <Box className="w-[14px] h-[14px]" strokeWidth={1.5} /> Apresentação 3D no notebook + Simulador online grátis
          </p>
          <Titulo texto="Do Projeto 3D Realista no Notebook *à Execução Milimétrica na Sua Casa em Jaú*" className="max-w-[20ch]" />
        </div>
        <p className="v2-corpo max-w-[44ch]">
          Antes de qualquer chapa de MDF ser cortada na nossa marcenaria no Jardim Itamarati, você visualiza no projeto 3D realista a iluminação em perfil de LED, a paginação contínua dos veios do MDF, as divisórias internas de gavetas e o giro de cada porta.
        </p>
      </div>

      <LinkV2 para="/projetar" className="block overflow-hidden group relative" aria-label="Abrir o projeto 3D online">
        <Foto
          srcBase="/projetar/cozinha-render"
          alt="Projeto 3D realista de cozinha planejada sob medida 100% MDF em Jaú SP com ilha verde-sálvia e armários até o teto - Império Móveis Planejados"
          proporcao="16 / 9"
          sizes="100vw"
          className="w-full transition-transform duration-[1.2s] group-hover:scale-[1.02]"
        />
        <span className="absolute left-16 bottom-16 sm:left-32 sm:bottom-32 v2-botao v2-botao-claro">
          Começar meu projeto 3D <ArrowUpRight className="w-[18px] h-[18px]" strokeWidth={1.5} />
        </span>
      </LinkV2>

      <ol className="grid grid-cols-1 md:grid-cols-3 gap-x-32">
        {PASSOS_3D_V2.map((p, i) => (
          <li key={p.titulo} className="py-32 border-t v2-linha-fina flex flex-col gap-8">
            <span className="v2-serif v2-italico v2-acento text-[2rem] leading-none">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="v2-serif text-[1.5rem] leading-tight">{p.titulo}</h3>
            <p className="v2-corpo">{p.texto}</p>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-[12px]">
        <LinkV2 para="/projetar" className="v2-botao v2-botao-claro">
          <Box className="w-[16px] h-[16px]" strokeWidth={1.5} /> Projetar em 3D agora
        </LinkV2>
        <LinkV2 para="/projetos-3d" className="v2-botao v2-botao-linha">
          Ver projetos 3D prontos <ArrowUpRight className="w-[18px] h-[18px]" strokeWidth={1.5} />
        </LinkV2>
        <button type="button" onClick={() => abrirOrcamento()} className="v2-botao v2-botao-linha">
          Solicitar Projeto 3D e Orçamento em Jaú
        </button>
      </div>
    </section>
  );
};

interface AvaliacaoV2 {
  autor: string;
  autorUrl?: string;
  foto?: string;
  nota: number;
  texto: string;
  quando: string;
}

const decimal = (n: number) => n.toFixed(1).replace('.', ',');

const Estrelas: React.FC<{ nota: number; tamanho?: number }> = ({ nota, tamanho = 16 }) => (
  <span role="img" className="flex items-center gap-[2px]" aria-label={`${decimal(nota)} de 5 estrelas`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        aria-hidden="true"
        style={{ width: tamanho, height: tamanho }}
        className={i <= Math.round(nota) ? 'fill-[#d4a548] text-[#d4a548]' : 'text-[var(--v2-linha)]'}
        strokeWidth={1.5}
      />
    ))}
  </span>
);

/**
 * Avaliações reais do Google em cartões lado a lado, com estrelas.
 */
export const AvaliacoesV2: React.FC = () => {
  const [ao, setAo] = useState<{ nota: number; total: number; url?: string; avaliacoes: AvaliacaoV2[] } | null>(null);
  useEffect(() => {
    let ativo = true;
    fetch('/api/avaliacoes')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (ativo && d && d.total > 0) setAo(d);
      })
      .catch(() => undefined);
    return () => {
      ativo = false;
    };
  }, []);
  const nota = ao?.nota ?? RESUMO_GOOGLE.nota;
  const total = ao?.total ?? RESUMO_GOOGLE.total;
  const link = ao?.url ?? LINK_PERFIL_GOOGLE;
  const lista: AvaliacaoV2[] = ao?.avaliacoes.length ? ao.avaliacoes : AVALIACOES_PUBLICADAS;

  return (
    <section id="v2-avaliacoes" className={`v2-areia ${MARGEM} py-[14vh] flex flex-col gap-48`}>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-32">
        <Titulo texto="Quem já mora *numa Império.*" className="max-w-[12ch]" />
        <div className="flex flex-col gap-16 lg:items-end">
          <div className="flex items-center gap-16">
            <span className="v2-serif text-[4.5rem] leading-none">{decimal(nota)}</span>
            <span className="flex flex-col gap-4">
              <Estrelas nota={nota} tamanho={20} />
              <span className="v2-cota">
                {total} avaliações no Google{!ao && ` (em ${RESUMO_GOOGLE.conferidoEm})`}
              </span>
            </span>
          </div>
          <div className="flex flex-wrap gap-[12px]">
            <a href={link} target="_blank" rel="noopener noreferrer" className="v2-botao v2-botao-linha h-[44px]">
              Ver no Google <ExternalLink className="w-[16px] h-[16px]" strokeWidth={1.5} />
            </a>
            <a href={link} target="_blank" rel="noopener noreferrer" className="v2-botao h-[44px] underline underline-offset-4">
              Avaliar a Império
            </a>
          </div>
        </div>
      </div>

      <div
        className={`flex gap-16 overflow-x-auto snap-x snap-mandatory -mx-16 px-16 sm:-mx-32 sm:px-32 pb-8 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-2 md:gap-24 md:overflow-visible ${
          lista.length === 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'
        }`}
      >
        {lista.slice(0, 6).map((a, i) => (
          <article key={i} className="min-w-[85%] snap-start md:min-w-0 p-24 rounded-[20px] bg-[var(--v2-cartao)] border v2-linha-fina flex flex-col justify-between gap-24">
            <div className="flex flex-col gap-16">
              <div className="flex items-center justify-between gap-8">
                <Estrelas nota={a.nota} />
                <span className="v2-cota">{a.quando}</span>
              </div>
              <p className="text-[1rem] leading-[1.65] font-[350] text-[var(--v2-texto)] line-clamp-[8] whitespace-pre-line">“{a.texto.trim()}”</p>
            </div>
            <div className="pt-16 border-t v2-linha-fina flex items-center gap-[12px]">
              {a.foto ? (
                <img
                  src={a.foto}
                  alt={`Foto de ${a.autor}, cliente de móveis planejados da Império em Jaú SP`}
                  width={36}
                  height={36}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-[36px] h-[36px] rounded-full"
                />
              ) : (
                <span aria-hidden="true" className="w-[36px] h-[36px] rounded-full bg-[var(--v2-salvia)] text-[#f3efe6] flex items-center justify-center v2-serif text-[1.1rem]">
                  {a.autor.trim().charAt(0)}
                </span>
              )}
              <span className="flex flex-col">
                <a href={a.autorUrl ?? link} target="_blank" rel="noopener noreferrer" className="text-[0.9375rem] font-[500] text-[var(--v2-texto)] hover:underline underline-offset-4">
                  {a.autor}
                </a>
                <span className="v2-cota">Avaliação publicada no Google</span>
              </span>
            </div>
          </article>
        ))}
      </div>

      <ChamadaOrcamentoV2 texto="Quer ser *a próxima casa* desta lista?" />
    </section>
  );
};

/** Nossa história: aqui os nomes dos fundadores Wellington e Tatiane Cabral. */
export const HistoriaV2: React.FC = () => (
  <section id="v2-historia" className={`v2-salvia ${MARGEM} py-[14vh] grid grid-cols-1 lg:grid-cols-12 gap-48 items-center`}>
    <div className="lg:col-span-5">
      <Foto
        srcBase="/obras/fundadores"
        alt="Wellington Ribeiro Cabral e Tatiane Cabral, fundadores da fábrica Império Móveis Planejados em Jaú SP"
        proporcao="666 / 1178"
        sizes="(min-width: 1024px) 36vw, 100vw"
        className="w-full max-h-[78vh] grayscale"
        imgStyle={{ objectFit: 'cover' }}
      />
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

/**
 * Parceria com Arquitetos, Engenheiros e Designers de Interiores em Jaú e Fidelidade Técnica.
 */
export const ArquitetosFidelidadeV2: React.FC = () => {
  const { abrirOrcamento } = useNavV2();
  return (
    <section id="arquitetos" className={`v2-claro ${MARGEM} py-[12vh] grid grid-cols-1 lg:grid-cols-12 gap-48 items-center border-t v2-linha-fina`}>
      <div className="lg:col-span-6 flex flex-col gap-24">
        <p className="v2-cota uppercase tracking-[0.08em] v2-acento">Fidelidade executiva e parceria técnica</p>
        <Titulo texto="Execução Fiel para Arquitetos e *Designers de Interiores em Jaú*" />
        <p className="v2-corpo max-w-[48ch]">
          Já possui projeto assinado por arquiteto, engenheiro ou designer de interiores? Nossa fábrica no Jardim Itamarati em Jaú executa cadernos técnicos de marcenaria fina com precisão milimétrica, compatibilização em obra com marmoraria, iluminação e serralheria, e cumprimento rigoroso do prazo em contrato (CNPJ {EMPRESA.cnpj}).
        </p>
        <div className="flex flex-wrap gap-[12px]">
          <button type="button" onClick={() => abrirOrcamento()} className="v2-botao v2-botao-claro">
            Cotar projeto executivo <ArrowUpRight className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>
          <a
            href={getWhatsAppUrl('Olá! Sou arquiteto(a)/cliente com projeto pronto e gostaria de orçar a execução de marcenaria sob medida em Jaú.', 'parceria_arquitetos')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick('v2_arquitetos')}
            className="v2-botao v2-botao-linha"
          >
            Enviar planta ou 3D pelo WhatsApp
          </a>
        </div>
      </div>
      <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-24">
        <div className="p-24 bg-[var(--v2-cartao)] border v2-linha-fina flex flex-col gap-8">
          <h3 className="v2-serif text-[1.4rem] leading-tight">Chapas 100% MDF e MDF Naval</h3>
          <p className="v2-corpo text-[0.9375rem]">
            Estrutura em MDF de 15mm, 18mm e 25mm de alta densidade com fitamento em PVC colado a quente e MDF hidrófugo nas áreas molhadas.
          </p>
        </div>
        <div className="p-24 bg-[var(--v2-cartao)] border v2-linha-fina flex flex-col gap-8">
          <h3 className="v2-serif text-[1.4rem] leading-tight">Ferragens Slow Motion</h3>
          <p className="v2-corpo text-[0.9375rem]">
            Corrediças telescópicas e ocultas com extração total e amortecimento, dobradiças com pistão amortecedor e perfis em alumínio.
          </p>
        </div>
        <div className="p-24 bg-[var(--v2-cartao)] border v2-linha-fina flex flex-col gap-8">
          <h3 className="v2-serif text-[1.4rem] leading-tight">Prazo Garantido em Contrato</h3>
          <p className="v2-corpo text-[0.9375rem]">
            Medição a laser na obra, cronograma transparente e montagem por equipe própria especializada sem terceirização improvisada.
          </p>
        </div>
        <div className="p-24 bg-[var(--v2-cartao)] border v2-linha-fina flex flex-col gap-8">
          <h3 className="v2-serif text-[1.4rem] leading-tight">Negociação Direto da Fábrica</h3>
          <p className="v2-corpo text-[0.9375rem]">
            Condições diretas sem intermediários de franquia: pagamento via PIX, transferência, boleto, cartão de crédito e parcelamento direto.
          </p>
        </div>
      </div>
    </section>
  );
};

/**
 * Cobertura Geográfica Hiper-Local em Jaú (bairros e condomínios), 12 cidades da região,
 * NAP completo e mapa incorporado.
 */
export const OndeEstamosV2: React.FC<{ id?: string }> = ({ id = 'v2-onde-estamos' }) => (
  <section id={id} className={`v2-claro ${MARGEM} py-[14vh] grid grid-cols-1 lg:grid-cols-12 gap-48 items-start border-t v2-linha-fina`}>
    <div className="lg:col-span-5 flex flex-col items-start gap-24">
      <p className="v2-cota uppercase tracking-[0.08em] v2-acento">Cobertura regional e fábrica em Jaú/SP</p>
      <Titulo texto="Atendimento Presencial e Montagem Própria *em Jaú e Toda a Região*" />
      <p className="v2-corpo max-w-[46ch]">
        Realizamos medição técnica a laser, entrega própria e montagem especializada em todos os bairros e condomínios de <strong>Jaú/SP</strong> — incluindo <strong>{EMPRESA.bairrosCondominiosJau.join(', ')}</strong>.
      </p>
      <p className="v2-corpo max-w-[46ch]">
        Nossa fábrica também atende com equipe própria toda a microrregião: <strong>{EMPRESA.cidadesAtendidas.map((c) => c.replace(/,\s*SP$/, '')).join(', ')}</strong>.
      </p>
      <div className="w-full flex flex-col gap-24 border-t v2-linha-fina pt-24">
        <div className="flex items-start gap-16">
          <MapPin className="w-[20px] h-[20px] shrink-0 mt-4 v2-acento" strokeWidth={1.5} aria-hidden="true" />
          <div className="flex flex-col gap-4">
            <span className="v2-serif text-[1.5rem] leading-tight">Fábrica e Atendimento — {EMPRESA.nome}</span>
            <span className="v2-corpo">
              {EMPRESA.endereco.logradouro} - {EMPRESA.endereco.bairro}, {EMPRESA.endereco.cidade} - {EMPRESA.endereco.uf}, CEP: {EMPRESA.endereco.cep}
            </span>
            <span className="v2-cota">
              Razão Social: {EMPRESA.razaoSocial} · CNPJ: {EMPRESA.cnpj}
            </span>
            <span className="v2-cota">
              {EMPRESA.horarios.semana} | {EMPRESA.horarios.sabado}
            </span>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-x-24 gap-y-24 pl-[36px]">
          {(
            [
              ['Atendimento', EMPRESA.sobre.atendimento],
              ['Serviços', EMPRESA.sobre.servicos],
              ['Pagamento', EMPRESA.sobre.pagamentos],
              ['Acessibilidade', EMPRESA.sobre.acessibilidade],
            ] as const
          ).map(([titulo, itens]) => (
            <div key={titulo} className="flex flex-col gap-4">
              <dt className="v2-cota uppercase tracking-[0.08em] text-[0.6875rem] v2-acento">{titulo}</dt>
              {itens.map((item) => (
                <dd key={item} className="v2-cota text-[0.9375rem]">
                  {item}
                </dd>
              ))}
            </div>
          ))}
        </dl>
      </div>
      <div className="flex flex-wrap gap-[12px]">
        <a href={EMPRESA.mapsUrl} target="_blank" rel="noopener noreferrer" className="v2-botao v2-botao-claro">
          Ver no Google Maps <ExternalLink className="w-[16px] h-[16px]" strokeWidth={1.5} />
        </a>
        <a
          href={getWhatsAppUrl('Olá! Quero agendar uma visita técnica da Império Móveis Planejados em Jaú.', 'v2_visita_tecnica')}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick('v2_visita_tecnica')}
          className="v2-botao v2-botao-linha"
        >
          Agendar visita técnica
        </a>
      </div>
    </div>
    <div className="lg:col-span-7 w-full border v2-linha-fina bg-[var(--v2-linho-2)]">
      <iframe
        className="w-full h-[360px] lg:h-[520px] border-0 block"
        src={EMPRESA.mapsEmbedUrl}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Mapa da ${EMPRESA.nome} no Jardim Itamarati em Jaú SP`}
      />
    </div>
  </section>
);

/**
 * Perguntas frequentes visíveis em acordeão HTML (<details>/<summary>), espelhando 100% o FAQPage
 * do Super-Grafo JSON-LD.
 */
export const PerguntasV2: React.FC = () => (
  <section id="faq" className={`v2-areia ${MARGEM} py-[12vh] grid grid-cols-1 lg:grid-cols-12 gap-48 scroll-mt-[72px]`}>
    <span id="v2-perguntas" className="sr-only" aria-hidden="true" />
    <div className="lg:col-span-4 flex flex-col gap-16">
      <p className="v2-cota uppercase tracking-[0.08em] v2-acento">Tire suas dúvidas</p>
      <Titulo texto="Perguntas Frequentes sobre Móveis Planejados *e Marcenaria em Jaú*" />
      <p className="v2-corpo max-w-[34ch]">
        Tudo sobre materiais 100% MDF, projeto 3D realista, prazos em contrato, ferragens, valores e cidades atendidas pela nossa fábrica em Jaú/SP.
      </p>
    </div>
    <div className="lg:col-span-8 flex flex-col">
      {perguntasConfirmadas().map((p) => (
        <details key={p.pergunta} className="group py-24 border-t v2-linha-fina">
          <summary className="flex items-start justify-between gap-16 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <h3 className="v2-serif text-[1.5rem] leading-tight">{p.pergunta}</h3>
            <span aria-hidden="true" className="v2-serif v2-acento text-[1.75rem] leading-none transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="v2-corpo mt-16 max-w-[62ch]">{p.resposta}</p>
        </details>
      ))}
    </div>
  </section>
);

/** Fechamento: frase grande, formulário num cartão marfim e o contato direto. */
export const FechamentoV2: React.FC = () => (
  <section id="v2-orcamento" data-sem-barra className={`v2-escuro ${MARGEM} py-[14vh] grid grid-cols-1 lg:grid-cols-12 gap-48`}>
    <div className="lg:col-span-5 flex flex-col gap-24">
      <h2 className="v2-serif v2-display">
        <ComItalico texto="Vamos construir *o seu?*" />
      </h2>
      <p className="v2-corpo max-w-[38ch]">Conte o que você quer planejar em Jaú ou região. A gente responde pelo WhatsApp com os próximos passos.</p>
      <a
        href={getWhatsAppUrl('Olá! Vim pelo site da Império Móveis Planejados em Jaú e gostaria de solicitar um Projeto 3D e orçamento.', 'v2_fechamento')}
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
