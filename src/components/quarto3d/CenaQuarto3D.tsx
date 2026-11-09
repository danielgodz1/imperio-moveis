import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { QuartoLayout } from './schema';
import { CENARIOS_AMBIENTES } from '../../data/cenarios';
import { Kit3D, criarKit3D } from './materiais3D';
import { MOVEIS } from './moveis3D';
import { Instancia, caixasModulo, moverPara, poseModulo } from './motorGeometrico';

export type VistaCamera = 'perspectiva' | 'planta' | 'frente';

interface CenaQuarto3DProps {
  layout: QuartoLayout;
  selecionado: string | null;
  conflitos: Map<string, string>;
  vista: VistaCamera;
  /** Muda a cada clique na vista, mesmo repetindo a mesma. */
  pedidoVista: number;
  onSelecionar: (uid: string | null) => void;
  onMover: (inst: Instancia) => void;
  onMoverFim: () => void;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

type Controles = {
  enabled: boolean;
  target: THREE.Vector3;
  update: () => void;
};

const ESPESSURA = 0.1;
const OURO = '#D4A84F';
const ALERTA = '#E0523F';

function posicaoVista(layout: QuartoLayout, vista: VistaCamera, aspecto = 1.2): [number, number, number] {
  // Telas em pé pedem mais distância para o ambiente caber na largura.
  const recuo = Math.max(1, 1.15 / aspecto);
  const { largura_m: W, profundidade_m: D, pe_direito_m: H } = layout.dimensoes;
  if (vista === 'planta') return [0, Math.max(W, D) * 1.95 * recuo, 0.01];
  if (vista === 'frente') return [0, H * 0.58, D / 2 + Math.max(W, D) * 1.4 * recuo];
  return [-W * 0.2, H * 1.42 * recuo, D / 2 + Math.max(W, D) * 1.32 * recuo];
}

function Camera({ layout, vista, pedidoVista }: Pick<CenaQuarto3DProps, 'layout' | 'vista' | 'pedidoVista'>) {
  const { camera, controls, invalidate, size } = useThree();
  const aspecto = size.width / size.height;
  const { comodo } = layout;
  const { largura_m, profundidade_m, pe_direito_m } = layout.dimensoes;

  useEffect(() => {
    const p = posicaoVista(layout, vista, aspecto);
    camera.position.set(p[0], p[1], p[2]);
    const c = controls as unknown as Controles | null;
    if (c) {
      c.target.set(0, vista === 'planta' ? 0 : pe_direito_m * 0.42, 0);
      c.update();
    }
    invalidate();
    // A câmera só volta ao enquadramento ao trocar ambiente, medida ou vista.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comodo, largura_m, profundidade_m, pe_direito_m, vista, pedidoVista, aspecto, camera, controls, invalidate]);

  return null;
}

/** Contorno das peças: dourado na selecionada, vermelho quando há conflito. */
function Contorno({ inst, dim, cor }: { inst: Instancia; dim: QuartoLayout['dimensoes']; cor: string }) {
  const geo = useMemo(() => {
    const pts: number[] = [];
    caixasModulo(inst, dim).forEach((c) => {
      const box = new THREE.Box3(new THREE.Vector3(c.minX, c.minY, c.minZ), new THREE.Vector3(c.maxX, c.maxY, c.maxZ));
      const g = new THREE.EdgesGeometry(new THREE.BoxGeometry(...box.getSize(new THREE.Vector3()).toArray()));
      g.translate(...box.getCenter(new THREE.Vector3()).toArray());
      pts.push(...(g.attributes.position.array as Float32Array));
      g.dispose();
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [inst, dim]);

  useEffect(() => () => geo.dispose(), [geo]);

  return (
    <lineSegments geometry={geo} renderOrder={5}>
      <lineBasicMaterial color={cor} depthTest={false} transparent toneMapped={false} />
    </lineSegments>
  );
}

function Paredes({ layout, k, refs }: { layout: QuartoLayout; k: Kit3D; refs: React.MutableRefObject<Record<string, THREE.Object3D | null>> }) {
  const { largura_m: W, profundidade_m: D, pe_direito_m: H } = layout.dimensoes;
  const cenario = CENARIOS_AMBIENTES[layout.comodo];
  const destaque = useMemo(() => {
    const mat = k.m.parede.clone();
    mat.map = null;
    return mat;
  }, [k]);
  useEffect(() => {
    destaque.color.copy(k.corParede(layout.corParede ?? 'gelo'));
    return undefined;
  }, [destaque, k, layout.corParede]);
  useEffect(() => () => destaque.dispose(), [destaque]);

  const sombra = !k.mobile;
  const paredes: Array<{ id: 'N' | 'S' | 'L' | 'O'; pos: [number, number, number]; rot: number; len: number }> = [
    { id: 'N', pos: [0, H / 2, -D / 2 - ESPESSURA / 2], rot: 0, len: W + ESPESSURA * 2 },
    { id: 'S', pos: [0, H / 2, D / 2 + ESPESSURA / 2], rot: Math.PI, len: W + ESPESSURA * 2 },
    { id: 'O', pos: [-W / 2 - ESPESSURA / 2, H / 2, 0], rot: Math.PI / 2, len: D },
    { id: 'L', pos: [W / 2 + ESPESSURA / 2, H / 2, 0], rot: -Math.PI / 2, len: D },
  ];
  const ledLigado = layout.led;

  return (
    <>
      {paredes.map((p) => {
        const aberturas = layout.aberturas.filter((a) => a.parede === p.id);
        return (
          <group
            key={p.id}
            ref={(g) => {
              refs.current[p.id] = g;
            }}
            position={p.pos}
            rotation={[0, p.rot, 0]}
          >
            <mesh
              geometry={k.caixa(p.len, H, ESPESSURA, 'x')}
              material={p.id === cenario.paredeDestaque ? destaque : k.m.parede}
              receiveShadow={sombra}
            />
            <mesh geometry={k.caixa(p.len - 0.2, 0.09, 0.016, 'x')} material={k.m.rodape} position={[0, -H / 2 + 0.045, ESPESSURA / 2 + 0.008]} />
            <mesh geometry={k.caixa(p.len - 0.2, 0.012, 0.03, 'x')} material={ledLigado ? k.m.ledLigado : k.m.ledDesligado} position={[0, H / 2 - 0.03, ESPESSURA / 2 + 0.03]} />
            {ledLigado && (
              <mesh geometry={k.plano(p.len - 0.2, 0.9)} material={k.m.brilho} position={[0, H / 2 - 0.48, ESPESSURA / 2 + 0.004]} />
            )}
            {aberturas.map((ab, i) => {
              const janela = ab.tipo === 'janela';
              const larg = Math.min(ab.largura_m, p.len * 0.6);
              const alt = janela ? 1.15 : 2.1;
              const y = (janela ? 1.48 : alt / 2) - H / 2;
              const x = p.id === 'S' || p.id === 'L' ? -ab.posicaoOffset_m : ab.posicaoOffset_m;
              const xLocal = p.id === 'O' ? -ab.posicaoOffset_m : x;
              return (
                <group key={i} position={[xLocal, y, ESPESSURA / 2 + 0.012]}>
                  <mesh geometry={k.caixa(larg + 0.1, alt + 0.1, 0.024, 'x')} material={janela ? k.m.esquadria : k.acabamento('freijo-ripado')} />
                  <mesh position={[0, 0, 0.014]}>
                    <boxGeometry args={[larg, alt, 0.004]} />
                    {janela ? (
                      <meshBasicMaterial color={layout.noite ? '#1C2733' : '#E8F1F5'} toneMapped={false} />
                    ) : (
                      <primitive object={k.acabamento('freijo-ripado')} attach="material" />
                    )}
                  </mesh>
                  {janela && <mesh geometry={k.caixa(0.03, alt, 0.03, 'y')} material={k.m.esquadria} position={[0, 0, 0.02]} />}
                  {!janela && <mesh geometry={k.caixa(0.1, 0.018, 0.04, 'x')} material={k.m.cromo} position={[larg / 2 - 0.1, 0, 0.03]} />}
                </group>
              );
            })}
          </group>
        );
      })}
    </>
  );
}

function Ambiente({
  layout,
  k,
  selecionado,
  conflitos,
  onSelecionar,
  onMover,
  onMoverFim,
}: Omit<CenaQuarto3DProps, 'onCanvasReady' | 'vista' | 'pedidoVista'> & { k: Kit3D }) {
  const { camera, gl, controls, invalidate, scene } = useThree();
  const dim = layout.dimensoes;
  const { largura_m: W, profundidade_m: D, pe_direito_m: H } = dim;
  const refsParedes = useRef<Record<string, THREE.Object3D | null>>({});
  const refsGrupos = useRef<Record<string, THREE.Object3D | null>>({});
  const modulos = layout.modulos as Instancia[];
  const modulosRef = useRef(modulos);
  modulosRef.current = modulos;
  const noite = !!layout.noite;

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const sala = new RoomEnvironment();
    const rt = pmrem.fromScene(sala, 0.04);
    scene.environment = rt.texture;
    sala.traverse((o) => {
      const malha = o as THREE.Mesh;
      if (malha.isMesh) {
        malha.geometry.dispose();
        (malha.material as THREE.Material).dispose();
      }
    });
    pmrem.dispose();
    invalidate();
    return () => {
      scene.environment = null;
      rt.dispose();
    };
  }, [gl, scene, invalidate]);

  useEffect(() => {
    scene.environmentIntensity = noite ? 0.14 : 0.42;
    k.m.brilho.opacity = noite ? 0.55 : 0.14;
    invalidate();
  }, [noite, scene, invalidate, k]);

  // A parede entre a câmera e o ambiente some, junto com os móveis presos nela.
  const dir = useMemo(() => new THREE.Vector3(), []);
  useFrame(() => {
    dir.copy(camera.position);
    const ocultas: Record<string, boolean> = {
      N: dir.z < -D / 2,
      S: dir.z > D / 2,
      O: dir.x < -W / 2,
      L: dir.x > W / 2,
    };
    Object.entries(refsParedes.current).forEach(([id, g]) => {
      if (g) g.visible = !ocultas[id];
    });
    modulosRef.current.forEach((m) => {
      const g = refsGrupos.current[m.uid];
      if (g) g.visible = !(m.parede !== 'centro' && ocultas[m.parede]);
    });
  });

  // Arrasto: só a peça já selecionada se move; o resto do gesto gira a câmera.
  const arrasto = useRef<{ uid: string; plano: THREE.Plane; dx: number; dz: number } | null>(null);
  const raio = useMemo(() => new THREE.Raycaster(), []);
  const ponto = useMemo(() => new THREE.Vector3(), []);

  const projetar = (x: number, y: number, plano: THREE.Plane) => {
    const r = gl.domElement.getBoundingClientRect();
    raio.setFromCamera(new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1), camera);
    return raio.ray.intersectPlane(plano, ponto);
  };

  const iniciarArrasto = (e: ThreeEvent<PointerEvent>, m: Instancia) => {
    if (m.uid !== selecionado) return;
    e.stopPropagation();
    const pose = poseModulo(m, dim);
    const plano = new THREE.Plane(new THREE.Vector3(0, 1, 0), -(pose.posicao[1] + m.altura_m / 2));
    const p = projetar(e.nativeEvent.clientX, e.nativeEvent.clientY, plano);
    if (!p) return;
    arrasto.current = { uid: m.uid, plano, dx: pose.posicao[0] - p.x, dz: pose.posicao[2] - p.z };
    const c = controls as unknown as Controles | null;
    if (c) c.enabled = false;

    const mover = (ev: PointerEvent) => {
      const a = arrasto.current;
      if (!a) return;
      const q = projetar(ev.clientX, ev.clientY, a.plano);
      const atual = modulosRef.current.find((i) => i.uid === a.uid);
      if (q && atual) onMover(moverPara(atual, q.x + a.dx, q.z + a.dz, dim));
    };
    const soltar = () => {
      arrasto.current = null;
      if (c) c.enabled = true;
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', soltar);
      window.removeEventListener('pointercancel', soltar);
      onMoverFim();
    };
    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', soltar);
    window.addEventListener('pointercancel', soltar);
  };

  const sombra = !k.mobile;
  const pisoMat = k.pisos[layout.piso ?? 'madeira-clara'] ?? k.pisos['madeira-clara'];
  const brilhoNoite = layout.led ? 1 : 0.35;

  return (
    <group>
      <ambientLight intensity={noite ? 0.12 : 0.28} color="#FFF4E6" />
      <hemisphereLight args={[noite ? '#3A4250' : '#FFFFFF', noite ? '#2A2520' : '#B9AF9E', noite ? 0.32 : 0.55]} />
      <directionalLight
        position={[W * 0.2, H * 2.6, D * 1.5]}
        intensity={noite ? 0.12 : 1.15}
        color="#FFF6E8"
        castShadow={sombra}
        shadow-mapSize-width={1536}
        shadow-mapSize-height={1536}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-far={22}
        shadow-bias={-0.0006}
        shadow-radius={6}
      />
      <pointLight position={[0, H - 0.25, 0]} color="#FFC58E" intensity={(noite ? 4.2 : 0.35) * brilhoNoite} distance={8} decay={1.6} />
      <pointLight position={[-W * 0.28, H - 0.4, -D * 0.28]} color="#FFB46B" intensity={(noite ? 2.4 : 0.1) * brilhoNoite} distance={5} decay={1.8} />

      <mesh geometry={k.caixa(W + 0.2, ESPESSURA, D + 0.2, 'x')} material={k.m.laje} position={[0, -ESPESSURA / 2 - 0.012, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={sombra} material={pisoMat}>
        <bufferGeometry
          ref={(g: THREE.BufferGeometry | null) => {
            if (!g) return;
            const base = new THREE.PlaneGeometry(W, D);
            const uv = base.attributes.uv as THREE.BufferAttribute;
            for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * W, uv.getY(i) * D);
            g.setAttribute('position', base.attributes.position);
            g.setAttribute('normal', base.attributes.normal);
            g.setAttribute('uv', uv);
            g.setIndex(base.index);
            g.computeBoundingSphere();
          }}
        />
      </mesh>

      <Paredes layout={layout} k={k} refs={refsParedes} />

      {modulos.map((m) => {
        const Movel = MOVEIS[m.id];
        const pose = poseModulo(m, dim);
        return (
          <group
            key={m.uid}
            ref={(g) => {
              refsGrupos.current[m.uid] = g;
            }}
            position={pose.posicao}
            rotation={[0, pose.rotY, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onSelecionar(m.uid);
            }}
            onPointerDown={(e) => iniciarArrasto(e, m)}
            onPointerOver={() => {
              document.body.style.cursor = m.uid === selecionado ? 'grab' : 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = '';
            }}
          >
            <Movel
              w={m.largura_m}
              h={m.altura_m}
              d={m.profundidade_m}
              a={k.acabamento(m.acabamento)}
              k={k}
              led={layout.led}
              tampo={k.tampos[m.tampo ?? 'pedra-clara'] ?? k.tampos['pedra-clara']}
              dim={dim}
            />
          </group>
        );
      })}

      {modulos.map((m) => {
        const conflito = conflitos.has(m.uid);
        if (!conflito && m.uid !== selecionado) return null;
        return <Contorno key={`c-${m.uid}`} inst={m} dim={dim} cor={conflito ? ALERTA : OURO} />;
      })}
    </group>
  );
}

function Palco(props: CenaQuarto3DProps & { mobile: boolean }) {
  const { gl, invalidate } = useThree();
  const { mobile, onCanvasReady, ...resto } = props;
  const k = useMemo(() => criarKit3D(mobile), [mobile]);

  useEffect(() => () => k.dispose(), [k]);
  useEffect(() => {
    onCanvasReady?.(gl.domElement);
    invalidate();
  }, [gl, onCanvasReady, invalidate]);

  return (
    <>
      <Camera layout={props.layout} vista={props.vista} pedidoVista={props.pedidoVista} />
      <Ambiente {...resto} k={k} />
    </>
  );
}

export const CenaQuarto3D: React.FC<CenaQuarto3DProps> = (props) => {
  const mobile = useMemo(() => window.matchMedia('(max-width: 767px), (pointer: coarse)').matches, []);
  const posInicial = useMemo(() => posicaoVista(props.layout, 'perspectiva'), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Canvas
      gl={{
        preserveDrawingBuffer: true,
        antialias: !mobile,
        toneMapping: THREE.NeutralToneMapping,
        toneMappingExposure: 1,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      shadows={mobile ? false : { type: THREE.PCFShadowMap }}
      dpr={mobile ? [1, 1.5] : [1, 1.75]}
      frameloop="demand"
      camera={{ position: posInicial, fov: 36, near: 0.1, far: 60 }}
      className="w-full h-full block"
      onPointerMissed={() => props.onSelecionar(null)}
    >
      <color attach="background" args={[props.layout.noite ? '#0A0A0A' : '#1A1917']} />
      <Palco {...props} mobile={mobile} />
      <OrbitControls makeDefault enablePan={false} minPolarAngle={0.02} maxPolarAngle={Math.PI / 2 - 0.03} minDistance={2.2} maxDistance={14} />
    </Canvas>
  );
};
