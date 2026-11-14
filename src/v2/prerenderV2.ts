/**
 * HTML inicial das páginas do site (V2), gerado no build. Repete a estrutura e as classes da
 * parte de cima de cada página do React: o texto e a foto principal pintam antes do JavaScript
 * e a troca pelo React não muda nada na tela. O resto do conteúdo vai em seguida, completo,
 * para o Google ler tudo sem depender do JavaScript.
 *
 * Ao mudar a parte de cima de uma página em PaginasInternasV2.tsx, SecoesV2.tsx ou HeroV2.tsx,
 * mudar aqui também (o teste de navegador compara as duas versões).
 */
import { EMPRESA } from '../data/empresa';
import { OBRAS_REAIS } from '../data/portfolioData';
import { PAGINAS_AMBIENTES_LOCAIS, TEXTO_HERO } from '../data/paginasLocais';
import { DOCUMENTOS_LEGAIS, dataPorExtenso } from '../data/legal';
import { perguntasConfirmadas } from '../data/perguntas';
import type { ObraItem } from '../types';
import { HERO_V2, MANIFESTO_V2, PASSOS_3D_V2, PROJETOS_3D_V2, PROJETO_INCLUSO_V2 } from './textosV2';
import { PROJETOS_3D, TEMAS_PROJETO_3D, linkProjeto3D } from '../data/projetos3d';
import { CAMINHO_PROJETOS_3D, ROTULO_AMBIENTE, RotaAmbiente, caminhoFoto } from './rotasV2';

const MARGEM = 'px-16 sm:px-32 lg:px-64';

/**
 * `sizes` da foto principal (página de foto e de ambiente). No celular, 60vw faz o navegador
 * escolher a versão de 800 px (nítida na tela do celular e 3 a 4 vezes mais leve que a de 1600).
 * O React (PaginasInternasV2) usa as mesmas constantes, para não baixar a foto duas vezes.
 */
export const TAMANHO_FOTO_DEITADA = '(max-width: 767px) 60vw, 100vw';
export const TAMANHO_FOTO_EM_PE = '(max-width: 767px) 60vw, (min-width: 1024px) 58vw, 100vw';

export function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** "texto *itálico*" → HTML com <em class="v2-italico">. */
function italico(texto: string): string {
  return texto
    .split('*')
    .map((p, i) => (i % 2 ? `<em class="v2-italico">${esc(p)}</em>` : esc(p)))
    .join('');
}

const olho = (t: string) => `<span class="v2-olho block mb-16">${esc(t)}</span>`;

/** Foto igual ao componente Foto (AVIF/WebP 800 e 1600, JPG de reserva, tamanho reservado). */
function foto(srcBase: string, alt: string, proporcao: string, o: { prioridade?: boolean; sizes?: string; classe?: string; estilo?: string } = {}): string {
  const [w, h] = proporcao.split('/').map((n) => Math.round(parseFloat(n)) || 1);
  const sizes = o.sizes ?? '(max-width: 639px) 60vw, (min-width: 1024px) 30vw, 50vw';
  const b = esc(srcBase);
  return `<picture class="block overflow-hidden ${o.classe ?? ''}" style="aspect-ratio:${w} / ${h}"><source type="image/avif" srcset="${b}-800.avif 800w, ${b}-1600.avif 1600w" sizes="${sizes}" /><source type="image/webp" srcset="${b}-800.webp 800w, ${b}-1600.webp 1600w" sizes="${sizes}" /><img src="${b}.jpg" alt="${esc(alt)}" width="${w}" height="${h}" ${
    o.prioridade ? 'fetchpriority="high" decoding="sync"' : 'loading="lazy" decoding="async"'
  } class="w-full h-full object-cover block" style="aspect-ratio:${w} / ${h};${o.estilo ?? ''}" /></picture>`;
}

function trilha(itens: { rotulo: string; para?: string }[]): string {
  const li = itens
    .map(
      (i, n) =>
        `<li class="flex items-center gap-8">${
          i.para ? `<a href="${esc(i.para)}" class="underline underline-offset-4">${esc(i.rotulo)}</a>` : `<span aria-current="page" class="text-[var(--v2-texto)]">${esc(i.rotulo)}</span>`
        }${n < itens.length - 1 ? '<span aria-hidden="true">/</span>' : ''}</li>`
    )
    .join('');
  return `<nav aria-label="Você está em" class="v2-cota"><ol class="flex flex-wrap items-center gap-8">${li}</ol></nav>`;
}

