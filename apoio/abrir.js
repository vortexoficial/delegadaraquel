/* Abre o WhatsApp sozinho pouco depois de a pagina aparecer, sem tirar do
   visitante a possibilidade de clicar no botao. Os parametros da campanha
   (utm_*, fbclid) seguem junto, para o relatorio saber de onde veio o clique. */
(function () {
  'use strict';

  var botao = document.getElementById('botao');
  if (!botao) return;

  var consulta = window.location.search;
  if (consulta && consulta.length > 1) {
    var destino = botao.getAttribute('href');
    botao.setAttribute('href', destino + (destino.indexOf('?') > -1 ? '&' : '?') + consulta.slice(1));
  }

  /* Um respiro antes de abrir: a pessoa chega a ver de quem e a pagina.
     Se o navegador bloquear a troca automatica, o botao continua ali. */
  window.setTimeout(function () {
    window.location.href = botao.getAttribute('href');
  }, 1400);
})();
