/* ============ AI CHAT (home inline — uses ARCChat store) ============ */
(function aiChat() {
  var log = document.getElementById('ai-log');
  var form = document.getElementById('ai-form');
  var input = document.getElementById('ai-input');
  var suggestBox = document.getElementById('ai-suggest');
  if (!log || !form || !window.ARCChat) return;

  var setPlaceholder = function () {
    var lang = document.documentElement.getAttribute('data-lang') || 'en';
    var k = lang === 'es' ? 'data-es-placeholder' : 'data-en-placeholder';
    if (input && input.hasAttribute(k)) input.placeholder = input.getAttribute(k);
  };
  setPlaceholder();
  new MutationObserver(setPlaceholder).observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] });

  function addMsg(role, text, opts) {
    opts = opts || {};
    var div = document.createElement('div');
    div.className = 'ai__msg ai__msg--' + role + (opts.typing ? ' ai__msg--typing' : '');
    div.innerHTML = '<div class="ai__msg-label mono">' + (role === 'bot' ? 'AGENT' : 'YOU') + '</div><div class="ai__msg-body"></div>';
    if (text) div.querySelector('.ai__msg-body').textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  function typewriter(el, text) {
    var body = el.querySelector('.ai__msg-body');
    var i = 0;
    var tick = function () {
      if (i >= text.length) return;
      body.textContent = text.slice(0, ++i);
      log.scrollTop = log.scrollHeight;
      setTimeout(tick, 10);
    };
    tick();
  }

  // Restore prior history (from previous session) into the inline log,
  // but keep the original welcome bot message as the first item if present.
  function renderHistory() {
    var history = window.ARCChat.get();
    if (history.length === 0) return; // keep the static welcome message
    // Remove the static welcome to avoid duplicates with stored history
    log.innerHTML = '';
    for (var i = 0; i < history.length; i++) {
      var role = history[i].role === 'user' ? 'user' : 'bot';
      addMsg(role, history[i].content);
    }
  }
  renderHistory();

  // Re-render if cleared/changed elsewhere (widget, other tab)
  window.ARCChat.onChange(function () {
    var history = window.ARCChat.get();
    if (history.length === 0) {
      // restore the original welcome — reload to keep it simple
      // (this only triggers when user clears from the widget)
      log.innerHTML = '';
      var div = document.createElement('div');
      div.className = 'ai__msg ai__msg--bot';
      var lang = document.documentElement.getAttribute('data-lang') || 'en';
      var greet = lang === 'es'
        ? 'Hola — soy el agente de ARC. Ayudo a equipos a definir proyectos de vídeo, web e IA. ¿En qué estás trabajando?'
        : "Hi — I'm ARC's agent. I help teams scope video, web and AI work. What are you working on?";
      div.innerHTML = '<div class="ai__msg-label mono">AGENT</div><div class="ai__msg-body">' + greet + '</div>';
      log.appendChild(div);
    }
  });

  function ask(text) {
    addMsg('user', text);
    var typing = addMsg('bot', '', { typing: true });

    window.ARCChat.send(text, {
      onUser: function () { /* already rendered above */ },
      onReply: function (reply) {
        typing.remove();
        var out = addMsg('bot', '');
        typewriter(out, reply);
      },
      onError: function (msg) {
        typing.querySelector('.ai__msg-body').textContent = '⚠ ' + msg;
        typing.classList.remove('ai__msg--typing');
      }
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v) return;
    input.value = '';
    if (suggestBox) suggestBox.style.display = 'none';
    ask(v);
  });

  if (suggestBox) {
    suggestBox.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var lang = document.documentElement.getAttribute('data-lang') || 'en';
      var q = b.getAttribute(lang === 'es' ? 'data-q-es' : 'data-q-en');
      suggestBox.style.display = 'none';
      ask(q);
    });
  }
})();
