/* ============ ARC — global JS ============ */

/* ---------- THEME ---------- */
(function theme() {
  var saved = localStorage.getItem('arc-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  window.setTheme = function(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('arc-theme', t);
    document.querySelectorAll('.theme-switch button').forEach(function(b) {
      b.classList.toggle('is-active', b.dataset.theme === t);
    });
  };
})();

/* ---------- LANGUAGE ---------- */
(function lang() {
  var saved = localStorage.getItem('arc-lang') || 'en';
  document.documentElement.setAttribute('data-lang', saved);
  var initial = true;
  var apply = function(l) {
    document.documentElement.setAttribute('data-lang', l);
    localStorage.setItem('arc-lang', l);
    document.querySelectorAll('[data-en]').forEach(function(el) {
      var t = el.getAttribute(l === 'es' ? 'data-es' : 'data-en');
      if (t == null) return;
      if (initial) {
        el.textContent = t;
      } else {
        el.style.transition = 'opacity 200ms';
        el.style.opacity = '0';
        setTimeout(function() { el.textContent = t; el.style.opacity = '1'; }, 180);
      }
    });
    document.querySelectorAll('.lang-switch button').forEach(function(b) {
      b.classList.toggle('is-active', b.dataset.lang === l);
    });
    initial = false;
  };
  window.setLang = apply;
  window.addEventListener('DOMContentLoaded', function() { apply(saved); });
})();

/* ---------- CURSOR ---------- */
(function cursor() {
  if (matchMedia('(max-width: 720px)').matches) return;
  var dot = document.createElement('div');
  dot.className = 'cursor';
  document.body.appendChild(dot);
  var x = 0, y = 0, tx = 0, ty = 0;
  window.addEventListener('mousemove', function(e) { tx = e.clientX; ty = e.clientY; });
  function loop() {
    x += (tx - x) * 0.22;
    y += (ty - y) * 0.22;
    dot.style.transform = 'translate(' + x + 'px, ' + y + 'px) translate(-50%, -50%)';
    requestAnimationFrame(loop);
  }
  loop();

  document.addEventListener('mouseover', function(e) {
    var t = e.target.closest('a, button, [data-cursor=hover], .work-item');
    if (t) dot.classList.add('is-hover');
    var tx = e.target.closest('input, textarea, [contenteditable]');
    if (tx) dot.classList.add('is-text');
  });
  document.addEventListener('mouseout', function(e) {
    var t = e.target.closest('a, button, [data-cursor=hover], .work-item');
    if (t) dot.classList.remove('is-hover');
    var tx = e.target.closest('input, textarea, [contenteditable]');
    if (tx) dot.classList.remove('is-text');
  });
})();

/* ---------- REVEALS ---------- */
(function reveal() {
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  window.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.reveal, .word-reveal').forEach(function(el) { io.observe(el); });
    requestAnimationFrame(function() {
      document.querySelectorAll('.reveal, .word-reveal').forEach(function(el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in');
      });
    });
    setTimeout(function() {
      document.querySelectorAll('.reveal:not(.is-in), .word-reveal:not(.is-in)').forEach(function(el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight + 200) el.classList.add('is-in');
      });
    }, 2500);
  });
})();

/* ---------- MAGNETIC LINKS ---------- */
(function magnetic() {
  if (matchMedia('(max-width: 720px)').matches) return;
  window.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('[data-magnetic]').forEach(function(el) {
      el.addEventListener('mousemove', function(e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.25;
        var y = (e.clientY - r.top - r.height / 2) * 0.25;
        el.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
      });
      el.addEventListener('mouseleave', function() { el.style.transform = ''; });
    });
  });
})();

/* ---------- INTRO LOGO ---------- */
(function intro() {
  if (sessionStorage.getItem('arc-intro-shown')) {
    var i = document.querySelector('.intro');
    if (i) i.remove();
    return;
  }
  window.addEventListener('DOMContentLoaded', function() {
    var i = document.querySelector('.intro');
    if (!i) return;
    setTimeout(function() { i.classList.add('is-out'); }, 100);
    setTimeout(function() { i.remove(); sessionStorage.setItem('arc-intro-shown', '1'); }, 2400);
  });
})();

/* ---------- LIVE CLOCK (mono ticker) ---------- */
(function clock() {
  function tick() {
    var els = document.querySelectorAll('[data-clock]');
    if (!els.length) return;
    var now = new Date();
    var fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).format(now);
    els.forEach(function(e) { e.textContent = fmt + ' MAD'; });
  }
  setInterval(tick, 1000);
  window.addEventListener('DOMContentLoaded', tick);
})();
