export type Ambiente = 'quarto' | 'cozinha' | 'closet' | 'home-office';

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
  | 'sofa-recepcao';

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
    rotulo: 'Mesas de cabeceira + pendentes',
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
      largura: W - 0.85,
      altura: 0.9,
      profundidade: 0.62,
      posicao: [-0.35, 0, -D / 2 + 0.31],
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
      largura: W - 0.9,
      altura: 0.9,
      profundidade: 0.38,
      posicao: [-0.35, H - 0.48, -D / 2 + 0.2],
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
    ambientes: ['closet', 'home-office'],
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
    rotulo: 'Colmeia de cabideiros e bolsas (Norte)',
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
      largura: Math.min(2.1, W - 1.1),
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
    gerarGeometria: ({ largura_m: W, profundidade_m: D }) => ({
      largura: Math.min(2.4, W - 0.6),
      altura: 0.76,
      profundidade: 0.6,
      posicao: [-0.2, 0.74, -D / 2 + 0.32],
    }),
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
      largura: Math.min(2.0, D - 0.5),
      altura: H - 0.15,
      profundidade: 0.36,
      posicao: [-W / 2 + 0.2, (H - 0.15) / 2, 0],
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
    gerarGeometria: ({ largura_m: W, profundidade_m: D, pe_direito_m: H }) => ({
      largura: Math.min(2.1, W - 0.8),
      altura: 0.62,
      profundidade: 0.36,
      posicao: [-0.2, H - 0.52, -D / 2 + 0.2],
    }),
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
};

export const CENARIOS_AMBIENTES: Record<Ambiente, DefinicaoAmbiente> = {
  quarto: {
    id: 'quarto',
    rotulo: 'Quarto',
    descricaoReferencia:
      'Suíte planejada com sanca iluminada, cabeceira ripada em LED, guarda-roupa até o teto, penteadeira camarim e painel de TV.',
    fotoReferencia: 'dormitorio-led-1',
    fotosInspiracao: ['dormitorio-led-1', 'quarto-bebe-nichos'],
    dimensoesPadrao: {
      largura_m: 3.8,
      profundidade_m: 3.5,
      pe_direito_m: 2.7,
    },
    limites: {
      largura: { min: 2.6, max: 5.5 },
      profundidade: { min: 2.6, max: 5.5 },
      pe_direito: { min: 2.4, max: 3.4 },
    },
    aberturasPadrao: [
      { tipo: 'janela', parede: 'N', largura_m: 1.2, posicaoOffset_m: 1.0 },
      { tipo: 'porta', parede: 'S', largura_m: 0.8, posicaoOffset_m: -1.1 },
    ],
    modulosPermitidos: [
      'cabeceira-ripada-led',
      'criado-mudo',
      'guarda-roupa',
      'painel-tv-ripado',
      'penteadeira-camarim',
      'bancada-estudo-quarto',
    ],
    modulosIniciais: [
      'cabeceira-ripada-led',
      'criado-mudo',
      'guarda-roupa',
      'painel-tv-ripado',
    ],
    piso: 'madeira-clara',
    paredeDestaque: 'N',
    posicaoCamera: [4.2, 3.1, 4.8],
  },
  cozinha: {
    id: 'cozinha',
    rotulo: 'Cozinha',
    descricaoReferencia:
      'Cozinha gourmet com bancada em L, ilha ripada com banquetas, armários até o teto, torre quente, adega iluminada e forro ripado.',
    fotoReferencia: 'cozinha-ilha-ripado',
    fotosInspiracao: ['cozinha-ilha-ripado', 'cozinha-forro-ripado', 'cozinha-ilha-verde'],
    dimensoesPadrao: {
      largura_m: 4.2,
      profundidade_m: 3.6,
      pe_direito_m: 2.7,
    },
    limites: {
      largura: { min: 2.8, max: 6.5 },
      profundidade: { min: 2.6, max: 6.0 },
      pe_direito: { min: 2.4, max: 3.5 },
    },
    aberturasPadrao: [
      { tipo: 'janela', parede: 'O', largura_m: 1.4, posicaoOffset_m: -0.3 },
    ],
    modulosPermitidos: [
      'bancada-l',
      'ilha',
      'armarios-altos',
      'torre-forno',
      'cristaleira-led',
      'forro-ripado-teto',
    ],
    modulosIniciais: [
      'bancada-l',
      'ilha',
      'armarios-altos',
      'torre-forno',
      'forro-ripado-teto',
    ],
    piso: 'porcelanato-claro',
    paredeDestaque: 'N',
    posicaoCamera: [4.5, 3.3, 5.0],
  },
  closet: {
    id: 'closet',
    rotulo: 'Closet',
    descricaoReferencia:
      'Closet arquitetônico com armários piso-teto, colmeia iluminada, ilha vitrine, penteadeira camarim e sapateira espelhada.',
    fotoReferencia: 'quarto-bebe-nichos',
    fotosInspiracao: ['quarto-bebe-nichos', 'dormitorio-led-1'],
    dimensoesPadrao: {
      largura_m: 3.4,
      profundidade_m: 3.2,
      pe_direito_m: 2.7,
    },
    limites: {
      largura: { min: 2.2, max: 5.0 },
      profundidade: { min: 2.2, max: 5.0 },
      pe_direito: { min: 2.4, max: 3.4 },
    },
    aberturasPadrao: [
      { tipo: 'porta', parede: 'S', largura_m: 0.8, posicaoOffset_m: 0 },
    ],
    modulosPermitidos: [
      'guarda-roupa',
      'prateleiras-closet',
      'nichos-led',
      'ilha-closet',
      'penteadeira-camarim',
      'sapateira-espelhada',
    ],
    modulosIniciais: [
      'guarda-roupa',
      'prateleiras-closet',
      'nichos-led',
      'ilha-closet',
      'sapateira-espelhada',
    ],
    piso: 'madeira-clara',
    paredeDestaque: 'O',
    posicaoCamera: [3.9, 3.0, 4.4],
  },
  'home-office': {
    id: 'home-office',
    rotulo: 'Home Office',
    descricaoReferencia:
      'Escritório planejado com bancada dupla executiva, estante ripada, armário aéreo em LED, gaveteiro e sofá de apoio.',
    fotoReferencia: 'dormitorio-led-2',
    fotosInspiracao: ['dormitorio-led-2', 'comercial-expositor'],
    dimensoesPadrao: {
      largura_m: 3.4,
      profundidade_m: 3.0,
      pe_direito_m: 2.7,
    },
    limites: {
      largura: { min: 2.2, max: 5.0 },
      profundidade: { min: 2.2, max: 4.8 },
      pe_direito: { min: 2.4, max: 3.4 },
    },
    aberturasPadrao: [
      { tipo: 'janela', parede: 'N', largura_m: 1.1, posicaoOffset_m: -0.5 },
    ],
    modulosPermitidos: [
      'bancada-trabalho',
      'estante-ripada',
      'gaveteiro',
      'nichos-led',
      'armario-aereo-office',
      'sofa-recepcao',
    ],
    modulosIniciais: [
      'bancada-trabalho',
      'estante-ripada',
      'gaveteiro',
      'nichos-led',
      'armario-aereo-office',
    ],
    piso: 'madeira-clara',
    paredeDestaque: 'N',
    posicaoCamera: [3.8, 3.0, 4.3],
  },
};
