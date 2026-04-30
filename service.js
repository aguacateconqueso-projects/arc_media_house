/* ============ ARC — service page JS ============ */

/* ---------- SCROLL PROGRESS ---------- */
(function progress() {
  var bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  function update() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? (window.scrollY / h) * 100 : 0;
    bar.style.setProperty('--p', p + '%');
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ---------- SECTION HEAD REVEALS ---------- */
(function sectionReveals() {
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });
  window.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.srv-section-head').forEach(function(el) { io.observe(el); });
  });
})();

/* ---------- STAGGER REVEALS ---------- */
(function stagger() {
  window.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.reveal[data-delay]').forEach(function(el) {
      var d = parseInt(el.dataset.delay, 10) || 0;
      el.style.transitionDelay = (d * 120) + 'ms';
    });
  });
})();

/* ---------- TITLE VIDEO STAGE ---------- */
(function titleStage() {
  window.addEventListener('DOMContentLoaded', function() {
    var stage = document.querySelector('.title-stage');
    if (!stage) return;
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { stage.classList.add('is-done'); return; }
    var video = stage.querySelector('.title-video');
    if (video) {
      video.play().catch(function() {});
    }
    /* clip-path wipe: 250ms delay + 1100ms = ~1350ms reveal complete
       video plays inside letters until 2400ms, then cross-dissolve to clean white */
    setTimeout(function() {
      stage.classList.add('is-done');
    }, 2400);
  });
})();
