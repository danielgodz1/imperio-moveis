import { EMPRESA } from './empresa';

export interface PerguntaFrequente {
  pergunta: string;
  resposta: string;
  /** Só entram no site (e no FAQPage do Google) as respostas confirmadas pelos donos. */
  confirmado: boolean;
}

/** Perguntas frequentes estratégicas para SEO Local em Jaú e Região (também viram dados estruturados FAQPage no Schema @graph). */
export const PERGUNTAS_FREQUENTES: PerguntaFrequente[] = [
  {
    pergunta: 'Qual é o endereço e o CNPJ oficial da Império Móveis Planejados em Jaú?',
    resposta:
      'A Império Móveis Planejados (Razão Social: Wellington Ribeiro Cabral, CNPJ 48.945.152/0001-93) possui fábrica e sede única na Rua Dona Djanira Werneck de Almeida e Silva, 280, Jardim Itamarati, em Jaú/SP, atuando de forma independente e sem vínculo societário, filiais ou franquias com empresas de nome similar em outras regiões.',
    confirmado: true,
  },
  {
    pergunta: 'Qual o valor de móveis planejados em Jaú e quais as formas de pagamento?',
    resposta:
      'O investimento varia conforme a metragem do ambiente, as chapas 100% MDF selecionadas (15mm, 18mm ou 25mm), acabamentos em ripado, iluminação em LED e ferragens. Na Império Móveis Planejados em Jaú, você negocia direto com a fábrica com orçamento e apresentação de projeto 3D, pagamento via PIX, cartão de crédito parcelado e condições combinadas em contrato.',
    confirmado: true,
  },
  {
    pergunta: 'Qual a diferença entre a marcenaria sob medida 100% MDF da Império e móveis modulados de loja?',
    resposta:
      'Enquanto móveis modulados usam caixas prontas padronizadas com preenchimentos largos, nossa fábrica própria com maquinário próprio em Jaú produz marcenaria 100% MDF sob medida milimétrica para cada parede, viga e pé-direito do seu imóvel. Utilizamos chapas estruturais de 15mm, 18mm e 25mm, MDF resistente à umidade (Naval/Hidrófugo) para áreas molhadas e projeto de interiores assinado pela nossa arquiteta.',
    confirmado: true,
  },
  {
    pergunta: 'Como funciona a apresentação do Projeto 3D realista no notebook e o agendamento de visita técnica?',
    resposta:
      'O atendimento é realizado mediante visita técnica e agendamento. Antes do primeiro corte na fábrica, apresentamos seu ambiente completo em Projeto 3D realista no notebook — permitindo visualizar paginação dos veios do MDF, iluminação em perfil de LED quente, divisórias internas e abertura de portas e gavetas.',
    confirmado: true,
  },
  {
    pergunta: 'Qual a garantia dos móveis planejados e qual MDF vocês utilizam em áreas úmidas?',
    resposta:
      'Oferecemos garantia em contrato com assistência técnica por equipe própria em Jaú e região. Trabalhamos exclusivamente com chapas 100% MDF de alta densidade (15mm, 18mm e 25mm) com fitamento de borda em PVC de alta resistência, aplicando MDF resistente à umidade (Naval/Hidrófugo) em gabinetes inferiores de cozinha, área gourmet, lavanderia e banheiros.',
    confirmado: true,
  },
  {
    pergunta: 'Quais ferragens são utilizadas nas gavetas e portas dos armários planejados?',
    resposta:
      'Todos os projetos recebem ferragens com amortecimento: dobradiças slow motion e corrediças telescópicas ou ocultas, além de articuladores basculantes e perfis puxadores em alumínio.',
    confirmado: true,
  },
  {
    pergunta: 'Quais bairros e condomínios de Jaú e quais cidades da região a Império atende?',
    resposta: `Em Jaú/SP atendemos todos os bairros e condomínios fechados — incluindo ${EMPRESA.bairrosCondominiosJau.join(', ')} — além de visita técnica agendada, entrega própria e montagem própria em ${EMPRESA.cidadesAtendidas.map((c) => c.replace(/,\s*SP$/, '')).join(', ')}.`,
    confirmado: true,
  },
  {
    pergunta: 'Qual é o prazo de fabricação e montagem e como funciona o contrato?',
    resposta:
      'Trabalhamos com prazo de entrega estipulado em contrato (CNPJ 48.945.152/0001-93). Após a visita técnica de medição na obra e aprovação final do projeto 3D, a fabricação é feita com maquinário próprio na nossa fábrica no Jardim Itamarati em Jaú e a montagem própria é executada pela nossa equipe.',
    confirmado: true,
  },
  {
    pergunta: 'Vocês executam projetos de arquitetos e atendem escritórios, clínicas e lojas em Jaú?',
    resposta:
      'Sim. Somos parceiros técnicos de arquitetos, engenheiros e designers de interiores em Jaú e região, garantindo fidelidade técnica ao caderno executivo, detalhamento de marcenaria sob medida, painéis ripados e móveis planejados corporativos para consultórios, escritórios e lojas comerciais.',
    confirmado: true,
  },
];

export const perguntasConfirmadas = () => PERGUNTAS_FREQUENTES.filter((p) => p.confirmado);

export function gerarJsonLdPerguntas() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: perguntasConfirmadas().map((p) => ({
      '@type': 'Question',
      name: p.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: p.resposta },
    })),
  };
}
