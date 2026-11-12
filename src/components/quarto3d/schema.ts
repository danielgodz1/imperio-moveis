import { z } from 'zod';

// A CSP do site proíbe eval; o zod roda no modo sem JIT.
z.config({ jitless: true });
import {
  Ambiente,
  ModuloId,
  CENARIOS_AMBIENTES,
  CATALOGO_MODULOS_CENARIO,
} from '../../data/cenarios.js';
import { instanciaPadrao, normalizarInstancia, prenderAbertura } from './motorGeometrico.js';

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
  'nicho-geladeira',
]);

/**
 * Limites para o que entra no estado. O link do projeto (#projeto=...) e o armazenamento do
 * navegador são entrada não confiável: tudo tem tipo, tamanho e formato fixos. Os textos são
 * ids do catálogo (letras, números e hífen), nunca HTML.
 */
export const MAX_MODULOS = 40;
export const MAX_ABERTURAS = 12;
const ID_TEXTO = z.string().max(48).regex(/^[a-z0-9][a-z0-9-]*$/i);

export const AmbienteEnum = z.enum(['quarto', 'cozinha', 'closet', 'home-office', 'banheiro']);

export const AberturaSchema = z.object({
  tipo: z.enum(['porta', 'janela']),
  parede: z.enum(['N', 'S', 'L', 'O']),
  largura_m: z.number().min(0.4).max(2.6),
  posicaoOffset_m: z.number().min(-10).max(10).default(0),
  peitoril_m: z.number().min(0).max(3).optional(),
  altura_m: z.number().min(0.3).max(3).optional(),
});

export const ModuloInstanciaSchema = z.object({
  id: ModuloIdEnum,
  parede: z.enum(['N', 'S', 'L', 'O', 'centro']),
  largura_m: z.number().min(0.4).max(5.5),
  altura_m: z.number().min(0.05).max(3.5),
  acabamento: ID_TEXTO,
  uid: z.string().max(64).optional(),
  profundidade_m: z.number().min(0.03).max(2.5).optional(),
  offset_m: z.number().min(-10).max(10).optional(),
  z_m: z.number().min(-10).max(10).optional(),
  rotacao: z.number().min(-720).max(720).optional(),
  tampo: ID_TEXTO.optional(),
  portas: z.enum(['abrir', 'correr', 'sem']).optional(),
  puxador: z.enum(['cava', 'perfil', 'alca', 'toque']).optional(),
  maleiro: z.boolean().optional(),
  vaos: z
    .array(z.object({ interno: z.enum(['cabideiro', 'prateleiras', 'gavetas', 'sapateira']), gavetas: z.number().int().min(2).max(4).optional() }))
    .max(8)
    .optional(),
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
    aberturas: z.array(AberturaSchema).max(MAX_ABERTURAS),
    modulos: z.array(ModuloInstanciaSchema).max(MAX_MODULOS),
    led: z.boolean(),
    piso: ID_TEXTO.optional(),
    corParede: ID_TEXTO.optional(),
    noite: z.boolean().optional(),
    /** Temperatura da fita de LED em kelvin. */
    temperaturaLed: z.union([z.literal(2700), z.literal(3000), z.literal(4000)]).optional(),
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
