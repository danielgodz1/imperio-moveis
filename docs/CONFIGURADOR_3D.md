# Configurador 3D

Prévia comercial para gerar orçamento qualificado. Não substitui o projeto executivo (Promob).

## Onde fica cada coisa

| Arquivo | Papel |
| :--- | :--- |
| `src/data/ambientes/*.ts` | Um arquivo por ambiente (quarto, cozinha, closet, home office, banheiro): planta padrão, limites, portas e janelas, módulos permitidos e iniciais |
| `src/data/cenarios.ts` | Catálogo de módulos (`CATALOGO_MODULOS_CENARIO`) e tipos; reexporta `CENARIOS_AMBIENTES` |
| `src/components/quarto3d/motorGeometrico.ts` | Fonte única de medidas: pose, caixas de colisão, aberturas (`faixaAbertura`, `caixaAbertura`, `xLocalNaParede`, `prenderAbertura`) e validação |
| `src/components/quarto3d/regrasProjeto.ts` | Regras de projeto: circulação, giro da porta, cama x TV, cozinha (bancada, aéreo, triângulo), sugestão de correção e encaixe |
| `src/components/quarto3d/marcenaria.ts` | Gerador puro de marcenaria: caixaria 18 mm, frentes 18 mm, fundo 6 mm, folga 3 mm, portas de até 60 cm, vãos, gavetas, maleiro, puxadores |
| `src/components/quarto3d/MovelMarcenaria.tsx` | Desenha o que o gerador devolve e anima o "ver por dentro" no laço do próprio Canvas |
| `src/data/materiais/catalogo.json` | Catálogo de acabamentos que os donos preenchem: nome, fabricante, tipo, superfície, cor, escala, veio, uso e mapas |
| `src/components/quarto3d/texturasPbr.ts` | Mapas de cor, relevo e rugosidade gerados por código quando o catálogo não traz fotos |
| `src/components/quarto3d/schema.ts` | Contrato do layout (zod), versão (`VERSAO_LAYOUT`) e migração de layouts antigos (`normalizarLayout`) |
| `src/components/quarto3d/estadoEditor.ts` | Estado único no Zustand: layout, seleção, desfazer e refazer (gestos contínuos viram um passo só) |
| `src/components/quarto3d/CenaQuarto3D.tsx` | Único `<Canvas>`; desenha com as mesmas funções do motor |
| `src/components/quarto3d/Quarto3DExperiencia.tsx` | Painel lateral |

Medidas internas em metros; a interface mostra centímetros em passos de 5 cm. A posição de móveis e aberturas usa o mesmo eixo: X nas paredes do fundo e da frente, Z nas laterais.

## Módulos paramétricos

- **Guarda-roupa:** a largura vira vãos de cerca de 90 cm; cada vão escolhe cabideiro, prateleiras, gavetas (2 a 4) ou sapateira; maleiro opcional no topo com portas próprias; portas de abrir (divididas em até 60 cm), de correr (trilho duplo) ou sem porta; puxador cava, perfil, alça ou toque.
- **Balcão da bancada em L:** módulos de até 60 cm, gaveteiro de 3 na ponta oposta à pia, canto cego atrás do retorno e rodapé recuado.
- **Aéreo:** portas de até 60 cm, prateleira a meia altura, puxador toque por padrão.
- **Ver por dentro:** botão na cena; portas giram 100°, gavetas correm e folhas de correr deslizam. Com `prefers-reduced-motion`, abre sem animação.

## Materiais

- Fonte única: `src/data/materiais/catalogo.json`. Validado em `npm test` (`catalogoSchema.ts`): id único, cor `#RRGGBB`, mapas só em `/materiais/`.
- **Como preencher:** trocar `nome` pelo nome comercial, preencher `fabricante`, marcar `confirmado: true`. Para fotos reais, salvar `public/materiais/<id>-cor.webp`, `-normal.webp` e `-rugosidade.webp` (até 1024 px, repetíveis) e apontar em `mapas`. A `escalaCm` é quanto uma repetição cobre na peça real.
- **Sem foto:** madeira, pedra, TX e metal têm cor, relevo e rugosidade gerados do mesmo desenho; criados só quando aparecem na cena, em 512 px no aparelho fraco e 1024 px no forte.
- **Superfícies:** fosco (rugosidade 0,78), acetinado (0,42), brilho (0,10 com verniz).
- **Veio:** segue a maior dimensão da peça e é deslocado por peça, então portas vizinhas não repetem o desenho.
- **Fita de borda:** as quatro bordas finas de cada chapa usam o mesmo acabamento sem relevo, 10% mais escuro e mais fosco.
- Os ids antigos (`freijo-ripado`, `branco-neve`, `areia-acetinado`, `cinza-urbano`...) foram mantidos para não quebrar projetos salvos, o hero e a API; só os nomes mudaram para a paleta de referência.

## Luz e modo foto

- **Sol pela janela real** (`iluminacao.ts`, `luzDaJanela`): a luz direcional vem de fora da primeira janela e mira o piso; sem janela, luz difusa da frente.
- **Exposição:** tonemapping AgX com exposição 1,25 e ambiente interno (RoomEnvironment) mais forte, para a cena não ficar escura.
- **Sombra de contato:** uma mancha suave sob cada caixa do motor (forte no piso, leve em peça suspensa); funciona em qualquer aparelho, sem custo de sombra em tempo real. Sombras reais continuam só no aparelho forte.
- **LED:** 2700 K, 3000 K (padrão) ou 4000 K, na aba Cores e luz; vale para fita, brilho e luzes pontuais e vai no resumo do WhatsApp.
- **Modo foto:** câmera em pé junto à parede da frente, olhos a 1,60 m, lente de 26 mm, sem contornos. "Baixar imagem" gera PNG de pelo menos 1920 px com a marca "Império Móveis Planejados" no canto. A imagem enviada para orçamento também leva a marca.
- **Pisos:** vinílico madeirado, porcelanato e cimento queimado.

