export interface CidadeAtendida {
  nome: string;
  uf: string;
  sameAs: string;
  wikipedia: string;
}

export interface DadosEmpresa {
  nome: string;
  nomeFantasia: string;
  nomeCurto: string;
  razaoSocial: string;
  cnpj: string;
  dataAberturaCnpj: string;
  subtitulo: string;
  fraseCurta: string;
  fundadores: string;
  anoInicio: number;
  url: string;
  telefone: string;
  whatsapp: string;
  whatsappE164: string;
  email?: string;
  instagram: string;
  instagramUrl: string;
  googleProfileUrl?: string;
  mapsUrl: string;
  mapsEmbedUrl: string;
  endereco: {
    rua: string;
    numero: string;
    logradouro: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    pais: string;
  };
  geo: {
    latitude: number;
    longitude: number;
  };
  horarios: {
    semana: string;
    /** Vazio quando não abre no sábado. */
    sabado: string;
    resumo: string;
    observacao: string;
    /** Para o JSON-LD (openingHoursSpecification), no formato HH:MM. */
    abre: string;
    fecha: string;
  };
  cidadesAtendidas: string[];
  cidadesSchema: CidadeAtendida[];
  bairrosCondominiosJau: string[];
  /** Seção "Sobre" do Perfil da Empresa no Google. */
  sobre: {
    acessibilidade: string[];
    servicos: string[];
    atendimento: string[];
    pagamentos: string[];
  };
  confirmado: {
    endereco: boolean;
    horarios: boolean;
    garantia: boolean;
  };
}

export const DOMINIO_CANONICO = 'https://www.imperiomoveisplanejadosjau.com.br' as const;

/**
 * Fonte única da verdade para dados institucionais, E-E-A-T, cabeçalho, rodapé,
 * localização, páginas de contato e Super-Grafo de dados estruturados (JSON-LD).
 */
