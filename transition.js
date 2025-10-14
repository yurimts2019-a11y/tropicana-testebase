
// transition.js - show yellow logo animation before navigation
function _showTransitionThenNavigate(url) {
  const duration = 1500; // 1.5s
  let overlay = document.getElementById('transition-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'transition-overlay';
    overlay.innerHTML = '<div class="overlay-inner"><img src="logo.png" alt="logo"></div>';
    document.body.appendChild(overlay);
    const style = document.createElement('style');
    style.innerHTML = `
#transition-overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#ffd83a;z-index:9999;opacity:0;transition:opacity .2s}
#transition-overlay.show{opacity:1}
#transition-overlay .overlay-inner img{width:160px;height:auto;filter:drop-shadow(0 6px 12px rgba(0,0,0,.15))}
`;
    document.head.appendChild(style);
  }
  overlay.classList.add('show');
  setTimeout(()=> {
    window.location.href = url;
  }, duration);
}

// helper for buttons
function navigateWithAnimation(url){
  _showTransitionThenNavigate(url);
}

// if the page loads and we want the entrance animation, show then hide
document.addEventListener('DOMContentLoaded', function(){
  // entrance effect: briefly show overlay then hide so user sees same splash
  const overlay = document.getElementById('transition-overlay');
  if(overlay){
    overlay.classList.add('show');
    setTimeout(()=> overlay.classList.remove('show'), 1500);
  }
});
