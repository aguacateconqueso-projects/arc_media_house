# ARC Media House — Guía de marca

Documento de referencia del sistema visual de ARC Media House. No es una
propuesta: describe lo que ya está implementado en el sitio, para que
cualquiera que toque el código o produzca una pieza nueva lo haga igual.

La fuente de verdad de los tokens es `styles.css`. Si algo cambia ahí,
cámbialo aquí también.

---

## 1. La marca

**Nombre completo:** ARC Media House
**Lockup habitual:** `ARC / Media House`
**Firma corta:** `ARC`
**Dominio:** arcmediahouse.com · **Contacto:** hello@arcmediahouse.com
**Base:** Madrid · Trabajo en remoto a nivel mundial
**Vigencia de marca:** ARC / 2019—2026 · sitio v2.0

### Posicionamiento

Estudio independiente. Trabajo corporativo con la disciplina del escenario:
si mañana sube el telón, hoy tiene que estar todo listo.

### Tono de voz

Sacado del [Manifesto](manifesto.html) — siete movimientos que definen cómo
hablamos:

| Principio | Qué significa en la escritura |
|---|---|
| **El escenario** | Se piensa antes. Nada de improvisar en público. |
| **El detalle** | Un mal kerning comunica lo mismo que una mala respuesta: que a nadie le importó. |
| **El coro** | Muchas voces, un solo sonido. La web, el video y el agente suenan igual. |
| **Alma** | Lo corporativo no es sin alma. Toda empresa tiene historia y criterio. |
| **Criterio** | No perseguimos clientes. Mostramos criterio y dejamos que se reconozca. |
| **Dicho en voz alta** | La urgencia inventada no es urgencia. La mediocridad amable es peor que un no. |
| **Telón** | Curtain up — tomorrow. |

**En la práctica:** frases cortas, sin relleno de agencia. Nada de
"soluciones 360" ni "sinergias". Se dice el precio. Se dice el plazo. Se
dice que no cuando toca.

### Idiomas

El sitio es bilingüe **es / en**, con español como idioma por defecto
(`<html lang="es">`, `localStorage['arc-lang'] = 'es'`). Todo texto visible
lleva sus dos atributos:

```html
<span data-en="Questions" data-es="Preguntas">Preguntas</span>
```

El switcher vive en `app.js` y lee la misma clave en todas las páginas.
**Si agregas copy nuevo, agrega los dos idiomas.** Español latino neutro,
sin voseo ni modismos regionales.

---

## 2. Color

El sistema es **casi monocromo**: negro, hueso, y un solo acento verde-lima
que aparece poco y por eso pesa. El color de la marca es la ausencia de
color.

### Tema oscuro (por defecto)

`:root` en `styles.css`

| Token | Valor | Hex | Uso |
|---|---|---|---|
| `--bg` | `#0a0a0a` | `#0A0A0A` | Fondo base de toda la página |
| `--bg-2` | `#131313` | `#131313` | Tarjetas, paneles, superficies elevadas |
| `--bg-3` | `#1a1a1a` | `#1A1A1A` | Superficie sobre superficie (hover, inputs) |
| `--fg` | `#f4f4f1` | `#F4F4F1` | Texto principal — hueso, nunca blanco puro |
| `--fg-2` | `#a8a8a3` | `#A8A8A3` | Texto secundario, párrafos, eyebrows |
| `--fg-3` | `#5a5a57` | `#5A5A57` | Metadatos, texto de pie, estados apagados |
| `--line` | `#2a2a2a` | `#2A2A2A` | Todos los bordes y divisores, 1px |
| `--accent` | `oklch(0.92 0.20 120)` | ≈ `#D4F73E` | Acento único |
| `--accent-ink` | `#0a0a0a` | `#0A0A0A` | Texto **sobre** el acento |

### Tema claro

`[data-theme="light"]` — el mismo sistema invertido, no una paleta nueva.

