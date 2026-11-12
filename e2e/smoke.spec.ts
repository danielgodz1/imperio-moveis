import { expect, test } from '@playwright/test';

// Erros de console que não vêm do site (extensões, rede de terceiros bloqueada no teste).
const ignorar = /googletagmanager|google-analytics|favicon|net::ERR_/i;

function vigiarErros(page: import('@playwright/test').Page) {
  const erros: string[] = [];
  page.on('pageerror', (e) => erros.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error' && !ignorar.test(m.text())) erros.push(m.text());
  });
  return erros;
}

test.beforeEach(async ({ context }) => {
  // Nada sai para terceiros durante o teste.
  await context.route(/googletagmanager|google-analytics|fonts\.(googleapis|gstatic)/, (r) => r.abort());
});

for (const rota of ['/', '/obras', '/projetar', '/contato', '/cozinhas-planejadas-jau', '/privacidade']) {
  test(`abre ${rota} com título, H1 e sem erro`, async ({ page }) => {
    const erros = vigiarErros(page);
    const resposta = await page.goto(rota);
    expect(resposta?.status()).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible();
    expect(await page.title()).toMatch(/Império/);
    await page.waitForTimeout(800);
    expect(erros, erros.join('\n')).toEqual([]);
  });
}

test('endereço inexistente responde 404 com página própria', async ({ page }) => {
  const resposta = await page.goto('/nao-existe-esta-pagina');
  expect(resposta?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('não existe');
});

test('/projetar carrega o editor 3D', async ({ page }) => {
  const erros = vigiarErros(page);
  await page.goto('/projetar');
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole('button', { name: /Cozinha/ }).first()).toBeVisible();
  expect(erros, erros.join('\n')).toEqual([]);
});

test('pedido de orçamento abre o WhatsApp da Império com a mensagem montada', async ({ page, context }) => {
  await context.route(/wa\.me|whatsapp\.com/, (r) => r.fulfill({ status: 200, body: 'ok' }));
  await page.goto('/contato');
  const form = page.locator('form').filter({ has: page.locator('#briefing-nome') }).first();
  await form.getByRole('button', { name: 'Cozinha', exact: true }).click();
  await form.getByRole('button', { name: /O quanto antes/ }).click();
  await form.getByRole('button', { name: 'Continuar' }).click();
  await form.getByRole('button', { name: 'Continuar' }).click();
  await form.locator('#briefing-nome').fill('Teste Automático');
  await form.locator('#briefing-whatsapp').fill('14999990000');
  await form.getByRole('checkbox').check();
  const [popup] = await Promise.all([page.waitForEvent('popup'), form.getByRole('button', { name: /Abrir conversa no WhatsApp/ }).click()]);
  const url = decodeURIComponent(popup.url());
  expect(url).toContain('5514998492834');
  expect(url).toContain('Cozinha');
  expect(url).toContain('Teste Automático');
});
