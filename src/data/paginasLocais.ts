import { EMPRESA } from './empresa';
import { Ambiente } from './cenarios';
import { perguntasConfirmadas } from './perguntas';

export type RotaPublica =
  | '/'
  | '/contato'
  | '/projetar'
  | '/obras'
  | '/privacidade'
  | '/termos'
  | '/cozinhas-planejadas-jau'
  | '/quartos-planejados-jau'
  | '/closets-sob-medida-jau'
  | '/home-office-planejado-jau';

export interface FotoAmbienteLocal {
  srcBase: string;
  razao: string;
  alt: string;
  legenda: string;
}

export interface PaginaAmbienteConfig {
  rota:
    | '/cozinhas-planejadas-jau'
    | '/quartos-planejados-jau'
    | '/closets-sob-medida-jau'
    | '/home-office-planejado-jau';
  tituloSeo: string;
  descricaoSeo: string;
  h1: string;
  subtitulo: string;
  ambienteBriefing: string;
  ambiente3D: Ambiente;
  paragrafosReais: string[];
  especificacoesReais: { titulo: string; detalhe: string }[];
  fotos: FotoAmbienteLocal[];
}

export interface MetaRotaSeo {
  rota: RotaPublica;
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
  h1Inicial: string;
  resumoHtmlInicial: string;
}

/** Título e texto do hero da home (usados no componente e no HTML pré-renderizado). */
export const TEXTO_HERO = {
  chamada: 'Móveis Planejados em Jaú e Região:',
  titulo: 'Fábrica e Marcenaria Sob Medida com Projeto 3D',
  texto:
    'Fábrica própria de móveis planejados 100% MDF em Jaú/SP com projeto de arquitetura 3D incluso. Cozinhas planejadas, dormitórios, closets, área gourmet, banheiros e ambientes corporativos com entrega no prazo em Jaú e região.',
};

export const PAGINAS_AMBIENTES_LOCAIS: Record<
  PaginaAmbienteConfig['rota'],
  PaginaAmbienteConfig
