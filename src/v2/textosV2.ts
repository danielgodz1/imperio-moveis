/**
 * Textos da V2: frases de efeito curtas, concretas, sem promessa que a empresa não possa cumprir.
 * Partes entre * viram itálico na serifa (uma por título).
 */
export const HERO_V2 = {
  titulo: 'Construímos o cenário *dos seus melhores dias.*',
  apoio: 'Arquitetura e marcenaria sob medida em Jaú e região. Projeto de arquitetura incluso.',
  final: 'A casa que você imaginou, *montada peça por peça.*',
};

/** Fases da montagem, em algarismos romanos. */
export const FASES_V2 = {
  traco: { numero: 'I', titulo: 'O traço', frase: 'Tudo começa num risco de lápis.' },
  profundidade: { numero: 'II', titulo: 'O espaço', frase: 'O piso assenta, as paredes sobem.' },
  construcao: { numero: 'III', titulo: 'A marcenaria', frase: 'Caixa por caixa, porta por porta.' },
  acabamento: { numero: 'IV', titulo: 'O acabamento', frase: 'Pedra, madeira e a luz que acende.' },
  obra: { numero: 'V', titulo: 'A obra', frase: 'A mesma cozinha, já com gente dentro.' },
} as const;

export const MANIFESTO_V2 =
  'Seu sonho não cabe em móvel de prateleira. Por isso cada peça nasce de um desenho, cada desenho nasce da sua rotina, e cada milímetro tem um motivo.';

export const NUMEROS_V2 = [
  { valor: 'R$ 0', rotulo: 'pelo projeto de arquitetura. Ele já vem com os móveis.' },
  { valor: '1', rotulo: 'equipe só, do primeiro traço à última dobradiça.' },
  { valor: '2015', rotulo: 'o ano em que a primeira cozinha saiu da nossa oficina.' },
  { valor: '4,9', rotulo: 'de nota no Google, dada por quem já mora numa Império.' },
];


/**
 * Projeto de arquitetura incluso. A comparação repete a da V1 (Diferencial.tsx); os itens só
 * descrevem o que o site já afirma (medição no local, 3D antes de fabricar, oficina própria,
 * acompanhamento até a instalação). Confirmar com os donos antes de publicar.
 */
export const PROJETO_INCLUSO_V2 = {
  comparacao: [
    { comum: 'Você contrata o arquiteto e a marcenaria em lugares separados.', imperio: 'Arquiteta e marceneiro na mesma empresa, na mesma conversa.' },
    { comum: 'O projeto de interiores é cobrado à parte.', imperio: 'O projeto de arquitetura de interiores já vem incluso, sem custo extra.' },
    { comum: 'O desenho chega pronto e a fábrica adapta como dá.', imperio: 'Quem projeta e quem fabrica trabalham lado a lado, do traço à instalação.' },
    { comum: 'Você só vê o móvel no dia da entrega.', imperio: 'Você vê o ambiente em 3D antes de fabricar.' },
  ],
  itens: [
    { titulo: 'A conversa e a medição', texto: 'Você conta como usa o ambiente e a gente mede a sua casa como ela está hoje. É dessa medida que o projeto nasce.' },
    { titulo: 'O desenho do ambiente', texto: 'A arquiteta distribui os móveis pela sua rotina: circulação, alturas e o que precisa ficar à mão.' },
    { titulo: 'O 3D antes do corte', texto: 'Você vê o ambiente em 3D e ajusta o que quiser antes de qualquer peça ser fabricada.' },
    { titulo: 'Materiais e acabamentos', texto: 'Cores, madeiras, pedras e iluminação escolhidas junto com a arquiteta, olhando amostras.' },
    { titulo: 'O detalhamento para a oficina', texto: 'Cada peça sai desenhada com a medida da sua parede para a nossa oficina, não para a média.' },
    { titulo: 'Do traço à montagem', texto: 'Quem projetou acompanha a fabricação e a montagem na sua casa, até o último ajuste de porta.' },
  ],
};

/** Os três passos do 3D online (iguais ao que o editor faz em /projetar). */
export const PASSOS_3D_V2 = [
  { titulo: 'Escolha o ambiente', texto: 'Coloque as medidas do seu espaço, com portas e janelas no lugar.' },
  { titulo: 'Monte do seu jeito', texto: 'Coloque os móveis, troque cores e madeiras e veja a luz do ambiente mudar.' },
  { titulo: 'Mande para orçar', texto: 'Baixe a imagem do projeto e envie pelo WhatsApp. A arquiteta parte dela.' },
];

/** Página /projetos-3d (o React e o HTML inicial usam os mesmos textos). */
export const PROJETOS_3D_V2 = {
  olho: 'Projetos 3D de móveis planejados',
  titulo: 'Projetos *em 3D.*',
  apoio:
    'Imagens de projeto, não fotos de obra pronta. Abra qualquer um no editor 3D, troque medidas, móveis e cores, e mande para a gente orçar.',
  aviso: 'Visualização aproximada. O projeto final é detalhado pela arquiteta depois da medição no local.',
};
