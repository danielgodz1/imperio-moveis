# Como rodar as verificações

Tudo roda contra o build de produção (`dist/`), servido como na Vercel: mesmos cabeçalhos de segurança (CSP), endereços sem `.html` e página 404 com status 404 (`scripts/servirDist.mjs`).

## No computador

```bash
npm ci
npm run lint          # tipos (TypeScript)
npm test              # testes unitários (Vitest): motor 3D, link do projeto, projetos salvos, SEO
npm run build         # build + pré-renderização das páginas
```

Testes de navegador (Playwright). Na primeira vez, instale o Chromium do Playwright, ou use o Chrome que já está no computador com `PW_CANAL=chrome`:

```bash
npx playwright install chromium
npm run test:e2e      # fumaça (páginas, 404, 3D, PDF, salvar projeto, WhatsApp) + acessibilidade (axe, WCAG AA)
npm run test:visual   # regressão visual (compara com as capturas de referência)
```

Lighthouse (desempenho no celular simulado, 3 medições por página):

```bash
npm run lighthouse    # relatórios em .lighthouseci/relatorios
```

Para abrir o build no navegador como na Vercel: `npm run servir:dist` e acesse http://localhost:4173.

## No GitHub (a cada PR e a cada push na main)

O fluxo `.github/workflows/qualidade.yml` roda quatro etapas:

| Etapa | O que faz | Bloqueia o PR? |
| :--- | :--- | :--- |
| Tipos, testes e build | `lint`, `test`, `build` | Sim |
| Navegador | Fumaça e acessibilidade nos tamanhos computador e celular; regressão visual | Sim |
| Lighthouse | LCP < 2,5 s, CLS < 0,1, TBT < 200 ms (celular) | Ainda não: só avisa (ver o relatório) |
| Links | Links internos quebrados (bloqueia) e externos (só avisa) | Internos, sim |

### Capturas de referência da regressão visual

Elas precisam ser geradas no Linux do CI (fonte e anti-aliasing mudam entre sistemas):

1. Abra a execução do fluxo no GitHub (Actions), baixe o artefato **capturas**.
2. Copie a pasta `linux` (uma subpasta por aparelho: computador e celular) para `e2e/__capturas__/linux` e faça commit.
3. Daí em diante, qualquer mudança visual nas páginas principais faz o teste falhar. Se a mudança for intencional, rode `npx playwright test e2e/visual.spec.ts --update-snapshots` no CI (ou apague a captura antiga e repita o passo 1).
