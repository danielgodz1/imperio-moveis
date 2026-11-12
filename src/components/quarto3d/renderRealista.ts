/**
 * Imagem final "renderizada": a mesma cena desenhada dezenas de vezes e somada.
 * - A câmera anda uma fração de pixel a cada passada: bordas lisas (sem serrilhado).
 * - O sol muda um pouco de lugar a cada passada, como uma janela grande: sombras suaves de verdade.
 *
 * Usa o renderer e os shaders que o editor já tem prontos, então funciona em qualquer placa
 * e não trava o aparelho (ao contrário de path tracing, cujo shader leva minutos para compilar
 * em placas integradas no Windows).
 */
import * as THREE from 'three';
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';

export type FaseRender = 'preparando' | 'calculando';

export interface OpcoesRender {
  renderer: THREE.WebGLRenderer;
  /** Cópia da cena (scene.clone), feita pelo editor no momento do pedido. */
  cena: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  largura: number;
  altura: number;
  /** Passadas somadas: mais passadas, sombra mais lisa. */
  passadas: number;
  /** Lado do mapa de sombra durante o render. */
  mapaSombra: number;
  aoProgresso?: (fracao: number, fase: FaseRender) => void;
  sinal?: AbortSignal;
}

/** Raio do "sol grande" (metros, em torno da posição original): quanto maior, mais macia a sombra. */
const RAIO_LUZ = 0.9;

/** Sequência de Halton: pontos bem espalhados, melhores que aleatórios para poucas passadas. */
function halton(i: number, base: number) {
  let f = 1;
  let r = 0;
  let n = i;
  while (n > 0) {
    f /= base;
    r += f * (n % base);
    n = Math.floor(n / base);
  }
  return r;
}

const MEDIA = new THREE.ShaderMaterial({
  uniforms: { quadro: { value: null }, anterior: { value: null }, peso: { value: 1 } },
  vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: `
    uniform sampler2D quadro; uniform sampler2D anterior; uniform float peso; varying vec2 vUv;
    void main() { gl_FragColor = mix(texture2D(anterior, vUv), texture2D(quadro, vUv), peso); }`,
  depthTest: false,
  depthWrite: false,
});

// Num render target o three.js não aplica tom nem sRGB: a saída faz os dois na mão (AgX, igual ao editor).
const SAIDA = new THREE.ShaderMaterial({
  uniforms: { mapa: { value: null }, toneMappingExposure: { value: 1.25 } },
  vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
  fragmentShader: `
    uniform sampler2D mapa; varying vec2 vUv;
    #include <tonemapping_pars_fragment>
    void main() {
      vec3 cor = AgXToneMapping(texture2D(mapa, vUv).rgb);
      gl_FragColor = sRGBTransferOETF(vec4(cor, 1.0));
    }`,
  depthTest: false,
  depthWrite: false,
  toneMapped: false,
});

/** Tira os auxiliares do editor e liga sombra em tudo (no editor leve elas ficam desligadas). */
function prepararCena(cena: THREE.Scene, mapaSombra: number) {
  const remover: THREE.Object3D[] = [];
  const sois: Array<{ luz: THREE.DirectionalLight; base: THREE.Vector3 }> = [];
  cena.traverse((o) => {
    if (o.userData.apenasEditor || (o as THREE.Line).isLine) remover.push(o);
    const malha = o as THREE.Mesh;
    if (malha.isMesh) {
      const mat = malha.material as THREE.Material;
      malha.castShadow = !(mat.transparent && mat.opacity < 0.5);
      malha.receiveShadow = true;
    }
    const luz = o as THREE.DirectionalLight;
    // Só o sol projeta sombra: sombra de luz pontual (mapa cúbico) é cara e falha no three r187.
    if ((o as THREE.Light).isLight && !luz.isDirectionalLight) (o as THREE.Light).castShadow = false;
    if (luz.isDirectionalLight && luz.castShadow !== undefined && luz.intensity > 0.3) {
      luz.castShadow = true;
      luz.shadow.mapSize.set(mapaSombra, mapaSombra);
      luz.shadow.radius = 1;
      luz.shadow.bias = -0.0004;
      luz.shadow.normalBias = 0.015;
      luz.shadow.map?.dispose();
      luz.shadow.map = null;
      luz.target.updateMatrixWorld(true);
      sois.push({ luz, base: luz.position.clone() });
    }
  });
  remover.forEach((o) => o.parent?.remove(o));
  return sois;
}

