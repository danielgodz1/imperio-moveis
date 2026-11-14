---
name: dominancia-seo-local-engajamento
description: Playbook completo de Engenharia de SEO Técnico, Dominância Regional e Hiper-Local (Google Search & Maps), Desambiguação de Homônimos (CNPJ/E-E-A-T), Engajamento por Coordenadas Geográficas, Super-Grafo Schema.org (@graph), Pré-Hidratação Semântica para SPAs (React/Vite/Next), Core Web Vitals (LCP < 1.5s, CLS = 0), Blindagem de Animações 3D/Vídeo e SXO/GEO. Use sempre que o usuário pedir para alavancar um site no Google, dominar buscas locais/regionais, resolver conflito com empresas de nomes parecidos (homônimos), otimizar coordenadas/bairros/cidades vizinhas, ou refatorar SEO técnico e conversão de ponta a ponta.
---

# Dominância de SEO Local, Engajamento Regional e Alavancagem Técnica de Sites

Esta skill consolida toda a engenharia prática usada nos nossos projetos para tirar sites (especialmente aplicações React / Vite / Next.js com experiências visuais pesadas, 3D ou vídeo) da invisibilidade e levá-los ao **TOP 1 do Google Search, Google Maps (Pacote Local) e Motores de Resposta por IA (Google AI Overviews, ChatGPT, Perplexity e Gemini)**.

---

## 1. Quando Ativar Esta Skill

Ative esta skill sempre que a tarefa envolver qualquer um dos seguintes objetivos:
- **"Alavancar um site"** no Google, subir da página 2/3 para o TOP 1 ou superar concorrentes locais/regionais.
- **Desambiguação de Homônimos:** quando existem outras empresas com nome parecido na mesma cidade, estado ou país e o Google mistura avaliações, endereços ou fichas do Google Meu Negócio.
- **Engajamento por Coordenadas e Hiper-Localização:** dominar buscas no raio da cidade-sede (bairros, condomínios fechados, avenidas comerciais) e nas 8 a 15 cidades da microrregião.
- **SEO para SPAs / Sites com 3D ou Vídeo na Hero:** impedir que o `<div id="root"></div>` vazio, o carregamento de WebGL/Three.js ou o `<video>` na primeira dobra destruam o LCP ou atrasem a leitura do `<h1>` pelo Googlebot.
- **Blindagem de Animações em PCs Windows:** garantir que computadores com economia de energia ou efeitos visuais desativados (`prefers-reduced-motion: reduce`) não travem animações de scroll, GSAP, Framer Motion ou notebook 3D.

Para auditorias pontuais complementares, esta skill pode ser combinada com as sub-skills `seo-audit`, `seo-local`, `seo-maps`, `seo-schema`, `seo-technical` e `seo-geo`.

---

## 2. Protocolo de Execução em 8 Fases (Ordem Obrigatória)

### FASE 1: Auditoria de Homônimos e Blindagem de Entidade (E-E-A-T & CNPJ)

Nomes comerciais fortes (ex: *"Império"*, *" Suprema"*, *" Bella Casa"*, *" Prime"*, *" Alfa"*) quase sempre possuem homônimos em outras cidades ou estados. Sem desambiguação explícita, o Knowledge Graph do Google dilui a autoridade do domínio.

**Ações obrigatórias:**
1. **Centralizar a Fonte Única da Verdade (`src/data/empresa.ts`):**
   - `nomeFantasia`: Nome comercial + Cidade (ex: `"Império Móveis Planejados Jaú"`).
   - `razaoSocial`: Razão Social oficial registrada na Receita Federal.
   - `cnpj`: CNPJ formatado (`XX.XXX.XXX/XXXX-XX`).
   - `dataAberturaCnpj`: Data ISO de abertura (`YYYY-MM-DD`).
   - `endereco`: Logradouro, número, bairro, cidade, UF, CEP exato e país (`BR`).
   - `geo`: Coordenadas reais verificadas (`latitude` e `longitude` com pelo menos 4 casas decimais).
   - `googleProfileUrl`: URL com o `cid` oficial da ficha do Google Maps (`https://maps.google.com/?cid=...`).
