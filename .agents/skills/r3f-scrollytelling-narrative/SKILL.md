---
name: r3f-scrollytelling-narrative
description: Narrativa 3D scroll-driven com React Three Fiber, GSAP ScrollTrigger e Zustand para o hero da página inicial da Império Móveis. Use quando a tarefa for criar, corrigir ou auditar a experiência "planta 2D -> construção 3D da cozinha -> ilha verde-sálvia e armários shaker instalados -> foto real cozinha-gringa-4k" ou qualquer cena 3D que precise progredir conforme o scroll. Define arquitetura, contratos com o resto da home, padrão de timeline única, performance, acessibilidade, testes e critérios de aceite. Não use para o configurador 3D interativo (src/components/quarto3d/), que tem outro modelo de interação.
---

# R3F Scrollytelling Narrative — Império

## 1. Princípio central

Uma cena 3D scroll-driven **não é** "uma animação que começa quando você rola". É uma **timeline única** cujo progress (0 a 1) é mapeado diretamente à posição do scroll, e cujos valores são escritos em objetos 3D a cada frame.

Existe **uma única fonte de tempo: o scroll**. Se aparecer uma segunda (setTimeout, setInterval, IntersectionObserver, requestAnimationFrame próprio, um segundo ScrollTrigger, um useFrame que anima por `clock.elapsedTime`), a cena vai dessincronizar e o scroll reverso vai quebrar.

Consequência prática: rolar para cima deve "desmontar" a cena exatamente na ordem inversa, sem estados intermediários presos.

## 2. Quando usar / quando não usar

| Use | Não use |
| :--- | :--- |
| Hero scroll-driven da home (`/`) | Configurador interativo `src/components/quarto3d/` (controlado por clique/arraste, não por scroll) |
| Qualquer narrativa 3D atrelada ao scroll | Animações de entrada de UI (use GSAP comum ou `motion`) |
| Correção de dessincronia, vazamento de memória GPU ou travamento mobile da narrativa | Páginas locais SEO (`PaginaAmbienteLocal`) — devem continuar leves, sem WebGL |

Antes de gerar qualquer JSX visual, ative também a skill `imperio-design-direction` e leia `DESIGN.md`.

## 3. Arquitetura obrigatória

~~~text
src/components/heroScroll/
  useHeroScrollStore.ts     -> Zustand: progress global 0 a 1 + mapa de fases (FASES)
  HeroScrollCena.tsx        -> Canvas único, câmera, luzes e A timeline GSAP
  heroModelo.ts             -> cozinha paramétrica calibrada pela foto, peças e planta
  heroMateriais.ts          -> texturas procedurais e materiais PBR com frente de acabamento
  HeroScrollConteudo.tsx    -> H1, texto e CTAs, usados na narrativa e no fallback
  HeroScrollytelling.tsx    -> <section id="hero"> 300vh + cena sticky + ScrollTrigger (scrub) + overlay HTML
  HeroScrollFallback.tsx    -> imagem estática (WebGL indisponível ou prefers-reduced-motion)
~~~

Fluxo de dados (unidirecional, sem re-render do React por frame):

~~~text
scroll (Lenis no desktop / nativo no toque)
  -> ScrollTrigger (scrub: 1) suaviza e escreve progress no Zustand
  -> store.subscribe() chama invalidate() do R3F (frameloop="demand")
  -> useFrame lê progress via getState() e posiciona timeline.progress(p)
  -> camadas DOM (legendas, crossfade da foto) leem o MESMO progress via subscribe transiente
~~~

Regras de dependência:
- `HeroScrollytelling` importa `HeroScrollCena` **via `React.lazy`** (three/R3F ficam fora do bundle inicial; o texto e o H1 pintam primeiro).
- `HeroScrollCena` nunca importa nada de `src/components/quarto3d/`. São narrativas diferentes; acoplar quebra as duas.
- Nenhum outro componente da home importa `useHeroScrollStore`.

