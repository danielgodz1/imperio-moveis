# Relatório de SEO — imperiomoveisplanejadosjau.com.br

Data: 12/11/2026. Branch `seo/auditoria-2026-11` (PR para revisão, sem merge automático).

## As 3 ações de maior impacto (todas dependem do dono)

1. **Avaliações no Google: de 8 para 50+ em 6 meses.** O Google ordena o mapa por relevância, distância e destaque ([ajuda oficial](https://support.google.com/business/answer/7091?hl=pt-BR)); avaliações recentes e numerosas são o destaque que mais muda. Pedir a cada obra entregue, no D+2 e no D+15 (roteiro em `relatorios/gbp-checklist.md`). Nunca oferecer desconto ou brinde em troca.
2. **Perfil da Empresa completo:** categoria certa, serviços, fotos novas todo mês e posts semanais (checklist em `relatorios/gbp-checklist.md`).
3. **Mesmo nome, endereço e telefone em 10+ diretórios** (lista pronta em `dados/citacoes.csv`), começando por Bing Places (alimenta a busca do ChatGPT) e Apple Business Connect.

## O que já está no site (antes desta branch)

| Item | Situação |
| :--- | :--- |
| Páginas pré-renderizadas (texto no HTML, sem depender de JavaScript) | Sim, todas |
| Domínio canônico com www, HTTPS e redirecionamento do domínio sem www | Sim (308) |
| `robots.txt` liberando tudo e apontando o sitemap | Sim |
| `sitemap.xml` gerado no build, com imagens e data real de alteração | Sim |
| Dados estruturados: FurnitureStore, WebSite, FAQPage, Service e BreadcrumbList | Sim |
| Página 404 com status 404 de verdade | Sim |
| Páginas de privacidade (LGPD) e termos | Sim |
| Verificação no Search Console (meta tag e arquivo) | Sim |
| Hero 3D carregado só na primeira interação; 3D do configurador só em `/projetar` | Sim |

## O que esta branch acrescenta

| Mudança | Arquivo |
| :--- | :--- |
| Página `/obras` com todas as obras reais, fotos, materiais e cidade; pré-renderizada | `src/components/PaginaObras.tsx`, `src/utils/prerenderHtml.ts` |
| `ItemList` de `ImageObject` com a empresa como autora das fotos, e trilha | `src/utils/prerenderHtml.ts` |
| `/obras` no sitemap com as 11 fotos (34 imagens no total) | `vite.config.ts` |
| Link interno "Ver todas as obras" na home e no rodapé | `src/components/Obras.tsx`, `Footer.tsx` |
| Títulos com até ~60 caracteres e descrições com até ~155 (o Google corta o resto) | `src/data/paginasLocais.ts`, `index.html` |
| IndexNow: arquivo de chave e script que avisa Bing (e a busca do ChatGPT) a cada publicação | `public/<chave>.txt`, `scripts/indexnow.mjs` |
| `/.well-known/security.txt` (contato para avisos de segurança, padrão RFC 9116) | `public/.well-known/security.txt` |

Medição dos títulos e descrições depois da mudança: todas as 10 páginas entre 41 e 59 caracteres de título e 131 a 154 de descrição, um H1 por página.

## O que NÃO foi feito, e por quê

- **`llms.txt`:** o Google afirma que os recursos de IA da busca (AI Overviews e Modo IA) usam as mesmas páginas indexadas da busca comum e que não é preciso arquivo nem marcação especial ([cobertura do guia do Google](https://www.searchenginejournal.com/googles-new-ai-search-guide-calls-aeo-and-geo-still-seo/575026/)). Não vale o esforço agora.
- **Páginas por cidade** (Barra Bonita, Pederneiras...): sem obra real e texto próprio de cada cidade, o Google trata como "doorway page" (spam). Criar só quando houver obra na cidade.
- **Páginas `/banheiros-planejados-jau` e `/lojas-planejadas-jau`:** precisam de fotos e texto reais. Há fotos de lojas (GoCoffee, expositor); falta o texto do dono sobre essas obras.
- **`aggregateRating` nos dados estruturados:** o Google não aceita nota da própria empresa no LocalBusiness ("self-serving"). As avaliações ficam no Google, com link.
- **Compra de links, avaliações incentivadas, palavra-chave no nome do Perfil:** proibidos pelas regras de spam do Google; derrubam o perfil.

## Robôs, sitemap e "otimização contínua": como funciona de verdade

- **Robôs (crawlers)** são programas do Google, Bing e outros que visitam o site sozinhos, leem o HTML e guardam no índice. Ninguém instala robô no site.
- **`robots.txt`** só diz o que eles podem visitar. O nosso libera tudo.
- **`sitemap.xml`** é a lista de páginas e imagens; ajuda o robô a achar tudo e saber o que mudou. Já é gerado sozinho a cada publicação.
- **IndexNow** avisa o Bing na hora que algo mudou (o Google não usa; para ele vale o Search Console).
- **A otimização contínua não é um arquivo:** é publicar conteúdo novo e real (obras, guias), ganhar avaliações e menções. O código só garante que os robôs leiam tudo bem, e isso já está feito.

## Depende do dono (não tenho acesso)

- [ ] Search Console: reenviar o sitemap após o merge; usar "Solicitar indexação" em `/obras`.
- [ ] Bing Webmaster Tools: importar o site do Search Console (1 clique) e rodar `node scripts/indexnow.mjs` depois de cada publicação.
- [ ] Perfil da Empresa no Google: `relatorios/gbp-checklist.md`.
- [ ] Diretórios: `dados/citacoes.csv`.
- [ ] Conteúdo: `dados/calendario.csv` e `relatorios/digital-pr.md`.
- [ ] Autorização dos clientes para fotos de obras (LGPD e direito de imagem).

## Plano 30/60/90

- **30 dias:** Perfil completo, 10 avaliações novas, Bing Places e Apple Business, 5 diretórios, 4 posts no Perfil, `/obras` indexada.
- **60 dias:** 20 avaliações novas, 4 peças de conteúdo (calendário), página de lojas com obras reais, pauta para imprensa de Jaú.
- **90 dias:** 25+ avaliações novas, 8 peças publicadas, top 3 no mapa para "móveis planejados jaú" (medir com grade manual no Maps).

## Métricas para acompanhar

Search Console (cliques, impressões e posição por consulta), cliques no WhatsApp por página (GTM já envia `whatsapp_click`), início e envio do configurador 3D, número de avaliações por mês.