2. **Estampar Desambiguadores nos 4 Pontos Críticos de Crawl:**
   - Na `<meta name="description">`: incluir Cidade/UF e o CNPJ entre parênteses.
   - Na `<meta name="author">`: `"Nome Fantasia Cidade - CNPJ XX.XXX.XXX/XXXX-XX"`.
   - No `Schema.org` (`#organization`): preencher `legalName`, `taxID`, `foundingDate`, `address`, `geo` e `hasMap`.
   - No `<address>` semântico visível no rodapé de todas as páginas: exibir Nome Fantasia, Razão Social, CNPJ, endereço completo com CEP e telefone clicável (`tel:`).

---

### FASE 2: Engajamento por Coordenadas, Geo-Tagging e Matriz Regional

O algoritmo local do Google (Vicinity / Pigeon / Possum) cruza **coordenadas geográficas**, **entidades municipais conhecidas** e **menções semânticas de bairros/condomínios**.

**Ações obrigatórias:**
1. **Geo Meta Tags no `<head>`:**
   ```html
   <meta name="geo.region" content="BR-SP" />
   <meta name="geo.placename" content="Jaú, São Paulo, Brasil" />
   <meta name="geo.position" content="-22.2964;-48.5586" />
   <meta name="ICBM" content="-22.2964, -48.5586" />
   ```
2. **Anel Hiper-Local (Cidade-Sede):**
   - Mapear e listar explicitamente no conteúdo visível (`<h2>` de Cobertura Regional e rodapé) os principais **bairros residenciais, centros comerciais e condomínios fechados de alto padrão** da cidade-sede (onde estão os clientes de maior ticket).
3. **Anel Microrregional (Cidades Vizinhas com Entidade Wikipedia):**
   - Mapear as 8 a 15 cidades num raio de 40–80 km atendidas pela empresa.
   - No JSON-LD (`areaServed`), declarar cada cidade como objeto `@type: "City"` com `sameAs` apontando para a URL oficial da cidade na **Wikipedia em português** (`https://pt.wikipedia.org/wiki/...`). Isso elimina 100% da ambiguidade geográfica para o Google Knowledge Graph.
4. **Páginas Locais Dedicadas por Serviço/Ambiente (`/servico-cidade`):**
   - Criar rotas dedicadas pré-renderizadas para as buscas comerciais de maior volume (ex: `/cozinhas-planejadas-jau`, `/closets-sob-medida-jau`), cada uma com `<h1>` próprio, fotos reais geolocalizadas, especificações técnicas e Schema `Service` vinculado ao `@id: "#organization"`.

---

### FASE 3: Super-Grafo `Schema.org` (`@graph`) Interconectado

Nunca espalhe scripts JSON-LD desconexos sem `@id`. Construa um **Super-Grafo único (`@graph`)** na página inicial conectando 5 a 6 entidades:

1. **Entidade Principal (`@id: "https://dominio.com.br/#organization"`):**
   - `@type`: Array combinando o tipo amplo e os tipos específicos (ex: `["FurnitureStore", "HomeAndConstructionBusiness", "LocalBusiness"]`).
   - Inclui `name`, `legalName`, `taxID`, `foundingDate`, `url`, `logo`, `telephone` (formato E.164 `+55...`), `priceRange`, `address` (`PostalAddress`), `geo` (`GeoCoordinates`), `hasMap`, `areaServed` (com `sameAs` da Wikipedia), `knowsAbout`, `openingHoursSpecification`, `sameAs` (redes sociais e perfil Google) e `hasOfferCatalog` (lista de `Offer` -> `Service` para cada serviço/ambiente).
2. **`VideoObject` (`@id: "https://dominio.com.br/#video-projeto-3d"`):**
   - Obrigatório sempre que o site tiver vídeo na Hero, apresentação 3D ou tour virtual.
   - Inclui `name`, `description`, `thumbnailUrl`, `uploadDate` (ISO 8601 com fuso `-03:00`), `contentUrl`, `embedUrl`, `duration` (ex: `PT10S`) e `publisher: { "@id": ".../#organization" }`.
3. **`WebSite` (`#website`) & `WebPage` (`#webpage`):**
   - Vinculados a `#organization`, `primaryImageOfPage`, `video: { "@id": ".../#video-projeto-3d" }` e `breadcrumb: { "@id": ".../#breadcrumb" }`.
