# Diferenciais 2026: relatório (Fases 0 e 1)

Ramo `feat/diferenciais-2026`. Adaptado à hospedagem real: **Vercel** (não GitHub Pages) e DNS no Registro.br (não Cloudflare). Fases 2 a 6 ainda não começaram.

## Fase 0: rede de segurança de qualidade

| O quê | Onde |
| :--- | :--- |
| Fluxo do GitHub Actions (tipos, testes, build, navegador, Lighthouse, links) | `.github/workflows/qualidade.yml` |
| Servidor do `dist/` igual à Vercel (CSP, 404 real) | `scripts/servirDist.mjs` |
| Testes de fumaça: 6 páginas sem erro, 404, editor 3D, PDF e imagem, salvar e retomar projeto, pedido de orçamento até o WhatsApp | `e2e/smoke.spec.ts` |
| Acessibilidade (axe, WCAG 2.1 AA, falha em sério/crítico) | `e2e/acessibilidade.spec.ts` |
| Regressão visual das páginas principais | `e2e/visual.spec.ts` |
| Orçamento de desempenho | `lighthouserc.json` |
| Como rodar | `dev/COMO_RODAR.md` |

### O que os testes novos encontraram e já foi corrigido

| Problema | Correção |
| :--- | :--- |
| Texto dos fundadores fora de foco com contraste 2,96:1 (mínimo 4,5:1) | Opacidade 50% → 75% (`src/components/Donos.tsx:160`) |
| Barra de progresso do orçamento sem nome para leitor de tela | `aria-label` (`src/components/BriefingOrcamento.tsx:275`) |
| Erro de WebAssembly bloqueado pela CSP no editor 3D (decodificador de modelos que o site não usa) | `useGLTF(url, false, false)` em `src/components/quarto3d/ObjetoReal.tsx` |

### Lighthouse (celular simulado, medido neste computador)

| Página | Antes: nota, LCP, CLS | Depois da etapa de desempenho |
| :--- | :--- | :--- |
| `/` | 40, 8,2 s, 0,008 | 41, 7,2 s, 0 |
| `/obras` | 18, 13,6 s, **0,352** | **62**, 3,3 s, 0 |
| `/projetar` | 61, 2,7 s, 0,001 | **75**, 2,8 s, 0 |
| `/cozinhas-planejadas-jau` | 62, 2,7 s, 0,103 | 58 a 62, foto como maior elemento, 0 |
| `/contato` | 50, 7,0 s, 0 | **73**, 3,2 s, 0 |

O que mudou:
- **Fontes servidas pelo próprio site** (`public/fontes`, `src/fontes.css`), em vez do CSS do Google Fonts que travava a primeira pintura. A fonte principal é pré-carregada.
- **GTM assíncrono:** `gtm-inicio.js` deixou de travar a página e carrega o `gtm.js` sozinho.
- **Fotos no HTML inicial** (`/obras` e páginas de ambiente) em AVIF/WebP de 800 e 1600 px, com largura e altura reais. Acabou o "pulo" (CLS 0 em todas) e a foto 4K em JPG do HTML inicial.
- **Página de cada endereço em pedaço próprio** (`src/paginasSobDemanda.ts`); o `main.tsx` espera o pedaço antes de montar o React, então o HTML inicial fica na tela até a página estar pronta.
- Título do `/contato` no HTML inicial com o tamanho final; sem pré-carregar a foto da cozinha em todas as páginas.
- Conferido: nenhuma página com rolagem lateral em 360, 768 e 1024 px.

