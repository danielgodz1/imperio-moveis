/** Esquema do catálogo, usado nos testes (`npm test`) para barrar erro de digitação no JSON. */
import { z } from 'zod';

// A CSP do site proíbe eval; o zod roda no modo sem JIT.
z.config({ jitless: true });

export const TipoMaterial = z.enum(['madeirado', 'unicolor', 'laca', 'pedra', 'metal', 'vidro']);
export const AcabamentoSuperficie = z.enum(['fosco', 'acetinado', 'brilho']);
export const UsoMaterial = z.enum(['frente', 'caixaria', 'tampo', 'puxador', 'vitrine']);

const caminho = z.string().regex(/^(|\/materiais\/[\w\-/]+\.(webp|jpg|png|ktx2))$/, 'mapa deve ficar em /materiais/');

export const MaterialCatalogoSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  nome: z.string().min(2),
  fabricante: z.string(),
  tipo: TipoMaterial,
  acabamento: AcabamentoSuperficie,
  cor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  escalaCm: z.number().positive().max(500),
  veio: z.enum(['comprimento', 'nenhum']),
  uso: z.array(UsoMaterial).min(1),
  mapas: z.object({ baseColor: caminho, normal: caminho, roughness: caminho }),
  confirmado: z.boolean(),
});

export const CatalogoSchema = z.object({
  acabamentos: z.array(MaterialCatalogoSchema).min(1),
});

export type MaterialCatalogo = z.infer<typeof MaterialCatalogoSchema>;
export type Uso = z.infer<typeof UsoMaterial>;

