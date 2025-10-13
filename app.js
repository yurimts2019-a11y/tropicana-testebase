// === TRANSIÇÃO AMARELA GLOBAL (corrigida p/ modais dinâmicos) ===
document.addEventListener('DOMContentLoaded', function() {
  const splash = document.getElementById('splash-screen');

  function showSplash(duration = 500) {
    if (!splash) return;
    splash.classList.add('active');
    setTimeout(() => splash.classList.remove('active'), duration);
  }

  // Splash na abertura
  if (splash) {
    splash.classList.add('active');
    setTimeout(() => splash.classList.remove('active'), 800);
  }

  // Splash nas trocas de página
  window.handlePageTransition = function(url) {
    showSplash(500);
    setTimeout(() => window.location.href = url, 500);
  };

  // Monitorar o modal de personalização (abre e fecha dinamicamente)
  const observer = new MutationObserver(() => {
    const modal = document.getElementById('customizationModal');
    if (!modal) return;

    const closeBtn = document.getElementById('closeModal');
    if (closeBtn && !closeBtn.dataset.splashBound) {
      closeBtn.addEventListener('click', () => showSplash(400));
      closeBtn.dataset.splashBound = true;
    }

    // Quando o modal for aberto (classe visível)
    const observerModal = new MutationObserver(() => {
      if (modal.style.display === 'flex' || modal.classList.contains('show')) {
        showSplash(400);
      }
    });
    observerModal.observe(modal, { attributes: true, attributeFilter: ['style', 'class'] });
  });

  observer.observe(document.body, { childList: true, subtree: true });
});
