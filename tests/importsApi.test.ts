import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * As funções de /api rodam na Vercel como ESM puro (package.json "type": "module"):
 * import relativo sem extensão derruba a função com FUNCTION_INVOCATION_FAILED.
 * Este teste percorre tudo o que as funções importam e exige a extensão .js.
 */
const RAIZ = path.resolve(import.meta.dirname, '..');
const IMPORT = /^\s*(import|export)\s+(?!type\b)[^'"]*?from\s+['"](\.[^'"]+)['"]/gm;

function resolver(origem: string, spec: string): string {
  const base = path.resolve(path.dirname(origem), spec);
  return base.endsWith('.js') ? base.replace(/\.js$/, '.ts') : base;
}

function percorrer(arquivo: string, vistos: Set<string>, erros: string[]) {
  if (vistos.has(arquivo)) return;
  vistos.add(arquivo);
  const texto = fs.readFileSync(arquivo, 'utf8');
  for (const m of texto.matchAll(IMPORT)) {
    const spec = m[2];
    if (spec.endsWith('.json')) continue;
    const rel = path.relative(RAIZ, arquivo);
    if (!spec.endsWith('.js')) {
      erros.push(`${rel}: '${spec}'`);
      continue;
    }
    const destino = resolver(arquivo, spec);
    if (!fs.existsSync(destino)) erros.push(`${rel}: '${spec}' não existe`);
    else percorrer(destino, vistos, erros);
  }
}

describe('funções serverless', () => {
  it.each(['lead.ts', 'layout.ts', 'avaliacoes.ts'])('api/%s só importa caminhos relativos com .js', (arquivo) => {
    const erros: string[] = [];
    percorrer(path.join(RAIZ, 'api', arquivo), new Set(), erros);
    expect(erros).toEqual([]);
  });
});
