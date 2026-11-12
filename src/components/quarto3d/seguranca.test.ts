import { describe, expect, it } from 'vitest';
import { MAX_JSON_PROJETO, MAX_LINK_PROJETO, codificarProjeto, decodificarProjeto } from './resumoProjeto';
import { LAYOUTS_INICIAIS, MAX_MODULOS, QuartoLayout } from './schema';
import { CHAVE_PROJETOS, MAX_NOME_PROJETO, MAX_PROJETOS, limparNome, listarProjetos, removerProjeto, salvarProjeto } from './projetosSalvos';
import { MAX_LINK_NO_QR, matrizQr } from './fotoProjeto';

const base64url = (bytes: Uint8Array) => Buffer.from(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const comprimir = async (texto: string) => {
  const saida = new Blob([new TextEncoder().encode(texto)]).stream().pipeThrough(new CompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(saida).arrayBuffer());
};
const linkDeJson = async (obj: unknown) => `z.${base64url(await comprimir(JSON.stringify(obj)))}`;
const cozinha = LAYOUTS_INICIAIS.cozinha;

describe('link do projeto (entrada não confiável)', () => {
  it('ida e volta mantém o projeto', async () => {
    const volta = await decodificarProjeto(await codificarProjeto(cozinha));
    expect(volta?.comodo).toBe('cozinha');
    expect(volta?.modulos.length).toBe(cozinha.modulos.length);
  });

  it('recusa link longo demais, com caracteres estranhos ou sem prefixo', async () => {
    expect(await decodificarProjeto('z.' + 'A'.repeat(MAX_LINK_PROJETO))).toBeNull();
    expect(await decodificarProjeto('z.<script>alert(1)</script>')).toBeNull();
    expect(await decodificarProjeto('javascript:alert(1)')).toBeNull();
    expect(await decodificarProjeto('')).toBeNull();
  });

  it('recusa "bomba de compressão" (texto curto que vira megabytes)', async () => {
    const enorme = { lixo: ' '.repeat(MAX_JSON_PROJETO * 20) };
    const link = await linkDeJson(enorme);
    expect(link.length).toBeLessThan(MAX_LINK_PROJETO);
    expect(await decodificarProjeto(link)).toBeNull();
  });

  it('não deixa __proto__ nem chaves extras entrarem no estado', async () => {
    const malicioso = JSON.parse(JSON.stringify(cozinha));
    malicioso.__proto__ = { poluido: true };
    malicioso.constructor = { prototype: { poluido: true } };
    malicioso.extra = '<img src=x onerror=alert(1)>';
    const volta = await decodificarProjeto(await linkDeJson(JSON.parse(JSON.stringify(malicioso).replace('"extra"', '"__proto__":{"poluido":true},"extra"'))));
    expect(({} as Record<string, unknown>).poluido).toBeUndefined();
    if (volta) {
      expect(Object.keys(volta)).not.toContain('extra');
      expect(Object.prototype.hasOwnProperty.call(volta, '__proto__')).toBe(false);
    }
  });

  it('recusa textos com HTML, listas grandes demais e números fora da faixa', async () => {
    const comHtml: QuartoLayout = { ...cozinha, corParede: '<b>x</b>' };
    expect(await decodificarProjeto(await linkDeJson(comHtml))).toBeNull();
    const muitos = { ...cozinha, modulos: Array.from({ length: MAX_MODULOS + 1 }, () => cozinha.modulos[0]) };
    expect(await decodificarProjeto(await linkDeJson(muitos))).toBeNull();
    const longe = { ...cozinha, modulos: [{ ...cozinha.modulos[0], offset_m: 1e9 }] };
    expect(await decodificarProjeto(await linkDeJson(longe))).toBeNull();
    const parede = { ...cozinha, dimensoes: { ...cozinha.dimensoes, largura_m: 99 } };
    expect(await decodificarProjeto(await linkDeJson(parede))).toBeNull();
  });
});

describe('projetos salvos no aparelho', () => {
  const armazem = () => {
    const m = new Map<string, string>();
    return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m };
  };

  it('salva, lista do mais novo ao mais antigo e remove', () => {
    const a = armazem();
    salvarProjeto('Cozinha nova', cozinha, a, new Date('2026-11-10T10:00:00Z'));
    const lista = salvarProjeto('Quarto', LAYOUTS_INICIAIS.quarto, a, new Date('2026-11-11T10:00:00Z'))!;
    expect(lista.map((p) => p.nome)).toEqual(['Quarto', 'Cozinha nova']);
    expect(listarProjetos(a)).toHaveLength(2);
    expect(removerProjeto(lista[0].id, a).map((p) => p.nome)).toEqual(['Cozinha nova']);
  });

  it('mesmo nome substitui; passa do limite, o mais antigo sai', () => {
    const a = armazem();
    salvarProjeto('Igual', cozinha, a);
    salvarProjeto('igual', cozinha, a);
    expect(listarProjetos(a)).toHaveLength(1);
    for (let i = 0; i < MAX_PROJETOS + 3; i++) salvarProjeto(`P${i}`, cozinha, a);
    expect(listarProjetos(a)).toHaveLength(MAX_PROJETOS);
  });

  it('nome sem HTML, sem caracteres de controle e com tamanho máximo', () => {
    expect(limparNome('  <b>Minha</b>\n cozinha\u0007 ')).toBe('bMinha/b cozinha');
    expect(limparNome('x'.repeat(200))).toHaveLength(MAX_NOME_PROJETO);
  });

  it('descarta o que foi adulterado no armazenamento', () => {
    const a = armazem();
    a.setItem(CHAVE_PROJETOS, JSON.stringify([
      { id: 'abc123', nome: 'ok', salvoEm: '2026-11-12T00:00:00Z', layout: cozinha },
      { id: '../../x', nome: 'id ruim', salvoEm: '2026-11-12T00:00:00Z', layout: cozinha },
      { id: 'def456', nome: 'layout ruim', salvoEm: '2026-11-12T00:00:00Z', layout: { comodo: 'garagem' } },
      { id: 'ghi789', nome: 'data ruim', salvoEm: 'ontem', layout: cozinha },
      'lixo',
    ]));
    expect(listarProjetos(a).map((p) => p.nome)).toEqual(['ok']);
    a.setItem(CHAVE_PROJETOS, '{nao é json');
    expect(listarProjetos(a)).toEqual([]);
  });

  it('sem armazenamento (modo privado) não quebra', () => {
    expect(listarProjetos(null)).toEqual([]);
    expect(salvarProjeto('x', cozinha, null)).toBeNull();
  });
});

describe('QR code do projeto', () => {
  it('gera a matriz para um link real e recusa link longo demais', async () => {
    const link = `https://www.imperiomoveisplanejadosjau.com.br/projetar#projeto=${await codificarProjeto(cozinha)}`;
    const m = await matrizQr(link);
    expect(m).not.toBeNull();
    expect(m!.length).toBeGreaterThan(20);
    expect(await matrizQr('x'.repeat(MAX_LINK_NO_QR + 1))).toBeNull();
  });
});
