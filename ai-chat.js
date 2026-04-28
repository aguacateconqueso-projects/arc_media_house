/* ============ AI CHAT (demo) ============ */
(function aiChat() {
  var log = document.getElementById('ai-log');
  var form = document.getElementById('ai-form');
  var input = document.getElementById('ai-input');
  var suggestBox = document.getElementById('ai-suggest');
  if (!log || !form) return;

  var setPlaceholder = function() {
    var lang = document.documentElement.getAttribute('data-lang') || 'en';
    var k = lang === 'es' ? 'data-es-placeholder' : 'data-en-placeholder';
    if (input.hasAttribute(k)) input.placeholder = input.getAttribute(k);
  };
  setPlaceholder();
  new MutationObserver(setPlaceholder).observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] });

  var responses = {
    en: [
      "Great question! For a 90-second explainer, typical turnaround is 4–6 weeks from brief to final delivery. We start with a one-page frame, then move to storyboard and production.",
      "Website projects range from €8–25k depending on scope. That includes design, development, and a 30-day support window. Want to book a call to scope yours?",
      "Absolutely — we build custom voice agents using Claude that handle inbound calls, qualify leads, and book appointments. Setup is typically €4–12k plus a monthly retainer for hosting and fine-tuning.",
      "We’ve worked across pharma, fintech, events, and industrial sectors. Each project gets the same cinema-grade treatment regardless of industry. Happy to share relevant case studies.",
      "Our process is simple: Listen → Frame → Make → Hand off. One thread, one team, no phone tag. Most projects ship in 4–8 weeks."
    ],
    es: [
      "¡Buena pregunta! Para un explainer de 90 segundos, el plazo típico es de 4–6 semanas desde el brief hasta la entrega final. Empezamos con un one-pager, luego storyboard y producción.",
      "Los proyectos web van de €8–25k dependiendo del alcance. Incluye diseño, desarrollo y 30 días de soporte. ¿Quieres agendar una llamada para definir el tuyo?",
      "Por supuesto — construimos agentes de voz custom con Claude que manejan llamadas entrantes, califican leads y agendan citas. El setup es típicamente €4–12k más un retainer mensual.",
      "Hemos trabajado en pharma, fintech, eventos e industria. Cada proyecto recibe el mismo tratamiento cinematográfico sin importar el sector. Encantados de compartir casos relevantes.",
      "Nuestro proceso es simple: Escuchar → Encuadrar → Hacer → Entregar. Un hilo, un equipo, sin teléfono escacharrado. La mayoría de proyectos se entregan en 4–8 semanas."
    ]
  };
  var responseIndex = 0;

  function addMsg(role, text, opts) {
    opts = opts || {};
    var div = document.createElement('div');
    div.className = 'ai__msg ai__msg--' + role + (opts.typing ? ' ai__msg--typing' : '');
    div.innerHTML = '<div class="ai__msg-label mono">' + (role === 'bot' ? 'AGENT' : 'YOU') + '</div><div class="ai__msg-body"></div>';
    div.querySelector('.ai__msg-body').textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  function ask(text) {
    addMsg('user', text);
    var typing = addMsg('bot', '', { typing: true });

    var lang = document.documentElement.getAttribute('data-lang') || 'en';
    var pool = responses[lang] || responses.en;
    var reply = pool[responseIndex % pool.length];
    responseIndex++;

    setTimeout(function() {
      typing.remove();
      var out = addMsg('bot', '');
      var body = out.querySelector('.ai__msg-body');
      var i = 0;
      var tick = function() {
        if (i >= reply.length) return;
        body.textContent = reply.slice(0, ++i);
        log.scrollTop = log.scrollHeight;
        setTimeout(tick, 12);
      };
      tick();
    }, 800);
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v) return;
    input.value = '';
    suggestBox.style.display = 'none';
    ask(v);
  });

  suggestBox.addEventListener('click', function(e) {
    var b = e.target.closest('button');
    if (!b) return;
    var lang = document.documentElement.getAttribute('data-lang') || 'en';
    var q = b.getAttribute(lang === 'es' ? 'data-q-es' : 'data-q-en');
    suggestBox.style.display = 'none';
    ask(q);
  });
})();
