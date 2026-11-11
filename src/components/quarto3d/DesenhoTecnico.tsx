import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Html, OrthographicCamera } from '@react-three/drei';
import { QuartoLayout } from './schema';
import { Instancia } from './motorGeometrico';
import { Cota, Parede, comprimento, cotasElevacao, cotasPlanta } from './cotas';

/** Traço de lápis do site sobre fundo escuro: --dourado (DESIGN.md). */
const LAPIS = '#D4A84F';
const CHAMADA = 0.08;

type Controles = { target: THREE.Vector3; update: () => void };

/** Normal da face interna de cada parede: a câmera da elevação fica desse lado, olhando para ela. */
const DENTRO: Record<Parede, [number, number]> = { N: [0, 1], S: [0, -1], O: [1, 0], L: [-1, 0] };

/** Câmera sem perspectiva para planta e elevação, enquadrando o ambiente e as cotas. */
export const CameraTecnica: React.FC<{ layout: QuartoLayout; vista: 'planta' | 'elevacao'; parede: Parede; pedido: number }> = ({
  layout,
  vista,
  parede,
  pedido,
}) => {
  const ref = useRef<THREE.OrthographicCamera>(null);
  const { size, controls, invalidate } = useThree();
  const { largura_m: W, profundidade_m: D, pe_direito_m: H } = layout.dimensoes;

  useLayoutEffect(() => {
    const cam = ref.current;
    if (!cam) return;
    let pos: [number, number, number];
    let alvo: [number, number, number];
    let largura: number;
    let altura: number;
    if (vista === 'planta') {
      pos = [0, 30, 0.001];
      alvo = [0, 0, 0];
      largura = W + 3.2;
      altura = D + 3.2;
    } else {
      const [nx, nz] = DENTRO[parede];
      const yc = H / 2 - 0.3;
      alvo = [0, yc, 0];
      pos = [nx * 30, yc, nz * 30];
      largura = comprimento(parede, layout.dimensoes) + 1.8;
      altura = H + 1.8;
    }
    cam.position.set(...pos);
    cam.zoom = Math.min(size.width / largura, size.height / altura);
    cam.lookAt(...alvo);
    cam.updateProjectionMatrix();
    const c = controls as unknown as Controles | null;
    if (c) {
      c.target.set(...alvo);
      c.update();
    }
    invalidate();
  }, [vista, parede, pedido, W, D, H, size.width, size.height, controls, invalidate, layout.dimensoes]);

  return <OrthographicCamera makeDefault ref={ref} near={0.1} far={80} />;
};

/** Linhas da cota: a medida, as linhas de chamada nas pontas e um traço inclinado (marca de arquiteto). */
function geometriaCotas(cotas: Cota[]): THREE.BufferGeometry {
  const pts: number[] = [];
  const v = new THREE.Vector3();
  cotas.forEach(({ de, ate, chamada }) => {
    const a = new THREE.Vector3(...de);
    const b = new THREE.Vector3(...ate);
    const n = new THREE.Vector3(...chamada).normalize();
    const dir = v.copy(b).sub(a).normalize().clone();
    pts.push(...a.toArray(), ...b.toArray());
    [a, b].forEach((p) => {
      pts.push(...p.clone().addScaledVector(n, CHAMADA).toArray(), ...p.clone().addScaledVector(n, -CHAMADA).toArray());
      const diag = dir.clone().add(n).normalize().multiplyScalar(CHAMADA * 0.8);
      pts.push(...p.clone().add(diag).toArray(), ...p.clone().sub(diag).toArray());
    });
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return g;
}

/** Cotas em cm desenhadas sobre a cena (sempre visíveis, sem profundidade). */
export const Cotas: React.FC<{ layout: QuartoLayout; vista: 'planta' | 'elevacao'; parede: Parede }> = ({ layout, vista, parede }) => {
  const cotas = useMemo(() => {
    const modulos = layout.modulos as Instancia[];
    return vista === 'planta'
      ? cotasPlanta(modulos, layout.aberturas, layout.dimensoes)
      : cotasElevacao(modulos, layout.aberturas, layout.dimensoes, parede);
  }, [layout.modulos, layout.aberturas, layout.dimensoes, vista, parede]);
  const geo = useMemo(() => geometriaCotas(cotas), [cotas]);
  useEffect(() => () => geo.dispose(), [geo]);

  return (
    <group>
      <lineSegments geometry={geo} renderOrder={10}>
        <lineBasicMaterial color={LAPIS} depthTest={false} transparent toneMapped={false} />
      </lineSegments>
      {cotas.map((c, i) => {
        const meio: [number, number, number] = [
          (c.de[0] + c.ate[0]) / 2 + c.chamada[0] * 0.13,
          (c.de[1] + c.ate[1]) / 2 + c.chamada[1] * 0.13,
          (c.de[2] + c.ate[2]) / 2 + c.chamada[2] * 0.13,
        ];
        return (
          <Html key={i} position={meio} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
            <span className="tipo-cota text-papel bg-preto/85 px-4 whitespace-nowrap leading-none" style={{ fontSize: 11 }}>
              {c.texto}
            </span>
          </Html>
        );
      })}
    </group>
  );
};
