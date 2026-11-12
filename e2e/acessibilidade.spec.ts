import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// WCAG 2.1 AA: falha em violações sérias ou críticas.
for (const rota of ['/', '/obras', '/obras/cozinha-ilha-verde', '/projetar', '/contato', '/cozinhas-planejadas-jau', '/privacidade']) {
  test(`acessibilidade de ${rota}`, async ({ page, context }) => {
    await context.route(/googletagmanager|google-analytics|fonts\.(googleapis|gstatic)/, (r) => r.abort());
    await page.goto(rota);
    await page.waitForTimeout(800);
    const r = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      // O canvas 3D não é conteúdo de texto; os controles do editor ficam fora dele.
      .exclude('canvas')
      .analyze();
    const graves = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    const resumo = graves.map((v) => `${v.id} (${v.impact}): ${v.nodes.length}x ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
    expect(graves, resumo.join('\n')).toEqual([]);
  });
}
