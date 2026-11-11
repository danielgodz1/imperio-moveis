# Configurador 3D

Prévia comercial para gerar orçamento qualificado. Não substitui o projeto executivo (Promob).

## Onde fica cada coisa

| Arquivo | Papel |
| :--- | :--- |
| `src/data/ambientes/*.ts` | Um arquivo por ambiente (quarto, cozinha, closet, home office, banheiro): planta padrão, limites, portas e janelas, módulos permitidos e iniciais |
| `src/data/cenarios.ts` | Catálogo de módulos (`CATALOGO_MODULOS_CENARIO`) e tipos; reexporta `CENARIOS_AMBIENTES` |
| `src/components/quarto3d/motorGeometrico.ts` | Fonte única de medidas: pose, caixas de colisão, aberturas (`faixaAbertura`, `caixaAbertura`, `xLocalNaParede`, `prenderAbertura`) e validação |
| `src/components/quarto3d/regrasProjeto.ts` | Regras de projeto: circulação, giro da porta, cama x TV, cozinha (bancada, aéreo, triângulo), sugestão de correção e encaixe |
| `src/components/quarto3d/schema.ts` | Contrato do layout (zod), versão (`VERSAO_LAYOUT`) e migração de layouts antigos (`normalizarLayout`) |
| `src/components/quarto3d/estadoEditor.ts` | Estado único no Zustand: layout, seleção, desfazer e refazer (gestos contínuos viram um passo só) |
| `src/components/quarto3d/CenaQuarto3D.tsx` | Único `<Canvas>`; desenha com as mesmas funções do motor |
| `src/components/quarto3d/Quarto3DExperiencia.tsx` | Painel lateral |

Medidas internas em metros; a interface mostra centímetros em passos de 5 cm. A posição de móveis e aberturas usa o mesmo eixo: X nas paredes do fundo e da frente, Z nas laterais.

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
| 3. Módulos paramétricos e "ver por dentro" | Pendente |
| 4. Catálogo de materiais com veio orientado | Pendente |
| 5. Luz, sombras, LED e modo foto | Pendente |
| 6. Planta e elevação com cotas | Pendente |
| 7. Painel em etapas, resumo, link e envio | Pendente |
| 8. Celular e acessibilidade | Pendente |

## Depende dos donos

- Fotos de referência do banheiro (hoje usa uma foto de quarto) `[CONFIRMAR]`.
- Acabamentos reais, preços e os três layouts por ambiente baseados em obras.
