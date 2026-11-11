import React from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { ModuloId } from '../../data/cenarios';
import { Kit3D } from './materiais3D';
import { retornoBancada, Dimensoes } from './motorGeometrico';

type V3 = [number, number, number];
const CHAPA = 0.018;
const FOLGA = 0.004;

export interface PropsMovel {
  w: number;
  h: number;
  d: number;
  a: THREE.Material;
  k: Kit3D;
  led: boolean;
  tampo: THREE.Material;
  dim: Dimensoes;
}

function fabrica(k: Kit3D) {
  const sombra = !k.mobile;
  return (s: V3, p: V3, m: THREE.Material, veio: 'x' | 'y' = 'y', projeta = true) => (
    <mesh
      geometry={k.caixa(s[0], s[1], s[2], veio)}
      material={m}
      position={p}
      castShadow={sombra && projeta}
      receiveShadow={sombra}
    />
  );
}

const Fita: React.FC<{ k: Kit3D; led: boolean; s: V3; p: V3 }> = ({ k, led, s, p }) => (
  <mesh geometry={k.caixa(s[0], s[1], s[2], 'x')} material={led ? k.m.ledLigado : k.m.ledDesligado} position={p} />
);

/** Lavagem de luz da fita de LED numa superfície vertical (topo = origem da luz). */
const Brilho: React.FC<{ k: Kit3D; led: boolean; l: number; a: number; p: V3; rot?: V3 }> = ({ k, led, l, a, p, rot }) =>
  led ? <mesh geometry={k.plano(l, a)} material={k.m.brilho} position={p} rotation={rot} /> : null;

/** Fila de portas com folga real e fundo escuro que desenha as juntas. */
const Portas: React.FC<{
  k: Kit3D;
  w: number;
  h: number;
  z: number;
  n: number;
  a: THREE.Material;
  y?: number;
  puxador?: 'vertical' | 'horizontal' | 'nenhum';
}> = ({ k, w, h, z, n, a, y = h / 2, puxador = 'vertical' }) => {
  const C = fabrica(k);
  const passo = w / n;
  return (
    <group>
      {C([w, h, 0.002], [0, y, z], k.m.folga, 'x', false)}
      {Array.from({ length: n }, (_, i) => {
        const x = -w / 2 + passo * (i + 0.5);
        const lado = i % 2 === 0 ? 1 : -1;
        return (
          <group key={i} position={[x, y, z + CHAPA / 2 + 0.001]}>
            {C([passo - FOLGA, h - FOLGA, CHAPA], [0, 0, 0], a)}
            {puxador === 'vertical' &&
              C(
                [0.012, Math.min(0.5, h * 0.28), 0.022],
                [(lado * (passo - 0.09)) / 2, 0, CHAPA / 2 + 0.011],
                k.m.cromo,
                'y',
                false
              )}
            {puxador === 'horizontal' &&
              C([Math.min(0.4, passo * 0.5), 0.012, 0.022], [0, h / 2 - 0.05, CHAPA / 2 + 0.011], k.m.cromo, 'x', false)}
          </group>
        );
      })}
    </group>
  );
};

/** Livros e objetos de nicho, com ritmo fixo e sem repetição visível. */
const Livros: React.FC<{ k: Kit3D; l: number; a: number; y: number; z: number; semente: number }> = ({ k, l, a, y, z, semente }) => {
  if (k.mobile) return null;
  const C = fabrica(k);
  const cores = [k.m.livroA, k.m.livroB, k.m.livroC];
  const itens: React.ReactNode[] = [];
  let x = -l / 2 + 0.05;
  let i = semente;
  while (x < l / 2 - 0.3 && itens.length < 7) {
    i += 1;
    const larg = 0.025 + ((i * 7) % 5) * 0.008;
    const alt = a * (0.62 + ((i * 3) % 4) * 0.07);
    itens.push(<group key={i}>{C([larg, alt, 0.17], [x, y + alt / 2, z], cores[i % 3], 'y', false)}</group>);
    x += larg + 0.004;
  }
  return <>{itens}</>;
};