| Token | Valor | Hex | Uso |
|---|---|---|---|
| `--bg` | `#f4f4f1` | `#F4F4F1` | Fondo base |
| `--bg-2` | `#ebebe6` | `#EBEBE6` | Tarjetas y paneles |
| `--bg-3` | `#deded8` | `#DEDED8` | Superficie sobre superficie |
| `--fg` | `#0a0a0a` | `#0A0A0A` | Texto principal |
| `--fg-2` | `#4a4a47` | `#4A4A47` | Texto secundario |
| `--fg-3` | `#8a8a87` | `#8A8A87` | Metadatos |
| `--line` | `#d2d2cd` | `#D2D2CD` | Bordes |
| `--accent` | `oklch(0.78 0.20 120)` | ≈ `#A8C800` | Acento, bajado para no quemar |
| `--accent-ink` | `#0a0a0a` | `#0A0A0A` | Texto sobre el acento |

### Sobre el acento y OKLCH

El acento está definido en **OKLCH, no en hex**, y eso es intencional: en
pantallas P3 el verde sale más saturado de lo que sRGB puede mostrar. Los
hex de arriba son la **caída a sRGB**, aproximados:

- `oklch(0.92 0.20 120)` → `#D4F73E` (cabe en sRGB)
- `oklch(0.78 0.20 120)` → `#A8C800` (recortado; fuera de gamut sRGB)

**Regla:** en el sitio usa siempre el token OKLCH. Los hex son para piezas
que no pueden con OKLCH — Figma, redes sociales, PDFs, plantillas de email,
firmas de correo.

`admin.html` usa `#b8ff3c` porque es un panel interno aislado con su propio
`:root`. No lo tomes como el valor de marca.

### Colores de sistema

No son marca, pero existen y hay que respetarlos:

| Color | Valor | Dónde |
|---|---|---|
| Cian glitch | `oklch(0.80 0.25 195)` ≈ `#00EAEF` | Canal de la animación glitch (`service.css`) |
| Magenta glitch | `oklch(0.65 0.28 0)` ≈ `#FF0088` | Canal de la animación glitch (`service.css`) |
| Error | `#ff6b6b` | Mensajes de error en formularios |

Los dos primeros solo aparecen como fantasmas de separación RGB durante la
entrada de un título. **Nunca** como color plano ni como relleno.

### Contraste (WCAG, sobre el fondo del tema)

| Combinación | Ratio | Veredicto |
|---|---|---|
| `--fg` sobre `--bg` (ambos temas) | 17.97:1 | AAA |
| `--fg-2` sobre `--bg` (oscuro) | 8.29:1 | AAA |
| `--fg-2` sobre `--bg` (claro) | 8.07:1 | AAA |
| `--fg-3` sobre `--bg` (oscuro) | 2.86:1 | Solo decorativo / texto grande |
| Acento sobre `--bg` oscuro | 16.19:1 | AAA |
| `--accent-ink` sobre acento oscuro | 16.19:1 | AAA |
| `--accent-ink` sobre acento claro | 10.30:1 | AAA |
| **Acento sobre `--bg` claro** | **1.74:1** | ❌ **No usar como texto** |

Las dos que hay que memorizar:

1. `--fg-3` no es para texto que alguien tenga que leer. Es para
   metadatos, sellos, cosas que se miran de reojo.
2. **En tema claro el acento no sirve como color de texto.** Sirve como
   fondo (con `--accent-ink` encima), como barra, como punto, como borde.
   Nunca como letra sobre hueso.

### Proporción

Aproximadamente **90 / 9 / 1**: fondo, texto, acento. El acento se reserva
para: el punto del eyebrow, el botón primario, la barra de progreso de
scroll, el `::selection`, el hover de links del footer y el indicador de
"vivo" del chat. Si aparece en dos sitios de la misma pantalla, quítalo de
uno.

---

## 3. Tipografía

### Familias

| Rol | Familia | Fallbacks | Pesos cargados |
|---|---|---|---|
| **Display / texto** | `Geist` | `Inter`, `system-ui`, `sans-serif` | 300, 400, 500, 600, 700 |
| **Mono / interfaz** | `Geist Mono` | `JetBrains Mono`, `ui-monospace`, `monospace` | 400, 500 |

