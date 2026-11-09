import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { FASES, useHeroScrollStore } from './useHeroScrollStore';

// Dimensões do dormitório (metros)
const QUARTO = {
  largura: 3.6, // X: [-1.8, 1.8]
  profundidade: 3.2, // Z: [-1.6, 1.6]
  alturaParedes: 2.6, // Y: [0, 2.6]
};

// Posição e dimensões do guarda-roupa embutido na parede de fundo
const ARMARIO = {
  largura: 2.4,
  altura: 2.4,
  profundidade: 0.6,
  posX: -0.4, // Centro em X
  posY: 1.2, // Centro em Y (base no chão Y=0)
  posZ: -1.3, // Encostado na parede Z=-1.6
};

// Cores e acabamentos arquitetônicos da Império (DESIGN.md / acabamentos.ts)
const CORES = {
  ouroPlanta: '#D4A84F', // Dourado no traço de lápis da planta 2D
  pisoMadeira: '#C7B199', // Carvalho no piso
  parede: '#1F1A15', // Alvenaria grafite/escura quente
  madeiraMdf: '#8A5A36', // Freijó quente nos módulos
  portaVidroLed: '#2E2620',
  ledQuente: '#FFB46B', // 2700K acolhedor
  metalOuro: '#C9A04E', // Puxadores e perfil
};

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
 * Componente interno que orquestra a cena Three.js e a timeline única do GSAP.
 */
