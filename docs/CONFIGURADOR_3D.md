# Configurador 3D

Prévia comercial para gerar orçamento qualificado. Não substitui o projeto executivo (Promob).

## Onde fica cada coisa

| Arquivo | Papel |
| :--- | :--- |
| `src/data/ambientes/*.ts` | Um arquivo por ambiente (quarto, cozinha, closet, home office, banheiro): planta padrão, limites, portas e janelas, módulos permitidos e iniciais |
| `src/data/cenarios.ts` | Catálogo de módulos (`CATALOGO_MODULOS_CENARIO`) e tipos; reexporta `CENARIOS_AMBIENTES` |
| `src/components/quarto3d/motorGeometrico.ts` | Fonte única de medidas: pose, caixas de colisão, aberturas (`faixaAbertura`, `caixaAbertura`, `xLocalNaParede`, `prenderAbertura`) e validação |
| `src/components/quarto3d/schema.ts` | Contrato do layout (zod), versão (`VERSAO_LAYOUT`) e migração de layouts antigos (`normalizarLayout`) |
| `src/components/quarto3d/estadoEditor.ts` | Estado único no Zustand: layout, seleção, desfazer e refazer (gestos contínuos viram um passo só) |
| `src/components/quarto3d/CenaQuarto3D.tsx` | Único `<Canvas>`; desenha com as mesmas funções do motor |
| `src/components/quarto3d/Quarto3DExperiencia.tsx` | Painel lateral |

Medidas internas em metros; a interface mostra centímetros em passos de 5 cm. A posição de móveis e aberturas usa o mesmo eixo: X nas paredes do fundo e da frente, Z nas laterais.

## Testes

`npm test` (vitest). Testes em `src/components/quarto3d/*.test.ts`.

## Andamento

| Etapa | Situação |
| :--- | :--- |
| 0. Testes do motor atual | Feito |
| 1. Ambientes separados, banheiro, portas e janelas editáveis, Zustand, schema versionado | Feito |
| 2. Motor de regras (circulação, porta, cama/TV, cozinha) | Pendente |
| 3. Módulos paramétricos e "ver por dentro" | Pendente |
| 4. Catálogo de materiais com veio orientado | Pendente |
| 5. Luz, sombras, LED e modo foto | Pendente |
| 6. Planta e elevação com cotas | Pendente |
| 7. Painel em etapas, resumo, link e envio | Pendente |
| 8. Celular e acessibilidade | Pendente |

## Depende dos donos

- Fotos de referência do banheiro (hoje usa uma foto de quarto) `[CONFIRMAR]`.
- Acabamentos reais, preços e os três layouts por ambiente baseados em obras.
