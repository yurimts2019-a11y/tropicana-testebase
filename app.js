document.addEventListener('DOMContentLoaded', function() {
  const splash = document.getElementById('splash-screen');

  // Mostra splash ao carregar o site
  if (splash) {
    splash.classList.add('active');
    setTimeout(() => splash.classList.remove('active'), 800);
  }

  // Função para exibir splash curto
  function showSplash(duration = 500) {
    if (!splash) return;
    splash.classList.add('active');
    setTimeout(() => splash.classList.remove('active'), duration);
  }

  // Substitui a função de transição de página
  window.handlePageTransition = function(url) {
    showSplash(500);
    setTimeout(() => {
      window.location.href = url;
    }, 500);
  };

  // Observa o modal (abrir/fechar)
  const modal = document.getElementById('customizationModal');
  const openModalOriginal = window.openModal;
  const closeModalOriginal = window.closeModal;

  // Envolve a função openModal original, se existir
  window.openModal = function(...args) {
    showSplash(400);
    setTimeout(() => {
      if (typeof openModalOriginal === 'function') openModalOriginal(...args);
    }, 400);
  };

  // Envolve a função closeModal original, se existir
  window.closeModal = function(...args) {
    showSplash(400);
    setTimeout(() => {
      if (typeof closeModalOriginal === 'function') closeModalOriginal(...args);
    }, 400);
  };
});
