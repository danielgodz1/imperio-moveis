# Segurança — Império Móveis Planejados

Auditoria de 2026-11-11. O site é estático (pré-renderizado) com duas funções serverless em `api/`. Não há banco de dados, login, painel administrativo nem upload de arquivos, o que elimina as superfícies de ataque mais comuns (injeção de SQL, sequestro de sessão, upload malicioso).

## O que foi verificado e o resultado

| Área | Situação |
| :--- | :--- |
| Dependências (`npm audit --omit=dev`) | 0 vulnerabilidades conhecidas |
| Segredos no código e no histórico do git | Nenhum. `.env*` fora do git; só existe um exemplo fictício (`MY_GEMINI_API_KEY`) |
| XSS no React | Único `dangerouslySetInnerHTML` é o JSON-LD, gerado de dados fixos; agora com `<` escapado |
| HTML pré-renderizado | Todo texto passa por `escaparHtml`; JSON-LD com `<` escapado |
| Links externos (`target="_blank"`) | Todos com `rel="noopener noreferrer"` |
| `/api/lead` e `/api/layout` | Só POST JSON da mesma origem (bloqueia CSRF), validação com zod, limite por IP, honeypot |
| Webhook de leads | Tempo limite de 5 s (antes podia travar a função) |
| Limitador por IP | Limpeza automática da memória (antes crescia sem limite) |
| Express local | Sem cabeçalho `X-Powered-By`; `nosniff`, `X-Frame-Options` e `Referrer-Policy` |

## Cabeçalhos de segurança (`vercel.json`)

- **Content-Security-Policy:** só scripts do próprio site; fontes do Google Fonts; mapa do Google em iframe; nada de `eval`, `object` ou envio de formulários para fora. `frame-ancestors 'none'` impede que o site seja embutido em outro (clickjacking).
- **Strict-Transport-Security:** força HTTPS por 2 anos.
- **X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy** (câmera, microfone, localização e pagamento desligados), **Cross-Origin-Opener-Policy**.
- **Cache:** arquivos com hash em `/assets` imutáveis por 1 ano; fotos por 7 dias; `/api` sem cache.

Google Tag Manager (`GTM-KRTQ85BD`) liberado na CSP: `googletagmanager.com` em `script-src`, `img-src` e `frame-src`; `google-analytics.com` e `analytics.google.com` em `connect-src` e `img-src`. O início do GTM fica em `public/gtm-inicio.js`, porque a CSP não aceita script dentro do HTML. Tags do tipo "HTML personalizado" no GTM serão bloqueadas pela CSP; prefira as tags nativas (GA4, Google Ads).

O zod roda em modo `jitless` (`schema.ts`), porque a CSP proíbe `eval`.

## Testes executados

Requisições de ataque simuladas contra as duas rotas: GET (405), formulário em vez de JSON (415), origem de outro domínio (403), WhatsApp com `<script>` (400), 7 envios no mesmo minuto (429) e texto de 300 mil caracteres (cortado em 400). O build foi servido com a CSP real e navegado nos três níveis sem nenhuma violação no console.

## O que depende de você (contas, não código)

A maior parte das "invasões" e alterações de sites pequenos acontece por conta roubada, não por falha no código.

1. **Autenticação em dois fatores** no GitHub, na Vercel, no registro.br e no e-mail usado nessas contas.
2. **registro.br:** ativar o bloqueio do domínio (proteção contra transferência) e o DNSSEC depois de apontar o domínio.
3. **GitHub:** proteger a branch `main` (exigir que alterações passem por pull request).
4. **Vercel:** conferir quem tem acesso ao projeto e manter a proteção das URLs de preview, se não quiser que fiquem públicas.
5. **Não colar chaves** (`LEAD_WEBHOOK_URL`, futuros tokens) em arquivos do projeto; usar as variáveis de ambiente da Vercel.

## Limites conhecidos

- O limite por IP vive na memória de cada instância serverless. Contra um ataque distribuído grande, use o firewall da Vercel (Attack Challenge Mode) ou um limitador externo.
- O mapa do Google é um iframe de terceiro, permitido na CSP.

## LGPD e textos legais

- Política de Privacidade em `/privacidade` e Termos de Uso em `/termos` (`src/data/legal.ts`). O texto descreve o que o site faz hoje: formulário que abre o WhatsApp, projeto 3D salvo só no navegador, medição pelo Google Tag Manager/Analytics.
- Se o site passar a coletar ou guardar algo novo (por exemplo, ligar `VITE_SALVAR_LEADS`), atualizar o texto e a data `atualizadoEm`.
- Pendente dos donos: razão social, CNPJ e um e-mail de contato para constar na política; revisão do texto por um advogado.