/** Cabeçalho fixo (mesma marcação do CabecalhoV2, sem os botões que dependem do JavaScript). */
function cabecalho(transparente: boolean): string {
  const fundo = transparente ? '!bg-transparent' : '!bg-[var(--v2-noite)]/95 backdrop-blur-[2px] border-b v2-linha-fina';
  return `<header class="v2-escuro fixed top-0 inset-x-0 z-50 ${fundo}"><div class="${MARGEM} h-[68px] flex items-center justify-between gap-16"><a href="/" class="flex items-center gap-[12px] shrink-0" aria-label="${esc(
    EMPRESA.nome
  )}, página inicial"><span class="v2-logo inline-block h-[40px]" aria-hidden="true"></span><span class="flex flex-col leading-none"><span class="v2-serif text-[1.45rem]">Império</span><span class="v2-cota text-[0.6875rem] tracking-[0.08em] uppercase">Móveis planejados</span></span></a><nav aria-label="Principal" class="hidden xl:flex items-center gap-16 2xl:gap-24 whitespace-nowrap"><a class="v2-cota" href="/obras">Obras</a><a class="v2-cota" href="/#ambientes">Ambientes</a><a class="v2-cota" href="/projetos-3d">Projetos 3D</a><a class="v2-cota" href="/#v2-projeto-incluso">Projeto incluso</a><a class="v2-cota" href="/#v2-processo">Como trabalhamos</a><a class="v2-cota" href="/#v2-avaliacoes">Avaliações</a><a class="v2-cota" href="/#faq">FAQ</a><a class="v2-cota" href="/#v2-onde-estamos">Onde estamos</a></nav><div class="flex items-center gap-8"><a href="/projetar" class="v2-botao v2-botao-linha h-[40px] px-16 text-[0.875rem] hidden md:inline-flex">Projetar em 3D</a><a href="/contato" class="v2-botao v2-botao-claro h-[40px] px-16 text-[0.875rem]">Orçamento</a><span class="xl:hidden w-[40px] h-[40px]" aria-hidden="true"></span></div></div></header>`;
}

/** Rodapé com E-E-A-T, NAP, Razão Social, CNPJ, links de ambientes e cidades atendidas (para o Google e para quem está sem JavaScript). */
function rodape(): string {
  const cidades = EMPRESA.cidadesAtendidas.map((c) => c.replace(/,\s*SP$/, '')).join(', ');
  const bairros = EMPRESA.bairrosCondominiosJau.join(', ');
  return `<footer class="v2-escuro ${MARGEM} py-64 border-t v2-linha-fina flex flex-col gap-24 v2-cota"><nav aria-label="Ambientes" class="flex flex-wrap gap-x-24 gap-y-8"><a href="/cozinhas-planejadas-jau">Cozinhas planejadas em Jaú</a><a href="/quartos-planejados-jau">Quartos planejados em Jaú</a><a href="/closets-sob-medida-jau">Closets sob medida em Jaú</a><a href="/home-office-planejado-jau">Home office e corporativo</a><a href="/#cozinhas">Cozinhas 100% MDF</a><a href="/#closets">Closets e dormitórios</a><a href="/#gourmet">Área gourmet</a><a href="/#corporativo">Corporativo e clínicas</a><a href="/#projetos">Projeto 3D</a><a href="/#faq">Perguntas frequentes</a><a href="/obras">Todas as obras</a><a href="/projetos-3d">Projetos 3D prontos</a><a href="/projetar">Projetar em 3D</a><a href="/contato">Solicitar Projeto 3D e Orçamento</a><a href="/privacidade">Privacidade (LGPD)</a><a href="/termos">Termos de uso</a></nav><address class="not-italic flex flex-col gap-8"><strong>Império Móveis Planejados — Jaú / SP</strong><span>Razão Social: ${esc(
    EMPRESA.razaoSocial
  )} | CNPJ: ${esc(EMPRESA.cnpj)}</span><span>Endereço: ${esc(EMPRESA.endereco.logradouro)} - ${esc(
    EMPRESA.endereco.bairro
  )}, ${esc(EMPRESA.endereco.cidade)} - ${esc(EMPRESA.endereco.uf)}, CEP: ${esc(
    EMPRESA.endereco.cep
  )}</span><span>Atendimento: ${esc(EMPRESA.horarios.semana)} | ${esc(
    EMPRESA.horarios.sabado
  )}</span><span>Telefone: <a href="tel:${esc(EMPRESA.whatsappE164)}">${esc(
    EMPRESA.telefone
  )}</a> · <a href="https://wa.me/${esc(
    EMPRESA.whatsapp
  )}?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20Imp%C3%A9rio%20M%C3%B3veis%20Planejados%20em%20Ja%C3%BA%20e%20gostaria%20de%20solicitar%20um%20Projeto%203D%20e%20or%C3%A7amento.&amp;utm_source=site&amp;utm_medium=cta_whatsapp&amp;utm_campaign=rodape_jau">Solicitar Projeto 3D e Orçamento no WhatsApp</a></span></address><p><strong>Declaração Institucional:</strong> A Império Móveis Planejados (Razão Social: ${esc(EMPRESA.razaoSocial)}, CNPJ ${esc(EMPRESA.cnpj)}) possui fábrica e sede única na ${esc(EMPRESA.endereco.logradouro)}, ${esc(EMPRESA.endereco.bairro)}, em Jaú/SP, atuando de forma independente e sem vínculo societário, filiais ou franquias com empresas de nome similar em outras regiões.</p><p><strong>Cidades atendidas mediante visita técnica agendada e montagem própria:</strong> ${esc(
    cidades
  )} (Interior de São Paulo).</p><p><strong>Bairros e condomínios atendidos em Jaú/SP:</strong> ${esc(bairros)}.</p></footer>`;
}

const pagina = (conteudo: string, transparente = false) => `<div class="v2 min-h-screen">${cabecalho(transparente)}<main>${conteudo}</main>${rodape()}</div>`;