const GuardaRoupa: React.FC<PropsMovel> = ({ w, h, d, a, k, led }) => {
  const C = fabrica(k);
  const n = Math.max(2, Math.round(w / 0.6));
  return (
    <group>
      {C([w, h, d - 0.02], [0, h / 2, (d - 0.02) / 2], k.m.corpo)}
      <Portas k={k} w={w} h={h - 0.1} y={(h - 0.1) / 2 + 0.08} z={d - 0.02} n={n} a={a} />
      {C([w, 0.08, d - 0.04], [0, 0.04, (d - 0.04) / 2], k.m.preto, 'x')}
      <Fita k={k} led={led} s={[w - 0.1, 0.012, 0.012]} p={[0, h - 0.012, d + 0.008]} />
    </group>
  );
};

const CabeceiraCama: React.FC<PropsMovel> = ({ w, h, a, k, led }) => {
  const C = fabrica(k);
  const sombra = !k.mobile;
  return (
    <group>
      {C([w, h, 0.03], [0, h / 2, 0.015], k.m.folga, 'x')}
      <mesh geometry={k.ripas(w, h, 0.055, 0.04, 0.026)} material={a} position={[0, h / 2, 0.044]} castShadow={sombra} />
      <Fita k={k} led={led} s={[w, 0.012, 0.018]} p={[0, h + 0.008, 0.034]} />
      <Brilho k={k} led={led} l={w} a={0.9} p={[0, h + 0.47, 0.012]} rot={[0, 0, Math.PI]} />
      <group position={[0, 0, 1.08]}>
        {C([1.62, 0.3, 2.02], [0, 0.17, 0], a, 'x')}
        <RoundedBox args={[1.54, 0.26, 1.96]} radius={0.06} smoothness={3} position={[0, 0.44, 0]} material={k.m.tecidoClaro} castShadow={sombra} receiveShadow={sombra} />
        {[-0.4, 0.4].map((x) => (
          <RoundedBox key={x} args={[0.68, 0.17, 0.44]} radius={0.075} smoothness={3} position={[x, 0.65, -0.72]} rotation={[0.28, 0, 0]} material={k.m.tecidoClaro} castShadow={sombra} />
        ))}
        <RoundedBox args={[1.6, 0.08, 0.86]} radius={0.035} smoothness={2} position={[0, 0.58, 0.54]} material={k.m.tecidoAreia} castShadow={sombra} />
      </group>
    </group>
  );
};

const MesaCabeceira: React.FC<PropsMovel> = ({ w, h, d, a, k, led }) => {
  const C = fabrica(k);
  return (
    <group>
      {C([w, h, d], [0, h / 2, d / 2], k.m.corpo)}
      {C([w - FOLGA, h - FOLGA, CHAPA], [0, h / 2, d + 0.01], a, 'x')}
      {C([w * 0.5, 0.012, 0.018], [0, h - 0.05, d + 0.028], k.m.latao, 'x', false)}
      <mesh position={[0, h + 0.85, d * 0.62]} geometry={k.caixa(0.004, 1.5, 0.004)} material={k.m.preto} />
      <mesh position={[0, h + 0.2, d * 0.62]} geometry={k.caixa(0.09, 0.17, 0.09)} material={led ? k.m.ledLigado : k.m.ceramica} />
    </group>
  );
};

const PainelTv: React.FC<PropsMovel> = ({ w, h, d, a, k, led }) => {
  const C = fabrica(k);
  const sombra = !k.mobile;
  const larguraTv = Math.min(1.4, w * 0.72);
  return (
    <group>
      {C([w, h, 0.02], [0, h / 2, 0.01], k.m.folga, 'x')}
      <mesh geometry={k.ripas(w, h, 0.06, 0.042, 0.026)} material={a} position={[0, h / 2, 0.034]} castShadow={sombra} />
      {C([w, 0.28, d - 0.06], [0, 0.46, (d - 0.06) / 2 + 0.05], a, 'x')}
      <Portas k={k} w={w} h={0.26} y={0.46} z={d - 0.01} n={Math.max(2, Math.round(w / 0.6))} a={a} puxador="nenhum" />
      {C([larguraTv, larguraTv * 0.57, 0.03], [0, 1.28, 0.068], k.m.tela, 'x')}
      <Fita k={k} led={led} s={[w * 0.96, 0.01, 0.01]} p={[0, 0.3, d - 0.06]} />
      <Brilho k={k} led={led} l={w} a={0.3} p={[0, 0.15, 0.05]} />
    </group>
  );
};

