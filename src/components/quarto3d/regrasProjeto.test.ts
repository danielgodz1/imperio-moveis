import { describe, expect, it } from 'vitest';
import { Abertura, Instancia, instanciaPadrao, normalizarInstancia } from './motorGeometrico';
import { LAYOUTS_INICIAIS, QuartoLayout } from './schema';
import {
  Projeto,
  avaliarTriangulo,
  cooktopSobJanela,
  encaixar,
  sugerirCorrecao,
  validarProjeto,
} from './regrasProjeto';

const projeto = (l: QuartoLayout): Projeto => ({
  modulos: structuredClone(l.modulos) as Instancia[],
  aberturas: structuredClone(l.aberturas),
  dimensoes: { ...l.dimensoes },
});
const peca = (p: Projeto, id: string) => p.modulos.find((m) => m.id === id)!;
const regras = (p: Projeto, uid: string) => (validarProjeto(p).get(uid) ?? []).map((q) => q.regra);
const aplicar = (p: Projeto, uid: string, alteracao: Partial<Instancia>): Projeto => ({
  ...p,
  modulos: p.modulos.map((m) => (m.uid === uid ? normalizarInstancia({ ...m, ...alteracao }, p.dimensoes) : m)),
});

describe('cenas de exemplo', () => {
  it.each(Object.keys(LAYOUTS_INICIAIS))('%s abre sem nenhum problema', (amb) => {
    const p = projeto(LAYOUTS_INICIAIS[amb as keyof typeof LAYOUTS_INICIAIS]);
    expect([...validarProjeto(p)]).toEqual([]);
  });
});

describe('quarto: a cena antiga é bloqueada e tem correção', () => {
  it('cabeceira na parede da janela é marcada', () => {
    const p = projeto(LAYOUTS_INICIAIS.quarto);
    p.aberturas[0] = { ...p.aberturas[0], parede: 'N', posicaoOffset_m: 1.0 };
    const cama = peca(p, 'cabeceira-ripada-led');
    expect(regras(p, cama.uid)).toContain('cabeceira-janela');
    expect(regras(p, cama.uid)).toContain('geometria'); // painel de 125 cm cobre a janela
    // Mudar só a cama de parede deixaria a TV fora da frente dela: sem correção de um clique.
    expect(sugerirCorrecao(p, cama.uid)).toBeNull();
  });

  it('sem a TV, a cabeceira vai para uma parede cheia', () => {
    const p = projeto(LAYOUTS_INICIAIS.quarto);
    p.aberturas[0] = { ...p.aberturas[0], parede: 'N', posicaoOffset_m: 1.0 };
    p.modulos = p.modulos.filter((m) => m.id !== 'painel-tv-ripado');
    const cama = peca(p, 'cabeceira-ripada-led');
    const s = sugerirCorrecao(p, cama.uid);
    expect(s).not.toBeNull();
    expect(s!.alteracao.parede).not.toBe('N');
    expect(regras(aplicar(p, cama.uid, s!.alteracao), cama.uid)).toEqual([]);
  });

  it('TV ao lado da cama vai para a parede oposta', () => {
    const p = projeto(LAYOUTS_INICIAIS.quarto);
    const tv = peca(p, 'painel-tv-ripado');
    const lado = aplicar(p, tv.uid, { parede: 'L', offset_m: 0.15 });
    expect(regras(lado, tv.uid)).toContain('tv-oposta');
    const s = sugerirCorrecao(lado, tv.uid);
    expect(s?.alteracao.parede).toBe('S');
    expect(s?.rotulo).toBe('Mover para a parede da porta');
  });

  it('TV a menos de 2 m da cabeceira', () => {
    const p = projeto(LAYOUTS_INICIAIS.quarto);
    p.dimensoes.profundidade_m = 2.0;
    expect(regras(p, peca(p, 'painel-tv-ripado').uid)).toContain('tv-distancia');
  });

  it('móvel no giro da porta é marcado', () => {
    const p = projeto(LAYOUTS_INICIAIS.quarto);
    const tv = peca(p, 'painel-tv-ripado');
    expect(validarProjeto(aplicar(p, tv.uid, { offset_m: -1.0 })).get(tv.uid)?.[0].mensagem).toBe('Bloqueia a porta.');
  });
});

describe('janela', () => {
  const dim = { largura_m: 2.4, profundidade_m: 2.2, pe_direito_m: 2.6 };
  const janela: Abertura = { tipo: 'janela', parede: 'N', largura_m: 0.8, posicaoOffset_m: 0, peitoril_m: 1.0, altura_m: 1.0 };
  it('móvel de até 90 cm fica sob a janela; acima disso, não', () => {
    const gabinete = normalizarInstancia({ ...instanciaPadrao('gabinete-banheiro', dim, 'freijo-ripado'), offset_m: 0 }, dim);
    const espelheira = normalizarInstancia({ ...instanciaPadrao('espelheira-led', dim, 'freijo-ripado'), offset_m: 0 }, dim);
    expect(regras({ modulos: [gabinete], aberturas: [janela], dimensoes: dim }, gabinete.uid)).toEqual([]);
    expect(validarProjeto({ modulos: [espelheira], aberturas: [janela], dimensoes: dim }).get(espelheira.uid)?.[0].mensagem).toBe(
      'Cobre a janela.'
    );
  });
});