/** Home: réplica da abertura (HeroV2 no começo da rolagem) e o conteúdo semântico completo H1 -> H2 -> H3 das seções seguintes. */
export function htmlInicio(): string {
  const obras = OBRAS_REAIS.slice(0, 3)
    .map((o) => `<li><a href="${caminhoFoto(o)}">${esc(o.titulo)}</a>: ${esc(o.cota)}</li>`)
    .join('');
  const passos = PROJETO_INCLUSO_V2.itens.map((p) => `<li><strong>${esc(p.titulo)}.</strong> ${esc(p.texto)}</li>`).join('');
  const perguntas = perguntasConfirmadas()
    .map(
      (p) =>
        `<details class="py-24 border-t v2-linha-fina"><summary class="v2-serif text-[1.5rem]"><h3>${esc(
          p.pergunta
        )}</h3></summary><p class="v2-corpo mt-16">${esc(p.resposta)}</p></details>`
    )
    .join('');
  const cidades = EMPRESA.cidadesAtendidas.map((c) => c.replace(/,\s*SP$/, '')).join(', ');
  const bairros = EMPRESA.bairrosCondominiosJau.join(', ');
  const wpp = (msg: string, camp: string) =>
    `https://wa.me/${esc(EMPRESA.whatsapp)}?text=${encodeURIComponent(msg)}&amp;utm_source=site&amp;utm_medium=cta_whatsapp&amp;utm_campaign=${esc(camp)}`;
  return pagina(
    `<section id="hero" class="v2-escuro relative w-full" style="min-height:320vh">
      <div class="sticky top-0 h-screen h-[100svh] w-full overflow-hidden">
        <div class="absolute inset-0" aria-hidden="true">
          <div class="palco-estatico absolute inset-0 overflow-x-clip bg-[#050505]">
            <img class="poster-notebook-v2" src="/videos/notebook-poster.jpg" alt="Apresentação de Projeto 3D de Cozinha Planejada Sob Medida em Jaú SP - Império Móveis Planejados" width="1280" height="720" fetchpriority="high" decoding="async" />
          </div>
        </div>
        <div class="absolute inset-x-0 top-0 pt-[12svh] lg:pt-[11vh] px-16 sm:px-32 lg:px-64 lg:text-center lg:flex lg:flex-col lg:items-center">
          <h1 class="v2-serif v2-display text-[clamp(2.5rem,4.4vw,4.75rem)] max-w-[13ch] lg:max-w-[22ch]"><span class="v2-olho block mb-16 lg:mb-24">${esc(TEXTO_HERO.chamada)}</span>${italico(HERO_V2.titulo)}</h1>
          <p class="aeo-resposta-direta v2-corpo mt-16 lg:mt-24 max-w-[44ch]">${esc(HERO_V2.apoio)}</p>
          <div class="flex flex-wrap items-center lg:justify-center gap-12 mt-16 lg:mt-24">
            <a href="/contato" class="v2-botao v2-botao-claro h-[44px] px-20 text-[0.9375rem]">Solicitar Projeto 3D e Orçamento em Jaú</a>
            <a href="/obras" class="v2-botao v2-botao-linha h-[44px] px-16 text-[0.9375rem]">Ver as obras</a>
          </div>
          <p class="v2-cota mt-16">★ 4,9 no Google · Fábrica 100% MDF desde 2015 · Role para construir a cozinha em 3D</p>
        </div>
      </div>
    </section>
    <section class="v2-claro ${MARGEM} py-96"><p class="v2-serif text-[clamp(2rem,4.6vw,4.25rem)] leading-[1.08] max-w-[22ch]">${esc(MANIFESTO_V2)}</p></section>
    <section id="v2-obras" class="v2-claro ${MARGEM} py-64"><h2 class="v2-serif v2-titulo">Obras que <em class="v2-italico">já moram</em> em Jaú.</h2><ul class="v2-corpo">${obras}</ul><nav aria-label="Ambientes"><a href="/obras#cozinhas">Cozinhas</a> · <a href="/obras#quartos">Quartos</a> · <a href="/obras#lojas">Lojas e comércio</a></nav><a href="/obras">Ver todas as ${OBRAS_REAIS.length} obras</a> · <a href="/projetos-3d">Ver projetos 3D</a></section>
    <section id="ambientes" class="v2-areia ${MARGEM} py-64">
      <h2 class="v2-serif v2-titulo">Ambientes Planejados 100% MDF <em class="v2-italico">Sob Medida em Jaú.</em></h2>
      <p class="aeo-resposta-direta v2-corpo mt-16">A Império Móveis Planejados fabrica em Jaú/SP cozinhas, closets, dormitórios, salas, áreas gourmet, banheiros e ambientes corporativos com chapas 100% MDF de 15mm, 18mm e 25mm, MDF Naval Hidrófugo resistente à umidade, ferragens com amortecimento slow motion e projeto 3D gratuito.</p>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-24 mt-32">
        <article id="cozinhas"><h3 class="v2-serif text-[1.5rem]">Cozinhas Planejadas Sob Medida em Jaú</h3><p class="v2-corpo">Cozinhas planejadas 100% MDF em Jaú com ilha central em ripado ou pedra, torre quente para forno e micro-ondas, MDF naval (hidrófugo) resistente à umidade nas áreas molhadas, porta-temperos, perfis puxadores em alumínio, iluminação linear em LED quente e ferragens com amortecimento slow motion (corrediças telescópicas e ocultas).</p><p><a href="/cozinhas-planejadas-jau">Ver fotos de cozinhas</a> · <a href="${wpp('Olá! Vi os projetos de Cozinha Planejada no site da Império Móveis e gostaria de um orçamento em Jaú/região.', 'ambiente_cozinhas')}">Orçar Cozinha no WhatsApp</a></p></article>
        <article id="closets"><h3 class="v2-serif text-[1.5rem]">Dormitórios, Guarda-Roupas e Closets Planejados</h3><p class="v2-corpo">Guarda-roupas até o teto e closets sob medida em L, em U ou corredor com portas de correr com amortecimento, sapateiras telescópicas, cabideiros iluminados em LED, divisórias de veludo para joias e quartos de casal, solteiro e infantis em Jaú.</p><p><a href="/closets-sob-medida-jau">Ver fotos de closets</a> · <a href="${wpp('Olá! Vi os projetos de Closet e Dormitório Planejado no site da Império Móveis e gostaria de um orçamento em Jaú/região.', 'ambiente_closets')}">Orçar Closet no WhatsApp</a></p></article>
        <article id="salas"><h3 class="v2-serif text-[1.5rem]">Salas de Estar, Painéis Ripados de TV e Home Theater</h3><p class="v2-corpo">Painéis ripados em MDF Freijó ou Nogueira até o teto com passagem oculta de cabos, racks suspensos com gavetões chanfrados e cristaleiras com vidro reflecta e iluminação indireta em LED.</p><p><a href="${wpp('Olá! Vi os projetos de Sala e Painel Ripado no site da Império Móveis e gostaria de um orçamento em Jaú/região.', 'ambiente_salas')}">Orçar Sala no WhatsApp</a></p></article>
        <article id="gourmet"><h3 class="v2-serif text-[1.5rem]">Móveis Planejados para Área Gourmet, Churrasqueira e Lavanderia</h3><p class="v2-corpo">Armários sob medida com proteção contra umidade e calor próximos à churrasqueira, gabinetes em MDF naval, adegas climatizadas e lavanderias planejadas funcionais em Jaú e região.</p><p><a href="${wpp('Olá! Vi os projetos de Área Gourmet Planejada no site da Império Móveis e gostaria de um orçamento em Jaú/região.', 'ambiente_gourmet')}">Orçar Área Gourmet no WhatsApp</a></p></article>
        <article id="banheiros"><h3 class="v2-serif text-[1.5rem]">Banheiros e Lavabos Planejados</h3><p class="v2-corpo">Gabinetes sob medida 100% MDF naval com fitamento em PVC colado a quente resistente ao vapor, nichos organizadores e espelheiras com iluminação frontal ou indireta em LED.</p><p><a href="${wpp('Olá! Vi os projetos de Banheiro Planejado em MDF Naval no site da Império Móveis e gostaria de um orçamento em Jaú/região.', 'ambiente_banheiros')}">Orçar Banheiro no WhatsApp</a></p></article>
        <article id="corporativo"><h3 class="v2-serif text-[1.5rem]">Móveis Planejados Corporativos, Escritórios, Clínicas e Lojas em Jaú</h3><p class="v2-corpo">Recepções, estações de trabalho ergonômicas, salas de reunião, consultórios médicos e odontológicos, escritórios de advocacia e marcenaria comercial completa em Jaú.</p><p><a href="/home-office-planejado-jau">Ver marcenaria corporativa</a> · <a href="${wpp('Olá! Vi os projetos de Móveis Corporativos e Comerciais no site da Império Móveis e gostaria de um orçamento em Jaú/região.', 'ambiente_corporativo')}">Orçar Corporativo no WhatsApp</a></p></article>
      </div>
    </section>
    <section id="v2-projeto-incluso" class="v2-claro ${MARGEM} py-64">
      <h2 class="v2-serif v2-titulo">Qual a diferença entre a Marcenaria Sob Medida Império <em class="v2-italico">e móveis modulados?</em></h2>
      <p class="aeo-resposta-direta v2-corpo mt-16">Na Império Móveis Planejados em Jaú, o projeto executivo 3D assinado pela arquiteta já vem incluso gratuitamente e cada móvel é fabricado 100% em MDF sob medida (com MDF Naval em áreas úmidas), sem as frestas, réguas largas ou chapas de MDP comuns em móveis modulados.</p>
      <table class="w-full text-left border-collapse mt-24">
        <caption>Comparativo técnico entre Marcenaria Sob Medida Império 100% MDF em Jaú e Móveis Modulados Convencionais</caption>
        <thead><tr><th scope="col">Critério Técnico</th><th scope="col">Móveis Modulados / Comum</th><th scope="col">Marcenaria Império 100% MDF (Jaú)</th></tr></thead>
        <tbody>
          <tr><th scope="row">Aproveitamento de Espaço</th><td>Caixas prontas de tamanho fixo com frestas e réguas largas de fechamento</td><td>Corte milimétrico parede a parede e do piso ao teto, aproveitando 100% do vão</td></tr>
          <tr><th scope="row">Matéria-Prima Estrutural</th><td>Uso frequente de MDP ou aglomerado sem proteção contra umidade</td><td>Chapas 100% MDF (15mm, 18mm e 25mm) + MDF Naval Hidrófugo em áreas molhadas</td></tr>
          <tr><th scope="row">Projeto de Arquitetura e 3D</th><td>Cobrado à parte ou limitado a modulação básica de loja</td><td>Projeto executivo e apresentação 3D no notebook inclusos com arquiteta própria</td></tr>
          <tr><th scope="row">Ferragens e Acabamento</th><td>Dobradiças e corrediças simples sem amortecimento</td><td>Dobradiças e corrediças telescópicas/ocultas slow motion + fita PVC colada a quente</td></tr>
          <tr><th scope="row">Medição e Montagem</th><td>Montadores terceirizados contratados por empreita rápida</td><td>Medição a laser e montagem limpa por marceneiros próprios da nossa fábrica em Jaú</td></tr>
        </tbody>
      </table>
    </section>
    <section id="v2-processo" class="v2-claro ${MARGEM} py-64">
      <h2 class="v2-serif v2-titulo">Como funciona a fabricação de móveis planejados <em class="v2-italico">na Império em Jaú?</em></h2>
      <p class="aeo-resposta-direta v2-corpo mt-16">Nosso processo em Jaú e região segue 4 etapas integradas: 1) Briefing e medição técnica a laser no imóvel; 2) Apresentação do Projeto 3D realista no notebook; 3) Fabricação própria 100% MDF no Jardim Itamarati; e 4) Entrega e montagem limpa por equipe própria.</p>
      <ol class="v2-corpo mt-24">${passos}</ol>
    </section>
    <section id="projetos" class="v2-escuro ${MARGEM} py-64"><h2 class="v2-serif v2-titulo">Do Projeto 3D Realista no Notebook <em class="v2-italico">à Execução Milimétrica na Sua Casa em Jaú</em></h2><p class="v2-corpo">Antes de qualquer chapa de MDF ser cortada na nossa marcenaria no Jardim Itamarati, você visualiza no projeto 3D realista a iluminação em perfil de LED, a paginação dos veios do MDF, as divisórias internas e a abertura de portas. E também pode simular gratuitamente no configurador 3D online.</p></section>
    <section id="arquitetos" class="v2-claro ${MARGEM} py-64"><h2 class="v2-serif v2-titulo">Execução Fiel para Arquitetos e <em class="v2-italico">Designers de Interiores em Jaú</em></h2><p class="v2-corpo">Executamos projetos de arquitetos e engenheiros com fidelidade técnica ao caderno executivo, chapas 100% MDF de 15mm, 18mm e 25mm, prazo de entrega estipulado em contrato (CNPJ ${esc(EMPRESA.cnpj)}) e pagamento via PIX, cartão de crédito parcelado e condições combinadas em contrato.</p></section>
    <section id="faq" class="v2-areia ${MARGEM} py-64"><h2 class="v2-serif v2-titulo">Perguntas Frequentes sobre Móveis Planejados <em class="v2-italico">e Marcenaria em Jaú</em></h2>${perguntas}</section>
    <section id="v2-onde-estamos" class="v2-claro ${MARGEM} py-64"><h2 class="v2-serif v2-titulo">Atendimento Presencial e Montagem Própria <em class="v2-italico">em Jaú e Toda a Região</em></h2><p class="v2-corpo">Atendemos todos os bairros e condomínios de Jaú/SP: ${esc(bairros)}.</p><p class="v2-corpo">Medição a laser e montagem própria em 12 cidades da região: ${esc(cidades)}.</p></section>`,
    true
  );
}

