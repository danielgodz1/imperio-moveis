import { describe, expect, it } from 'vitest';
import { LAYOUTS_INICIAIS } from './schema';
import { codificarProjeto, decodificarProjeto, estimarPreco, linhasDoProjeto, montarMensagem } from './resumoProjeto';
import { MODELOS_PRONTOS, modelosDo } from './modelosProntos';
import { validarProjeto } from './regrasProjeto';
import { Instancia } from './motorGeometrico';
import { CENARIOS_AMBIENTES } from '../../data/cenarios';

const quarto = LAYOUTS_INICIAIS.quarto;

describe('modelos prontos', () => {
  it.each(Object.keys(CENARIOS_AMBIENTES))('%s tem 3 modelos', (amb) => {
    expect(modelosDo(amb as keyof typeof CENARIOS_AMBIENTES)).toHaveLength(3);
  });

  it.each(MODELOS_PRONTOS.map((m) => [m.id, m] as const))('%s abre sem nenhum problema de projeto', (_id, modelo) => {
    const l = modelo.montar();
    expect(l.comodo).toBe(modelo.ambiente);
    const problemas = validarProjeto({ modulos: l.modulos as Instancia[], aberturas: l.aberturas, dimensoes: l.dimensoes });
    expect([...problemas.entries()]).toEqual([]);
  });

  it('peça pedida no modelo entra de fato (penteadeira, estudo, sofá, nichos)', () => {
    const tem = (id: string, modulo: string) => MODELOS_PRONTOS.find((m) => m.id === id)!.montar().modulos.some((x) => x.id === modulo);
    expect(tem('quarto-penteadeira', 'penteadeira-camarim')).toBe(true);
    expect(tem('quarto-estudo', 'bancada-estudo-quarto')).toBe(true);
    expect(tem('office-sofa', 'sofa-recepcao')).toBe(true);
    expect(tem('banheiro-nichos', 'nichos-led')).toBe(true);
  });
});

describe('resumo e mensagem', () => {
  it('cada peça vira uma linha com medidas em cm e acabamento pelo nome', () => {
    const linhas = linhasDoProjeto(quarto);
    expect(linhas).toHaveLength(quarto.modulos.length);
    expect(linhas[0].detalhe).toMatch(/\d+ × \d+ × \d+ cm/);
    expect(linhas.some((l) => l.detalhe.includes('Freijó'))).toBe(true);
  });

  it('a mensagem leva nome, cidade, prazo, medidas, ambiente e link', () => {
    const msg = montarMensagem(quarto, { nome: 'Ana', cidade: 'Jaú, SP', prazo: '1 a 3 meses', temMedidas: 'sim' }, 'https://x/#projeto=z.abc');
    expect(msg).toContain('Nome: Ana');
    expect(msg).toContain('Cidade: Jaú, SP');
    expect(msg).toContain('Prazo desejado: 1 a 3 meses');
    expect(msg).toContain('Já tenho medidas ou planta: sim');
    expect(msg).toContain('Ambiente: Quarto, 380 × 350 cm');
    expect(msg).toContain('#projeto=z.abc');
    expect(msg).not.toMatch(/\n\n\n/);
  });
});

describe('preço de referência', () => {
  it('desligado por padrão: o site não mostra valor', () => {
    expect(estimarPreco(quarto)).toBeNull();
  });

  it('ligado: soma largura × preço e avisa quando é parcial', () => {
    const tabela = { ativo: true, aviso: 'ref', porMetroLinear: { 'guarda-roupa': 2000 } };
    const e = estimarPreco(quarto, tabela)!;
    const gr = quarto.modulos.find((m) => m.id === 'guarda-roupa')!;
    expect(e.total).toBe(Math.round((gr.largura_m * 2000) / 100) * 100);
    expect(e.parcial).toBe(true);
  });
});

describe('link do projeto', () => {
  it('ida e volta mantém o projeto', async () => {
    const original = { ...quarto, temperaturaLed: 2700 as const, led: false };
    const texto = await codificarProjeto(original);
    expect(texto.length).toBeLessThan(1800);
    const volta = (await decodificarProjeto(texto))!;
    expect(volta.comodo).toBe('quarto');
    expect(volta.led).toBe(false);
    expect(volta.temperaturaLed).toBe(2700);
    expect(volta.modulos.map((m) => [m.id, m.largura_m])).toEqual(original.modulos.map((m) => [m.id, m.largura_m]));
  });

  it('texto corrompido ou de outro formato vira null', async () => {
    expect(await decodificarProjeto('z.lixo')).toBeNull();
    expect(await decodificarProjeto('qualquer')).toBeNull();
    expect(await decodificarProjeto('j.' + btoa('{"comodo":"cozinha"}'))).toBeNull();
  });
});