describe('circulação', () => {
  it('guarda-roupa sem 60 cm na frente sugere portas de correr', () => {
    const dim = { largura_m: 3, profundidade_m: 1.15, pe_direito_m: 2.7 };
    const gr = normalizarInstancia({ ...instanciaPadrao('guarda-roupa', dim, 'freijo-ripado'), parede: 'N', offset_m: 0 }, dim);
    const p: Projeto = { modulos: [gr], aberturas: [], dimensoes: dim };
    expect(regras(p, gr.uid)).toContain('circulacao-guarda-roupa');
    const s = sugerirCorrecao(p, gr.uid);
    expect(s).toEqual({ rotulo: 'Usar portas de correr', alteracao: { portas: 'correr' } });
    expect(regras(aplicar(p, gr.uid, s!.alteracao), gr.uid)).toEqual([]);
  });

  it('móvel na passagem ao lado da cama', () => {
    const p = projeto(LAYOUTS_INICIAIS.quarto);
    const gr = peca(p, 'guarda-roupa');
    const perto = aplicar(p, gr.uid, { parede: 'N', offset_m: -1.4 });
    expect(regras(perto, gr.uid)).toContain('circulacao-cama');
  });

  it('ilha a menos de 90 cm da bancada', () => {
    const p = projeto(LAYOUTS_INICIAIS.cozinha);
    const ilha = peca(p, 'ilha');
    const junto = aplicar(p, ilha.uid, { offset_m: ilha.offset_m - 0.4 });
    expect(regras(junto, ilha.uid)).toContain('circulacao-cozinha');
    const s = sugerirCorrecao(junto, ilha.uid);
    expect(s).not.toBeNull();
    expect(regras(aplicar(junto, ilha.uid, s!.alteracao), ilha.uid)).toEqual([]);
  });
});

describe('cozinha', () => {
  it('bancada fora de 90 cm e aéreo fora do vão', () => {
    const p = projeto(LAYOUTS_INICIAIS.cozinha);
    const bancada = peca(p, 'bancada-l');
    const baixa = aplicar(p, bancada.uid, { altura_m: 0.8 });
    expect(regras(baixa, bancada.uid)).toContain('bancada-altura');
    expect(regras(baixa, peca(baixa, 'armarios-altos').uid)).toContain('aereo-vao');
    expect(sugerirCorrecao(baixa, bancada.uid)?.rotulo).toBe('Voltar para 90 cm');
  });

  it('triângulo pia, cooktop e geladeira', () => {
    expect(avaliarTriangulo({ x: 0, z: 0 }, { x: 1.8, z: 0 }, { x: 0.9, z: 1.5 }).ok).toBe(true);
    expect(avaliarTriangulo({ x: 0, z: 0 }, { x: 0.8, z: 0 }, { x: 0.4, z: 1.5 }).ok).toBe(false);
    expect(avaliarTriangulo({ x: 0, z: 0 }, { x: 3.2, z: 0 }, { x: 1.6, z: 1 }).ok).toBe(false);
  });

  it('geladeira longe demais quebra o triângulo', () => {
    const p = projeto({ ...LAYOUTS_INICIAIS.cozinha, dimensoes: { largura_m: 6.5, profundidade_m: 6, pe_direito_m: 2.7 } });
    const g = peca(p, 'nicho-geladeira');
    const longe = aplicar(p, g.uid, { offset_m: 2.5 });
    expect(regras(longe, g.uid)).toContain('triangulo');
  });

  it('cooktop em móvel de parede sob a janela', () => {
    const bancada = { ...LAYOUTS_INICIAIS.cozinha.modulos[0], parede: 'O' } as Instancia;
    const janela: Abertura = { tipo: 'janela', parede: 'O', largura_m: 1.2, posicaoOffset_m: 0 };
    expect(cooktopSobJanela(bancada, 0.3, [janela])).toBe(true);
    expect(cooktopSobJanela(bancada, 1.4, [janela])).toBe(false);
  });
});

describe('encaixe', () => {
  const dim = { largura_m: 4, profundidade_m: 3.5, pe_direito_m: 2.7 };
  it('cola na ponta da parede e na lateral da vizinha, alinhando a altura', () => {
    const a = normalizarInstancia({ ...instanciaPadrao('guarda-roupa', dim, 'x'), parede: 'N', largura_m: 1.6, offset_m: 0 }, dim);
    const naPonta = encaixar({ ...a, offset_m: -2 + 0.8 + 0.06 }, [], dim);
    expect(naPonta.offset_m).toBeCloseTo(-1.2);
    const b = { ...a, uid: 'b', offset_m: 1.0, altura_m: 2.4 };
    const colado = encaixar({ ...a, offset_m: -0.66 }, [b], dim);
    expect(colado.offset_m).toBeCloseTo(-0.6);
    expect(colado.altura_m).toBe(2.4);
    expect(encaixar({ ...a, offset_m: -0.4 }, [b], dim).offset_m).toBeCloseTo(-0.4);
  });
});
