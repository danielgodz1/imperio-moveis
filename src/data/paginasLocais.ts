import { EMPRESA } from './empresa';
import { Ambiente } from './cenarios';

export type RotaPublica =
  | '/'
  | '/contato'
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

export const PAGINAS_AMBIENTES_LOCAIS: Record<
  PaginaAmbienteConfig['rota'],
  PaginaAmbienteConfig
> = {
  '/cozinhas-planejadas-jau': {
    rota: '/cozinhas-planejadas-jau',
    tituloSeo:
      'Cozinhas Planejadas em Jaú/SP — Ilha em Ripado, Granito e LED | Império Móveis',
    descricaoSeo:
      'Cozinhas sob medida em Jaú e região projetadas pela arquiteta Tatiane Cabral e fabricadas pelo marceneiro Wellington Cabral. Ilha em ripado, granito preto e armários até o teto.',
    h1: 'Cozinhas planejadas em Jaú com projeto de arquitetura e fabricação própria',
    subtitulo:
      'Desenhamos o fluxo entre pia, fogão, torre quente e ilha antes do primeiro corte de chapa na oficina.',
    ambienteBriefing: 'Cozinha',
    ambiente3D: 'cozinha',
    paragrafosReais: [
      'Nas cozinhas executadas pela Império em Jaú, a arquiteta Tatiane Cabral parte da rotina real da família: altura da bancada, posição dos pontos hidráulicos e elétricos, espaço de circulação em torno da ilha e aproveitamento até o teto ou forro amadeirado.',
      'Na oficina, o Wellington Cabral executa o mobiliário com corpo da ilha em ripado de madeira, encontro limpo com a bancada de granito preto (São Gabriel ou conforme especificação da obra [CONFIRMAR pedra padrão]), fita de LED quente embutida em perfil de alumínio sob os aéreos e ferragens de fechamento suave [CONFIRMAR marca das dobradiças e corrediças].',
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
        alt: 'Cozinha planejada em Jaú com ilha em verde-sálvia, armários superiores até o teto e iluminação em LED quente',
        legenda:
          'Cozinha planejada com ilha central em verde-sálvia, cristaleira iluminada e marcenaria até o teto.',
      },
      {
        srcBase: '/obras/cozinha-ilha-ripado',
        razao: '941 / 1136',
        alt: 'Cozinha planejada em Jaú com ilha em ripado de madeira, tampo em granito preto e fita de LED sob os aéreos',
        legenda:
          'Ilha em ripado de madeira com tampo e lateral em granito preto e fita de LED sob os aéreos.',
      },
      {
        srcBase: '/obras/cozinha-forro-ripado',
        razao: '408 / 641',
        alt: 'Cozinha sob medida em Jaú integrada ao forro ripado de madeira com torre quente para forno e micro-ondas',
        legenda:
          'Integração entre marcenaria sob medida, torre quente e forro ripado em madeira.',
      },
    ],
  },

  '/quartos-planejados-jau': {
    rota: '/quartos-planejados-jau',
    tituloSeo:
      'Quartos Planejados e Infantis em Jaú/SP — Casinha, LED e Marcenaria | Império',
    descricaoSeo:
      'Quartos de casal, solteiro, infantil e de bebê sob medida em Jaú/SP. Cabeceira ripada com LED, cama-casinha com escorregador e guarda-roupas até o teto.',
    h1: 'Quartos planejados de casal, solteiro e infantis em Jaú',
    subtitulo:
      'Do dormitório com cabeceira ripada e LED indireto ao quarto infantil em formato de casinha feito sob medida.',
    ambienteBriefing: 'Quarto',
    ambiente3D: 'quarto',
    paragrafosReais: [
      'Cada dormitório pede uma ergonomia diferente. Nos quartos de casal e solteiro que entregamos em Jaú, combinamos guarda-roupas até o teto com painéis ripados de madeira, nichos iluminados por fita de LED embutida e bancada de estudo ou penteadeira integrada.',
      'Nos projetos infantis e de bebê, a Tatiane desenha ambientes lúdicos e seguros: já executamos cama alta em formato de casinha com escorregador, escada lateral em que cada degrau funciona como gaveta, painel estofado em gomos e nichos redondos iluminados em tons pastel e verde-sálvia.',
      'Toda a estrutura de escadas, guarda-corpo e camas altas é dimensionada na marcenaria pelo Wellington para suportar o uso diário com quinas suavizadas e acabamento atóxico [CONFIRMAR especificação de bordas infantis].',
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
        alt: 'Quarto infantil planejado em Jaú com cama-casinha superior, escorregador e escada com gavetas',
        legenda:
          'Quarto infantil com cama-casinha, escorregador, escada com gavetas e painel estofado.',
      },
      {
        srcBase: '/obras/quarto-bebe-nichos',
        razao: '1213 / 864',
        alt: 'Quarto de bebê planejado em Jaú com marcenaria verde-sálvia, painel ripado e nichos redondos iluminados',
        legenda:
          'Quarto de bebê em verde-sálvia e madeira clara com nichos redondos iluminados em LED.',
      },
      {
        srcBase: '/obras/dormitorio-led-1',
        razao: '51 / 82',
        alt: 'Dormitório planejado em Jaú com painel ripado de madeira, prateleira iluminada em LED e bancada integrada',
        legenda:
          'Dormitório com painel ripado até o teto, iluminação linear em LED e bancada sob medida.',
      },
    ],
  },

  '/closets-sob-medida-jau': {
    rota: '/closets-sob-medida-jau',
    tituloSeo:
      'Closets sob Medida e Guarda-Roupas em Jaú/SP — Ele & Ela com LED | Império',
    descricaoSeo:
      'Closets planejados em L, em U ou integrados ao quarto em Jaú e região. Cabideiros iluminados em LED, sapateiras deslizantes, ilha de acessórios e espelho.',
    h1: 'Closets sob medida e guarda-roupas planejados em Jaú',
    subtitulo:
      'Divisão interna desenhada para o seu acervo real de roupas longas, calçados, malas e acessórios.',
    ambienteBriefing: 'Closet',
    ambiente3D: 'closet',
    paragrafosReais: [
      'Um closet sob medida não é uma sequência de prateleiras iguais: a Tatiane levanta a quantidade de vestidos longos, camisas, ternos, calçados e malas do casal para definir a altura exata de cada cabideiro, colmeia de gaveta e maleiro superior.',
      'Executamos armários em L ou corredor com iluminação vertical em LED nos montantes, sapateiras corrediças de extração total e penteadeira ou ilha central com tampo organizador [CONFIRMAR opções de portas em vidro refletente e perfil metálico].',
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
        alt: 'Armário e marcenaria de dormitório em Jaú com nichos iluminados em LED e acabamento amadeirado',
        legenda:
          'Marcenaria de dormitório e armários sob medida com iluminação embutida em LED.',
      },
      {
        srcBase: '/obras/dormitorio-led-1',
        razao: '51 / 82',
        alt: 'Ambiente íntimo planejado em Jaú com marcenaria até o teto, ripado e bancada de apoio',
        legenda:
          'Aproveitamento vertical até o teto com painéis ripados e nichos iluminados.',
      },
    ],
  },

  '/home-office-planejado-jau': {
    rota: '/home-office-planejado-jau',
    tituloSeo:
      'Home Office e Marcenaria Comercial em Jaú/SP — Escritórios e Lojas | Império',
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
      'A formação da Tatiane em arquitetura e logística, somada à experiência de campo do Wellington, garante entregas pontuais inclusive em obras complexas com içamento por caminhão-guindaste.',
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
        alt: 'Estante e expositor sob medida em madeira e estrutura metálica com LED executado pela Império em Jaú',
        legenda:
          'Expositor e estante sob medida em madeira, estrutura metálica preta e iluminação em LED em cada nível.',
      },
      {
        srcBase: '/obras/comercial-gocoffee-interior',
        razao: '24 / 43',
        alt: 'Interior comercial GoCoffee em Jaú com balcão curvo em ripado de madeira e nichos iluminados',
        legenda:
          'Interior comercial GoCoffee: balcão curvo em ripado de madeira e nichos iluminados.',
      },
      {
        srcBase: '/obras/entrega-guindaste',
        razao: '106 / 158',
        alt: 'Caminhão-guindaste realizando içamento de marcenaria da Império Móveis em Jaú',
        legenda:
          'Logística de entrega com içamento por guindaste coordenada pela Império em Jaú.',
      },
    ],
  },
};