> = {
  '/cozinhas-planejadas-jau': {
    rota: '/cozinhas-planejadas-jau',
    tituloSeo:
      'Cozinhas Planejadas em Jaú/SP | Império Móveis Planejados',
    descricaoSeo:
      'Cozinhas sob medida em Jaú e região projetadas pela nossa arquiteta e fabricadas na nossa marcenaria. Ilha em ripado, granito preto e armários até o teto.',
    h1: 'Cozinhas planejadas em Jaú com projeto de arquitetura e fabricação própria',
    subtitulo:
      'Desenhamos o fluxo entre pia, fogão, torre quente e ilha antes do primeiro corte de chapa na oficina.',
    ambienteBriefing: 'Cozinha',
    ambiente3D: 'cozinha',
    paragrafosReais: [
      'Nas cozinhas executadas pela Império em Jaú, a arquiteta parte da rotina real da família: altura da bancada, posição dos pontos hidráulicos e elétricos, espaço de circulação em torno da ilha e aproveitamento até o teto ou forro amadeirado.',
      'Na oficina, a equipe de produção executa o mobiliário com corpo da ilha em ripado de madeira, encontro limpo com a bancada de granito preto, fita de LED quente embutida em perfil de alumínio sob os aéreos e ferragens de fechamento suave.',
      'Trabalhamos tanto com composições em verde-sálvia e freijó quanto com frentes em grafite fosco e cristaleira iluminada, integrando coifa embutida, lava-louças e torre para forno e micro-ondas sem frestas aparentes.',
    ],
    especificacoesReais: [
      {
        titulo: 'Ilha em ripado e pedra',
        detalhe:
          'Estrutura reforçada para receber tampo e cascata em granito preto ou quartzo, com tomadas embutidas discretas.',
      },
      {
        titulo: 'Armários até o forro',
        detalhe:
          'Fechamento superior alinhado ao teto ou ao forro ripado de madeira, evitando acúmulo de poeira sobre os módulos.',
      },
      {
        titulo: 'Iluminação técnica em LED',
        detalhe:
          'Perfis embutidos na face inferior dos armários aéreos para iluminar a área de corte sem sombra.',
      },
    ],
    fotos: [
      {
        srcBase: '/obras/cozinha-gringa-4k',
        razao: '106 / 158',
        alt: 'Cozinha planejada sob medida em Jaú SP com ilha em MDF verde-sálvia, armários até o teto e iluminação em LED - Império Móveis Planejados',
        legenda:
          'Cozinha planejada com ilha central em verde-sálvia, cristaleira iluminada e marcenaria até o teto.',
      },
      {
        srcBase: '/obras/cozinha-ilha-ripado',
        razao: '941 / 1136',
        alt: 'Cozinha planejada em Jaú SP com ilha em MDF ripado amadeirado, bancada em granito preto e fita de LED sob os aéreos - Império Móveis Planejados',
        legenda:
          'Ilha em ripado de madeira com tampo e lateral em granito preto e fita de LED sob os aéreos.',
      },
      {
        srcBase: '/obras/cozinha-forro-ripado',
        razao: '408 / 641',
        alt: 'Cozinha sob medida 100% MDF em Jaú SP integrada ao forro ripado de madeira com torre quente para forno e micro-ondas - Império Móveis Planejados',
        legenda:
          'Integração entre marcenaria sob medida, torre quente e forro ripado em madeira.',
      },
    ],
  },

  '/quartos-planejados-jau': {
    rota: '/quartos-planejados-jau',
    tituloSeo:
      'Quartos Planejados e Infantis em Jaú/SP | Império Móveis',
    descricaoSeo:
      'Quartos de casal, solteiro, infantil e de bebê sob medida em Jaú/SP. Cabeceira ripada com LED, cama-casinha com escorregador e guarda-roupas até o teto.',
    h1: 'Quartos planejados de casal, solteiro e infantis em Jaú',
    subtitulo:
      'Do dormitório com cabeceira ripada e LED indireto ao quarto infantil em formato de casinha feito sob medida.',
    ambienteBriefing: 'Quarto',
    ambiente3D: 'quarto',
    paragrafosReais: [
      'Cada dormitório pede uma ergonomia diferente. Nos quartos de casal e solteiro que entregamos em Jaú, combinamos guarda-roupas até o teto com painéis ripados de madeira, nichos iluminados por fita de LED embutida e bancada de estudo ou penteadeira integrada.',
      'Nos projetos infantis e de bebê, a arquiteta desenha ambientes lúdicos e seguros: já executamos cama alta em formato de casinha com escorregador, escada lateral em que cada degrau funciona como gaveta, painel estofado em gomos e nichos redondos iluminados em tons pastel e verde-sálvia.',
      'Toda a estrutura de escadas, guarda-corpo e camas altas é dimensionada na nossa marcenaria para suportar o uso diário com quinas suavizadas.',
    ],
    especificacoesReais: [
      {
        titulo: 'Marcenaria infantil lúdica',
        detalhe:
          'Camas-casinha, mezaninos, escorregador e escadas com gavetões internos aproveitando cada centímetro do quarto.',
      },
      {
        titulo: 'Cabeceiras e painéis com LED',
        detalhe:
          'Painéis ripados com iluminação indireta quente e interruptores/tomadas posicionados na altura exata dos criados.',
      },
      {
        titulo: 'Quartos de bebê acolhedores',
        detalhe:
          'Combinação de madeira clara, verde-sálvia e tons pastel com cômoda trocador e nichos iluminados.',
      },
    ],
    fotos: [
      {
        srcBase: '/obras/quarto-infantil-casinha',
        razao: '1264 / 845',
        alt: 'Quarto infantil planejado sob medida em Jaú SP com cama-casinha superior, escorregador e escada com gavetas em MDF - Império Móveis Planejados',
        legenda:
          'Quarto infantil com cama-casinha, escorregador, escada com gavetas e painel estofado.',
      },
      {
        srcBase: '/obras/quarto-bebe-nichos',
        razao: '1213 / 864',
        alt: 'Quarto de bebê planejado em Jaú SP com marcenaria 100% MDF verde-sálvia, painel ripado e nichos redondos iluminados - Império Móveis Planejados',
        legenda:
          'Quarto de bebê em verde-sálvia e madeira clara com nichos redondos iluminados em LED.',
      },
      {
        srcBase: '/obras/dormitorio-led-1',
        razao: '51 / 82',
        alt: 'Dormitório planejado em Jaú SP com painel ripado de madeira MDF, prateleira iluminada em LED e bancada integrada - Império Móveis Planejados',
        legenda:
          'Dormitório com painel ripado até o teto, iluminação linear em LED e bancada sob medida.',
      },
    ],
  },

  '/closets-sob-medida-jau': {
    rota: '/closets-sob-medida-jau',
    tituloSeo:
      'Closets e Guarda-Roupas sob Medida em Jaú/SP | Império',
    descricaoSeo:
      'Closets planejados em L, em U ou integrados ao quarto em Jaú e região. Cabideiros iluminados em LED, sapateiras deslizantes, ilha de acessórios e espelho.',
    h1: 'Closets sob medida e guarda-roupas planejados em Jaú',
    subtitulo:
      'Divisão interna desenhada para o seu acervo real de roupas longas, calçados, malas e acessórios.',
    ambienteBriefing: 'Closet',
    ambiente3D: 'closet',
    paragrafosReais: [
      'Um closet sob medida não é uma sequência de prateleiras iguais: a arquiteta levanta a quantidade de vestidos longos, camisas, ternos, calçados e malas do casal para definir a altura exata de cada cabideiro, colmeia de gaveta e maleiro superior.',
      'Executamos armários em L ou corredor com iluminação vertical em LED nos montantes, sapateiras corrediças de extração total e penteadeira ou ilha central com tampo organizador.',
      'Mesmo em quartos compactos em Jaú, o projeto integrado de arquitetura e marcenaria permite criar um closet funcional aproveitando cantos em 90 graus e a altura total do pé-direito.',
    ],
    especificacoesReais: [
      {
        titulo: 'Divisão interna personalizada',
        detalhe:
          'Alturas diferenciadas para roupas longas, cabideiros duplos, gavetas com divisórias e maleiro até o teto.',
      },
      {
        titulo: 'Iluminação nos nichos e cabideiros',
        detalhe:
          'Fitas de LED embutidas que facilitam a visualização das cores reais das peças sem ofuscar.',
      },
      {
        titulo: 'Penteadeira e espelho de corpo inteiro',
        detalhe:
          'Integração de bancada de maquiagem ou ilha central com gavetas baixas para relógios e joias.',
      },
    ],
    fotos: [
      {
        srcBase: '/obras/dormitorio-led-2',
        razao: '800 / 1317',
        alt: 'Guarda-roupa e closet planejado sob medida em Jaú SP com nichos iluminados em LED e acabamento amadeirado 100% MDF - Império Móveis Planejados',
        legenda:
          'Marcenaria de dormitório e armários sob medida com iluminação embutida em LED.',
      },
      {
        srcBase: '/obras/dormitorio-led-1',
        razao: '51 / 82',
        alt: 'Dormitório e closet planejado em Jaú SP com marcenaria até o teto, ripado em MDF e bancada de apoio - Império Móveis Planejados',
        legenda:
          'Aproveitamento vertical até o teto com painéis ripados e nichos iluminados.',
      },
    ],
  },

  '/home-office-planejado-jau': {
    rota: '/home-office-planejado-jau',
    tituloSeo:
      'Home Office e Lojas Planejadas em Jaú/SP | Império Móveis',
    descricaoSeo:
      'Home office sob medida, consultórios e marcenaria comercial em Jaú/SP. Bancadas ergonômicas, estantes com LED, fachadas comerciais e logística completa.',
    h1: 'Home office planejado e marcenaria comercial em Jaú',
    subtitulo:
      'De bancadas de trabalho em casa a lojas completas, expositores e entregas em andar alto.',
    ambienteBriefing: 'Home office',
    ambiente3D: 'home-office',
    paragrafosReais: [
      'Para quem trabalha em casa ou recebe clientes em Jaú, projetamos bancadas de home office com passagem oculta de cabos, gaveteiros de apoio, estantes até o teto com iluminação em LED e painéis acústicos/ripados que valorizam o fundo de chamadas de vídeo.',
      'Na linha comercial, a Império executa desde expositores em madeira e estrutura metálica com prateleiras iluminadas até lojas inteiras — como a unidade GoCoffee em Jaú, onde fizemos o pórtico ripado de fachada, o balcão curvo e os nichos internos.',
      'A formação da nossa arquiteta em arquitetura e logística, somada à experiência de campo da equipe de produção e montagem, garante entregas pontuais inclusive em obras complexas com içamento por caminhão-guindaste.',
    ],
    especificacoesReais: [
      {
        titulo: 'Ergonomia e gestão de cabos',
        detalhe:
          'Bancadas na altura correta de trabalho com calhas ocultas para fontes, monitores e roteadores.',
      },
      {
        titulo: 'Marcenaria comercial completa',
        detalhe:
          'Balcões de atendimento, expositores iluminados em LED e pórticos em ripado para lojas e cafeterias.',
      },
      {
        titulo: 'Logística de entrega e içamento',
        detalhe:
          'Planejamento de transporte e içamento seguro para peças de grande formato em prédios e pontos comerciais.',
      },
    ],
    fotos: [
      {
        srcBase: '/obras/comercial-expositor',
        razao: '832 / 1259',
        alt: 'Marcenaria corporativa e expositor sob medida em MDF e serralheria metálica com LED em Jaú SP - Império Móveis Planejados',
        legenda:
          'Expositor e estante sob medida em madeira, estrutura metálica preta e iluminação em LED em cada nível.',
      },
      {
        srcBase: '/obras/comercial-gocoffee-interior',
        razao: '24 / 43',
        alt: 'Móveis planejados comerciais GoCoffee em Jaú SP com balcão curvo em MDF ripado de madeira e nichos iluminados - Império Móveis Planejados',
        legenda:
          'Interior comercial GoCoffee: balcão curvo em ripado de madeira e nichos iluminados.',
      },
      {
        srcBase: '/obras/entrega-guindaste',
        razao: '106 / 158',
        alt: 'Entrega técnica com caminhão-guindaste realizando içamento de marcenaria sob medida em Jaú SP - Império Móveis Planejados',
        legenda:
          'Logística de entrega com içamento por guindaste coordenada pela Império em Jaú.',
      },
    ],
  },
};