4. **`BreadcrumbList` (`#breadcrumb`):**
   - Trilha hierárquica com palavras-chave locais nas âncoras.
5. **`FAQPage` (`#faq`):**
   - 6 a 10 perguntas e respostas estratégicas que **devem existir de forma idêntica no HTML visível da página** (em tags `<details><summary><h3>Pergunta</h3></summary><p>Resposta</p></details>`).

---

### FASE 4: Pré-Hidratação Semântica e Prerender no Build (Fim do `<div id="root"></div>` Vazio)

Em aplicações React / Vite, um `<div id="root"></div>` vazio ou com apenas uma frase curta obriga o Googlebot a aguardar a fila de renderização JavaScript (WRS — Web Rendering Service), o que atrasa a indexação e reduz a pontuação de relevância semântica.

**Ações obrigatórias:**
1. **Gerador de HTML Semântico Inicial (`prerenderHtml.ts` / `prerenderV2.ts`):**
   - Durante o `vite build` (plugin `closeBundle`), gerar o HTML estático completo de cada rota pública (`/`, `/contato`, `/obras`, páginas locais, `/obras/:id`, `/404.html`).
   - O `<div id="root">` do `index.html` deve conter a estrutura semântica completa: `<header>`, `<main>`, `<section id="hero">` com o `<h1>` definitivo e a imagem pôster com `fetchpriority="high"`, todas as seções `<h2>` e `<h3>`, as perguntas do FAQ em `<details>` e o `<footer>` com `<address>`.
2. **Hidratação Sem Pulo Visual (Zero-Flicker LCP):**
   - No `src/main.tsx`, capturar a referência da imagem pôster já presente no HTML inicial (`window.__posterInicial = document.querySelector('#root .poster-notebook-v2')`).
   - Aguardar `document.fonts.ready` e `img.decode()` (com timeout de segurança de 3s) antes de chamar `createRoot(root).render(<App />)`.
   - No componente React da Hero, reaproveitar o mesmo elemento `<img>` (`__posterInicial`) até o vídeo ou canvas 3D ter o primeiro quadro pronto. Assim o navegador registra o **LCP instantaneamente no HTML estático (< 1.0s)** sem reiniciá-lo na montagem do React.

---

### FASE 5: Blindagem de Animações (`prefers-reduced-motion`) e Core Web Vitals

Muitos notebooks e desktops Windows corporativos ou em modo de economia de bateria reportam `prefers-reduced-motion: reduce` ao navegador sem que o usuário saiba, desativando animações CSS, Framer Motion, GSAP e cenas 3D.

**Ações obrigatórias:**
1. **Interceptador Inline no `<head>` do `index.html` (antes de qualquer script):**
   - Sobrescrever `window.matchMedia` com um `Proxy` para que consultas `(prefers-reduced-motion: reduce)` retornem `matches: false` e `(prefers-reduced-motion: no-preference)` retornem `matches: true`.
2. **Remoção de Bloqueios CSS e Configuração Motion:**
   - Remover blocos `@media (prefers-reduced-motion: reduce)` que zerem `animation` ou `transition` nos arquivos `.css`.
   - Envolver a árvore principal do React em `<MotionConfig reducedMotion="never">`.
3. **Otimização de Vídeo e 3D na Hero (`LCP < 1.5s`):**
   - Carregar Three.js / React Three Fiber via `React.lazy` somente após a primeira interação do usuário (`scroll`, `wheel`, `touchstart`, `pointermove`).
   - No `<video>`: usar obrigatoriamente `muted playsInline loop preload="metadata" poster="/videos/poster.jpg"`.
4. **Imagens com `CLS = 0` e `alt` Geolocalizado:**
   - Servir imagens em `<picture>` com fontes `image/avif` e `image/webp` em múltiplos tamanhos (`800w`, `1600w`) e `<img>` com `width`, `height` e `style="aspect-ratio: W / H"`.
   - **Proibido `alt=""` vazio em fotos de conteúdo:** toda foto de obra, produto ou projeto deve seguir a fórmula:
     `"[Produto/Ambiente] sob medida [Material/Detalhe] em [Cidade UF] - [Nome da Empresa]"`.

---

