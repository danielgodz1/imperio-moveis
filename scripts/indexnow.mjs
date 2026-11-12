/**
 * Avisa os buscadores do protocolo IndexNow (Bing, que também alimenta a busca do ChatGPT,
 * Yandex, Naver, Seznam) de que as páginas do site mudaram. Rodar depois que a Vercel publicar:
 *
 *   node scripts/indexnow.mjs
 *
 * Lê o sitemap publicado e envia todas as URLs de uma vez. O Google não usa IndexNow:
 * para ele, o sitemap no Search Console e "Solicitar indexação" continuam valendo.
 */
const SITE = 'https://www.imperiomoveisplanejadosjau.com.br';
const CHAVE = 'c6e92f98c291c33531150fa3710d5913';

const resposta = await fetch(`${SITE}/sitemap.xml`);
if (!resposta.ok) throw new Error(`Sitemap indisponível: ${resposta.status}`);
const xml = await resposta.text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).filter((u) => u.startsWith(SITE));

const envio = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(SITE).host, key: CHAVE, keyLocation: `${SITE}/${CHAVE}.txt`, urlList: urls }),
});
console.log(`IndexNow: ${urls.length} URLs enviadas, resposta ${envio.status} (200 ou 202 = recebido).`);
