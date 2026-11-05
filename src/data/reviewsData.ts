import { Review } from '../types';

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
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&h=200&q=80'
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
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&h=200&q=80'
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
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&h=200&q=80'
  }
];