/** /obras: cabeçalho igual ao do React e todas as obras por ambiente. */
export function htmlObras(): string {
  const grupos = (['cozinhas', 'quartos', 'lojas'] as const)
    .map(
      (g, i) => `<section id="${g}" class="${i % 2 ? 'v2-areia' : 'v2-claro'} ${MARGEM} py-96 scroll-mt-[80px]"><h2 class="v2-serif v2-titulo mb-48">${esc(
        ROTULO_AMBIENTE[g]
      )}</h2><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-32 gap-y-64 items-start">${OBRAS_REAIS.filter((o) => o.ambiente === g)
        .map(
          (o) =>
            `<a href="${caminhoFoto(o)}" class="group flex flex-col gap-16">${foto(o.arquivo, o.alt, o.proporcao)}<span class="flex flex-col gap-4"><span class="v2-serif text-[1.5rem] leading-tight">${esc(
              o.titulo
            )}</span><span class="v2-cota">${esc(o.cota)}</span></span></a>`
        )
        .join('')}</div></section>`
    )
    .join('');
  const chips = (['cozinhas', 'quartos', 'lojas'] as const)
    .map((g) => `<a href="/obras#${g}" class="v2-botao v2-botao-linha h-[40px] px-16 text-[0.875rem]">${esc(ROTULO_AMBIENTE[g])} (${OBRAS_REAIS.filter((o) => o.ambiente === g).length})</a>`)
    .join('');
  return pagina(`<section class="v2-claro ${MARGEM} pt-[160px] pb-64 flex flex-col gap-32">${trilha([{ rotulo: 'Início', para: '/' }, { rotulo: 'Obras' }])}<div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-24"><h1 class="v2-serif v2-titulo max-w-[14ch]">${olho(
    'Móveis planejados em Jaú e região'
  )}${italico('Todas as obras, *uma por uma.*')}</h1><p class="v2-corpo max-w-[44ch]">${OBRAS_REAIS.length} fotos reais de cozinhas, quartos e lojas que a Império projetou e fabricou em Jaú e região. Toque numa foto para ver os acabamentos de cada peça.</p></div><nav aria-label="Ambientes" class="flex flex-wrap gap-8">${chips}</nav></section>${grupos}`);
}