export const EMPRESA: DadosEmpresa = {
  nome: 'Império Móveis Planejados',
  nomeFantasia: 'Império Móveis Planejados Jaú',
  nomeCurto: 'IMPÉRIO',
  razaoSocial: 'Wellington Ribeiro Cabral',
  cnpj: '48.945.152/0001-93',
  dataAberturaCnpj: '2022-12-21',
  subtitulo: 'Móveis Planejados e Marcenaria',
  fraseCurta:
    'Fábrica própria de móveis planejados 100% MDF e marcenaria sob medida em Jaú/SP com maquinário próprio, apresentação de projeto 3D e atendimento mediante visita técnica agendada.',
  fundadores: 'Wellington Ribeiro Cabral e Tatiane Cabral',
  anoInicio: 2015,
  url: DOMINIO_CANONICO,
  telefone: '(14) 99849-2834',
  whatsapp: '5514998492834',
  whatsappE164: '+5514998492834',
  instagram: '@imperio.moveis.jau',
  instagramUrl: 'https://www.instagram.com/imperio.moveis.jau/',
  // Perfil da Empresa no Google (identificador da ficha no Maps).
  googleProfileUrl: 'https://maps.google.com/?cid=17403143123799287393',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Rua+Dona+Djanira+Werneck+de+Almeida+e+Silva,+280+-+Jardim+Itamarati,+Ja%C3%BA+-+SP,+17209-450',
  mapsEmbedUrl:
    'https://maps.google.com/maps?q=Rua+Dona+Djanira+Werneck+de+Almeida+e+Silva%2C+280+-+Jardim+Itamarati%2C+Ja%C3%BA+-+SP%2C+17209-450&t=&z=16&ie=UTF8&iwloc=&output=embed',
  endereco: {
    rua: 'Rua Dona Djanira Werneck de Almeida e Silva',
    numero: '280',
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
  horarios: {
    semana: 'Segunda a Sexta das 08h às 18h',
    sabado: 'Sábados sob agendamento',
    resumo: 'Segunda a Sexta das 08h às 18h | Sábados sob agendamento',
    observacao: 'Atendimento mediante visita técnica e agendamento',
    abre: '08:00',
    fecha: '18:00',
  },
  cidadesAtendidas: [
    'Jaú',
    'Barra Bonita',
    'Igaraçu do Tietê',
    'Dois Córregos',
    'Mineiros do Tietê',
    'Bocaina',
    'Bariri',
    'Pederneiras',
    'Itapuí',
    'Brotas',
    'Bauru',
    'Macatuba',
  ],
  cidadesSchema: [
    { nome: 'Jaú', uf: 'SP', sameAs: 'https://pt.wikipedia.org/wiki/Ja%C3%BA', wikipedia: 'https://pt.wikipedia.org/wiki/Ja%C3%BA' },
    { nome: 'Barra Bonita', uf: 'SP', sameAs: 'https://pt.wikipedia.org/wiki/Barra_Bonita_(S%C3%A3o_Paulo)', wikipedia: 'https://pt.wikipedia.org/wiki/Barra_Bonita_(S%C3%A3o_Paulo)' },
    { nome: 'Igaraçu do Tietê', uf: 'SP', sameAs: 'https://pt.wikipedia.org/wiki/Igara%C3%A7u_do_Tiet%C3%AA', wikipedia: 'https://pt.wikipedia.org/wiki/Igara%C3%A7u_do_Tiet%C3%AA' },
    { nome: 'Dois Córregos', uf: 'SP', sameAs: 'https://pt.wikipedia.org/wiki/Dois_C%C3%B3rregos', wikipedia: 'https://pt.wikipedia.org/wiki/Dois_C%C3%B3rregos' },
    { nome: 'Mineiros do Tietê', uf: 'SP', sameAs: 'https://pt.wikipedia.org/wiki/Mineiros_do_Tiet%C3%AA', wikipedia: 'https://pt.wikipedia.org/wiki/Mineiros_do_Tiet%C3%AA' },
    { nome: 'Bocaina', uf: 'SP', sameAs: 'https://pt.wikipedia.org/wiki/Bocaina_(S%C3%A3o_Paulo)', wikipedia: 'https://pt.wikipedia.org/wiki/Bocaina_(S%C3%A3o_Paulo)' },
    { nome: 'Bariri', uf: 'SP', sameAs: 'https://pt.wikipedia.org/wiki/Bariri', wikipedia: 'https://pt.wikipedia.org/wiki/Bariri' },
    { nome: 'Pederneiras', uf: 'SP', sameAs: 'https://pt.wikipedia.org/wiki/Pederneiras', wikipedia: 'https://pt.wikipedia.org/wiki/Pederneiras' },
    { nome: 'Itapuí', uf: 'SP', sameAs: 'https://pt.wikipedia.org/wiki/Itapu%C3%AD', wikipedia: 'https://pt.wikipedia.org/wiki/Itapu%C3%AD' },
    { nome: 'Brotas', uf: 'SP', sameAs: 'https://pt.wikipedia.org/wiki/Brotas_(S%C3%A3o_Paulo)', wikipedia: 'https://pt.wikipedia.org/wiki/Brotas_(S%C3%A3o_Paulo)' },
    { nome: 'Bauru', uf: 'SP', sameAs: 'https://pt.wikipedia.org/wiki/Bauru', wikipedia: 'https://pt.wikipedia.org/wiki/Bauru' },
    { nome: 'Macatuba', uf: 'SP', sameAs: 'https://pt.wikipedia.org/wiki/Macatuba', wikipedia: 'https://pt.wikipedia.org/wiki/Macatuba' },
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
    'Condomínio Flamboyant',
    'Condomínio Taiúva',
    'Chácara Itaúna',
    'Jardim Europa',
    'Jardim Estoril',
    'Vila Nova',
    'Jardim Parati',
    'Parque Residencial Primavera',
    'Condomínios Fechados de Jaú',
  ],
  sobre: {
    acessibilidade: ['Entrada acessível para cadeira de rodas', 'Estacionamento acessível para cadeira de rodas'],
    servicos: ['Fábrica com maquinário próprio', 'Montagem própria', 'Apresentação de Projeto 3D', 'Visita técnica e medição agendada'],
    atendimento: ['Mediante visita técnica e agendamento', 'Prazo de entrega estipulado em contrato'],
    pagamentos: ['PIX', 'Cartão de crédito parcelado', 'Condições combinadas em contrato'],
  },
  confirmado: {
    endereco: true,
    horarios: true,
    garantia: true,
  },
};
