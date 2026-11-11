import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

interface GuardaQuadrosProps {
  /** Chamado se, mesmo com resolução mínima, os quadros continuarem lentos. */
  onLento?: () => void;
}

const AMOSTRAS = 40;
const LIMITE_SEGUNDOS = 1 / 28;
/** Intervalo maior que isso é pausa entre gestos, não quadro lento. */
const PAUSA_SEGUNDOS = 0.25;

/**
 * Mede só os quadros seguidos (frameloop "demand" não renderiza parado) e,
 * se a mediana ficar abaixo de ~28 FPS, primeiro baixa o DPR para 1 e depois avisa.
 */
export function GuardaQuadros({ onLento }: GuardaQuadrosProps) {
  const { setDpr } = useThree();
  const amostras = useRef<number[]>([]);
  const etapa = useRef(0);

  useFrame((_, delta) => {
    if (etapa.current >= 2 || delta > PAUSA_SEGUNDOS || delta <= 0) return;
    const lista = amostras.current;
    lista.push(delta);
    if (lista.length < AMOSTRAS) return;

    const mediana = [...lista].sort((a, b) => a - b)[Math.floor(lista.length / 2)];
    amostras.current = [];
    if (mediana < LIMITE_SEGUNDOS) return;

    etapa.current += 1;
    if (etapa.current === 1) setDpr(1);
    else onLento?.();
  });

  return null;
}
