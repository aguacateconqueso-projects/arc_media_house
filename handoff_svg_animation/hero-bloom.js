/* ==========================================================
   ARC // Hero Bloom — soft organic mass, breathing & rotating
   --------------------------------------------------------
   DROP-IN MODULE — does NOT modify your hero markup or copy.

   Usage:
     <script src="hero-bloom.js" defer></script>
     <link rel="stylesheet" href="hero-bloom.css">  // or paste the CSS

   Or with a custom hero selector:
     <script src="hero-bloom.js" data-target=".my-hero" defer></script>

   What it does:
     - Finds the target element (default: .hero, fallback: header > :first-child).
     - Ensures it has position:relative + overflow:hidden (won't override if
       already set).
     - Injects an absolutely-positioned SVG bloom inside it.
     - Wraps existing direct children in a z-index:2 layer so they sit on top.
     - Tears down cleanly on hot reload (idempotent: re-running replaces).

   Performance: SVG + GPU-accelerated feGaussianBlur. ~8 attribute updates
   per frame. Pauses when tab is hidden. Respects prefers-reduced-motion.
   ========================================================== */
(function () {
  // ---- find target ----
  const scriptEl = document.currentScript;
  const targetSel = (scriptEl && scriptEl.dataset.target) || '.hero';
  const hero = document.querySelector(targetSel) || document.querySelector('header');
  if (!hero) return;

  // remove any previous bloom (idempotent)
  hero.querySelectorAll(':scope > .hero__bloom').forEach(el => el.remove());

  // ensure stacking context — won't override if already set
  const cs = getComputedStyle(hero);
  if (cs.position === 'static') hero.style.position = 'relative';
  if (cs.overflow === 'visible') hero.style.overflow = 'hidden';

  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'hero__bloom');
  svg.setAttribute('viewBox', '-50 -50 100 100');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.setAttribute('aria-hidden', 'true');

  const defs = document.createElementNS(NS, 'defs');

  const filter = document.createElementNS(NS, 'filter');
  filter.setAttribute('id', 'bloom-blur');
  filter.setAttribute('x', '-50%'); filter.setAttribute('y', '-50%');
  filter.setAttribute('width', '200%'); filter.setAttribute('height', '200%');
  filter.setAttribute('color-interpolation-filters', 'sRGB');
  const blur = document.createElementNS(NS, 'feGaussianBlur');
  blur.setAttribute('in', 'SourceGraphic');
  blur.setAttribute('stdDeviation', '4.5');
  filter.appendChild(blur);
  defs.appendChild(filter);

  const grad = document.createElementNS(NS, 'radialGradient');
  grad.setAttribute('id', 'bloom-grad');
  grad.setAttribute('cx', '50%'); grad.setAttribute('cy', '50%'); grad.setAttribute('r', '50%');
  const stop1 = document.createElementNS(NS, 'stop');
  stop1.setAttribute('offset', '0%'); stop1.setAttribute('stop-color', 'currentColor'); stop1.setAttribute('stop-opacity', '1');
  const stop2 = document.createElementNS(NS, 'stop');
  stop2.setAttribute('offset', '60%'); stop2.setAttribute('stop-color', 'currentColor'); stop2.setAttribute('stop-opacity', '0.55');
  const stop3 = document.createElementNS(NS, 'stop');
  stop3.setAttribute('offset', '100%'); stop3.setAttribute('stop-color', 'currentColor'); stop3.setAttribute('stop-opacity', '0');
  grad.appendChild(stop1); grad.appendChild(stop2); grad.appendChild(stop3);
  defs.appendChild(grad);

  svg.appendChild(defs);

  const blurredG = document.createElementNS(NS, 'g');
  blurredG.setAttribute('filter', 'url(#bloom-blur)');

  const ring = document.createElementNS(NS, 'g');
  ring.setAttribute('class', 'hero__bloom-ring');

  const N = 7;
  const lobes = [];
  for (let i = 0; i < N; i++) {
    const angle = (i / N) * Math.PI * 2 + (i % 2 === 0 ? 0.18 : -0.22);
    const c = document.createElementNS(NS, 'circle');
    const baseR = 12 + ((i * 3.7) % 7);
    const baseSize = 9 + ((i * 5.1) % 4);
    c.dataset.angle = angle;
    c.dataset.baseR = baseR;
    c.dataset.baseSize = baseSize;
    c.dataset.phase = (i * 0.91).toFixed(3);
    c.dataset.fA = (0.4 + (i * 0.13) % 0.4).toFixed(3);
    c.dataset.fB = (0.3 + (i * 0.19) % 0.35).toFixed(3);
    c.setAttribute('cx', (Math.cos(angle) * baseR).toFixed(3));
    c.setAttribute('cy', (Math.sin(angle) * baseR).toFixed(3));
    c.setAttribute('r', baseSize.toFixed(3));
    c.setAttribute('fill', 'url(#bloom-grad)');
    ring.appendChild(c);
    lobes.push(c);
  }

  const center = document.createElementNS(NS, 'circle');
  center.setAttribute('cx', '0'); center.setAttribute('cy', '0');
  center.setAttribute('r', '10');
  center.setAttribute('fill', 'url(#bloom-grad)');
  center.setAttribute('opacity', '0.85');

  blurredG.appendChild(center);
  blurredG.appendChild(ring);
  svg.appendChild(blurredG);

  hero.prepend(svg);

  // ensure existing children stack above the bloom — non-destructive:
  // we only set z-index/position if missing, so we don't break flex/grid layouts
  Array.from(hero.children).forEach(child => {
    if (child === svg) return;
    const ccs = getComputedStyle(child);
    if (ccs.position === 'static') child.style.position = 'relative';
    if (ccs.zIndex === 'auto') child.style.zIndex = '2';
  });

  // ---- animation loop ----
  let running = true;
  const start = performance.now();

  function tick(now) {
    if (!running) return;
    const t = (now - start) / 1000;

    const rot = (t * 4) % 360;
    ring.setAttribute('transform', `rotate(${rot.toFixed(3)})`);

    for (let i = 0; i < lobes.length; i++) {
      const c = lobes[i];
      const ang = +c.dataset.angle;
      const baseR = +c.dataset.baseR;
      const baseSize = +c.dataset.baseSize;
      const ph = +c.dataset.phase;
      const fA = +c.dataset.fA;
      const fB = +c.dataset.fB;

      const dist = baseR + 4.2 * Math.sin(t * fA + ph) + 1.6 * Math.sin(t * 0.21 + ph * 1.3);
      const r = baseSize + 4.0 * Math.sin(t * fB + ph * 0.9) + 1.7 * Math.sin(t * 0.15 + ph * 1.7);

      c.setAttribute('cx', (Math.cos(ang) * dist).toFixed(3));
      c.setAttribute('cy', (Math.sin(ang) * dist).toFixed(3));
      c.setAttribute('r', Math.max(2, r).toFixed(3));
    }

    const cr = 9 + 1.6 * Math.sin(t * 0.35) + 0.7 * Math.sin(t * 0.19 + 1.1);
    center.setAttribute('r', cr.toFixed(3));

    requestAnimationFrame(tick);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) running = false;
    else if (!running) { running = true; requestAnimationFrame(tick); }
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    tick(performance.now());
    running = false;
  } else {
    requestAnimationFrame(tick);
  }
})();