export async function renderizarRealista(op: OpcoesRender): Promise<HTMLCanvasElement> {
  const { renderer: gl, largura: w, altura: h } = op;
  const tipo = gl.extensions.has('EXT_color_buffer_half_float') || gl.capabilities.isWebGL2 ? THREE.HalfFloatType : THREE.UnsignedByteType;
  const alvo = () => new THREE.WebGLRenderTarget(w, h, { type: tipo, samples: 0, depthBuffer: true });
  const quadro = alvo();
  let acum = alvo();
  let acum2 = alvo();
  const quad = new FullScreenQuad(MEDIA);

  const camera = op.camera;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
  const sois = prepararCena(op.cena, op.mapaSombra);

  // Estado do renderer do editor: devolvido no fim.
  const antes = {
    alvo: gl.getRenderTarget(),
    sombra: gl.shadowMap.enabled,
    tipoSombra: gl.shadowMap.type,
    autoClear: gl.autoClear,
  };
  gl.shadowMap.enabled = true;
  gl.shadowMap.type = THREE.PCFShadowMap;
  gl.shadowMap.needsUpdate = true;

  const esperar = () => new Promise<void>((ok) => requestAnimationFrame(() => ok()));
  const dir = new THREE.Vector3();
  const u = new THREE.Vector3();
  const v = new THREE.Vector3();

  try {
    op.aoProgresso?.(0, 'preparando');
    gl.setRenderTarget(antes.alvo);
    await esperar();
    for (let i = 0; i < op.passadas; i++) {
      if (op.sinal?.aborted) throw new DOMException('Render cancelado', 'AbortError');
      // Câmera: deslocamento de subpixel (anti-serrilhado por acúmulo).
      const jx = halton(i + 1, 2) - 0.5;
      const jy = halton(i + 1, 3) - 0.5;
      camera.setViewOffset(w, h, jx, jy, w, h);
      // Sol: ponto num disco perpendicular à direção da luz (luz de área, sombra macia).
      const a = halton(i + 1, 5) * Math.PI * 2;
      const r = Math.sqrt(halton(i + 1, 7)) * RAIO_LUZ;
      for (const { luz, base } of sois) {
        dir.subVectors(base, luz.target.position).normalize();
        u.set(0, 1, 0).cross(dir).normalize();
        if (u.lengthSq() < 1e-4) u.set(1, 0, 0);
        v.crossVectors(dir, u).normalize();
        luz.position.copy(base).addScaledVector(u, Math.cos(a) * r).addScaledVector(v, Math.sin(a) * r);
        luz.updateMatrixWorld();
      }
      gl.shadowMap.needsUpdate = true;
      gl.setRenderTarget(quadro);
      gl.clear();
      gl.render(op.cena, camera);

      // Média corrida: acum2 = mix(acum, quadro, 1/(i+1)).
      MEDIA.uniforms.quadro.value = quadro.texture;
      MEDIA.uniforms.anterior.value = acum.texture;
      MEDIA.uniforms.peso.value = 1 / (i + 1);
      gl.setRenderTarget(acum2);
      quad.render(gl);
      [acum, acum2] = [acum2, acum];

      op.aoProgresso?.((i + 1) / op.passadas, 'calculando');
      // Um respiro a cada poucas passadas: a página continua respondendo.
      if (i % 3 === 2) {
        // Devolve o alvo ao editor antes da pausa: ele desenha a própria cena nesse intervalo.
        gl.setRenderTarget(antes.alvo);
        await esperar();
      }
    }

    // Saída: tom (AgX, igual ao editor) e sRGB, num canvas 2D.
    const final = new THREE.WebGLRenderTarget(w, h, { type: THREE.UnsignedByteType });
    quad.material = SAIDA;
    SAIDA.uniforms.mapa.value = acum.texture;
    gl.setRenderTarget(final);
    quad.render(gl);
    const pixels = new Uint8Array(w * h * 4);
    gl.readRenderTargetPixels(final, 0, 0, w, h, pixels);
    final.dispose();

    const saida = document.createElement('canvas');
    saida.width = w;
    saida.height = h;
    const ctx = saida.getContext('2d');
    if (ctx) {
      const img = ctx.createImageData(w, h);
      // WebGL lê de baixo para cima: inverte as linhas.
      for (let y = 0; y < h; y++) img.data.set(pixels.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4);
      ctx.putImageData(img, 0, 0);
    }
    return saida;
  } finally {
    quad.material = MEDIA;
    quad.dispose();
    quadro.dispose();
    acum.dispose();
    acum2.dispose();
    sois.forEach(({ luz }) => luz.shadow.map?.dispose());
    gl.setRenderTarget(antes.alvo);
    gl.shadowMap.enabled = antes.sombra;
    gl.shadowMap.type = antes.tipoSombra;
    gl.shadowMap.needsUpdate = true;
    gl.autoClear = antes.autoClear;
  }
}