function NarrativaCena() {
  const { camera, invalidate } = useThree();
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Vetor dinâmico que a câmera segue com lookAt dentro do useFrame
  const alvoCamera = useRef({ x: 0, y: 0, z: 0 });

  // Refs de agrupamento para cada fase
  const paredesGroupRef = useRef<ObjetoAnimavel3D | null>(null);
  const pisoMeshRef = useRef<ObjetoAnimavel3D | null>(null);
  const luzLedRef = useRef<LuzAnimavel3D | null>(null);
  const luzLed2Ref = useRef<LuzAnimavel3D | null>(null);

  // Lista de grupos que representam traços 2D da planta ancorados no início
  const linhasGrupos = useRef<ObjetoAnimavel3D[]>([]);

  // Lista de peças individuais do guarda-roupa
  const pecasMeshes = useRef<ObjetoAnimavel3D[]>([]);

  // Registra grupo de linha da planta
  const registrarLinha = (grupo: unknown) => {
    const g = grupo as ObjetoAnimavel3D | null;
    if (g && !linhasGrupos.current.includes(g)) {
      linhasGrupos.current.push(g);
    }
  };

  // Registra peça do guarda-roupa com sua posição final memorizada
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
    // FASE 1: O TRAÇO 2D (0.00 -> 0.20)
    // Câmera zenital (topo), linhas da planta crescem em scale.x com âncora inicial.
    // -------------------------------------------------------------------------
    const { inicio: f1Inicio, fim: f1Fim } = FASES.traco;
    const durF1 = f1Fim - f1Inicio;
    const totalLinhas = Math.max(1, linhasGrupos.current.length);
    const passoLinha = durF1 / totalLinhas;

    // Configuração inicial da câmera (olhando de cima)
    camera.position.set(0, 7.8, 0.001);
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
    // Piso se revela, paredes sobem em scale.y e câmera desce para perspectiva 3/4.
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

    // Movimento suave da câmera de cima para perspectiva 3/4
    tl.to(
      camera.position,
      {
        x: 3.6,
        y: 4.2,
        z: 4.8,
        duration: durF2,
        ease: 'power2.inOut',
      },
      f2Inicio
    );
    tl.to(
      alvoCamera.current,
      {
        x: 0,
        y: 1.0,
        z: -0.2,
        duration: durF2,
        ease: 'power2.inOut',
      },
      f2Inicio
    );

    // -------------------------------------------------------------------------
    // FASE 3: MONTAGEM MILIMÉTRICA DO GUARDA-ROUPA (0.40 -> 0.70)
    // Peças chegam do espaço externo e se encaixam com precisão de marcenaria.
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

      // Leve rotação de encaixe nas portas e laterais
      if (Math.abs(offset.y) > 0.5) {
        tl.fromTo(
          peca.rotation,
          { y: 0.12 },
          { y: 0, duration: passoPeca * 1.35, ease: 'power2.out' },
          f3Inicio + idx * passoPeca
        );
      }
    });

    // Câmera se aproxima focando na montagem das chapas
    tl.to(
      camera.position,
      {
        x: 2.2,
        y: 2.3,
        z: 3.2,
        duration: durF3,
        ease: 'power1.inOut',
      },
      f3Inicio
    );
    tl.to(
      alvoCamera.current,
      {
        x: ARMARIO.posX,
        y: ARMARIO.posY,
        z: ARMARIO.posZ,
        duration: durF3,
        ease: 'power1.inOut',
      },
      f3Inicio
    );

    // -------------------------------------------------------------------------
    // FASE 4: INSTALAÇÃO & ILUMINAÇÃO LED (0.70 -> 0.85)
    // LED acende no guarda-roupa, câmera recua revelando o dormitório completo.
    // -------------------------------------------------------------------------
    const { inicio: f4Inicio, fim: f4Fim } = FASES.instalacao;
    const durF4 = f4Fim - f4Inicio;

    if (luzLedRef.current) {
      tl.fromTo(
        luzLedRef.current,
        { intensity: 0 },
        { intensity: 3.5, duration: durF4 * 0.8, ease: 'power2.in' },
        f4Inicio
      );
    }
    if (luzLed2Ref.current) {
      tl.fromTo(
        luzLed2Ref.current,
        { intensity: 0 },
        { intensity: 2.2, duration: durF4 * 0.8, ease: 'power2.in' },
        f4Inicio + durF4 * 0.2
      );
    }

    tl.to(
      camera.position,
      {
        x: 2.9,
        y: 2.2,
        z: 4.8,
        duration: durF4,
        ease: 'power2.out',
      },
      f4Inicio
    );
    tl.to(
      alvoCamera.current,
      {
        x: -0.1,
        y: 1.1,
        z: -0.5,
        duration: durF4,
        ease: 'power2.out',
      },
      f4Inicio
    );

    // -------------------------------------------------------------------------
    // FASE 5: TRANSIÇÃO FINAL (0.85 -> 1.00)
    // Câmera estabilizada, timeline cravada em 1.0 para o crossfade DOM da foto.
    // -------------------------------------------------------------------------
    tl.set({}, {}, 1.0);

    tlRef.current = tl;

    // Atualiza imediatamente para o progresso corrente
    const pInicial = useHeroScrollStore.getState().progress;
    tl.progress(pInicial);
    invalidate();

    // Invalida render apenas quando o progresso mudar (frameloop="demand")
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

  return (
    <>
      {/* ===================================================================== */}
      {/* ILUMINAÇÃO GERAL                                                      */}
      {/* ===================================================================== */}
      <ambientLight intensity={0.65} color="#FAF7F2" />
      <directionalLight position={[5, 8, 4]} intensity={1.1} color="#FFFFFF" />
      <directionalLight position={[-4, 6, -3]} intensity={0.4} color="#D4A84F" />

      {/* Fitas de LED embutidas dentro do guarda-roupa */}
      <pointLight
        ref={luzLedRef as unknown as React.Ref<never>}
        color={CORES.ledQuente}
        intensity={0}
        distance={3.5}
        decay={2}
        position={[ARMARIO.posX, 2.3, ARMARIO.posZ + 0.25]}
      />
      <pointLight
        ref={luzLed2Ref as unknown as React.Ref<never>}
        color={CORES.ledQuente}
        intensity={0}
        distance={2.8}
        decay={2}
        position={[ARMARIO.posX + 0.6, 1.3, ARMARIO.posZ + 0.2]}
      />

      {/* ===================================================================== */}
      {/* FASE 1: TRAÇO 2D DA PLANTA BAIXA                                     */}
      {/* ===================================================================== */}
      <group position={[0, 0.005, 0]}>
        {/* Parede de Fundo (3.6m ao longo de X em Z=-1.6) */}
        <group
          ref={registrarLinha}
          position={[-1.8, 0, -1.6]}
          scale={[0.0001, 1, 1]}
        >
          <mesh position={[1.8, 0, 0]}>
            <boxGeometry args={[3.6, 0.008, 0.02]} />
            <meshBasicMaterial color={CORES.ouroPlanta} />
          </mesh>
        </group>

        {/* Parede Lateral Esquerda (3.2m ao longo de Z em X=-1.8) */}
        <group
          ref={registrarLinha}
          position={[-1.8, 0, -1.6]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[0.0001, 1, 1]}
        >
          <mesh position={[1.6, 0, 0]}>
            <boxGeometry args={[3.2, 0.008, 0.02]} />
            <meshBasicMaterial color={CORES.ouroPlanta} />
          </mesh>
        </group>

        {/* Parede Frontal (Segmento 1: 1.9m até vão da porta em Z=+1.6) */}
        <group
          ref={registrarLinha}
          position={[-1.8, 0, 1.6]}
          scale={[0.0001, 1, 1]}
        >
          <mesh position={[0.95, 0, 0]}>
            <boxGeometry args={[1.9, 0.008, 0.02]} />
            <meshBasicMaterial color={CORES.ouroPlanta} />
          </mesh>
        </group>

        {/* Vão da porta (abertura de 0.9m) + Segmento 2 da Parede Frontal */}
        <group
          ref={registrarLinha}
          position={[1.0, 0, 1.6]}
          scale={[0.0001, 1, 1]}
        >
          <mesh position={[0.4, 0, 0]}>
            <boxGeometry args={[0.8, 0.008, 0.02]} />
            <meshBasicMaterial color={CORES.ouroPlanta} />
          </mesh>
        </group>

        {/* Parede Lateral Direita com vão da janela */}
        <group
          ref={registrarLinha}
          position={[1.8, 0, -1.6]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[0.0001, 1, 1]}
        >
          <mesh position={[0.5, 0, 0]}>
            <boxGeometry args={[1.0, 0.008, 0.02]} />
            <meshBasicMaterial color={CORES.ouroPlanta} />
          </mesh>
        </group>
        <group
          ref={registrarLinha}
          position={[1.8, 0, 0.6]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[0.0001, 1, 1]}
        >
          <mesh position={[0.5, 0, 0]}>
            <boxGeometry args={[1.0, 0.008, 0.02]} />
            <meshBasicMaterial color={CORES.ouroPlanta} />
          </mesh>
        </group>

        {/* Traço da projeção do Guarda-Roupa no chão */}
        <group
          ref={registrarLinha}
          position={[-1.6, 0.002, -1.6]}
          scale={[0.0001, 1, 1]}
        >
          <mesh position={[1.2, 0, 0]}>
            <boxGeometry args={[2.4, 0.006, 0.015]} />
            <meshBasicMaterial color={CORES.ouroPlanta} opacity={0.8} transparent />
          </mesh>
        </group>
        <group
          ref={registrarLinha}
          position={[-1.6, 0.002, -1.0]}
          scale={[0.0001, 1, 1]}
        >
          <mesh position={[1.2, 0, 0]}>
            <boxGeometry args={[2.4, 0.006, 0.015]} />
            <meshBasicMaterial color={CORES.ouroPlanta} opacity={0.8} transparent />
          </mesh>
        </group>
      </group>

      {/* ===================================================================== */}
      {/* FASE 2: PISO & PAREDES 3D ELEVADAS                                    */}
      {/* ===================================================================== */}
      {/* Piso em carvalho nobre com acabamento refinado */}
      <mesh
        ref={pisoMeshRef as unknown as React.Ref<never>}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        scale={[0.0001, 0.0001, 1]}
      >
        <planeGeometry args={[QUARTO.largura, QUARTO.profundidade]} />
        <meshStandardMaterial
          color={CORES.pisoMadeira}
          roughness={0.65}
          metalness={0.05}
        />
      </mesh>

      {/* Grupo de paredes com âncora na base */}
      <group
        ref={paredesGroupRef as unknown as React.Ref<never>}
        position={[0, 0, 0]}
        scale={[1, 0.0001, 1]}
      >
        {/* Parede de Fundo completa */}
        <mesh position={[0, QUARTO.alturaParedes / 2, -1.675]}>
          <boxGeometry
            args={[QUARTO.largura + 0.3, QUARTO.alturaParedes, 0.15]}
          />
          <meshStandardMaterial color={CORES.parede} roughness={0.85} />
        </mesh>

        {/* Parede Esquerda */}
        <mesh position={[-1.875, QUARTO.alturaParedes / 2, 0]}>
          <boxGeometry
            args={[0.15, QUARTO.alturaParedes, QUARTO.profundidade]}
          />
          <meshStandardMaterial color={CORES.parede} roughness={0.85} />
        </mesh>

        {/* Parede Direita (Parte 1: antes da janela) */}
        <mesh position={[1.875, QUARTO.alturaParedes / 2, -1.1]}>
          <boxGeometry args={[0.15, QUARTO.alturaParedes, 1.0]} />
          <meshStandardMaterial color={CORES.parede} roughness={0.85} />
        </mesh>
        {/* Parede Direita (Parte 2: depois da janela) */}
        <mesh position={[1.875, QUARTO.alturaParedes / 2, 1.1]}>
          <boxGeometry args={[0.15, QUARTO.alturaParedes, 1.0]} />
          <meshStandardMaterial color={CORES.parede} roughness={0.85} />
        </mesh>
        {/* Peitoril da Janela */}
        <mesh position={[1.875, 0.45, 0]}>
          <boxGeometry args={[0.15, 0.9, 1.2]} />
          <meshStandardMaterial color={CORES.parede} roughness={0.85} />
        </mesh>

        {/* Rodapé elegante em latão/dourado na base */}
        <mesh position={[0, 0.05, -1.59]}>
          <boxGeometry args={[QUARTO.largura, 0.1, 0.02]} />
          <meshStandardMaterial
            color={CORES.metalOuro}
            metalness={0.6}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* ===================================================================== */}
      {/* FASE 3: GUARDA-ROUPA MONTADO PEÇA POR PEÇA                            */}
      {/* ===================================================================== */}
      <group>
        {/* 1. Rodapé e Base (Chapa 18mm) */}
        <mesh
          ref={criarRefPeca(
            [ARMARIO.posX, 0.04, ARMARIO.posZ],
            [0, 1.8, -1.2]
          ) as unknown as React.Ref<never>}
        >
          <boxGeometry args={[ARMARIO.largura, 0.08, ARMARIO.profundidade]} />
          <meshStandardMaterial color={CORES.madeiraMdf} roughness={0.5} />
        </mesh>

        {/* 2. Lateral Esquerda (Chapa 18mm) */}
        <mesh
          ref={criarRefPeca(
            [ARMARIO.posX - ARMARIO.largura / 2 + 0.009, 1.24, ARMARIO.posZ],
            [-2.2, 0.6, 0]
          ) as unknown as React.Ref<never>}
        >
          <boxGeometry args={[0.018, 2.32, ARMARIO.profundidade]} />
          <meshStandardMaterial color={CORES.madeiraMdf} roughness={0.45} />
        </mesh>

        {/* 3. Lateral Direita (Chapa 18mm) */}
        <mesh
          ref={criarRefPeca(
            [ARMARIO.posX + ARMARIO.largura / 2 - 0.009, 1.24, ARMARIO.posZ],
            [2.2, 0.6, 0]
          ) as unknown as React.Ref<never>}
        >
          <boxGeometry args={[0.018, 2.32, ARMARIO.profundidade]} />
          <meshStandardMaterial color={CORES.madeiraMdf} roughness={0.45} />
        </mesh>

        {/* 4. Tampo Superior / Maleiro (Chapa 18mm) */}
        <mesh
          ref={criarRefPeca(
            [ARMARIO.posX, 2.39, ARMARIO.posZ],
            [0, 2.0, 0.8]
          ) as unknown as React.Ref<never>}
        >
          <boxGeometry args={[ARMARIO.largura, 0.018, ARMARIO.profundidade]} />
          <meshStandardMaterial color={CORES.madeiraMdf} roughness={0.45} />
        </mesh>

        {/* 5. Divisória Vertical Central 1 (Divide em 3 vãos de ~78cm) */}
        <mesh
          ref={criarRefPeca(
            [ARMARIO.posX - 0.4, 1.24, ARMARIO.posZ],
            [-0.8, 1.8, 1.2]
          ) as unknown as React.Ref<never>}
        >
          <boxGeometry args={[0.018, 2.3, ARMARIO.profundidade - 0.03]} />
          <meshStandardMaterial color={CORES.madeiraMdf} roughness={0.5} />
        </mesh>

        {/* 6. Divisória Vertical Central 2 */}
        <mesh
          ref={criarRefPeca(
            [ARMARIO.posX + 0.4, 1.24, ARMARIO.posZ],
            [0.8, 1.8, 1.2]
          ) as unknown as React.Ref<never>}
        >
          <boxGeometry args={[0.018, 2.3, ARMARIO.profundidade - 0.03]} />
          <meshStandardMaterial color={CORES.madeiraMdf} roughness={0.5} />
        </mesh>

        {/* 7. Prateleiras Horizontais do Maleiro Superior */}
        <mesh
          ref={criarRefPeca(
            [ARMARIO.posX, 1.95, ARMARIO.posZ],
            [0, 1.2, 1.5]
          ) as unknown as React.Ref<never>}
        >
          <boxGeometry
            args={[
              ARMARIO.largura - 0.036,
              0.018,
              ARMARIO.profundidade - 0.04,
            ]}
          />
          <meshStandardMaterial color={CORES.madeiraMdf} roughness={0.5} />
        </mesh>

        {/* 8. Bloco de Gaveteiro Interno (Módulo com 3 gavetas) */}
        <mesh
          ref={criarRefPeca(
            [ARMARIO.posX, 0.45, ARMARIO.posZ],
            [0, -0.8, 2.0]
          ) as unknown as React.Ref<never>}
        >
          <boxGeometry args={[0.76, 0.7, ARMARIO.profundidade - 0.06]} />
          <meshStandardMaterial color="#A47048" roughness={0.4} />
        </mesh>

        {/* 9. Varões Cabideiros em Alumínio/Ouro Champanhe */}
        <mesh
          ref={criarRefPeca(
            [ARMARIO.posX - 0.8, 1.85, ARMARIO.posZ],
            [-1.0, 1.5, 1.8]
          ) as unknown as React.Ref<never>}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.014, 0.014, 0.76, 16]} />
          <meshStandardMaterial
            color={CORES.metalOuro}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
        <mesh
          ref={criarRefPeca(
            [ARMARIO.posX + 0.8, 1.85, ARMARIO.posZ],
            [1.0, 1.5, 1.8]
          ) as unknown as React.Ref<never>}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.014, 0.014, 0.76, 16]} />
          <meshStandardMaterial
            color={CORES.metalOuro}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* 10. Portas Elegantes com Perfil Dourado e Vidro Reflecta/Madeira */}
        {/* Porta Esquerda */}
        <mesh
          ref={criarRefPeca(
            [ARMARIO.posX - 0.8, 1.22, ARMARIO.posZ + ARMARIO.profundidade / 2],
            [-1.6, 0, 1.8]
          ) as unknown as React.Ref<never>}
        >
          <boxGeometry args={[0.79, 2.26, 0.02]} />
          <meshStandardMaterial
            color={CORES.portaVidroLed}
            roughness={0.3}
            metalness={0.3}
          />
        </mesh>

        {/* Porta Central */}
        <mesh
          ref={criarRefPeca(
            [ARMARIO.posX, 1.22, ARMARIO.posZ + ARMARIO.profundidade / 2],
            [0, 1.5, 2.2]
          ) as unknown as React.Ref<never>}
        >
          <boxGeometry args={[0.79, 2.26, 0.02]} />
          <meshStandardMaterial
            color={CORES.portaVidroLed}
            roughness={0.3}
            metalness={0.3}
          />
        </mesh>

        {/* Porta Direita */}
        <mesh
          ref={criarRefPeca(
            [ARMARIO.posX + 0.8, 1.22, ARMARIO.posZ + ARMARIO.profundidade / 2],
            [1.6, 0, 1.8]
          ) as unknown as React.Ref<never>}
        >
          <boxGeometry args={[0.79, 2.26, 0.02]} />
          <meshStandardMaterial
            color={CORES.portaVidroLed}
            roughness={0.3}
            metalness={0.3}
          />
        </mesh>

        {/* Puxadores em Barra Cava de Latão Dourado */}
        <mesh
          position={[
            ARMARIO.posX - 0.42,
            1.2,
            ARMARIO.posZ + ARMARIO.profundidade / 2 + 0.015,
          ]}
        >
          <boxGeometry args={[0.015, 0.7, 0.01]} />
          <meshStandardMaterial
            color={CORES.metalOuro}
            metalness={0.85}
            roughness={0.2}
          />
        </mesh>
        <mesh
          position={[
            ARMARIO.posX + 0.42,
            1.2,
            ARMARIO.posZ + ARMARIO.profundidade / 2 + 0.015,
          ]}
        >
          <boxGeometry args={[0.015, 0.7, 0.01]} />
          <meshStandardMaterial
            color={CORES.metalOuro}
            metalness={0.85}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* ===================================================================== */}
      {/* ELEMENTO COMPLEMENTAR: Mesa lateral / Criado arquitetônico            */}
      {/* ===================================================================== */}
      <group position={[1.2, 0.25, -1.2]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.45, 0.5, 0.4]} />
          <meshStandardMaterial color="#241E19" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.255, 0]}>
          <boxGeometry args={[0.47, 0.018, 0.42]} />
          <meshStandardMaterial
            color={CORES.metalOuro}
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>
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
        position: [0, 7.8, 0.001],
        fov: 38,
        near: 0.1,
        far: 60,
      }}
      gl={{
        antialias: !isMobile,
        powerPreference: 'high-performance',
      }}
      className="w-full h-full block"
      aria-hidden="true"
    >
      <NarrativaCena />
    </Canvas>
  );
};