const Penteadeira: React.FC<PropsMovel> = ({ w, h, d, a, k, led }) => {
  const C = fabrica(k);
  const sombra = !k.mobile;
  const larguraEspelho = w * 0.76;
  const alturaEspelho = Math.max(0.5, h - 0.92);
  const yEspelho = 0.86 + alturaEspelho / 2;
  return (
    <group>
      {C([w, 0.15, d], [0, 0.72, d / 2], k.m.corpo, 'x')}
      {C([w - FOLGA, 0.14, CHAPA], [0, 0.72, d + 0.01], a, 'x')}
      {C([w * 0.3, 0.012, 0.018], [0, 0.72, d + 0.028], k.m.latao, 'x', false)}
      {C([larguraEspelho + 0.05, alturaEspelho + 0.05, 0.02], [0, yEspelho, 0.012], led ? k.m.ledLigado : k.m.ledDesligado, 'x', false)}
      {C([larguraEspelho, alturaEspelho, 0.012], [0, yEspelho, 0.026], k.m.espelho, 'x', false)}
      <mesh position={[0, 0.23, d + 0.3]} castShadow={sombra}>
        <cylinderGeometry args={[0.2, 0.2, 0.42, 24]} />
        <primitive object={k.m.tecidoAreia} attach="material" />
      </mesh>
    </group>
  );
};

const BancadaEstudo: React.FC<PropsMovel> = ({ w, h, d, a, k }) => {
  const C = fabrica(k);
  return (
    <group>
      {C([w, 0.05, d], [0, h - 0.025, d / 2], a, 'x')}
      {C([w, 0.38, 0.3], [0, h + 0.68, 0.15], k.m.corpo, 'x')}
      {C([w - 0.04, 0.34, 0.012], [0, h + 0.68, 0.304], k.m.folga, 'x', false)}
      <Livros k={k} l={w * 0.8} a={0.3} y={h + 0.51} z={0.22} semente={3} />
      {C([0.34, 0.016, 0.24], [0, h + 0.008, d * 0.52], k.m.preto, 'x', false)}
    </group>
  );
};

const Tampo: React.FC<{ k: Kit3D; l: number; p: number; y: number; z: number; x?: number; mat: THREE.Material }> = ({ k, l, p, y, z, x = 0, mat }) => {
  const C = fabrica(k);
  return <>{C([l, 0.04, p], [x, y, z], mat, 'x')}</>;
};

const BancadaL: React.FC<PropsMovel> = ({ w, h, d, a, k, tampo, dim }) => {
  const C = fabrica(k);
  const ret = retornoBancada(dim);
  const hBase = h - 0.04;
  const n = Math.max(2, Math.round(w / 0.5));
  return (
    <group>
      {C([w, hBase - 0.1, d - 0.02], [0, (hBase - 0.1) / 2 + 0.1, (d - 0.02) / 2], k.m.corpo, 'x')}
      {C([w - 0.02, 0.1, d - 0.08], [0, 0.05, (d - 0.08) / 2], k.m.preto, 'x')}
      <Portas k={k} w={w} h={hBase - 0.1} y={(hBase - 0.1) / 2 + 0.1} z={d - 0.02} n={n} a={a} puxador="horizontal" />
      <Tampo k={k} l={w + 0.02} p={d + 0.02} y={h - 0.02} z={(d + 0.02) / 2} mat={tampo} />
      {C([0.58, 0.004, 0.38], [w * 0.08, h + 0.002, d * 0.5], k.m.inox, 'x', false)}
      {C([0.5, 0.002, 0.3], [w * 0.08, h + 0.005, d * 0.5], k.m.folga, 'x', false)}
      {C([0.024, 0.3, 0.024], [w * 0.08, h + 0.15, 0.09], k.m.cromo, 'y', false)}
      {C([0.022, 0.022, 0.18], [w * 0.08, h + 0.3, 0.18], k.m.cromo, 'y', false)}
      <group position={[-w / 2 + 0.31, 0, d + ret / 2]}>
        {C([0.6, hBase - 0.1, ret], [0, (hBase - 0.1) / 2 + 0.1, 0], k.m.corpo, 'x')}
        {C([0.56, 0.1, ret], [-0.02, 0.05, 0], k.m.preto, 'x')}
        <group rotation={[0, Math.PI / 2, 0]} position={[0, 0, 0]}>
          <Portas k={k} w={ret} h={hBase - 0.1} y={(hBase - 0.1) / 2 + 0.1} z={0.3} n={Math.max(1, Math.round(ret / 0.5))} a={a} puxador="horizontal" />
        </group>
        <Tampo k={k} l={0.64} p={ret + 0.02} y={h - 0.02} z={0} x={0} mat={tampo} />
      </group>
    </group>
  );
};

