/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useScrollytelling } from './hooks/useScrollytelling';
import PaginaV2 from './v2/PaginaV2';

// Versão anterior do site, guardada em /v1 (pedaço separado: quem visita o site não baixa).
const AppV1 = lazy(() => import('./AppV1'));

export const emV1 = (pathname: string) => /^\/v1(\/|$)/.test(pathname);

/**
 * O site em produção é a V2, na raiz do domínio. A V1 continua inteira em /v1, fora do Google,
 * caso a Império queira voltar ao layout anterior.
 */
export default function App() {
  // Rolagem suave (Lenis) e cabeçalho: valem para as duas versões.
  const { headerRef } = useScrollytelling();
  const [v1, setV1] = useState(() => typeof window !== 'undefined' && emV1(window.location.pathname));

  useEffect(() => {
    const aoVoltar = () => setV1(emV1(window.location.pathname));
    window.addEventListener('popstate', aoVoltar);
    return () => window.removeEventListener('popstate', aoVoltar);
  }, []);

  if (v1) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-preto" />}>
        <AppV1 headerRef={headerRef} />
      </Suspense>
    );
  }
  return <PaginaV2 />;
}