export const METADADOS_ROTAS_SEO: Record<RotaPublica, MetaRotaSeo> = {
  '/': {
    rota: '/',
    title: 'Império Móveis Planejados em Jaú SP | Fábrica de Marcenaria Sob Medida e Projeto 3D',
    description:
      'Fábrica de Móveis Planejados em Jaú SP (CNPJ 48.945.152/0001-93). Cozinhas planejadas, closets, dormitórios, área gourmet e corporativo 100% MDF com projeto 3D realista, fabricação própria e entrega no prazo em Jaú e região.',
    canonical: `${EMPRESA.url}/`,
    ogImage: `${EMPRESA.url}/og-hero.jpg`,
    h1Inicial: 'Móveis Planejados em Jaú e Região: Fábrica e Marcenaria Sob Medida com Projeto 3D',
    resumoHtmlInicial: TEXTO_HERO.texto,
  },
  '/contato': {
    rota: '/contato',
    title: 'Orçamento de Móveis Planejados em Jaú/SP | Império Móveis',
    description:
      'Conte o que quer planejar e quando quer começar, ou chame a equipe da Império no WhatsApp (14) 99849-2834. Orçamento rápido em Jaú e região.',
    canonical: `${EMPRESA.url}/contato`,
    ogImage: `${EMPRESA.url}/og-hero.jpg`,
    h1Inicial: 'Pedir orçamento de móveis planejados em Jaú',
    resumoHtmlInicial:
      'Responda os 3 passos rápidos de orçamento e fale direto com a nossa equipe pelo WhatsApp (14) 99849-2834.',
  },
  '/projetar': {
    rota: '/projetar',
    title: 'Projete Móveis Planejados em 3D, Grátis | Império Jaú',
    description:
      'Monte sua cozinha, quarto ou closet planejado em 3D no navegador, grátis. Baixe a imagem do projeto e peça o orçamento no WhatsApp.',
    canonical: `${EMPRESA.url}/projetar`,
    ogImage: `${EMPRESA.url}/projetar/cozinha-render.jpg`,
    h1Inicial: 'Projete seu móvel planejado em 3D',
    resumoHtmlInicial:
      'Escolha o ambiente, ajuste as medidas, monte os móveis e as cores. No fim, baixe a imagem de frente do projeto e mande para a Império orçar pelo WhatsApp.',
  },
  '/obras': {
    rota: '/obras',
    title: 'Obras de Móveis Planejados em Jaú/SP | Império Móveis',
    description:
      'Cozinhas, quartos e lojas planejados entregues em Jaú e região: fotos reais, materiais e acabamentos de cada obra da Império Móveis Planejados.',
    canonical: `${EMPRESA.url}/obras`,
    ogImage: `${EMPRESA.url}/obras/cozinha-gringa-4k.jpg`,
    h1Inicial: 'Obras de móveis planejados em Jaú e região',
    resumoHtmlInicial:
      'Cozinhas, quartos e lojas projetados pela nossa arquiteta e fabricados na nossa marcenaria. Todas as fotos são de obras entregues pela Império Móveis Planejados.',
  },
  '/privacidade': {
    rota: '/privacidade',
    title: 'Política de Privacidade (LGPD) | Império Móveis Planejados',
    description:
      'Como a Império Móveis Planejados trata os dados de quem visita o site e pede orçamento: o que coleta, para que usa e seus direitos pela LGPD.',
    canonical: `${EMPRESA.url}/privacidade`,
    ogImage: `${EMPRESA.url}/og-hero.jpg`,
    h1Inicial: 'Política de Privacidade',
    resumoHtmlInicial:
      'Como a Império Móveis Planejados trata os dados de quem visita o site e pede orçamento, conforme a Lei Geral de Proteção de Dados.',
  },
  '/termos': {
    rota: '/termos',
    title: 'Termos de Uso | Império Móveis Planejados',
    description:
      'Regras de uso do site da Império Móveis Planejados, de Jaú/SP: projeto 3D online, pedidos de orçamento, fotos e conteúdo, contato e suporte.',
    canonical: `${EMPRESA.url}/termos`,
    ogImage: `${EMPRESA.url}/og-hero.jpg`,
    h1Inicial: 'Termos de Uso',
    resumoHtmlInicial: 'Regras de uso do site da Império Móveis Planejados, do projeto 3D online e do pedido de orçamento.',
  },
  '/cozinhas-planejadas-jau': {
    rota: '/cozinhas-planejadas-jau',
    title: PAGINAS_AMBIENTES_LOCAIS['/cozinhas-planejadas-jau'].tituloSeo,
    description: PAGINAS_AMBIENTES_LOCAIS['/cozinhas-planejadas-jau'].descricaoSeo,
    canonical: `${EMPRESA.url}/cozinhas-planejadas-jau`,
    ogImage: `${EMPRESA.url}/obras/cozinha-gringa-4k.jpg`,
    h1Inicial: PAGINAS_AMBIENTES_LOCAIS['/cozinhas-planejadas-jau'].h1,
    resumoHtmlInicial:
      PAGINAS_AMBIENTES_LOCAIS['/cozinhas-planejadas-jau'].paragrafosReais.join(' '),
  },
  '/quartos-planejados-jau': {
    rota: '/quartos-planejados-jau',
    title: PAGINAS_AMBIENTES_LOCAIS['/quartos-planejados-jau'].tituloSeo,
    description: PAGINAS_AMBIENTES_LOCAIS['/quartos-planejados-jau'].descricaoSeo,
    canonical: `${EMPRESA.url}/quartos-planejados-jau`,
    ogImage: `${EMPRESA.url}/obras/quarto-infantil-casinha.jpg`,
    h1Inicial: PAGINAS_AMBIENTES_LOCAIS['/quartos-planejados-jau'].h1,
    resumoHtmlInicial:
      PAGINAS_AMBIENTES_LOCAIS['/quartos-planejados-jau'].paragrafosReais.join(' '),
  },
  '/closets-sob-medida-jau': {
    rota: '/closets-sob-medida-jau',
    title: PAGINAS_AMBIENTES_LOCAIS['/closets-sob-medida-jau'].tituloSeo,
    description: PAGINAS_AMBIENTES_LOCAIS['/closets-sob-medida-jau'].descricaoSeo,
    canonical: `${EMPRESA.url}/closets-sob-medida-jau`,
    ogImage: `${EMPRESA.url}/obras/dormitorio-led-2.jpg`,
    h1Inicial: PAGINAS_AMBIENTES_LOCAIS['/closets-sob-medida-jau'].h1,
    resumoHtmlInicial:
      PAGINAS_AMBIENTES_LOCAIS['/closets-sob-medida-jau'].paragrafosReais.join(' '),
  },
  '/home-office-planejado-jau': {
    rota: '/home-office-planejado-jau',
    title: PAGINAS_AMBIENTES_LOCAIS['/home-office-planejado-jau'].tituloSeo,
    description: PAGINAS_AMBIENTES_LOCAIS['/home-office-planejado-jau'].descricaoSeo,
    canonical: `${EMPRESA.url}/home-office-planejado-jau`,
    ogImage: `${EMPRESA.url}/obras/comercial-expositor.jpg`,
    h1Inicial: PAGINAS_AMBIENTES_LOCAIS['/home-office-planejado-jau'].h1,
    resumoHtmlInicial:
      PAGINAS_AMBIENTES_LOCAIS['/home-office-planejado-jau'].paragrafosReais.join(' '),
  },
};

