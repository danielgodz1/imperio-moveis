# Checklist Operacional Pós-Deploy — Império Móveis Planejados (`https://www.imperiomoveisplanejadosjau.com.br`)

Este guia prático documenta os passos operacionais no **Google Search Console**, no **Perfil da Empresa no Google (Google Business Profile em Jaú/SP)** e de **autoridade local (Backlinks)** após o merge e deploy da branch `fix/seo-canonico-blindado`.

---

## 1. Google Search Console — Propriedade Canônica e Sitemap

1. **Selecionar a Propriedade Canônica Oficial:**
   - Acesse o [Google Search Console](https://search.google.com/search-console) na propriedade de prefixo de URL **`https://www.imperiomoveisplanejadosjau.com.br/`** (com `https://` e com `www`) ou Propriedade de Domínio (`imperiomoveisplanejadosjau.com.br`).
2. **Reenviar o Sitemap Oficial:**
   - No menu lateral **Sitemaps**, envie:
     ```text
     https://www.imperiomoveisplanejadosjau.com.br/sitemap.xml
     ```
3. **Inspeção de URL e Solicitação de Indexação Prioritária (7 URLs Principais):**
   - Cole cada uma das URLs abaixo na barra superior **Inspecionar qualquer URL**, clique em **Testar URL publicada** e depois em **Solicitar indexação**:
     1. `https://www.imperiomoveisplanejadosjau.com.br/`
     2. `https://www.imperiomoveisplanejadosjau.com.br/marcenaria-em-jau`
     3. `https://www.imperiomoveisplanejadosjau.com.br/cozinhas-planejadas-jau`
     4. `https://www.imperiomoveisplanejadosjau.com.br/quartos-e-closets-planejados-jau`
     5. `https://www.imperiomoveisplanejadosjau.com.br/obras`
     6. `https://www.imperiomoveisplanejadosjau.com.br/contato`
     7. `https://www.imperiomoveisplanejadosjau.com.br/termos`

---

## 2. Validação dos 5 Metadados de Imagem no Google Search Console

1. No Google Search Console, acesse **Melhorias -> Metadados de imagem** (ou use o [Teste de Pesquisa Aprimorada do Google](https://search.google.com/test/rich-results)).
2. Teste `https://www.imperiomoveisplanejadosjau.com.br/` e `https://www.imperiomoveisplanejadosjau.com.br/obras`.
3. Verifique que todos os objetos `ImageObject` apresentam **0 alertas** nos 5 campos:
   - `creator`: Objeto `@type: "Organization"` (`Império Móveis Planejados Jaú`)
   - `creditText`: `"Projeto executado por Império Móveis Planejados Jaú"`
   - `copyrightNotice`: `"© 2026 Império Móveis Planejados Jaú (CNPJ 48.945.152/0001-93). Todos os direitos reservados."`
   - `license`: `https://www.imperiomoveisplanejadosjau.com.br/termos` (URL limpa sem `#`)
   - `acquireLicensePage`: `https://www.imperiomoveisplanejadosjau.com.br/contato` (URL limpa sem `#`)
4. Caso haja alerta residual da versão anterior no Search Console, clique em **Validar correção**.

---

## 3. Perfil da Empresa no Google (Google Business Profile — GBP em Jaú/SP)

1. **Consistência Estrita de NAP (Nome, Endereço, Telefone e URL):**
   - **Nome da Empresa:** `Império Móveis Planejados`
   - **Categoria Principal:** `Loja de móveis planejados` / `Marcenaria` (`Furniture store` / `Cabinet maker`)
   - **Endereço Oficial:** `Rua Dona Djanira Werneck de Almeida e Silva, 280 - Jardim Itamarati, Jaú - SP, CEP 17209-450`
   - **Telefone / WhatsApp:** `(14) 99849-2834`
   - **Website Oficial (com `www`):** `https://www.imperiomoveisplanejadosjau.com.br/`
2. **Descrição da Empresa no GBP (Alinhada aos Dados Reais):**
   - Informar a fábrica própria com maquinário próprio no Jardim Itamarati em Jaú/SP (CNPJ `48.945.152/0001-93`), chapas 100% MDF (`15mm`, `18mm` e `25mm`), MDF Naval/Hidrófugo para áreas molhadas, atendimento mediante visita técnica e agendamento, orçamento com apresentação de projeto 3D e montagem própria em Jaú e região.
3. **Publicação de Fotos Reais de Obras Entregues:**
   - Subir mensalmente fotos reais de cozinhas planejadas, dormitórios, closets e áreas gourmet executadas em Jaú e região diretamente no Perfil da Empresa no Google.
   - Solicitar aos clientes reais após a montagem que deixem avaliação no Google mencionando o ambiente executado (ex.: *"cozinha planejada"*, *"closet sob medida"*) e a cidade/bairro.

---

## 4. Conquista de Backlinks Locais e Parcerias em Jaú/SP

1. **Escritórios de Arquitetura, Engenharia e Design de Interiores em Jaú:**
   - Enviar a página especialista `https://www.imperiomoveisplanejadosjau.com.br/marcenaria-em-jau` para arquitetos e designers parceiros em Jaú, solicitando menção/link como fornecedor de marcenaria executiva nas páginas de portfólio ou parceiros.
2. **Diretórios Empresariais e Associações Locais:**
   - Garantir que o cadastro do CNPJ `48.945.152/0001-93` (`Wellington Ribeiro Cabral`) em guias empresariais de Jaú, catálogos regionais e redes sociais (`Instagram @imperio.moveis.jau`) aponte sempre para `https://www.imperiomoveisplanejadosjau.com.br/`.

