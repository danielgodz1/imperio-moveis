# Indexação real (12/11/2026)

Consulta `site:imperiomoveisplanejadosjau.com.br` no Google (uma consulta, sem login): **1 resultado**, a home.

| Página | No sitemap | HTML inicial (status, H1, canonical, robots) | No Google |
| :--- | :--- | :--- | :--- |
| `/` | sim | 200, H1 no HTML, canonical próprio, `index, follow` | **sim** |
| `/obras` | sim | 200, idem | não |
| `/projetar` | sim | 200, idem (H1 e texto no HTML; o 3D carrega depois) | não |
| `/contato` | sim | 200, idem | não |
| `/cozinhas-planejadas-jau` | sim | 200, idem | não |
| `/quartos-planejados-jau` | sim | 200, idem | não |
| `/closets-sob-medida-jau` | sim | 200, idem | não |
| `/home-office-planejado-jau` | sim | 200, idem | não |
| `/privacidade` | sim | 200, idem | não |
| `/termos` | sim | 200, idem | não |

## Diagnóstico

Nada técnico impede a indexação: `robots.txt` libera tudo e aponta o sitemap, as 10 URLs estão no sitemap, cada página responde 200 com H1, texto e canonical próprio no HTML inicial, sem `noindex` (nem em meta, nem em cabeçalho `X-Robots-Tag`).

A causa provável é **tempo e sinal**: o domínio mudou de hospedagem há poucos dias e as páginas internas são novas. O Google costuma levar de dias a semanas para rastrear páginas novas de um site pequeno.

Problema de qualidade encontrado e corrigido nesta branch: 4 páginas mostravam texto de rascunho (`[CONFIRMAR pedra padrão]`, `[CONFIRMAR cidade]`...). Página com marca de rascunho parece inacabada para o Google e para o cliente. Ver `RELATORIO_VALIDACAO.md`.

## O que o dono faz (Search Console)

1. Em **Sitemaps**, enviar `https://www.imperiomoveisplanejadosjau.com.br/sitemap.xml` (se ainda não enviou).
2. Em **Inspeção de URL**, colar cada URL da tabela e clicar em **Solicitar indexação** (há um limite diário; começar por `/obras`, `/cozinhas-planejadas-jau` e `/projetar`).
3. Anotar o estado que aparece para cada uma: "Detectada, mas não indexada" (falta rastrear: só esperar), "Rastreada, mas não indexada" (avisar: aí é qualidade) ou "URL está no Google".
