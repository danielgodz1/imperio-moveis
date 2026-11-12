# Páginas fora do índice

| Página | Como está | Situação |
| :--- | :--- | :--- |
| Página de erro 404 (`404.html`) | `<meta name="robots" content="noindex">` e status 404 | OK |
| Prévias da Vercel (`*.vercel.app`) | Protegidas por login da Vercel | OK |
| `/v2` (prévia da nova versão, só no ramo `preview/site-v2`) | `noindex` e fora do sitemap | OK; não está na produção |
| Projeto antigo da Vercel (conta antiga) | Deploys bloqueados | Desligar o projeto (ver auditoria de segurança) |
| Página de agradecimento | Não existe (o orçamento vai para o WhatsApp) | Nada a fazer |

Nenhuma página que deveria aparecer está bloqueada: o `robots.txt` só tem `Allow: /` e o sitemap.