const Ilha: React.FC<PropsMovel> = ({ w, h, d, a, k, led, tampo }) => {
  const C = fabrica(k);
  const sombra = !k.mobile;
  const hBase = h - 0.04;
  return (
    <group position={[0, 0, -d / 2]}>
      {C([w - 0.03, 0.09, d - 0.03], [0, 0.045, d / 2], k.m.preto, 'x')}
      {C([w, hBase - 0.09, d], [0, (hBase - 0.09) / 2 + 0.09, d / 2], k.m.corpo, 'x')}
      <mesh geometry={k.ripas(w, hBase - 0.1, 0.055, 0.04, 0.022)} material={a} position={[0, (hBase - 0.1) / 2 + 0.09, d + 0.011]} castShadow={sombra} />
      <Portas k={k} w={w} h={hBase - 0.1} y={(hBase - 0.1) / 2 + 0.09} z={-0.021} n={Math.max(2, Math.round(w / 0.5))} a={a} puxador="horizontal" />
      {C([w + 0.08, 0.045, d + 0.12], [0, h - 0.022, d / 2 + 0.03], tampo, 'x')}
      {C([0.66, 0.008, 0.46], [w * 0.14, h + 0.004, d / 2 - 0.05], k.m.tela, 'x', false)}
      <Fita k={k} led={led} s={[w * 0.9, 0.01, 0.01]} p={[0, h - 0.052, d + 0.07]} />
      {[-0.46, 0.46].map((x) => (
        <group key={x} position={[x, 0, d + 0.36]}>
          <RoundedBox args={[0.38, 0.05, 0.36]} radius={0.02} smoothness={2} position={[0, 0.64, 0]} material={k.m.tecidoAreia} castShadow={sombra} />
          {C([0.03, 0.62, 0.03], [0, 0.31, 0], k.m.preto)}
          {C([0.32, 0.02, 0.32], [0, 0.01, 0], k.m.preto, 'x')}
        </group>
      ))}
    </group>
  );
};

const ArmariosAltos: React.FC<PropsMovel> = ({ w, h, d, a, k, led }) => {
  const C = fabrica(k);
  return (
    <group>
      {C([w, h, d - 0.02], [0, h / 2, (d - 0.02) / 2], k.m.corpo, 'x')}
      <Portas k={k} w={w} h={h} z={d - 0.02} n={Math.max(2, Math.round(w / 0.48))} a={a} puxador="nenhum" />
      <Fita k={k} led={led} s={[w - 0.1, 0.008, 0.012]} p={[0, -0.004, d - 0.08]} />
      <Brilho k={k} led={led} l={w - 0.04} a={0.62} p={[0, -0.31, 0.02]} />
    </group>
  );
};

const TorreForno: React.FC<PropsMovel> = ({ w, h, d, a, k }) => {
  const C = fabrica(k);
  const larg = w * 0.86;
  return (
    <group>
      {C([w, h, d - 0.02], [0, h / 2, (d - 0.02) / 2], k.m.corpo)}
      <Portas k={k} w={w} h={h - 0.1} y={(h - 0.1) / 2 + 0.08} z={d - 0.02} n={1} a={a} puxador="nenhum" />
      {C([larg, 0.56, 0.016], [0, 0.94, d + 0.012], k.m.tela, 'x', false)}
      {C([larg * 0.9, 0.018, 0.02], [0, 1.15, d + 0.026], k.m.inox, 'x', false)}
      {C([larg, 0.38, 0.016], [0, 1.5, d + 0.012], k.m.tela, 'x', false)}
      {C([0.018, 0.2, 0.02], [larg / 2 - 0.05, 1.5, d + 0.026], k.m.inox, 'y', false)}
    </group>
  );
};

