# DESIGN.md — Império Móveis Planejados

Sistema visual do site. Toda tela usa os NOMES destes tokens, nunca valores soltos.

## Ideia central: "Do risco à obra"
A Império projeta (arquitetura e interiores) e fabrica (marcenaria). O site mostra essa passagem: um traço de lápis de marceneiro vira planta, a planta vira ambiente, o ambiente vira foto real. O elemento memorável é UM só: a **linha de lápis**. O resto fica quieto.

Tom: casa acolhedora, família, trabalho feito à mão. Os projetos reais são claros, de madeira ripada, granito preto, tons pastel e luz de LED.

## Cor
Origem das cores: logo e uniforme (preto e branco), paredes e bancadas dos projetos (neutros), destaque único em dourado (`--dourado`).

| Token | Valor | Papel |
|---|---|---|
| `--papel` | `#EFEEEA` | Fundo base das páginas (papel de desenho, levemente frio) |
| `--papel-2` | `#E2E0DA` | Faixas de fundo alternadas, campos de formulário |
| `--grafite` | `#262624` | Texto, traço do lápis, bordas |
| `--grafite-suave` | `#5B5A56` | Texto secundário, legendas (6:1 sobre `--papel`) |
| `--preto` | `#0A0A0A` | Preto da logo. Hero, seções "noite" e rodapé |
| `--dourado` | `#D4A84F` | Única cor de destaque: botão principal, brilho, traço sobre fundo `--preto`, pequenos detalhes |
| `--luz-brilho` | `rgba(212,168,79,.18)` | Halo de LED, só sobre `--preto` |
| `--erro` / `--ok` | `#B3261E` / `#2E6B4F` | Estados de formulário |

Regras:
- O `--dourado` (`#D4A84F`) é a ÚNICA cor de destaque. Usos permitidos: botão principal (fundo `--dourado`, texto `--preto`), traço da planta e da linha de lápis sobre fundo `--preto`, brilho do hero, pequenos detalhes.
- NUNCA usar `--dourado` como cor de texto sobre `--papel` (contraste insuficiente), e NUNCA em barra de rolagem, seleção de texto, bordas de cartões ou títulos.
- Madeira, verde-sálvia e tons pastel aparecem nas FOTOS, não na interface.
- Proibido gradiente decorativo.
- Ritmo: Hero com fundo `--preto` e foto real em tela cheia; depois do hero a página volta para `--papel`; momentos "noite" em `--preto` (donos, 3D, rodapé).

## Tipografia
Duas famílias bem diferentes:
- **Archivo** (variável, eixo de largura 62 a 125): títulos condensados e pesados, como medida marcada em tábua; texto em largura normal.
- **Newsreader** itálico: só para a voz humana (falas e história dos donos).

Google Fonts:
`family=Archivo:wdth,wght@62..125,100..900&family=Newsreader:ital,opsz,wght@1,6..72,300..600&display=swap`

| Nome | Família e variação | Tamanho (clamp) | Entrelinha |
|---|---|---|---|
| `display` | Archivo wdth 62, peso 800, `text-wrap: balance` | 3rem, 7.5vw, 7rem | 0.92 |
| `h1` | Archivo wdth 70, peso 800 | 2.5rem, 6vw, 4.75rem | 0.95 |
| `h2` | Archivo wdth 80, peso 700 | 1.75rem, 3.2vw, 2.75rem | 1.05 |
| `h3` | Archivo wdth 100, peso 650 | 1.25rem a 1.5rem | 1.2 |
| `corpo` | Archivo wdth 100, peso 400 | 1.0625rem | 1.6 |
| `voz` | Newsreader itálico, peso 400 | 1.5rem, 2.4vw, 2.1rem | 1.35 |
| `cota` | Archivo wdth 100, peso 500, `tabular-nums` | 0.8125rem | 1.4 |

Regras: linhas de texto até 62 caracteres. Títulos em frase normal (sem caixa alta). NÃO usar: rótulo em caixa alta acima de títulos, uma palavra do título em itálico ou outra cor, setas "→" em botões, ponto médio separando metadados, travessão em rótulos.

## Espaço
Escala de 8: `4 8 16 24 32 48 64 96 144`. Seção: 96 (mobile) e 144 (desktop) de respiro vertical. Largura máxima do conteúdo 1280. Grade de 12 colunas, alinhamento à esquerda, assimétrica (texto em 5 colunas, imagem em 7, alternando). Centralizar tudo é proibido; centralizar só o CTA final.

## Forma e profundidade
- Raio: `0` em fotos, cartões e seções (exceção consciente documentada: cartões da seção de Avaliações `ReviewsSection.tsx`); `2px` em botões, chips e campos; círculo completo só no botão flutuante do WhatsApp.
- Sombra: nenhuma. Profundidade vem de sobreposição, linhas de 1px e do contraste papel/preto. Única exceção: halo `--luz-brilho` sobre fundo preto.
- Proibido: `backdrop-blur`, vidro fosco, `rounded-2xl/3xl` (exceto na exceção consciente de `ReviewsSection.tsx`), `shadow-lg` e parentes.

