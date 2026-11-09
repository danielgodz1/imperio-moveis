---
name: imperio-design-direction
description: Direção de arte e anti-slop para a Império Móveis Planejados. Use SEMPRE que for criar, refatorar ou auditar qualquer componente visual do site (páginas, seções, hero, cards, formulários, animações de UI). Obriga a IA a declarar uma direção estética antes de gerar código e proíbe os padrões genéricos de design de IA.
---

# Imperio Design Direction — Anti-Slop e Identidade Visual

## Quando usar

Ative esta skill antes de gerar qualquer código de interface para o site da Império. Ela se aplica a React, CSS, Tailwind, animações de UI e qualquer decisão visual.

## Protocolo obrigatório antes de codar

Antes de escrever uma linha de JSX ou CSS, responda internamente (e inclua um resumo no início da sua resposta):

1. **Qual é a direção estética desta página/seção em UMA frase?** Ex: "Editorial arquitetônico, luz natural, madeira como material dominante, tipografia serifada de contraste."
2. **Qual é o elemento de ancoragem visual?** Uma cor, uma textura, um tipo de foto, um gesto de layout que só a Império teria.
3. **Esta proposta cai em algum dos padrões banidos abaixo?** Se sim, refaça antes de codar.

## Matriz de padrões banidos (não use)

| Anti-padrão | Substituição obrigatória |
| :--- | :--- |
| Gradiente radial roxo/índigo desfocado no fundo | Superfícies monocromáticas profundas (#0c0c0e, #141416) com bordas hairline de 1px (rgba(255,255,255,0.06)) |
| Fonte Inter ou system-ui como padrão | Escolha uma serifada de personalidade para títulos (ex: Fraunces, Cormorant, Instrument Serif) e uma sans com caráter para corpo (ex: Geist, Satoshi, General Sans) |
| Hero centralizado com headline + subtítulo + dois botões | Layout assimétrico: texto à esquerda com muito respiro, imagem/3D ocupando 60-70% à direita, ou composição editorial em grid quebrado |
| Três cards iguais em linha com ícone + título + parágrafo | Variação de escala e ritmo: um card dominante, dois secundários, ou uma lista editorial com numeração e hierarquia tipográfica forte |
| `bg-slate-900` como "dark mode" padrão | Preto profundo com matiz quente/frio intencional, ou off-white com textura sutil de papel |
| Emoji como ícone de UI | Ícones desenhados, SVGs geométricos ou tipografia como ícone |
| Sombras difusas grandes e genéricas | Sombras curtas e direcionais, ou ausência de sombra com contraste de plano e borda |

## Identidade da Império (fonte da verdade)

- **Material central:** madeira planejada. A paleta deve evocar madeira real (tons quentes, neutros, terrosos), não o "bege de template".
- **Tom:** sofisticação silenciosa, não ostentação. O site vende projeto e confiança, não produto de prateleira.
- **Fotografia:** ambientes reais da Império, luz natural, composição arquitetônica. Nunca stock genérico de cozinha americana.
- **Tipografia:** contraste entre uma serifada editorial (para títulos e números de projeto) e uma sans limpa (para corpo e UI).

## Regra de consistência entre páginas

Se a página já existente usa um conjunto de tokens (cores, fontes, espaçamento), **não invente um novo sistema**. Leia o CSS global ou o `DESIGN.md` antes de propor algo. A nova página deve parecer parte do mesmo site, não um experimento isolado.

## Auditoria pós-geração

Depois de gerar o componente, faça uma passada de "unslop":
- Remova qualquer classe ou valor que corresponda à matriz banida.
- Verifique se a hierarquia visual tem pelo menos 3 níveis claros (título, subtítulo, corpo).
- Verifique se o mobile não é apenas "empilhado"; adapte a composição, não só o breakpoint.