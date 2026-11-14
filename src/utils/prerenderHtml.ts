import {
  METADADOS_ROTAS_SEO,
  PAGINAS_AMBIENTES_LOCAIS,
  RotaPublica,
  TEXTO_HERO,
  gerarImageObjectSchema,
  gerarJsonLdFurnitureStore,
  gerarSuperGrafoJsonLd,
} from '../data/paginasLocais';
import { EMPRESA } from '../data/empresa';
import { RESUMO_GOOGLE } from '../data/avaliacoesGoogle';
import { htmlAmbiente, htmlContato, htmlFoto, htmlInicio, htmlLegal, htmlObras, htmlProjetar, htmlProjetos3D, html404 } from '../v2/prerenderV2';
import { META_PROJETOS_3D, NOME_AMBIENTE, metaFoto } from '../v2/rotasV2';
import { PROJETOS_3D } from '../data/projetos3d';
import type { ObraItem } from '../types';
import { METADADOS_FASES, PAINEL_DESKTOP } from '../components/heroScroll/useHeroScrollStore';
import { DOCUMENTOS_LEGAIS, dataPorExtenso } from '../data/legal';
import { OBRAS_REAIS } from '../data/portfolioData';

function escaparHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function normalizarRotaSeo(pathname: string): RotaPublica {
  const semQuery = pathname.split('?')[0].split('#')[0];
  const limpa = semQuery.replace(/\/+$/, '') || '/';
  if (limpa in METADADOS_ROTAS_SEO) {
    return limpa as RotaPublica;
  }
  return '/';
}

/**
 * Foto no HTML inicial igual ao componente Foto: AVIF/WebP em 800 e 1600 px, JPG só de reserva,
 * largura e altura reais (o navegador reserva o espaço e a página não pula ao carregar).
 */
export function fotoEstatica(srcBase: string, alt: string, proporcao: string, opcoes: { prioridade?: boolean; sizes?: string } = {}): string {
  const [w, h] = proporcao.split('/').map((n) => Math.round(parseFloat(n)) || 1);
  const sizes = opcoes.sizes ?? '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw';
  const b = escaparHtml(srcBase);
  return `<picture style="display:block;aspect-ratio:${w} / ${h}"><source type="image/avif" srcset="${b}-800.avif 800w, ${b}-1600.avif 1600w" sizes="${sizes}" /><source type="image/webp" srcset="${b}-800.webp 800w, ${b}-1600.webp 1600w" sizes="${sizes}" /><img src="${b}.jpg" alt="${escaparHtml(alt)}" width="${w}" height="${h}" ${
    opcoes.prioridade ? 'fetchpriority="high"' : 'loading="lazy"'
  } decoding="async" style="width:100%;height:auto;display:block" /></picture>`;
}

/** HTML inicial do site (V2, em produção). */
export function gerarConteudoInicialRoot(rota: RotaPublica): string {
  if (rota in PAGINAS_AMBIENTES_LOCAIS) {
    const amb = rota as keyof typeof PAGINAS_AMBIENTES_LOCAIS;
    return htmlAmbiente(amb, NOME_AMBIENTE[amb]);
  }
  if (rota === '/obras') return htmlObras();
  if (rota === '/projetar') return htmlProjetar();
  if (rota === '/contato') return htmlContato();
  if (rota === '/privacidade' || rota === '/termos') return htmlLegal(rota);
  return htmlInicio();
}

