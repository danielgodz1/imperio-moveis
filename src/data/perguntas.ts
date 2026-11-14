import { EMPRESA } from './empresa';

export interface PerguntaFrequente {
  pergunta: string;
  resposta: string;
  /** Só entram no site (e no FAQPage do Google) as respostas confirmadas pelos donos. */
  confirmado: boolean;
}

/** 8 perguntas frequentes estratégicas para SEO Local em Jaú e Região (também viram dados estruturados FAQPage no Schema @graph). */
export const PERGUNTAS_FREQUENTES: PerguntaFrequente[] = [
  {
    pergunta: 'Qual o valor de móveis planejados em Jaú e quais as formas de pagamento?',
    resposta:
      'O investimento varia conforme a metragem do ambiente, os padrões de MDF 100% selecionados (15mm, 18mm ou 25mm), acabamentos em ripado, iluminação em LED e ferragens. Na Império Móveis Planejados em Jaú, você negocia direto com a fábrica sem intermediários de franquia, com pagamento facilitado via PIX, transferência bancária, cartões de crédito ou parcelamento direto em contrato.',
    confirmado: true,
  },
  {
    pergunta: 'Qual a diferença entre a marcenaria sob medida 100% MDF da Império e móveis modulados de loja?',
    resposta:
      'Enquanto móveis modulados usam caixas prontas padronizadas com preenchimentos largos, nossa fábrica própria em Jaú produz marcenaria 100% MDF sob medida milimétrica para cada parede, viga e pé-direito do seu imóvel. Utilizamos chapas estruturais de 15mm, 18mm e 25mm, MDF naval (hidrófugo) resistente à umidade e projeto de interiores assinado pela nossa arquiteta.',
    confirmado: true,
  },
  {
    pergunta: 'Como funciona a apresentação do Projeto 3D realista no notebook e ela tem custo?',
    resposta:
      'Antes do primeiro corte na fábrica, apresentamos seu ambiente completo em Projeto 3D realista no notebook — permitindo visualizar paginação dos veios do MDF, iluminação em perfil de LED quente, divisórias internas e abertura de portas e gavetas. Além disso, o projeto de arquitetura de interiores já está incluso na contratação dos móveis planejados, e você também pode testar combinações grátis no configurador 3D do site.',
    confirmado: true,
  },
  {
    pergunta: 'Qual a garantia dos móveis planejados e qual MDF vocês utilizam em áreas úmidas?',
    resposta:
      'Oferecemos garantia de fábrica com assistência técnica rápida por equipe própria em Jaú e região. Trabalhamos exclusivamente com chapas 100% MDF de alta densidade (15mm, 18mm e tampos/painéis de 25mm) com fitamento de borda em PVC colado a quente, aplicando MDF naval (hidrófugo verde) em gabinetes inferiores de cozinha, área gourmet, lavanderia e banheiros.',
    confirmado: true,
  },
  {
    pergunta: 'Quais ferragens são utilizadas nas gavetas e portas dos armários planejados?',
    resposta:
      'Todos os projetos recebem ferragens de alta durabilidade com fechamento suave (sistema slow motion / amortecedor integrado): dobradiças reforçadas com pistão amortecedor, corrediças telescópicas de extração total ou corrediças ocultas invisíveis sob a gaveta, além de articuladores basculantes a gás e perfis puxadores em alumínio anodizado.',
    confirmado: true,
  },
  {
    pergunta: 'Quais bairros e condomínios de Jaú e quais cidades da região a Império atende?',
    resposta: `Em Jaú/SP atendemos todos os bairros e condomínios fechados — incluindo ${EMPRESA.bairrosCondominiosJau.join(', ')} — além de medição a laser, entrega própria e montagem especializada em ${EMPRESA.cidadesAtendidas.map((c) => c.replace(/,\s*SP$/, '')).join(', ')}.`,
    confirmado: true,
  },
  {
    pergunta: 'Qual é o prazo de fabricação e montagem e como funciona o contrato?',
    resposta:
      'Trabalhamos com cronograma fechado em contrato assinado (CNPJ 48.945.152/0001-93). Após a medição fina a laser na obra e aprovação final do projeto executivo 3D, a fabricação é feita na nossa marcenaria no Jardim Itamarati em Jaú e a instalação é executada pela nossa equipe própria de montadores, com alinhamento de portas, limpeza técnica e entrega no prazo combinado.',
    confirmado: true,
  },
  {
    pergunta: 'Vocês executam projetos de arquitetos e atendem escritórios, clínicas e lojas em Jaú?',
    resposta:
      'Sim. Somos parceiros técnicos de arquitetos, engenheiros e designers de interiores em Jaú e região, garantindo fidelidade milimétrica ao caderno executivo, detalhamento de marcenaria fina, painéis ripados e serralheria integrada. Também projetamos e fabricamos móveis planejados corporativos para consultórios médicos, clínicas odontológicas, escritórios de advocacia e lojas comerciais.',
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