/** /obras/:id: a foto, o título e os acabamentos (mesma grade da FotoPaginaV2). */
export function htmlFoto(obra: ObraItem): string {
  const [w, h] = obra.proporcao.split('/').map((n) => parseFloat(n));
  const deitada = w > h;
  const acabamentos = obra.anotacoes.length
    ? `<div class="flex flex-col gap-8"><h2 class="v2-cota uppercase tracking-[0.08em]">Acabamentos desta obra</h2><ul class="flex flex-col">${obra.anotacoes
        .map((a) => `<li class="py-[12px] border-t v2-linha-fina v2-serif text-[1.35rem] leading-tight first-letter:uppercase">${esc(a.texto)}</li>`)
        .join('')}</ul></div>`
    : '';
  return pagina(`<article class="v2-claro ${MARGEM} pt-[136px] pb-96"><div class="flex flex-col gap-24 mb-48">${trilha([
    { rotulo: 'Início', para: '/' },
    { rotulo: 'Obras', para: '/obras' },
    { rotulo: ROTULO_AMBIENTE[obra.ambiente], para: `/obras#${obra.ambiente}` },
    { rotulo: obra.titulo },
  ])}</div><div class="grid grid-cols-1 ${deitada ? '' : 'lg:grid-cols-12'} gap-48 items-start"><figure class="relative ${deitada ? '' : 'lg:col-span-7'}" style="aspect-ratio:${esc(obra.proporcao)}">${foto(obra.arquivo, obra.alt, obra.proporcao, {
    prioridade: true,
    sizes: deitada ? TAMANHO_FOTO_DEITADA : TAMANHO_FOTO_EM_PE,
    classe: 'w-full h-full',
  })}</figure><div class="flex flex-col gap-24 ${deitada ? 'lg:grid lg:grid-cols-12 lg:gap-48' : 'lg:col-span-5 lg:sticky lg:top-[100px]'}"><div class="flex flex-col gap-16 ${deitada ? 'lg:col-span-6' : ''}"><p class="v2-cota uppercase tracking-[0.08em] v2-acento">${esc(
    ROTULO_AMBIENTE[obra.ambiente]
  )}</p><h1 class="v2-serif v2-h3 text-[clamp(2rem,3.4vw,3.25rem)]">${esc(obra.titulo)}</h1><p class="v2-corpo">${esc(obra.alt)}.</p><p class="v2-cota">${esc(obra.cota)}</p></div><div class="flex flex-col gap-24 ${
    deitada ? 'lg:col-span-6' : ''
  }">${acabamentos}<div class="flex flex-wrap gap-[12px]"><a href="/contato" class="v2-botao v2-botao-claro">Quero um parecido</a><a href="/projetar" class="v2-botao v2-botao-linha">Montar em 3D</a></div></div></div></div></article>`);
}

