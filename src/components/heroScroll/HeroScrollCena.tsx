import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { FASES, useHeroScrollStore } from './useHeroScrollStore';

// Dimensões do ambiente da Cozinha Gourmet (metros)
const COZINHA = {
  largura: 4.4, // X: [-2.2, 2.2]
  profundidade: 3.8, // Z: [-1.9, 1.9]
  alturaParedes: 2.7, // Y: [0, 2.7]
};

// Posição e dimensões da Ilha Central Gourmet (1.80m x 0.90m)
const ILHA = {
  largura: 1.85,
  profundidade: 0.95,
  altura: 0.9,
  posX: 0.1, // Ligeiramente à direita do centro
  posY: 0.45, // Centro em Y (base no chão Y=0)
  posZ: 0.25, // Na frente da bancada principal
};

// Cores e acabamentos reais de "cozinha_gringa_4k" da Império (DESIGN.md / acabamentos.ts)
const CORES = {
  ouroPlanta: '#D4A84F', // Dourado nas linhas de cota técnica
  verdeSalvia: '#687E67', // Verde-Sálvia nobre dos armários da ilha e bancadas
  verdeSalviaEscuro: '#4F614E',
  freijoMadeira: '#8A5A36', // Freijó do painel ripado da ilha e torre
  freijoClaro: '#A36F45',
  granitoPreto: '#1C1A18', // Granito Preto São Gabriel / Absoluto polido
  metalOuro: '#C9A04E', // Pendentes, puxadores e detalhes em latão dourado
  vidroCristaleira: '#27221E', // Vidro reflecta fumê
  ledQuente: '#FFB46B', // Fitas de LED 2700K acolhedoras
  pisoPorcelanato: '#C3BCB4', // Porcelanato acetinado cinza quente
  parede: '#1E1915', // Alvenaria grafite/escura quente
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
 * Cena Three.js da Cozinha Gourmet em verde-sálvia, ripado de freijó e granito preto.
 * Orquestrada por uma única timeline GSAP sincronizada com o scroll.
 */
function NarrativaCena() {
  const { camera, invalidate } = useThree();
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Vetor que a câmera segue suavemente com lookAt no useFrame
  const alvoCamera = useRef({ x: 0, y: 0, z: 0 });

  // Refs de agrupamento para cada fase
  const paredesGroupRef = useRef<ObjetoAnimavel3D | null>(null);
  const pisoMeshRef = useRef<ObjetoAnimavel3D | null>(null);

  // Luzes LED da bancada, cristaleira e pendentes da ilha
  const ledIlhaRef = useRef<LuzAnimavel3D | null>(null);
  const ledBancadaRef = useRef<LuzAnimavel3D | null>(null);
  const ledCristaleiraRef = useRef<LuzAnimavel3D | null>(null);

  // Lista de grupos que representam traços 2D da planta
  const linhasGrupos = useRef<ObjetoAnimavel3D[]>([]);

  // Lista de peças individuais da cozinha gourmet
  const pecasMeshes = useRef<ObjetoAnimavel3D[]>([]);

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
    // Câmera zenital, linhas se desenham em scale.x com âncora inicial.
    // -------------------------------------------------------------------------
    const { inicio: f1Inicio, fim: f1Fim } = FASES.traco;
    const durF1 = f1Fim - f1Inicio;
    const totalLinhas = Math.max(1, linhasGrupos.current.length);
    const passoLinha = durF1 / totalLinhas;

    // Posição inicial da câmera olhando de cima (planta técnica)
    camera.position.set(0, 8.4, 0.001);
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
    // Piso se revela, paredes sobem e câmera desce para perspectiva 3/4.
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

    // Câmera desce suavemente para vista angular da cozinha
    tl.to(
      camera.position,
      {
        x: 3.4,
        y: 3.8,
        z: 4.6,
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
        z: -0.2,
        duration: durF2,
        ease: 'power2.inOut',
      },
      f2Inicio
    );

    // -------------------------------------------------------------------------
    // FASE 3: MONTAGEM MILIMÉTRICA DA COZINHA GOURMET (0.40 -> 0.70)
    // Armários em Verde-Sálvia, Torre em Freijó, Granito e Ilha com Ripado.
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

      // Leve rotação de encaixe nas portas e painéis ripados
      if (Math.abs(offset.y) > 0.4 || Math.abs(offset.x) > 1.0) {
        tl.fromTo(
          peca.rotation,
          { y: 0.1 },
          { y: 0, duration: passoPeca * 1.35, ease: 'power2.out' },
          f3Inicio + idx * passoPeca
        );
      }
    });

    // Câmera aproxima da ilha central observando a marcenaria em verde-sálvia e o ripado
    tl.to(
      camera.position,
      {
        x: 1.9,
        y: 2.1,
        z: 3.4,
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
    // FASE 4: INSTALAÇÃO & ILUMINAÇÃO LED (0.70 -> 0.85)
    // Acende o LED da cristaleira, da bancada e pendentes da ilha.
    // -------------------------------------------------------------------------
    const { inicio: f4Inicio, fim: f4Fim } = FASES.instalacao;
    const durF4 = f4Fim - f4Inicio;

    if (ledIlhaRef.current) {
      tl.fromTo(
        ledIlhaRef.current,
        { intensity: 0 },
        { intensity: 3.6, duration: durF4 * 0.8, ease: 'power2.in' },
        f4Inicio
      );
    }
    if (ledBancadaRef.current) {
      tl.fromTo(
        ledBancadaRef.current,
        { intensity: 0 },
        { intensity: 2.5, duration: durF4 * 0.8, ease: 'power2.in' },
        f4Inicio + durF4 * 0.15
      );
    }
    if (ledCristaleiraRef.current) {
      tl.fromTo(
        ledCristaleiraRef.current,
        { intensity: 0 },
        { intensity: 2.2, duration: durF4 * 0.8, ease: 'power2.in' },
        f4Inicio + durF4 * 0.25
      );
    }

    // Câmera recua suavemente se alinhando ao ângulo da foto real de cozinha_gringa_4k
    tl.to(
      camera.position,
      {
        x: 1.4,
        y: 1.9,
        z: 4.1,
        duration: durF4,
        ease: 'power2.out',
      },
      f4Inicio
    );
    tl.to(
      alvoCamera.current,
      {
        x: 0.15,
        y: 0.95,
        z: 0.1,
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
      <ambientLight intensity={0.7} color="#FAF7F2" />
      <directionalLight position={[5, 8, 4]} intensity={1.15} color="#FFFFFF" />
      <directionalLight position={[-4, 6, -3]} intensity={0.45} color="#D4A84F" />

      {/* Fitas de LED da Ilha Central e Cristaleira (cor quente 2700K) */}
      <pointLight
        ref={ledIlhaRef as unknown as React.Ref<never>}
        color={CORES.ledQuente}
        intensity={0}
        distance={3.2}
        decay={2}
        position={[ILHA.posX, 1.8, ILHA.posZ]}
      />
      <pointLight
        ref={ledBancadaRef as unknown as React.Ref<never>}
        color={CORES.ledQuente}
        intensity={0}
        distance={2.8}
        decay={2}
        position={[-0.4, 1.45, -1.3]}
      />
      <pointLight
        ref={ledCristaleiraRef as unknown as React.Ref<never>}
        color={CORES.ledQuente}
        intensity={0}
        distance={2.5}
        decay={2}
        position={[0.8, 1.8, -1.35]}
      />

      {/* ===================================================================== */}
      {/* FASE 1: TRAÇO 2D DA PLANTA BAIXA DA COZINHA (PlantaCozinha.tsx)        */}
      {/* ===================================================================== */}
      <group position={[0, 0.005, 0]}>
        {/* Parede Norte / Fundo (4.4m ao longo de X em Z=-1.9) */}
        <group
          ref={registrarLinha}
          position={[-2.2, 0, -1.9]}
          scale={[0.0001, 1, 1]}
        >
          <mesh position={[2.2, 0, 0]}>
            <boxGeometry args={[4.4, 0.008, 0.02]} />
            <meshBasicMaterial color={CORES.ouroPlanta} />
          </mesh>
        </group>

        {/* Parede Oeste / Esquerda (3.8m ao longo de Z em X=-2.2) */}
        <group
          ref={registrarLinha}
          position={[-2.2, 0, -1.9]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[0.0001, 1, 1]}
        >
          <mesh position={[1.9, 0, 0]}>
            <boxGeometry args={[3.8, 0.008, 0.02]} />
            <meshBasicMaterial color={CORES.ouroPlanta} />
          </mesh>
        </group>

        {/* Linha da Bancada Norte em L (3.2m de bancada) */}
        <group
          ref={registrarLinha}
          position={[-2.2, 0.002, -1.25]}
          scale={[0.0001, 1, 1]}
        >
          <mesh position={[1.6, 0, 0]}>
            <boxGeometry args={[3.2, 0.006, 0.015]} />
            <meshBasicMaterial color={CORES.ouroPlanta} opacity={0.85} transparent />
          </mesh>
        </group>

        {/* Retângulo da Ilha Central 2D (1.80m x 0.90m) */}
        <group
          ref={registrarLinha}
          position={[ILHA.posX - ILHA.largura / 2, 0.002, ILHA.posZ - ILHA.profundidade / 2]}
          scale={[0.0001, 1, 1]}
        >
          <mesh position={[ILHA.largura / 2, 0, 0]}>
            <boxGeometry args={[ILHA.largura, 0.006, 0.015]} />
            <meshBasicMaterial color={CORES.ouroPlanta} />
          </mesh>
        </group>
        <group
          ref={registrarLinha}
          position={[ILHA.posX - ILHA.largura / 2, 0.002, ILHA.posZ + ILHA.profundidade / 2]}
          scale={[0.0001, 1, 1]}
        >
          <mesh position={[ILHA.largura / 2, 0, 0]}>
            <boxGeometry args={[ILHA.largura, 0.006, 0.015]} />
            <meshBasicMaterial color={CORES.ouroPlanta} />
          </mesh>
        </group>
        <group
          ref={registrarLinha}
          position={[ILHA.posX - ILHA.largura / 2, 0.002, ILHA.posZ - ILHA.profundidade / 2]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[0.0001, 1, 1]}
        >
          <mesh position={[ILHA.profundidade / 2, 0, 0]}>
            <boxGeometry args={[ILHA.profundidade, 0.006, 0.015]} />
            <meshBasicMaterial color={CORES.ouroPlanta} />
          </mesh>
        </group>
        <group
          ref={registrarLinha}
          position={[ILHA.posX + ILHA.largura / 2, 0.002, ILHA.posZ - ILHA.profundidade / 2]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[0.0001, 1, 1]}
        >
          <mesh position={[ILHA.profundidade / 2, 0, 0]}>
            <boxGeometry args={[ILHA.profundidade, 0.006, 0.015]} />
            <meshBasicMaterial color={CORES.ouroPlanta} />
          </mesh>
        </group>
      </group>

      {/* ===================================================================== */}
      {/* FASE 2: PISO & PAREDES 3D ELEVADAS                                    */}
      {/* ===================================================================== */}
      {/* Piso porcelanato acetinado cinza quente */}
      <mesh
        ref={pisoMeshRef as unknown as React.Ref<never>}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        scale={[0.0001, 0.0001, 1]}
      >
        <planeGeometry args={[COZINHA.largura, COZINHA.profundidade]} />
        <meshStandardMaterial
          color={CORES.pisoPorcelanato}
          roughness={0.55}
          metalness={0.08}
        />
      </mesh>

      {/* Paredes com âncora na base */}
      <group
        ref={paredesGroupRef as unknown as React.Ref<never>}
        position={[0, 0, 0]}
        scale={[1, 0.0001, 1]}
      >
        {/* Parede de Fundo (Norte) */}
        <mesh position={[0, COZINHA.alturaParedes / 2, -1.975]}>
          <boxGeometry
            args={[COZINHA.largura + 0.3, COZINHA.alturaParedes, 0.15]}
          />
          <meshStandardMaterial color={CORES.parede} roughness={0.88} />
        </mesh>

        {/* Parede Esquerda (Oeste) */}
        <mesh position={[-2.275, COZINHA.alturaParedes / 2, 0]}>
          <boxGeometry
            args={[0.15, COZINHA.alturaParedes, COZINHA.profundidade]}
          />
          <meshStandardMaterial color={CORES.parede} roughness={0.88} />
        </mesh>

        {/* Rodapé da alvenaria */}
        <mesh position={[0, 0.05, -1.89]}>
          <boxGeometry args={[COZINHA.largura, 0.1, 0.02]} />
          <meshStandardMaterial
            color={CORES.metalOuro}
            metalness={0.65}
            roughness={0.3}
          />
        </mesh>
      </group>

      {/* ===================================================================== */}
      {/* FASE 3: MONTAGEM DOS MÓVEIS DA COZINHA GOURMET                        */}
      {/* ===================================================================== */}
      <group>
        {/* ------------------------------------------------------------------- */}
        {/* BANCADA DE FUNDO (EM VERDE-SÁLVIA + GRANITO PRETO + CRISTALEIRA)    */}
        {/* ------------------------------------------------------------------- */}
        {/* 1. Armários Inferiores de Fundo (Verde-Sálvia) */}
        <mesh
          ref={criarRefPeca(
            [-0.5, 0.42, -1.55],
            [-1.5, 1.2, -0.8]
          ) as unknown as React.Ref<never>}
        >
          <boxGeometry args={[2.8, 0.84, 0.65]} />
          <meshStandardMaterial color={CORES.verdeSalvia} roughness={0.45} />
        </mesh>

        {/* 2. Tampo de Granito Preto da Bancada de Fundo */}
        <mesh
          ref={criarRefPeca(
            [-0.5, 0.86, -1.55],
            [0, 1.8, -0.6]
          ) as unknown as React.Ref<never>}
        >
          <boxGeometry args={[2.84, 0.04, 0.67]} />
          <meshStandardMaterial
            color={CORES.granitoPreto}
            roughness={0.15}
            metalness={0.15}
          />
        </mesh>

        {/* 3. Cuba Dupla Inox de Sobrepor */}
        <mesh
          ref={criarRefPeca(
            [-0.7, 0.885, -1.52],
            [0, 1.2, 0.5]
          ) as unknown as React.Ref<never>}
        >
          <boxGeometry args={[0.78, 0.015, 0.44]} />
          <meshStandardMaterial
            color="#D8D8D8"
            metalness={0.88}
            roughness={0.2}
          />
        </mesh>

        {/* 4. Torneira Gourmet Monocomando em Latão Ouro Escovado */}
        <mesh
          ref={criarRefPeca(
            [-0.7, 1.05, -1.68],
            [0, 0.8, 0.8]
          ) as unknown as React.Ref<never>}
        >
          <cylinderGeometry args={[0.015, 0.018, 0.32, 16]} />
          <meshStandardMaterial
            color={CORES.metalOuro}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>

        {/* 5. Torre Quente de Fornos e Geladeira (Freijó e Verde-Sálvia na direita) */}
        <mesh
          ref={criarRefPeca(
            [1.4, 1.25, -1.55],
            [1.8, 0.8, -0.8]
          ) as unknown as React.Ref<never>}
        >
          <boxGeometry args={[0.95, 2.5, 0.68]} />
          <meshStandardMaterial color={CORES.freijoMadeira} roughness={0.4} />
        </mesh>
        {/* Nichos dos Fornos Embutidos na Torre */}
        <mesh
          ref={criarRefPeca(
            [1.4, 1.35, -1.2],
            [1.8, 0.8, 0.5]
          ) as unknown as React.Ref<never>}
        >
          <boxGeometry args={[0.7, 0.85, 0.04]} />
          <meshStandardMaterial
            color="#141414"
            metalness={0.8}
            roughness={0.25}
          />
        </mesh>

        {/* 6. Armários Aéreos / Cristaleira Iluminada (Vidro Reflecta + Freijó) */}
        <mesh
          ref={criarRefPeca(
            [-0.5, 1.95, -1.62],
            [0, 2.0, -1.0]
          ) as unknown as React.Ref<never>}
        >
          <boxGeometry args={[2.8, 0.85, 0.38]} />
          <meshStandardMaterial
            color={CORES.vidroCristaleira}
            roughness={0.25}
            metalness={0.35}
          />
        </mesh>

        {/* Perfil Dourado sutil na Cristaleira */}
        <mesh
          ref={criarRefPeca(
            [-0.5, 1.95, -1.42],
            [0, 1.6, 0.8]
          ) as unknown as React.Ref<never>}
        >
          <boxGeometry args={[2.82, 0.015, 0.015]} />
          <meshStandardMaterial
            color={CORES.metalOuro}
            metalness={0.85}
            roughness={0.2}
          />
        </mesh>

        {/* ------------------------------------------------------------------- */}
        {/* A ILHA CENTRAL GOURMET (1.80m x 0.90m) — O CORAÇÃO DO PROJETO       */}
        {/* ------------------------------------------------------------------- */}
        {/* 7. Base e Gaveteiros da Ilha em Verde-Sálvia */}
        <mesh
          ref={criarRefPeca(
            [ILHA.posX, 0.42, ILHA.posZ],
            [0, 1.8, 1.5]
          ) as unknown as React.Ref<never>}
        >
          <boxGeometry args={[ILHA.largura, 0.84, ILHA.profundidade - 0.06]} />
          <meshStandardMaterial
            color={CORES.verdeSalvia}
            roughness={0.42}
          />
        </mesh>

        {/* 8. Painel Frontal Ripado em Madeira Freijó Nobre */}
        <mesh
          ref={criarRefPeca(
            [ILHA.posX, 0.42, ILHA.posZ + ILHA.profundidade / 2 - 0.01],
            [0, 1.2, 2.2]
          ) as unknown as React.Ref<never>}
        >
          <boxGeometry args={[ILHA.largura, 0.84, 0.025]} />
          <meshStandardMaterial
            color={CORES.freijoMadeira}
            roughness={0.45}
          />
        </mesh>

        {/* Detalhe de Ripas Verticais de Madeira na Ilha (Efeito Ripado Real) */}
        {[-0.75, -0.45, -0.15, 0.15, 0.45, 0.75].map((xOffset, i) => (
          <mesh
            key={`ripa-${i}`}
            ref={criarRefPeca(
              [ILHA.posX + xOffset, 0.42, ILHA.posZ + ILHA.profundidade / 2 + 0.008],
              [0, 1.4, 2.4]
            ) as unknown as React.Ref<never>}
          >
            <boxGeometry args={[0.035, 0.84, 0.018]} />
            <meshStandardMaterial
              color={CORES.freijoClaro}
              roughness={0.4}
            />
          </mesh>
        ))}

        {/* 9. Tampo Nobre em Granito Preto da Ilha (com beiral) */}
        <mesh
          ref={criarRefPeca(
            [ILHA.posX, 0.87, ILHA.posZ],
            [0, 2.2, 0.8]
          ) as unknown as React.Ref<never>}
        >
          <boxGeometry args={[ILHA.largura + 0.06, 0.05, ILHA.profundidade + 0.06]} />
          <meshStandardMaterial
            color={CORES.granitoPreto}
            roughness={0.14}
            metalness={0.18}
          />
        </mesh>

        {/* 10. Cooktop 5 Bocas em Vidro Preto / Inox Embutido na Ilha */}
        <mesh
          ref={criarRefPeca(
            [ILHA.posX - 0.25, 0.9, ILHA.posZ],
            [0, 1.4, 1.2]
          ) as unknown as React.Ref<never>}
        >
          <boxGeometry args={[0.76, 0.012, 0.5]} />
          <meshStandardMaterial
            color="#111111"
            roughness={0.18}
            metalness={0.8}
          />
        </mesh>

        {/* 11. Queimadores do Cooktop */}
        {[-0.18, 0, 0.18].map((qOffset, qi) => (
          <mesh
            key={`queimador-${qi}`}
            position={[ILHA.posX - 0.25 + qOffset, 0.912, ILHA.posZ]}
          >
            <cylinderGeometry args={[0.045, 0.045, 0.012, 16]} />
            <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.3} />
          </mesh>
        ))}

        {/* 12. Luminárias Pendentes Lineares em Latão Dourado sobre a Ilha */}
        <group position={[ILHA.posX, 2.05, ILHA.posZ]}>
          {/* Cabo do Pendente */}
          <mesh position={[-0.45, 0.35, 0]}>
            <cylinderGeometry args={[0.003, 0.003, 0.65, 8]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          <mesh position={[0.45, 0.35, 0]}>
            <cylinderGeometry args={[0.003, 0.003, 0.65, 8]} />
            <meshStandardMaterial color="#111111" />
          </mesh>
          {/* Barra Tubular Dourada de Iluminação Linear */}
          <mesh
            ref={criarRefPeca(
              [ILHA.posX, 2.05, ILHA.posZ],
              [0, 1.8, 0]
            ) as unknown as React.Ref<never>}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.018, 0.018, 1.3, 16]} />
            <meshStandardMaterial
              color={CORES.metalOuro}
              metalness={0.88}
              roughness={0.2}
            />
          </mesh>
        </group>

        {/* 13. Duas Banquetas Contemporâneas de Madeira/Couro junto à Ilha */}
        {[-0.45, 0.45].map((bOffset, bi) => (
          <group
            key={`banqueta-${bi}`}
            position={[ILHA.posX + bOffset, 0.32, ILHA.posZ + ILHA.profundidade / 2 + 0.42]}
          >
            {/* Assento da banqueta */}
            <mesh position={[0, 0.32, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.04, 20]} />
              <meshStandardMaterial color="#3A2B20" roughness={0.6} />
            </mesh>
            {/* Pés em latão escovado */}
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.14, 0.16, 0.32, 12]} />
              <meshStandardMaterial color={CORES.metalOuro} metalness={0.8} roughness={0.3} />
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
        position: [0, 8.4, 0.001],
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
