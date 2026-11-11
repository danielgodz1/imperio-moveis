import React, { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Kit3D } from './materiais3D';
import { Frente, Marcenaria, MaterialPeca, Movimento, Peca } from './marcenaria';
import { useEditor } from './estadoEditor';
import { sementeDe } from '../../data/materiais/catalogo';

/** Ângulo de abertura das portas no "ver por dentro" (100°). */
const ANGULO_ABERTO = (100 * Math.PI) / 180;
const DURACAO = 0.45;

const suave = (t: number) => t * t * (3 - 2 * t);

function materialDe(m: MaterialPeca, k: Kit3D, frente: THREE.Material): THREE.Material {
  switch (m) {
    case 'frente':
      return frente;
    case 'metal':
      return k.m.puxador;
    case 'sombra':
      return k.m.preto;
    default:
      return k.m.corpo;
  }
}

/**
 * Chapa com fita de borda: as duas faces largas levam o acabamento; as quatro bordas finas,
 * a fita (ordem das faces da caixa: +x, -x, +y, -y, +z, -z).
 */
function materiaisDaChapa(p: Peca, k: Kit3D, frente: THREE.Material): THREE.Material | THREE.Material[] {
  const mat = materialDe(p.material, k, frente);
  if (p.material === 'metal' || p.material === 'sombra') return mat;
  const fina = p.tamanho.indexOf(Math.min(...p.tamanho));
  const fita = k.fitaDe(mat);
  return [0, 0, 1, 1, 2, 2].map((eixo) => (eixo === fina ? mat : fita));
}

const Pecas: React.FC<{ pecas: Peca[]; k: Kit3D; frente: THREE.Material; semente: number }> = ({ pecas, k, frente, semente }) => {
  const sombra = !k.mobile;
  return (
    <>
      {pecas.map((p, i) => (
        <mesh
          key={i}
          geometry={k.caixa(p.tamanho[0], p.tamanho[1], p.tamanho[2], p.veio, sementeDe(semente, i, ...p.posicao))}
          material={materiaisDaChapa(p, k, frente)}
          position={p.posicao}
          castShadow={sombra && p.material !== 'metal'}
          receiveShadow={sombra}
        />
      ))}
    </>
  );
};

function posicionar(externo: THREE.Group, mov: Movimento, t: number) {
  const e = suave(t);
  if (mov.tipo === 'giro') externo.rotation.y = mov.sentido * ANGULO_ABERTO * e;
  else if (mov.tipo === 'gaveta') externo.position.z = mov.curso * e;
  else externo.position.x = mov.deslocamento * e;
}

/** Frente que abre e fecha com o "ver por dentro", animada pelo laço do próprio Canvas. */
const FrenteMovel: React.FC<{ f: Frente; k: Kit3D; frente: THREE.Material; aberto: boolean; semMovimento: boolean }> = ({
  f,
  k,
  frente,
  aberto,
  semMovimento,
}) => {
  const externo = useRef<THREE.Group>(null);
  const progresso = useRef(aberto ? 1 : 0);
  const { invalidate } = useThree();

  useLayoutEffect(() => {
    if (externo.current) posicionar(externo.current, f.movimento, progresso.current);
    invalidate();
  }, [f, aberto, invalidate]);

  useFrame((_, dt) => {
    const alvo = aberto ? 1 : 0;
    if (progresso.current === alvo || !externo.current) return;
    const passo = semMovimento ? 1 : Math.min(dt, 0.05) / DURACAO;
    progresso.current = alvo > progresso.current ? Math.min(alvo, progresso.current + passo) : Math.max(alvo, progresso.current - passo);
    posicionar(externo.current, f.movimento, progresso.current);
    if (progresso.current !== alvo) invalidate();
  });

  if (f.movimento.tipo === 'giro') {
    const [px, pz] = f.movimento.pivo;
    return (
      <group ref={externo} position={[px, 0, pz]}>
        <group position={[-px, 0, -pz]}>
          <Pecas pecas={f.pecas} k={k} frente={frente} semente={2} />
        </group>
      </group>
    );
  }
  return (
    <group ref={externo}>
      <Pecas pecas={f.pecas} k={k} frente={frente} semente={2} />
    </group>
  );
};

/** Desenha um móvel gerado por `marcenaria.ts`. */
export const MovelMarcenaria: React.FC<{ m: Marcenaria; k: Kit3D; frente: THREE.Material }> = ({ m, k, frente }) => {
  const aberto = useEditor((e) => e.verDentro);
  const semMovimento = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );
  return (
    <group>
      <Pecas pecas={m.fixas} k={k} frente={frente} semente={1} />
      {m.frentes.map((f) => (
        <FrenteMovel key={f.id} f={f} k={k} frente={frente} aberto={aberto} semMovimento={semMovimento} />
      ))}
    </group>
  );
};
