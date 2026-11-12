# Duplicidade e canonical (12/11/2026)

| Caso | Hoje | Avaliação |
| :--- | :--- | :--- |
| `http://` e domínio sem www | 308 até `https://www` (do `http` sem www são 2 saltos: primeiro para `https` sem www, depois para www) | OK; dois saltos não prejudicam. Opcional: na Vercel, deixar o domínio sem www redirecionando direto |
| `/index.html` | 308 para `/` | OK |
| `/pagina/index.html` e `/pagina.html` | 308 para `/pagina` | OK |
| `/pagina/` (barra no fim) | **200, cópia da página** (o canonical aponta para a versão sem barra) | Corrigido nesta branch: `"trailingSlash": false` no `vercel.json` passa a redirecionar com 308 |
| `?utm_source=...` | 200 com canonical sem o parâmetro | OK |
| Maiúsculas (`/OBRAS`) | 404 | OK |

Todas as páginas têm `<link rel="canonical">` próprio e absoluto em `https://www`.
