export interface DadosEmpresa {
  nome: string;
  nomeCurto: string;
  subtitulo: string;
  fraseCurta: string;
  fundadores: string;
  anoInicio: number;
  url: string;
  telefone: string;
  whatsapp: string;
  whatsappE164: string;
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
    sabado: string;
    resumo: string;
    observacao: string;
  };
  cidadesAtendidas: string[];
  confirmado: {
    endereco: boolean;
    horarios: boolean;
    garantia: boolean;
  };
}

/**
 * Fonte única da verdade para dados institucionais, cabeçalho, rodapé,
 * localização, páginas de contato e dados estruturados (JSON-LD).
 */
export const EMPRESA: DadosEmpresa = {
  nome: 'Império Móveis Planejados',
  nomeCurto: 'IMPÉRIO',
  subtitulo: 'Móveis Planejados',
  fraseCurta: 'Marcenaria e arquitetura de interiores em Jaú e região.',
  fundadores: 'Wellington Cabral e Tatiane Cabral',
  anoInicio: 2015,
  url: 'https://www.imperiomoveisplanejadosjau.com.br',
  telefone: '(14) 99849-2834',
  whatsapp: '5514998492834',
  whatsappE164: '+5514998492834',
  instagram: '@imperio.moveis.jau',
  instagramUrl: 'https://www.instagram.com/imperio.moveis.jau/',
  // Perfil da Empresa no Google (identificador da ficha no Maps).
  googleProfileUrl: 'https://maps.google.com/?cid=17403143123799287393',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=R.+Don%C3%A1+Djanira+Werneck+de+Almeida+e+Silva,+280+-+Jardim+Itamarati,+Ja%C3%BA+-+SP,+17209-450',
  mapsEmbedUrl:
    'https://maps.google.com/maps?q=R.+Don%C3%A1+Djanira+Werneck+de+Almeida+e+Silva%2C+280+-+Jardim+Itamarati%2C+Ja%C3%BA+-+SP%2C+17209-450&t=&z=16&ie=UTF8&iwloc=&output=embed',
  // Igual ao Perfil da Empresa no Google (nome, endereço e telefone iguais em todo lugar ajudam o SEO local).
  endereco: {
    rua: 'R. Doná Djanira Werneck de Almeida e Silva',
    numero: '280',
    logradouro: 'R. Doná Djanira Werneck de Almeida e Silva, 280',
    bairro: 'Jardim Itamarati',
    cidade: 'Jaú',
    uf: 'SP',
    cep: '17209-450',
    pais: 'BR',
  },
  geo: {
    latitude: -22.2936,
    longitude: -48.5592,
  },
  // CONFIRMAR COM A LOJA (horários vindos do protótipo original)
  horarios: {
    semana: 'Seg a Sex: 8h às 18h',
    sabado: 'Sáb: 8h às 12h',
    resumo: 'Segunda a sexta, 8h às 18h; sábado, 8h às 12h',
    observacao: 'Atendimento e showroom sob agendamento',
  },
  // Cidades atendidas por Jaú e região central paulista (Step E)
  cidadesAtendidas: [
    'Jaú',
    'Barra Bonita',
    'Dois Córregos',
    'Pederneiras',
    'Bocaina',
    'Mineiros do Tietê',
    'Bariri',
    'Itapuí',
  ],
  confirmado: {
    endereco: true,
    horarios: false,
    garantia: false,
  },
};