## Planta e elevação

- **Vistas:** 3D, Planta e Elevação (Fundo, Esquerda, Direita, Frente). Planta e elevação usam câmera sem perspectiva (desenho técnico), sem girar; dá para aproximar e arrastar.
- **Cotas** (`cotas.ts`, funções puras testadas): calculadas das mesmas caixas do motor, em cm, com traço dourado de lápis e marca inclinada de arquiteto (`DesenhoTecnico.tsx`).
  - Planta: por parede, corrente das peças (com os vãos livres), corrente de portas e janelas e comprimento total; peça solta (ilha) com largura e profundidade. O forro do teto some na planta.
  - Elevação: corrente das peças e total embaixo, pé-direito ao lado, altura de cada peça e, nas janelas, peitoril e altura.
  - Peças sobrepostas na mesma parede (mesa de cabeceira no painel) entram só pela maior na corrente; a corrente sempre soma o comprimento da parede.

## Painel em etapas e envio

- **Etapas:** 1 Ambiente (tipo, medidas, portas e janelas), 2 Modelo, 3 Móveis, 4 Cores, 5 Enviar; abas numeradas e botões Voltar/Próximo. O botão dourado embaixo da cena leva ao resumo.
- **Modelos prontos** (`modelosProntos.ts`): 3 por ambiente, montados dos módulos do catálogo; peça extra só entra se o motor achar lugar válido (teste garante zero problemas). `[CONFIRMAR]` os donos podem trocar por projetos reais.
- **Resumo:** miniatura, cada peça com medidas em cm, acabamento, tampo, portas e parede; aviso se houver peça em vermelho.
- **Perguntas antes de enviar:** nome, cidade (lista de `empresa.ts` + outra), prazo e se já tem medidas ou planta. Sem isso o envio não sai.
- **WhatsApp:** mensagem montada em `resumoProjeto.ts` com os dados acima, o projeto e o link; a imagem com marca é compartilhada (celular) ou baixada (computador).
- **Preço de referência** (`src/data/precos.json`): desligado (`ativo: false`). Ligado, mostra "a partir de" = largura × preço por metro linear de cada módulo, com aviso.
- **Salvar e compartilhar:** o projeto fica salvo no navegador (`localStorage`); "Copiar link deste projeto" gera `#projeto=...` comprimido (cerca de 560 caracteres). O link abre direto no 3D, na etapa Enviar, mesmo em aparelho que entraria no nível sem 3D (desde que tenha WebGL).
- **Fora desta etapa:** PDF.

## Regras de projeto

| Regra | Valor |
| :--- | :--- |
| Janela | Móvel acima de 90 cm não ocupa os 30 cm na frente da janela |
| Porta do ambiente | Nada no giro da folha (quadrado da largura, abrindo para dentro) |
| Guarda-roupa | 60 cm livres na frente (portas de abrir) ou 40 cm (de correr); sugere correr quando não cabe |
| Cama | 60 cm livres nas laterais (mesa de cabeceira pode); cabeceira em parede sem janela |
| TV | Na parede oposta à cabeceira, a pelo menos 2 m, centro da tela entre 100 e 120 cm |
| Cozinha | 90 cm de passagem entre bancada, ilha e geladeira; bancada de 90 cm; aéreo 60 a 70 cm acima; triângulo pia, cooktop e geladeira com lados de 1,2 a 2,7 m e soma até 7,9 m; cooktop longe da janela e a 60 cm da geladeira |
| Encaixe | Ao arrastar, cola na vizinha ou na ponta da parede a menos de 8 cm; vizinha igual alinha a altura |

Móveis acima de 1,40 m do piso (aéreos) não contam na circulação. A correção sugerida só aparece quando resolve a peça sem criar problema em outra; quando não existe (ex.: cabeceira na parede da janela com a TV na frente), a peça fica marcada em vermelho para o cliente decidir.

Referências de medida (circulação, triângulo) são as usuais de projeto de interiores e podem ser ajustadas pelos donos em `regrasProjeto.ts`. `[CONFIRMAR]`

## Testes

`npm test` (vitest). Testes em `src/components/quarto3d/*.test.ts`.

## Andamento

| Etapa | Situação |
| :--- | :--- |
| 0. Testes do motor atual | Feito |
| 1. Ambientes separados, banheiro, portas e janelas editáveis, Zustand, schema versionado | Feito |
| 2. Motor de regras (circulação, porta, cama/TV, cozinha) | Feito |
| 3. Módulos paramétricos e "ver por dentro" | Feito para guarda-roupa, balcão e aéreo. Faltam: torre quente, paneleiro, ilha, cabeceira, painel de TV, home office e closet em L/U |
| 4. Catálogo de materiais com veio orientado | Feito |
| 5. Luz, sombras, LED e modo foto | Feito (sem AO em tela; sombra de contato por mancha) |
| 6. Planta e elevação com cotas | Feito |
| 7. Painel em etapas, resumo, link e envio | Feito (sem PDF) |
| 8. Celular e acessibilidade | Pendente |

## Depende dos donos

- Fotos de referência do banheiro (hoje usa uma foto de quarto) `[CONFIRMAR]`.
- Acabamentos reais, preços e os três layouts por ambiente baseados em obras.
