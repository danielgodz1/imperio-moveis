import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { FASES, RECORTE_FOTO, larguraPainel, useHeroScrollStore } from './useHeroScrollStore';
import { criarMateriais } from './heroMateriais';
import { CAMERA_FOTO, PESO_ETAPAS, construirCozinha } from './heroModelo';
import { perfilQualidade, type PerfilQualidade } from '../../vitrine/aparelho';
import { GuardaQuadros } from '../../vitrine/GuardaQuadros';

const PRETO = new THREE.Color('#0A0A0A');
const ESTUDIO = new THREE.Color('#D3CEC4');
const NEAR = 0.1;
const FAR = 80;

const frenteFoto = new THREE.Vector3(-Math.sin(CAMERA_FOTO.guinada), 0, -Math.cos(CAMERA_FOTO.guinada));
const [FX, FY, FZ] = CAMERA_FOTO.posicao;

/** Janela de projeção igual ao recorte object-cover da foto no tamanho atual. */
function janelaFoto(aspecto: number) {
  const { esquerda, direita, topo, base, aspecto: af } = CAMERA_FOTO;
  const altura = topo - base;
  const largura = direita - esquerda;
  if (aspecto > af) {
    const visivel = af / aspecto;
    const t = topo - altura * (1 - visivel) * RECORTE_FOTO.y;
    return { l: esquerda, r: direita, t, b: t - altura * visivel };
  }
  const visivel = aspecto / af;
  const l = esquerda + largura * (1 - visivel) * RECORTE_FOTO.x;
  return { l, r: l + largura * visivel, t: topo, b: base };
}

