import { z } from 'zod';

// A CSP do site proíbe eval; o zod roda no modo sem JIT.
z.config({ jitless: true });
import {
  Ambiente,
  ModuloId,
  CENARIOS_AMBIENTES,
  CATALOGO_MODULOS_CENARIO,
} from '../../data/cenarios';
import { instanciaPadrao, normalizarInstancia, prenderAbertura } from './motorGeometrico';

export type { Ambiente, ModuloId };

export const ModuloIdEnum = z.enum([
  'guarda-roupa',
  'cabeceira-ripada-led',
  'painel-tv-ripado',
  'criado-mudo',
  'penteadeira-camarim',
  'bancada-estudo-quarto',
  'bancada-l',
  'ilha',
  'armarios-altos',
  'torre-forno',
  'cristaleira-led',
  'forro-ripado-teto',
  'nichos-led',
  'ilha-closet',
  'prateleiras-closet',
  'sapateira-espelhada',
  'bancada-trabalho',
  'estante-ripada',
  'gaveteiro',
  'armario-aereo-office',
  'sofa-recepcao',
  'gabinete-banheiro',
  'espelheira-led',
]);

export const AmbienteEnum = z.enum(['quarto', 'cozinha', 'closet', 'home-office', 'banheiro']);

export const AberturaSchema = z.object({
  tipo: z.enum(['porta', 'janela']),
  parede: z.enum(['N', 'S', 'L', 'O']),
  largura_m: z.number().min(0.4).max(2.6),
  posicaoOffset_m: z.number().default(0),
  peitoril_m: z.number().min(0).max(3).optional(),
  altura_m: z.number().min(0.3).max(3).optional(),
});

export const ModuloInstanciaSchema = z.object({
  id: ModuloIdEnum,
  parede: z.enum(['N', 'S', 'L', 'O', 'centro']),
  largura_m: z.number().min(0.4).max(5.5),
  altura_m: z.number().min(0.05).max(3.5),
  acabamento: z.string(),
  uid: z.string().optional(),
  profundidade_m: z.number().min(0.03).max(2.5).optional(),
  offset_m: z.number().optional(),
  z_m: z.number().optional(),
  rotacao: z.number().optional(),
  tampo: z.string().optional(),
});

export const QuartoLayoutSchema = z
  .object({
    /** 2 = aberturas com peitoril e altura. Layouts sem versão são da v1 e passam por normalizarLayout. */
    versao: z.number().int().optional(),
    comodo: AmbienteEnum,
    dimensoes: z.object({
      largura_m: z.number().min(1.5).max(6.5),
      profundidade_m: z.number().min(1.5).max(6.0),
      pe_direito_m: z.number().min(2.4).max(3.5),
    }),
    aberturas: z.array(AberturaSchema),
    modulos: z.array(ModuloInstanciaSchema),
    led: z.boolean(),
    piso: z.string().optional(),
    corParede: z.string().optional(),
    noite: z.boolean().optional(),
  })
  .superRefine((dados, ctx) => {
    const cenario = CENARIOS_AMBIENTES[dados.comodo];
    const permitidos = new Set<ModuloId>(cenario.modulosPermitidos);

    dados.modulos.forEach((mod, idx) => {
      if (!permitidos.has(mod.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['modulos', idx, 'id'],
          message: `O módulo "${mod.id}" não é permitido no ambiente "${dados.comodo}".`,
        });
      }
    });
  });

export type QuartoLayout = z.infer<typeof QuartoLayoutSchema>;

export const VERSAO_LAYOUT = 2;

export function construirLayoutDoCenario(
  ambiente: Ambiente,
  acabamentoId = 'freijo-ripado'
): QuartoLayout {
  const cenario = CENARIOS_AMBIENTES[ambiente];
  const dim = { ...cenario.dimensoesPadrao };
  const modulos = cenario.modulosIniciais.flatMap((modId) =>
    modId === 'criado-mudo'
      ? [
          instanciaPadrao(modId, dim, acabamentoId, -1.05),
          instanciaPadrao(modId, dim, acabamentoId, 1.05),
        ]
      : [instanciaPadrao(modId, dim, acabamentoId)]
  );
  return {
    versao: VERSAO_LAYOUT,
    comodo: ambiente,
    dimensoes: dim,
    aberturas: cenario.aberturasPadrao.map((a) => ({ ...a })),
    modulos,
    led: true,
    piso: cenario.piso,
    corParede: 'gelo',
    noite: false,
  };
}

/** Completa um layout vindo da API ou de versões antigas com as posições do motor. */
export function normalizarLayout(layout: QuartoLayout): QuartoLayout {
  return {
    ...layout,
    versao: VERSAO_LAYOUT,
    aberturas: layout.aberturas.map((a) => prenderAbertura(a, layout.dimensoes)),
    modulos: layout.modulos.map((m) => normalizarInstancia(m, layout.dimensoes)),
    piso: layout.piso ?? CENARIOS_AMBIENTES[layout.comodo].piso,
    corParede: layout.corParede ?? 'gelo',
    noite: layout.noite ?? false,
  };
}

export const LAYOUTS_INICIAIS: Record<Ambiente, QuartoLayout> = {
  quarto: construirLayoutDoCenario('quarto', 'freijo-ripado'),
  cozinha: construirLayoutDoCenario('cozinha', 'freijo-ripado'),
  closet: construirLayoutDoCenario('closet', 'areia-acetinado'),
  'home-office': construirLayoutDoCenario('home-office', 'freijo-ripado'),
  banheiro: construirLayoutDoCenario('banheiro', 'areia-acetinado'),
};