### FASE 6: Engenharia de Conteúdo Semântico (`H1` -> `H2` -> `H3`), GEO (IA) e SXO

O conteúdo visível da Home deve responder simultaneamente às buscas transacionais, informacionais e geográficas:

1. **Hierarquia Estrita de Cabeçalhos (Validada por Axe/WCAG):**
   - **Exatamente UM `<h1>` por página**, visível no frame 0:
     `"[Palavra-Chave Principal] em [Cidade] e Região: [Diferencial Técnico Principal]"`
   - **`<h2>` de Diferencial Tecnológico / Processo:** explicando como o projeto é feito (ex: do projeto 3D realista no notebook à execução na fábrica).
   - **`<h2>` de Catálogo de Ambientes / Serviços (Cauda Longa):** dividido em subseções `<h3>` com `id` próprio (`#cozinhas`, `#closets`, `#salas`, `#gourmet`, `#banheiros`, `#corporativo`) detalhando materiais, espessuras, ferragens e acabamentos.
   - **`<h2>` de Parceria Técnica / B2B:** voltado a arquitetos, engenheiros, designers ou empresas parceiras, destacando fidelidade executiva, contrato com CNPJ e formas de pagamento.
   - **`<h2>` de Perguntas Frequentes (`#faq`):** renderizando em acordeão HTML nativo (`<details>/<summary>`) todas as perguntas do Schema `FAQPage`.
   - **`<h2>` de Cobertura Geográfica Hiper-Local:** listando nominalmente os bairros/condomínios da cidade-sede e as cidades da região, acompanhado do mapa embarcado e ficha técnica de atendimento.
2. **SXO (Search Experience Optimization) & Rastreadores de Conversão:**
   - Botões de ação com intenção local explícita (*"Solicitar Projeto 3D e Orçamento em Jaú"*).
   - Todos os links de WhatsApp devem incluir mensagem contextualizada pré-preenchida e parâmetros UTM (`utm_source=site&utm_medium=cta_whatsapp&utm_campaign=...`) + disparo de evento GA4 (`whatsapp_click` / `generate_lead`).

---

### FASE 7: `robots.txt`, `sitemap.xml` (Imagem + Vídeo) e `vercel.json`

1. **`public/robots.txt`:**
   - Permitir rastreamento total (`User-agent: *`, `Allow: /`), bloquear apenas rotas internas de teste/legado (`Disallow: /v1`, `Disallow: /experiencias`) e apontar `Sitemap: https://dominio.com.br/sitemap.xml`.
2. **`sitemap.xml` com Extensões `xmlns:image` e `xmlns:video`:**
   - Gerar automaticamente no build (`vite.config.ts`) tanto em `dist/sitemap.xml` quanto em `public/sitemap.xml`.
   - Incluir `<lastmod>`, `<changefreq>weekly</changefreq>`, `<priority>1.0</priority>` na raiz, tags `<image:image>` para todas as fotos de cada rota e `<video:video>` para o vídeo de apresentação na Home.
3. **`vercel.json` (Performance Edge & Segurança):**
   - Cache imutável de 1 ano (`public, max-age=31536000, immutable`) para `/assets/(.*)`, `/fontes/(.*)` e `/videos/(.*)`.
   - Cache com revalidação (`public, max-age=604800, stale-while-revalidate=86400`) para fotos de obras/produtos.
   - Headers de segurança (`Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy` limpo sem diretivas obsoletas como `interest-cohort=()`).

---

### FASE 8: Auditoria Automatizada e Verificação Pós-Implementação

Antes de concluir qualquer tarefa de alavancagem SEO, execute obrigatoriamente:
1. `node .agents/skills/dominancia-seo-local-engajamento/scripts/auditar-alavancagem-seo.mjs` (audita o projeto e o HTML gerado).
2. `npm run lint` (`tsc --noEmit` sem erros).
3. `npm test` (100% dos testes unitários passando).
4. `npm run build` (pré-renderização estática e geração do `sitemap.xml` concluídas sem erros).

Consulte também:
- Templates de código prontos em [references/templates-codigo-seo.md](references/templates-codigo-seo.md)
- Script de auditoria automatizada em [scripts/auditar-alavancagem-seo.mjs](scripts/auditar-alavancagem-seo.mjs)