**Segunda etapa de desempenho (12/11/2026):**
- Pôster do notebook no HTML inicial (V1 e V2), na posição exata do React (conferido ao pixel no celular, tablet e computador); o React reaproveita o mesmo elemento e só monta depois que ele foi pintado.
- Teste da placa de vídeo (WebGL) só na primeira interação: criar o contexto ao abrir travava a página por segundos em aparelho sem aceleração e no laboratório do Google.
- Editor 3D do `/projetar` monta na primeira interação (ou direto com link de projeto ou projeto salvo).
- Fontes da V2 servidas pelo site; código de cada página pré-carregado no HTML.
- PageSpeed Insights oficial, home no celular: **96** de desempenho, 100 em acessibilidade, práticas recomendadas e SEO (LCP 1,5 s, CLS 0).
- Lighthouse local no computador: todas as páginas entre 90 e 98. No celular, as medições locais variam demais (a mesma página entre 57 e 83); a referência é o PageSpeed.

**O que ainda falta:** as páginas internas da V2 (`/v2/obras`, `/v2/orcamento`, `/v2/projetar`) não têm conteúdo no HTML inicial e ficam entre 50 e 70 no celular; resolver quando a V2 for escolhida.

## Fase 1: configurador 2.0

O link compartilhável já existia (`#projeto=`, com compressão nativa do navegador e versão no esquema); foi mantido em vez de trocar por lz-string, que seria uma dependência a mais para o mesmo resultado.

| O quê | Onde |
| :--- | :--- |
| Link do projeto tratado como entrada não confiável: tamanho máximo do link (6.000), alfabeto restrito, teto de 64 KB descompactado (barra "bomba de compressão"), listas limitadas (40 peças, 12 aberturas), textos só como ids do catálogo, números com faixa | `src/components/quarto3d/resumoProjeto.ts:111`, `:151`; `src/components/quarto3d/schema.ts:47` |
| "Meus projetos": vários projetos salvos no aparelho com nome e data, sem dado pessoal; cada item validado ao ler; nome sem HTML nem caracteres de controle | `src/components/quarto3d/projetosSalvos.ts`, `src/components/quarto3d/MeusProjetos.tsx`; na etapa Enviar (salvar) e na etapa Ambiente (retomar) |
| QR code na imagem baixada, numa faixa branca abaixo do projeto (5 px por módulo, conferido com leitor de QR) | `src/components/quarto3d/fotoProjeto.ts:12`, `:49` |
| PDF no navegador (jsPDF só baixa quando pedido): logo, imagem, medidas, LED e piso, lista de peças, link, QR e o aviso "estimativa visual, orçamento final após medição" | `src/components/quarto3d/pdfProjeto.ts:48` |
| Mensagem do WhatsApp com ambiente, medidas, peças e link (já existia; mantida) | `montarMensagem` em `resumoProjeto.ts` |
| Eventos de analytics sem dado pessoal: `iniciar`, `salvar`, `abrir_salvo`, `baixar_imagem`, `baixar_pdf`, `copiar_link`, `enviar` (evento `projeto_3d`) | `src/utils/helpers.ts:32` |

Testes: `src/components/quarto3d/seguranca.test.ts` (11 casos: link longo, HTML, `__proto__`, bomba de compressão, listas e números fora da faixa, armazenamento adulterado, modo privado, QR) e os testes de navegador acima.

## Como testar

`dev/COMO_RODAR.md`. Resumo: `npm run lint && npm test && npm run build && npm run test:e2e`.

## O que depende do dono

- **Capturas de referência** da regressão visual: baixar do CI e commitar (passo a passo no `COMO_RODAR.md`).
- **Desempenho:** decidir quando fazer a etapa de desempenho para o Lighthouse virar bloqueio.
- **Fase 2 (Diário da Obra):** a proteção pedida (Cloudflare Access) exige mover o DNS para a Cloudflare. Alternativas sem mover: proteção por senha da Vercel (plano pago) ou links secretos por obra. Decisão do dono.
- **Fotos de antes/depois, tour 360° e mapa de obras (Fase 3):** precisam de fotos autorizadas e da lista de bairros.

## Reauditoria de segurança das novidades

