import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { FASES, useHeroScrollStore } from './useHeroScrollStore';

// Dimensões do ambiente da Cozinha Gourmet (metros reais de projeto)
const COZINHA = {
  largura: 4.6, // X: [-2.3, 2.3]
  profundidade: 4.0, // Z: [-2.0, 2.0]
  alturaParedes: 2.8, // Y: [0, 2.8]
};

// Posição e dimensões da Ilha Central Gourmet (1.85m x 0.95m)
const ILHA = {
  largura: 1.85,
  profundidade: 0.95,
  altura: 0.9,
  posX: 0.12, // Ligeiramente à direita da linha central
  posY: 0.45,
  posZ: 0.28,
};

// =============================================================================
// GERADORES DE TEXTURAS PROCEDURAIS PBR (CanvasTexture de Alta Fidelidade)
// =============================================================================

/** Textura procedural de Madeira Freijó com veios orgânicos longitudinais */
function gerarTexturaFreijo(): any {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base amadeirada nobre e dourada
  ctx.fillStyle = '#9B6E41';
  ctx.fillRect(0, 0, 512, 512);

  // Veios longitudinais finos e variações de tom
  const numVeios = 140;
  for (let i = 0; i < numVeios; i++) {
    const y = (i / numVeios) * 512;
    const tomAlpha = 0.08 + Math.random() * 0.16;
    ctx.strokeStyle = Math.random() > 0.45
      ? `rgba(128, 88, 48, ${tomAlpha})`
      : `rgba(178, 134, 86, ${tomAlpha})`;
    ctx.lineWidth = 1 + Math.random() * 3.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 512; x += 16) {
      const ondulacao = Math.sin((x / 512) * Math.PI * 4 + i * 0.25) * (3.5 + Math.random() * 5.5);
      ctx.lineTo(x, y + ondulacao);
    }
    ctx.stroke();
  }

  // Micro-poros e textura de lixa fina
  ctx.fillStyle = 'rgba(75, 48, 25, 0.06)';
  for (let p = 0; p < 900; p++) {
    const px = Math.random() * 512;
    const py = Math.random() * 512;
    ctx.fillRect(px, py, 2 + Math.random() * 6, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Textura procedural de Granito Preto São Gabriel / Absoluto com grãos minerais */
function gerarTexturaGranitoPreto(): any {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base mineral grafite profunda
  ctx.fillStyle = '#1A1816';
  ctx.fillRect(0, 0, 512, 512);

  // Micro-pontos cristalinos de quartzo e feldspato
  for (let i = 0; i < 4200; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 1.6;
    const shade = Math.floor(34 + Math.random() * 45);
    const alpha = 0.22 + Math.random() * 0.42;
    ctx.fillStyle = `rgba(${shade}, ${shade - 2}, ${shade - 4}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cristais com brilho de mica
  for (let m = 0; m < 450; m++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = 'rgba(92, 88, 82, 0.6)';
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Textura procedural de Porcelanato Claro Acetinado com juntas de rejunte */
function gerarTexturaPorcelanatoPiso(): any {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Fundo porcelanato cinza claro acetinado
  ctx.fillStyle = '#E2DDD4';
  ctx.fillRect(0, 0, 512, 512);

  // Nuvens minerais marmorizadas suaves
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const rad = 50 + Math.random() * 90;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
    grad.addColorStop(0, 'rgba(244, 240, 234, 0.28)');
    grad.addColorStop(1, 'rgba(226, 221, 212, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }

  // Linhas sutis de rejunte perimetrais (junta seca de 1.5mm)
  ctx.strokeStyle = 'rgba(185, 178, 168, 0.45)';
  ctx.lineWidth = 2.0;
  ctx.strokeRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Textura de laca acetinada Verde-Sálvia para armários */
function gerarTexturaVerdeSalvia(): any {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#6D826F';
  ctx.fillRect(0, 0, 256, 256);

  for (let i = 0; i < 1800; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const alpha = 0.03 + Math.random() * 0.04;
    ctx.fillStyle = Math.random() > 0.5 ? `rgba(132, 154, 134, ${alpha})` : `rgba(88, 106, 90, ${alpha})`;
    ctx.fillRect(x, y, 1, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

interface ObjetoAnimavel3D {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  userData: Record<string, unknown>;
}

interface LuzAnimavel3D {
  intensity: number;
}

/**
 * Cena Three.js da Cozinha Gourmet em verde-sálvia, ripado de freijó e granito preto.
 * Orquestrada por uma única timeline GSAP sincronizada com o scroll.
 */
function NarrativaCena() {
  const { camera, invalidate, scene } = useThree();
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Vetor dinâmico que a câmera segue com lookAt dentro do useFrame
  const alvoCamera = useRef({ x: 0, y: 0, z: 0 });

  // Refs de agrupamento para cada fase
  const paredesGroupRef = useRef<ObjetoAnimavel3D | null>(null);
  const pisoMeshRef = useRef<ObjetoAnimavel3D | null>(null);

  // Luzes LED sob armários e pendentes
  const ledIlhaRef = useRef<LuzAnimavel3D | null>(null);
  const ledBancadaRef = useRef<LuzAnimavel3D | null>(null);
  const ledCristaleiraRef = useRef<LuzAnimavel3D | null>(null);

  // Lista de grupos da Fase 1 (traços da planta 2D)
  const linhasGrupos = useRef<ObjetoAnimavel3D[]>([]);

  // Lista de peças individuais da Fase 3 (montagem da marcenaria)
  const pecasMeshes = useRef<ObjetoAnimavel3D[]>([]);

  // Materiais PBR procedurais memorizados
  const texturas = useMemo(() => {
    return {
      freijo: gerarTexturaFreijo(),
      granito: gerarTexturaGranitoPreto(),
      piso: gerarTexturaPorcelanatoPiso(),
      verdeSalvia: gerarTexturaVerdeSalvia(),
    };
  }, []);

  const materiaisPBR = useMemo(() => {
    return {
      verdeSalvia: new THREE.MeshStandardMaterial({
        map: texturas.verdeSalvia,
        color: '#6D826F',
        roughness: 0.5,
        metalness: 0.05,
      }),
      freijo: new THREE.MeshStandardMaterial({
        map: texturas.freijo,
        color: '#9C6F42',
        roughness: 0.44,
        metalness: 0.04,
      }),
      granito: new THREE.MeshStandardMaterial({
        map: texturas.granito,
        color: '#1A1816',
        roughness: 0.16,
        metalness: 0.16,
      }),
      piso: new THREE.MeshStandardMaterial({
        map: texturas.piso,
        color: '#E2DDD4',
        roughness: 0.38,
        metalness: 0.06,
      }),
      parede: new THREE.MeshStandardMaterial({
        color: '#F4EFEB',
        roughness: 0.92,
        metalness: 0.01,
      }),
      teto: new THREE.MeshStandardMaterial({
        color: '#FAF8F5',
        roughness: 0.95,
      }),
      ouro: new THREE.MeshStandardMaterial({
        color: '#C9A04E',
        metalness: 0.86,
        roughness: 0.22,
      }),
      ouroPlanta: new THREE.MeshBasicMaterial({
        color: '#D4A84F',
      }),
      vidroReflecta: new THREE.MeshStandardMaterial({
        color: '#241E1A',
        roughness: 0.18,
        metalness: 0.45,
        transparent: true,
        opacity: 0.85,
      }),
      inox: new THREE.MeshStandardMaterial({
        color: '#D5D5D5',
        metalness: 0.88,
        roughness: 0.18,
      }),
      pretoFornos: new THREE.MeshStandardMaterial({
        color: '#151515',
        metalness: 0.85,
        roughness: 0.25,
      }),
    };
  }, [texturas]);

  const registrarLinha = (grupo: unknown) => {
    const g = grupo as ObjetoAnimavel3D | null;
    if (g && !linhasGrupos.current.includes(g)) {
      linhasGrupos.current.push(g);
    }
  };

  const registrarPeca = (
    mesh: unknown,
    finalPos: [number, number, number],
    origemOffset: [number, number, number]
  ) => {
    const m = mesh as ObjetoAnimavel3D | null;
    if (m && !pecasMeshes.current.includes(m)) {
      m.userData.finalPos = { x: finalPos[0], y: finalPos[1], z: finalPos[2] };
      m.userData.origemOffset = {
        x: origemOffset[0],
        y: origemOffset[1],
        z: origemOffset[2],
      };
      pecasMeshes.current.push(m);
    }
  };

  const criarRefPeca =
    (
      finalPos: [number, number, number],
      origemOffset: [number, number, number]
    ) =>
    (mesh: unknown) => {
      registrarPeca(mesh, finalPos, origemOffset);
    };

  // Construção da Timeline única de GSAP com duração total = 1.0
  useLayoutEffect(() => {
    const tl = gsap.timeline({
      paused: true,
      defaults: { ease: 'none' },
    });

    // -------------------------------------------------------------------------
    // FASE 1: O TRAÇO 2D DA COZINHA EM L + ILHA CENTRAL (0.00 -> 0.20)
    // Câmera zenital (90°), linhas se desenham em scale.x com âncora inicial.
    // -------------------------------------------------------------------------
    const { inicio: f1Inicio, fim: f1Fim } = FASES.traco;
    const durF1 = f1Fim - f1Inicio;
    const totalLinhas = Math.max(1, linhasGrupos.current.length);
    const passoLinha = durF1 / totalLinhas;

    // Configuração inicial obrigatória: topo absoluto, sem inclinação
    camera.position.set(0, 8.5, 0.001);
    alvoCamera.current = { x: 0, y: 0, z: 0 };

    linhasGrupos.current.forEach((g, idx) => {
      tl.fromTo(
        g.scale,
        { x: 0.0001 },
        { x: 1, duration: passoLinha, ease: 'power1.inOut' },
        f1Inicio + idx * passoLinha
      );
    });

    // -------------------------------------------------------------------------
    // FASE 2: PROFUNDIDADE & ALVENARIA (0.20 -> 0.40)
    // Piso se revela, paredes claras sobem e câmera desce para perspectiva 3/4.
    // -------------------------------------------------------------------------
    const { inicio: f2Inicio, fim: f2Fim } = FASES.profundidade;
    const durF2 = f2Fim - f2Inicio;

    if (pisoMeshRef.current) {
      tl.fromTo(
        pisoMeshRef.current.scale,
        { x: 0.0001, z: 0.0001 },
        { x: 1, z: 1, duration: durF2 * 0.7, ease: 'power2.out' },
        f2Inicio
      );
    }

    if (paredesGroupRef.current) {
      tl.fromTo(
        paredesGroupRef.current.scale,
        { y: 0.0001 },
        { y: 1, duration: durF2, ease: 'power2.out' },
        f2Inicio
      );
    }

    // Câmera desce suavemente de cima para perspectiva arquitetônica 3/4
    tl.to(
      camera.position,
      {
        x: 3.2,
        y: 3.6,
        z: 4.4,
        duration: durF2,
        ease: 'power2.inOut',
      },
      f2Inicio
    );
    tl.to(
      alvoCamera.current,
      {
        x: 0,
        y: 0.9,
        z: -0.15,
        duration: durF2,
        ease: 'power2.inOut',
      },
      f2Inicio
    );

    // -------------------------------------------------------------------------
    // FASE 3: MONTAGEM MILIMÉTRICA DA MARCENARIA (0.40 -> 0.70)
    // Cada módulo chega e se encaixa em ordem lógica de marcenaria.
    // -------------------------------------------------------------------------
    const { inicio: f3Inicio, fim: f3Fim } = FASES.construcao;
    const durF3 = f3Fim - f3Inicio;
    const totalPecas = Math.max(1, pecasMeshes.current.length);
    const passoPeca = durF3 / totalPecas;

    pecasMeshes.current.forEach((peca, idx) => {
      const finalPos = peca.userData.finalPos as { x: number; y: number; z: number };
      const offset = peca.userData.origemOffset as { x: number; y: number; z: number };
      const startPos = {
        x: finalPos.x + offset.x,
        y: finalPos.y + offset.y,
        z: finalPos.z + offset.z,
      };

      tl.fromTo(
        peca.position,
        startPos,
        {
          x: finalPos.x,
          y: finalPos.y,
          z: finalPos.z,
          duration: passoPeca * 1.35,
          ease: 'power2.out',
        },
        f3Inicio + idx * passoPeca
      );

      // Leve rotação de encaixe nas portas e painéis
      if (Math.abs(offset.y) > 0.4 || Math.abs(offset.x) > 1.0) {
        tl.fromTo(
          peca.rotation,
          { y: 0.08 },
          { y: 0, duration: passoPeca * 1.35, ease: 'power2.out' },
          f3Inicio + idx * passoPeca
        );
      }
    });

    // Câmera acompanha o encaixe da marcenaria em Verde-Sálvia e do ripado
    tl.to(
      camera.position,
      {
        x: 1.8,
        y: 2.1,
        z: 3.5,
        duration: durF3,
        ease: 'power1.inOut',
      },
      f3Inicio
    );
    tl.to(
      alvoCamera.current,
      {
        x: ILHA.posX,
        y: ILHA.posY + 0.1,
        z: ILHA.posZ,
        duration: durF3,
        ease: 'power1.inOut',
      },
      f3Inicio
    );

    // -------------------------------------------------------------------------
    // FASE 4: INSTALAÇÃO & ILUMINAÇÃO LED INTEGRADA (0.70 -> 0.85)
    // Acende os perfis de LED 2700K e estabiliza no enquadramento exato da foto.
    // -------------------------------------------------------------------------
    const { inicio: f4Inicio, fim: f4Fim } = FASES.instalacao;
    const durF4 = f4Fim - f4Inicio;

    if (ledIlhaRef.current) {
      tl.fromTo(
        ledIlhaRef.current,
        { intensity: 0 },
        { intensity: 2.4, duration: durF4 * 0.8, ease: 'power2.in' },
        f4Inicio
      );
    }
    if (ledBancadaRef.current) {
      tl.fromTo(
        ledBancadaRef.current,
        { intensity: 0 },
        { intensity: 2.0, duration: durF4 * 0.8, ease: 'power2.in' },
        f4Inicio + durF4 * 0.15
      );
    }
    if (ledCristaleiraRef.current) {
      tl.fromTo(
        ledCristaleiraRef.current,
        { intensity: 0 },
        { intensity: 1.8, duration: durF4 * 0.8, ease: 'power2.in' },
        f4Inicio + durF4 * 0.25
      );
    }

    // Alinhamento exato de perspectiva com a foto de cozinha_gringa_4k
    tl.to(
      camera.position,
      {
        x: 1.15,
        y: 1.85,
        z: 3.9,
        duration: durF4,
        ease: 'power2.out',
      },
      f4Inicio
    );
    tl.to(
      alvoCamera.current,
      {
        x: 0.1,
        y: 0.95,
        z: 0.15,
        duration: durF4,
        ease: 'power2.out',
      },
      f4Inicio
    );

    // -------------------------------------------------------------------------
    // FASE 5: TRANSIÇÃO PARA A OBRA REAL (0.85 -> 1.00)
    // Câmera estabilizada, timeline cravada em 1.0 para o crossfade DOM da foto.
    // -------------------------------------------------------------------------
    tl.set({}, {}, 1.0);

    tlRef.current = tl;

    // Atualiza imediatamente para o progresso corrente
    const pInicial = useHeroScrollStore.getState().progress;
    tl.progress(pInicial);
    invalidate();

    const unsubscribe = useHeroScrollStore.subscribe(() => {
      invalidate();
    });

    return () => {
      unsubscribe();
      tl.kill();
      tlRef.current = null;
    };
  }, [camera, invalidate]);

  // Hook que aplica a timeline a cada quadro em que a cena for demandada
  useFrame(() => {
    const tl = tlRef.current;
    if (!tl) return;
    const progress = useHeroScrollStore.getState().progress;
    if (Math.abs(tl.progress() - progress) > 0.0001) {
      tl.progress(progress);
    }
    camera.lookAt(
      alvoCamera.current.x,
      alvoCamera.current.y,
      alvoCamera.current.z
    );
  });

  // Limpeza de texturas e geometrias no desmonte
  useEffect(() => {
    return () => {
      Object.values(texturas).forEach((t) => t.dispose());
      Object.values(materiaisPBR).forEach((m) => m.dispose());
      scene.traverse((obj: any) => {
        if (obj?.isMesh) {
          obj.geometry?.dispose();
        }
      });
    };
  }, [scene, texturas, materiaisPBR]);

  return (
    <>
      {/* ===================================================================== */}
      {/* ILUMINAÇÃO ARQUITETÔNICA NATURAL (Ambiente Claro, sem subexposição)    */}
      {/* ===================================================================== */}
      <ambientLight intensity={1.2} color="#FFFFFF" />
      <hemisphereLight args={['#FFFFFF', '#DFD8CC', 0.95]} />
      {/* Luz solar direta suave vinda da janela lateral */}
      <directionalLight
        position={[6, 11, 5]}
        intensity={1.85}
        color="#FFFDF7"
        castShadow={false}
      />
      {/* Luz de preenchimento frontal */}
      <directionalLight position={[-5, 7, 4]} intensity={0.75} color="#F5EFE6" />

      {/* Fitas de LED 2700K (detalhe arquitetônico de acabamento) */}
      <pointLight
        ref={ledIlhaRef as unknown as React.Ref<never>}
        color="#FFB46B"
        intensity={0}
        distance={3.2}
        decay={2}
        position={[ILHA.posX, 1.8, ILHA.posZ]}
      />
      <pointLight
        ref={ledBancadaRef as unknown as React.Ref<never>}
        color="#FFB46B"
        intensity={0}
        distance={2.8}
        decay={2}
        position={[-0.4, 1.45, -1.35]}
      />
      <pointLight
        ref={ledCristaleiraRef as unknown as React.Ref<never>}
        color="#FFB46B"
        intensity={0}
        distance={2.5}
        decay={2}
        position={[0.8, 1.8, -1.4]}
      />

      {/* ===================================================================== */}
      {/* FASE 1: TRAÇO 2D DA PLANTA BAIXA TÉCNICA (PlantaCozinha.tsx)          */}
      {/* ===================================================================== */}
      <group position={[0, 0.005, 0]}>
        {/* Parede Norte / Fundo (4.6m em Z=-2.0) */}
        <group
          ref={registrarLinha}
          position={[-2.3, 0, -2.0]}
          scale={[0.0001, 1, 1]}
        >
          <mesh position={[2.3, 0, 0]} material={materiaisPBR.ouroPlanta}>
            <boxGeometry args={[4.6, 0.008, 0.02]} />
          </mesh>
        </group>

        {/* Parede Oeste / Esquerda (4.0m em X=-2.3) */}
        <group
          ref={registrarLinha}
          position={[-2.3, 0, -2.0]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[0.0001, 1, 1]}
        >
          <mesh position={[2.0, 0, 0]} material={materiaisPBR.ouroPlanta}>
            <boxGeometry args={[4.0, 0.008, 0.02]} />
          </mesh>
        </group>

        {/* Linha da Bancada Norte em L (3.3m) */}
        <group
          ref={registrarLinha}
          position={[-2.3, 0.002, -1.35]}
          scale={[0.0001, 1, 1]}
        >
          <mesh position={[1.65, 0, 0]} material={materiaisPBR.ouroPlanta}>
            <boxGeometry args={[3.3, 0.006, 0.015]} />
          </mesh>
        </group>

        {/* Retângulo da Ilha Central (1.85m x 0.95m) */}
        <group
          ref={registrarLinha}
          position={[ILHA.posX - ILHA.largura / 2, 0.002, ILHA.posZ - ILHA.profundidade / 2]}
          scale={[0.0001, 1, 1]}
        >
          <mesh position={[ILHA.largura / 2, 0, 0]} material={materiaisPBR.ouroPlanta}>
            <boxGeometry args={[ILHA.largura, 0.006, 0.015]} />
          </mesh>
        </group>
        <group
          ref={registrarLinha}
          position={[ILHA.posX - ILHA.largura / 2, 0.002, ILHA.posZ + ILHA.profundidade / 2]}
          scale={[0.0001, 1, 1]}
        >
          <mesh position={[ILHA.largura / 2, 0, 0]} material={materiaisPBR.ouroPlanta}>
            <boxGeometry args={[ILHA.largura, 0.006, 0.015]} />
          </mesh>
        </group>
        <group
          ref={registrarLinha}
          position={[ILHA.posX - ILHA.largura / 2, 0.002, ILHA.posZ - ILHA.profundidade / 2]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[0.0001, 1, 1]}
        >
          <mesh position={[ILHA.profundidade / 2, 0, 0]} material={materiaisPBR.ouroPlanta}>
            <boxGeometry args={[ILHA.profundidade, 0.006, 0.015]} />
          </mesh>
        </group>
        <group
          ref={registrarLinha}
          position={[ILHA.posX + ILHA.largura / 2, 0.002, ILHA.posZ - ILHA.profundidade / 2]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[0.0001, 1, 1]}
        >
          <mesh position={[ILHA.profundidade / 2, 0, 0]} material={materiaisPBR.ouroPlanta}>
            <boxGeometry args={[ILHA.profundidade, 0.006, 0.015]} />
          </mesh>
        </group>
      </group>

      {/* ===================================================================== */}
      {/* FASE 2: PISO PORCELANATO & PAREDES ARQUITETÔNICAS CLARAS              */}
      {/* ===================================================================== */}
      {/* Piso em porcelanato claro acetinado com juntas de rejunte */}
      <mesh
        ref={pisoMeshRef as unknown as React.Ref<never>}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        scale={[0.0001, 0.0001, 1]}
        material={materiaisPBR.piso}
      >
        <planeGeometry args={[COZINHA.largura, COZINHA.profundidade]} />
      </mesh>

      {/* Paredes arquitetônicas claras com âncora na base */}
      <group
        ref={paredesGroupRef as unknown as React.Ref<never>}
        position={[0, 0, 0]}
        scale={[1, 0.0001, 1]}
      >
        {/* Parede Norte (Fundo) */}
        <mesh
          position={[0, COZINHA.alturaParedes / 2, -2.075]}
          material={materiaisPBR.parede}
        >
          <boxGeometry args={[COZINHA.largura + 0.3, COZINHA.alturaParedes, 0.15]} />
        </mesh>

        {/* Parede Oeste (Esquerda) */}
        <mesh
          position={[-2.375, COZINHA.alturaParedes / 2, 0]}
          material={materiaisPBR.parede}
        >
          <boxGeometry args={[0.15, COZINHA.alturaParedes, COZINHA.profundidade]} />
        </mesh>

        {/* Rodapé da alvenaria */}
        <mesh position={[0, 0.05, -1.99]} material={materiaisPBR.ouro}>
          <boxGeometry args={[COZINHA.largura, 0.1, 0.02]} />
        </mesh>
      </group>

      {/* ===================================================================== */}
      {/* FASE 3: MONTAGEM MILIMÉTRICA DOS MÓVEIS PLANEJADOS DA COZINHA GOURMET */}
      {/* ===================================================================== */}
      <group>
        {/* ------------------------------------------------------------------- */}
        {/* BANCADA DE FUNDO: GABINETES VERDE-SÁLVIA + GRANITO + TORRE FREIJÓ   */}
        {/* ------------------------------------------------------------------- */}
        {/* 1. Rodapé Recuado da Bancada (10cm de altura) */}
        <mesh
          ref={criarRefPeca([-0.6, 0.05, -1.6], [-1.2, 0.8, -0.6]) as unknown as React.Ref<never>}
          material={materiaisPBR.granito}
        >
          <boxGeometry args={[2.8, 0.1, 0.55]} />
        </mesh>

        {/* 2. Estrutura dos Armários Inferiores em Verde-Sálvia (Chapas 18mm) */}
        <mesh
          ref={criarRefPeca([-0.6, 0.47, -1.65], [-1.5, 1.4, -0.8]) as unknown as React.Ref<never>}
          material={materiaisPBR.verdeSalvia}
        >
          <boxGeometry args={[2.8, 0.74, 0.65]} />
        </mesh>

        {/* 3. Frentes de Gavetas e Portas com vãos de 3mm e puxadores cava */}
        {[-1.6, -1.0, -0.4, 0.2].map((xOffset, idx) => (
          <mesh
            key={`porta-inf-${idx}`}
            ref={criarRefPeca(
              [xOffset, 0.47, -1.32],
              [-0.8, 1.2, 0.5]
            ) as unknown as React.Ref<never>}
            material={materiaisPBR.verdeSalvia}
          >
            <boxGeometry args={[0.58, 0.72, 0.018]} />
          </mesh>
        ))}

        {/* 4. Tampo de Granito Preto da Bancada de Fundo (Espessura 4cm com bisotê) */}
        <mesh
          ref={criarRefPeca([-0.6, 0.86, -1.65], [0, 1.8, -0.6]) as unknown as React.Ref<never>}
          material={materiaisPBR.granito}
        >
          <boxGeometry args={[2.84, 0.04, 0.68]} />
        </mesh>

        {/* 5. Cuba Dupla Inox de Sobrepor */}
        <mesh
          ref={criarRefPeca([-0.8, 0.885, -1.6], [0, 1.2, 0.5]) as unknown as React.Ref<never>}
          material={materiaisPBR.inox}
        >
          <boxGeometry args={[0.78, 0.015, 0.44]} />
        </mesh>

        {/* 6. Torneira Gourmet Monocomando em Latão Escovado */}
        <mesh
          ref={criarRefPeca([-0.8, 1.05, -1.78], [0, 0.8, 0.8]) as unknown as React.Ref<never>}
          material={materiaisPBR.ouro}
        >
          <cylinderGeometry args={[0.015, 0.018, 0.32, 16]} />
        </mesh>

        {/* 7. Torre Quente de Fornos e Geladeira em Freijó (à direita da bancada) */}
        <mesh
          ref={criarRefPeca([1.35, 1.35, -1.65], [1.8, 0.8, -0.8]) as unknown as React.Ref<never>}
          material={materiaisPBR.freijo}
        >
          <boxGeometry args={[1.0, 2.7, 0.68]} />
        </mesh>
        {/* Nichos dos Fornos Embutidos com Vidro Preto */}
        <mesh
          ref={criarRefPeca([1.35, 1.45, -1.3], [1.8, 0.8, 0.5]) as unknown as React.Ref<never>}
          material={materiaisPBR.pretoFornos}
        >
          <boxGeometry args={[0.74, 0.88, 0.04]} />
        </mesh>

        {/* 8. Armários Aéreos e Cristaleira até o Teto (Vidro Reflecta + Freijó) */}
        <mesh
          ref={criarRefPeca([-0.6, 2.15, -1.72], [0, 2.0, -1.0]) as unknown as React.Ref<never>}
          material={materiaisPBR.vidroReflecta}
        >
          <boxGeometry args={[2.8, 1.15, 0.38]} />
        </mesh>

        {/* Perfil Dourado sutil na modulação superior */}
        <mesh
          ref={criarRefPeca([-0.6, 1.58, -1.52], [0, 1.6, 0.8]) as unknown as React.Ref<never>}
          material={materiaisPBR.ouro}
        >
          <boxGeometry args={[2.82, 0.015, 0.015]} />
        </mesh>

        {/* ------------------------------------------------------------------- */}
        {/* A ILHA CENTRAL GOURMET (1.85m x 0.95m) — O CORAÇÃO DO PROJETO       */}
        {/* ------------------------------------------------------------------- */}
        {/* 9. Rodapé Recuado da Ilha */}
        <mesh
          ref={criarRefPeca(
            [ILHA.posX, 0.05, ILHA.posZ],
            [0, 1.2, 1.2]
          ) as unknown as React.Ref<never>}
          material={materiaisPBR.granito}
        >
          <boxGeometry args={[ILHA.largura - 0.15, 0.1, ILHA.profundidade - 0.15]} />
        </mesh>

        {/* 10. Estrutura Interna e Gaveteiros da Ilha em Verde-Sálvia */}
        <mesh
          ref={criarRefPeca(
            [ILHA.posX, 0.44, ILHA.posZ],
            [0, 1.6, 1.5]
          ) as unknown as React.Ref<never>}
          material={materiaisPBR.verdeSalvia}
        >
          <boxGeometry args={[ILHA.largura, 0.78, ILHA.profundidade - 0.06]} />
        </mesh>

        {/* 11. Painel Frontal em Madeira Freijó */}
        <mesh
          ref={criarRefPeca(
            [ILHA.posX, 0.44, ILHA.posZ + ILHA.profundidade / 2 - 0.015],
            [0, 1.2, 2.0]
          ) as unknown as React.Ref<never>}
          material={materiaisPBR.freijo}
        >
          <boxGeometry args={[ILHA.largura, 0.78, 0.02]} />
        </mesh>

        {/* 12. Ripas Individuais em Madeira Freijó (Relevo 3D Real) */}
        {Array.from({ length: 18 }).map((_, rIdx) => {
          const stepX = (ILHA.largura - 0.1) / 18;
          const xPos = ILHA.posX - ILHA.largura / 2 + 0.05 + rIdx * stepX;
          return (
            <mesh
              key={`ripa-ilha-${rIdx}`}
              ref={criarRefPeca(
                [xPos, 0.44, ILHA.posZ + ILHA.profundidade / 2 + 0.008],
                [0, 1.4, 2.2 + (rIdx % 3) * 0.2]
              ) as unknown as React.Ref<never>}
              material={materiaisPBR.freijo}
            >
              <boxGeometry args={[0.04, 0.78, 0.018]} />
            </mesh>
          );
        })}

        {/* 13. Tampo Nobre em Granito Preto da Ilha (Espessura 5cm com Beiral para Banquetas) */}
        <mesh
          ref={criarRefPeca(
            [ILHA.posX, 0.865, ILHA.posZ],
            [0, 2.2, 0.8]
          ) as unknown as React.Ref<never>}
          material={materiaisPBR.granito}
        >
          <boxGeometry args={[ILHA.largura + 0.08, 0.05, ILHA.profundidade + 0.08]} />
        </mesh>

        {/* 14. Cooktop 5 Bocas em Vidro Preto Embutido no Granito da Ilha */}
        <mesh
          ref={criarRefPeca(
            [ILHA.posX - 0.25, 0.895, ILHA.posZ],
            [0, 1.4, 1.2]
          ) as unknown as React.Ref<never>}
          material={materiaisPBR.pretoFornos}
        >
          <boxGeometry args={[0.76, 0.012, 0.5]} />
        </mesh>

        {/* Queimadores do Cooktop */}
        {[-0.18, 0, 0.18].map((qOffset, qi) => (
          <mesh
            key={`queimador-ilha-${qi}`}
            position={[ILHA.posX - 0.25 + qOffset, 0.908, ILHA.posZ]}
            material={materiaisPBR.inox}
          >
            <cylinderGeometry args={[0.045, 0.045, 0.012, 16]} />
          </mesh>
        ))}

        {/* 15. Luminária Pendente Tubular em Latão Dourado sobre a Ilha */}
        <group position={[ILHA.posX, 2.1, ILHA.posZ]}>
          <mesh position={[-0.45, 0.35, 0]}>
            <cylinderGeometry args={[0.003, 0.003, 0.7, 8]} />
            <meshStandardMaterial color="#1A1A1A" />
          </mesh>
          <mesh position={[0.45, 0.35, 0]}>
            <cylinderGeometry args={[0.003, 0.003, 0.7, 8]} />
            <meshStandardMaterial color="#1A1A1A" />
          </mesh>
          <mesh
            ref={criarRefPeca(
              [ILHA.posX, 2.1, ILHA.posZ],
              [0, 1.8, 0]
            ) as unknown as React.Ref<never>}
            rotation={[0, 0, Math.PI / 2]}
            material={materiaisPBR.ouro}
          >
            <cylinderGeometry args={[0.018, 0.018, 1.35, 16]} />
          </mesh>
        </group>

        {/* 16. Banquetas Contemporâneas de Madeira/Couro e Estrutura Dourada */}
        {[-0.45, 0.45].map((bOffset, bi) => (
          <group
            key={`banqueta-cozinha-${bi}`}
            position={[ILHA.posX + bOffset, 0.32, ILHA.posZ + ILHA.profundidade / 2 + 0.44]}
          >
            <mesh position={[0, 0.32, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.04, 24]} />
              <meshStandardMaterial color="#36281E" roughness={0.65} />
            </mesh>
            <mesh position={[0, 0.15, 0]} material={materiaisPBR.ouro}>
              <cylinderGeometry args={[0.14, 0.16, 0.32, 12]} />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
}

/**
 * Componente principal do Canvas 3D.
 * Configura DPR estrito (1.5 mobile, 2 desktop), frameloop="demand" e câmera inicial.
 */
export const HeroScrollCena: React.FC = () => {
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 767px), (pointer: coarse)').matches;
  }, []);

  return (
    <Canvas
      frameloop="demand"
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      camera={{
        position: [0, 8.5, 0.001],
        fov: 38,
        near: 0.1,
        far: 60,
      }}
      gl={{
        antialias: !isMobile,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      className="w-full h-full block"
      aria-hidden="true"
    >
      <NarrativaCena />
    </Canvas>
  );
};
