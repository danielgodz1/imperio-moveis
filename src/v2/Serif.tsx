import React from 'react';

/** Converte "texto *em itálico*" em texto com <em>. Uma marcação por frase. */
export const ComItalico: React.FC<{ texto: string }> = ({ texto }) => {
  const partes = texto.split('*');
  return (
    <>
      {partes.map((p, i) =>
        i % 2 === 1 ? (
          <em key={i} className="v2-italico">
            {p}
          </em>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        )
      )}
    </>
  );
};