/** HTML inicial da V1 (layout anterior, guardado em /v1). */
export function gerarConteudoInicialRootV1(rota: RotaPublica): string {
  const meta = METADADOS_ROTAS_SEO[rota];

  if (rota in PAGINAS_AMBIENTES_LOCAIS) {
    const cfg =
      PAGINAS_AMBIENTES_LOCAIS[rota as keyof typeof PAGINAS_AMBIENTES_LOCAIS];
    const paragrafos = cfg.paragrafosReais
      .map((p) => `<p>${escaparHtml(p)}</p>`)
      .join('\n          ');
    const fotos = cfg.fotos
      .map(
        (f, i) =>
          `<figure>${fotoEstatica(f.srcBase, f.alt, f.razao, { prioridade: i === 0 })}<figcaption>${escaparHtml(f.legenda)}</figcaption></figure>`
      )
      .join('\n          ');

    return `<main class="max-w-[1280px] mx-auto px-16 py-64">
        <article>
          <h1>${escaparHtml(cfg.h1)}</h1>
          <p>${escaparHtml(cfg.subtitulo)}</p>
          ${paragrafos}
          <section aria-label="Obras reais executadas pela Império">
            ${fotos}
          </section>
          <p><a href="/#obras">Ver portfólio completo de obras</a> | <a href="/contato">Pedir orçamento no WhatsApp ${escaparHtml(
            EMPRESA.telefone
          )}</a></p>
        </article>
      </main>`;
  }

  if (rota === '/obras') {
    const itens = OBRAS_REAIS.map(
      (o, i) =>
        `<figure class="flex flex-col gap-8">${fotoEstatica(o.arquivo, o.alt, o.proporcao, { prioridade: i === 0 })}<figcaption><strong>${escaparHtml(
          o.titulo
        )}</strong>. ${escaparHtml(o.cota)}</figcaption></figure>`
    ).join('\n          ');
    return `<main class="max-w-[1280px] mx-auto px-16 py-144">
        <h1 class="tipo-h1">${escaparHtml(meta.h1Inicial)}</h1>
        <p>${escaparHtml(meta.resumoHtmlInicial)}</p>
        <section aria-label="Obras reais executadas pela Império" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-32 items-start">
          ${itens}
        </section>
        <p><a href="/contato">Pedir orçamento</a> | <a href="/projetar">Montar o ambiente em 3D</a></p>
      </main>`;
  }

  if (rota in DOCUMENTOS_LEGAIS) {
    const doc = DOCUMENTOS_LEGAIS[rota as keyof typeof DOCUMENTOS_LEGAIS];
    const secoes = doc.secoes
      .map(
        (s) =>
          `<section><h2>${escaparHtml(s.titulo)}</h2>${s.paragrafos.map((p) => `<p>${escaparHtml(p)}</p>`).join('')}${
            s.itens ? `<ul>${s.itens.map((i) => `<li>${escaparHtml(i)}</li>`).join('')}</ul>` : ''
          }</section>`
      )
      .join('\n          ');
    return `<main class="max-w-[760px] mx-auto px-16 py-144">
        <article>
          <h1 class="tipo-h1">${escaparHtml(doc.titulo)}</h1>
          <p>${escaparHtml(doc.resumo)}</p>
          <p>Última atualização: <time datetime="${doc.atualizadoEm}">${dataPorExtenso(doc.atualizadoEm)}</time></p>
          ${secoes}
          ${
            doc.fontes
              ? `<section><h2>Fontes oficiais</h2><ul>${doc.fontes
                  .map((f) => `<li><a href="${escaparHtml(f.url)}" rel="noopener">${escaparHtml(f.rotulo)}</a></li>`)
                  .join('')}</ul></section>`
              : ''
          }
          <p><a href="/contato">Contato e suporte</a> | <a href="/">Voltar ao site</a></p>
        </article>
      </main>`;
  }

  if (rota === '/projetar') {
    return `<main class="bg-preto text-papel min-h-[60svh] px-16 sm:px-32 lg:px-48 pt-144 pb-48">
        <h1 class="tipo-h1 text-papel">${escaparHtml(meta.h1Inicial)}</h1>
        <p class="tipo-corpo text-papel/85 mt-16 max-w-[56ch]">${escaparHtml(meta.resumoHtmlInicial)}</p>
        <p class="tipo-cota text-papel/70 mt-16">Visualização aproximada. O projeto final da ${escaparHtml(
          EMPRESA.nome
        )} é detalhado após a medição no local.</p>
      </main>`;
  }

  if (rota === '/contato') {
    return `<main class="max-w-[1280px] mx-auto px-16 py-64">
        <h1 class="tipo-h1 text-grafite">${escaparHtml(meta.h1Inicial)}</h1>
        <p>${escaparHtml(meta.resumoHtmlInicial)}</p>
        <p>Atendimento em ${escaparHtml(
          EMPRESA.cidadesAtendidas.join(', ')
        )}. WhatsApp: ${escaparHtml(EMPRESA.telefone)}.</p>
      </main>`;
  }

  const fase = METADADOS_FASES.traco;
  const painel = `clamp(${PAINEL_DESKTOP.min}px, ${PAINEL_DESKTOP.vw * 100}vw, ${PAINEL_DESKTOP.max}px)`;
  const nota = String(RESUMO_GOOGLE.nota).replace('.', ',');
  return `<section id="hero" class="relative w-full bg-preto text-papel" style="min-height:300vh">
      <div class="sticky top-0 h-screen h-[100svh] w-full overflow-hidden flex flex-col lg:block">
        <div class="relative flex-1 min-h-0 lg:absolute lg:inset-0" aria-hidden="true">
          <div class="palco-estatico absolute inset-0 overflow-x-clip bg-[#050505]">
            <img class="poster-notebook-estatico" src="/videos/notebook-poster.jpg" alt="Apresentação de Projeto 3D de Cozinha Planejada Sob Medida em Jaú SP - Império Móveis Planejados" width="1280" height="720" fetchpriority="high" decoding="async" />
          </div>
        </div>
        <div class="relative shrink-0 flex flex-col justify-end lg:absolute lg:inset-y-0 lg:left-0 lg:w-[var(--painel)]" style="--painel: ${painel}">
          <div class="absolute inset-0 bg-preto"></div>
          <div class="relative px-16 sm:px-32 lg:px-48 pt-24 lg:pt-48 pb-24 lg:pb-48">
            <div aria-hidden="true" class="mb-16 lg:mb-24">
              <p class="tipo-cota text-papel flex items-baseline gap-8"><span class="text-dourado">${fase.numero}/05</span><span>${escaparHtml(fase.titulo)}</span></p>
              <p class="tipo-cota text-papel/70 mt-4 hidden sm:block">${escaparHtml(fase.detalhe)}</p>
              <div class="relative h-[2px] mt-8 bg-papel/20"></div>
              <span class="tipo-cota text-papel/70 inline-block mt-8">Role para construir a cozinha</span>
            </div>
            <h1 class="tipo-h1 text-papel"><span class="block tipo-cota text-dourado mb-8">${escaparHtml(TEXTO_HERO.chamada)}</span>${escaparHtml(TEXTO_HERO.titulo)}</h1>
            <p class="tipo-corpo text-papel/85 mt-16 max-w-[46ch]">${escaparHtml(meta.resumoHtmlInicial)}</p>
            <div class="flex flex-wrap items-center gap-x-16 gap-y-8 mt-24">
              <a href="/contato" class="inline-flex items-center justify-center gap-2 h-[52px] px-6 rounded-curto bg-dourado text-preto font-semibold">Solicitar Projeto 3D e Orçamento em Jaú</a>
              <a href="/obras" class="inline-flex items-center justify-center h-[52px] px-6 rounded-curto border-[1.5px] border-papel text-papel font-semibold">Ver as obras</a>
            </div>
            <button type="button" class="inline-flex items-center gap-8 mt-16 tipo-cota text-papel underline underline-offset-4 decoration-1 cursor-pointer"><span class="flex items-center gap-[2px]" aria-hidden="true">${'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-[14px] h-[14px] fill-dourado text-dourado" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'.repeat(5)}</span>${nota} no Google, ${RESUMO_GOOGLE.total} avaliações</button>
            <p class="sr-only">${escaparHtml(EMPRESA.nome)}. Arquiteta, produção e montagem próprias. Marcenaria e arquitetura de interiores em ${escaparHtml(
              EMPRESA.cidadesAtendidas.join(', ')
            )}.</p>
          </div>
        </div>
      </div>
    </section>`;
}

