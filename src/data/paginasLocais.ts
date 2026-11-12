import { EMPRESA } from './empresa';
import { Ambiente } from './cenarios';

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

// A confirmar com os donos antes de voltar ao texto público (estava como [CONFIRMAR] no site):
// pedra padrão das cozinhas e marca das dobradiças/corrediças; especificação de bordas e
// acabamento atóxico nos quartos infantis; portas em vidro refletente e perfil metálico nos closets.
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
  chamada: 'Móveis planejados em Jaú/SP',
  titulo: 'Arquitetura e marcenaria na mesma mesa.',
  texto:
    'Nossa arquiteta projeta, nossa equipe fabrica e monta. Projeto de arquitetura incluso e móveis planejados para cozinhas, quartos, closets e lojas em Jaú e região, desde 2015.',
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
      'Móveis planejados em Jaú/SP com projeto de arquitetura incluso e fabricação própria. Cozinhas, quartos e closets. Projete em 3D e peça orçamento.',
    canonical: `${EMPRESA.url}/`,
    ogImage: `${EMPRESA.url}/og-hero.jpg`,
    h1Inicial: TEXTO_HERO.titulo,
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
    // Coordenadas do arquivo são aproximadas: o ponto exato fica com a ficha do Google (hasMap).
    if (EMPRESA.googleProfileUrl) schema.hasMap = EMPRESA.googleProfileUrl;
  }

  // Aba "Sobre" do Perfil da Empresa no Google.
  schema.paymentAccepted = EMPRESA.sobre.pagamentos.join(', ');
  schema.amenityFeature = EMPRESA.sobre.acessibilidade.map((nome) => ({
    '@type': 'LocationFeatureSpecification',
    name: nome,
    value: true,
  }));
  schema.makesOffer = ['Projeto e fabricação de móveis planejados', ...EMPRESA.sobre.servicos.map((s) => `${s} de móveis`)].map(
    (nome) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: nome } })
  );

  if (EMPRESA.confirmado.horarios) {
    // Mesmo horário do Perfil da Empresa no Google; sem sábado.
    schema.openingHoursSpecification = [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: EMPRESA.horarios.abre,
        closes: EMPRESA.horarios.fecha,
      },
    ];
  }

  return schema;
}
