# Validação de SEO — 12/11/2026

## Resumo

- **Indexadas:** 1 de 10 páginas (só a home aparece em `site:`). Nada técnico bloqueia as outras 9: sitemap, robots, canonical, status 200 e conteúdo no HTML inicial estão certos. É falta de rastreio de um domínio recém-mudado; o dono acelera pelo Search Console (`relatorios/indexacao.md`).
- **Dados estruturados:** JSON-LD válido nas 10 páginas, sem campos obrigatórios faltando (`relatorios/rich-results.md`).
- **Duplicidade:** só a versão com barra no fim (`/pagina/`) respondia como cópia; corrigido.
- **Problema de qualidade:** texto de rascunho visível no site; corrigido.

## Problemas e correções nesta branch

| Problema | Onde | Correção |
| :--- | :--- | :--- |
| `[CONFIRMAR pedra padrão]`, `[CONFIRMAR marca das dobradiças e corrediças]` no texto público | `/cozinhas-planejadas-jau` (`src/data/paginasLocais.ts:78`) | Frase sem a parte não confirmada; pendência anotada em comentário no arquivo |
| `[CONFIRMAR especificação de bordas infantis]` | `/quartos-planejados-jau` (`src/data/paginasLocais.ts:137`) | Idem (sai também "acabamento atóxico", que dependia da confirmação) |
| `[CONFIRMAR opções de portas em vidro refletente e perfil metálico]` | `/closets-sob-medida-jau` (`src/data/paginasLocais.ts:194`) | Idem |
| `[CONFIRMAR cidade]`, `[CONFIRMAR detalhes]` nas legendas da GoCoffee | `/obras` e home (`src/data/portfolioData.ts`) | Legenda sem a cidade não confirmada |
| Nada impedia rascunho de voltar ao ar | — | Teste `tests/semRascunhoNoSite.test.ts` falha se `[CONFIRMAR]` ou `[PREENCHER]` aparecer em texto público, título, descrição, obra ou pergunta publicada |
| `/pagina/` com barra no fim respondia 200 (cópia) | `vercel.json` | `"trailingSlash": false` (redireciona 308 para a versão sem barra) |
| Política de privacidade citava a LGPD e a ANPD sem link | `src/data/legal.ts`, `PaginaLegal.tsx`, `prerenderHtml.ts` | Seção "Fontes oficiais" com os links do Planalto e da ANPD (`relatorios/links-externos.md`) |

## O que depende do dono

1. **Search Console:** enviar o sitemap e pedir indexação das 9 páginas (`relatorios/url-inspection.md`).
2. **Busca real** em janela anônima e preencher `relatorios/busca-real.md`.
3. **Confirmar com a equipe** os materiais que saíram do texto (pedra, dobradiças, bordas infantis, portas de vidro) e a cidade da GoCoffee, para voltarem ao site.
4. **Rich Results Test** manual se quiser o selo de "válido" do Google (o relatório automático já não encontrou erros).

## Limitações

- O teste de compatibilidade móvel do Google foi desativado em 2023; não há como gerar o relatório pela API dele. Ver `relatorios/mobile-friendly.json`.
- Search Console, Rich Results Test e validator.schema.org não foram consultados por API (exigem conta do dono ou não têm API).
- O redirecionamento da barra no fim só pode ser conferido depois do merge (a prévia da Vercel pede login).

## Próximos passos

Revalidar em 30 dias (12/12/2026): repetir `site:`, conferir no Search Console quantas das 10 páginas estão "no Google" e comparar as posições da busca real.