/** Trilha (Início > página) e serviço da página local, ligado à empresa pelo @id. */
function jsonLdPagina(rota: RotaPublica): string {
  const bloco = (d: unknown) => `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, '\\u003c')}</script>`;
  if (rota === '/') {
    return '';
  }
  if (rota === '/obras') {
    const meta = METADADOS_ROTAS_SEO[rota];
    return (
      bloco({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: `${EMPRESA.url}/` },
          { '@type': 'ListItem', position: 2, name: 'Obras', item: meta.canonical },
        ],
      }) +
      bloco({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: meta.h1Inicial,
        itemListElement: OBRAS_REAIS.map((o, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: gerarImageObjectSchema({
            url: `${EMPRESA.url}${o.arquivo}.jpg`,
            name: o.titulo,
            description: o.alt,
            caption: o.cota,
          }),
        })),
      })
    );
  }
  if (!(rota in PAGINAS_AMBIENTES_LOCAIS)) {
    const meta = METADADOS_ROTAS_SEO[rota];
    return bloco({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: `${EMPRESA.url}/` },
        { '@type': 'ListItem', position: 2, name: meta.h1Inicial, item: meta.canonical },
      ],
    });
  }
  const cfg = PAGINAS_AMBIENTES_LOCAIS[rota as keyof typeof PAGINAS_AMBIENTES_LOCAIS];
  const url = METADADOS_ROTAS_SEO[rota].canonical;
  const dados = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: `${EMPRESA.url}/` },
        { '@type': 'ListItem', position: 2, name: cfg.h1, item: url },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: cfg.h1,
      description: cfg.descricaoSeo,
      url,
      provider: { '@id': `${EMPRESA.url}/#organization` },
      areaServed: EMPRESA.cidadesSchema.map((c) => ({ '@type': 'City', name: `${c.nome}, ${c.uf}`, sameAs: c.wikipedia })),
      image: cfg.fotos.map((f) =>
        gerarImageObjectSchema({
          url: `${EMPRESA.url}${f.srcBase}.jpg`,
          name: f.alt,
          caption: f.legenda,
        })
      ),
    },
  ];
  return dados
    .map((d) => `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, '\\u003c')}</script>`)
    .join('');
}

