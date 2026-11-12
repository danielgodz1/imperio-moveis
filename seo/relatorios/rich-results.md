# Dados estruturados (JSON-LD) nas páginas publicadas

Conferência automática do HTML ao vivo em 12/11/2026: todos os blocos são JSON válido e têm os campos obrigatórios de cada tipo.

| Página | Tipos | Problemas | Resultado rico possível |
| :--- | :--- | :--- | :--- |
| `/` | FurnitureStore, WebSite, FAQPage (6 perguntas) | nenhum | Painel da empresa; o FAQ não vira resultado rico (o Google só mostra FAQ de sites de governo e saúde desde 2023), mas continua válido e útil para IA |
| `/obras` | FurnitureStore, BreadcrumbList, ItemList (11 imagens) | nenhum | Trilha (breadcrumb) e imagens |
| `/projetar`, `/contato`, `/privacidade`, `/termos` | FurnitureStore, BreadcrumbList | nenhum | Trilha |
| 4 páginas de ambiente | FurnitureStore, BreadcrumbList, Service | nenhum | Trilha |

## Sugestões

- `/contato`: o FurnitureStore já tem telefone e endereço; um `ContactPoint` separado não muda nada no Google para empresa local. Não adicionado.
- Estrelas de avaliação no Google para a própria empresa (avaliações "autoatribuídas") não aparecem como resultado rico; não adicionar `aggregateRating` só para isso.

## Validação manual (dono ou agente com navegador)

Rich Results Test e validator.schema.org não têm API pública. Para cada URL:
1. https://search.google.com/test/rich-results : colar a URL, anotar "válido / avisos / erros".
2. https://validator.schema.org : colar a URL, anotar avisos.