const Cristaleira: React.FC<PropsMovel> = ({ w, h, d, a, k, led }) => {
  const C = fabrica(k);
  const n = Math.max(3, Math.round(h / 0.44));
  const passo = (h - 0.12) / n;
  return (
    <group>
      {C([CHAPA, h, d], [-w / 2 + CHAPA / 2, h / 2, d / 2], a)}
      {C([CHAPA, h, d], [w / 2 - CHAPA / 2, h / 2, d / 2], a)}
      {C([w, CHAPA, d], [0, h - CHAPA / 2, d / 2], a, 'x')}
      {C([w, 0.1, d], [0, 0.05, d / 2], a, 'x')}
      {C([w, h, 0.012], [0, h / 2, 0.006], k.m.folga, 'x', false)}
      {Array.from({ length: n }, (_, i) => {
        const y = 0.1 + passo * i;
        return (
          <group key={i}>
            {C([w - 2 * CHAPA, 0.012, d - 0.03], [0, y, d / 2], k.m.vidro, 'x', false)}
            <Fita k={k} led={led} s={[w - 0.06, 0.006, 0.008]} p={[0, y + passo - 0.018, d - 0.03]} />
            {[-0.2, 0, 0.2].map((x) => (
              <group key={x}>{C([0.07, passo * 0.56, 0.07], [x * (w / 0.85), y + 0.006 + passo * 0.28, d * 0.45], k.m.livroB, 'y', false)}</group>
            ))}
          </group>
        );
      })}
      {C([w - 0.03, h - 0.1, 0.008], [0, h / 2 + 0.04, d - 0.002], k.m.vidro, 'x', false)}
    </group>
  );
};

