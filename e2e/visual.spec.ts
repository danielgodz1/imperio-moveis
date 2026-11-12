import { expect, test } from '@playwright/test';

// Regressão visual das páginas principais (topo da página, sem animação, 3D e vídeo escondidos).
// Referências: geradas no CI (Linux) com `npx playwright test e2e/visual.spec.ts --update-snapshots`.
for (const rota of ['/', '/obras', '/contato', '/cozinhas-planejadas-jau', '/privacidade']) {
  test(`visual de ${rota}`, async ({ page, context }) => {
    await context.route(/googletagmanager|google-analytics|fonts\.(googleapis|gstatic)/, (r) => r.abort());
    await page.goto(rota);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot(`${rota === '/' ? 'home' : rota.slice(1)}.png`, {
      mask: [page.locator('canvas'), page.locator('video')],
    });
  });
}
