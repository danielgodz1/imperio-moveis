import { defineConfig } from 'vitest/config';

// Configuração própria dos testes: não carrega os plugins de build (Tailwind, pré-renderização).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
  },
});
