// === SPLASH AMARELO GLOBAL (puro e unificado) ===
document.addEventListener('DOMContentLoaded', function() {
  const splash = document.getElementById('splash-screen');
  if (!splash) return;

  function showSplash(duration = 500) {
    splash.classList.add('active');
    setTimeout(() => splash.classList.remove('active'), duration);
  }

  // Splash na abertura do site
  window.addEventListener('load', () => {
    showSplash(800);
  });

  // Splash entre páginas
  window.handlePageTransition = function(url) {
    if (!url) return;
    splash.classList.add('active');
    setTimeout(() => {
      window.location.href = url;
    }, 500);
  };

  // Splash ao abrir e fechar modal dinamicamente
  const observer = new MutationObserver(() => {
    const modal = document.getElementById('customizationModal');
    if (!modal) return;

    const closeBtn = document.getElementById('closeModal');
    if (closeBtn && !closeBtn.dataset.splashBound) {
      closeBtn.addEventListener('click', () => showSplash(400));
      closeBtn.dataset.splashBound = true;
    }

    const observerModal = new MutationObserver(() => {
      if (modal.style.display === 'flex' || modal.classList.contains('show')) {
        showSplash(400);
      }
    });
    observerModal.observe(modal, { attributes: true, attributeFilter: ['style', 'class'] });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Splash em todos os botões (.btn)
  document.body.addEventListener('click', function(e) {
    const target = e.target.closest('button, .btn');
    if (target && !target.classList.contains('no-splash')) {
      showSplash(300);
    }
  });

  // Splash em opções de frutas, extras e acompanhamentos
  document.body.addEventListener('click', function(e) {
    const optionItem = e.target.closest('.option-item, .option-label, input[type="checkbox"]');
    if (optionItem) showSplash(300);
  });

  // Splash antes de enviar para WhatsApp
  const oldEnviarPedido = window.enviarPedido;
  if (typeof oldEnviarPedido === 'function') {
    window.enviarPedido = function(...args) {
      showSplash(500);
      setTimeout(() => oldEnviarPedido(...args), 500);
    };
  }
});
