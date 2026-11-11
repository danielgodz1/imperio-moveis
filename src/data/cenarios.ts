export type Ambiente = 'quarto' | 'cozinha' | 'closet' | 'home-office' | 'banheiro';

export type ModuloId =
  | 'guarda-roupa'
  | 'cabeceira-ripada-led'
  | 'painel-tv-ripado'
  | 'criado-mudo'
  | 'penteadeira-camarim'
  | 'bancada-estudo-quarto'
  | 'bancada-l'
  | 'ilha'
  | 'armarios-altos'
  | 'torre-forno'
  | 'cristaleira-led'
  | 'forro-ripado-teto'
  | 'nichos-led'
  | 'ilha-closet'
  | 'prateleiras-closet'
  | 'sapateira-espelhada'
  | 'bancada-trabalho'
  | 'estante-ripada'
  | 'gaveteiro'
  | 'armario-aereo-office'
  | 'sofa-recepcao'
  | 'gabinete-banheiro'
  | 'espelheira-led';

export type ParedeCardeal = 'N' | 'S' | 'L' | 'O' | 'centro';

export interface RegraModulo {
  id: ModuloId;
  rotulo: string;
  ambientes: Ambiente[];
  regraEncaixe: {
    parede: ParedeCardeal;
    larguraMin: number;
    larguraMax: number;
    larguraPadrao: number;
    alturaPadrao: number;
    profundidadePadrao: number;
  };
  /** Função que calcula a caixa de geometria parametrizada conforme o ambiente */
  gerarGeometria: (dimAmbiente: {
    largura_m: number;
    profundidade_m: number;
    pe_direito_m: number;
  }) => {
    largura: number;
    altura: number;
    profundidade: number;
    posicao: [number, number, number];
  };
}

export interface AberturaAmbiente {
  tipo: 'porta' | 'janela';
  parede: 'N' | 'S' | 'L' | 'O';
  largura_m: number;
  posicaoOffset_m: number;
  /** Altura da base da abertura em relação ao piso (0 em portas). */
  peitoril_m?: number;
  altura_m?: number;
}

export interface DefinicaoAmbiente {
  id: Ambiente;
  rotulo: string;
  descricaoReferencia: string;
  fotoReferencia: string;
  fotosInspiracao: string[];
  dimensoesPadrao: {
    largura_m: number;
    profundidade_m: number;
    pe_direito_m: number;
  };
  limites: {
    largura: { min: number; max: number };
    profundidade: { min: number; max: number };
    pe_direito: { min: number; max: number };
  };
  aberturasPadrao: AberturaAmbiente[];
  modulosPermitidos: ModuloId[];
  modulosIniciais: ModuloId[];
  piso: 'madeira-clara' | 'porcelanato-claro';
  paredeDestaque: 'N' | 'O' | 'L';
  posicaoCamera: [number, number, number];
}