const ForroRipado: React.FC<PropsMovel> = ({ w, h, d, a, k, led }) => {
  const C = fabrica(k);
  const sombra = !k.mobile;
  return (
    <group position={[0, 0, 0]}>
      <mesh geometry={k.ripas(w, d, 0.075, 0.05, 0.04)} material={a} position={[0, h - 0.03, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow={sombra} />
      {C([w, 0.012, d], [0, h - 0.004, 0], a, 'x', false)}
      <Fita k={k} led={led} s={[w * 0.82, 0.008, 0.03]} p={[0, h - 0.058, 0]} />
    </group>
  );
};

const NichosLed: React.FC<PropsMovel> = ({ w, h, d, a, k, led }) => {
  const C = fabrica(k);
  const n = Math.max(3, Math.round(h / 0.48));
  const passo = (h - 0.08) / n;
  return (
    <group>
      {C([CHAPA, h, d], [-w / 2 + CHAPA / 2, h / 2, d / 2], a)}
      {C([CHAPA, h, d], [w / 2 - CHAPA / 2, h / 2, d / 2], a)}
      {C([w, 0.08, d], [0, 0.04, d / 2], a, 'x')}
      {C([w, CHAPA, d], [0, h - CHAPA / 2, d / 2], a, 'x')}
      {C([w - 2 * CHAPA, h, 0.012], [0, h / 2, 0.006], k.m.corpo, 'x', false)}
      {Array.from({ length: n }, (_, i) => {
        const y = 0.08 + passo * i;
        return (
          <group key={i}>
            {i > 0 && C([w - 2 * CHAPA, 0.03, d - 0.01], [0, y, d / 2], a, 'x')}
            <Fita k={k} led={led} s={[w - 0.08, 0.006, 0.008]} p={[0, y + passo - 0.024, d - 0.05]} />
            <Brilho k={k} led={led} l={w - 0.06} a={passo * 0.8} p={[0, y + passo * 0.56, 0.014]} />
            <Livros k={k} l={w * 0.9} a={passo * 0.6} y={y + 0.018} z={d * 0.5} semente={i * 5} />
          </group>
        );
      })}
    </group>
  );
};

const IlhaCloset: React.FC<PropsMovel> = ({ w, h, d, a, k, led }) => {
  const C = fabrica(k);
  const fileiras = 3;
  const alt = (h - 0.12) / fileiras;
  return (
    <group position={[0, 0, -d / 2]}>
      {C([w, h - 0.03, d], [0, (h - 0.03) / 2, d / 2], k.m.corpo, 'x')}
      {Array.from({ length: fileiras }, (_, i) => (
        <group key={i}>
          <Portas k={k} w={w} h={alt} y={0.08 + alt * (i + 0.5)} z={d} n={2} a={a} puxador="horizontal" />
          <group rotation={[0, Math.PI, 0]} position={[0, 0, d]}>
            <Portas k={k} w={w} h={alt} y={0.08 + alt * (i + 0.5)} z={d} n={2} a={a} puxador="horizontal" />
          </group>
        </group>
      ))}
      {C([w + 0.03, 0.022, d + 0.03], [0, h - 0.012, d / 2], k.m.vidro, 'x', false)}
      <Fita k={k} led={led} s={[w - 0.1, 0.008, d - 0.12]} p={[0, h - 0.03, d / 2]} />
    </group>
  );
};

const PrateleirasCloset: React.FC<PropsMovel> = ({ w, h, d, a, k, led }) => {
  const C = fabrica(k);
  const colunas = Math.max(2, Math.round(w / 0.75));
  const passo = w / colunas;
  return (
    <group>
      {C([w, h, 0.012], [0, h / 2, 0.006], k.m.corpo, 'x', false)}
      {Array.from({ length: colunas + 1 }, (_, i) => (
        <group key={i}>{C([CHAPA, h, d], [-w / 2 + passo * i + (i === colunas ? -CHAPA / 2 : i === 0 ? CHAPA / 2 : 0), h / 2, d / 2], a)}</group>
      ))}
      {C([w, 0.09, d], [0, 0.045, d / 2], a, 'x')}
      {C([w, CHAPA, d], [0, h - CHAPA / 2, d / 2], a, 'x')}
      {Array.from({ length: colunas }, (_, c) => {
        const x = -w / 2 + passo * (c + 0.5);
        const com = c % 2 === 0;
        const yBarra = h - 0.36;
        return (
          <group key={c}>
            {C([passo - 2 * CHAPA, CHAPA, d - 0.02], [x, yBarra + 0.18, d / 2], a, 'x')}
            <Fita k={k} led={led} s={[passo - 0.08, 0.006, 0.008]} p={[x, yBarra + 0.16, d - 0.05]} />
            {com ? (
              <>
                {C([passo - 0.06, 0.016, 0.016], [x, yBarra, d / 2], k.m.cromo, 'x', false)}
                {!k.mobile &&
                  [-0.2, -0.08, 0.05, 0.19].map((o, i) => (
                    <group key={o}>
                      {C([0.04, 0.9 + i * 0.09, 0.34], [x + o * (passo / 0.75), yBarra - 0.45 - i * 0.045, d / 2], i % 2 ? k.m.tecidoEscuro : k.m.tecidoAreia, 'y', false)}
                    </group>
                  ))}
              </>
            ) : (
              [0.42, 0.84, 1.26].map((y) => (
                <group key={y}>
                  {C([passo - 2 * CHAPA, CHAPA, d - 0.03], [x, y, d / 2], a, 'x')}
                  <Livros k={k} l={passo * 0.8} a={0.24} y={y + 0.01} z={d * 0.5} semente={Math.round(y * 10)} />
                </group>
              ))
            )}
          </group>
        );
      })}
    </group>
  );
};

const Sapateira: React.FC<PropsMovel> = ({ w, h, d, a, k, led }) => {
  const C = fabrica(k);
  const larguraEspelho = w * 0.46;
  return (
    <group>
      {C([w, h, d - 0.02], [0, h / 2, (d - 0.02) / 2], k.m.corpo)}
      <group position={[larguraEspelho / 2, 0, 0]}>
        <Portas k={k} w={w - larguraEspelho} h={h - 0.08} y={(h - 0.08) / 2 + 0.08} z={d - 0.02} n={2} a={a} puxador="vertical" />
      </group>
      {C([larguraEspelho - 0.02, h - 0.12, 0.012], [-w / 2 + larguraEspelho / 2, h / 2 + 0.02, d - 0.006], k.m.espelho, 'y', false)}
      <Fita k={k} led={led} s={[0.014, h - 0.14, 0.012]} p={[-w / 2 + larguraEspelho + 0.01, h / 2 + 0.02, d + 0.004]} />
    </group>
  );
};

const BancadaTrabalho: React.FC<PropsMovel> = ({ w, h, d, a, k }) => {
  const C = fabrica(k);
  const sombra = !k.mobile;
  return (
    <group>
      {C([w, 0.045, d], [0, h - 0.0225, d / 2], a, 'x')}
      {C([0.05, h - 0.045, d - 0.04], [-w / 2 + 0.04, (h - 0.045) / 2, d / 2], a)}
      {C([0.05, h - 0.045, d - 0.04], [w / 2 - 0.04, (h - 0.045) / 2, d / 2], a)}
      {C([0.72, 0.34, 0.024], [0, h + 0.3, 0.16], k.m.tela, 'x')}
      {C([0.05, 0.14, 0.04], [0, h + 0.07, 0.15], k.m.preto)}
      {C([0.22, 0.012, 0.16], [0, h + 0.006, 0.17], k.m.preto, 'x', false)}
      <group position={[0, 0, d + 0.36]}>
        <RoundedBox args={[0.46, 0.08, 0.44]} radius={0.03} smoothness={2} position={[0, 0.46, 0]} material={k.m.tecidoEscuro} castShadow={sombra} />
        <RoundedBox args={[0.44, 0.52, 0.06]} radius={0.03} smoothness={2} position={[0, 0.8, 0.22]} material={k.m.tecidoEscuro} castShadow={sombra} />
        {C([0.04, 0.42, 0.04], [0, 0.21, 0], k.m.preto)}
        {C([0.5, 0.03, 0.05], [0, 0.03, 0], k.m.preto, 'x')}
        {C([0.05, 0.03, 0.5], [0, 0.03, 0], k.m.preto, 'x')}
      </group>
    </group>
  );
};

const Estante: React.FC<PropsMovel> = ({ w, h, d, a, k }) => {
  const C = fabrica(k);
  const n = Math.max(3, Math.round(h / 0.42));
  const passo = (h - 0.08) / n;
  const colunas = Math.max(2, Math.round(w / 0.8));
  const lc = w / colunas;
  return (
    <group>
      {C([w, h, 0.012], [0, h / 2, 0.006], k.m.corpo, 'x', false)}
      {C([w, 0.08, d], [0, 0.04, d / 2], a, 'x')}
      {Array.from({ length: colunas + 1 }, (_, i) => (
        <group key={i}>{C([0.024, h, d], [-w / 2 + lc * i + (i === colunas ? -0.012 : i === 0 ? 0.012 : 0), h / 2, d / 2], a)}</group>
      ))}
      {Array.from({ length: n }, (_, i) => {
        const y = 0.08 + passo * (i + 1);
        return (
          <group key={i}>
            {C([w, 0.024, d], [0, y - 0.012, d / 2], a, 'x')}
            {Array.from({ length: colunas }, (_, c) => (
              <group key={c} position={[-w / 2 + lc * (c + 0.5), 0, 0]}>
                {(c + i) % 2 === 0 && <Livros k={k} l={lc * 0.86} a={passo * 0.66} y={y - passo + 0.01} z={d * 0.5} semente={i * 3 + c} />}
              </group>
            ))}
          </group>
        );
      })}
    </group>
  );
};

const Gaveteiro: React.FC<PropsMovel> = ({ w, h, d, a, k }) => {
  const C = fabrica(k);
  const alt = (h - 0.06) / 3;
  return (
    <group>
      {C([w, h - 0.05, d - 0.02], [0, (h - 0.05) / 2 + 0.05, (d - 0.02) / 2], k.m.corpo)}
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0, 0.05 + alt * (i + 0.5), d - 0.01]}>
          {C([w - FOLGA, alt - FOLGA, CHAPA], [0, 0, 0], a, 'x')}
          {C([w * 0.44, 0.012, 0.018], [0, alt / 2 - 0.04, 0.018], k.m.cromo, 'x', false)}
        </group>
      ))}
    </group>
  );
};