Se cargan desde Google Fonts en el `<head>` de cada página:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Geist es la voz. Geist Mono es la etiqueta.** Todo lo que sea navegación,
botón, eyebrow, metadato o pie va en mono, en mayúsculas, con tracking
abierto. Todo lo que sea contenido va en Geist.

> **Nota:** `arcmediahouse_v3.html` y `fenex/` cargan `Inter`. Son,
> respectivamente, una versión antigua del sitio y un proyecto de cliente.
> No forman parte del sistema tipográfico vigente.

### Escala tipográfica

Toda la escala es **fluida con `clamp()`** — no hay breakpoints
tipográficos, el texto respira con el viewport.

| Clase | Tamaño | Tracking | Interlineado | Uso |
|---|---|---|---|---|
| `.h-display` | `clamp(64px, 14vw, 240px)` | `-0.05em` | 0.92 | El wordmark del hero, el cierre del footer |
| `.h-1` | `clamp(40px, 6.5vw, 104px)` | `-0.04em` | 0.94 | Título de página |
| `.h-2` | `clamp(32px, 4.4vw, 72px)` | `-0.035em` | 0.96 | Título de sección |
| `.h-3` | `clamp(22px, 2vw, 32px)` | `-0.02em` | 1.1 | Título de bloque o tarjeta |
| `.body-lg` | `clamp(18px, 1.4vw, 22px)` | — | 1.45 | Entradilla, `max-width: 60ch` |
| *(base)* | `16px` | `-0.01em` | 1.4 | Cuerpo por defecto de `body` |
| `.body` | `15px` | — | 1.5 | Párrafo en tarjetas |
| `.body-sm` | `13px` | — | 1.45 | Nota al pie, aclaración |
| `.eyebrow` | `11px` mono | `0.12em` | — | Etiqueta de sección, **en mayúsculas** |

Titulares en peso **500** con tracking negativo. Los subtítulos y las líneas
de contrapunto van en **cursiva** con color `--fg-2`: es un recurso
recurrente de la marca (`.hero__h1-line.italic`).

### Reglas de tracking

- Cuanto **más grande** el texto, **más negativo** el tracking. De `-0.01em`
  en cuerpo a `-0.05em` en display.
- Cuanto **más pequeño y mono**, **más positivo**. De `0.06em` en links de
  nav a `0.12em` en eyebrows.
- Mono nunca lleva tracking negativo.

### Cursivas y ligaduras

```css
.italic { font-style: italic; font-feature-settings: "ss02"; }
.mono   { font-feature-settings: "ss01"; letter-spacing: 0; }
```

`ss01` en mono y `ss02` en cursiva son sets estilísticos de Geist. Están
activados a propósito — no los quites al copiar estilos.

---

## 4. Logo e identidad

### Lockups

| Contexto | Forma | Implementación |
|---|---|---|
| **Nav** | `ARC / Media House` — `ARC` en peso 600, resto en 400 | `.nav__logo`, Geist Mono 12px, `letter-spacing: 0.08em`, mayúsculas |
| **Intro** | `A R C` letra a letra + `Media House` debajo | `.intro__char`, Geist 500, `clamp(80px, 18vw, 280px)`, `letter-spacing: -0.06em` |
| **Footer** | `Make— something.` en display | `.foot-display`, `clamp(80px, 18vw, 260px)`, `line-height: 0.84` |
| **Firma legal** | `ARC / 2019—2026` · `Made in Madrid` | `.foot-meta`, mono 11px, `--fg-3` |

Fíjate en el **em dash** de `Make— something.` y en el rango `2019—2026`:
la marca usa em dash pegado, sin espacios. No lo cambies por guion.

### Archivos