function NarrativaCena({ mobile, perfil }: { mobile: boolean; perfil: PerfilQualidade }) {
  const sombras = perfil.sombras;
  const { camera, invalidate, scene, gl, size } = useThree();
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const sizeRef = useRef(size);
  sizeRef.current = size;

  const recursos = useMemo(() => {
    const frente = { value: 0 };
    const { materiais, texturas } = criarMateriais(mobile, frente);
    const modelo = construirCozinha(mobile, materiais, texturas, { sombras: perfil.sombras, bisel: perfil.bisel });
    return { frente, materiais, texturas, modelo };
  }, [mobile, perfil]);

  const luzes = useMemo(
    () => ({
      led1: new THREE.PointLight('#FFB46B', 0, 2.4, 1.6),
      led2: new THREE.PointLight('#FFB46B', 0, 2.4, 1.6),
    }),
    []
  );

  // Câmera descrita só por números que a timeline interpola.
  const cam = useRef({
    px: 2.5, py: 15, pz: 2.45,
    tx: 2.5, ty: 0, tz: 2.45,
    fov: 28, cimaY: 0, encaixe: 0,
  });

  useLayoutEffect(() => {
    const { modelo, frente } = recursos;
    const c = cam.current;

    const pmrem = new THREE.PMREMGenerator(gl);
    const ambiente = new RoomEnvironment();
    const envRT = pmrem.fromScene(ambiente, 0.04);
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.55;
    ambiente.traverse((o) => {
      const malha = o as THREE.Mesh;
      if (malha.isMesh) {
        malha.geometry.dispose();
        (malha.material as THREE.Material).dispose();
      }
    });
    pmrem.dispose();

    const fundo = PRETO.clone();
    scene.background = fundo;

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none', lazy: false } });
    const animar = (aplicar: (v: number) => void, dur: number, pos: number, ease = 'none') => {
      const estado = { valor: 0 };
      tl.to(estado, { valor: 1, duration: dur, ease, onUpdate: () => aplicar(estado.valor) }, pos);
    };

    // ---- FASE 1: O TRAÇO -------------------------------------------------
    const f1 = FASES.traco;
    animar(modelo.desenharPlanta, (f1.fim - f1.inicio) * 0.94, f1.inicio + 0.004);
    tl.to(c, { py: 13.6, duration: f1.fim - f1.inicio, ease: 'sine.inOut' }, f1.inicio);

    // ---- FASE 2: PROFUNDIDADE -------------------------------------------
    const f2 = FASES.profundidade;
    const d2 = f2.fim - f2.inicio;
    const estadoFundo = { v: 0 };
    tl.to(estadoFundo, {
      v: 1,
      duration: d2 * 0.55,
      onUpdate: () => fundo.lerpColors(PRETO, ESTUDIO, estadoFundo.v),
    }, f2.inicio);
    animar(modelo.assentarPiso, d2 * 0.55, f2.inicio);
    modelo.paredes.forEach((aplicar, i) => {
      animar(aplicar, d2 * 0.42, f2.inicio + d2 * (0.3 + i * 0.07), 'power2.out');
    });
    animar(modelo.revelarVao, 0.001, f2.fim - 0.002);
    animar(modelo.apagarPlanta, d2 * 0.4, f2.inicio + d2 * 0.6);
    tl.to(c, { cimaY: 1, duration: d2 * 0.6, ease: 'sine.inOut' }, f2.inicio);
    tl.to(c, { px: 7.5, py: 3.3, pz: 7.2, fov: 30, duration: d2, ease: 'power2.inOut' }, f2.inicio);
    tl.to(c, { tx: 2.0, ty: 1.2, tz: 1.1, duration: d2, ease: 'power2.inOut' }, f2.inicio);

    // ---- FASE 3: CONSTRUÇÃO ---------------------------------------------
    const f3 = FASES.construcao;
    const d3 = f3.fim - f3.inicio;
    let inicioEtapa = f3.inicio + d3 * 0.01;
    PESO_ETAPAS.forEach((peso, i) => {
      const etapa = i + 1;
      const janela = d3 * 0.98 * peso;
      const lista = modelo.pecas.filter((p) => p.etapa === etapa);
      const extra = modelo.oclusoes.filter((p) => p.etapa === etapa);
      const durPeca = Math.min(janela, Math.max(0.014, (janela / Math.max(1, lista.length)) * 3));
      const passo = lista.length > 1 ? (janela - durPeca) / (lista.length - 1) : 0;
      lista.forEach((p, k) => animar(p.aplicar, durPeca, inicioEtapa + k * passo, 'power3.out'));
      extra.forEach((p) => animar(p.aplicar, janela, inicioEtapa));
      inicioEtapa += janela;
    });
    tl.to(c, { px: 6.5, py: 2.55, pz: 6.5, duration: d3, ease: 'sine.inOut' }, f3.inicio);
    tl.to(c, { tx: 1.75, ty: 1.2, tz: 1.0, duration: d3, ease: 'sine.inOut' }, f3.inicio);

    // ---- FASE 4: ACABAMENTO ---------------------------------------------
    const f4 = FASES.acabamento;
    const d4 = f4.fim - f4.inicio;
    animar((v) => (modelo.internos.visible = v < 0.5), 0.001, f4.inicio);
    animar(modelo.descerForro, d4 * 0.3, f4.inicio, 'power2.out');
    tl.to(frente, { value: 1, duration: d4 * 0.62, ease: 'sine.inOut' }, f4.inicio + d4 * 0.08);
    animar(
      (v) => {
        modelo.acenderLed(v);
        luzes.led1.intensity = v * 0.25;
        luzes.led2.intensity = v * 0.25;
      },
      d4 * 0.3,
      f4.inicio + d4 * 0.62,
      'power2.in'
    );
    const e4 = 'power2.inOut';
    tl.to(c, { px: FX, py: FY, pz: FZ, duration: d4, ease: e4 }, f4.inicio);
    tl.to(c, { tx: FX + frenteFoto.x, ty: FY, tz: FZ + frenteFoto.z, duration: d4, ease: e4 }, f4.inicio);
    tl.to(c, { encaixe: 1, duration: d4, ease: e4 }, f4.inicio);

    // ---- FASE 5: OBRA REAL é o crossfade DOM; a câmera já está estável ---
    tl.set({}, {}, 1);

    // Shaders e texturas sobem antes do scroll: nenhuma peça nova trava a rolagem.
    Object.values(recursos.texturas).forEach((tex) => gl.initTexture(tex));
    void gl.compileAsync(scene, camera);

    tlRef.current = tl;
    tl.progress(useHeroScrollStore.getState().progress);
    invalidate();

    const cancelar = useHeroScrollStore.subscribe(() => invalidate());
    return () => {
      cancelar();
      tl.kill();
      tlRef.current = null;
      scene.environment = null;
      scene.background = null;
      envRT.dispose();
    };
  }, [recursos, luzes, gl, scene, camera, invalidate]);

  useFrame(() => {
    const tl = tlRef.current;
    if (!tl) return;
    const p = useHeroScrollStore.getState().progress;
    if (Math.abs(tl.progress() - p) > 0.00001) tl.progress(p);

    const c = cam.current;
    const { width, height } = sizeRef.current;
    const aspecto = width / height;
    const painel = larguraPainel(width) / width;
    const aspectoLivre = aspecto * (1 - painel);

    // A distância compensa telas estreitas; some quando a câmera encaixa na foto.
    const afastar = Math.max(1, 1.28 / aspectoLivre);
    const fator = 1 + (afastar - 1) * (1 - c.encaixe);
    camera.position.set(
      c.tx + (c.px - c.tx) * fator,
      c.ty + (c.py - c.ty) * fator,
      c.tz + (c.pz - c.tz) * fator
    );
    camera.up.set(0, c.cimaY, -(1 - c.cimaY)).normalize();
    camera.lookAt(c.tx, c.ty, c.tz);
    camera.updateMatrixWorld();

    // Projeção: quadro da narrativa (deslocado para fora do painel) -> recorte da foto.
    const t = Math.tan(THREE.MathUtils.degToRad(c.fov / 2));
    const meia = t * aspecto;
    const narr = { l: -meia * (1 + painel), r: meia * (1 - painel), t, b: -t };
    const foto = janelaFoto(aspecto);
    const e = c.encaixe;
    camera.projectionMatrix.makePerspective(
      NEAR * THREE.MathUtils.lerp(narr.l, foto.l, e),
      NEAR * THREE.MathUtils.lerp(narr.r, foto.r, e),
      NEAR * THREE.MathUtils.lerp(narr.t, foto.t, e),
      NEAR * THREE.MathUtils.lerp(narr.b, foto.b, e),
      NEAR,
      FAR,
      camera.coordinateSystem
    );
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  });

  useEffect(
    () => () => {
      const { modelo, materiais, texturas } = recursos;
      modelo.geometrias.forEach((g) => g.dispose());
      modelo.materiaisAvulsos.forEach((mat) => mat.dispose());
      Object.values(materiais).forEach((mat) => mat.dispose());
      Object.values(texturas).forEach((tex) => tex.dispose());
    },
    [recursos]
  );

  return (
    <>
      <ambientLight intensity={0.14} color="#FFF8EE" />
      <hemisphereLight args={['#FFFFFF', '#9A917F', 0.4]} />
      {/* Luz principal alta e de lado: dá relevo às frentes e faz o armário aéreo sombrear o balcão. */}
      <directionalLight
        position={[-1.5, 7.5, 6.5]}
        intensity={1.95}
        color="#FFF1DC"
        castShadow={sombras}
        shadow-mapSize-width={perfil.mapaSombra || 1024}
        shadow-mapSize-height={perfil.mapaSombra || 1024}
        shadow-camera-left={-4.4}
        shadow-camera-right={4.4}
        shadow-camera-top={4.4}
        shadow-camera-bottom={-4.4}
        shadow-camera-near={1}
        shadow-camera-far={18}
        shadow-bias={-0.0004}
        shadow-normalBias={0.018}
      />
      {/* Contraluz frio do lado oposto: separa os móveis brancos da parede. */}
      <directionalLight position={[8, 3.5, 2]} intensity={0.42} color="#EDEFF2" />
      {!mobile && <primitive object={luzes.led1} position={[0.85, 1.5, 0.34]} />}
      {!mobile && <primitive object={luzes.led2} position={[2.05, 1.5, 0.34]} />}
      <primitive object={recursos.modelo.raiz} />
    </>
  );
}

/** Canvas único da narrativa. O R3F só desenha quando o progress muda. */
export const HeroScrollCena: React.FC<{ onLento?: () => void }> = ({ onLento }) => {
  const perfil = useMemo(() => perfilQualidade(), []);
  const mobile = perfil.leve;

  return (
    <Canvas
      frameloop="demand"
      dpr={perfil.dpr}
      shadows={perfil.sombras ? { type: THREE.PCFSoftShadowMap } : false}
      camera={{ position: [2.5, 15, 2.45], fov: 28, near: NEAR, far: FAR }}
      gl={{
        antialias: perfil.antialias,
        powerPreference: 'high-performance',
        toneMapping: THREE.NeutralToneMapping,
        toneMappingExposure: 0.94,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      className="w-full h-full block"
      aria-hidden="true"
    >
      <GuardaQuadros onLento={onLento} />
      <NarrativaCena mobile={mobile} perfil={perfil} />
    </Canvas>
  );
};