## A linha de lápis (elemento-assinatura)
- SVG com `stroke: --grafite` (ou `--dourado` sobre preto), 1.5px (2px no celular), pontas arredondadas, leve tremor de mão via `feTurbulence` (baseFrequency 0.02, scale 1.5) aplicado só no traço.
- Aparece em 4 lugares, sempre com a MESMA linguagem: (1) a planta que se desenha no hero, (2) o indicador de rolagem lateral, (3) a linha do tempo dos donos, (4) o contorno do ambiente no 3D.
- Desenho com `stroke-dasharray`/`stroke-dashoffset` controlado por GSAP ScrollTrigger (scrub) ou por timeline única no carregamento.
- Cotas (medidas) usam o estilo `cota`, ex.: "3,20 m".

## Movimento
- Só 3 momentos orquestrados: o desenho do hero, o holofote nos donos, o "acender o LED" no 3D. Fora isso, nada de entrada com fade-subindo em cada seção, nada de hover com zoom, nada de objetos flutuando.
- Hero (montagem da cozinha): o andamento persegue a rolagem com velocidade máxima (no mínimo 4,2 s do traço à obra real, `ritmoNarrativa.ts`). Enquanto a montagem não termina, a página fica presa no fim do hero; links do menu, rodapé e botões (`scrollToTarget`) liberam a trava, e depois de vista uma vez a rolagem fica livre.
- Duração 0.6 a 1.2s. Easing `power3.out` e `expo.out`. Rolagem suave Lenis mantida no desktop; desligada em toque.
- `prefers-reduced-motion`: estado final estático, sem pin, sem scrub.
- Animar só `transform`, `opacity` e `clip-path`. Meta: 60fps em celular intermediário.

## Componentes
- **Botão principal**: fundo `--dourado`, texto `--preto`, raio 2px, altura 52px; hover inverte (fundo `--preto`, texto `--dourado`). Um por tela.
- **Botão secundário**: borda 1.5px `--grafite` (ou `--papel` sobre fundo escuro), fundo transparente.
- **Link**: sublinhado 1px com 4px de distância.
- **Campo de formulário**: só linha inferior de 1.5px (como linha de lápis sobre o papel), rótulo sempre visível acima.
- **Foco visível**: contorno 2px `--grafite` com 3px de distância (sobre preto: `--dourado`).
- **Cabeçalho**: transparente sobre a foto do hero; logo à esquerda, três links e o botão do WhatsApp. Esconde ao rolar para baixo, volta ao subir.
- **Faixa em movimento**: no máximo UMA, 48px de altura, texto Archivo condensado em `--grafite`, com os serviços reais (cozinhas, quartos, closets, lojas, projeto 3D).
- **Ícones**: lucide-react, traço 1.5, só funcionais (menu, fechar, WhatsApp, local). Sem emoji e sem "✳".

- **Comparação (diferencial)**: duas colunas de texto separadas por linhas, sem cartões; a coluna "do jeito comum" em `--grafite-suave`, a "Na Império" em `--grafite` com peso maior. Só fatos do jeito de trabalhar.
- **Página de texto (legal)**: coluna única de até 760px sobre `--papel`, títulos `tipo-h3`, marcadores de lista em `--dourado`.

## Imagem
- Só fotos reais dos projetos da Império. Zero banco de imagem, zero imagem gerada por IA no portfólio.
- Sem moldura, sem borda arredondada, sem sombra. Foto de borda a borda ou na largura da coluna.
- Legenda no estilo `cota`: ambiente, material, cidade. Só dados confirmados.
- Formatos: AVIF e WebP com `srcset`; mínimo 1600px de largura para fotos de tela cheia; `loading="lazy"` exceto a foto do hero (preload).
- Donos: foto em escala de cinza com "holofote" colorido sobre quem está sendo apresentado.

## Voz do texto
Nomes dos donos (Wellington e Tatiane) só na seção de quem faz a Império (`Donos.tsx`) e nos dados estruturados. No resto do site: "a arquiteta", "nossa equipe", "a equipe de produção e montagem".

Frases curtas, concretas, em primeira pessoa do plural. Números reais no lugar de adjetivos. "Sob medida" e "alto padrão" no máximo 2 vezes em todo o site. Botões dizem o que acontece: "Chamar no WhatsApp", "Ver as obras", "Enviar meu quarto".

## Proibições (lista de "cara de IA")
1. Gradiente decorativo, vidro fosco; `--dourado` fora dos usos permitidos (nunca como texto sobre `--papel`, barra de rolagem, seleção de texto, bordas de cartões ou títulos).
2. Playfair Display e Plus Jakarta Sans.
3. Três cartões iguais lado a lado; todo conteúdo em cartão arredondado com a mesma sombra (exceção consciente documentada: seção de Avaliações `ReviewsSection.tsx`).
4. Hero centralizado com título, subtítulo e dois botões.
5. Uma palavra do título em itálico dourado.
6. Rótulos em caixa alta acima dos títulos; numeração "01/02/03" fora de sequência real (o processo em 4 etapas é sequência e pode numerar).
7. Fade-up em todas as seções; hover com scale em todo cartão.
8. Objetos decorativos flutuando (parafusadeira, esquadro, lápis, fitas).
9. Fotos de banco de imagens.
10. Som automático.

## Qualidade mínima
Responsivo de 360px a 1920px. Contraste de texto 4.5:1. Teclado completo. `alt` descritivo em toda foto. CLS 0. JavaScript inicial abaixo de 250 KB gzip (3D em chunk separado, carregado só quando a seção entra na tela).