## 4. Contratos com o restante da página (não quebre)

A seção substitui o `<Hero />` em `src/App.tsx`, mas outros módulos dependem do que o hero expõe:

| Contrato | Quem depende | Regra |
| :--- | :--- | :--- |
| `id="hero"` | `Header.tsx` (`SECOES_OBSERVADAS`, link ativo), `Footer.tsx` (`irParaSecao('#hero')`) | O `<section>` externo mantém `id="hero"`. |
| `data-tema="noite"` | `LinhaLapis.tsx` (troca a cor do traço em seções escuras), foco visível em `index.css` | Manter no `<section>` externo. Ele é lido no mount, então o section precisa existir já no primeiro render (não lazy). |
| H1 da home | `METADADOS_ROTAS_SEO['/'].h1Inicial` em `src/data/paginasLocais.ts`, injetado por `src/utils/prerenderHtml.ts` | Um único `<h1>` com o mesmo texto: "Arquitetura e marcenaria na mesma mesa." |
| Props `onNavigateContact` | `App.tsx` | Mesma assinatura do `Hero` atual. |
| CTAs de conversão | Funil comercial | Manter "Pedir orçamento" (ou WhatsApp via `getWhatsAppUrl` + `trackWhatsAppClick('hero_cta')`), "Ver as obras" (`scrollToTarget('#obras', -80)`) e Instagram. |
| Lenis + ScrollTrigger | `src/hooks/useScrollytelling.ts` | Já existe uma instância global de Lenis ligada a `ScrollTrigger.update`. **Não crie outra Lenis nem outro `gsap.ticker` de scroll.** |

O arquivo `src/components/Hero.tsx` permanece no repositório, intocado, salvo pedido explícito para removê-lo.

## 5. Layout: 300vh + sticky (sem pin)

~~~text
<section id="hero" data-tema="noite">          min-height: 300vh; position: relative
  <div sticky>                                  position: sticky; top: 0; height: 100vh (100svh no mobile)
    <Canvas /> ou <HeroScrollFallback />
    overlay HTML (H1, subtítulo, CTAs, legenda da fase, foto do crossfade)
  </div>
</section>
<FraseImpacto />  ... resto da home no fluxo normal
~~~

- Distância de scroll da narrativa = 300vh - 100vh = 200vh.
- **Não use `pin: true`** do ScrollTrigger. O sticky nativo não insere pin-spacer e não empurra as seções seguintes.
- **Nenhum ancestral do elemento sticky pode ter `overflow: hidden | auto | scroll`.** Isso desliga o sticky silenciosamente. `overflow: hidden` no próprio elemento sticky é permitido. O `body { overflow-x: hidden }` de `index.css` não atrapalha (é propagado para a viewport); não altere.
- A altura do section deve ser definida só por CSS. Nada assíncrono (lazy do Canvas, carregamento de foto) pode mudar a altura, senão as posições do ScrollTrigger ficam erradas.
- Use `h-screen` com `h-[100svh]` em seguida, para evitar o salto da barra de endereço no iOS.

## 6. Padrão de implementação (não desvie)

### 6.1 Mapa de fases como dado

As fases vivem num único objeto em `useHeroScrollStore.ts`. A timeline e o overlay HTML leem dele. Nunca repita números mágicos em dois arquivos.

~~~ts
export const FASES = {
  traco:        { inicio: 0.0,  fim: 0.18 },
  profundidade: { inicio: 0.18, fim: 0.32 },
  construcao:   { inicio: 0.32, fim: 0.74 },
  acabamento:   { inicio: 0.74, fim: 0.88 },
  obra:         { inicio: 0.88, fim: 1.0  },
} as const;
~~~

### 6.2 Uma timeline, duração total exatamente 1

