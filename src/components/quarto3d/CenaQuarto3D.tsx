import React, { useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import { QuartoLayout } from './schema';
import { ACABAMENTOS_3D } from '../../data/acabamentos';
import { CENARIOS_AMBIENTES, CATALOGO_MODULOS_CENARIO } from '../../data/cenarios';

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
  dourado: string;
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
    ACABAMENTOS_3D.find((w) => w.id === 'freijo-ripado')?.hex ||
    ler('--dourado', 'rgb(212, 168, 79)');
  const areia =
    ACABAMENTOS_3D.find((w) => w.id === 'areia-acetinado')?.hex ||
    ler('--papel-2', 'rgb(226, 224, 218)');

  return {
    papel: ler('--papel', 'rgb(239, 238, 234)'),
    papel2: ler('--papel-2', 'rgb(226, 224, 218)'),
    grafite: ler('--grafite', 'rgb(38, 38, 36)'),
    grafiteSuave: ler('--grafite-suave', 'rgb(91, 90, 86)'),
    preto: ler('--preto', 'rgb(10, 10, 10)'),
    dourado: ler('--dourado', 'rgb(212, 168, 79)'),
    freijo,
    areia,
  };
}

function obterCorAcabamento(idOuHex: string, padraoHex: string): string {
  const encontrado = ACABAMENTOS_3D.find((w) => w.id === idOuHex);
  return encontrado ? encontrado.hex : padraoHex;
}