/** Páginas de ambiente (mesma parte de cima da AmbienteV2) com todo o texto e as fotos. */
export function htmlAmbiente(rota: RotaAmbiente, nome: string): string {
  const cfg = PAGINAS_AMBIENTES_LOCAIS[rota];
  const [principal, ...outras] = cfg.fotos;
  return pagina(`<section class="v2-claro ${MARGEM} pt-[136px] pb-64 flex flex-col gap-32">${trilha([{ rotulo: 'Início', para: '/' }, { rotulo: nome }])}<div class="grid grid-cols-1 lg:grid-cols-12 gap-32 lg:gap-64 items-end"><div class="lg:col-span-7 flex flex-col gap-24"><p class="v2-cota uppercase tracking-[0.08em] v2-acento">Jaú e região</p><h1 class="v2-serif text-[clamp(2.25rem,4.4vw,4rem)] leading-[1.02] max-w-[20ch]">${esc(
    cfg.h1
  )}</h1></div><div class="lg:col-span-5 flex flex-col gap-24"><p class="v2-corpo max-w-[44ch]">${esc(
    cfg.subtitulo
  )}</p><div class="flex flex-wrap gap-[12px]"><a href="/contato" class="v2-botao v2-botao-claro">Pedir orçamento</a><a href="/projetar" class="v2-botao v2-botao-linha">Montar em 3D</a></div></div></div>${
    principal
      ? `<figure class="flex flex-col gap-8">${foto(principal.srcBase, principal.alt, principal.razao, { prioridade: true, sizes: TAMANHO_FOTO_DEITADA, classe: 'w-full max-h-[78vh]' })}<figcaption class="v2-cota">${esc(principal.legenda)}</figcaption></figure>`
      : ''
  }</section><section class="v2-areia ${MARGEM} py-96 grid grid-cols-1 lg:grid-cols-12 gap-48"><div class="lg:col-span-7 flex flex-col gap-24 v2-texto-longo"><h2 class="v2-serif v2-h3">Como fazemos, <em class="v2-italico">obra por obra.</em></h2>${cfg.paragrafosReais
    .map((p) => `<p>${esc(p)}</p>`)
    .join('')}</div><dl class="lg:col-span-5 flex flex-col">${cfg.especificacoesReais
    .map((e) => `<div class="py-24 border-t v2-linha-fina flex flex-col gap-8"><dt class="v2-serif text-[1.4rem] leading-tight">${esc(e.titulo)}</dt><dd class="v2-corpo">${esc(e.detalhe)}</dd></div>`)
    .join('')}</dl></section>${
    outras.length
      ? `<section class="v2-claro ${MARGEM} py-96 flex flex-col gap-48"><h2 class="v2-serif v2-titulo">Mais fotos <em class="v2-italico">de obras reais.</em></h2><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-32 gap-y-48 items-start">${outras
          .map((f) => `<figure class="flex flex-col gap-8">${foto(f.srcBase, f.alt, f.razao)}<figcaption class="v2-cota">${esc(f.legenda)}</figcaption></figure>`)
          .join('')}</div></section>`
      : ''
  }`);
}