/**
 * Página 404 de verdade: endereço que não existe responde com status 404 (a Vercel serve este
 * arquivo), em vez de devolver a home com status 200 ("soft 404", que o Google desaconselha).
 * Sem o JavaScript do site: é só texto e links.
 */
export function gerarHtml404(htmlBase: string): string {
  const corpo = html404();
  return htmlBase
    .replace(/<title>[\s\S]*?<\/title>/, `<title>Página não encontrada | ${escaparHtml(EMPRESA.nome)}</title>`)
    .replace(/<meta\s+name="robots"[^>]*>/, '<meta name="robots" content="noindex" />')
    .replace(/<link\s+rel="canonical"[^>]*>/, '')
    .replace(/<div id="root">[\s\S]*<\/div>(?=\s*<script|\s*<\/body>)/, `<div id="root">${corpo}</div>`)
    .replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/g, '')
    .replace(/<script\s+type="module"[^>]*><\/script>/g, '')
    .replace(/<link\s+rel="modulepreload"[^>]*>/g, '');
}

/**
 * Título, descrição, canônico, Open Graph, dados estruturados e HTML inicial de uma rota.
 * `versao: 'v1'` gera o HTML do layout anterior (para /v1, fora do Google).
 */
export function injetarSeoNoHtml(htmlBase: string, pathname: string, versao: 'v1' | 'v2' = 'v2'): string {
  const rota = normalizarRotaSeo(pathname);
  const meta = METADADOS_ROTAS_SEO[rota];
  const jsonLdBloco =
    rota === '/'
      ? `<script type="application/ld+json">${JSON.stringify(gerarSuperGrafoJsonLd()).replace(/</g, '\\u003c')}</script>`
      : `<script type="application/ld+json">${JSON.stringify(gerarJsonLdFurnitureStore()).replace(/</g, '\\u003c')}</script>${jsonLdPagina(rota)}`;
  const rootHtml = versao === 'v1' ? gerarConteudoInicialRootV1(rota) : gerarConteudoInicialRoot(rota);

  let html = htmlBase;
  if (rota !== '/') {
    html = html.replace(/<link\s+rel="preload"\s+as="image"\s+href="\/videos\/notebook-poster\.jpg"[^>]*>\s*/g, '');
  }

  html = html.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${escaparHtml(meta.title)}</title>`
  );

  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escaparHtml(meta.description)}" />`
  );

  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"[^>]*\/?>/,
    `<link rel="canonical" href="${escaparHtml(meta.canonical)}" />`
  );

  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escaparHtml(meta.title)}" />`
  );

  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escaparHtml(meta.description)}" />`
  );

  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${escaparHtml(meta.canonical)}" />`
  );

  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:image" content="${escaparHtml(meta.ogImage)}" />`
  );

  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${escaparHtml(meta.title)}" />`
  );

  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${escaparHtml(meta.description)}" />`
  );

  html = html.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:image" content="${escaparHtml(meta.ogImage)}" />`
  );

  html = html.replace(
    /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>(?:\s*<script\s+type="application\/ld\+json">[\s\S]*?<\/script>)*/,
    jsonLdBloco
  );

  html = html.replace(
    /<div id="root">[\s\S]*<\/div>(?=\s*<script|\s*<\/body>)/,
    `<div id="root">${rootHtml}</div>`
  );

  return html;
}

