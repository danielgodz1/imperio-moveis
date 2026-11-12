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

export const PROCESSO_V2 = [
  { numero: '01', titulo: 'A conversa', texto: 'Você conta como vive a casa. A gente escuta antes de medir.' },
  { numero: '02', titulo: 'O projeto', texto: 'A arquiteta desenha e você vê tudo em 3D, antes de existir.' },
  { numero: '03', titulo: 'A fabricação', texto: 'Na nossa oficina, cada peça é cortada para a sua parede, não para a média.' },
  { numero: '04', titulo: 'A chave', texto: 'Nossa equipe monta, regula e limpa. Você só abre as portas.' },
];
