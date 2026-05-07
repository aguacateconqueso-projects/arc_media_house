/* home-specific behaviors */
(function() {
  document.querySelectorAll('.chips .chip').forEach(function(c) {
    c.addEventListener('click', function() {
      c.parentElement.querySelectorAll('.chip').forEach(function(x) { x.classList.remove('is-active'); });
      c.classList.add('is-active');
    });
  });

  var f = document.getElementById('contact-form');
  if (f) f.addEventListener('submit', function(e) {
    e.preventDefault();
    var btn = f.querySelector('button[type=submit]');
    if (!btn) return;
    var spanEl = btn.querySelector('span:first-child');
    if (!spanEl) return;
    btn.disabled = true;
    var orig = spanEl.textContent;
    var lang = document.documentElement.getAttribute('data-lang') || 'en';
    spanEl.textContent = lang === 'es' ? 'Enviando...' : 'Sending...';

    fetch(f.action, {
      method: 'POST',
      body: new FormData(f),
      headers: { 'Accept': 'application/json' }
    }).then(function(res) {
      if (res.ok) {
        spanEl.textContent = lang === 'es' ? '✓ Enviado' : '✓ Sent';
        f.querySelectorAll('input:not([type=hidden]),textarea').forEach(function(i) { i.value = ''; });
        f.querySelectorAll('.chip').forEach(function(c) { c.classList.remove('is-active'); });
        setTimeout(function() { spanEl.textContent = orig; btn.disabled = false; }, 2400);
      } else {
        throw new Error('fail');
      }
    }).catch(function() {
      spanEl.textContent = lang === 'es' ? 'Error - intenta de nuevo' : 'Error - try again';
      setTimeout(function() { spanEl.textContent = orig; btn.disabled = false; }, 2400);
    });
  });
})();