const AereoOffice: React.FC<PropsMovel> = ({ w, h, d, a, k, led }) => {
  const C = fabrica(k);
  return (
    <group>
      {C([w, h, d - 0.02], [0, h / 2, (d - 0.02) / 2], k.m.corpo, 'x')}
      <Portas k={k} w={w} h={h} z={d - 0.02} n={Math.max(2, Math.round(w / 0.7))} a={a} puxador="horizontal" />
      <Fita k={k} led={led} s={[w - 0.08, 0.008, 0.012]} p={[0, -0.004, d - 0.08]} />
      <Brilho k={k} led={led} l={w - 0.04} a={0.5} p={[0, -0.25, 0.012]} />
    </group>
  );
};

const Sofa: React.FC<PropsMovel> = ({ w, h, d, a, k }) => {
  const C = fabrica(k);
  const sombra = !k.mobile;
  const almofadas = Math.max(2, Math.round(w / 0.7));
  const la = (w - 0.26) / almofadas;
  return (
    <group>
      {C([w, 0.07, d], [0, 0.035, d / 2], a, 'x')}
      <RoundedBox args={[w, 0.28, d]} radius={0.05} smoothness={3} position={[0, 0.21, d / 2]} material={k.m.tecidoAreia} castShadow={sombra} receiveShadow={sombra} />
      <RoundedBox args={[w, h - 0.15, 0.18]} radius={0.06} smoothness={3} position={[0, (h + 0.15) / 2, 0.09]} material={k.m.tecidoAreia} castShadow={sombra} />
      {[-1, 1].map((s) => (
        <RoundedBox key={s} args={[0.14, h * 0.7, d]} radius={0.05} smoothness={3} position={[(s * (w - 0.14)) / 2, (h * 0.7) / 2 + 0.07, d / 2]} material={k.m.tecidoAreia} castShadow={sombra} />
      ))}
      {Array.from({ length: almofadas }, (_, i) => (
        <RoundedBox key={i} args={[la - 0.02, 0.14, d - 0.26]} radius={0.05} smoothness={3} position={[-w / 2 + 0.13 + la * (i + 0.5), 0.41, d / 2 + 0.08]} material={k.m.tecidoClaro} castShadow={sombra} />
      ))}
    </group>
  );
};

