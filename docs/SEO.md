# SEO local — "móveis planejados em Jaú"

Objetivo: aparecer no topo para buscas como "móveis planejados Jaú", "marcenaria Jaú", "cozinha planejada Jaú" e nas cidades vizinhas.

Domínio canônico: `https://www.imperiomoveisplanejadosjau.com.br` (definido em `src/data/empresa.ts`, `index.html`, `public/sitemap.xml` e `public/robots.txt`).

## O que já está no site

- Título da home começando pela busca principal: "Móveis Planejados em Jaú/SP | Império Móveis Planejados".
- Descrição, texto do hero e conteúdo pré-renderizado com "móveis planejados" e "Jaú e região".
- Páginas próprias e pré-renderizadas: cozinhas, quartos, closets e home office em Jaú, cada uma com título, descrição, canonical e imagem de compartilhamento.
- Páginas locais com JSON-LD `BreadcrumbList` e `Service` ligados à empresa pelo `@id`.
- Google Tag Manager `GTM-KRTQ85BD` em todas as páginas (GA4 configurado dentro do GTM).
- JSON-LD `FurnitureStore` com `@id`, logo, fundadores, cidades atendidas, Instagram e imagens reais.
- `sitemap.xml` gerado no build (`vite.config.ts`) a partir das rotas pré-renderizadas, com a data do último commit e as fotos de obra de cada página (sitemap de imagens); sem `changefreq`/`priority`, que o Google ignora, `robots.txt`, `og:url`, `robots` e geolocalização (BR-SP, Jaú).
- H1 da home com a busca principal: linha "Móveis planejados em Jaú/SP" dentro do H1, acima do título.
- `FAQPage` na home com as perguntas confirmadas (`src/data/perguntas.ts`), as mesmas exibidas no fechamento.
- Página `/projetar` (3D online grátis) pré-renderizada, no sitemap e com imagem própria.
- Verificação do Search Console por meta tag (`google-site-verification` no `index.html`) e por arquivo (`public/googlef1a68e75a1cb04cf.html`). A Vercel serve o arquivo também sem `.html` (cleanUrls); se a verificação por arquivo falhar por redirecionamento, a meta tag basta.
- Desempenho: fontes não usadas removidas e 3D só em aparelhos que aguentam (Core Web Vitals contam no ranking).

## Avaliações do Google no site

A seção "O que dizem os clientes no Google" mostra a nota e o total do Perfil da Empresa. Com a chave da API do Google Places, mostra também até 5 avaliações reais, com foto e nome do autor (como o Google exige). Para ligar:

1. No Google Cloud (console.cloud.google.com), crie um projeto, ative a **Places API (New)** e crie uma **chave de API**. Restrinja a chave a essa API.
2. Na Vercel do projeto, em Settings > Environment Variables, crie `GOOGLE_PLACES_API_KEY` com a chave (Production). Opcional: `GOOGLE_PLACE_ID` com o Place ID da Império.
3. Faça um novo deploy. A resposta fica em cache por 1 dia, então são poucas chamadas por dia (dentro da cota gratuita).

Sem a chave, o site mostra o resumo de `src/data/avaliacoesGoogle.ts` (nota e total conferidos à mão) e os botões para ler e escrever avaliações. Avaliações não são copiadas do Google para o código: os termos do Google só permitem exibir pela API.

## Ícone no resultado do Google

Favicons quadrados com lado múltiplo de 48 px (`favicon.ico` 48, `favicon-96.png`, `favicon-192.png`), declarados no `<head>` de todas as páginas. O Google atualiza o ícone quando volta a rastrear a página inicial (dias a semanas); pedir "Solicitar indexação" da home no Search Console acelera.

## O que mais pesa e depende de você (ordem de impacto)

1. **Perfil da Empresa no Google (Google Meu Negócio).** É o que coloca a loja no mapa e no "pacote local" da busca. Categoria principal: "Loja de móveis planejados" ou "Marceneiro". Endereço, horário, telefone e fotos reais. Depois de criado, coloque o link em `googleProfileUrl` em `empresa.ts`.
2. **Avaliações reais no Google**, pedidas a cada obra entregue, de preferência citando o ambiente e a cidade. Elas também substituem as avaliações de exemplo do site.
3. **Confirmar endereço e horário** e marcar `confirmado.endereco` e `confirmado.horarios` como `true` em `empresa.ts`. O JSON-LD passa a publicar endereço, coordenadas e horário (hoje fica de fora para não informar dado errado).
4. **Mesmo nome, endereço e telefone** em todo lugar: site, Google, Instagram, Facebook e diretórios locais.
5. **Google Search Console:** usar a propriedade de domínio (cobre com e sem www) e enviar `https://www.imperiomoveisplanejadosjau.com.br/sitemap.xml`.
6. **Projeto antigo na Vercel:** o `imperio-moveis.vercel.app` da conta anterior continua publicando o mesmo site. O canonical já aponta para o domínio novo, mas o ideal é redirecionar esse endereço para `https://www.imperiomoveisplanejadosjau.com.br` (Settings > Domains do projeto antigo) ou pausar o projeto.
7. **Redirecionar o domínio antigo:** se algum dia `imperiomoveisjau.com.br` foi divulgado, apontá-lo com redirecionamento 301 para o novo.

## Concorrência em Jaú (pesquisa de 11/11/2026)

Para "móveis planejados Jaú", o topo é ocupado por páginas do Facebook (Be.home, Nova Imperial, MC, Devitte, Bella Casa) e por diretórios (Solutudo, Econodata, Comércio São Paulo). Quase nenhuma marcenaria local tem site próprio bem posicionado. A Império não aparece em nenhum desses diretórios (o "Império Móveis Planejados" do Solutudo é de São José/SC).

O que fazer, em ordem:

1. Perfil da Empresa no Google completo e com avaliações (o pacote de mapa aparece antes dos sites).
2. Cadastro grátis no Solutudo (Jaú > Móveis planejados), Apontador, Econodata e GetNinjas, com o mesmo nome, endereço, telefone e o link do site.
3. Página no Facebook com o link do site (os concorrentes ranqueiam pelo Facebook).
4. Link do site na bio do Instagram e nos destaques.
5. Pedir a parceiros (lojas de pedra, vidraçarias, arquitetos, construtoras de Jaú) um link para o site.

## Próximos conteúdos sugeridos

- Uma página por obra real (cidade, ambiente, materiais e fotos), que rende buscas como "cozinha planejada com ilha em Jaú".
- Completar as perguntas pendentes (prazo, medição, garantia) em `src/data/perguntas.ts`; entram no `FAQPage` sozinhas ao marcar `confirmado: true`.
- Páginas por cidade só quando houver obras reais nelas; páginas copiadas trocando o nome da cidade são penalizadas.
