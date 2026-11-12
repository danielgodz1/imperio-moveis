// Google Tag Manager (GTM-KRTQ85BD): avisa o início da página antes do gtm.js carregar.
// Fica num arquivo próprio porque a CSP do site não permite script escrito dentro do HTML.
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

// Carrega o gtm.js depois do aviso de início (este arquivo é assíncrono no HTML).
(function (d) {
  var s = d.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-KRTQ85BD';
  d.head.appendChild(s);
})(document);
