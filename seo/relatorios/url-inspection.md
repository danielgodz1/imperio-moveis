# Inspeção de URL: passo a passo para o dono

A API do Search Console exige uma conta de serviço do Google Cloud com acesso à propriedade. Isso é configuração da conta do dono; nenhuma chave foi criada ou pedida.

## Manual (recomendado, 5 minutos)

1. Abrir https://search.google.com/search-console e escolher a propriedade do domínio.
2. Barra do topo, **Inspecionar qualquer URL**: colar a URL.
3. Ler **A URL está no Google?** e, se não estiver, clicar em **Testar URL publicada** e depois em **Ver página testada > Captura de tela**: deve aparecer o título e o texto da página.
4. Clicar em **Solicitar indexação**.
5. Repetir para as 10 URLs de `indexacao.md`.

## Automático (opcional, se quiser relatórios mensais)

1. Google Cloud Console: criar projeto, ativar **Google Search Console API**.
2. Criar **conta de serviço** e baixar a chave JSON. Guardar fora do repositório (nunca commitar).
3. No Search Console, **Configurações > Usuários e permissões**: adicionar o e-mail da conta de serviço como usuário (Restrito basta).
4. Com isso dá para chamar `urlInspection.index.inspect` para cada URL. A chave fica só na máquina de quem roda o relatório.