A timeline é construída **uma vez**, dentro de um componente filho do `<Canvas>` (é onde existem `camera` e as refs dos meshes), com `paused: true` e `ease: 'none'` nos defaults. Cada tween usa **posição absoluta** derivada de `FASES`, e a timeline termina com `tl.set({}, {}, 1)`, garantindo que `timeline.progress(p)` corresponda 1:1 ao progress do scroll.

GSAP anima propriedades de objetos three.js diretamente (`mesh.scale`, `mesh.position`, `material.opacity`, `camera.position`, um `Vector3` de alvo).

**Correção importante:** materiais three.js não têm `strokeDashoffset` (isso é SVG). Para "desenhar a planta linha por linha" use uma destas técnicas:
- (preferida) cada parede da planta é um mesh fino (box/plane) com `scale.x` animado de ~0 a 1, com âncora na ponta inicial (geometria transladada para começar em x=0);
- ou `BufferGeometry.setDrawRange(0, n)` com `n` interpolado num objeto proxy.

### 6.3 ScrollTrigger com scrub de verdade (via proxy)

**Armadilha:** `ScrollTrigger.create({ scrub: 1, onUpdate })` **sem animação associada ignora o scrub**. O `self.progress` chega cru, sem suavização. O scrub só atua sobre uma animação. Use um tween proxy:

~~~ts
const proxy = { p: 0 };
gsap.to(proxy, {
  p: 1,
  ease: 'none',
  scrollTrigger: {
    trigger: containerRef.current,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1,
  },
  onUpdate: () => useHeroScrollStore.getState().setProgress(proxy.p),
});
~~~

Crie dentro de `gsap.context(..., containerRef)` e chame `ctx.revert()` no cleanup.

### 6.4 useFrame aplica o progresso, em modo demand

~~~ts
useFrame(() => {
  const tl = tlRef.current;
  if (!tl) return;
  const p = useHeroScrollStore.getState().progress;
  if (tl.progress() !== p) tl.progress(p);
  camera.lookAt(alvo); // alvo é um Vector3 animado pela própria timeline
});
~~~

- `<Canvas frameloop="demand">` + `useHeroScrollStore.subscribe(() => invalidate())`: só renderiza quando o progress muda. Fora da viewport o scroll não altera o progress, então a GPU fica ociosa sem precisar de IntersectionObserver.
- A câmera se move **dentro da timeline** (tweens em `camera.position` e no `alvo`). O useFrame só aplica `lookAt`, nunca calcula movimento próprio.
- Nunca use `useState`/`useStore(selector)` com o progress em componentes React. Isso re-renderiza a 60 fps.

### 6.5 Camadas DOM sincronizadas

Legendas de fase e o crossfade para a foto também leem o progress via `useHeroScrollStore.subscribe` e escrevem estilo direto na ref (`el.style.opacity`, `el.dataset.fase`). Não criam ScrollTrigger próprio nem usam estado React por frame.

### 6.6 Proibido

- `ScrollControls` / `useScroll` do Drei junto com GSAP ScrollTrigger.
- Mais de um `<Canvas>` na narrativa.
- `setTimeout`, `setInterval`, `IntersectionObserver` ou `requestAnimationFrame` próprio orquestrando fases. (O `setTimeout` de `ScrollTrigger.refresh` já existente em `useScrollytelling.ts` é infraestrutura, não narrativa; não mexa nele.)
- Animações por `clock.elapsedTime` (flutuação, rotação contínua) dentro da narrativa. Elas criam uma segunda fonte de tempo.
- Carregar modelos GLB pesados no hero. Use geometria paramétrica e funda partes de uma mesma peça com `mergeGeometries`; o celular descarta prateleiras, fundos e objetos pequenos.

## 7. Estrutura narrativa da Império (referência: foto real `cozinha-gringa-4k`)