/** Página de uma foto de obra (/obras/:id): meta própria, ImageObject e trilha. */
export function injetarSeoFoto(htmlBase: string, obra: ObraItem): string {
  const meta = metaFoto(obra);
  const imagem = `${EMPRESA.url}${obra.arquivo}.jpg`;
  const bloco = (d: unknown) => `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, '\\u003c')}</script>`;
  const dados =
    bloco(gerarJsonLdFurnitureStore()) +
    bloco({
      '@context': 'https://schema.org',
      ...gerarImageObjectSchema({
        url: imagem,
        name: obra.titulo,
        description: obra.alt,
        caption: obra.cota,
      }),
    }) +
    bloco({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: `${EMPRESA.url}/` },
        { '@type': 'ListItem', position: 2, name: 'Obras', item: `${EMPRESA.url}/obras` },
        { '@type': 'ListItem', position: 3, name: obra.titulo, item: meta.canonico },
      ],
    });
  return htmlBase
    .replace(/<link\s+rel="preload"\s+as="image"\s+href="\/videos\/notebook-poster\.jpg"[^>]*>\s*/g, '')
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escaparHtml(meta.titulo)}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${escaparHtml(meta.descricao)}" />`)
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"[^>]*\/?>/, `<link rel="canonical" href="${escaparHtml(meta.canonico)}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escaparHtml(meta.titulo)}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${escaparHtml(meta.descricao)}" />`)
    .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${escaparHtml(meta.canonico)}" />`)
    .replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${escaparHtml(imagem)}" />`)
    .replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${escaparHtml(imagem)}" />`)
    .replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>(?:\s*<script\s+type="application\/ld\+json">[\s\S]*?<\/script>)*/, dados)
    .replace(/<div id="root">[\s\S]*<\/div>(?=\s*<script|\s*<\/body>)/, `<div id="root">${htmlFoto(obra)}</div>`);
}

/** Página dos projetos 3D (/projetos-3d): meta própria, galeria de imagens e trilha. */
export function injetarSeoProjetos3D(htmlBase: string): string {
  const meta = META_PROJETOS_3D;
  const capa = `${EMPRESA.url}${PROJETOS_3D[0]?.arquivo ?? '/projetar/cozinha-render'}.jpg`;
  const bloco = (d: unknown) => `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, '\\u003c')}</script>`;
  const dados =
    bloco(gerarJsonLdFurnitureStore()) +
    bloco({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: meta.titulo,
      description: meta.descricao,
      url: meta.canonico,
      hasPart: PROJETOS_3D.map((p) =>
        gerarImageObjectSchema({
          url: `${EMPRESA.url}${p.arquivo}.jpg`,
          name: p.nome,
          description: p.descricao,
          caption: `${p.nome} — ${p.descricao}`,
        })
      ),
    }) +
    bloco({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: `${EMPRESA.url}/` },
        { '@type': 'ListItem', position: 2, name: 'Projetos 3D', item: meta.canonico },
      ],
    });
  return htmlBase
    .replace(/<link\s+rel="preload"\s+as="image"\s+href="\/videos\/notebook-poster\.jpg"[^>]*>\s*/g, '')
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escaparHtml(meta.titulo)}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${escaparHtml(meta.descricao)}" />`)
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"[^>]*\/?>/, `<link rel="canonical" href="${escaparHtml(meta.canonico)}" />`)
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escaparHtml(meta.titulo)}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${escaparHtml(meta.descricao)}" />`)
    .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${escaparHtml(meta.canonico)}" />`)
    .replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/, `<meta property="og:image" content="${escaparHtml(capa)}" />`)
    .replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/, `<meta name="twitter:image" content="${escaparHtml(capa)}" />`)
    .replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>(?:\s*<script\s+type="application\/ld\+json">[\s\S]*?<\/script>)*/, dados)
    .replace(/<div id="root">[\s\S]*<\/div>(?=\s*<script|\s*<\/body>)/, `<div id="root">${htmlProjetos3D()}</div>`);
}
