import { defineConfig, devices } from '@playwright/test';

// Testes de navegador contra o build de produção (dist/) servido como na Vercel.
// Rodar antes: npm run build. Localmente usa o Chrome instalado (PW_CANAL=chrome).
const canal = process.env.PW_CANAL;

export default defineConfig({
  testDir: 'e2e',
  timeout: 45_000,
  expect: { timeout: 10_000, toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: 'disabled' } },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  // Capturas de referência separadas por sistema (as do CI são as que valem).
  snapshotPathTemplate: '{testDir}/__capturas__/{platform}/{testFilePath}/{arg}{ext}',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    reducedMotion: 'reduce',
    locale: 'pt-BR',
  },
  projects: [
    { name: 'computador', use: { ...devices['Desktop Chrome'], channel: canal } },
    { name: 'celular', use: { ...devices['Pixel 7'], channel: canal } },
  ],
  webServer: {
    command: 'node scripts/servirDist.mjs 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
});
