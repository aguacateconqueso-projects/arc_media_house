/* ============================================================
   L'ORFEO — interacciones
   Filosofía del skill: máximo 2 animaciones "protagonistas".
     1) Hero — el descenso (haz + revelado de la promesa al scroll)
     2) Elenco — coverflow arrastrable, B&W → color al centro
   El resto son afordancias (hover) y un único revelado de entrada,
   consistente en todas las secciones (no efectos sueltos).
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- NAV: minimal → pill flotante ---------- */
  var nav = document.getElementById("nav");
  function onScrollNav() {
    if (window.scrollY > window.innerHeight * 0.7) nav.classList.add("is-pill");
    else nav.classList.remove("is-pill");
  }
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  /* ---------- ANIMACIÓN 1 · Hero: revelado de la promesa ---------- */
  var promise = document.getElementById("heroPromise");
  if (promise && !reduce) {
    promise.style.opacity = "0";
    promise.style.transform = "translateY(20px)";
    promise.style.transition = "opacity 1.1s ease, transform 1.1s cubic-bezier(.2,.7,.2,1)";
    function revealPromise() {
      var p = Math.min(window.scrollY / (window.innerHeight * 0.4), 1);
      promise.style.opacity = String(p);
      promise.style.transform = "translateY(" + (20 - p * 20) + "px)";
    }
    // primer reveal suave al cargar + ligado al scroll
    setTimeout(function () { promise.style.opacity = "1"; promise.style.transform = "none"; }, 900);
    window.addEventListener("scroll", revealPromise, { passive: true });
  }

  /* ---------- Revelado de entrada (sistema único, consistente) ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.18 });
  document.querySelectorAll("[data-reveal]").forEach(function (el) { io.observe(el); });

  /* ---------- TICKETS: precio reactivo (cambio instantáneo, sin count-up) ---------- */
  var opts = document.getElementById("ticketOptions");
  var amount = document.getElementById("priceAmount");
  var incl = document.getElementById("priceIncl");
  if (opts) {
    opts.addEventListener("click", function (ev) {
      var b = ev.target.closest(".topt");
      if (!b) return;
      opts.querySelectorAll(".topt").forEach(function (x) { x.classList.remove("is-sel"); });
      b.classList.add("is-sel");
      amount.textContent = "€" + b.dataset.price;
      incl.textContent = b.dataset.incl;
    });
  }

  /* ---------- ANIMACIÓN 2 · Elenco: coverflow arrastrable ---------- */
  var cast = [
    { role: "Tenor",    name: "Matteo Falsetti",   char: "Orfeo · Elenco A",      e: "A", h: 18 },
    { role: "Soprano",  name: "Lucía Ferranti",    char: "Euridice · Elenco A",   e: "A", h: 8  },
    { role: "Mezzo",    name: "Renata Olmo",       char: "La Musica · Elenco A",  e: "A", h: 32 },
    { role: "Bajo",     name: "Gustavo Néri",      char: "Caronte · Elenco A",    e: "A", h: 220 },
    { role: "Tenor",    name: "Aldo Brunetti",     char: "Orfeo · Elenco B",      e: "B", h: 14 },
    { role: "Soprano",  name: "Ingrid Solás",      char: "Euridice · Elenco B",   e: "B", h: 280 },
    { role: "Bajo",     name: "Tomas Vrede",       char: "Plutone · Elenco B",    e: "B", h: 250 },
    { role: "Director", name: "Elena Marchetti",   char: "Dirección musical",     e: "·", h: 40 }
  ];

  var track = document.getElementById("cfTrack");
  var stage = document.getElementById("coverflow");
  if (track && stage) {
    var cards = cast.map(function (c, i) {
      var card = document.createElement("article");
      card.className = "cf-card";
      var g1 = "hsl(" + c.h + " 45% 42%)", g2 = "hsl(" + ((c.h + 30) % 360) + " 35% 14%)";
      card.innerHTML =
        '<div class="cf-card__photo" style="background:linear-gradient(150deg,' + g1 + ',' + g2 + ')"></div>' +
        '<span class="cf-card__role">' + c.role + '</span>' +
        '<span class="cf-card__cast">' + c.e + '</span>' +
        '<div class="cf-card__info"><p class="cf-card__name">' + c.name + '</p>' +
        '<p class="cf-card__char">' + c.char + '</p></div>';
      track.appendChild(card);
      card.addEventListener("click", function () { target = i; });
      return card;
    });

    var current = 0, target = 0, dragging = false, startX = 0, startTarget = 0;
    var GAP = 240, raf;

    function layout() {
      current += (target - current) * 0.12;
      if (Math.abs(target - current) < 0.001) current = target;
      cards.forEach(function (card, i) {
        var d = i - current;
        var ad = Math.abs(d);
        var x = d * GAP * (ad > 1 ? 1 + (ad - 1) * 0.35 : 1);
        var scale = Math.max(0.62, 1 - ad * 0.16);
        var rotY = Math.max(-48, Math.min(48, -d * 22));
        var op = Math.max(0, 1 - ad * 0.32);
        card.style.transform =
          "translateX(" + x + "px) scale(" + scale + ") perspective(1200px) rotateY(" + rotY + "deg)";
        card.style.opacity = String(op);
        card.style.zIndex = String(100 - Math.round(ad * 10));
        card.classList.toggle("is-active", ad < 0.5);
      });
      if (current !== target) raf = requestAnimationFrame(layout);
      else raf = null;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(layout); }
    function setTarget(t) { target = Math.max(0, Math.min(cast.length - 1, t)); kick(); }

    // arrastre (pointer)
    stage.addEventListener("pointerdown", function (e) {
      dragging = true; startX = e.clientX; startTarget = target;
      stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      target = startTarget - dx / GAP;
      target = Math.max(0, Math.min(cast.length - 1, target));
      kick();
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false; setTarget(Math.round(target));
    }
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    // teclado (accesibilidad)
    stage.tabIndex = 0;
    stage.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") setTarget(Math.round(target) + 1);
      if (e.key === "ArrowLeft") setTarget(Math.round(target) - 1);
    });

    layout();
  }
})();
