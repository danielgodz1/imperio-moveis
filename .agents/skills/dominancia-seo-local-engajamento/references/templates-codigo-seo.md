# Templates de Referência — Dominância de SEO Local, Coordenadas, Desambiguação e Pré-Hidratação

Este documento contém os blocos de código de referência prontos para adaptação em projetos React / Vite / TypeScript.

---

## 1. Script Inline de Blindagem `prefers-reduced-motion` (`index.html`)

Injetar como o **primeiro elemento** dentro de `<head>`:

```html
<script>
  (function () {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      var orig = window.matchMedia.bind(window);
      window.matchMedia = function (q) {
        var mql = orig(q);
        if (/prefers-reduced-motion\s*:\s*reduce/i.test(q)) {
          return new Proxy(mql, {
            get: function (t, p) {
              if (p === 'matches') return false;
              var v = Reflect.get(t, p);
              return typeof v === 'function' ? v.bind(t) : v;
            }
          });
        }
        if (/prefers-reduced-motion\s*:\s*no-preference/i.test(q)) {
          return new Proxy(mql, {
            get: function (t, p) {
              if (p === 'matches') return true;
              var v = Reflect.get(t, p);
              return typeof v === 'function' ? v.bind(t) : v;
            }
          });
        }
        return mql;
      };
    }
  })();
</script>
```

---

## 2. Meta Tags de Alta Autoridade, E-E-A-T (CNPJ) e Coordenadas Geográficas (`index.html`)

```html
<title>Império Móveis Planejados em Jaú SP | Fábrica de Marcenaria Sob Medida e Projeto 3D</title>
<meta name="description" content="Fábrica de Móveis Planejados em Jaú SP (CNPJ 48.945.152/0001-93). Cozinhas planejadas, closets, dormitórios, área gourmet e corporativo 100% MDF com projeto 3D realista, fabricação própria e entrega no prazo em Jaú e região." />
<meta name="keywords" content="móveis planejados em jaú, marcenaria em jaú, fábrica de móveis planejados jaú, cozinhas planejadas jaú, closets sob medida jaú, móveis sob medida 100% mdf jaú, projeto 3d móveis planejados jaú" />
<link rel="canonical" href="https://www.imperiomoveisplanejadosjau.com.br/" />
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
<meta name="author" content="Império Móveis Planejados Jaú - CNPJ 48.945.152/0001-93" />
<meta name="geo.region" content="BR-SP" />
<meta name="geo.placename" content="Jaú, São Paulo, Brasil" />
<meta name="geo.position" content="-22.2964;-48.5586" />
<meta name="ICBM" content="-22.2964, -48.5586" />
```

---

## 3. Fonte Única da Verdade com Desambiguação de Homônimos e Matriz Regional (`src/data/empresa.ts`)

```ts
export interface CidadeAtendida {
  nome: string;
  uf: string;
  sameAs: string;
  wikipedia: string;
}

export const EMPRESA = {
  nome: 'Império Móveis Planejados',
  nomeFantasia: 'Império Móveis Planejados Jaú',
  razaoSocial: 'Wellington Ribeiro Cabral',
  cnpj: '48.945.152/0001-93',
  dataAberturaCnpj: '2022-12-21',
  url: 'https://www.imperiomoveisplanejadosjau.com.br',
  telefone: '(14) 99849-2834',
  whatsapp: '5514998492834',
  whatsappE164: '+5514998492834',
  endereco: {
    logradouro: 'Rua Dona Djanira Werneck de Almeida e Silva, 280',
    bairro: 'Jardim Itamarati',
    cidade: 'Jaú',
    uf: 'SP',
    cep: '17209-450',
    pais: 'BR',
  },
  geo: {
    latitude: -22.2964,
    longitude: -48.5586,
  },
  cidadesSchema: [
    { nome: 'Jaú', uf: 'SP', sameAs: 'https://pt.wikipedia.org/wiki/Ja%C3%BA', wikipedia: 'https://pt.wikipedia.org/wiki/Ja%C3%BA' },
    { nome: 'Barra Bonita', uf: 'SP', sameAs: 'https://pt.wikipedia.org/wiki/Barra_Bonita_(S%C3%A3o_Paulo)', wikipedia: 'https://pt.wikipedia.org/wiki/Barra_Bonita_(S%C3%A3o_Paulo)' },
    // ... demais cidades da microrregião
  ],
  bairrosCondominiosJau: [
    'Jardim Itamarati',
    'Centro',
    'Chácara Peccioli',
    'Jardim Estádio',
    'Jardim Maria Luiza IV',
    'Jardim Jorge Atalla',
    'Jardim Carolina',
    'Vila Assis',
    'Vila Netinho',
    'Residencial Bernardi',
    'Condomínios Fechados de Jaú',
  ],
};
```

---

## 4. Rodapé Semântico `<address>` para Autoridade Local (NAP + CNPJ)

```tsx
<address className="not-italic flex flex-col gap-12">
  <strong>{EMPRESA.nome} — {EMPRESA.endereco.cidade} / {EMPRESA.endereco.uf}</strong>
  <span>Razão Social: {EMPRESA.razaoSocial} | CNPJ: {EMPRESA.cnpj}</span>
  <span>
    Endereço: {EMPRESA.endereco.logradouro} - {EMPRESA.endereco.bairro}, {EMPRESA.endereco.cidade} - {EMPRESA.endereco.uf}, CEP: {EMPRESA.endereco.cep}
  </span>
  <span>Atendimento: {EMPRESA.horarios.semana} | {EMPRESA.horarios.sabado}</span>
  <a href={`tel:${EMPRESA.whatsappE164}`}>Ligar: {EMPRESA.telefone}</a>
  <a href={getWhatsAppUrl(undefined, 'rodape_local')}>Solicitar Projeto 3D e Orçamento no WhatsApp</a>
</address>
```