A fotografia `/obras/cozinha-gringa-4k` é a fonte da verdade do modelo. Ela mostra: ilha lisa em verde-sálvia com tampo de pedra clara e cooktop; armários shaker brancos até o forro; fileira shaker verde sobre a bancada; bancada branca com cuba; lava-louças e geladeira French door em inox; revestimento cinza; fita de LED sob a fileira verde e rasgo de luz no forro; esquadria preta; banquetas pretas; cadeiras estofadas. **Não há ripado de freijó, granito preto, cristaleira nem pendente**: não os modele. O freijó aparece só na porta, na mesa e nas pernas das cadeiras.

| Fase | Faixa de progress | O que acontece | Câmera |
| :--- | :--- | :--- | :--- |
| 1. Traço | 0.00 - 0.18 | Planta em traço único dourado (`--dourado`) com tremor de mão, revelada por `drawRange` | Zenital, com `up` em -Z |
| 2. Profundidade | 0.18 - 0.32 | Placas de piso assentam, fundo vai de `--preto` a neutro claro, paredes sobem | Zenital para perspectiva 3/4 |
| 3. Construção | 0.32 - 0.74 | Dez etapas em ordem de marcenaria (`PESO_ETAPAS`): base, laterais, divisórias, prateleiras, gavetas, portas com giro na dobradiça, painéis e eletrodomésticos, ilha, tampos, acabamentos. Peças em MDF cru/primer | 3/4 com aproximação lenta |
| 4. Acabamento | 0.74 - 0.88 | Forro desce, frente de acabamento varre o ambiente (`uFrente`), LED 2700K acende | Vai até a posição calibrada da foto |
| 5. Obra real | 0.88 - 1.00 | Crossfade DOM para a foto; o painel de texto recolhe até o bloco do H1 | Estável |

**Calibração da câmera:** `CAMERA_FOTO` em `heroModelo.ts` guarda posição, guinada e tangentes extraídas dos pontos de fuga da foto. A projeção é escrita manualmente para coincidir com o recorte `object-cover` da foto (`RECORTE_FOTO`), em qualquer proporção de tela. Se mudar o `object-position`, mude `RECORTE_FOTO`.

**Decisões de layout:** o texto fica num painel sólido `--preto` (sem scrim nem gradiente); no desktop a cena é deslocada para fora dele por deslocamento de lente; abaixo de 1024px o palco fica acima do texto.

Chapas de 18 mm, folga de 3 mm entre frentes, medidas em metros derivadas da foto. Texturas procedurais em CanvasTexture com UV em metros (`heroMateriais.ts`). Tons de `acabamentos.ts`, ainda `confirmado: false`.

## 8. Performance e limpeza (obrigatório)

- **Um único Canvas**, carregado por `React.lazy` dentro de `<Suspense>`. O fallback do Suspense mostra só um fundo/imagem, sem repetir o H1: o overlay HTML já está na tela e a página não pode ter dois `<h1>`.
- **DPR:** `dpr={[1, 1.5]}` no mobile (`(max-width: 767px)` ou `(pointer: coarse)`), `dpr={[1, 2]}` no desktop.
- **`frameloop="demand"`** + `invalidate()` na mudança de progress (ver 6.4).
- **Sem sombras dinâmicas no mobile.** Prefira luz ambiente + direcional; se usar `shadows`, só no desktop e com `shadow-mapSize` pequeno.
- **Dispose:** o R3F libera sozinho geometrias e materiais declarados em JSX quando desmontam. Recursos criados imperativamente (`new THREE.*` em `useMemo`, texturas carregadas manualmente) **devem** receber `.dispose()` no cleanup. Como rede de segurança, percorra `scene.traverse` no unmount liberando geometrias, materiais e texturas.
- **Timeline e trigger:** `tl.kill()` e `ctx.revert()` no cleanup; resete `progress` para 0 no store, para que voltar à home (de `/contato`) recomece do início.
- **Orçamento:** o chunk lazy da cena não deve adicionar dependências novas além de `zustand`. three, @react-three/fiber, @react-three/drei e gsap já estão no projeto.

## 9. Acessibilidade e fallback

