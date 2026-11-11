import React from 'react';
import { gerarJsonLdFurnitureStore } from '../data/paginasLocais';

export const JsonLdSchema: React.FC = () => {
  const schema = gerarJsonLdFurnitureStore();
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
    />
  );
};

