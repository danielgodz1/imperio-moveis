# AGENTS.md — Instruções Permanentes de Engenharia (Império Móveis Planejados)

Este documento define as diretrizes obrigatórias para todos os agentes de IA (Antigravity, Claude Code, Gemini, Cursor, Codex e ferramentas assistidas) que trabalham no repositório oficial da **Império Móveis Planejados** (`imperio-moveis`).

---

## 1. Princípio Fundamental de Continuidade

Este é um produto digital em produção contínua:
- **Repositório:** `https://github.com/danielgodz1/imperio-moveis`
- **Produção:** `https://www.imperiomoveisplanejadosjau.com.br` (Vercel; o endereço sem www redireciona para o www)
- **Domínio canônico SEO:** `https://www.imperiomoveisplanejadosjau.com.br`

**Regras Inegociáveis:**
1. **Preservação de Funcionalidades:** A prioridade é evoluir o sistema sem comprometer o que já funciona.
2. **Proibição de Reescrita Arbitrária:** Nunca interprete um pedido de nova funcionalidade como autorização para refatorar ou reescrever o sistema inteiro.
3. **Isolamento de Escopo:** Não substitua componentes funcionais sem justificativa técnica e não altere arquivos fora do escopo da tarefa sem autorização explícita.
4. **Veracidade em Testes:** Nunca afirme que testou algo sem executar o comando correspondente e verificar a saída real. Nunca apague ou desative testes para fazer o build passar.

---

## 2. Protocolo Obrigatório de Alteração (11 Etapas)

Toda tarefa de manutenção, correção ou nova funcionalidade deve seguir estritamente:

1. **Compreender a solicitação:** Ler o pedido completo e identificar os requisitos de negócio e técnicos.
2. **Consultar as instruções do projeto:** Ler `AGENTS.md`, `DESIGN.md` e os documentos relevantes em `docs/`.
3. **Identificar os arquivos envolvidos:** Localizar com precisão os módulos afetados (ver `docs/PROJECT_MAP.md`).
4. **Identificar dependências e funcionalidades afetadas:** Avaliar impacto em rotas, SEO pré-renderizado, configurador 3D, briefing de orçamento e APIs.
5. **Definir o escopo exato da alteração:** Limitar as modificações ao mínimo necessário e modular.
6. **Apresentar um plano de implementação:** Descrever claramente o que será criado ou modificado.
7. **Implementar de maneira incremental:** Manter o projeto compilável e testável a cada passo.
8. **Executar testes adequados:** Rodar `npm run lint`, `npm test` e `npm run build`.
9. **Verificar regressões:** Testar fluxos críticos impactados (`docs/testing/CRITICAL_FLOWS.md`).
10. **Atualizar documentação:** Refletir mudanças em `docs/CHANGELOG.md`, `docs/PROJECT_MAP.md`, `docs/ARCHITECTURE.md` ou `docs/BUSINESS_RULES.md`.
11. **Apresentar relatório técnico:** Informar diagnóstico, arquivos alterados, testes executados, resultados e limitações.

---

## 3. Arquitetura e Isolamento Modular

O projeto segue uma arquitetura modular em React 19 + TypeScript + Vite 8 + Tailwind CSS 4, com pré-renderização estática SEO no build e funções serverless em `/api`:

- **Site Institucional & Portfólio (`src/components/`):** `Hero.tsx`, `Donos.tsx`, `Obras.tsx`, `ProcessoSection.tsx`, `ReviewsSection.tsx`, `Fechamento.tsx`.
- **Páginas Locais SEO (`src/components/PaginaAmbienteLocal.tsx`, `src/data/paginasLocais.ts`, `src/utils/prerenderHtml.ts`):** Rotas dedicadas para Jaú e região pré-renderizadas no `vite build`.
- **Fluxo Comercial & Conversão (`src/components/BriefingOrcamento.tsx`, `src/components/ContactQuotationPage.tsx`, `src/utils/helpers.ts`):** Briefing em 3 etapas integrado ao WhatsApp (`5514998492834`) e ao resumo do configurador 3D.
- **Configurador 3D & Motor Geométrico (`src/components/quarto3d/`, `src/data/cenarios.ts`, `src/data/acabamentos.ts`):**
  - Carregado sob demanda via `React.lazy` em `Quarto3DLoader.tsx`.
  - Motor geométrico puro e determinístico (`src/components/quarto3d/motorGeometrico.ts`) responsável por validação pré-inserção, compatibilidade por ambiente, bounding boxes 3D, footprints 2D, detecção de colisões (módulo-módulo, módulo-abertura, limites de parede), áreas de circulação, orientação automática e busca de posição alternativa válida.
  - Consistência estrita: todas as dimensões usadas na validação (`motorGeometrico.ts` e `schema.ts`) são exatamente as mesmas dimensões usadas na renderização (`CenaQuarto3D.tsx`).
- **Laboratório de Experiências Visuais (`src/components/experiencias/`):**
  - Isolado nas rotas `/experiencias`, `/experiencias/versao-1`, `/experiencias/versao-2` e `/experiencias/versao-3`.
  - Não substitui nem interfere na página inicial (`/`).
- **APIs Serverless (`api/layout.ts`, `api/lead.ts`):** Compatíveis com Vercel Serverless Functions e com o servidor Express local (`server.ts`).

---

## 4. Comandos Oficiais de Verificação

- **Verificação de tipos (TypeScript):** `npm run lint`
- **Testes automatizados (Unitários, Geométricos 3D e Integração):** `npm test`
- **Build de produção + Pré-renderização SEO:** `npm run build`
- **Servidor de desenvolvimento:** `npm run dev`

---

## 5. Git, Branches e Deploy

- `main`: Branch estável de produção.
- `feature/*`: Desenvolvimento isolado de novas funcionalidades.
- `fix/*`: Correções isoladas.
- **Proibições de Git:** Nunca executar `git reset --hard`, `git push --force` ou exclusões em massa sem autorização explícita do usuário. Sempre verificar `git status` antes de iniciar alterações.

---

## 6. Referências da Documentação Permanente

- Sistema Visual e Tokens: `DESIGN.md` e `docs/DESIGN_SYSTEM.md`
- Arquitetura do Sistema: `docs/ARCHITECTURE.md`
- Mapa Completo de Arquivos e Rotas: `docs/PROJECT_MAP.md`
- Contratos de Dados e Estado: `docs/DATABASE.md`
- Regras de Negócio e Geometria 3D: `docs/BUSINESS_RULES.md`
- Segurança, Rate Limit e LGPD: `docs/SECURITY.md`
- Estratégia de Testes e Fluxos Críticos: `docs/testing/TEST_STRATEGY.md` e `docs/testing/CRITICAL_FLOWS.md`
- Decisões Arquiteturais (ADRs): `docs/decisions/`
- Histórico de Evolução: `docs/CHANGELOG.md`

