/* ============ ARC CHAT WIDGET (floating, all pages) ============ */
(function () {
  if (window.ARCChatWidgetMounted) return;
  window.ARCChatWidgetMounted = true;

  function t(en, es) {
    var lang = document.documentElement.getAttribute('data-lang') || 'en';
    return lang === 'es' ? es : en;
  }

  var root = document.createElement('div');
  root.className = 'arcw';
  root.innerHTML = [
    '<button type="button" class="arcw__btn" aria-label="Open chat">',
    '  <span class="arcw__live"></span>',
    '  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">',
    '    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    '  </svg>',
    '</button>',
    '<div class="arcw__panel" role="dialog" aria-label="ARC agent">',
    '  <div class="arcw__head">',
    '    <div class="arcw__head-id">',
    '      <div class="arcw__avatar"></div>',
    '      <div>',
    '        <div class="arcw__name">ARC // INTAKE-AGENT-01</div>',
    '        <div class="arcw__sub" data-arcw-sub></div>',
    '      </div>',
    '    </div>',
    '    <div class="arcw__head-actions">',
    '      <button type="button" class="arcw__icon-btn" data-arcw-clear aria-label="Clear conversation">',
    '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
    '      </button>',
    '      <button type="button" class="arcw__icon-btn" data-arcw-close aria-label="Close chat">',
    '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>',
    '      </button>',
    '    </div>',
    '  </div>',
    '  <div class="arcw__log" data-arcw-log></div>',
    '  <form class="arcw__form" data-arcw-form>',
    '    <input class="arcw__input" type="text" autocomplete="off" data-arcw-input />',
    '    <button type="submit" class="arcw__send" data-arcw-send></button>',
    '  </form>',
    '</div>'
  ].join('');
  document.body.appendChild(root);

  var btn = root.querySelector('.arcw__btn');
  var panel = root.querySelector('.arcw__panel');
  var log = root.querySelector('[data-arcw-log]');
  var form = root.querySelector('[data-arcw-form]');
  var input = root.querySelector('[data-arcw-input]');
  var sendBtn = root.querySelector('[data-arcw-send]');
  var closeBtn = root.querySelector('[data-arcw-close]');
  var clearBtn = root.querySelector('[data-arcw-clear]');
  var subEl = root.querySelector('[data-arcw-sub]');

  function applyLang() {
    input.placeholder = t('Ask anything — projects, pricing, process…', 'Pregunta lo que quieras — proyectos, precios, proceso…');
    sendBtn.textContent = t('Send', 'Enviar');
    subEl.textContent = t('Online · responds in <2s', 'Online · responde en <2s');
    // El saludo cuenta como mensaje, así que mirar si el log está vacío no
    // sirve: al cambiar de idioma nunca se reescribía. Lo que decide es si hay
    // conversación guardada — si no la hay, lo único en pantalla es el saludo.
    if (window.ARCChat.get().length === 0) renderEmpty();
  }

  function renderEmpty() {
    log.innerHTML = '';
    var greeting = t(
      "Hi — I'm ARC's agent. I don't sound like Adrián yet, but I'm learning. Shall we work together? Tell me about yourself and how we're going to improve your platform.",
      "¡Hola! Soy el agente de ARC, no hablo como Adrián pero estoy aprendiendo. ¿Vamos a trabajar juntos? Cuéntame de ti y de cómo vamos a mejorar tu plataforma."
    );
    addMsg('assistant', greeting, false);
  }

  function addMsg(role, text, animate) {
    var div = document.createElement('div');
    var roleClass = role === 'user' ? 'arcw__msg--user' : 'arcw__msg--bot';
    div.className = 'arcw__msg ' + roleClass;
    div.innerHTML =
      '<div class="arcw__msg-label">' + (role === 'user' ? t('YOU', 'TÚ') : 'AGENT') + '</div>' +
      '<div class="arcw__msg-body"></div>';
    var body = div.querySelector('.arcw__msg-body');
    if (animate) {
      var i = 0;
      var tick = function () {
        if (i >= text.length) return;
        body.textContent = text.slice(0, ++i);
        log.scrollTop = log.scrollHeight;
        setTimeout(tick, 10);
      };
      tick();
    } else {
      body.textContent = text;
    }
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  function addTyping() {
    var div = document.createElement('div');
    div.className = 'arcw__msg arcw__msg--bot arcw__msg--typing';
    div.innerHTML = '<div class="arcw__msg-label">AGENT</div><div class="arcw__msg-body"></div>';
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  function render() {
    var history = window.ARCChat.get();
    log.innerHTML = '';
    if (history.length === 0) {
      renderEmpty();
      return;
    }
    for (var i = 0; i < history.length; i++) {
      addMsg(history[i].role, history[i].content, false);
    }
  }

  // Open / close
  function open() {
    root.classList.add('arcw--open');
    btn.classList.add('arcw__btn--open');
    setTimeout(function () { input.focus(); }, 200);
  }
  function close() {
    root.classList.remove('arcw--open');
    btn.classList.remove('arcw__btn--open');
  }
  btn.addEventListener('click', function () {
    if (root.classList.contains('arcw--open')) close(); else open();
  });
  closeBtn.addEventListener('click', close);

  clearBtn.addEventListener('click', function () {
    if (!confirm(t('Clear this conversation?', '¿Borrar esta conversación?'))) return;
    window.ARCChat.clear();
    renderEmpty();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v) return;
    input.value = '';
    addMsg('user', v, false);
    var typing = addTyping();
    sendBtn.disabled = true;

    window.ARCChat.send(v, {
      onUser: function () { /* already rendered above */ },
      onReply: function (reply) {
        typing.remove();
        addMsg('assistant', reply, true);
        sendBtn.disabled = false;
      },
      onError: function (msg) {
        typing.remove();
        addMsg('assistant', '⚠ ' + msg, false);
        sendBtn.disabled = false;
      }
    });
  });

  // Sync with store changes (from inline chat or other tabs)
  window.ARCChat.onChange(function () {
    if (sendBtn.disabled) return; // mid-send, let our own flow finish
    render();
  });

  // Lang switch listener
  new MutationObserver(applyLang).observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-lang']
  });

  applyLang();
  render();
})();
