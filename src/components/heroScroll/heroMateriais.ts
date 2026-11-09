import * as THREE from 'three';
import { ACABAMENTOS_3D } from '../../data/acabamentos';

/** Tons de acabamentos.ts (ainda marcados como exemplo, confirmado: false). */
function tomAcabamento(id: string): string {
  return ACABAMENTOS_3D.find((a) => a.id === id)?.hex ?? '#FFFFFF';
}

function prng(semente: number) {
  let s = semente >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Desenho = (ctx: CanvasRenderingContext2D, tam: number, r: () => number) => void;

function textura(
  tam: number,
  metrosPorRepeticao: number,
  anisotropia: number,
  semente: number,
  desenho: Desenho,
  cor = true
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = tam;
  desenho(canvas.getContext('2d')!, tam, prng(semente));
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(1 / metrosPorRepeticao, 1 / metrosPorRepeticao);
  t.colorSpace = cor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = anisotropia;
  return t;
}

/** Freijó: fibras no sentido U, faixas largas de tom e poros alongados. */
const desenharFreijo =
  (base: string): Desenho =>
  (ctx, tam, r) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, tam, tam);
    for (let i = 0; i < 26; i++) {
      const y = r() * tam;
      const h = (0.02 + r() * 0.1) * tam;
      ctx.fillStyle = r() > 0.5 ? 'rgba(92,56,24,0.10)' : 'rgba(226,182,124,0.10)';
      ctx.fillRect(0, y, tam, h);
      ctx.fillRect(0, y - tam, tam, h);
    }
    for (let i = 0; i < 240; i++) {
      const y0 = r() * tam;
      const fase = r() * Math.PI * 2;
      const amp = 1.5 + r() * 5;
      ctx.strokeStyle = `rgba(70,40,16,${0.05 + r() * 0.16})`;
      ctx.lineWidth = 0.5 + r() * 1.4;
      ctx.beginPath();
      for (let x = 0; x <= tam; x += tam / 40) {
        const y = y0 + Math.sin((x / tam) * Math.PI * 2 + fase) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(48,26,10,0.22)';
    for (let i = 0; i < tam * 3; i++) {
      ctx.fillRect(r() * tam, r() * tam, 3 + r() * 16, 0.8);
    }
  };

/** Pedra clara do tampo: fundo marfim, nuvens cinza e veios terrosos quebrados. */
const desenharPedra: Desenho = (ctx, tam, r) => {
  ctx.fillStyle = '#E8E4DC';
  ctx.fillRect(0, 0, tam, tam);
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = r() > 0.5 ? 'rgba(255,253,248,0.16)' : 'rgba(170,164,152,0.08)';
    ctx.beginPath();
    ctx.ellipse(r() * tam, r() * tam, (0.05 + r() * 0.2) * tam, (0.02 + r() * 0.08) * tam, r() * 3.14, 0, 6.3);
    ctx.fill();
  }
  for (let v = 0; v < 34; v++) {
    let x = r() * tam;
    let y = r() * tam;
    let ang = -0.5 + r() * 1.1;
    const passos = 30 + Math.floor(r() * 90);
    const marrom = r() > 0.55;
    ctx.lineCap = 'round';
    for (let i = 0; i < passos; i++) {
      ang += (r() - 0.5) * 0.55;
      const nx = x + Math.cos(ang) * tam * 0.009;
      const ny = y + Math.sin(ang) * tam * 0.009;
      const a = 0.12 + r() * 0.4;
      ctx.strokeStyle = marrom ? `rgba(112,90,68,${a})` : `rgba(120,118,112,${a})`;
      ctx.lineWidth = (0.3 + r() * r() * 3.2) * (tam / 1024);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(nx, ny);
      ctx.stroke();
      x = nx;
      y = ny;
    }
  }
  for (let i = 0; i < tam * 2; i++) {
    const c = r() > 0.6 ? '96,88,78' : '200,196,188';
    ctx.fillStyle = `rgba(${c},${0.1 + r() * 0.25})`;
    ctx.fillRect(r() * tam, r() * tam, 1, 1);
  }
};

/** Porcelanato do piso: polido, nuvem quase imperceptível. */
const desenharPiso: Desenho = (ctx, tam, r) => {
  ctx.fillStyle = '#EAE5DC';
  ctx.fillRect(0, 0, tam, tam);
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = r() > 0.5 ? 'rgba(255,252,246,0.05)' : 'rgba(198,188,172,0.05)';
    ctx.beginPath();
    ctx.ellipse(r() * tam, r() * tam, (0.08 + r() * 0.26) * tam, (0.04 + r() * 0.12) * tam, r() * 3.14, 0, 6.3);
    ctx.fill();
  }
};