| Ponto | Situação |
| :--- | :--- |
| Entrada pelo link (`#projeto=`) | Validada por esquema com limites; testada contra os casos acima. Nada do link vira HTML |
| Armazenamento local | Só desenho do ambiente; validado ao ler; teto de 512 KB; nenhum dado pessoal |
| QR e PDF | Gerados no navegador; o único texto variável é o link do próprio site e o nome do projeto (limpo) |
| Dependências novas | `jspdf@4.2.1`, `qrcode-generator@2.0.4` (produção, carregadas sob demanda); `@playwright/test`, `@axe-core/playwright` (desenvolvimento). `npm audit --omit=dev`: 0 vulnerabilidades |
| CSP | Sem mudança; o erro de WebAssembly foi resolvido no código, sem afrouxar a política |

## Projetos 3D, home mais curta e atalho de conversa (12/11/2026)

| O quê | Onde |
| :--- | :--- |
| Página `/projetos-3d`: 15 projetos 3D (renders do editor do site, não fotos de obra) separados por tema (cozinhas, quartos, closets, home office, banheiros). Cada um tem "Abrir no 3D" (abre montado no editor) e "Quero orçar" | `src/v2/PaginasInternasV2.tsx` (`Projetos3DPaginaV2`), `src/data/projetos3d.ts`, `public/projetos3d/` |
| HTML inicial, `CollectionPage` + trilha em JSON-LD, sitemap com as 15 imagens, rewrite e cache de imagem na Vercel | `src/v2/prerenderV2.ts` (`htmlProjetos3D`), `src/utils/prerenderHtml.ts` (`injetarSeoProjetos3D`), `vite.config.ts`, `vercel.json` |
| Home: a seção de obras ficou com 1 obra em destaque, 3 cartões de ambiente (levam a `/obras#cozinhas`, `#quartos`, `#lojas`) e o botão "Ver todas as 11 obras"; antes eram as 11 fotos em sequência | `ObrasV2` em `src/v2/SecoesV2.tsx` |
| Atalho de conversa no canto inferior direito (todas as páginas, menos o editor 3D): avatar com a coroa da Império, balão de convite depois de 6 s (uma vez por visita) e cartão com WhatsApp, orçamento em 3 perguntas e 3D. Substitui a barra fixa de baixo | `src/v2/ConversaFlutuanteV2.tsx`; evento de analytics `conversa_flutuante` (`balao_exibido`, `abrir`, `orcamento`); o clique no WhatsApp continua em `whatsapp_click` (`v2_flutuante`) |
| Menu do topo ganhou "Projetos 3D" | `src/v2/CromoV2.tsx` e `cabecalho()` do pré-render |

### Como a Império adiciona um projeto 3D

1. Exportar a imagem (render do Promob/SketchUp ou captura do editor) em JPG, de preferência com 1600 px de largura.
2. Gerar as variantes em `public/projetos3d/` com o mesmo nome base (ex.: `cozinha-cliente-x`):

   ```bash
   python -c "from PIL import Image; import sys; n=sys.argv[1]; im=Image.open(sys.argv[2]).convert('RGB'); b='public/projetos3d/'+n; im.save(b+'.jpg',quality=82,optimize=True,progressive=True); [ (r.save(f'{b}-{s}.webp',quality=78,method=6), r.save(f'{b}-{s}.avif',quality=55)) for w,s in ((800,'800'),(min(1600,im.width),'1600')) for r in [im.resize((w,round(im.height*w/im.width)))] ]" cozinha-cliente-x caminho/da/imagem.jpg
   ```

3. Acrescentar um item em `PROJETOS_3D` (`src/data/projetos3d.ts`) com tema, nome, descrição curta e a proporção da imagem (largura / altura). O campo `projeto` só existe para modelos montados no editor do site.
4. `npm run lint && npm test && npm run build`: o teste confere se as 5 variantes existem.

O "mascote" do atalho é a coroa do logo. Para trocar por uma ilustração, basta substituir o `<LogoImperio>` do botão e do cartão em `ConversaFlutuanteV2.tsx` por uma `<img>`.
