/* ============ AI CHAT (real Claude via Netlify function) ============ */
(function aiChat() {
  var log = document.getElementById('ai-log');
  var form = document.getElementById('ai-form');
  var input = document.getElementById('ai-input');
  var suggestBox = document.getElementById('ai-suggest');
  if (!log || !form) return;

  var setPlaceholder = function() {
    var lang = document.documentElement.getAttribute('data-lang') || 'en';
    var k = lang === 'es' ? 'data-es-placeholder' : 'data-en-placeholder';
    if (input && input.hasAttribute(k)) input.placeholder = input.getAttribute(k);
  };
  setPlaceholder();
  new MutationObserver(setPlaceholder).observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] });

  var history = [];

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
    var tick = function() {
      if (i >= text.length) return;
      body.textContent = text.slice(0, ++i);
      log.scrollTop = log.scrollHeight;
      setTimeout(tick, 10);
    };
    tick();
  }

  function ask(text) {
    addMsg('user', text);
    history.push({ role: 'user', content: text });

    var typing = addMsg('bot', '', { typing: true });

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history })
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      typing.remove();
      if (data.error) {
        addMsg('bot', data.error);
        return;
      }
      var reply = data.reply;
      history.push({ role: 'assistant', content: reply });
      var out = addMsg('bot', '');
      typewriter(out, reply);
    })
    .catch(function() {
      typing.querySelector('.ai__msg-body').textContent = '⚠ Connection issue. Email hello@arcmediahouse.com';
      typing.classList.remove('ai__msg--typing');
    });
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v) return;
    input.value = '';
    if (suggestBox) suggestBox.style.display = 'none';
    ask(v);
  });

  if (suggestBox) {
    suggestBox.addEventListener('click', function(e) {
      var b = e.target.closest('button');
      if (!b) return;
      var lang = document.documentElement.getAttribute('data-lang') || 'en';
      var q = b.getAttribute(lang === 'es' ? 'data-q-es' : 'data-q-en');
      suggestBox.style.display = 'none';
      ask(q);
    });
  }
})();