const CATALOGO_OFERTAS_AMBIENTES = [
  {
    name: 'Cozinhas Planejadas Sob Medida em Jaú',
    description:
      'Cozinhas planejadas 100% MDF em Jaú com ilha central, torre quente para forno e micro-ondas, MDF naval (hidrófugo) nas áreas úmidas, perfis de LED embutidos e ferragens com amortecimento slow motion.',
    url: `${EMPRESA.url}/cozinhas-planejadas-jau`,
  },
  {
    name: 'Dormitórios, Guarda-Roupas e Closets Planejados',
    description:
      'Closets sob medida em L ou U, guarda-roupas até o teto com portas de correr ou giro, cabideiros iluminados em LED, sapateiras telescópicas, divisórias de veludo e quartos infantis sob medida em Jaú.',
    url: `${EMPRESA.url}/closets-sob-medida-jau`,
  },
  {
    name: 'Salas de Estar, Painéis Ripados de TV e Home Theater',
    description:
      'Painéis ripados em MDF Freijó ou Nogueira até o teto, racks suspensos com passagem oculta de cabos, cristaleiras com vidro reflecta e iluminação indireta em LED para salas em Jaú e região.',
    url: `${EMPRESA.url}/quartos-planejados-jau`,
  },
  {
    name: 'Móveis Planejados para Área Gourmet, Churrasqueira e Lavanderia',
    description:
      'Armários sob medida com proteção contra umidade e calor próximos à churrasqueira, balcões em MDF naval, adegas climatizadas e lavanderias planejadas funcionais em Jaú.',
    url: `${EMPRESA.url}/cozinhas-planejadas-jau`,
  },
  {
    name: 'Banheiros e Lavabos Planejados',
    description:
      'Gabinetes sob medida 100% MDF resistente à umidade para banheiros e lavabos, espelheiras com iluminação frontal ou indireta em LED e nichos organizadores sob medida.',
    url: `${EMPRESA.url}/quartos-planejados-jau`,
  },
  {
    name: 'Móveis Planejados Corporativos, Escritórios, Clínicas e Lojas em Jaú',
    description:
      'Recepções, estações de trabalho ergonômicas, salas de reunião, consultórios médicos e odontológicos, escritórios de advocacia e marcenaria comercial completa em Jaú e região.',
    url: `${EMPRESA.url}/home-office-planejado-jau`,
  },
];