/** /projetar (parte de cima da ProjetarV2, com a imagem e o botão de abrir o editor). */
export function htmlProjetar(): string {
  const passos = PASSOS_3D_V2.map(
    (p, i) =>
      `<li class="py-24 border-t v2-linha-fina flex gap-16"><span class="v2-serif v2-italico v2-acento text-[1.75rem] leading-none">${String(i + 1).padStart(2, '0')}</span><span class="flex flex-col gap-4"><span class="v2-serif text-[1.35rem] leading-tight">${esc(
        p.titulo
      )}</span><span class="v2-cota">${esc(p.texto)}</span></span></li>`
  ).join('');
  return pagina(`<section class="v2-escuro ${MARGEM} pt-[136px] pb-96 flex flex-col gap-48">${trilha([{ rotulo: 'Início', para: '/' }, { rotulo: 'Projetar em 3D' }])}<div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-24"><h1 class="v2-serif v2-titulo">${olho(
    'Móveis planejados em 3D, grátis'
  )}${italico('Projete o seu *em 3D.*')}</h1><p class="v2-corpo max-w-[44ch]">De graça e sem instalar nada. Visualização aproximada: o projeto final é detalhado pela arquiteta depois da medição no local.</p></div><ol class="grid grid-cols-1 md:grid-cols-3 gap-x-32">${passos}</ol><div class="relative w-full h-[70svh] min-h-[420px] border v2-linha-fina overflow-hidden">${foto(
    '/projetar/cozinha-render',
    'Exemplo de projeto 3D de cozinha planejada sob medida em Jaú SP feito no editor online da Império Móveis Planejados',
    '16 / 9',
    { prioridade: true, sizes: '100vw', classe: 'w-full h-full' }
  )}<div class="absolute inset-0 bg-[var(--v2-noite)]/40 flex items-center justify-center p-24"><span class="v2-botao v2-botao-claro">Abrir o editor 3D</span></div></div></section>`);
}

/** /projetos-3d: mesma parte de cima da Projetos3DPaginaV2 e todos os projetos por tema. */
export function htmlProjetos3D(): string {
  const temas = TEMAS_PROJETO_3D.filter((t) => PROJETOS_3D.some((p) => p.tema === t.id));
  const chips = temas
    .map((t) => `<a href="${CAMINHO_PROJETOS_3D}#${t.id}" class="v2-botao v2-botao-linha h-[40px] px-16 text-[0.875rem]">${esc(t.rotulo)} (${PROJETOS_3D.filter((p) => p.tema === t.id).length})</a>`)
    .join('');
  const secoes = temas
    .map(
      (t) => `<section id="${t.id}" class="v2-escuro ${MARGEM} py-96 border-t v2-linha-fina scroll-mt-[80px]"><h2 class="v2-serif v2-titulo mb-48">${esc(
        t.rotulo
      )}</h2><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-32 gap-y-64 items-start">${PROJETOS_3D.filter((p) => p.tema === t.id)
        .map(
          (p) =>
            `<article class="flex flex-col gap-16"><a href="${esc(linkProjeto3D(p))}" class="group block overflow-hidden" aria-label="Abrir no editor 3D: ${esc(p.nome)}">${foto(
              p.arquivo,
              `Projeto 3D em Jaú SP: ${p.nome}. ${p.descricao}`,
              p.proporcao,
              { classe: 'w-full' }
            )}</a><div class="flex flex-col gap-4"><h3 class="v2-serif text-[1.5rem] leading-tight">${esc(p.nome)}</h3><p class="v2-cota">${esc(
              p.descricao
            )}</p></div><div class="flex flex-wrap gap-8"><a href="${esc(linkProjeto3D(p))}" class="v2-botao v2-botao-linha h-[40px] px-16 text-[0.875rem]">Abrir no 3D</a><a href="/contato" class="v2-botao v2-botao-claro h-[40px] px-16 text-[0.875rem]">Quero orçar</a></div></article>`
        )
        .join('')}</div></section>`
    )
    .join('');
  return pagina(`<section class="v2-escuro ${MARGEM} pt-[136px] pb-64 flex flex-col gap-32">${trilha([{ rotulo: 'Início', para: '/' }, { rotulo: 'Projetos 3D' }])}<div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-24"><h1 class="v2-serif v2-titulo max-w-[14ch]">${olho(
    PROJETOS_3D_V2.olho
  )}${italico(PROJETOS_3D_V2.titulo)}</h1><div class="flex flex-col gap-16 max-w-[44ch]"><p class="v2-corpo">${esc(PROJETOS_3D_V2.apoio)}</p><p class="v2-cota">${esc(
    PROJETOS_3D_V2.aviso
  )}</p></div></div><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-16"><nav aria-label="Temas" class="flex flex-wrap gap-8">${chips}</nav><a href="/projetar" class="v2-botao v2-botao-claro self-start">Criar o meu do zero</a></div></section>${secoes}`);
}