export const METADADOS_ROTAS_SEO: Record<RotaPublica, MetaRotaSeo> = {
  '/': {
    rota: '/',
    title: 'Móveis Planejados em Jaú/SP | Império Móveis Planejados',
    description:
      'Móveis planejados em Jaú e região com projeto de arquitetura e fabricação própria: cozinhas, quartos, closets e home office sob medida. Peça seu orçamento pelo WhatsApp.',
    canonical: `${EMPRESA.url}/`,
    ogImage: `${EMPRESA.url}/og-hero.jpg`,
    h1Inicial: 'Arquitetura e marcenaria na mesma mesa.',
    resumoHtmlInicial:
      'Móveis planejados em Jaú e região. A Tatiane projeta, o Wellington fabrica: cozinhas, quartos, closets e lojas desde 2015.',
  },
  '/contato': {
    rota: '/contato',
    title: 'Pedir Orçamento de Móveis Planejados em Jaú/SP | Império Móveis',
    description:
      'Envie as medidas do seu ambiente ou chame o Wellington e a Tatiane Cabral no WhatsApp (14) 99849-2834. Orçamento rápido para cozinhas, quartos, closets e lojas em Jaú.',
    canonical: `${EMPRESA.url}/contato`,
    ogImage: `${EMPRESA.url}/og-hero.jpg`,
    h1Inicial: 'Enviar medidas ou pedir orçamento em Jaú',
    resumoHtmlInicial:
      'Responda os 3 passos rápidos de orçamento e fale direto com o Wellington e a Tatiane Cabral pelo WhatsApp (14) 99849-2834.',
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

/**
 * Gera o JSON-LD FurnitureStore a partir de EMPRESA.
 * SÓ inclui address, geo e openingHoursSpecification se confirmado.endereco / confirmado.horarios forem true.
 */
export function gerarJsonLdFurnitureStore(): Record<string, unknown> {
  const sameAs: string[] = [EMPRESA.instagramUrl];
  if (EMPRESA.googleProfileUrl) {
    sameAs.push(EMPRESA.googleProfileUrl);
  }

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    '@id': `${EMPRESA.url}/#empresa`,
    name: EMPRESA.nome,
    alternateName: 'Império Móveis Planejados Jaú',
    logo: `${EMPRESA.url}/logo-imperio.png`,
    founder: EMPRESA.fundadores.split(' e ').map((nome) => ({ '@type': 'Person', name: nome })),
    knowsAbout: ['Móveis planejados', 'Cozinhas planejadas', 'Quartos planejados', 'Closets sob medida', 'Marcenaria', 'Arquitetura de interiores'],
    description: EMPRESA.fraseCurta,
    url: EMPRESA.url,
    telephone: EMPRESA.whatsappE164,
    foundingDate: String(EMPRESA.anoInicio),
    areaServed: EMPRESA.cidadesAtendidas.map((cidade) => ({
      '@type': 'City',
      name: `${cidade}, SP`,
    })),
    sameAs,
    image: [
      `${EMPRESA.url}/og-hero.jpg`,
      `${EMPRESA.url}/obras/cozinha-gringa-4k.jpg`,
      `${EMPRESA.url}/obras/quarto-infantil-casinha.jpg`,
    ],
  };

  if (EMPRESA.confirmado.endereco) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: EMPRESA.endereco.logradouro,
      addressLocality: EMPRESA.endereco.cidade,
      addressRegion: EMPRESA.endereco.uf,
      postalCode: EMPRESA.endereco.cep,
      addressCountry: EMPRESA.endereco.pais,
    };
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: EMPRESA.geo.latitude,
      longitude: EMPRESA.geo.longitude,
    };
  }

  if (EMPRESA.confirmado.horarios) {
    schema.openingHoursSpecification = [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '08:00',
        closes: '12:00',
      },
    ];
  }

  return schema;
}
