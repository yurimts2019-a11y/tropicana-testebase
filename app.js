document.addEventListener('DOMContentLoaded', function() {
  // Mostra splash inicial
  const splash = document.getElementById('splash-screen');
  if (splash) {
    splash.classList.add('active');
    setTimeout(() => splash.classList.remove('active'), 1800);
  }

  // Função de transição entre páginas com splash
  window.handlePageTransition = function(url) {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.classList.add('active');
    setTimeout(() => {
      window.location.href = url;
    }, 800);
  };

  // ... restante do app.js original (seu código de inicialização e lógica)
});
