import { EMPRESA } from './empresa';

export interface PerguntaFrequente {
  pergunta: string;
  resposta: string;
  /** Só entram no site (e no FAQPage do Google) as respostas confirmadas pelos donos. */
  confirmado: boolean;
}

/** Perguntas curtas do fechamento da home. Também viram dados estruturados FAQPage. */
export const PERGUNTAS_FREQUENTES: PerguntaFrequente[] = [
  {
    pergunta: 'Vocês fazem só os móveis ou o projeto completo?',
    resposta: 'O completo. Nossa arquiteta assina os interiores e nossa equipe fabrica e instala a marcenaria.',
    confirmado: true,
  },
  {
    pergunta: 'O projeto de arquitetura é cobrado à parte?',
    resposta: 'Não. O projeto de interiores da nossa arquiteta já vem incluso com os móveis, sem custo extra.',
    confirmado: true,
  },
  {
    pergunta: 'Quais ambientes vocês fazem?',
    resposta: 'Cozinhas, quartos, closets, banheiros, home office e lojas, todos sob medida e com fabricação própria.',
    confirmado: true,
  },
  {
    pergunta: 'Quais cidades vocês atendem?',
    resposta: `${EMPRESA.cidadesAtendidas.map((c) => c.replace(/,\s*SP$/, '')).join(', ')} e região, no interior de São Paulo.`,
    confirmado: true,
  },
  {
    pergunta: 'Dá para ver o projeto em 3D antes?',
    resposta: 'Sim. No site dá para montar o ambiente em 3D grátis, baixar a imagem e mandar para a gente orçar. Depois da medição, o projeto final é detalhado.',
    confirmado: true,
  },
  {
    pergunta: 'Como eu peço um orçamento?',
    resposta: 'Conte o que você quer pelo botão ou pelo WhatsApp. Com fotos ou medidas, a conversa anda mais rápido.',
    confirmado: true,
  },
  {
    pergunta: 'Qual é o prazo médio de fabricação e instalação?',
    resposta: '[CONFIRMAR prazo médio em dias]',
    confirmado: false,
  },
  {
    pergunta: 'A medição em Jaú tem algum custo?',
    resposta: '[CONFIRMAR política de visita e projeto 3D fora de Jaú]',
    confirmado: false,
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
