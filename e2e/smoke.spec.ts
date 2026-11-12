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
  // As funções de /api rodam na Vercel; aqui respondem vazio (avaliações caem no texto local).
  await context.route('**/api/avaliacoes', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"total":0,"avaliacoes":[]}' }));
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
  await page.getByRole('button', { name: 'Abrir o editor 3D' }).click();
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole('button', { name: /Cozinha/ }).first()).toBeVisible();
  expect(erros, erros.join('\n')).toEqual([]);
});

test('pedido de orçamento abre o WhatsApp da Império com a mensagem montada', async ({ page, context }) => {
  await context.route(/wa\.me|whatsapp\.com/, (r) => r.fulfill({ status: 200, body: 'ok' }));
  await page.goto('/contato');
  await page.waitForLoadState('networkidle');
  const form = page.locator('main form').first();
  // O HTML pré-renderizado aparece antes do React assumir a página: repete o clique até valer.
  const cozinha = form.getByRole('button', { name: 'Cozinha', exact: true });
  await expect(async () => {
    if ((await cozinha.getAttribute('aria-pressed')) !== 'true') await cozinha.click();
    await expect(cozinha).toHaveAttribute('aria-pressed', 'true', { timeout: 1000 });
  }).toPass({ timeout: 15_000 });
  await form.getByRole('button', { name: /O quanto antes/ }).click();
  await form.getByRole('button', { name: 'Continuar' }).click();
  await form.getByRole('button', { name: 'Continuar' }).click();
  await form.locator('#briefing-nome').fill('Teste Automático');
  await form.locator('#briefing-whatsapp').fill('14999990000');
  await form.getByRole('checkbox').check();
  const [popup] = await Promise.all([page.waitForEvent('popup'), form.getByRole('button', { name: /Abrir conversa no WhatsApp/ }).click()]);
  await popup.waitForURL(/wa\.me|whatsapp\.com/);
  const url = decodeURIComponent(popup.url()).replace(/\+/g, ' ');
  expect(url).toContain('5514998492834');
  expect(url).toContain('Cozinha');
  expect(url).toContain('Teste Automático');
});

// @3d: precisa de placa de vídeo (no CI o 3D roda em software e passa do tempo); roda no computador.
test('etapa Enviar do 3D baixa o PDF e a imagem do projeto @3d', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/projetar');
  await page.getByRole('button', { name: 'Abrir o editor 3D' }).click();
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: /Revisar e enviar/ }).click();
  const pdfBotao = page.getByRole('button', { name: /Baixar PDF/ });
  await expect(pdfBotao).toBeEnabled({ timeout: 60_000 });
  const [pdf] = await Promise.all([page.waitForEvent('download'), pdfBotao.click()]);
  expect(pdf.suggestedFilename()).toMatch(/\.pdf$/);
  const [img] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Baixar imagem do projeto/ }).click()]);
  expect(img.suggestedFilename()).toMatch(/\.png$/);
});

test('salvar o projeto no aparelho e retomar depois @3d', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/projetar');
  await page.getByRole('button', { name: 'Abrir o editor 3D' }).click();
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: /Revisar e enviar/ }).click();
  await page.getByLabel('Nome do projeto').fill('Teste da cozinha');
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Salvo neste aparelho' })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Retomar um projeto salvo')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole('button', { name: /^Teste da cozinha/ })).toBeVisible();
});

// V2 (prévia): cada página interna abre direto pelo endereço (recarregar não pode dar 404).
for (const rota of ['/v2', '/v2/obras', '/v2/obras/cozinha-ilha-verde', '/v2/projetar', '/v2/orcamento', '/v2/privacidade']) {
  test(`V2 abre ${rota} direto pelo endereço`, async ({ page }) => {
    const resposta = await page.goto(rota);
    expect(resposta?.status()).toBe(200);
    await expect(page.locator('.v2').first()).toBeVisible();
    await expect(page.locator('h1').first()).toBeVisible();
  });
}


test('atalho Falar agora no WhatsApp abre a conversa sem preencher nada', async ({ page, context }) => {
  await context.route(/wa\.me|whatsapp\.com/, (r) => r.fulfill({ status: 200, body: 'ok' }));
  await page.goto('/contato');
  await page.waitForLoadState('networkidle');
  const atalho = page.locator('main').getByRole('link', { name: /Falar agora no WhatsApp/ });
  await expect(atalho).toBeVisible();
  const [popup] = await Promise.all([page.waitForEvent('popup'), atalho.click()]);
  await popup.waitForURL(/wa\.me|whatsapp\.com/);
  const url = decodeURIComponent(popup.url()).replace(/\+/g, ' ');
  expect(url).toContain('5514998492834');
  expect(url).toContain('quero um orçamento');
});

test('painel de orçamento da home mostra as duas escolhas', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.locator('#hero').getByRole('button', { name: 'Pedir orçamento', exact: true }).click();
  const painel = page.getByRole('dialog', { name: /orçamento/i });
  await expect(painel.getByRole('link', { name: /Falar agora no WhatsApp/ })).toBeVisible();
  await expect(painel.getByRole('button', { name: 'Continuar' })).toBeVisible();
});