| Archivo | Tamaño | Uso |
|---|---|---|
| `Logos/Logo White Alpha.png` | 1280×720, alfa | Sobre fondo oscuro |
| `Logos/Logo Black Alpha.png` | 1280×720, alfa | Sobre fondo claro |
| `Logos/favicon.jpg` | — | Favicon y apple-touch-icon del sitio |
| `favicon.ico` | — | Fallback heredado en la raíz |
| `apple-touch-icon.png` | 180×180 | Icono de iOS |
| `og-image.png` | 1200×630 | Tarjeta de Open Graph / Twitter |

Logos de clientes en `Logos/brands/` (Roche, Novo Nordisk, Schneider
Electric, P&G, SISO). Fotos de equipo en `Logos/` (`adrian.jpg`,
`robs_photo.png`).

> **Pendiente conocido:** los meta de OG apuntan a
> `https://arcmediahouse.com/og-image.jpg`, pero el archivo del repo es
> `og-image.png`. Hay que alinear una de las dos cosas.

### Qué no hacer con el logo

- No lo estires ni lo rotes.
- No cambies `ARC / Media House` por `ARC Media House` en el nav: la barra
  es parte del lockup.
- No pongas el logo blanco sobre fondo claro ni al revés.
- No colorees el logo con el acento. El acento no es el logo.
- No le pongas sombra, contorno ni degradado.

---

## 5. Layout y espaciado

### Grilla

```css
--grid: 12;                          /* 12 columnas */
--gutter: clamp(16px, 2vw, 28px);    /* separación entre columnas */
--pad-x: clamp(20px, 4vw, 56px);     /* margen lateral de página */
--radius: 0px;                       /* sin esquinas redondeadas */
```

`.container` aplica el padding lateral. `.grid12` da las doce columnas.

**`--radius: 0px` no es un placeholder.** La marca es de esquinas rectas:
botones, tarjetas, paneles e inputs son rectángulos. Lo único redondo del
sistema es el cursor, el punto del eyebrow y el botón flotante del chat.

### Anchos y breakpoints

| Valor | Rol |
|---|---|
| `720px` | Breakpoint principal — móvil. Aquí el cursor custom se apaga, el footer pasa a 2 columnas y los botones encogen. |
| `920px` | Ancho máximo de columnas de contenido en varias secciones. |
| `60ch` | Ancho máximo de `.body-lg`, por legibilidad. |

### Divisores

Todo se separa con **una línea de 1px en `--line`**, nunca con sombra:

```css
.divider   { height: 1px; background: var(--line); width: 100%; }
.divider-v { width: 1px;  background: var(--line); align-self: stretch; }
```

### Capas (z-index)

| Capa | z-index |
|---|---|
| Nav fija | `100` |
| Barra de progreso de scroll | `200` |
| Pantalla de intro | `1000` |
| Cursor y widget de chat | `9999` |

---

## 6. Movimiento

### Tokens

```css
--t-fast: 180ms cubic-bezier(.2,.7,.2,1);
--t-med:  420ms cubic-bezier(.2,.7,.2,1);
--t-slow: 800ms cubic-bezier(.2,.7,.2,1);
```

La curva `cubic-bezier(.2,.7,.2,1)` es **la** curva de la marca. Sale rápido
y frena largo. Si escribes una animación nueva, usa esa — no `ease`, no
`ease-in-out`.

### Patrones

| Patrón | Qué hace |
|---|---|
| `.reveal` | Sube 28px y aparece al entrar en viewport. `.is-in` lo dispara. Escalonado con `data-delay="1..5"` a 80ms por paso. |
| Entrada del hero | Los caracteres suben desde `translateY(110%)` con overflow oculto — como si salieran de detrás del telón. |
| Entrada con blur | Las líneas del `h1` entran con `filter: blur(8px)` que se resuelve a 0. |
| Glitch | Separación RGB en cian/magenta durante ~1.5s en la entrada de títulos de servicio. Solo en la entrada. |
| Barrido de botón | El relleno del botón sube desde `translateY(101%)` en hover. |
| Flecha | La flecha del botón se mueve 4px a la derecha en hover. |