/**
 * Entidade principal ["FurnitureStore", "HomeAndConstructionBusiness", "LocalBusiness"]
 * com E-E-A-T completo (Razão Social, CNPJ, endereço Jardim Itamarati, coordenadas e 12 cidades com Wikipedia).
 */
export function gerarEntidadeOrganizacaoSchema(): Record<string, unknown> {
  const sameAs: string[] = [EMPRESA.instagramUrl];
  if (EMPRESA.googleProfileUrl) {
    sameAs.push(EMPRESA.googleProfileUrl);
  }

  return {
    '@type': ['FurnitureStore', 'HomeAndConstructionBusiness', 'LocalBusiness'],
    '@id': `${EMPRESA.url}/#organization`,
    name: EMPRESA.nome,
    alternateName: ['Império Móveis Planejados Jaú', EMPRESA.nomeCurto],
    legalName: EMPRESA.razaoSocial,
    taxID: EMPRESA.cnpj,
    foundingDate: EMPRESA.dataAberturaCnpj,
    url: `${EMPRESA.url}/`,
    logo: `${EMPRESA.url}/logo-imperio.png`,
    telephone: EMPRESA.whatsappE164,
    email: EMPRESA.email,
    priceRange: '$$$',
    description: METADADOS_ROTAS_SEO['/'].description,
    founder: EMPRESA.fundadores.split(' e ').map((nome) => ({ '@type': 'Person', name: nome })),
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${EMPRESA.endereco.logradouro} - ${EMPRESA.endereco.bairro}`,
      addressLocality: EMPRESA.endereco.cidade,
      addressRegion: EMPRESA.endereco.uf,
      postalCode: EMPRESA.endereco.cep,
      addressCountry: EMPRESA.endereco.pais,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: EMPRESA.geo.latitude,
      longitude: EMPRESA.geo.longitude,
    },
    hasMap: EMPRESA.googleProfileUrl,
    areaServed: EMPRESA.cidadesSchema.map((c) => ({
      '@type': 'City',
      name: `${c.nome}, ${c.uf}`,
      sameAs: c.wikipedia,
    })),
    knowsAbout: [
      'Móveis Planejados',
      'Marcenaria Sob Medida',
      'Projeto 3D de Interiores',
      'Cozinhas Planejadas',
      'Closets e Dormitórios',
      'Móveis Corporativos',
      'Painéis Ripados em MDF',
      'Marcenaria 100% MDF em Jaú',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Catálogo de Móveis Planejados Sob Medida 100% MDF em Jaú e Região',
      itemListElement: CATALOGO_OFERTAS_AMBIENTES.map((item) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: item.name,
          description: item.description,
          url: item.url,
          provider: { '@id': `${EMPRESA.url}/#organization` },
        },
      })),
    },
    paymentAccepted: EMPRESA.sobre.pagamentos.join(', '),
    amenityFeature: EMPRESA.sobre.acessibilidade.map((nome) => ({
      '@type': 'LocationFeatureSpecification',
      name: nome,
      value: true,
    })),
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: EMPRESA.horarios.abre,
        closes: EMPRESA.horarios.fecha,
      },
    ],
    sameAs,
    image: [
      `${EMPRESA.url}/og-hero.jpg`,
      `${EMPRESA.url}/obras/cozinha-gringa-4k.jpg`,
      `${EMPRESA.url}/obras/quarto-infantil-casinha.jpg`,
    ],
  };
}

