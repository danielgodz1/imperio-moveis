import {
  METADADOS_ROTAS_SEO,
  PAGINAS_AMBIENTES_LOCAIS,
  RotaPublica,
  TEXTO_HERO,
  gerarJsonLdFurnitureStore,
} from '../data/paginasLocais';
import { EMPRESA } from '../data/empresa';
import { gerarJsonLdPerguntas } from '../data/perguntas';

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

export function gerarConteudoInicialRoot(rota: RotaPublica): string {
  const meta = METADADOS_ROTAS_SEO[rota];

  if (rota in PAGINAS_AMBIENTES_LOCAIS) {
    const cfg =
      PAGINAS_AMBIENTES_LOCAIS[rota as keyof typeof PAGINAS_AMBIENTES_LOCAIS];
    const paragrafos = cfg.paragrafosReais
      .map((p) => `<p>${escaparHtml(p)}</p>`)
      .join('\n          ');
    const fotos = cfg.fotos
      .map(
        (f) =>
          `<figure><img src="${escaparHtml(f.srcBase)}.jpg" alt="${escaparHtml(
            f.alt
          )}" loading="lazy" /><figcaption>${escaparHtml(
            f.legenda
          )}</figcaption></figure>`
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
        <h1>${escaparHtml(meta.h1Inicial)}</h1>
        <p>${escaparHtml(meta.resumoHtmlInicial)}</p>
        <p>Atendimento em ${escaparHtml(
          EMPRESA.cidadesAtendidas.join(', ')
        )}. WhatsApp: ${escaparHtml(EMPRESA.telefone)}.</p>
      </main>`;
  }

  // Home: mesmo visual do hero (fundo preto, título tipo-h1 no rodapé da tela). O texto já pinta
  // no tamanho final antes do JavaScript, e a troca pelo React não muda o maior conteúdo da tela.
  return `<main class="bg-preto text-papel min-h-[100svh] flex flex-col justify-end px-16 sm:px-32 lg:px-48 pt-96 pb-24 lg:pb-48">
        <h1 class="tipo-h1 text-papel"><span class="block tipo-cota text-dourado mb-8">${escaparHtml(TEXTO_HERO.chamada)}</span>${escaparHtml(meta.h1Inicial)}</h1>
        <p class="tipo-corpo text-papel/85 mt-16 max-w-[46ch]">${escaparHtml(meta.resumoHtmlInicial)}</p>
        <p class="tipo-cota text-papel/70 mt-16 max-w-[46ch]">${escaparHtml(EMPRESA.nome)} — ${escaparHtml(
          EMPRESA.fundadores
        )}. Marcenaria e arquitetura de interiores em ${escaparHtml(
          EMPRESA.cidadesAtendidas.join(', ')
        )}.</p>
      </main>`;
}

/** Trilha (Início > página) e serviço da página local, ligado à empresa pelo @id. */
function jsonLdPagina(rota: RotaPublica): string {
  // Home: perguntas frequentes (ajudam o Google e as respostas de IA a entender o serviço).
  if (rota === '/') {
    return `<script type="application/ld+json">${JSON.stringify(gerarJsonLdPerguntas()).replace(/</g, '\\u003c')}</script>`;
  }
  if (!(rota in PAGINAS_AMBIENTES_LOCAIS)) return '';
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
      provider: { '@id': `${EMPRESA.url}/#empresa` },
      areaServed: EMPRESA.cidadesAtendidas.map((c) => ({ '@type': 'City', name: c })),
      image: cfg.fotos.map((f) => `${EMPRESA.url}${f.srcBase}.jpg`),
    },
  ];
  return dados
    .map((d) => `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, '\\u003c')}</script>`)
    .join('');
}

export function injetarSeoNoHtml(htmlBase: string, pathname: string): string {
  const rota = normalizarRotaSeo(pathname);
  const meta = METADADOS_ROTAS_SEO[rota];
  const jsonLd = JSON.stringify(gerarJsonLdFurnitureStore()).replace(/</g, '\\u003c');
  const rootHtml = gerarConteudoInicialRoot(rota);

  let html = htmlBase;

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
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:image" content="${escaparHtml(meta.ogImage)}" />`
  );

  html = html.replace(
    /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script type="application/ld+json">${jsonLd}</script>${jsonLdPagina(rota)}`
  );

  html = html.replace(
    /<div id="root">[\s\S]*?<\/div>/,
    `<div id="root">${rootHtml}</div>`
  );

  return html;
}
