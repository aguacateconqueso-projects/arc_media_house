/* ==========================================================
   ARC // Hero Shader — campo de luz en diagonal
   --------------------------------------------------------
   Sustituye a la mancha SVG (hero-bloom) dentro del encabezado.

   Uso:
     <link rel="stylesheet" href="hero-shader.css">
     <script src="hero-bloom.js" defer></script>   <- respaldo
     <script src="hero-shader.js" defer></script>

   Se carga después de hero-bloom.js a propósito: si el navegador no
   tiene WebGL2 este archivo no hace nada y la mancha SVG se queda
   como estaba. Si lo tiene, la quita y pinta el lienzo en su sitio.

   El movimiento va de la punta superior izquierda a la inferior
   derecha — hacia el botón de agendar la llamada. La dirección
   está en FLOW; es lo único que hay que tocar para reorientarlo.
   ========================================================== */
(function () {
  var scriptEl = document.currentScript;
  var targetSel = (scriptEl && scriptEl.dataset.target) || '.hero';
  var hero = document.querySelector(targetSel) || document.querySelector('header');
  if (!hero) return;

  /* Dirección del recorrido, en coordenadas de pantalla:
     x positivo va a la derecha, y positivo va hacia abajo.
     (1, 1) = de arriba-izquierda a abajo-derecha. */
  var FLOW = { x: 1, y: 1 };
  var SPEED = 1.0;          // mismas unidades por segundo que el original
  var MAX_DPR = 1.5;        // el bucle es de 20 pasos por píxel: no hace falta más

  /* Rampa de color: apagado -> medio -> luz.
     En oscuro la luz sale en el verde de la casa sobre el fondo negro.
     En claro se invierte: lo que allí brilla, aquí oscurece sobre el hueso. */
  var THEMES = {
    dark: {
      c1: [0.063, 0.102, 0.047],
      c2: [0.361, 0.561, 0.118],
      c3: [0.839, 0.976, 0.247],
      alpha: 0.92
    },
    light: {
      c1: [0.545, 0.631, 0.416],
      c2: [0.310, 0.420, 0.165],
      c3: [0.086, 0.141, 0.047],
      alpha: 0.45
    }
  };

  var vertSrc = [
    '#version 300 es',
    'layout(location=0) in vec2 a_pos;',
    'void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }'
  ].join('\n');

  var fragSrc = [
    '#version 300 es',
    'precision highp float;',
    'out vec4 fragColor;',
    '',
    'uniform vec2  u_res;',
    'uniform float u_time;',
    'uniform vec2  u_dir;',
    'uniform vec3  u_c1;',
    'uniform vec3  u_c2;',
    'uniform vec3  u_c3;',
    'uniform float u_alpha;',
    '',
    'void main(){',
    '  vec3 FC = vec3(gl_FragCoord.xy, 0.0);',
    '  vec3 r  = vec3(u_res, max(u_res.x, u_res.y));',
    '  float t = u_time;',
    '',
    '  vec4 o = vec4(0.0);',
    '  float z = 1.0, d = 0.0;',
    '',
    '  for (int i = 0; i < 20; i++) {',
    '    // q es el punto sin arrastrar: de ahí sale el color, que así se',
    '    // queda quieto. p es el mismo punto llevado por la corriente:',
    '    // de ahí sale la densidad, que es lo que se mueve.',
    '    vec3 q = z * normalize(FC.rgb * 2.0 - r.xyy);',
    '    vec3 p = q;',
    '    p.xy -= u_dir * t;',
    '    p.xy *= 0.4;',
    '    q.xy *= 0.4;',
    '    d = max(p.z + 6.0, dot(cos(p.xy), sin(p.yx / 0.4)));',
    '    z += d;',
    '    o += (cos(2e1*q.y/z + vec4(6.0,1.0,2.0,0.0)) + 1.0) * d / z / 4.0;',
    '  }',
    '',
    '  o = tanh(o * o);',
    '',
    '  float lum = clamp(dot(o.rgb, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0);',
    '  vec3 col = lum < 0.5',
    '    ? mix(u_c1, u_c2, lum * 2.0)',
    '    : mix(u_c2, u_c3, (lum - 0.5) * 2.0);',
    '  fragColor = vec4(col, smoothstep(0.0, 0.9, lum) * u_alpha);',
    '}'
  ].join('\n');

  function compile(gl, type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      var log = gl.getShaderInfoLog(sh);
      gl.deleteShader(sh);
      throw new Error(log || 'shader compile error');
    }
    return sh;
  }

  function link(gl, vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      var log = gl.getProgramInfoLog(p);
      gl.deleteProgram(p);
      throw new Error(log || 'program link error');
    }
    return p;
  }

  // ---- lienzo ----
  var canvas = document.createElement('canvas');
  canvas.className = 'hero__shader';
  canvas.setAttribute('aria-hidden', 'true');

  var gl = null;
  try {
    gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power'
    });
  } catch (e) { /* sin WebGL2: se queda la mancha SVG */ }
  if (!gl) return;

  var prog;
  try {
    prog = link(gl, vertSrc, fragSrc);
  } catch (e) {
    return; // idem: respaldo intacto
  }
  gl.useProgram(prog);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 1, -1, -1, 1,
    -1, 1, 1, -1, 1, 1
  ]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  var uRes = gl.getUniformLocation(prog, 'u_res');
  var uTime = gl.getUniformLocation(prog, 'u_time');
  var uDir = gl.getUniformLocation(prog, 'u_dir');
  var uC1 = gl.getUniformLocation(prog, 'u_c1');
  var uC2 = gl.getUniformLocation(prog, 'u_c2');
  var uC3 = gl.getUniformLocation(prog, 'u_c3');
  var uAlpha = gl.getUniformLocation(prog, 'u_alpha');

  // gl_FragCoord.y crece hacia arriba, así que «hacia abajo» es y negativa
  var len = Math.hypot(FLOW.x, FLOW.y) || 1;
  gl.uniform2f(uDir, (FLOW.x / len) * SPEED, (-FLOW.y / len) * SPEED);

  function applyTheme() {
    var name = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    var th = THEMES[name];
    gl.useProgram(prog);
    gl.uniform3fv(uC1, th.c1);
    gl.uniform3fv(uC2, th.c2);
    gl.uniform3fv(uC3, th.c3);
    gl.uniform1f(uAlpha, th.alpha);
  }
  applyTheme();

  function resize() {
    var dpr = Math.max(1, Math.min(MAX_DPR, window.devicePixelRatio || 1));
    var w = Math.max(1, Math.floor((canvas.clientWidth || hero.clientWidth) * dpr));
    var h = Math.max(1, Math.floor((canvas.clientHeight || hero.clientHeight) * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
  }

  // ---- se coloca detrás del contenido del encabezado ----
  hero.querySelectorAll(':scope > .hero__bloom').forEach(function (el) { el.remove(); });
  hero.prepend(canvas);

  var cs = getComputedStyle(hero);
  if (cs.position === 'static') hero.style.position = 'relative';
  if (cs.overflow === 'visible') hero.style.overflow = 'hidden';

  Array.prototype.forEach.call(hero.children, function (child) {
    if (child === canvas) return;
    var ccs = getComputedStyle(child);
    if (ccs.position === 'static') child.style.position = 'relative';
    if (ccs.zIndex === 'auto') child.style.zIndex = '2';
  });

  resize();

  // ---- bucle ----
  var raf = 0;
  var visible = true;      // el encabezado está en pantalla
  var awake = true;        // la pestaña está a la vista
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var t = 0;
  var last = performance.now();

  function frame(now) {
    raf = 0;
    var dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;
    gl.uniform1f(uTime, t);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    if (visible && awake && !reduced) raf = requestAnimationFrame(frame);
  }

  function play() {
    if (raf || !visible || !awake || reduced) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function pause() {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
  }

  if (reduced) {
    frame(performance.now());   // un fotograma quieto y ya
  } else {
    play();
  }

  window.addEventListener('resize', function () {
    resize();
    if (reduced) frame(performance.now());
  }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    awake = !document.hidden;
    if (awake) play(); else pause();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) play(); else pause();
    }, { rootMargin: '120px' }).observe(hero);
  }

  var themeObserver = new MutationObserver(function () {
    applyTheme();
    if (reduced) frame(performance.now());
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  canvas.addEventListener('webglcontextlost', function (e) {
    e.preventDefault();
    pause();
    canvas.remove();
  });
})();