/** Revestimento atrás da bancada: placas cinza com faixas horizontais. */
const desenharRevestimento: Desenho = (ctx, tam, r) => {
  ctx.fillStyle = '#B3AEA4';
  ctx.fillRect(0, 0, tam, tam);
  for (let i = 0; i < 150; i++) {
    const y = r() * tam;
    ctx.fillStyle = r() > 0.5 ? `rgba(226,222,212,${r() * 0.04})` : `rgba(116,110,98,${r() * 0.04})`;
    ctx.fillRect(0, y, tam, (0.004 + r() * 0.03) * tam);
  }
  ctx.fillStyle = 'rgba(112,108,100,0.5)';
  ctx.fillRect(tam * 0.5, 0, 1.5, tam);
  ctx.fillRect(0, 0, 1.5, tam);
};

/** Pintura da parede: granulação discreta e neutra. */
const desenharParede: Desenho = (ctx, tam, r) => {
  ctx.fillStyle = '#E4DFD6';
  ctx.fillRect(0, 0, tam, tam);
  for (let i = 0; i < tam * 8; i++) {
    ctx.fillStyle = r() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(150,142,128,0.05)';
    ctx.fillRect(r() * tam, r() * tam, 2, 2);
  }
};

/** Inox escovado: riscos finos no sentido U, usados também como rugosidade. */
const desenharEscovado =
  (claro: boolean): Desenho =>
  (ctx, tam, r) => {
    ctx.fillStyle = claro ? '#B4B5B4' : '#808080';
    ctx.fillRect(0, 0, tam, tam);
    for (let i = 0; i < tam * 2; i++) {
      const v = Math.floor(r() * 255);
      ctx.fillStyle = `rgba(${v},${v},${v},0.045)`;
      ctx.fillRect(0, r() * tam, tam, 1);
    }
  };

/** Mapa de rugosidade da pedra: polida, com leve variação. */
const desenharRugosidadePedra: Desenho = (ctx, tam, r) => {
  ctx.fillStyle = '#404040';
  ctx.fillRect(0, 0, tam, tam);
  for (let i = 0; i < tam * 2; i++) {
    const v = 40 + Math.floor(r() * 90);
    ctx.fillStyle = `rgba(${v},${v},${v},0.5)`;
    ctx.fillRect(r() * tam, r() * tam, 2, 2);
  }
};

/** Mancha macia de oclusão, para assentar móveis no piso sem custo de sombra. */
function texturaOclusao(): THREE.CanvasTexture {
  const tam = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = tam;
  const ctx = canvas.getContext('2d')!;
  ctx.filter = 'blur(14px)';
  ctx.fillStyle = '#000';
  ctx.fillRect(26, 26, tam - 52, tam - 52);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.NoColorSpace;
  return t;
}

/** Brilho quente que a fita de LED projeta na superfície, do topo para baixo. */
function texturaBrilhoLed(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, 128);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.38)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 16, 128);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const MDF_CRU = new THREE.Color('#CDBFA8');

/** Uniforme único: a frente de acabamento que varre o ambiente na fase 4. */
export interface FrenteAcabamento {
  value: number;
}

/**
 * Faz o material nascer em MDF cru/primer e receber o acabamento conforme a
 * frente avança pelo ambiente (posição de mundo), controlada pela timeline.
 */
