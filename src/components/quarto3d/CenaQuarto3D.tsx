import React, { useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import { QuartoLayout } from './schema';
import { WOOD_FINISHES } from '../../data/woodData';

interface CenaQuarto3DProps {
  layout: QuartoLayout;
  acabamentoAtivoHex: string;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

interface PaletaTokens3D {
  papel: string;
  papel2: string;
  grafite: string;
  grafiteSuave: string;
  preto: string;
  luz: string;
  freijo: string;
  areia: string;
}

function lerTokensDesign(): PaletaTokens3D {
  const estilo =
    typeof window !== 'undefined'
      ? window.getComputedStyle(document.documentElement)
      : null;
  const ler = (varName: string, fallback: string) =>
    estilo?.getPropertyValue(varName).trim() || fallback;

  const freijo =
    WOOD_FINISHES.find((w) => w.id === 'freijo-ripado')?.colorHex ||
    ler('--dourado', 'rgb(212, 168, 79)');
  const areia =
    WOOD_FINISHES.find((w) => w.id === 'areia-acetinado')?.colorHex ||
    ler('--papel-2', 'rgb(226, 224, 218)');

  return {
    papel: ler('--papel', 'rgb(239, 238, 234)'),
    papel2: ler('--papel-2', 'rgb(226, 224, 218)'),
    grafite: ler('--grafite', 'rgb(38, 38, 36)'),
    grafiteSuave: ler('--grafite-suave', 'rgb(91, 90, 86)'),
    preto: ler('--preto', 'rgb(10, 10, 10)'),
    luz: ler('--dourado', 'rgb(212, 168, 79)'),
    freijo,
    areia,
  };
}

function obterCorAcabamento(idOuHex: string, padraoHex: string): string {
  const encontrado = WOOD_FINISHES.find((w) => w.id === idOuHex);
  return encontrado ? encontrado.colorHex : padraoHex;
}

const CapturadorCanvas: React.FC<{
  layout: QuartoLayout;
  acabamentoAtivoHex: string;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}> = ({ layout, acabamentoAtivoHex, onCanvasReady }) => {
  const { gl, invalidate } = useThree();

  useEffect(() => {
    if (onCanvasReady) {
      onCanvasReady(gl.domElement);
    }
  }, [gl, onCanvasReady]);

  useEffect(() => {
    invalidate();
  }, [layout, acabamentoAtivoHex, invalidate]);

  return null;
};

const GeometriaAmbiente: React.FC<{
  layout: QuartoLayout;
  acabamentoAtivoHex: string;
  tokens: PaletaTokens3D;
}> = ({ layout, acabamentoAtivoHex, tokens }) => {
  const { largura_m: W, profundidade_m: D, pe_direito_m: H } = layout.dimensoes;
  const espessura = 0.08;
  const ledAceso = layout.led;

  // Contorno em linha de lápis do ambiente (3D)
  const pontosContorno: Array<[number, number, number]> = [
    [-W / 2, 0.01, -D / 2],
    [W / 2, 0.01, -D / 2],
    [W / 2, 0.01, D / 2],
    [-W / 2, 0.01, D / 2],
    [-W / 2, 0.01, -D / 2],
    [-W / 2, H, -D / 2],
    [W / 2, H, -D / 2],
    [W / 2, 0.01, -D / 2],
  ];

  return (
    <group>
      {/* Iluminação Dia vs Noite ("Acender o LED") */}
      <ambientLight
        intensity={ledAceso ? 0.38 : 1.15}
        color={ledAceso ? tokens.papel : 'white'}
      />
      <directionalLight
        position={[4, 6, 5]}
        intensity={ledAceso ? 0.45 : 1.25}
        color={ledAceso ? tokens.luz : 'white'}
      />

      {/* Contorno arquitetônico do ambiente em traço de lápis */}
      <Line
        points={pontosContorno}
        color={ledAceso ? tokens.luz : tokens.grafite}
        lineWidth={1.6}
      />

      {/* Piso claro */}
      <mesh position={[0, -espessura / 2, 0]}>
        <boxGeometry args={[W, espessura, D]} />
        <meshStandardMaterial color={tokens.areia} roughness={0.85} />
      </mesh>

      {/* Sombra de contato falsa sob o piso para profundidade sem custo de GPU */}
      <mesh position={[0, -espessura - 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W * 1.06, D * 1.06]} />
        <meshBasicMaterial color={tokens.preto} transparent opacity={0.35} />
      </mesh>

      {/* Parede Norte (Fundo) */}
      <mesh position={[0, H / 2, -D / 2 - espessura / 2]}>
        <boxGeometry args={[W + espessura * 2, H, espessura]} />
        <meshStandardMaterial color={tokens.papel} roughness={0.92} />
      </mesh>

      {/* Parede Oeste (Esquerda) */}
      <mesh position={[-W / 2 - espessura / 2, H / 2, 0]}>
        <boxGeometry args={[espessura, H, D]} />
        <meshStandardMaterial color={tokens.papel2} roughness={0.92} />
      </mesh>

      {/* Parede Leste (Direita — meia altura em corte para visualização limpa) */}
      <mesh position={[W / 2 + espessura / 2, H * 0.45, 0]}>
        <boxGeometry args={[espessura, H * 0.9, D]} />
        <meshStandardMaterial color={tokens.papel2} roughness={0.92} transparent opacity={0.35} />
      </mesh>

      {/* Aberturas (Janela / Porta representadas em corte técnico) */}
      {layout.aberturas.map((ab, idx) => {
        const ehJanela = ab.tipo === 'janela';
        const larg = Math.min(ab.largura_m, W * 0.6);
        const alt = ehJanela ? 1.1 : 2.1;
        const posY = ehJanela ? 1.45 : alt / 2;

        if (ab.parede === 'N') {
          return (
            <mesh key={`ab-${idx}`} position={[0.4, posY, -D / 2 + 0.01]}>
              <planeGeometry args={[larg, alt]} />
              <meshBasicMaterial
                color={ehJanela ? (ledAceso ? tokens.grafite : tokens.papel2) : tokens.freijo}
              />
            </mesh>
          );
        }
        return null;
      })}

      {/* Módulos Paramétricos de Marcenaria */}
      {layout.modulos.map((mod) => {
        const corModulo = obterCorAcabamento(mod.acabamento, acabamentoAtivoHex);

        // 1. Guarda-roupa de parede inteira (Parede Oeste)
        if (mod.id === 'guarda-roupa') {
          const larg = Math.min(mod.largura_m, D - 0.3);
          const alt = Math.min(mod.altura_m, H - 0.05);
          const prof = 0.6;
          const numPortas = 4;
          const largPorta = larg / numPortas;

          return (
            <group
              key={mod.id}
              position={[-W / 2 + prof / 2, alt / 2, -D / 2 + larg / 2 + 0.15]}
            >
              {/* Caixa estrutural do guarda-roupa */}
              <mesh>
                <boxGeometry args={[prof, alt, larg]} />
                <meshStandardMaterial color={corModulo} roughness={0.65} />
              </mesh>

              {/* Divisões das portas e puxadores verticais */}
              {Array.from({ length: numPortas }).map((_, pIdx) => {
                const zPorta = -larg / 2 + largPorta * pIdx + largPorta / 2;
                return (
                  <group key={`porta-${pIdx}`} position={[prof / 2 + 0.008, 0, zPorta]}>
                    <mesh>
                      <boxGeometry args={[0.015, alt - 0.06, largPorta - 0.02]} />
                      <meshStandardMaterial color={corModulo} roughness={0.55} />
                    </mesh>
                    {/* Puxador linear em grafite */}
                    <mesh position={[0.012, -0.1, (pIdx % 2 === 0 ? 1 : -1) * (largPorta * 0.36)]}>
                      <boxGeometry args={[0.015, 0.55, 0.02]} />
                      <meshStandardMaterial color={tokens.grafite} metalness={0.4} roughness={0.4} />
                    </mesh>
                  </group>
                );
              })}

              {/* Fita de LED superior do guarda-roupa */}
              <mesh position={[prof / 2 + 0.02, alt / 2 - 0.03, 0]}>
                <boxGeometry args={[0.02, 0.025, larg - 0.08]} />
                <meshStandardMaterial
                  color={ledAceso ? tokens.luz : tokens.grafiteSuave}
                  emissive={ledAceso ? tokens.luz : tokens.preto}
                  emissiveIntensity={ledAceso ? 2.4 : 0}
                />
              </mesh>
              {ledAceso && (
                <pointLight
                  position={[prof / 2 + 0.35, alt / 2 - 0.15, 0]}
                  color={tokens.luz}
                  intensity={1.1}
                  distance={3.2}
                />
              )}
            </group>
          );
        }

        // 2. Cabeceira ripada com LED + Cama (Parede Norte)
        if (mod.id === 'cabeceira-led') {
          const larg = Math.min(mod.largura_m, W - 0.4);
          const alt = Math.min(mod.altura_m, H * 0.65);
          const numRipas = 24;
          const passoRipa = larg / numRipas;

          return (
            <group key={mod.id} position={[0.25, 0, -D / 2 + 0.06]}>
              {/* Base do painel da cabeceira */}
              <mesh position={[0, alt / 2, 0]}>
                <boxGeometry args={[larg, alt, 0.04]} />
                <meshStandardMaterial color={tokens.freijo} roughness={0.7} />
              </mesh>

              {/* Ripas verticais procedurais */}
              {Array.from({ length: numRipas }).map((_, rIdx) => (
                <mesh
                  key={`ripa-cab-${rIdx}`}
                  position={[-larg / 2 + rIdx * passoRipa + passoRipa / 2, alt / 2, 0.03]}
                >
                  <boxGeometry args={[passoRipa * 0.62, alt, 0.02]} />
                  <meshStandardMaterial color={corModulo} roughness={0.6} />
                </mesh>
              ))}

              {/* Perfil de Fita de LED embutida no topo da cabeceira */}
              <mesh position={[0, alt + 0.015, 0.02]}>
                <boxGeometry args={[larg, 0.025, 0.03]} />
                <meshStandardMaterial
                  color={ledAceso ? tokens.luz : tokens.grafiteSuave}
                  emissive={ledAceso ? tokens.luz : tokens.preto}
                  emissiveIntensity={ledAceso ? 3.2 : 0}
                />
              </mesh>
              {ledAceso && (
                <pointLight
                  position={[0, alt + 0.25, 0.35]}
                  color={tokens.luz}
                  intensity={2.0}
                  distance={4.0}
                />
              )}

              {/* Cama centralizada na cabeceira */}
              <group position={[0, 0, 1.02]}>
                {/* Base em madeira */}
                <mesh position={[0, 0.18, 0]}>
                  <boxGeometry args={[1.58, 0.36, 1.98]} />
                  <meshStandardMaterial color={corModulo} roughness={0.65} />
                </mesh>
                {/* Colchão em tecido claro */}
                <mesh position={[0, 0.44, 0]}>
                  <boxGeometry args={[1.48, 0.22, 1.9]} />
                  <meshStandardMaterial color={tokens.papel} roughness={0.9} />
                </mesh>
              </group>
            </group>
          );
        }

        // 3. Painel de TV ripado com rack suspenso (Parede Leste)
        if (mod.id === 'painel-tv') {
          const larg = Math.min(mod.largura_m, D - 0.5);
          const alt = Math.min(mod.altura_m, H - 0.3);
          const numRipas = 18;
          const passo = larg / numRipas;

          return (
            <group key={mod.id} position={[W / 2 - 0.06, 0, 0.15]}>
              {/* Painel ripado vertical */}
              <mesh position={[0, alt / 2 + 0.2, 0]}>
                <boxGeometry args={[0.04, alt, larg]} />
                <meshStandardMaterial color={corModulo} roughness={0.65} />
              </mesh>
              {Array.from({ length: numRipas }).map((_, idx) => (
                <mesh
                  key={`tv-ripa-${idx}`}
                  position={[-0.03, alt / 2 + 0.2, -larg / 2 + idx * passo + passo / 2]}
                >
                  <boxGeometry args={[0.02, alt, passo * 0.6]} />
                  <meshStandardMaterial color={tokens.freijo} roughness={0.6} />
                </mesh>
              ))}

              {/* Rack suspenso inferior */}
              <mesh position={[-0.18, 0.48, 0]}>
                <boxGeometry args={[0.36, 0.28, larg]} />
                <meshStandardMaterial color={corModulo} roughness={0.55} />
              </mesh>

              {/* Tela da TV */}
              <mesh position={[-0.06, 1.32, 0]}>
                <boxGeometry args={[0.03, 0.72, 1.25]} />
                <meshStandardMaterial color={tokens.preto} roughness={0.2} metalness={0.5} />
              </mesh>

              {/* Fita de LED atrás do painel de TV */}
              <mesh position={[-0.02, alt + 0.21, 0]}>
                <boxGeometry args={[0.03, 0.025, larg]} />
                <meshStandardMaterial
                  color={ledAceso ? tokens.luz : tokens.grafiteSuave}
                  emissive={ledAceso ? tokens.luz : tokens.preto}
                  emissiveIntensity={ledAceso ? 2.6 : 0}
                />
              </mesh>
              {ledAceso && (
                <pointLight
                  position={[-0.4, 1.5, 0]}
                  color={tokens.luz}
                  intensity={1.3}
                  distance={3.0}
                />
              )}
            </group>
          );
        }

        // 4. Bancada / Ilha com corpo ripado e tampo em granito preto
        if (mod.id === 'bancada-ilha') {
          const larg = Math.min(mod.largura_m, W - 0.8);
          const alt = mod.altura_m;
          const prof = 0.75;
          const numRipas = 16;
          const passo = larg / numRipas;

          return (
            <group key={mod.id} position={[0, 0, D / 2 - 0.85]}>
              {/* Corpo ripado da ilha/bancada */}
              <mesh position={[0, alt / 2, 0]}>
                <boxGeometry args={[larg, alt - 0.04, prof]} />
                <meshStandardMaterial color={corModulo} roughness={0.65} />
              </mesh>

              {Array.from({ length: numRipas }).map((_, idx) => (
                <mesh
                  key={`ilha-ripa-${idx}`}
                  position={[-larg / 2 + idx * passo + passo / 2, alt / 2, prof / 2 + 0.012]}
                >
                  <boxGeometry args={[passo * 0.6, alt - 0.06, 0.02]} />
                  <meshStandardMaterial color={tokens.freijo} roughness={0.6} />
                </mesh>
              ))}

              {/* Tampo em Granito Preto */}
              <mesh position={[0, alt, 0]}>
                <boxGeometry args={[larg + 0.06, 0.045, prof + 0.06]} />
                <meshStandardMaterial color={tokens.preto} roughness={0.25} metalness={0.2} />
              </mesh>

              {/* Fita de LED sob a borda do granito */}
              <mesh position={[0, alt - 0.03, prof / 2 + 0.02]}>
                <boxGeometry args={[larg, 0.02, 0.02]} />
                <meshStandardMaterial
                  color={ledAceso ? tokens.luz : tokens.grafiteSuave}
                  emissive={ledAceso ? tokens.luz : tokens.preto}
                  emissiveIntensity={ledAceso ? 2.8 : 0}
                />
              </mesh>
              {ledAceso && (
                <pointLight
                  position={[0, alt - 0.15, prof / 2 + 0.35]}
                  color={tokens.luz}
                  intensity={1.4}
                  distance={3.0}
                />
              )}
            </group>
          );
        }

        return null;
      })}
    </group>
  );
};

export const CenaQuarto3D: React.FC<CenaQuarto3DProps> = ({
  layout,
  acabamentoAtivoHex,
  onCanvasReady,
}) => {
  const tokens = useMemo(() => lerTokensDesign(), []);

  return (
    <Canvas
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      dpr={[1, 1.75]}
      frameloop="demand"
      camera={{ position: [4.2, 3.2, 4.8], fov: 42 }}
      className="w-full h-full block"
    >
      <color attach="background" args={[layout.led ? tokens.preto : tokens.grafite]} />
      <CapturadorCanvas
        layout={layout}
        acabamentoAtivoHex={acabamentoAtivoHex}
        onCanvasReady={onCanvasReady}
      />
      <GeometriaAmbiente
        layout={layout}
        acabamentoAtivoHex={acabamentoAtivoHex}
        tokens={tokens}
      />
      <OrbitControls
        makeDefault
        enablePan={false}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI / 2 - 0.04}
        minDistance={2.5}
        maxDistance={9.0}
      />
    </Canvas>
  );
};
