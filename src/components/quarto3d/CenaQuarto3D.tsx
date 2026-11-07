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
        intensity={ledAceso ? 0.45 : 1.15}
        color={ledAceso ? tokens.papel : 'white'}
      />
      <directionalLight
        position={[4, 6, 5]}
        intensity={ledAceso ? 0.52 : 1.25}
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
          roughness={cenario.piso === 'porcelanato-claro' ? 0.3 : 0.78}
        />
      </mesh>

      {/* Tapete arquitetônico central para Quarto, Closet e Home Office */}
      {layout.comodo !== 'cozinha' && (
        <mesh position={[0.1, 0.008, 0.15]}>
          <boxGeometry args={[Math.min(2.1, W * 0.58), 0.014, Math.min(1.8, D * 0.52)]} />
          <meshStandardMaterial color={tokens.papel2} roughness={0.95} />
        </mesh>
      )}

      {/* Sombra de contato sob o piso */}
      <mesh position={[0, -espessura - 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W * 1.06, D * 1.06]} />
        <meshBasicMaterial color={tokens.preto} transparent opacity={0.38} />
      </mesh>

      {/* Parede Norte (Fundo) */}
      <mesh position={[0, H / 2, -D / 2 - espessura / 2]}>
        <boxGeometry args={[W + espessura * 2, H, espessura]} />
        <meshStandardMaterial color={tokens.papel} roughness={0.9} />
      </mesh>

      {/* Parede Oeste (Esquerda) */}
      <mesh position={[-W / 2 - espessura / 2, H / 2, 0]}>
        <boxGeometry args={[espessura, H, D]} />
        <meshStandardMaterial color={tokens.papel2} roughness={0.9} />
      </mesh>

      {/* Parede Leste (Meia altura transparente para corte arquitetônico) */}
      <mesh position={[W / 2 + espessura / 2, H * 0.45, 0]}>
        <boxGeometry args={[espessura, H * 0.9, D]} />
        <meshStandardMaterial color={tokens.papel2} roughness={0.92} transparent opacity={0.28} />
      </mesh>

      {/* Rodapés arquitetônicos em todo o perímetro interno */}
      <group>
        {/* Rodapé Norte */}
        <mesh position={[0, 0.045, -D / 2 + 0.01]}>
          <boxGeometry args={[W, 0.09, 0.02]} />
          <meshStandardMaterial color={tokens.papel2} roughness={0.6} />
        </mesh>
        {/* Rodapé Oeste */}
        <mesh position={[-W / 2 + 0.01, 0.045, 0]}>
          <boxGeometry args={[0.02, 0.09, D]} />
          <meshStandardMaterial color={tokens.papel} roughness={0.6} />
        </mesh>
        {/* Rodapé Leste */}
        <mesh position={[W / 2 - 0.01, 0.045, 0]}>
          <boxGeometry args={[0.02, 0.09, D]} />
          <meshStandardMaterial color={tokens.papel} roughness={0.6} />
        </mesh>
      </group>

      {/* Sanca de gesso superior com fita de LED perimetral */}
      <group>
        {/* Sanca Norte */}
        <mesh position={[0, H - 0.04, -D / 2 + 0.14]}>
          <boxGeometry args={[W, 0.06, 0.28]} />
          <meshStandardMaterial color={tokens.papel} roughness={0.85} />
        </mesh>
        <mesh position={[0, H - 0.075, -D / 2 + 0.24]}>
          <boxGeometry args={[W - 0.16, 0.018, 0.02]} />
          <meshStandardMaterial
            color={ledAceso ? tokens.dourado : tokens.grafiteSuave}
            emissive={ledAceso ? tokens.dourado : tokens.preto}
            emissiveIntensity={ledAceso ? 2.2 : 0}
          />
        </mesh>
        {/* Sanca Oeste */}
        <mesh position={[-W / 2 + 0.14, H - 0.04, 0]}>
          <boxGeometry args={[0.28, 0.06, D]} />
          <meshStandardMaterial color={tokens.papel} roughness={0.85} />
        </mesh>
        <mesh position={[-W / 2 + 0.24, H - 0.075, 0]}>
          <boxGeometry args={[0.02, 0.018, D - 0.16]} />
          <meshStandardMaterial
            color={ledAceso ? tokens.dourado : tokens.grafiteSuave}
            emissive={ledAceso ? tokens.dourado : tokens.preto}
            emissiveIntensity={ledAceso ? 2.0 : 0}
          />
        </mesh>
      </group>

      {/* Aberturas do cenário (janelas com esquadria + persianas e portas com guarnição) */}
      {layout.aberturas.map((ab, idx) => {
        const ehJanela = ab.tipo === 'janela';
        const larg = Math.min(ab.largura_m, W * 0.55);
        const alt = ehJanela ? 1.15 : 2.1;
        const posY = ehJanela ? 1.48 : alt / 2;

        if (ab.parede === 'N') {
          return (
            <group key={`ab-${idx}`} position={[ab.posicaoOffset_m, posY, -D / 2 + 0.015]}>
              {/* Moldura / Esquadria */}
              <mesh>
                <boxGeometry args={[larg + 0.08, alt + 0.08, 0.03]} />
                <meshStandardMaterial
                  color={ehJanela ? tokens.grafite : tokens.freijo}
                  roughness={0.5}
                />
              </mesh>
              {/* Vidro ou folha da porta */}
              <mesh position={[0, 0, 0.012]}>
                <boxGeometry args={[larg, alt, 0.015]} />
                <meshStandardMaterial
                  color={ehJanela ? (ledAceso ? tokens.grafiteSuave : tokens.papel) : tokens.freijo}
                  roughness={ehJanela ? 0.2 : 0.65}
                  metalness={ehJanela ? 0.3 : 0.05}
                />
              </mesh>
              {/* Travessa central da esquadria de janela */}
              {ehJanela && (
                <mesh position={[0, 0, 0.024]}>
                  <boxGeometry args={[0.03, alt, 0.015]} />
                  <meshStandardMaterial color={tokens.grafite} />
                </mesh>
              )}
            </group>
          );
        }
        if (ab.parede === 'O') {
          return (
            <group
              key={`ab-${idx}`}
              position={[-W / 2 + 0.015, posY, ab.posicaoOffset_m]}
              rotation={[0, Math.PI / 2, 0]}
            >
              <mesh>
                <boxGeometry args={[larg + 0.08, alt + 0.08, 0.03]} />
                <meshStandardMaterial
                  color={ehJanela ? tokens.grafite : tokens.freijo}
                  roughness={0.5}
                />
              </mesh>
              <mesh position={[0, 0, 0.012]}>
                <boxGeometry args={[larg, alt, 0.015]} />
                <meshStandardMaterial
                  color={ehJanela ? (ledAceso ? tokens.grafiteSuave : tokens.papel) : tokens.freijo}
                  roughness={ehJanela ? 0.2 : 0.65}
                  metalness={ehJanela ? 0.3 : 0.05}
                />
              </mesh>
              {ehJanela && (
                <mesh position={[0, 0, 0.024]}>
                  <boxGeometry args={[0.03, alt, 0.015]} />
                  <meshStandardMaterial color={tokens.grafite} />
                </mesh>
              )}
            </group>
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
                    {/* Puxador cava linear em alumínio */}
                    <mesh position={[0.012, -0.1, (pIdx % 2 === 0 ? 1 : -1) * (largPorta * 0.36)]}>
                      <boxGeometry args={[0.015, 0.65, 0.02]} />
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

        // 2. Cabeceira ripada com LED + Cama completa com travesseiros e peseira (Quarto)
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
              {/* Cama com base em marcenaria, colchão, travesseiros e manta */}
              <group position={[0, 0, 1.02]}>
                <mesh position={[0, 0.18, 0]}>
                  <boxGeometry args={[1.58, 0.36, 1.98]} />
                  <meshStandardMaterial color={corModulo} roughness={0.65} />
                </mesh>
                <mesh position={[0, 0.44, 0]}>
                  <boxGeometry args={[1.48, 0.22, 1.9]} />
                  <meshStandardMaterial color={tokens.papel} roughness={0.9} />
                </mesh>
                {/* Travesseiros */}
                <mesh position={[-0.36, 0.59, -0.7]}>
                  <boxGeometry args={[0.56, 0.11, 0.34]} />
                  <meshStandardMaterial color={tokens.papel} roughness={0.85} />
                </mesh>
                <mesh position={[0.36, 0.59, -0.7]}>
                  <boxGeometry args={[0.56, 0.11, 0.34]} />
                  <meshStandardMaterial color={tokens.papel} roughness={0.85} />
                </mesh>
                {/* Manta / Peseira */}
                <mesh position={[0, 0.46, 0.55]}>
                  <boxGeometry args={[1.5, 0.23, 0.65]} />
                  <meshStandardMaterial color={tokens.areia} roughness={0.92} />
                </mesh>
              </group>
            </group>
          );
        }

        // 3. Mesas de cabeceira suspensas + luminárias pendentes (Quarto)
        if (mod.id === 'criado-mudo') {
          return (
            <group key={mod.id} position={geo.posicao}>
              {[-1.05, 1.05].map((posX, idx) => (
                <group key={`cm-${idx}`} position={[posX, 0, 0]}>
                  <mesh>
                    <boxGeometry args={[geo.largura, geo.altura, geo.profundidade]} />
                    <meshStandardMaterial color={corModulo} roughness={0.6} />
                  </mesh>
                  {/* Frente de gaveta com cava */}
                  <mesh position={[0, 0, geo.profundidade / 2 + 0.008]}>
                    <boxGeometry args={[geo.largura - 0.04, geo.altura - 0.04, 0.015]} />
                    <meshStandardMaterial color={tokens.freijo} roughness={0.55} />
                  </mesh>
                  {/* Luminária pendente cilíndrica */}
                  <mesh position={[0, 1.05, 0]}>
                    <cylinderGeometry args={[0.006, 0.006, 1.1, 8]} />
                    <meshStandardMaterial color={tokens.grafite} />
                  </mesh>
                  <mesh position={[0, 0.46, 0]}>
                    <cylinderGeometry args={[0.045, 0.045, 0.16, 12]} />
                    <meshStandardMaterial
                      color={ledAceso ? tokens.dourado : tokens.grafite}
                      emissive={ledAceso ? tokens.dourado : tokens.preto}
                      emissiveIntensity={ledAceso ? 1.8 : 0}
                    />
                  </mesh>
                </group>
              ))}
            </group>
          );
        }

        // 4. Painel de TV ripado com rack suspenso (Quarto)
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

        // 5. NOVO: Penteadeira camarim com espelho iluminado em LED e puff (Quarto / Closet)
        if (mod.id === 'penteadeira-camarim') {
          return (
            <group key={mod.id} position={geo.posicao}>
              {/* Bancada suspensa com gaveta organizadora */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[geo.largura, 0.14, geo.profundidade]} />
                <meshStandardMaterial color={corModulo} roughness={0.55} />
              </mesh>
              {/* Moldura do espelho com halo de LED */}
              <mesh position={[0, 0.56, -geo.profundidade / 2 + 0.03]}>
                <boxGeometry args={[geo.largura * 0.78, 0.85, 0.025]} />
                <meshStandardMaterial
                  color={ledAceso ? tokens.dourado : tokens.grafiteSuave}
                  emissive={ledAceso ? tokens.dourado : tokens.preto}
                  emissiveIntensity={ledAceso ? 2.5 : 0}
                />
              </mesh>
              {/* Espelho central */}
              <mesh position={[0, 0.56, -geo.profundidade / 2 + 0.048]}>
                <boxGeometry args={[geo.largura * 0.72, 0.78, 0.015]} />
                <meshStandardMaterial color={tokens.papel} roughness={0.12} metalness={0.75} />
              </mesh>
              {/* Banqueta / Puff estofado sob a penteadeira */}
              <mesh position={[0, -0.52, 0.12]}>
                <cylinderGeometry args={[0.21, 0.21, 0.44, 16]} />
                <meshStandardMaterial color={tokens.areia} roughness={0.85} />
              </mesh>
            </group>
          );
        }

        // 6. NOVO: Bancada de estudo suspensa + nicho aéreo (Quarto)
        if (mod.id === 'bancada-estudo-quarto') {
          return (
            <group key={mod.id} position={geo.posicao}>
              {/* Tampo suspenso na parede Oeste */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[geo.profundidade, 0.1, geo.largura]} />
                <meshStandardMaterial color={corModulo} roughness={0.55} />
              </mesh>
              {/* Nicho aéreo superior */}
              <mesh position={[-0.08, 0.78, 0]}>
                <boxGeometry args={[0.3, 0.34, geo.largura]} />
                <meshStandardMaterial color={tokens.freijo} roughness={0.6} />
              </mesh>
              {/* Notebook sobre a bancada */}
              <mesh position={[0.04, 0.06, 0]}>
                <boxGeometry args={[0.24, 0.015, 0.34]} />
                <meshStandardMaterial color={tokens.grafite} metalness={0.5} />
              </mesh>
            </group>
          );
        }

        // 7. Bancada em L com cuba gourmet, torneira e granito preto (Cozinha)
        if (mod.id === 'bancada-l') {
          const bracoOeste = Math.min(2.1, D - 0.8);
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
                {/* Cuba inox embutida + Torneira gourmet */}
                <mesh position={[-0.25, geo.altura + 0.022, 0.02]}>
                  <boxGeometry args={[0.62, 0.01, 0.4]} />
                  <meshStandardMaterial color={tokens.grafite} metalness={0.75} roughness={0.25} />
                </mesh>
                <mesh position={[-0.25, geo.altura + 0.18, -0.18]}>
                  <cylinderGeometry args={[0.014, 0.014, 0.32, 10]} />
                  <meshStandardMaterial color={tokens.dourado} metalness={0.8} roughness={0.2} />
                </mesh>
              </group>
              {/* Retorno em L na Parede Oeste */}
              <group position={[-W / 2 + 0.31, 0, -D / 2 + 0.62 + bracoOeste / 2]}>
                <mesh position={[0, geo.altura / 2 - 0.02, 0]}>
                  <boxGeometry args={[0.62, geo.altura - 0.04, bracoOeste]} />
                  <meshStandardMaterial color={corModulo} roughness={0.6} />
                </mesh>
                <mesh position={[0, geo.altura, 0]}>
                  <boxGeometry args={[0.66, 0.04, bracoOeste + 0.02]} />
                  <meshStandardMaterial color={tokens.preto} roughness={0.25} metalness={0.2} />
                </mesh>
              </group>
            </group>
          );
        }

        // 8. Ilha central ripada com tampo em granito, cooktop e 2 banquetas altas (Cozinha)
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
              {/* Tampo em Granito Preto */}
              <mesh position={[0, geo.altura, 0]}>
                <boxGeometry args={[geo.largura + 0.06, 0.045, geo.profundidade + 0.08]} />
                <meshStandardMaterial color={tokens.preto} roughness={0.22} metalness={0.22} />
              </mesh>
              {/* Cooktop de indução embutido */}
              <mesh position={[0.22, geo.altura + 0.026, -0.05]}>
                <boxGeometry args={[0.65, 0.01, 0.46]} />
                <meshStandardMaterial color={tokens.preto} roughness={0.1} metalness={0.7} />
              </mesh>
              {/* 2 Banquetas altas em frente à ilha */}
              {[-0.44, 0.44].map((xBanq, bIdx) => (
                <group
                  key={`banq-${bIdx}`}
                  position={[xBanq, 0, geo.profundidade / 2 + 0.3]}
                >
                  <mesh position={[0, 0.64, 0]}>
                    <boxGeometry args={[0.38, 0.06, 0.36]} />
                    <meshStandardMaterial color={tokens.freijo} roughness={0.55} />
                  </mesh>
                  <mesh position={[0, 0.76, 0.15]}>
                    <boxGeometry args={[0.38, 0.22, 0.05]} />
                    <meshStandardMaterial color={tokens.freijo} roughness={0.55} />
                  </mesh>
                  <mesh position={[0, 0.32, 0]}>
                    <cylinderGeometry args={[0.022, 0.022, 0.64, 10]} />
                    <meshStandardMaterial color={tokens.preto} metalness={0.5} />
                  </mesh>
                </group>
              ))}
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

        // 9. Armários superiores até o teto + Fita de LED sob o armário (Cozinha)
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

        // 10. Torre quente para forno e micro-ondas (Cozinha)
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

        // 11. NOVO: Adega e cristaleira iluminada em LED (Cozinha)
        if (mod.id === 'cristaleira-led') {
          return (
            <group key={mod.id} position={geo.posicao}>
              <mesh>
                <boxGeometry args={[geo.profundidade, geo.altura, geo.largura]} />
                <meshStandardMaterial color={tokens.freijo} roughness={0.6} />
              </mesh>
              {/* Prateleiras internas iluminadas */}
              {[-0.6, -0.2, 0.2, 0.6].map((yPrat, pIdx) => (
                <mesh key={`crist-p-${pIdx}`} position={[geo.profundidade / 2 + 0.01, yPrat, 0]}>
                  <boxGeometry args={[0.02, 0.025, geo.largura - 0.08]} />
                  <meshStandardMaterial
                    color={ledAceso ? tokens.dourado : tokens.grafiteSuave}
                    emissive={ledAceso ? tokens.dourado : tokens.preto}
                    emissiveIntensity={ledAceso ? 2.4 : 0}
                  />
                </mesh>
              ))}
              {ledAceso && (
                <pointLight
                  position={[geo.profundidade / 2 + 0.3, 0.1, 0]}
                  color={tokens.dourado}
                  intensity={1.3}
                  distance={2.8}
                />
              )}
            </group>
          );
        }

        // 12. NOVO: Pórtico e forro ripado no teto com perfil de LED (Cozinha)
        if (mod.id === 'forro-ripado-teto') {
          const numRipas = 16;
          const passo = geo.largura / numRipas;
          return (
            <group key={mod.id} position={geo.posicao}>
              <mesh>
                <boxGeometry args={[geo.largura, geo.altura, geo.profundidade]} />
                <meshStandardMaterial color={tokens.freijo} roughness={0.62} />
              </mesh>
              {Array.from({ length: numRipas }).map((_, idx) => (
                <mesh
                  key={`teto-ripa-${idx}`}
                  position={[-geo.largura / 2 + idx * passo + passo / 2, -0.04, 0]}
                >
                  <boxGeometry args={[passo * 0.58, 0.025, geo.profundidade]} />
                  <meshStandardMaterial color={corModulo} roughness={0.6} />
                </mesh>
              ))}
              {/* Perfil linear de LED embutido no forro ripado */}
              <mesh position={[0, -0.055, 0]}>
                <boxGeometry args={[geo.largura * 0.75, 0.018, 0.04]} />
                <meshStandardMaterial
                  color={ledAceso ? tokens.dourado : tokens.grafiteSuave}
                  emissive={ledAceso ? tokens.dourado : tokens.preto}
                  emissiveIntensity={ledAceso ? 3.0 : 0}
                />
              </mesh>
            </group>
          );
        }

        // 13. Coluna de nichos iluminados em LED (Closet / Home Office)
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

        // 14. Ilha central vitrine de closet (Closet)
        if (mod.id === 'ilha-closet') {
          return (
            <group key={mod.id} position={geo.posicao}>
              <mesh>
                <boxGeometry args={[geo.largura, geo.altura, geo.profundidade]} />
                <meshStandardMaterial color={corModulo} roughness={0.55} />
              </mesh>
              <mesh position={[0, geo.altura / 2 + 0.015, 0]}>
                <boxGeometry args={[geo.largura + 0.02, 0.03, geo.profundidade + 0.02]} />
                <meshStandardMaterial color={tokens.papel} roughness={0.2} metalness={0.3} />
              </mesh>
            </group>
          );
        }

        // 15. Colmeia de cabideiros e bolsas (Closet)
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

        // 16. NOVO: Sapateira vertical + espelho corpo inteiro iluminado (Closet)
        if (mod.id === 'sapateira-espelhada') {
          return (
            <group key={mod.id} position={geo.posicao}>
              <mesh>
                <boxGeometry args={[geo.profundidade, geo.altura, geo.largura]} />
                <meshStandardMaterial color={corModulo} roughness={0.6} />
              </mesh>
              {/* Espelho de corpo inteiro na metade frontal */}
              <mesh position={[-geo.profundidade / 2 - 0.012, 0, -geo.largura * 0.2]}>
                <boxGeometry args={[0.015, geo.altura - 0.14, geo.largura * 0.48]} />
                <meshStandardMaterial color={tokens.papel} roughness={0.12} metalness={0.8} />
              </mesh>
              {/* Fita de LED vertical ao lado do espelho */}
              <mesh position={[-geo.profundidade / 2 - 0.014, 0, 0.06]}>
                <boxGeometry args={[0.018, geo.altura - 0.16, 0.025]} />
                <meshStandardMaterial
                  color={ledAceso ? tokens.dourado : tokens.grafiteSuave}
                  emissive={ledAceso ? tokens.dourado : tokens.preto}
                  emissiveIntensity={ledAceso ? 2.4 : 0}
                />
              </mesh>
            </group>
          );
        }

        // 17. Bancada dupla executiva + monitor ultrawide + cadeira (Home Office)
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
              {/* Monitor Ultrawide sobre a bancada */}
              <mesh position={[0, 0.26, -0.12]}>
                <boxGeometry args={[0.78, 0.34, 0.025]} />
                <meshStandardMaterial color={tokens.preto} roughness={0.2} metalness={0.6} />
              </mesh>
              <mesh position={[0, 0.06, -0.14]}>
                <boxGeometry args={[0.16, 0.08, 0.14]} />
                <meshStandardMaterial color={tokens.grafite} metalness={0.5} />
              </mesh>
              {/* Cadeira executiva */}
              <group position={[0, -0.28, 0.44]}>
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.48, 0.06, 0.46]} />
                  <meshStandardMaterial color={tokens.grafite} roughness={0.7} />
                </mesh>
                <mesh position={[0, 0.28, 0.2]}>
                  <boxGeometry args={[0.46, 0.52, 0.06]} />
                  <meshStandardMaterial color={tokens.grafite} roughness={0.7} />
                </mesh>
                <mesh position={[0, -0.22, 0]}>
                  <cylinderGeometry args={[0.03, 0.03, 0.42, 10]} />
                  <meshStandardMaterial color={tokens.preto} metalness={0.5} />
                </mesh>
              </group>
            </group>
          );
        }

        // 18. Estante ripada e biblioteca (Home Office)
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

        // 19. Gaveteiro de apoio (Home Office)
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

        // 20. NOVO: Armário aéreo basculante com fita de LED (Home Office)
        if (mod.id === 'armario-aereo-office') {
          return (
            <group key={mod.id} position={geo.posicao}>
              <mesh>
                <boxGeometry args={[geo.largura, geo.altura, geo.profundidade]} />
                <meshStandardMaterial color={corModulo} roughness={0.55} />
              </mesh>
              <mesh position={[0, -geo.altura / 2 - 0.015, geo.profundidade / 2 - 0.03]}>
                <boxGeometry args={[geo.largura - 0.08, 0.02, 0.03]} />
                <meshStandardMaterial
                  color={ledAceso ? tokens.dourado : tokens.grafiteSuave}
                  emissive={ledAceso ? tokens.dourado : tokens.preto}
                  emissiveIntensity={ledAceso ? 2.6 : 0}
                />
              </mesh>
            </group>
          );
        }

        // 21. NOVO: Sofá de leitura e recepção lateral (Home Office)
        if (mod.id === 'sofa-recepcao') {
          return (
            <group key={mod.id} position={geo.posicao}>
              {/* Assento */}
              <mesh position={[0, 0.22, 0]}>
                <boxGeometry args={[geo.profundidade, 0.36, geo.largura]} />
                <meshStandardMaterial color={tokens.areia} roughness={0.85} />
              </mesh>
              {/* Encosto */}
              <mesh position={[geo.profundidade / 2 - 0.08, 0.52, 0]}>
                <boxGeometry args={[0.16, 0.42, geo.largura]} />
                <meshStandardMaterial color={tokens.areia} roughness={0.85} />
              </mesh>
              {/* Base em madeira freijó */}
              <mesh position={[0, 0.04, 0]}>
                <boxGeometry args={[geo.profundidade + 0.02, 0.06, geo.largura + 0.02]} />
                <meshStandardMaterial color={tokens.freijo} roughness={0.6} />
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