function comAcabamento<T extends THREE.MeshStandardMaterial>(
  material: T,
  frente: FrenteAcabamento,
  corFinal: string,
  misturaCru = 0.42
): T {
  const uCru = {
    value: new THREE.Color(corFinal).lerp(MDF_CRU, misturaCru),
  };
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uFrente = frente;
    shader.uniforms.uCru = uCru;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vPosMundo;')
      .replace(
        '#include <project_vertex>',
        `#include <project_vertex>
        #ifdef USE_INSTANCING
          vPosMundo = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
        #else
          vPosMundo = (modelMatrix * vec4(transformed, 1.0)).xyz;
        #endif`
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vPosMundo;
        uniform float uFrente;
        uniform vec3 uCru;`
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        float fAcab = smoothstep(0.0, 0.9, uFrente * 7.5 - 0.9 - (vPosMundo.x * 0.75 + vPosMundo.z * 0.35));
        diffuseColor.rgb = mix(uCru, diffuseColor.rgb, fAcab);`
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
        roughnessFactor = mix(0.8, roughnessFactor, fAcab);`
      )
      .replace(
        '#include <metalnessmap_fragment>',
        `#include <metalnessmap_fragment>
        metalnessFactor = mix(0.0, metalnessFactor, fAcab);`
      );
  };
  material.customProgramCacheKey = () => `acab-${misturaCru}`;
  return material;
}

export function criarMateriais(mobile: boolean, frente: FrenteAcabamento) {
  const tam = mobile ? 512 : 1024;
  const aniso = mobile ? 2 : 8;

  const texturas = {
    freijo: textura(tam, 1.1, aniso, 11, desenharFreijo(tomAcabamento('freijo-ripado'))),
    pedra: textura(tam, 1.5, aniso, 23, desenharPedra),
    pedraRug: textura(tam / 2, 1.5, aniso, 29, desenharRugosidadePedra, false),
    piso: textura(tam, 0.9, aniso, 31, desenharPiso),
    revestimento: textura(tam, 1.2, aniso, 41, desenharRevestimento),
    parede: textura(256, 0.8, 1, 53, desenharParede),
    inox: textura(tam / 2, 0.6, aniso, 61, desenharEscovado(true)),
    inoxRug: textura(tam / 2, 0.6, aniso, 67, desenharEscovado(false), false),
    oclusao: texturaOclusao(),
    brilhoLed: texturaBrilhoLed(),
  };

  const padrao = (
    corFinal: string,
    params: THREE.MeshStandardMaterialParameters,
    misturaCru?: number
  ) => comAcabamento(new THREE.MeshStandardMaterial(params), frente, corFinal, misturaCru);

  // A laca da foto puxa para o oliva sob a luz quente da cozinha.
  const verde = `#${new THREE.Color(tomAcabamento('verde-salvia')).lerp(new THREE.Color('#6B7258'), 0.5).getHexString()}`;
  const branco = tomAcabamento('branco-neve');
  const preto = tomAcabamento('preto-fosco');

  const materiais = {
    branco: padrao(branco, { color: branco, roughness: 0.42, metalness: 0 }, 0.3),
    verde: padrao(verde, { color: verde, roughness: 0.62, metalness: 0 }, 0.28),
    freijo: padrao('#B6864C', { map: texturas.freijo, roughness: 0.5, bumpMap: mobile ? null : texturas.freijo, bumpScale: 0.4 }, 0.5),
    pedra: padrao('#E8E4DC', { map: texturas.pedra, roughnessMap: texturas.pedraRug, roughness: 0.9, metalness: 0 }, 0.3),
    revestimento: padrao('#B3AEA4', { map: texturas.revestimento, roughness: 0.46 }, 0.4),
    parede: new THREE.MeshStandardMaterial({ map: texturas.parede, roughness: 0.92 }),
    teto: new THREE.MeshStandardMaterial({ color: '#EFEBE3', roughness: 0.95 }),
    piso: new THREE.MeshStandardMaterial({ map: texturas.piso, roughness: 0.16, metalness: 0, transparent: true, opacity: 0.86 }),
    reboco: new THREE.MeshStandardMaterial({ color: '#BDB7AC', roughness: 1 }),
    inox: padrao('#C9CACB', { map: texturas.inox, roughnessMap: texturas.inoxRug, roughness: 0.72, metalness: 0.82 }, 0.2),
    cromo: padrao('#D8D8D6', { color: '#D8D8D6', roughness: 0.24, metalness: 1 }, 0.2),
    preto: padrao(preto, { color: preto, roughness: 0.6, metalness: 0.05 }, 0.1),
    esquadria: new THREE.MeshStandardMaterial({ color: '#1C1B19', roughness: 0.5, metalness: 0.5 }),
    fogao: new THREE.MeshStandardMaterial({ color: '#141413', roughness: 0.28, metalness: 0.5 }),
    tela: new THREE.MeshStandardMaterial({ color: '#2E3134', roughness: 0.2, metalness: 0.3 }),
    ceramica: new THREE.MeshStandardMaterial({ color: '#F1EFEA', roughness: 0.3 }),
    estofado: new THREE.MeshStandardMaterial({ color: '#CDBBA2', roughness: 0.88 }),
    folha: new THREE.MeshStandardMaterial({ color: '#4E6E3A', roughness: 0.65, side: THREE.DoubleSide }),
    vaso: new THREE.MeshStandardMaterial({ color: '#23221F', roughness: 0.55 }),
    vidro: new THREE.MeshStandardMaterial({ color: '#D8DEDC', roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.22 }),
    fundoVao: new THREE.MeshStandardMaterial({ color: '#D5D6D3', roughness: 0.8 }),
    folga: new THREE.MeshBasicMaterial({ color: '#35332E' }),
    fundoAereo: new THREE.MeshStandardMaterial({ color: '#8E887C', roughness: 0.7 }),
    led: new THREE.MeshBasicMaterial({ color: '#000000' }),
    lente: new THREE.MeshBasicMaterial({ color: '#2a2520' }),
  };

  return { materiais, texturas };
}

export type MateriaisHero = ReturnType<typeof criarMateriais>['materiais'];
export type TexturasHero = ReturnType<typeof criarMateriais>['texturas'];
