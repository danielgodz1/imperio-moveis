import { describe, expect, it } from 'vitest';
import { FIM_DO_VIDEO, escolherVideo, tempoDoVideo } from './escolherVideo';

describe('qual vídeo servir', () => {
  it('celular em pé usa o vertical; tela deitada usa o horizontal', () => {
    expect(escolherVideo({ larguraCss: 390, alturaCss: 844, dpr: 3 }).orientacao).toBe('celular');
    expect(escolherVideo({ larguraCss: 1440, alturaCss: 900, dpr: 2 }).orientacao).toBe('desktop');
    expect(escolherVideo({ larguraCss: 844, alturaCss: 390, dpr: 3 }).orientacao).toBe('desktop');
    expect(escolherVideo({ larguraCss: 820, alturaCss: 1180, dpr: 2 }).orientacao).toBe('celular');
  });

  it('1080p só quando a tela mostra esses pixels', () => {
    expect(escolherVideo({ larguraCss: 390, alturaCss: 844, dpr: 3 }).resolucao).toBe(1080);
    expect(escolherVideo({ larguraCss: 360, alturaCss: 780, dpr: 2 }).resolucao).toBe(720);
    expect(escolherVideo({ larguraCss: 1920, alturaCss: 1080, dpr: 1 }).resolucao).toBe(1080);
    expect(escolherVideo({ larguraCss: 1366, alturaCss: 768, dpr: 1 }).resolucao).toBe(720);
  });

  it('economia de dados e rede lenta caem para 720p', () => {
    const tela = { larguraCss: 390, alturaCss: 844, dpr: 3 };
    expect(escolherVideo({ ...tela, economiaDados: true }).resolucao).toBe(720);
    expect(escolherVideo({ ...tela, rede: '3g' }).resolucao).toBe(720);
    expect(escolherVideo({ ...tela, rede: '4g' }).resolucao).toBe(1080);
  });

  it('o caminho e o poster existem com a orientação certa', () => {
    const f = escolherVideo({ larguraCss: 1920, alturaCss: 1080, dpr: 1 });
    expect(f.src).toBe('/videos/hero-desktop-1080.mp4');
    expect(f.poster).toBe('/videos/hero-desktop-poster.jpg');
  });
});

describe('tempo do vídeo na rolagem', () => {
  it('começa em 0, chega ao fim quando a foto real assume e nunca passa do fim', () => {
    expect(tempoDoVideo(0, 8)).toBe(0);
    expect(tempoDoVideo(FIM_DO_VIDEO, 8)).toBeCloseTo(7.96, 1);
    expect(tempoDoVideo(1, 8)).toBeLessThan(8);
    expect(tempoDoVideo(-0.2, 8)).toBe(0);
  });

  it('é crescente com a rolagem', () => {
    let anterior = -1;
    for (let p = 0; p <= 1; p += 0.05) {
      const t = tempoDoVideo(p, 8);
      expect(t).toBeGreaterThanOrEqual(anterior);
      anterior = t;
    }
  });
});