- **Detecção de WebGL** antes de montar o Canvas: crie um canvas e tente `getContext('webgl2') || getContext('webgl')`, dentro de try/catch.
- **`prefers-reduced-motion: reduce`** ou WebGL indisponível -> não cria ScrollTrigger, não monta Canvas e renderiza `HeroScrollFallback` (foto `cozinha-gringa-4k` + H1 + CTAs). Nesse modo o container **não** tem 300vh: usa altura de um hero normal, para não obrigar o usuário a rolar uma área vazia.
- O Canvas recebe `aria-hidden="true"`. A narrativa é decorativa; o conteúdo semântico (H1, texto, CTAs) está no HTML.
- CTAs alcançáveis por teclado em qualquer momento da narrativa (o overlay fica acima do canvas com `pointer-events` corretos).
- Contraste: texto `--papel`/`#f2e8d8` sobre fundo escuro. Nunca `--dourado` como texto sobre `--papel` (regra do `DESIGN.md`).

## 10. Verificação obrigatória

Comandos (rodar e ler a saída; nunca afirmar sucesso sem executar):
- `npm run lint` — zero erros de tipo.
- `npm run build` — build + pré-renderização SEO concluídos; confirme que a cena 3D saiu em chunk separado do `index`.
- `npm test` — apenas se o script existir no `package.json` da branch.

Testes manuais no navegador (`npm run dev`):
1. Rolar até o fim da narrativa: as quatro fases e o crossfade acontecem na ordem; a `FraseImpacto` e a seção Donos aparecem logo em seguida, sem espaço vazio.
2. Rolar para cima: a cena se desfaz na ordem inversa, sem saltos.
3. Rolagem rápida (arrastar a barra de rolagem): o scrub suaviza, sem estados intermediários presos.
4. DevTools -> Rendering -> `prefers-reduced-motion: reduce`: aparece o fallback estático, sem 300vh.
5. WebGL desligado (Chrome com `--disable-webgl` ou bloqueio nas configurações): fallback, sem erro no console.
6. Emulação mobile (390x844, DPR 3): DPR efetivo <= 1.5, scroll fluido.
7. Navegar `/` -> `/contato` -> `/` três vezes: sem warnings, sem triggers duplicados (`ScrollTrigger.getAll().length` estável no console) e a narrativa reinicia em 0.
8. Header: link "início" ativo durante o hero; o rodapé leva de volta a `#hero`; a LinhaLapis troca de cor sobre o hero escuro.

## 11. Critérios de aceite (autoavaliação antes de entregar)

- [ ] Existe **uma** timeline GSAP, com duração total 1, cobrindo todas as fases a partir de `FASES`.
- [ ] O scroll controla o progress via tween proxy com `scrub: 1`; nenhum `ScrollTrigger.create` sem animação fingindo ter scrub.
- [ ] A câmera se move dentro da timeline, não num useFrame paralelo.
- [ ] Não há setTimeout, IntersectionObserver ou rAF próprio orquestrando a narrativa.
- [ ] Nenhum componente React re-renderiza por frame por causa do progress.
- [ ] Container de 300vh com cena `sticky` de 100vh/100svh; sem `pin`; seções seguintes no fluxo normal.
- [ ] `id="hero"`, `data-tema="noite"`, H1 idêntico ao `h1Inicial` e CTAs preservados.
- [ ] Um único Canvas, lazy-loaded, `frameloop="demand"`, DPR 1.5 mobile / 2 desktop.
- [ ] Ao desmontar: timeline morta, contexto GSAP revertido, recursos GPU liberados, progress resetado.
- [ ] Fallback estático para reduced-motion e ausência de WebGL.
- [ ] `npm run lint` e `npm run build` executados e aprovados.
- [ ] O restante da página (FraseImpacto, Donos, Obras, Processo, 3D, Avaliações, Fechamento) permanece intocado; `Hero.tsx` não foi alterado.

Implementação de referência completa: `references/implementacao-referencia.md`.