### Accesibilidad de movimiento

`service.css` ya implementa `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  /* animaciones off, opacidad 1, sin transform */
  .glitch-in::before, .glitch-in::after { display: none; }
}
```

**Toda animación nueva tiene que tener su salida por este bloque.** El
glitch en particular es incompatible con sensibilidad vestibular.

---

## 7. Componentes

### Botón

```html
<a class="btn btn--primary" href="#">
  Empezar <span class="arrow">→</span>
</a>
```

- Geist Mono 12px, mayúsculas, `letter-spacing: 0.08em`
- Padding `18px 28px`, borde de 1px, sin radio
- `.btn` — contorno. El relleno sube en hover.
- `.btn--primary` — fondo acento, texto `--accent-ink`. En hover pasa a
  `--fg`.
- `.btn--lg` — 14px / `24px 40px`. Solo para el cierre de sección centrado.
- La flecha va siempre en `<span class="arrow">`.

### Eyebrow

```html
<div class="eyebrow"><span class="dot"></span>Servicios</div>
```

Mono 11px, mayúsculas, `--fg-2`, con punto de 6px en acento. Es la etiqueta
estándar de sección.

### Cursor

Punto de 8px con `mix-blend-mode: difference`. Crece a 56px en acento sobre
elementos interactivos (`.is-hover`), se convierte en barra de 2×22px sobre
texto (`.is-text`). `body { cursor: none }` en desktop, `cursor: auto` bajo
720px.

### Nav

Fija arriba, con degradado de `--bg` a transparente y `backdrop-filter:
blur(2px)`. Links en mono 12px mayúsculas con subrayado animado.

### Footer

Wordmark display → 4 columnas (Studio / Services / Elsewhere / Direct) → fila
de metadatos. Bajo 720px pasa a 2 columnas. Los links del footer hacen hover
en acento.

### Widget de chat

Botón flotante de 60px, redondo, `--fg` sobre `--bg`, abajo a la derecha con
24px de margen. Panel de 380×560px, `--bg-2` con borde `--line`. El punto de
"vivo" usa `oklch(0.78 0.20 120)`.

### Selección de texto

```css
::selection { background: var(--accent); color: var(--accent-ink); }
```

---

## 8. Checklist para piezas nuevas

Antes de dar por hecha una página, una sección o una pieza:

- [ ] Los colores salen de tokens (`var(--fg)`), no de hex escritos a mano.
- [ ] Funciona en tema oscuro **y** en tema claro.
- [ ] El acento aparece una vez, no tres.
- [ ] El acento no se usa como texto sobre fondo claro.
- [ ] El copy tiene `data-es` **y** `data-en`.
- [ ] Los titulares en Geist; nav, botones, eyebrows y metadatos en Geist Mono.
- [ ] Sin `border-radius` salvo que sea un punto o un botón redondo.
- [ ] Las separaciones son líneas de 1px en `--line`, no sombras.
- [ ] Las transiciones usan `cubic-bezier(.2,.7,.2,1)`.
- [ ] Hay salida por `prefers-reduced-motion`.
- [ ] Los textos usan `clamp()`, no tamaños fijos.
- [ ] Se ve bien a 720px.

---

## 9. Referencia rápida de archivos

| Archivo | Contiene |
|---|---|
| `styles.css` | **El sistema de diseño.** Tokens, tipografía, layout, botones, nav, footer, cursor. Empieza por aquí. |
| `home.css` | Estilos exclusivos de la home. |
| `service.css` | Compartido por `services-web/video/ai`. Glitch y `prefers-reduced-motion`. |
| `manifesto.css` | Página de manifesto. |
| `ai-chat-widget.css` | Widget flotante de chat. |
| `hero-bloom.css`, `hero-shader.css` | Efectos de fondo del hero. |
| `app.js` | Switcher de idioma, cursor, reveals — compartido. |
| `manifesto.html` | Fuente canónica del tono de voz. |
| `progreso.md` | Bitácora de decisiones del proyecto. |
