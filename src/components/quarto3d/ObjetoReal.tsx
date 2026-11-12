import React, { Suspense, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

/**
 * Objetos de decoração com modelo 3D real (fotogrametria CC0 do Poly Haven), otimizados para a web:
 * texturas de 512 px e malha compactada (KHR_mesh_quantization, lida pelo three.js sem decodificador).
 * Medidas em metros, origem na base do objeto.
 */
export const OBJETOS_REAIS = {
  vaso: { url: '/modelos/vaso-ceramica.glb', nome: 'Vaso de cerâmica branca' },
  planta: { url: '/modelos/planta-suculenta.glb', nome: 'Suculenta em vaso branco' },
} as const;

export type ObjetoRealId = keyof typeof OBJETOS_REAIS;

interface ObjetoRealProps {
  id: ObjetoRealId;
  position: [number, number, number];
  rotationY?: number;
  /** Altura final desejada em metros (o modelo é escalado para ela). */
  altura: number;
}

function Modelo({ id, position, rotationY = 0, altura }: ObjetoRealProps) {
  const { scene } = useGLTF(OBJETOS_REAIS[id].url);
  const invalidate = useThree((s) => s.invalidate);
  const copia = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
      }
    });
    // Escala pela altura pedida e apoia a base em y = 0.
    const caixa = new THREE.Box3().setFromObject(c);
    const h = Math.max(0.001, caixa.max.y - caixa.min.y);
    const s = altura / h;
    c.scale.setScalar(s);
    c.position.y = -caixa.min.y * s;
    return c;
  }, [scene, altura]);
  // Cena sob demanda: desenha de novo quando o modelo termina de chegar.
  useEffect(() => invalidate(), [copia, invalidate]);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <primitive object={copia} />
    </group>
  );
}

/** Carrega em segundo plano: a cena aparece na hora e o objeto entra quando chegar. */
export const ObjetoReal: React.FC<ObjetoRealProps> = (props) => (
  <Suspense fallback={null}>
    <Modelo {...props} />
  </Suspense>
);