/**
 * Mantém compatibilidade com páginas internas que importam gerarJsonLdFurnitureStore.
 */
export function gerarJsonLdFurnitureStore(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    ...gerarEntidadeOrganizacaoSchema(),
  };
}

/**
 * Super-Grafo Schema.org (@graph) da Home com as 5 entidades interconectadas:
 * 1. ["FurnitureStore", "HomeAndConstructionBusiness", "LocalBusiness"] (#organization)
 * 2. VideoObject (#video-projeto-3d)
 * 3. WebSite (#website) & WebPage (#webpage)
 * 4. BreadcrumbList (#breadcrumb)
 * 5. FAQPage (#faq) com as 8 perguntas frequentes estratégicas
 */
export function gerarSuperGrafoJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      gerarEntidadeOrganizacaoSchema(),
      {
        '@type': 'VideoObject',
        '@id': `${EMPRESA.url}/#video-projeto-3d`,
        name: 'Apresentação de Projeto 3D de Móveis Planejados em Jaú - Império Móveis',
        description:
          'Apresentação em notebook do projeto 3D realista de cozinha planejada sob medida 100% MDF em Jaú SP, do desenho técnico à obra executada pela Império Móveis Planejados.',
        thumbnailUrl: [
          `${EMPRESA.url}/videos/notebook-poster.jpg`,
          `${EMPRESA.url}/og-hero.jpg`,
        ],
        uploadDate: '2026-01-15T08:00:00-03:00',
        contentUrl: `${EMPRESA.url}/videos/notebook-1080.mp4`,
        embedUrl: `${EMPRESA.url}/`,
        duration: 'PT10S',
        inLanguage: 'pt-BR',
        publisher: { '@id': `${EMPRESA.url}/#organization` },
      },
      {
        '@type': 'WebSite',
        '@id': `${EMPRESA.url}/#website`,
        url: `${EMPRESA.url}/`,
        name: EMPRESA.nome,
        alternateName: ['Império Móveis Planejados Jaú', EMPRESA.nomeCurto],
        inLanguage: 'pt-BR',
        publisher: { '@id': `${EMPRESA.url}/#organization` },
      },
      {
        '@type': 'WebPage',
        '@id': `${EMPRESA.url}/#webpage`,
        url: `${EMPRESA.url}/`,
        name: METADADOS_ROTAS_SEO['/'].title,
        description: METADADOS_ROTAS_SEO['/'].description,
        inLanguage: 'pt-BR',
        isPartOf: { '@id': `${EMPRESA.url}/#website` },
        about: { '@id': `${EMPRESA.url}/#organization` },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: `${EMPRESA.url}/og-hero.jpg`,
        },
        video: { '@id': `${EMPRESA.url}/#video-projeto-3d` },
        breadcrumb: { '@id': `${EMPRESA.url}/#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${EMPRESA.url}/#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Móveis Planejados em Jaú',
            item: `${EMPRESA.url}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Cozinhas Planejadas em Jaú',
            item: `${EMPRESA.url}/cozinhas-planejadas-jau`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Closets e Dormitórios Sob Medida em Jaú',
            item: `${EMPRESA.url}/closets-sob-medida-jau`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: 'Projetar Móveis em 3D Online',
            item: `${EMPRESA.url}/projetar`,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${EMPRESA.url}/#faq`,
        mainEntity: perguntasConfirmadas().map((p) => ({
          '@type': 'Question',
          name: p.pergunta,
          acceptedAnswer: {
            '@type': 'Answer',
            text: p.resposta,
          },
        })),
      },
    ],
  };
}
