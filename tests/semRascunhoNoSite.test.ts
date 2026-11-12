import { describe, expect, it } from 'vitest';
import { PAGINAS_AMBIENTES_LOCAIS, METADADOS_ROTAS_SEO } from '../src/data/paginasLocais';
import { OBRAS_REAIS } from '../src/data/portfolioData';
import { perguntasConfirmadas } from '../src/data/perguntas';

// Marcas de rascunho que nunca podem chegar ao texto público (nem ao Google).
const RASCUNHO = /\[(CONFIRMAR|PREENCHER)[^\]]*\]/;

describe('texto público sem marcas de rascunho', () => {
  it('páginas de ambiente', () => {
    for (const p of Object.values(PAGINAS_AMBIENTES_LOCAIS)) expect(JSON.stringify(p)).not.toMatch(RASCUNHO);
  });
  it('títulos e descrições de todas as rotas', () => {
    expect(JSON.stringify(METADADOS_ROTAS_SEO)).not.toMatch(RASCUNHO);
  });
  it('legendas e textos das obras', () => {
    expect(JSON.stringify(OBRAS_REAIS)).not.toMatch(RASCUNHO);
  });
  it('perguntas frequentes publicadas', () => {
    expect(JSON.stringify(perguntasConfirmadas())).not.toMatch(RASCUNHO);
  });
});
