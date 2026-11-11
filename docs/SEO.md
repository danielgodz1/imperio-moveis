# SEO local — "móveis planejados em Jaú"

Objetivo: aparecer no topo para buscas como "móveis planejados Jaú", "marcenaria Jaú", "cozinha planejada Jaú" e nas cidades vizinhas.

Domínio canônico: `https://www.imperiomoveisplanejadosjau.com.br` (definido em `src/data/empresa.ts`, `index.html`, `public/sitemap.xml` e `public/robots.txt`).

## O que já está no site

- Título da home começando pela busca principal: "Móveis Planejados em Jaú/SP | Império Móveis Planejados".
- Descrição, texto do hero e conteúdo pré-renderizado com "móveis planejados" e "Jaú e região".
- Páginas próprias e pré-renderizadas: cozinhas, quartos, closets e home office em Jaú, cada uma com título, descrição, canonical e imagem de compartilhamento.
- JSON-LD `FurnitureStore` com `@id`, logo, fundadores, cidades atendidas, Instagram e imagens reais.
- `sitemap.xml` com data de atualização, `robots.txt`, `og:url`, `robots` e geolocalização (BR-SP, Jaú).
- Desempenho: fontes não usadas removidas e 3D só em aparelhos que aguentam (Core Web Vitals contam no ranking).

## O que mais pesa e depende de você (ordem de impacto)

1. **Perfil da Empresa no Google (Google Meu Negócio).** É o que coloca a loja no mapa e no "pacote local" da busca. Categoria principal: "Loja de móveis planejados" ou "Marceneiro". Endereço, horário, telefone e fotos reais. Depois de criado, coloque o link em `googleProfileUrl` em `empresa.ts`.
2. **Avaliações reais no Google**, pedidas a cada obra entregue, de preferência citando o ambiente e a cidade. Elas também substituem as avaliações de exemplo do site.
3. **Confirmar endereço e horário** e marcar `confirmado.endereco` e `confirmado.horarios` como `true` em `empresa.ts`. O JSON-LD passa a publicar endereço, coordenadas e horário (hoje fica de fora para não informar dado errado).
4. **Mesmo nome, endereço e telefone** em todo lugar: site, Google, Instagram, Facebook e diretórios locais.
5. **Google Search Console:** usar a propriedade de domínio (cobre com e sem www) e enviar `https://www.imperiomoveisplanejadosjau.com.br/sitemap.xml`.
6. **Projeto antigo na Vercel:** o `imperio-moveis.vercel.app` da conta anterior continua publicando o mesmo site. O canonical já aponta para o domínio novo, mas o ideal é redirecionar esse endereço para `https://www.imperiomoveisplanejadosjau.com.br` (Settings > Domains do projeto antigo) ou pausar o projeto.
7. **Redirecionar o domínio antigo:** se algum dia `imperiomoveisjau.com.br` foi divulgado, apontá-lo com redirecionamento 301 para o novo.

## Próximos conteúdos sugeridos

- Uma página por obra real (cidade, ambiente, materiais e fotos), que rende buscas como "cozinha planejada com ilha em Jaú".
- Perguntas frequentes com respostas confirmadas (prazo, medição, garantia) marcadas com `FAQPage`.
- Páginas por cidade só quando houver obras reais nelas; páginas copiadas trocando o nome da cidade são penalizadas.
