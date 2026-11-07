import { z } from 'zod';
import {
  Ambiente,
  ModuloId,
  CENARIOS_AMBIENTES,
  CATALOGO_MODULOS_CENARIO,
} from '../../data/cenarios';

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
]);

export const AmbienteEnum = z.enum(['quarto', 'cozinha', 'closet', 'home-office']);

export const AberturaSchema = z.object({
  tipo: z.enum(['porta', 'janela']),
  parede: z.enum(['N', 'S', 'L', 'O']),
  largura_m: z.number().min(0.6).max(2.6),
  posicaoOffset_m: z.number().default(0),
});

export const ModuloInstanciaSchema = z.object({
  id: ModuloIdEnum,
  parede: z.enum(['N', 'S', 'L', 'O', 'centro']),
  largura_m: z.number().min(0.4).max(5.5),
  altura_m: z.number().min(0.05).max(3.5),
  acabamento: z.string(),
});

export const QuartoLayoutSchema = z
  .object({
    comodo: AmbienteEnum,
    dimensoes: z.object({
      largura_m: z.number().min(2.2).max(6.5),
      profundidade_m: z.number().min(2.2).max(6.0),
      pe_direito_m: z.number().min(2.4).max(3.5),
    }),
    aberturas: z.array(AberturaSchema),
    modulos: z.array(ModuloInstanciaSchema),
    led: z.boolean(),
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

export function construirLayoutDoCenario(
  ambiente: Ambiente,
  acabamentoId = 'freijo-ripado'
): QuartoLayout {
  const cenario = CENARIOS_AMBIENTES[ambiente];
  return {
    comodo: ambiente,
    dimensoes: { ...cenario.dimensoesPadrao },
    aberturas: cenario.aberturasPadrao.map((a) => ({ ...a })),
    modulos: cenario.modulosIniciais.map((modId) => {
      const regra = CATALOGO_MODULOS_CENARIO[modId];
      return {
        id: modId,
        parede: regra.regraEncaixe.parede,
        largura_m: regra.regraEncaixe.larguraPadrao,
        altura_m: regra.regraEncaixe.alturaPadrao,
        acabamento: acabamentoId,
      };
    }),
    led: true,
  };
}

export const LAYOUTS_INICIAIS: Record<Ambiente, QuartoLayout> = {
  quarto: construirLayoutDoCenario('quarto', 'freijo-ripado'),
  cozinha: construirLayoutDoCenario('cozinha', 'freijo-ripado'),
  closet: construirLayoutDoCenario('closet', 'areia-acetinado'),
  'home-office': construirLayoutDoCenario('home-office', 'freijo-ripado'),
};
