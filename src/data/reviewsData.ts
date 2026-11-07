import { Review, ReviewStat, ReviewsOverview } from '../types';

/**
 * Enquanto `ehExemplo` for `true`, o componente `ReviewsSection` exibe um selo
 * discreto "Exemplo (dados de demonstração)" no topo da seção.
 * Quando os dados reais e autorizados forem inseridos abaixo, basta mudar para `false`.
 */
export const ehExemplo = true;

export const REVIEWS_OVERVIEW: ReviewsOverview = {
  eyebrowLeft: 'Avaliações Verificadas',
  eyebrowRight: 'Clientes de Jaú & Região',
  title: 'O que dizem os clientes de Jaú e região',
  description:
    'A confiança de quem escolheu a Império para projetar e transformar o seu lar sob medida.',
  googleBadgeLetter: 'G',
  googleRatingText: '5.0 / 5.0',
  googleSubtitle: 'Satisfação comprovada no Google',
  starCount: 5,
};

export const REVIEW_STATS: ReviewStat[] = [
  {
    id: 'rating',
    categoryLabel: 'Avaliação',
    targetValue: 5.0,
    decimals: 1,
    suffix: '★',
    title: 'Classificação Máxima',
    subtitle: 'Excelência no atendimento',
  },
  {
    id: 'lares',
    categoryLabel: 'Residências',
    targetValue: 250,
    decimals: 0,
    prefix: '+',
    title: 'Lares Transformados',
    subtitle: 'Projetos entregues em Jaú e região',
  },
  {
    id: 'mdf',
    categoryLabel: 'Qualidade',
    targetValue: 100,
    decimals: 0,
    suffix: '%',
    title: 'MDF Certificado',
    subtitle: 'Sem aglomerado, ferragens premium',
  },
  {
    id: 'years',
    categoryLabel: 'Experiência',
    targetValue: 10,
    decimals: 0,
    prefix: '+',
    suffix: ' Anos',
    title: 'Marcenaria Própria',
    subtitle: 'Tradição e oficina local em Jaú',
  },
];

export const CLIENT_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    authorName: 'Mariana F. Alencar',
    role: 'Cliente Residencial',
    location: 'Jardim Alvorada • Jaú/SP',
    text: 'Fizemos toda a cozinha e a área gourmet com a Império. O atendimento do projetista foi impecável desde a primeira visita em casa. O prazo de entrega foi cumprido rigorosamente e os montadores foram super caprichosos e educados.',
    starRating: 5,
    date: 'Há 2 meses',
    verified: true,
    projectType: 'Cozinha & Gourmet',
  },
  {
    id: 'rev-2',
    authorName: 'Carlos Eduardo M.',
    role: 'Cliente Residencial',
    location: 'Vila Nova • Jaú/SP',
    text: 'O closet ficou perfeito, exatamente como no desenho 3D. A iluminação em LED embutida e as gavetas para joias deram um acabamento de loja de luxo. Recomendo de olhos fechados para quem quer marcenaria sem dor de cabeça.',
    starRating: 5,
    date: 'Há 3 meses',
    verified: true,
    projectType: 'Closet & Suíte Master',
  },
  {
    id: 'rev-3',
    authorName: 'Renata & Thiago V.',
    role: 'Clientes Residenciais',
    location: 'Residencial Paineiras • Jaú/SP',
    text: 'Montamos nosso home office e o painel da sala. O acabamento dos ripados e o cuidado com a passagem de cabos da TV ficaram impecáveis. Melhor custo-benefício e qualidade de acabamento de Jaú.',
    starRating: 5,
    date: 'Há 1 mês',
    verified: true,
    projectType: 'Home Office & Sala',
  },
];