/** /contato (coluna de texto da OrcamentoV2; o formulário chega com o JavaScript). */
export function htmlContato(): string {
  return pagina(`<section class="v2-claro ${MARGEM} pt-[136px] pb-96 grid grid-cols-1 lg:grid-cols-12 gap-48"><div class="lg:col-span-5 flex flex-col gap-32">${trilha([
    { rotulo: 'Início', para: '/' },
    { rotulo: 'Pedir orçamento' },
  ])}<h1 class="v2-serif v2-titulo">${olho('Orçamento de móveis planejados em Jaú')}${italico(
    'Vamos começar *pelo seu sonho.*'
  )}</h1><p class="v2-corpo max-w-[40ch]">Conte o ambiente, quando quer começar e o estilo. A gente responde pelo WhatsApp. O projeto de arquitetura vem junto com os móveis.</p><div class="flex flex-col gap-16 v2-cota text-[0.9375rem]"><a href="https://wa.me/${esc(
    EMPRESA.whatsapp
  )}" class="v2-botao v2-botao-linha self-start" rel="noopener noreferrer" target="_blank">WhatsApp ${esc(EMPRESA.telefone)}</a><span>${esc(EMPRESA.endereco.logradouro)} - ${esc(EMPRESA.endereco.bairro)}, ${esc(EMPRESA.endereco.cidade)} - ${esc(
    EMPRESA.endereco.uf
  )}, CEP: ${esc(EMPRESA.endereco.cep)}.</span><span>Razão Social: ${esc(EMPRESA.razaoSocial)} · CNPJ: ${esc(EMPRESA.cnpj)}.</span><span>${esc(EMPRESA.horarios.semana)} | ${esc(EMPRESA.horarios.sabado)}.</span></div></div><div class="lg:col-span-7 bg-[var(--v2-marfim)] text-[#1B1915] p-24 sm:p-48 border v2-linha-fina min-h-[480px]"></div></section>`);
}

/** /privacidade e /termos: o texto inteiro, no visual da LegalV2. */
export function htmlLegal(documento: '/privacidade' | '/termos'): string {
  const doc = DOCUMENTOS_LEGAIS[documento];
  const secoes = doc.secoes
    .map(
      (s) =>
        `<section class="flex flex-col gap-16 v2-texto-longo"><h2 class="v2-serif v2-h3">${esc(s.titulo)}</h2>${s.paragrafos.map((p) => `<p>${esc(p)}</p>`).join('')}${
          s.itens ? `<ul class="flex flex-col gap-8 pl-24 list-disc">${s.itens.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : ''
        }</section>`
    )
    .join('');
  const fontes = doc.fontes
    ? `<section class="flex flex-col gap-16 v2-texto-longo"><h2 class="v2-serif v2-h3">Fontes oficiais</h2><ul class="flex flex-col gap-8 pl-24 list-disc">${doc.fontes
        .map((f) => `<li><a href="${esc(f.url)}" rel="noopener">${esc(f.rotulo)}</a></li>`)
        .join('')}</ul></section>`
    : '';
  return pagina(`<article class="v2-claro ${MARGEM} pt-[136px] pb-96"><div class="max-w-[760px] mx-auto flex flex-col gap-48"><header class="flex flex-col gap-16 pb-32 border-b v2-linha-forte">${trilha([
    { rotulo: 'Início', para: '/' },
    { rotulo: doc.titulo },
  ])}<h1 class="v2-serif v2-titulo">${esc(doc.titulo)}</h1><p class="v2-corpo">${esc(doc.resumo)}</p><p class="v2-cota">Última atualização: <time datetime="${doc.atualizadoEm}">${dataPorExtenso(
    doc.atualizadoEm
  )}</time></p></header>${secoes}${fontes}</div></article>`);
}

/** Página 404 no visual do site (sem JavaScript). */
export function html404(): string {
  return pagina(`<section class="v2-escuro ${MARGEM} min-h-[80svh] pt-[160px] pb-96 flex flex-col gap-24"><p class="v2-cota v2-acento">Erro 404</p><h1 class="v2-serif v2-display">Esta página <em class="v2-italico">não existe.</em></h1><p class="v2-corpo">O endereço pode ter mudado ou foi digitado errado.</p><div class="flex flex-wrap gap-[12px]"><a href="/" class="v2-botao v2-botao-claro">Página inicial</a><a href="/obras" class="v2-botao v2-botao-linha">Ver as obras</a><a href="/projetar" class="v2-botao v2-botao-linha">Projetar em 3D</a></div></section>`);
}
