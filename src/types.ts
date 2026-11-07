export type AmbienteCategoria = 'cozinhas' | 'quartos' | 'lojas';

export interface WoodFinish {
  id: string;
  name: string;
  description: string;
  colorHex: string;
  grainPattern: 'linear' | 'catedral' | 'ondulado' | 'homogeneo';
  idealForRooms: string[];
}

export interface AnotacaoObra {
  /** Posição X do ponto na foto (0 a 100%) */
  x: number;
  /** Posição Y do ponto na foto (0 a 100%) */
  y: number;
  /** Posição X final da etiqueta (0 a 100%) */
  ex: number;
  /** Posição Y final da etiqueta (0 a 100%) */
  ey: number;
  /** Descrição curta no estilo cota */
  texto: string;
}

export interface ObraItem {
  id: string;
  ambiente: AmbienteCategoria;
  titulo: string;
  /** Caminho base sem extensão, ex: /obras/cozinha-ilha-ripado */
  arquivo: string;
  /** Proporção CSS ex: "612 / 852" */
  proporcao: string;
  /** Texto alternativo descritivo obrigatório */
  alt: string;
  /** Legenda no estilo cota: ambiente, material, cidade */
  cota: string;
  /** Anotações desenhadas a lápis sobre a obra */
  anotacoes: AnotacaoObra[];
}

export interface Review {
  id: string;
  authorName: string;
  role: string;
  location: string;
  text: string;
  starRating: number;
  date: string;
  verified: boolean;
  projectType: string;
}

export interface ReviewStat {
  id: 'rating' | 'lares' | 'mdf' | 'years';
  categoryLabel: string;
  targetValue: number;
  decimals: number;
  prefix?: string;
  suffix?: string;
  title: string;
  subtitle: string;
}

export interface ReviewsOverview {
  eyebrowLeft: string;
  eyebrowRight: string;
  title: string;
  description: string;
  googleBadgeLetter: string;
  googleRatingText: string;
  googleSubtitle: string;
  starCount: number;
}