const CapturadorCanvas: React.FC<{
  layout: QuartoLayout;
  acabamentoAtivoHex: string;
  onCanvasReady?: (canvas: HTMLCanvasElement) => void;
}> = ({ layout, acabamentoAtivoHex, onCanvasReady }) => {
  const { gl, invalidate, camera } = useThree();

  useEffect(() => {
    if (onCanvasReady) {
      onCanvasReady(gl.domElement);
    }
  }, [gl, onCanvasReady]);

  useEffect(() => {
    const pos = CENARIOS_AMBIENTES[layout.comodo].posicaoCamera;
    camera.position.set(pos[0], pos[1], pos[2]);
    camera.updateProjectionMatrix();
    invalidate();
  }, [layout.comodo, camera, invalidate]);

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
  const cenario = CENARIOS_AMBIENTES[layout.comodo];

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

  const corPiso = cenario.piso === 'porcelanato-claro' ? tokens.papel : tokens.areia;

  return (
    <group>
      {/* Iluminação Dia vs Noite ("Acender o LED") */}
      <ambientLight
        intensity={ledAceso ? 0.42 : 1.15}
        color={ledAceso ? tokens.papel : 'white'}
      />
      <directionalLight
        position={[4, 6, 5]}
        intensity={ledAceso ? 0.48 : 1.25}
        color={ledAceso ? tokens.dourado : 'white'}
      />

      {/* Contorno em traço de lápis */}
      <Line
        points={pontosContorno}
        color={ledAceso ? tokens.dourado : tokens.grafite}
        lineWidth={1.6}
      />

      {/* Piso do cenário */}
      <mesh position={[0, -espessura / 2, 0]}>
        <boxGeometry args={[W, espessura, D]} />
        <meshStandardMaterial
          color={corPiso}
          roughness={cenario.piso === 'porcelanato-claro' ? 0.35 : 0.8}
        />
      </mesh>

      {/* Sombra de contato falsa sob o piso */}
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

      {/* Parede Leste (Meia altura transparente para corte arquitetônico) */}
      <mesh position={[W / 2 + espessura / 2, H * 0.45, 0]}>
        <boxGeometry args={[espessura, H * 0.9, D]} />
        <meshStandardMaterial color={tokens.papel2} roughness={0.92} transparent opacity={0.3} />
      </mesh>

      {/* Aberturas do cenário (janelas e portas) */}
      {layout.aberturas.map((ab, idx) => {
        const ehJanela = ab.tipo === 'janela';
        const larg = Math.min(ab.largura_m, W * 0.55);
        const alt = ehJanela ? 1.1 : 2.1;
        const posY = ehJanela ? 1.45 : alt / 2;

        if (ab.parede === 'N') {
          return (
            <mesh key={`ab-${idx}`} position={[ab.posicaoOffset_m, posY, -D / 2 + 0.01]}>
              <planeGeometry args={[larg, alt]} />
              <meshBasicMaterial
                color={ehJanela ? (ledAceso ? tokens.grafite : tokens.papel2) : tokens.freijo}
              />
            </mesh>
          );
        }
        if (ab.parede === 'O') {
          return (
            <mesh
              key={`ab-${idx}`}
              position={[-W / 2 + 0.01, posY, ab.posicaoOffset_m]}
              rotation={[0, Math.PI / 2, 0]}
            >
              <planeGeometry args={[larg, alt]} />
              <meshBasicMaterial
                color={ehJanela ? (ledAceso ? tokens.grafite : tokens.papel2) : tokens.freijo}
              />
            </mesh>
          );
        }
        return null;
      })}

      {/* Módulos Paramétricos do Cenário */}
      {layout.modulos.map((mod) => {
        const corModulo = obterCorAcabamento(mod.acabamento, acabamentoAtivoHex);
        const regra = CATALOGO_MODULOS_CENARIO[mod.id];
        if (!regra) return null;
        const geo = regra.gerarGeometria(layout.dimensoes);

        // 1. Guarda-roupa piso ao teto (Quarto / Closet)
        if (mod.id === 'guarda-roupa') {
          const numPortas = 4;
          const largPorta = geo.largura / numPortas;
          return (
            <group key={mod.id} position={geo.posicao}>
              <mesh>
                <boxGeometry args={[geo.profundidade, geo.altura, geo.largura]} />
                <meshStandardMaterial color={corModulo} roughness={0.65} />
              </mesh>
              {Array.from({ length: numPortas }).map((_, pIdx) => {
                const zPorta = -geo.largura / 2 + largPorta * pIdx + largPorta / 2;
                return (
                  <group
                    key={`porta-${pIdx}`}
                    position={[geo.profundidade / 2 + 0.008, 0, zPorta]}
                  >
                    <mesh>
                      <boxGeometry args={[0.015, geo.altura - 0.06, largPorta - 0.02]} />
                      <meshStandardMaterial color={corModulo} roughness={0.55} />
                    </mesh>
                    <mesh position={[0.012, -0.1, (pIdx % 2 === 0 ? 1 : -1) * (largPorta * 0.36)]}>
                      <boxGeometry args={[0.015, 0.55, 0.02]} />
                      <meshStandardMaterial color={tokens.grafite} metalness={0.4} roughness={0.4} />
                    </mesh>
                  </group>
                );
              })}
              <mesh position={[geo.profundidade / 2 + 0.02, geo.altura / 2 - 0.03, 0]}>
                <boxGeometry args={[0.02, 0.025, geo.largura - 0.08]} />
                <meshStandardMaterial
                  color={ledAceso ? tokens.dourado : tokens.grafiteSuave}
                  emissive={ledAceso ? tokens.dourado : tokens.preto}
                  emissiveIntensity={ledAceso ? 2.4 : 0}
                />
              </mesh>
              {ledAceso && (
                <pointLight
                  position={[geo.profundidade / 2 + 0.35, geo.altura / 2 - 0.15, 0]}
                  color={tokens.dourado}
                  intensity={1.1}
                  distance={3.2}
                />
              )}
            </group>
          );
        }

        // 2. Cabeceira ripada com LED + Cama (Quarto)
        if (mod.id === 'cabeceira-ripada-led') {
          const numRipas = 24;
          const passoRipa = geo.largura / numRipas;
          return (
            <group key={mod.id} position={geo.posicao}>
              <mesh position={[0, geo.altura / 2, 0]}>
                <boxGeometry args={[geo.largura, geo.altura, 0.04]} />
                <meshStandardMaterial color={tokens.freijo} roughness={0.7} />
              </mesh>
              {Array.from({ length: numRipas }).map((_, rIdx) => (
                <mesh
                  key={`ripa-cab-${rIdx}`}
                  position={[-geo.largura / 2 + rIdx * passoRipa + passoRipa / 2, geo.altura / 2, 0.03]}
                >
                  <boxGeometry args={[passoRipa * 0.62, geo.altura, 0.02]} />
                  <meshStandardMaterial color={corModulo} roughness={0.6} />
                </mesh>
              ))}
              <mesh position={[0, geo.altura + 0.015, 0.02]}>
                <boxGeometry args={[geo.largura, 0.025, 0.03]} />
                <meshStandardMaterial
                  color={ledAceso ? tokens.dourado : tokens.grafiteSuave}
                  emissive={ledAceso ? tokens.dourado : tokens.preto}
                  emissiveIntensity={ledAceso ? 3.2 : 0}
                />
              </mesh>
              {ledAceso && (
                <pointLight
                  position={[0, geo.altura + 0.25, 0.35]}
                  color={tokens.dourado}
                  intensity={2.0}
                  distance={4.0}
                />
              )}
              <group position={[0, 0, 1.02]}>
                <mesh position={[0, 0.18, 0]}>
                  <boxGeometry args={[1.58, 0.36, 1.98]} />
                  <meshStandardMaterial color={corModulo} roughness={0.65} />
                </mesh>
                <mesh position={[0, 0.44, 0]}>
                  <boxGeometry args={[1.48, 0.22, 1.9]} />
                  <meshStandardMaterial color={tokens.papel} roughness={0.9} />
                </mesh>
              </group>
            </group>
          );
        }

        // 3. Mesas de cabeceira suspensas (Quarto)
        if (mod.id === 'criado-mudo') {
          return (
            <group key={mod.id} position={geo.posicao}>
              <mesh position={[-1.05, 0, 0]}>
                <boxGeometry args={[geo.largura, geo.altura, geo.profundidade]} />
                <meshStandardMaterial color={corModulo} roughness={0.6} />
              </mesh>
              <mesh position={[1.05, 0, 0]}>
                <boxGeometry args={[geo.largura, geo.altura, geo.profundidade]} />
                <meshStandardMaterial color={corModulo} roughness={0.6} />
              </mesh>
            </group>
          );
        }

        // 4. Painel de TV ripado com rack (Quarto)
        if (mod.id === 'painel-tv-ripado') {
          const numRipas = 18;
          const passo = geo.largura / numRipas;
          return (
            <group key={mod.id} position={geo.posicao}>
              <mesh position={[0, geo.altura / 2 + 0.2, 0]}>
                <boxGeometry args={[0.04, geo.altura, geo.largura]} />
                <meshStandardMaterial color={corModulo} roughness={0.65} />
              </mesh>
              {Array.from({ length: numRipas }).map((_, idx) => (
                <mesh
                  key={`tv-ripa-${idx}`}
                  position={[-0.03, geo.altura / 2 + 0.2, -geo.largura / 2 + idx * passo + passo / 2]}
                >
                  <boxGeometry args={[0.02, geo.altura, passo * 0.6]} />
                  <meshStandardMaterial color={tokens.freijo} roughness={0.6} />
                </mesh>
              ))}
              <mesh position={[-0.18, 0.48, 0]}>
                <boxGeometry args={[0.36, 0.28, geo.largura]} />
                <meshStandardMaterial color={corModulo} roughness={0.55} />
              </mesh>
              <mesh position={[-0.06, 1.32, 0]}>
                <boxGeometry args={[0.03, 0.72, 1.25]} />
                <meshStandardMaterial color={tokens.preto} roughness={0.2} metalness={0.5} />
              </mesh>
            </group>
          );
        }

        // 5. Bancada em L com cuba e granito preto (Cozinha)
        if (mod.id === 'bancada-l') {
          const braçoOeste = Math.min(2.1, D - 0.8);
          return (
            <group key={mod.id}>
              {/* Bancada Norte */}
              <group position={geo.posicao}>
                <mesh position={[0, geo.altura / 2 - 0.02, 0]}>
                  <boxGeometry args={[geo.largura, geo.altura - 0.04, geo.profundidade]} />
                  <meshStandardMaterial color={corModulo} roughness={0.6} />
                </mesh>
                <mesh position={[0, geo.altura, 0]}>
                  <boxGeometry args={[geo.largura + 0.04, 0.04, geo.profundidade + 0.04]} />
                  <meshStandardMaterial color={tokens.preto} roughness={0.25} metalness={0.2} />
                </mesh>
              </group>
              {/* Retorno em L na Parede Oeste */}
              <group position={[-W / 2 + 0.31, 0, -D / 2 + 0.62 + braçoOeste / 2]}>
                <mesh position={[0, geo.altura / 2 - 0.02, 0]}>
                  <boxGeometry args={[0.62, geo.altura - 0.04, braçoOeste]} />
                  <meshStandardMaterial color={corModulo} roughness={0.6} />
                </mesh>
                <mesh position={[0, geo.altura, 0]}>
                  <boxGeometry args={[0.66, 0.04, braçoOeste + 0.02]} />
                  <meshStandardMaterial color={tokens.preto} roughness={0.25} metalness={0.2} />
                </mesh>
              </group>
            </group>
          );
        }

        // 6. Ilha central ripada com tampo em granito e cooktop (Cozinha)
        if (mod.id === 'ilha') {
          const numRipas = 18;
          const passo = geo.largura / numRipas;
          return (
            <group key={mod.id} position={geo.posicao}>
              <mesh position={[0, geo.altura / 2, 0]}>
                <boxGeometry args={[geo.largura, geo.altura - 0.04, geo.profundidade]} />
                <meshStandardMaterial color={corModulo} roughness={0.65} />
              </mesh>
              {Array.from({ length: numRipas }).map((_, idx) => (
                <mesh
                  key={`ilha-ripa-${idx}`}
                  position={[-geo.largura / 2 + idx * passo + passo / 2, geo.altura / 2, geo.profundidade / 2 + 0.012]}
                >
                  <boxGeometry args={[passo * 0.6, geo.altura - 0.06, 0.02]} />
                  <meshStandardMaterial color={tokens.freijo} roughness={0.6} />
                </mesh>
              ))}
              <mesh position={[0, geo.altura, 0]}>
                <boxGeometry args={[geo.largura + 0.06, 0.045, geo.profundidade + 0.06]} />
                <meshStandardMaterial color={tokens.preto} roughness={0.25} metalness={0.2} />
              </mesh>
              {ledAceso && (
                <pointLight
                  position={[0, geo.altura - 0.15, geo.profundidade / 2 + 0.35]}
                  color={tokens.dourado}
                  intensity={1.5}
                  distance={3.2}
                />
              )}
            </group>
          );
        }

        // 7. Armários superiores até o teto + Fita de LED sob o armário (Cozinha)
        if (mod.id === 'armarios-altos') {
          return (
            <group key={mod.id} position={geo.posicao}>
              <mesh>
                <boxGeometry args={[geo.largura, geo.altura, geo.profundidade]} />
                <meshStandardMaterial color={corModulo} roughness={0.55} />
              </mesh>
              <mesh position={[0, -geo.altura / 2 - 0.015, geo.profundidade / 2 - 0.04]}>
                <boxGeometry args={[geo.largura - 0.1, 0.02, 0.03]} />
                <meshStandardMaterial
                  color={ledAceso ? tokens.dourado : tokens.grafiteSuave}
                  emissive={ledAceso ? tokens.dourado : tokens.preto}
                  emissiveIntensity={ledAceso ? 3.0 : 0}
                />
              </mesh>
              {ledAceso && (
                <pointLight
                  position={[0, -geo.altura / 2 - 0.2, 0.25]}
                  color={tokens.dourado}
                  intensity={1.8}
                  distance={3.2}
                />
              )}
            </group>
          );
        }

        // 8. Torre quente para forno e micro-ondas (Cozinha)
        if (mod.id === 'torre-forno') {
          return (
            <group key={mod.id} position={geo.posicao}>
              <mesh>
                <boxGeometry args={[geo.largura, geo.altura, geo.profundidade]} />
                <meshStandardMaterial color={corModulo} roughness={0.6} />
              </mesh>
              {/* Nichos escuros do forno e micro-ondas */}
              <mesh position={[0, -0.15, geo.profundidade / 2 + 0.008]}>
                <boxGeometry args={[geo.largura * 0.82, 0.58, 0.02]} />
                <meshStandardMaterial color={tokens.preto} roughness={0.2} metalness={0.6} />
              </mesh>
              <mesh position={[0, 0.42, geo.profundidade / 2 + 0.008]}>
                <boxGeometry args={[geo.largura * 0.82, 0.38, 0.02]} />
                <meshStandardMaterial color={tokens.preto} roughness={0.2} metalness={0.6} />
              </mesh>
            </group>
          );
        }

        // 9. Coluna de nichos iluminados em LED (Closet / Home Office)
        if (mod.id === 'nichos-led') {
          const numPrateleiras = 5;
          return (
            <group key={mod.id} position={geo.posicao}>
              <mesh>
                <boxGeometry args={[geo.largura, geo.altura, geo.profundidade]} />
                <meshStandardMaterial color={tokens.freijo} roughness={0.65} />
              </mesh>
              {Array.from({ length: numPrateleiras }).map((_, idx) => {
                const y = -geo.altura / 2 + ((idx + 1) * geo.altura) / (numPrateleiras + 1);
                return (
                  <mesh key={`prateleira-nicho-${idx}`} position={[0, y, geo.profundidade / 2]}>
                    <boxGeometry args={[geo.largura - 0.06, 0.025, 0.04]} />
                    <meshStandardMaterial
                      color={ledAceso ? tokens.dourado : tokens.grafiteSuave}
                      emissive={ledAceso ? tokens.dourado : tokens.preto}
                      emissiveIntensity={ledAceso ? 2.6 : 0}
                    />
                  </mesh>
                );
              })}
              {ledAceso && (
                <pointLight
                  position={[0, 0, geo.profundidade / 2 + 0.3]}
                  color={tokens.dourado}
                  intensity={1.5}
                  distance={3.0}
                />
              )}
            </group>
          );
        }

        // 10. Ilha central de closet (Closet)
        if (mod.id === 'ilha-closet') {
          return (
            <group key={mod.id} position={geo.posicao}>
              <mesh>
                <boxGeometry args={[geo.largura, geo.altura, geo.profundidade]} />
                <meshStandardMaterial color={corModulo} roughness={0.55} />
              </mesh>
              <mesh position={[0, geo.altura / 2 + 0.015, 0]}>
                <boxGeometry args={[geo.largura + 0.02, 0.03, geo.profundidade + 0.02]} />
                <meshStandardMaterial color={tokens.papel} roughness={0.25} />
              </mesh>
            </group>
          );
        }

        // 11. Módulo de sapateira e cabideiros (Closet)
        if (mod.id === 'prateleiras-closet') {
          return (
            <group key={mod.id} position={geo.posicao}>
              <mesh>
                <boxGeometry args={[geo.largura, geo.altura, geo.profundidade]} />
                <meshStandardMaterial color={corModulo} roughness={0.6} />
              </mesh>
              <mesh position={[0, geo.altura / 2 - 0.04, geo.profundidade / 2 + 0.01]}>
                <boxGeometry args={[geo.largura - 0.08, 0.025, 0.02]} />
                <meshStandardMaterial
                  color={ledAceso ? tokens.dourado : tokens.grafiteSuave}
                  emissive={ledAceso ? tokens.dourado : tokens.preto}
                  emissiveIntensity={ledAceso ? 2.5 : 0}
                />
              </mesh>
            </group>
          );
        }

        // 12. Bancada de trabalho em L (Home Office)
        if (mod.id === 'bancada-trabalho') {
          return (
            <group key={mod.id} position={geo.posicao}>
              {/* Tampo da mesa */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[geo.largura, 0.045, geo.profundidade]} />
                <meshStandardMaterial color={corModulo} roughness={0.55} />
              </mesh>
              {/* Pés laterais em painel */}
              <mesh position={[-geo.largura / 2 + 0.03, -0.37, 0]}>
                <boxGeometry args={[0.05, 0.74, geo.profundidade - 0.04]} />
                <meshStandardMaterial color={corModulo} roughness={0.6} />
              </mesh>
              <mesh position={[geo.largura / 2 - 0.03, -0.37, 0]}>
                <boxGeometry args={[0.05, 0.74, geo.profundidade - 0.04]} />
                <meshStandardMaterial color={corModulo} roughness={0.6} />
              </mesh>
            </group>
          );
        }

        // 13. Estante ripada e armário aéreo (Home Office)
        if (mod.id === 'estante-ripada') {
          const numRipas = 16;
          const passo = geo.largura / numRipas;
          return (
            <group key={mod.id} position={geo.posicao}>
              <mesh>
                <boxGeometry args={[geo.profundidade, geo.altura, geo.largura]} />
                <meshStandardMaterial color={corModulo} roughness={0.65} />
              </mesh>
              {Array.from({ length: numRipas }).map((_, idx) => (
                <mesh
                  key={`est-ripa-${idx}`}
                  position={[
                    geo.profundidade / 2 + 0.012,
                    0,
                    -geo.largura / 2 + idx * passo + passo / 2,
                  ]}
                >
                  <boxGeometry args={[0.02, geo.altura - 0.08, passo * 0.6]} />
                  <meshStandardMaterial color={tokens.freijo} roughness={0.6} />
                </mesh>
              ))}
            </group>
          );
        }

        // 14. Gaveteiro de apoio (Home Office)
        if (mod.id === 'gaveteiro') {
          return (
            <group key={mod.id} position={geo.posicao}>
              <mesh>
                <boxGeometry args={[geo.largura, geo.altura, geo.profundidade]} />
                <meshStandardMaterial color={corModulo} roughness={0.58} />
              </mesh>
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
  const posCameraInicial = CENARIOS_AMBIENTES[layout.comodo].posicaoCamera;

  return (
    <Canvas
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      dpr={[1, 1.75]}
      frameloop="demand"
      camera={{ position: posCameraInicial, fov: 42 }}
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
        minDistance={2.4}
        maxDistance={9.0}
      />
    </Canvas>
  );
};