const GabineteBanheiro: React.FC<PropsMovel> = ({ w, h, d, a, k, tampo }) => {
  const C = fabrica(k);
  const n = Math.max(2, Math.ceil(w / 0.6));
  const cuba = Math.min(0.5, w * 0.45);
  return (
    <group>
      {C([w, h - 0.02, d - CHAPA - 0.002], [0, (h - 0.02) / 2, (d - CHAPA) / 2], k.m.corpo)}
      <Portas k={k} w={w} h={h - 0.02} z={d - CHAPA - 0.002} n={n} a={a} puxador="horizontal" />
      {C([w, 0.02, d + 0.01], [0, h - 0.01, (d + 0.01) / 2], tampo, 'x')}
      {C([cuba, 0.012, d * 0.62], [0, h + 0.002, d * 0.5], k.m.folga, 'x', false)}
      {C([0.03, 0.2, 0.03], [0, h + 0.1, 0.06], k.m.cromo, 'y', false)}
      {C([0.025, 0.025, 0.14], [0, h + 0.19, 0.12], k.m.cromo, 'x', false)}
    </group>
  );
};

const EspelheiraLed: React.FC<PropsMovel> = ({ w, h, d, k, led }) => {
  const C = fabrica(k);
  const n = Math.max(1, Math.ceil(w / 0.6));
  const passo = w / n;
  return (
    <group>
      {C([w, h, d - CHAPA], [0, h / 2, (d - CHAPA) / 2], k.m.corpo)}
      {Array.from({ length: n }, (_, i) => (
        <group key={i}>{C([passo - FOLGA, h - FOLGA, 0.006], [-w / 2 + passo * (i + 0.5), h / 2, d - CHAPA / 2], k.m.espelho, 'y', false)}</group>
      ))}
      <Fita k={k} led={led} s={[w - 0.04, 0.01, 0.012]} p={[0, -0.006, d - 0.03]} />
    </group>
  );
};

export const MOVEIS: Record<ModuloId, React.FC<PropsMovel>> = {
  'guarda-roupa': GuardaRoupa,
  'cabeceira-ripada-led': CabeceiraCama,
  'criado-mudo': MesaCabeceira,
  'painel-tv-ripado': PainelTv,
  'penteadeira-camarim': Penteadeira,
  'bancada-estudo-quarto': BancadaEstudo,
  'bancada-l': BancadaL,
  ilha: Ilha,
  'armarios-altos': ArmariosAltos,
  'torre-forno': TorreForno,
  'cristaleira-led': Cristaleira,
  'forro-ripado-teto': ForroRipado,
  'nichos-led': NichosLed,
  'ilha-closet': IlhaCloset,
  'prateleiras-closet': PrateleirasCloset,
  'sapateira-espelhada': Sapateira,
  'bancada-trabalho': BancadaTrabalho,
  'estante-ripada': Estante,
  gaveteiro: Gaveteiro,
  'armario-aereo-office': AereoOffice,
  'sofa-recepcao': Sofa,
  'gabinete-banheiro': GabineteBanheiro,
  'espelheira-led': EspelheiraLed,
};
