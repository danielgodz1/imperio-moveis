# Império Móveis Planejados — Arquitetura & Marcenaria em Jaú/SP

Site institucional, portfólio interativo em 4K, simulador 3D de ambientes e fluxo de orçamento direto para o WhatsApp da **Império Móveis Planejados**, sediada em **Jaú/SP** e fundada por **Wellington Cabral** (marceneiro com mais de 15 anos de ofício) e **Tatiane Cabral** (arquiteta e designer de interiores, também formada em logística).

- **Instagram oficial:** [@imperio.moveis.jau](https://www.instagram.com/imperio.moveis.jau)
- **WhatsApp comercial:** [(14) 99849-2834](https://wa.me/5514998492834)
- **Localização:** R. Doná Djanira Werneck de Almeida e Silva, 280 — Jardim Itamarati, Jaú/SP
- **Área de atendimento:** Jaú, Barra Bonita, Dois Córregos, Pederneiras, Bocaina, Mineiros do Tietê, Bariri, Itapuí e região central paulista.

---

## Propósito e Identidade do Projeto

Diferente de uma marcenaria convencional que apenas executa cortes ou de um escritório que terceiriza a produção, a **Império Móveis Planejados** reúne **arquitetura de interiores e fabricação própria na mesma mesa** desde 2015.

O site foi desenhado e arquitetado para traduzir esse diferencial em cada seção:

1. **Hero Imersivo ("Arquitetura e marcenaria na mesma mesa"):**
   - Abertura com atmosfera escura e tipografia monumental com revelação fluida por máscara (GSAP).
   - Palavra **IMPÉRIO** em destaque dourado ao fundo com parallax em 3 camadas.
   - Moldura em arco flutuante exibindo fotografia real em 4K de cozinha executada pela Império, acompanhada do desenho técnico animado da planta em L (`PlantaCozinha`) medindo a ilha (`2,40m × 0,95m`), brilho de fita de LED e cartões flutuantes com os materiais reais da obra (*Ripado & Verde-Sálvia*, *Granito Preto & LED* e *Planta da Ilha*).
   - Botões diretos para orçamento (`/contato`), portfólio (`#obras`) e Instagram oficial (`@imperio.moveis.jau`).

2. **Quem Assina Cada Projeto (`#donos`):**
   - Narrativa dos fundadores **Wellington Cabral** e **Tatiane Cabral** com retrato interativo em holofote (`RetratoHolofote` controlado por variáveis CSS `--mx`, `--my`, `--r` e `ScrollTrigger` sem `pin`).
   - Layout totalmente responsivo: no celular, os cartões de história possuem superfície escura de alto contraste e a linha do tempo (**Trajetória da Império**) aparece em fluxo limpo, sem sobrepor a foto dos fundadores.

3. **As Obras em 4K com Anotações Técnicas (`#obras`):**
   - Portfólio com fotografias reais em alta resolução (AVIF, WebP e JPG em 800w/1600w) de cozinhas planejadas, quartos infantis (cama-casinha com escorregador), quartos de bebê, dormitórios com LED, projetos comerciais (GoCoffee Jaú, expositores) e logística de entrega com caminhão-guindaste.
   - **Troca automática por rolagem (Scroll-driven):** ao rolar pela seção, os projetos avançam de forma rápida e fluida; o visitante pode parar o scroll a qualquer momento, filtrar por categoria ou clicar na foto para abri-la no **Lightbox** em tela cheia.

4. **Simulador 3D por Cenários (`#quarto-3d`):**
   - Configurador 3D interativo (Three.js / `@react-three/fiber`) carregado sob demanda (`React.lazy`) com suporte a **4 ambientes reais**:
     - `Quarto` (`cama-casal`, `cabeceira-led`, `criado-esq`, `criado-dir`, `guarda-roupa`, `bancada`)
     - `Cozinha` (`bancada-pia`, `aereo-cozinha`, `torre-quente`, `ilha-ripado`)
     - `Closet` (`armario-l-esq`, `armario-l-dir`, `ilha-closet`, `espelho-inteiro`)
     - `Home office` (`bancada-dupla`, `estante-alta`, `gaveteiro`, `painel-ripado`)
   - Controle de dimensões da parede (`larguraCm`, `profundidadeCm`), seleção de acabamentos e acionamento da iluminação em fita de LED.
   - Validação de esquema compartilhada com `zod` (`.superRefine()`) no cliente e no endpoint `POST /api/layout`.

5. **Briefing Rápido de Orçamento (`/contato` e Painel Lateral):**
   - Fluxo curto em **3 passos** (`BriefingOrcamento.tsx`):
     1. Escolha de ambientes (múltipla escolha) + fase da obra (*Só planejando*, *Imóvel em obra*, *Pronto para medir*).
     2. Medidas aproximadas, opção *"Tenho fotos ou planta"* e observações.
     3. Nome, WhatsApp com máscara, Cidade/bairro e consentimento LGPD.
   - Ao finalizar, anexa automaticamente o resumo do simulador 3D (caso o visitante tenha montado um ambiente) e abre o WhatsApp da Império com a mensagem organizada.

6. **SEO Técnico Local Pré-Renderizado (Jaú e Região):**
   - Pré-renderização estática no build (`vite.config.ts` / `prerenderHtml.ts`) para 6 rotas públicas, entregando `<title>`, `<meta name="description">`, `<link rel="canonical">`, Open Graph, `<h1>`, conteúdo autoral e dados estruturados `FurnitureStore` (JSON-LD gerado de `src/data/empresa.ts`) direto no HTML inicial:
     - `/`
     - `/contato`
     - `/cozinhas-planejadas-jau`
     - `/quartos-planejados-jau`
     - `/closets-sob-medida-jau`
     - `/home-office-planejado-jau`

---

## Stack Tecnológica

- **Frontend:** React 19, TypeScript, Tailwind CSS 4
- **Animações e Scrollytelling:** GSAP 3 + ScrollTrigger, Lenis Smooth Scroll
- **Simulador 3D:** Three.js, `@react-three/fiber`, `@react-three/drei`
- **Validação & API:** Zod, Express (`server.ts`), Serverless Functions (`api/layout.ts`, `api/lead.ts`)
- **Build & Pré-renderização SEO:** Vite 8 + plugin customizado de pré-renderização de rotas locais

---

## Estrutura Principal do Projeto

```text
├── api/
│   ├── layout.ts                  # Validação Zod e cálculo de layout do simulador 3D
│   └── lead.ts                    # Endpoint opcional para captura de leads (honeypot + rate limit)
├── public/
│   ├── obras/                     # Fotografias reais 4K otimizadas em AVIF, WebP e JPG (800w / 1600w)
│   ├── favicon.png / favicon.svg  # Favicon oficial da Império Móveis Planejados
│   ├── logo-quadrado.jpg          # Logo oficial da marca
│   ├── robots.txt                 # Diretivas de indexação
│   └── sitemap.xml                # Mapa de URLs com as rotas locais de Jaú
├── src/
│   ├── components/
│   │   ├── hero/PlantaCozinha.tsx # SVG técnico da planta baixa da cozinha com cotas
│   │   ├── quarto3d/              # Simulador 3D (CenaQuarto3D, Quarto3DExperiencia, schema Zod)
│   │   ├── Header.tsx             # Cabeçalho inteligente com menu de ambientes e CTA de orçamento
│   │   ├── Hero.tsx               # Hero imersivo com imagem flutuante, planta técnica e faixas
│   │   ├── FraseImpacto.tsx       # Faixa de citação editorial entre o Hero e Os Donos
│   │   ├── Donos.tsx              # Seção dos fundadores com RetratoHolofote e Linha do Tempo
│   │   ├── Obras.tsx              # Portfólio 4K anotado com avanço no scroll e Lightbox
│   │   ├── ProcessoSection.tsx    # As 4 etapas "Do risco à obra" + logística com guindaste
│   │   ├── BriefingOrcamento.tsx  # Formulário rápido em 3 passos integrado ao WhatsApp e 3D
│   │   ├── PaginaAmbienteLocal.tsx# Template das páginas locais de SEO para Jaú/SP
│   │   └── Footer.tsx             # Rodapé organizado em 4 colunas
│   ├── data/
│   │   ├── empresa.ts             # Fonte única da verdade para dados da empresa e JSON-LD
│   │   ├── cenarios.ts            # Definição dos 4 cenários 3D e catálogo de 14 módulos
│   │   ├── acabamentos.ts         # Paleta de acabamentos do simulador 3D
│   │   ├── portfolioData.ts       # Obras reais em 4K e coordenadas das anotações
│   │   └── paginasLocais.ts       # Conteúdo único e metadados SEO das rotas locais
│   └── utils/
│       ├── helpers.ts             # Utilitários de WhatsApp, resumo 3D e eventos GA4
│       └── prerenderHtml.ts       # Injeção de SEO e conteúdo inicial por rota no build
└── vite.config.ts                 # Configuração Vite + pré-renderização estática das 6 rotas
```

---

## Como Executar Localmente

### Pré-requisitos
- **Node.js** 18+ e **npm**

### Passo a passo

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento (`http://localhost:3000`):
   ```bash
   npm run dev
   ```

3. Verifique a tipagem TypeScript:
   ```bash
   npm run lint
   ```

4. Gere o build de produção com pré-renderização estática das rotas SEO:
   ```bash
   npm run build
   ```
