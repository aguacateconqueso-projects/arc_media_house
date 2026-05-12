/* ============ ARC CHAT STORE ============
   Shared state for the inline (home) chat and the floating widget.
   Persists conversation in localStorage so visitors return to it.
   ========================================================== */
(function () {
  var KEY = 'arc_chat_history_v1';
  var SESSION_KEY = 'arc_chat_session_id_v1';
  var MAX = 40; // cap to avoid sending huge payloads to the API
  var listeners = [];

  function uuid() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return 'sess-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  function sessionId() {
    try {
      var s = localStorage.getItem(SESSION_KEY);
      if (!s) {
        s = uuid();
        localStorage.setItem(SESSION_KEY, s);
      }
      return s;
    } catch (e) {
      return 'no-storage-' + Date.now();
    }
  }

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function write(history) {
    try {
      var trimmed = history.slice(-MAX);
      localStorage.setItem(KEY, JSON.stringify(trimmed));
    } catch (e) { /* quota or disabled — silent */ }
  }

  function emit() {
    var h = read();
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](h); } catch (e) {}
    }
  }

  // Cross-tab sync (storage event fires in OTHER tabs)
  window.addEventListener('storage', function (e) {
    if (e.key === KEY) emit();
  });

  window.ARCChat = {
    get: read,

    add: function (role, content) {
      var h = read();
      h.push({ role: role, content: content });
      write(h);
      emit();
    },

    clear: function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      emit();
    },

    onChange: function (cb) {
      listeners.push(cb);
      return function () {
        var i = listeners.indexOf(cb);
        if (i >= 0) listeners.splice(i, 1);
      };
    },

    send: function (text, callbacks) {
      callbacks = callbacks || {};
      var h = read();
      h.push({ role: 'user', content: text });
      write(h);
      emit();
      if (callbacks.onUser) callbacks.onUser(text);

      var lang = (document.documentElement.getAttribute('data-lang') || 'en');
      return fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: read(),
          session_id: sessionId(),
          lang: lang
        })
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.error) {
            if (callbacks.onError) callbacks.onError(data.error);
            return;
          }
          var reply = data.reply;
          var h2 = read();
          h2.push({ role: 'assistant', content: reply });
          write(h2);
          emit();
          if (callbacks.onReply) callbacks.onReply(reply);
        })
        .catch(function () {
          if (callbacks.onError) callbacks.onError('Connection issue. Email hello@arcmediahouse.com');
        });
    }
  };
})();
