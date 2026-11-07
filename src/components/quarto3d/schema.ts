import { z } from 'zod';

export const AberturaSchema = z.object({
  tipo: z.enum(['porta', 'janela']),
  parede: z.enum(['N', 'S', 'L', 'O']),
  pos_m: z.number().min(0.2).max(7.5),
  largura_m: z.number().min(0.6).max(3.0),
});

export const ModuloIdSchema = z.enum([
  'guarda-roupa',
  'cabeceira-led',
  'painel-tv',
  'bancada-ilha',
]);

export type ModuloId = z.infer<typeof ModuloIdSchema>;

export const ModuloSchema = z.object({
  id: ModuloIdSchema,
  parede: z.enum(['N', 'S', 'L', 'O']),
  largura_m: z.number().min(0.8).max(5.5),
  altura_m: z.number().min(0.75).max(3.0),
  acabamento: z.string().min(1),
});

export const QuartoLayoutSchema = z.object({
  comodo: z.enum(['quarto', 'cozinha', 'closet', 'home-office']),
  dimensoes: z.object({
    largura_m: z.number().min(2.2).max(7.5),
    profundidade_m: z.number().min(2.2).max(7.5),
    pe_direito_m: z.number().min(2.4).max(3.5),
  }),
  aberturas: z.array(AberturaSchema).max(4),
  modulos: z.array(ModuloSchema).min(1).max(4),
  led: z.boolean(),
});

export type QuartoLayout = z.infer<typeof QuartoLayoutSchema>;

export const CATALOGO_MODULOS: Array<{
  id: ModuloId;
  rotulo: string;
  paredePadrao: 'N' | 'S' | 'L' | 'O';
  larguraPadrao: number;
  alturaPadrao: number;
}> = [
  {
    id: 'guarda-roupa',
    rotulo: 'Guarda-roupa de parede inteira',
    paredePadrao: 'O',
    larguraPadrao: 2.6,
    alturaPadrao: 2.6,
  },
  {
    id: 'cabeceira-led',
    rotulo: 'Cabeceira ripada com LED',
    paredePadrao: 'N',
    larguraPadrao: 2.4,
    alturaPadrao: 1.25,
  },
  {
    id: 'painel-tv',
    rotulo: 'Painel de TV ripado',
    paredePadrao: 'L',
    larguraPadrao: 2.2,
    alturaPadrao: 2.1,
  },
  {
    id: 'bancada-ilha',
    rotulo: 'Bancada / Ilha',
    paredePadrao: 'S',
    larguraPadrao: 1.8,
    alturaPadrao: 0.9,
  },
];

export const LAYOUTS_INICIAIS: Record<QuartoLayout['comodo'], QuartoLayout> = {
  quarto: {
    comodo: 'quarto',
    dimensoes: { largura_m: 3.6, profundidade_m: 3.4, pe_direito_m: 2.7 },
    aberturas: [
      { tipo: 'janela', parede: 'L', pos_m: 1.7, largura_m: 1.4 },
      { tipo: 'porta', parede: 'S', pos_m: 0.8, largura_m: 0.85 },
    ],
    modulos: [
      {
        id: 'cabeceira-led',
        parede: 'N',
        largura_m: 2.4,
        altura_m: 1.25,
        acabamento: 'freijo-ripado',
      },
      {
        id: 'guarda-roupa',
        parede: 'O',
        largura_m: 2.6,
        altura_m: 2.65,
        acabamento: 'areia-acetinado',
      },
      {
        id: 'painel-tv',
        parede: 'L',
        largura_m: 2.0,
        altura_m: 2.1,
        acabamento: 'freijo-ripado',
      },
    ],
    led: true,
  },
  cozinha: {
    comodo: 'cozinha',
    dimensoes: { largura_m: 4.1, profundidade_m: 3.2, pe_direito_m: 2.7 },
    aberturas: [{ tipo: 'janela', parede: 'N', pos_m: 2.0, largura_m: 1.4 }],
    modulos: [
      {
        id: 'guarda-roupa',
        parede: 'N',
        largura_m: 3.4,
        altura_m: 2.65,
        acabamento: 'areia-acetinado',
      },
      {
        id: 'bancada-ilha',
        parede: 'S',
        largura_m: 2.2,
        altura_m: 0.92,
        acabamento: 'freijo-ripado',
      },
    ],
    led: true,
  },
  closet: {
    comodo: 'closet',
    dimensoes: { largura_m: 3.2, profundidade_m: 3.0, pe_direito_m: 2.7 },
    aberturas: [{ tipo: 'porta', parede: 'S', pos_m: 1.6, largura_m: 0.9 }],
    modulos: [
      {
        id: 'guarda-roupa',
        parede: 'O',
        largura_m: 2.7,
        altura_m: 2.65,
        acabamento: 'areia-acetinado',
      },
      {
        id: 'bancada-ilha',
        parede: 'N',
        largura_m: 1.5,
        altura_m: 0.9,
        acabamento: 'freijo-ripado',
      },
    ],
    led: true,
  },
  'home-office': {
    comodo: 'home-office',
    dimensoes: { largura_m: 3.2, profundidade_m: 2.8, pe_direito_m: 2.7 },
    aberturas: [{ tipo: 'janela', parede: 'N', pos_m: 1.6, largura_m: 1.2 }],
    modulos: [
      {
        id: 'bancada-ilha',
        parede: 'N',
        largura_m: 2.0,
        altura_m: 0.78,
        acabamento: 'freijo-ripado',
      },
      {
        id: 'painel-tv',
        parede: 'L',
        largura_m: 1.8,
        altura_m: 2.1,
        acabamento: 'cinza-urbano',
      },
      {
        id: 'guarda-roupa',
        parede: 'O',
        largura_m: 2.2,
        altura_m: 2.6,
        acabamento: 'areia-acetinado',
      },
    ],
    led: true,
  },
};