export const CATALOGO_MODULOS_CENARIO: Record<ModuloId, RegraModulo> = {
  'guarda-roupa': {
    id: 'guarda-roupa',
    rotulo: 'Guarda-roupa piso ao teto',
    ambientes: ['quarto', 'closet'],
    regraEncaixe: {
      parede: 'O',
      larguraMin: 1.6,
      larguraMax: 4.2,
      larguraPadrao: 2.4,
      alturaPadrao: 2.55,
      profundidadePadrao: 0.6,
    },
    gerarGeometria: ({ largura_m: W, profundidade_m: D, pe_direito_m: H }) => {
      const larg = Math.min(2.4, D - 0.3);
      const alt = H - 0.05;
      const prof = 0.6;
      return {
        largura: larg,
        altura: alt,
        profundidade: prof,
        posicao: [-W / 2 + prof / 2, alt / 2, -D / 2 + larg / 2 + 0.15],
      };
    },
  },
  'cabeceira-ripada-led': {
    id: 'cabeceira-ripada-led',
    rotulo: 'Cabeceira ripada com LED + Cama',
    ambientes: ['quarto'],
    regraEncaixe: {
      parede: 'N',
      larguraMin: 1.8,
      larguraMax: 3.6,
      larguraPadrao: 2.5,
      alturaPadrao: 1.25,
      profundidadePadrao: 0.06,
    },
    gerarGeometria: ({ largura_m: W, profundidade_m: D, pe_direito_m: H }) => {
      const larg = Math.min(2.5, W - 0.5);
      const alt = Math.min(1.25, H * 0.55);
      return {
        largura: larg,
        altura: alt,
        profundidade: 0.06,
        posicao: [0.25, 0, -D / 2 + 0.06],
      };
    },
  },
  'criado-mudo': {
    id: 'criado-mudo',
    rotulo: 'Mesa de cabeceira + pendente',
    ambientes: ['quarto'],
    regraEncaixe: {
      parede: 'N',
      larguraMin: 0.4,
      larguraMax: 1.2,
      larguraPadrao: 0.5,
      alturaPadrao: 0.35,
      profundidadePadrao: 0.4,
    },
    gerarGeometria: ({ profundidade_m: D }) => ({
      largura: 0.48,
      altura: 0.26,
      profundidade: 0.38,
      posicao: [0.25, 0.42, -D / 2 + 0.24],
    }),
  },
  'painel-tv-ripado': {
    id: 'painel-tv-ripado',
    rotulo: 'Painel de TV ripado com rack',
    ambientes: ['quarto'],
    regraEncaixe: {
      parede: 'L',
      larguraMin: 1.4,
      larguraMax: 3.0,
      larguraPadrao: 1.8,
      alturaPadrao: 2.1,
      profundidadePadrao: 0.35,
    },
    gerarGeometria: ({ largura_m: W, profundidade_m: D, pe_direito_m: H }) => ({
      largura: Math.min(1.8, D - 0.6),
      altura: Math.min(2.1, H - 0.35),
      profundidade: 0.35,
      posicao: [W / 2 - 0.06, 0, 0.15],
    }),
  },
  'penteadeira-camarim': {
    id: 'penteadeira-camarim',
    rotulo: 'Penteadeira camarim com espelho LED',
    ambientes: ['quarto', 'closet'],
    regraEncaixe: {
      parede: 'N',
      larguraMin: 0.8,
      larguraMax: 1.4,
      larguraPadrao: 0.95,
      alturaPadrao: 1.65,
      profundidadePadrao: 0.45,
    },
    gerarGeometria: ({ largura_m: W, profundidade_m: D }) => ({
      largura: 0.92,
      altura: 0.78,
      profundidade: 0.44,
      posicao: [W / 2 - 0.56, 0.76, -D / 2 + 0.25],
    }),
  },
  'bancada-estudo-quarto': {
    id: 'bancada-estudo-quarto',
    rotulo: 'Bancada de estudo suspensa + nicho',
    ambientes: ['quarto'],
    regraEncaixe: {
      parede: 'O',
      larguraMin: 0.9,
      larguraMax: 1.5,
      larguraPadrao: 1.1,
      alturaPadrao: 0.76,
      profundidadePadrao: 0.5,
    },
    gerarGeometria: ({ largura_m: W, profundidade_m: D }) => ({
      largura: 1.05,
      altura: 0.76,
      profundidade: 0.48,
      posicao: [-W / 2 + 0.26, 0.75, D / 2 - 0.68],
    }),
  },
  'bancada-l': {
    id: 'bancada-l',
    rotulo: 'Bancada em L com cuba gourmet',
    ambientes: ['cozinha'],
    regraEncaixe: {
      parede: 'N',
      larguraMin: 2.2,
      larguraMax: 5.5,
      larguraPadrao: 3.4,
      alturaPadrao: 0.9,
      profundidadePadrao: 0.62,
    },
    gerarGeometria: ({ largura_m: W, profundidade_m: D }) => ({
      largura: W - 0.8,
      altura: 0.9,
      profundidade: 0.62,
      posicao: [-0.4, 0, -D / 2 + 0.31],
    }),
  },
  ilha: {
    id: 'ilha',
    rotulo: 'Ilha central ripada + cooktop e banquetas',
    ambientes: ['cozinha'],
    regraEncaixe: {
      parede: 'centro',
      larguraMin: 1.4,
      larguraMax: 3.0,
      larguraPadrao: 1.9,
      alturaPadrao: 0.92,
      profundidadePadrao: 0.85,
    },
    gerarGeometria: ({ largura_m: W, profundidade_m: D }) => ({
      largura: Math.min(1.9, W - 1.2),
      altura: 0.92,
      profundidade: 0.85,
      posicao: [0.1, 0, D * 0.12],
    }),
  },
  'armarios-altos': {
    id: 'armarios-altos',
    rotulo: 'Armários superiores até o teto + LED',
    ambientes: ['cozinha'],
    regraEncaixe: {
      parede: 'N',
      larguraMin: 1.8,
      larguraMax: 5.0,
      larguraPadrao: 3.2,
      alturaPadrao: 0.95,
      profundidadePadrao: 0.38,
    },
    gerarGeometria: ({ largura_m: W, profundidade_m: D, pe_direito_m: H }) => ({
      largura: W - 0.8,
      altura: 0.9,
      profundidade: 0.38,
      posicao: [-0.4, H - 0.48, -D / 2 + 0.2],
    }),
  },
  'torre-forno': {
    id: 'torre-forno',
    rotulo: 'Torre quente (forno + micro-ondas)',
    ambientes: ['cozinha'],
    regraEncaixe: {
      parede: 'N',
      larguraMin: 0.65,
      larguraMax: 0.9,
      larguraPadrao: 0.75,
      alturaPadrao: 2.55,
      profundidadePadrao: 0.62,
    },
    gerarGeometria: ({ largura_m: W, profundidade_m: D, pe_direito_m: H }) => ({
      largura: 0.75,
      altura: H - 0.06,
      profundidade: 0.62,
      posicao: [W / 2 - 0.42, (H - 0.06) / 2, -D / 2 + 0.32],
    }),
  },
  'cristaleira-led': {
    id: 'cristaleira-led',
    rotulo: 'Adega e cristaleira iluminada em LED',
    ambientes: ['cozinha'],
    regraEncaixe: {
      parede: 'O',
      larguraMin: 0.7,
      larguraMax: 1.2,
      larguraPadrao: 0.85,
      alturaPadrao: 2.45,
      profundidadePadrao: 0.45,
    },
    gerarGeometria: ({ largura_m: W, profundidade_m: D, pe_direito_m: H }) => ({
      largura: 0.85,
      altura: H - 0.08,
      profundidade: 0.45,
      posicao: [-W / 2 + 0.24, (H - 0.08) / 2, D / 2 - 0.58],
    }),
  },
  'forro-ripado-teto': {
    id: 'forro-ripado-teto',
    rotulo: 'Pórtico e forro ripado no teto com LED',
    ambientes: ['cozinha'],
    regraEncaixe: {
      parede: 'centro',
      larguraMin: 1.8,
      larguraMax: 3.6,
      larguraPadrao: 2.2,
      alturaPadrao: 0.08,
      profundidadePadrao: 1.4,
    },
    gerarGeometria: ({ largura_m: W, profundidade_m: D, pe_direito_m: H }) => ({
      largura: Math.min(2.3, W - 0.8),
      altura: 0.07,
      profundidade: Math.min(1.5, D * 0.45),
      posicao: [0.05, H - 0.05, D * 0.06],
    }),
  },
  'nichos-led': {
    id: 'nichos-led',
    rotulo: 'Coluna de nichos iluminados em LED',
    ambientes: ['closet', 'home-office', 'banheiro'],
    regraEncaixe: {
      parede: 'N',
      larguraMin: 0.5,
      larguraMax: 1.6,
      larguraPadrao: 0.9,
      alturaPadrao: 2.4,
      profundidadePadrao: 0.4,
    },
    gerarGeometria: ({ largura_m: W, profundidade_m: D, pe_direito_m: H }) => ({
      largura: 0.85,
      altura: H - 0.15,
      profundidade: 0.4,
      posicao: [W / 2 - 0.55, (H - 0.15) / 2, -D / 2 + 0.22],
    }),
  },
  'ilha-closet': {
    id: 'ilha-closet',
    rotulo: 'Ilha central vitrine para joias',
    ambientes: ['closet'],
    regraEncaixe: {
      parede: 'centro',
      larguraMin: 1.0,
      larguraMax: 2.0,
      larguraPadrao: 1.3,
      alturaPadrao: 0.88,
      profundidadePadrao: 0.65,
    },
    gerarGeometria: () => ({
      largura: 1.25,
      altura: 0.88,
      profundidade: 0.65,
      posicao: [0.15, 0.44, 0.1],
    }),
  },
  'prateleiras-closet': {
    id: 'prateleiras-closet',
    rotulo: 'Colmeia de cabideiros e bolsas',
    ambientes: ['closet'],
    regraEncaixe: {
      parede: 'N',
      larguraMin: 1.4,
      larguraMax: 3.4,
      larguraPadrao: 2.1,
      alturaPadrao: 2.5,
      profundidadePadrao: 0.52,
    },
    gerarGeometria: ({ largura_m: W, profundidade_m: D, pe_direito_m: H }) => ({
      largura: Math.min(1.8, W - 1.6),
      altura: H - 0.08,
      profundidade: 0.52,
      posicao: [-0.2, (H - 0.08) / 2, -D / 2 + 0.27],
    }),
  },
  'sapateira-espelhada': {
    id: 'sapateira-espelhada',
    rotulo: 'Sapateira vertical + espelho corpo inteiro',
    ambientes: ['closet'],
    regraEncaixe: {
      parede: 'L',
      larguraMin: 0.9,
      larguraMax: 1.8,
      larguraPadrao: 1.25,
      alturaPadrao: 2.35,
      profundidadePadrao: 0.38,
    },
    gerarGeometria: ({ largura_m: W, pe_direito_m: H }) => ({
      largura: 1.25,
      altura: H - 0.14,
      profundidade: 0.36,
      posicao: [W / 2 - 0.2, (H - 0.14) / 2, 0.22],
    }),
  },
  'bancada-trabalho': {
    id: 'bancada-trabalho',
    rotulo: 'Bancada dupla executiva + monitor',
    ambientes: ['home-office'],
    regraEncaixe: {
      parede: 'N',
      larguraMin: 1.6,
      larguraMax: 3.6,
      larguraPadrao: 2.4,
      alturaPadrao: 0.76,
      profundidadePadrao: 0.6,
    },
    gerarGeometria: ({ largura_m: W, profundidade_m: D }) => {
      const larg = Math.min(2.4, W - 1.1);
      return {
        largura: larg,
        altura: 0.76,
        profundidade: 0.6,
        posicao: [-W / 2 + larg / 2, 0.74, -D / 2 + 0.32],
      };
    },
  },
  'estante-ripada': {
    id: 'estante-ripada',
    rotulo: 'Estante biblioteca e painel ripado',
    ambientes: ['home-office'],
    regraEncaixe: {
      parede: 'O',
      larguraMin: 1.2,
      larguraMax: 3.0,
      larguraPadrao: 2.0,
      alturaPadrao: 2.4,
      profundidadePadrao: 0.36,
    },
    gerarGeometria: ({ largura_m: W, profundidade_m: D, pe_direito_m: H }) => ({
      largura: Math.min(1.8, D - 1.2),
      altura: H - 0.15,
      profundidade: 0.36,
      posicao: [-W / 2 + 0.2, (H - 0.15) / 2, 0.3],
    }),
  },
  gaveteiro: {
    id: 'gaveteiro',
    rotulo: 'Gaveteiro volante sob bancada',
    ambientes: ['home-office'],
    regraEncaixe: {
      parede: 'N',
      larguraMin: 0.45,
      larguraMax: 0.7,
      larguraPadrao: 0.52,
      alturaPadrao: 0.72,
      profundidadePadrao: 0.55,
    },
    gerarGeometria: ({ profundidade_m: D }) => ({
      largura: 0.52,
      altura: 0.72,
      profundidade: 0.55,
      posicao: [-0.95, 0.36, -D / 2 + 0.3],
    }),
  },
  'armario-aereo-office': {
    id: 'armario-aereo-office',
    rotulo: 'Armário aéreo basculante com fita LED',
    ambientes: ['home-office'],
    regraEncaixe: {
      parede: 'N',
      larguraMin: 1.4,
      larguraMax: 3.2,
      larguraPadrao: 2.1,
      alturaPadrao: 0.65,
      profundidadePadrao: 0.36,
    },
    gerarGeometria: ({ largura_m: W, profundidade_m: D, pe_direito_m: H }) => {
      const larg = Math.min(2.1, W - 1.2);
      return {
        largura: larg,
        altura: 0.62,
        profundidade: 0.36,
        posicao: [-W / 2 + larg / 2, H - 0.52, -D / 2 + 0.2],
      };
    },
  },
  'sofa-recepcao': {
    id: 'sofa-recepcao',
    rotulo: 'Sofá de leitura e recepção lateral',
    ambientes: ['home-office'],
    regraEncaixe: {
      parede: 'L',
      larguraMin: 1.2,
      larguraMax: 2.0,
      larguraPadrao: 1.45,
      alturaPadrao: 0.78,
      profundidadePadrao: 0.72,
    },
    gerarGeometria: ({ largura_m: W, profundidade_m: D }) => ({
      largura: 1.4,
      altura: 0.76,
      profundidade: 0.7,
      posicao: [W / 2 - 0.42, 0, D * 0.16],
    }),
  },
  'gabinete-banheiro': {
    id: 'gabinete-banheiro',
    rotulo: 'Gabinete suspenso com cuba e tampo',
    ambientes: ['banheiro'],
    regraEncaixe: {
      parede: 'N',
      larguraMin: 0.6,
      larguraMax: 2.4,
      larguraPadrao: 1.2,
      alturaPadrao: 0.55,
      profundidadePadrao: 0.5,
    },
    gerarGeometria: ({ largura_m: W, profundidade_m: D }) => {
      const larg = Math.min(1.2, W - 0.6);
      return { largura: larg, altura: 0.55, profundidade: 0.5, posicao: [-0.1, 0.3, -D / 2 + 0.25] };
    },
  },
  'espelheira-led': {
    id: 'espelheira-led',
    rotulo: 'Espelheira com armário e LED',
    ambientes: ['banheiro'],
    regraEncaixe: {
      parede: 'N',
      larguraMin: 0.5,
      larguraMax: 2.4,
      larguraPadrao: 1.2,
      alturaPadrao: 0.8,
      profundidadePadrao: 0.14,
    },
    gerarGeometria: ({ largura_m: W, profundidade_m: D }) => {
      const larg = Math.min(1.2, W - 0.6);
      return { largura: larg, altura: 0.8, profundidade: 0.14, posicao: [-0.1, 1.05, -D / 2 + 0.07] };
    },
  },
};

export { CENARIOS_AMBIENTES } from './ambientes';
