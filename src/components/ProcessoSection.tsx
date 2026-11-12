import React from 'react';
import { Foto } from './Foto';

const ETAPAS_PROCESSO = [
  { numero: '1', titulo: 'Você conta o que quer', texto: 'Pelo WhatsApp: ambiente, estilo e o quanto quer investir.' },
  { numero: '2', titulo: 'A gente mede', texto: 'Vamos até a obra conferir paredes, elétrica e hidráulica.' },
  { numero: '3', titulo: 'Você vê em 3D', texto: 'A arquiteta desenha o projeto e fechamos o orçamento.' },
  { numero: '4', titulo: 'Fabricamos e instalamos', texto: 'Oficina própria e equipe própria até o ajuste da última porta.' },
];

export const ProcessoSection: React.FC = () => (
  <section id="processo" className="w-full py-96 md:py-144 bg-papel-2 text-grafite">
    <div className="max-w-[1280px] mx-auto px-16 sm:px-32 grid grid-cols-1 lg:grid-cols-12 gap-48 items-start">
      <div className="lg:col-span-8 flex flex-col gap-48">
        <h2 className="tipo-display text-grafite max-w-[13ch]">Do risco à obra em 4 passos.</h2>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-48 gap-y-32">
          {ETAPAS_PROCESSO.map((etapa) => (
            <li key={etapa.numero} className="flex gap-16 border-t-[1.5px] border-grafite pt-16">
              <span className="tipo-h1 text-grafite leading-none">{etapa.numero}</span>
              <div className="flex flex-col gap-4">
                <h3 className="tipo-h3 text-grafite">{etapa.titulo}</h3>
                <p className="tipo-corpo text-grafite-suave">{etapa.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <figure className="lg:col-span-4 flex flex-col gap-8">
        <Foto
          srcBase="/obras/entrega-guindaste"
          alt="Guindaste içando o maquinário industrial Titanium para a fábrica da Império Móveis Planejados em Jaú"
          proporcao="4 / 5"
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="w-full"
        />
        <figcaption className="tipo-cota text-grafite-suave">
          Maquinário Titanium chegando à nossa fábrica em Jaú.
        </figcaption>
      </figure>
    </div>
  </section>
);
