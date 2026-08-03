# Progreso — ARC Media House

Estado del sitio y de lo que queda pendiente. Se actualiza cuando algo cambia de sitio.

Última actualización: 3 de agosto de 2026.

---

## Dónde estamos

El estudio pasó de vender tres cosas (web, agentes IA, vídeo) a vender una: **plataformas y webs
para marcas personales que venden cursos y membresías**.

El home ya refleja ese cambio. Las páginas de servicios, equipo y manifiesto siguen en el
repositorio y funcionando, pero **ya no se enlazan desde el menú ni desde el pie**. No están
borradas: se puede entrar por URL directa y se pueden volver a enlazar cuando haga falta.

---

## Estructura del sitio

| Archivo | Qué es | Enlazado desde el menú |
|---|---|---|
| `index.html` | Home — página de ventas, once secciones | — |
| `services-web.html` | Servicio: web | No |
| `services-ai.html` | Servicio: agentes IA | No |
| `services-video.html` | Servicio: vídeo | No |
| `people.html` | Equipo | No |
| `manifesto.html` | Manifiesto | No |
| `admin.html` | Registro de conversaciones del agente, con contraseña | No |

Hojas de estilo: `styles.css` (sistema de diseño, común a todo), `home.css` (home),
`service.css` + los `*-additions.css` (páginas de servicio), `manifesto.css`,
`ai-chat-widget.css`, `hero-shader.css`, `hero-bloom.css`.

JavaScript: `app.js` (tema, idioma, cursor, apariciones, menú móvil, reloj, animación de entrada),
`ai-chat-store.js` (estado compartido del chat), `ai-chat.js` (chat incrustado del home),
`ai-chat-widget.js` (widget flotante, en todas las páginas), `home.js`, `hero-shader.js`,
`hero-bloom.js`.

---

## El home nuevo

Once secciones, en este orden:

1. Encabezado — todo centrado sobre el fondo animado
2. Lo que escucho — cinco frases de clientes
3. Lo que importa — las tres cosas que deciden si vendes
4. Qué se construye — las cinco piezas de la plataforma
5. La prueba — emilseriosacademy.com
6. Cómo trabajo — cuatro pasos
7. Precio — qué incluye, qué no, mantenimiento, el agente
8. Preguntas honestas — ocho, desplegables
9. Hablemos — contacto
10. El widget del agente
11. Newsletter

Menú: logo, Precio, Preguntas, Contacto. Pie: correo, ciudad y aviso de derechos.

**El encabezado va centrado:** el titular grande arriba, y debajo el párrafo, «Desde €2.500.» y el
botón, los cuatro sobre el mismo eje. El párrafo se corta a 46rem para que no se estire de margen a
margen. Los tres bloques numerados que había a la derecha se quitaron por decorativos. En móvil
sigue centrado, solo se aprieta el espacio entre bloques.

Fuera de ese eje quedan la línea de arriba («Estudio Independiente» a la izquierda, el reloj a la
derecha) y el «Scroll» de la esquina, que son marcas de encuadre, no parte del mensaje.

**El fondo del encabezado es un shader WebGL** (`hero-shader.js` + `hero-shader.css`). Es un campo
de luz que corre en diagonal, de la punta superior izquierda a la inferior derecha — es decir, hacia
el botón de agendar la llamada. La dirección está en la constante `FLOW` del archivo; es lo único
que hay que tocar para reorientarlo. La luz sale en el verde de acento sobre el negro, y en tema
claro se invierte: lo que allí brilla, aquí oscurece sobre el hueso.

La mancha SVG anterior (`hero-bloom.js` + `hero-bloom.css`) sigue en el repositorio y **hace de
respaldo**: los dos archivos se cargan, en ese orden, y el shader solo quita la mancha si consigue
un contexto WebGL2. Si el navegador no lo tiene, no pasa nada y se ve la mancha de siempre. El
lienzo se para cuando la pestaña se oculta o el encabezado sale de pantalla, y con
`prefers-reduced-motion` pinta un solo fotograma quieto.

### La sección 01 — «Lo que escucho»

Se rehízo entera en agosto de 2026 (PR #74 a #78). Era una columna de cinco citas a 46px con 80px
de aire entre ellas: metro y medio de pantalla para decir cinco cosas cortas, y todo el lado derecho
vacío. Ahora tiene tres piezas.

**La lista.** Cada cita es una fila: el número en mono a la izquierda, la frase en cursiva, y una
regla fina de margen a margen debajo. Es la geometría que ya usaban los bloques de la sección 02
(`.key`) y las filas de servicio — columna de 100px, 40px de separación, alineadas por la base — y
son las reglas, no la posición de cada frase, las que dan el orden. El texto llega a 30px.

**Los números** salen de un contador de CSS (`counter-reset` en `.voices`), así que el HTML no lleva
marcado nuevo. Van sin corchetes para no confundirse con los `[ 01 ]` de la sección 02.

**Las dos frases que la enmarcan** — «Antes de hablar…» arriba y «El mismo problema, dicho de cinco
maneras» abajo — van contra el margen derecho, a `clamp(22px, 2.4vw, 36px)`, en peso 500 y en
`var(--fg)`, el color del titular de la sección 02. Terminan justo donde terminan las reglas. Así la
vista pasea: arranca arriba a la derecha, baja a las citas —pegadas a la izquierda— y sale abajo por
la derecha otra vez.

Llevan `text-wrap: balance` con `max-width: 60ch`: en pantalla grande cada frase entra en una línea
y, cuando no cabe, se parte en líneas parejas en vez de dejar una palabra colgando. El navegador que
no entienda `text-wrap` parte como siempre.

**El eje está en dos variables** de `.sec--voices`: `--voice-num` (columna del número) y
`--voice-gap`. Las comparten la rejilla de cada fila y todo lo que deba alinearse con ella, así que
la alineación no puede desincronizarse.

**El encabezado va apilado** (`.sec-head--stack`, en el bloque general de `.sec-head` por si otra
sección la necesita): la etiqueta «01 — Lo que escucho» contra el margen izquierdo, y la entradilla
debajo, ya sin columna que la encierre.

En tablet (≤920px) la columna del número se estrecha a 64px. En móvil (≤720px) el número pasa
delante de la frase, en la misma línea, y el resto cuelga debajo; las dos frases del marco siguen a
la derecha, que es lo que sostiene la idea.

Alto de la sección: de 1528 a 877px en escritorio, de 1013 a 631px en tablet, de 940 a 754px en
móvil.

**Lo que no funcionó, por si vuelve la tentación:** una rejilla de doce columnas con las citas
repartidas en zigzag (#74) — sin eje común quedaban flotando en el vacío; y esas mismas dos frases
del marco alineadas con las citas (#77) — sobre el mismo eje competían con ellas en vez de
enmarcarlas.

### La sección 02 — «Lo que importa»

Se realineó entera (PR #80). El titular vivía en la columna derecha del encabezado y las tres cosas
llevaban el número a la izquierda, igual que las citas de la 01: dos listas idénticas seguidas y
ningún eje que las separara.

Ahora la sección se lee de arriba abajo con un solo eje: **el titular y la entradilla mandan desde
la izquierda, las tres cosas caen a la derecha.** Es el espejo de la 01 —allí las citas van pegadas
a la izquierda y las frases del marco a la derecha—, así que las dos ya no se confunden.

**El titular va al margen izquierdo**, debajo de su etiqueta, con el `.sec-head--stack` que ya
existía para la 01. No hizo falta CSS nuevo. **La entradilla se quedó donde estaba**, a la izquierda
y a 60ch.

**Las tres filas están dadas la vuelta:** la rejilla pasó de `100px 1fr` a `1fr var(--key-num)`, con
la frase alineada a la derecha y el `[ 01 ]` detrás, contra el borde. El número sigue primero en el
HTML — lo coloca la rejilla, así que el orden de lectura no cambia. El eje va en dos variables de
`.sec--keys` (`--key-num`, `--key-gap`), como en la 01, para que no pueda desincronizarse.

**«Para eso me contratas.»** se quedó en su sitio, debajo de las filas y a la izquierda, pero subió
de `clamp(18px, 1.4vw, 22px)` a `clamp(22px, 2.4vw, 36px)`, en peso 700 y en `var(--fg)`. Se usa la
variable y no `#fff` a propósito: en tema claro sería texto blanco sobre fondo hueso.

En tablet (≤920px) la columna del número se estrecha a 64px, mismo salto que la 01. En móvil
(≤720px) queda una sola columna, con el número encima de la frase y los dos a la derecha.

Alto de la sección: de 1957 a 1827px en escritorio, de 1237 a 1219px en tablet, de 1434 a 1417px en
móvil.

**El botón «Hablemos quince minutos» aparece tres veces** (encabezado, fin de la prueba, fin del
precio) y las tres bajan a contacto. El de dentro de contacto abre el correo, porque un botón que
lleva a sí mismo no hace nada.

### La sección 03 — «Qué se construye»

Se realineó en agosto de 2026 (PR #82 y #84). Es el mismo movimiento que la 02, más una pieza
nueva.

**El titular baja al margen izquierdo.** Vivía en la columna derecha del `.sec-head` (rejilla
`1fr 2fr`) y se leía centrado en la página. Ahora usa el `.sec-head--stack` de la 01 y la 02: la
etiqueta «03 — Qué se construye» y debajo el titular, los dos contra el margen. Las cinco filas de
servicio no se tocaron.

**La palabra «construye» recorre estados tipográficos.** Son los mismos ocho de «Design» en la
página de web (`.design-shuffle`, `service.css`): peso, cursiva, mono, verde de acento y contorno,
1300ms con `steps(1, end)` y vuelta al estado base. La diferencia está en el disparo: allí arranca
al cargar con retardo fijo, porque es el encabezado de la página; aquí el titular entra con
`.reveal`, así que la animación cuelga de `.reveal.is-in` y empieza cuando la sección aparece. Si
colgara del `load`, se gastaría fuera de pantalla.

Para aislar la palabra hubo que partir el `<span>` en tres — «se» / «construye» / «.» — cada uno con
sus `data-en` y `data-es`. La regla vive en `home.css`, con el nombre genérico `.word-shuffle`, por
si otra sección la quiere.

**La frase de cierre va centrada, en cinco líneas cortadas a mano:**

    Junto, no es una web
    Es una plataforma. Y es tuya:
    El dominio, el código,
    los archivos, las claves.
    Nadie te la puede cerrar.

Cada línea es su propio `<span>` separado por `<br>`, porque es una frase para leer en bloque y el
corte no puede quedar en manos del ancho de la ventana. «Nadie» va subrayado con la clase
`.underline` de siempre; a este cuerpo la raya de 1px del sistema desaparece, así que en
`.built__close` se escala con el texto (`0.04em`).

**El tamaño es `clamp(24px, 5.2vw, 84px)`** — por debajo del titular, que es `104px` arriba. El
mínimo es 24 y no 28 porque a 28px «Es una plataforma. Y es tuya:» no cabe a 390px y deja «tuya:»
sola en una sexta línea, que es justo lo que los cortes a mano vienen a evitar. `text-wrap: balance`
no sirve de rescate: Chromium solo lo aplica a bloques de seis líneas o menos.

La última línea en inglés se acortó a «Nobody can shut it down.» Con «on you» detrás no cabía en
móvil ni a 24px.

Alto de la sección: de 1899 a 2257px en escritorio, de 1544 a 1697px en tablet, y prácticamente
igual en móvil (1755 a 1756px). Crece por el cuerpo de la frase de cierre.

**El texto de la declaración que cierra la 02** —el bloque grande justo antes de la 03— pasó a «No
soy el No.1 en lo que hago, / por eso me esfuerzo bastante.»

### La sección 04 — «La prueba»

**El titular baja al margen izquierdo.** Mismo movimiento que la 02 y la 03: vivía en la columna
derecha del `.sec-head` (rejilla `1fr 2fr`) y arrancaba a 539px del borde en escritorio. Ahora usa el
`.sec-head--stack` que ya existía, con la etiqueta «04 — La prueba» y el titular «Esto ya está hecho
/ y cobrando.» contra el margen. Sin CSS nuevo. El resto de la sección —el enlace, los dos párrafos,
el hueco del vídeo, la cita y el cierre— no se tocó.

**El foro no es lo que decía el texto.** Decía «foro donde los alumnos se hablan entre ellos» y no
funciona así: los alumnos dejan sus preguntas y ella las responde, y la respuesta la ve todo el
mundo. La frase quedó «foro donde los alumnos dejan sus preguntas y ella las responde delante de
todos». Como «ella» ya aparecía dos veces en la misma oración, el final pasó a «panel desde donde lo
maneja todo».

Alto de la sección: de 2105 a 2082px en escritorio (de 2135 a 2082 en inglés), de 1316 a 1325px en
tablet, de 1182 a 1191px en móvil (1182 a 1217 en inglés). El desbordamiento de 405px a 390px es el
de siempre, el del bloque del chat: sale igual antes y después.

**La frase del foro también se corrigió en la sección 03**, en «El lugar donde entran». Decía «el
foro donde se hablan entre ellos» y ahora dice «el foro donde ellos preguntan y solo respondes tú»
(«the forum where they ask and only you answer»). Con esto el foro se vende igual en todas partes:
no es un sitio donde los alumnos charlan, es donde preguntan y contesta quien lleva la academia.

**El vídeo de la prueba ya está puesto.** `Videos/showcase_palataforma_emilse_rios_v2.mp4` sustituye
al recuadro de «Video en camino». Va dentro del mismo `.proof__video` de 16:9 —el vídeo es 3840×2160,
la misma proporción, así que llena la caja sin recortar— con `autoplay muted loop playsinline` y
`controls`, que es lo que ya hacen los vídeos de `services-video.html` más la barra para que se pueda
parar o subir el sonido. La regla `.proof__video .mono` del texto de relleno se cambió por
`.proof__video video`, y la caja lleva `overflow: hidden`.

Quedan dos cosas del archivo, ninguna urgente: pesa 25 MB en 4K —conviene una copia a 1080p— y tiene
el `moov` al final, así que el navegador necesita el fichero entero antes de empezar. Las dos se
arreglan de una pasada con `ffmpeg -movflags +faststart`; aquí no hay ffmpeg con H.264 para hacerlo.
Tampoco hay imagen de `poster` por lo mismo.

### La sección 05 — «Cómo trabajo»

**La etiqueta pasó a «El paso a paso»** («Step by step»). Decía «05 — Cómo trabajo» y repetía palabra
por palabra el titular que tenía justo al lado.

**El titular baja al margen izquierdo.** El `.process__head` es una rejilla `1fr 2fr` con la etiqueta
en la primera columna y el titular en la segunda, así que «Cómo trabajo.» arrancaba a 539px del
borde. Se le añade `.process__head--stack`, que lo pone en una sola columna con el mismo hueco que el
`.sec-head--stack` de las secciones 01 a 04. Las cuatro tarjetas no se tocaron. En tablet y móvil ya
estaba apilado, así que ahí no cambia nada.

**Las tarjetas se levantan y se dan la vuelta al pasar el cursor:** suben 8px y el bloque pasa a
`var(--fg)` con la letra en `var(--bg)`. En tema oscuro sale blanco con letra negra; en tema claro se
da la vuelta solo, sin regla aparte, porque son las mismas dos variables. Es el gesto que ya usa el
selector de idioma (`.lang-switch button.is-active`).

**El color va en un `<span class="step__fill">`, no en el fondo de `.step`.** La primera tarjeta no
tiene relleno a la izquierda —va contra el margen, como todo lo demás— y el bloque de color sí tiene
que llevarlo por los cuatro lados. El `span` es absoluto y se sale 24px por la izquierda solo en la
primera (16px de 920px para abajo, que es el relleno de ahí). Nunca se sale del `--pad-x` del
contenedor, así que no añade desbordamiento.

**Lo que cambia de color dentro de la tarjeta:** el titular y el tiempo van a `var(--bg)` puro; el
número y el cuerpo, a `color-mix` sobre `var(--bg)` (55% y 78%) para conservar la jerarquía. El
tiempo se sale del verde de acento a propósito: sobre el bloque claro no se lee — es el problema de
contraste que ya está apuntado más abajo en esta lista.

Todo el hover va dentro de `@media (hover: hover) and (pointer: fine)`, para que en pantalla táctil
no se quede una tarjeta invertida después de tocarla. Con `prefers-reduced-motion` desaparece el
salto y solo queda el cambio de color.

Alto de la sección: de 669 a 705px en escritorio, e igual en tablet (886px en español, 864 en inglés)
y en móvil (1120 y 1098px), porque ahí el titular ya estaba apilado.

### La sección 06 — «Precio»

**El titular baja al margen izquierdo.** «Desde €2.500.» vivía en la columna derecha del `.sec-head`
y arrancaba a 539px del borde. Ahora usa el `.sec-head--stack` de siempre.

**«€2.500» lleva el brillo verde que recorre «vendes más»** en el encabezado. Los fotogramas son los
mismos (`promiseShimmer`, 6,5s), pero la regla se sacó a una clase suelta, `.shimmer`, para poder
ponérsela a cualquier palabra. **La única diferencia es el color del destello:** en
`.hero__promise-accent` es `#ffffff` fijo; en `.shimmer` es `var(--fg)`. En tema oscuro son el mismo
color, pero en tema claro el destello blanco sobre el verde desaparecía contra el hueso, y en negro
sí se ve — el barrido oscurece el verde en vez de aclararlo.

Para aislar la cifra hubo que partir el párrafo: «Desde» va en su `<span>` con sus `data-en` y
`data-es`, «€2.500» en el suyo con la clase, y el punto final queda como texto suelto. El precio no se
traduce, así que los dos atributos del número son iguales. Es lo mismo que se hizo con «construye» en
la 03: `app.js` escribe `textContent`, así que si los atributos se quedan en el padre se llevan por
delante a los hijos.

**Las dos listas y los tres añadidos suben de 15 a 17px.** Se veían pequeños al lado del titular. La
raya de acento de cada punto baja de 11 a 13px para seguir centrada en la primera línea. Aquí no hay
animación a propósito: es la parte seria de la página.

**«Los diez primeros clientes» pasó a «Mis primeros clientes»**, y el aviso sube de
`clamp(18px, 2vw, 26px)` a `clamp(20px, 2.6vw, 34px)`.

**El aviso también se levanta al pasar el cursor**, como las tarjetas de la 05, pero **se llena de
acento y no de blanco**: no es un paso del proceso, es la razón para no dejarlo para más tarde. La
letra pasa a `var(--accent-ink)`, que es negro en los dos temas, así que se lee igual en los dos.

**El botón de cierre va centrado y grande.** `.sec__cta--center` centra la fila y `.btn--lg` sube el
botón de 12px con relleno `18/28` a 14px con `24/40` (13px y `20/28` de 720px para abajo). Las dos
clases son modificadores nuevos, así que los otros dos botones «Hablemos quince minutos» no cambian.

Alto de la sección: de 1542 a 1665px en escritorio, de 1381 a 1506px en tablet (1454 en inglés), y de
1841 a 2032px en móvil (1817 a 2005 en inglés). Crece por el cuerpo de las listas y del aviso.

### La sección 07 — «Preguntas honestas»

**El titular baja al margen izquierdo**, con el `.sec-head--stack` de siempre. Es el último
`.sec-head` de rejilla `1fr 2fr` que quedaba antes del cierre: solo la 08 y la 09 siguen con el
titular en la columna derecha. Sin CSS nuevo, y las ocho preguntas no se tocaron.

Ahora el titular arranca en el mismo eje que la lista de preguntas, que ya iba de margen a margen.

En escritorio la sección **encoge** en español, de 1502 a 1449px: en la columna derecha el titular
cabía a 805px y «que más me hacen.» se partía en tres líneas; a ancho completo entra en dos. En
inglés crece de 1414 a 1449px, que es lo que ocupa la etiqueta al pasar encima. En tablet baja de
1261 a 1244px y en móvil de 1410 a 1393px (1423 a 1406 en inglés), donde el `.sec-head` ya era de una
columna y lo que cambia es solo el hueco entre la etiqueta y el titular.

### La sección 08 — «Hablemos»

**El titular y el botón van en la misma fila.** Era un `.sec-head` de rejilla `1fr 2fr` —el titular
en la columna derecha, la entradilla debajo— y el botón colgaba solo, pequeño, contra el margen
izquierdo. Ahora hay un `.contact-lead`: rejilla `1fr auto` centrada en vertical, con la etiqueta y
el titular a la izquierda y el bloque del botón a la derecha, a la altura del titular. El titular
mira hacia el botón, que es lo que tiene que pasar en la sección de contacto.

**El botón no llega al margen derecho.** Lleva `margin-right: clamp(0px, 7vw, 120px)`: a 1440 acaba a
unos 100px del borde. Pegado al margen se leía como un elemento de encuadre, no como el final de la
frase.

**El botón es el grande.** Se le pone el `.btn--lg` que se estrenó en la 06 (14px, relleno `24/40`), y
el «Gratis y sin compromiso…» de debajo sube de 13px a `clamp(15px, 1.2vw, 17px)` — el mismo cuerpo
que las listas de la 06. El bloque se corta a `26rem` para que en inglés «Let's talk for fifteen
minutes» entre en una línea sin acercarse al margen.

**La entradilla baja debajo de la fila**, a la izquierda y a 60ch. Estaba en la columna del titular y
allí empujaba el botón hacia el centro vertical del bloque entero.

**«¿Prefieres preguntar antes?…» va centrado y en `var(--fg)`.** Iba a la izquierda y en `--fg-2`, y
era la única alternativa al correo que ofrece la página: en gris pequeño no se veía. Se corta a 62ch
y con `margin: … auto 0`, así que la regla de arriba se centra con el texto.

**Cuidado con `align-items: flex-start` en columna flex:** deja al hijo a su ancho máximo, no al del
contenedor. El `.contact-lead__head` lo necesita para la etiqueta, y por eso el titular lleva
`align-self: stretch`. Sin eso, «for fifteen minutes.» se salía 59px de la pantalla a 390px.

En ≤920px la fila pasa a una columna: titular, botón, entradilla.

Alto de la sección: de 933 a 781px en escritorio (de 1050 a 898 en inglés, donde el titular ocupa
tres líneas), de 715 a 690px en tablet (741 a 738 en inglés) y de 785 a 772px en móvil (849 a 858 en
inglés, lo único que crece: ahí el botón grande no ahorra nada porque ya iba apilado). Encoge porque
el botón deja de ocupar una fila propia debajo del titular.

La sección 04 no cambia de alto al meter el vídeo: 2082px en escritorio, 1325 en tablet y 1191 en
móvil, los mismos que con el recuadro vacío — la caja de 16:9 ya estaba reservada.

El desbordamiento a 390px sigue siendo el de siempre y no lo toca esta sección: 405px en español
(el bloque del chat) y 449px en inglés, que es el `.foot-display` del pie — «something.» no cabe a
ese cuerpo. Los dos salen igual antes y después del cambio.

### Idioma

El **español es el texto que manda**. El inglés es traducción y está pendiente de repaso.

El mecanismo es el que ya existía: atributos `data-en` / `data-es` en cada elemento, y `app.js`
sustituye el texto al pulsar el selector. La elección se guarda para todo el sitio. En el home hay
tres líneas en el `<head>` que ponen español por defecto cuando el visitante no ha elegido nunca
idioma — con el efecto de que las demás páginas también le cargarán en español.

---

## El agente

- Chat incrustado en el home + widget flotante en todas las páginas. Comparten conversación.
- Backend: `netlify/functions/chat.js`, expuesto en `/api/chat`.
- Herramientas: `netlify/functions/agent-tools.js` — agenda llamadas en Google Calendar y manda la
  transcripción por correo con Resend.
- Instrucciones: `netlify/functions/system-prompt.js`.
- Cada turno se guarda en Supabase (`conversation_messages`, esquema en `supabase-schema.sql`) y se
  lee desde `admin.html`.

---

## Despliegue

Netlify. Cada push a `main` dispara `.github/workflows/deploy.yml`, que publica el sitio entero.
Configuración de rutas y funciones en `netlify.toml`.

Variables de entorno: la lista está en `.env.example`. En local se copian a `.env`; en producción se
ponen en Netlify → Site configuration → Environment variables.

Para desarrollo local: `npm run dev` levanta `server.js` en el puerto 3002 (necesita
`ANTHROPIC_API_KEY` para que el chat responda). Para ver solo maquetación, sirve la carpeta con
cualquier servidor estático.

---

## Ramas y PR abiertos

`main` tiene el home nuevo entero, el shader del encabezado (#72), la sección 01 rehecha (#74 a #78),
la 02 realineada (#80), la 03 realineada (#82 y #84) y la 04 realineada (#86), la 05 con su hover
(#87) y la 06 entera (#88), más la 07 (#89).

La 08 —titular y botón en la misma fila, el vídeo de la prueba y la frase del foro de la 03— va en la
rama `claude/progreso-layout-content-t19nt6`.

**Dos PR abiertos a la vez chocan en este archivo.** El #88 y el #89 salieron los dos de `main` y
los dos escriben justo antes de «Idioma», así que el segundo en fusionarse dio conflicto aquí — en
`index.html` no, que eran secciones distintas. Se arregla trayendo `main` a la rama y dejando los dos
bloques en orden; no hay que rehacer nada.

Cada rama sale de `main` y se fusiona antes de empezar la siguiente. Cuando se encadenan, pasa lo
del #74: un PR se fusiona mientras el siguiente ya salió de la base vieja, y hay que rehacer la rama
sobre `main` para deshacer el conflicto.

**El #83 quedó muerto.** Era la corrección de la 03 —la frase de cierre centrada— y se abrió *con
base en la rama del #82* en vez de en `main`, para poder revisarlo sin esperar. Al fusionarlo,
GitHub lo metió dentro de esa rama y no en `main`: solo reapunta a `main` cuando la rama base se
borra al fusionar, y ahí no se borró. El cambio estaba commiteado y fusionado, pero en un sitio que
no se despliega. Se rehízo desde `main` en el #84. **No se apilan PR.**

---

## Pendiente

### Contenido

- [ ] **Repasar la traducción al inglés del home.** El español manda; el inglés está a la espera de
      corrección. El titular en inglés ocupa dos líneas donde el español ocupa una — buen momento
      para acortarlo.
- [x] **Vídeo de la prueba.** Puesto: `Videos/showcase_palataforma_emilse_rios_v2.mp4` en la
      sección 04.
- [ ] **Comprimir el vídeo de la prueba.** Está a 4K y pesa 25 MB, y lleva el `moov` al final, así
      que el navegador se lo tiene que bajar entero antes de arrancar. Una copia a 1080p con
      `ffmpeg -movflags +faststart`, y de paso un `poster` con el primer fotograma.
- [ ] **Cita de Emil Serios.** Hueco preparado con el formato de cita destacada y el texto «Cita
      pendiente». Rellenar cuando la tengamos.

### El agente sigue vendiendo el estudio viejo

- [ ] **Su saludo** dice «Ayudo a equipos a definir proyectos de vídeo, web e IA»
      (`ai-chat.js`, y el estático en `index.html`).
- [ ] **Sus instrucciones** (`netlify/functions/system-prompt.js`) describen los tres servicios y sus
      precios antiguos. Tal como está, le ofrecerá vídeo corporativo a alguien que viene a comprar
      una plataforma. Es lo más urgente de esta lista.
- [ ] **Fallo del widget flotante:** al cambiar a inglés, su saludo se queda en español.
      `ai-chat-widget.js` solo lo reescribe si el chat está vacío, y el saludo mismo cuenta como
      mensaje. Arreglo de dos líneas.

### Newsletter

- [ ] **Elegir herramienta de correos.** Mientras tanto, el formulario guarda una copia en el
      navegador (`localStorage`, clave `arc_newsletter_v1`) y envía a **Netlify Forms** con el
      nombre `newsletter` — se recuperan en el panel de Netlify, en Forms. Si esa función no está
      activada en la cuenta, el envío falla en silencio y el visitante ve igualmente «Listo, te
      escribo pronto». Nunca da error. Cuando haya herramienta, se cambia el destino del `fetch`.

### Diseño

- [ ] **Contraste del verde de acento en tema claro.** Sobre el fondo hueso queda casi ilegible en
      texto pequeño. Ya pasa en las páginas de servicio (los tiempos del proceso, `~48h`). En el
      home nuevo se evitó: las etiquetas pequeñas van en gris. Conviene arreglarlo en el resto.
- [ ] **El home se desborda a lo ancho en móvil.** A 390px la página mide 405px de ancho real, así
      que se puede arrastrar de lado. Sale del bloque del chat: `.ai__chat` y `.ai__side` (y dentro,
      `.ai__log`, `.ai__form` y el `.btn` del lateral) se salen 15px. Es anterior al home nuevo y no
      lo causa ninguna sección. Se comprueba a 390px con
      `document.documentElement.scrollWidth > clientWidth`.
- [ ] **Y en inglés se desborda más: 449px.** Es el `.foot-display` del pie, la frase grande que
      acaba en «something.»: a ese cuerpo no cabe a 390px y se sale 59px. En español no pasa. Se
      arregla bajando el `clamp` del `.foot-display` o partiendo la frase, como en la 03.

### Decisiones abiertas

- [ ] **Qué hacer con las páginas de servicios, equipo y manifiesto.** Están vivas pero sin enlazar.
      Hay que decidir si se archivan, se redirigen al home o se reescriben para el posicionamiento
      nuevo.

---

## Cómo se trabaja aquí

- **Cada cambio va en su rama y su PR nuevo, siempre contra `main`.** Sin excepciones: es la única
  forma de ver el cambio antes de publicarlo. Nada de acumular varios cambios en un mismo PR.
  Una corrección es un PR nuevo, no un commit encima del anterior — también si el anterior todavía
  está abierto.
- **La base es `main`, nunca otra rama.** Si la corrección toca las mismas líneas que un PR abierto,
  se espera a que ese se fusione y se sale de `main`. Apilar parece que ahorra tiempo y no lo
  ahorra: lo del #83 es lo que pasa.
- **Antes de empezar una rama, `git fetch origin main`.** Si el PR anterior ya se fusionó, la rama
  tiene que salir de ahí; si no, el conflicto es seguro, porque los cambios seguidos tocan las
  mismas líneas.
- Los cambios de maquetación se comprueban en navegador antes de abrir el PR: 1440, 834 y 390px,
  en los dos idiomas y en los dos temas. Las alturas medidas van en el cuerpo del PR.
- Se conserva la familia visual: no se cambian tipografías, colores ni tamaños. Si un bloque nuevo
  se parece a uno que ya existe, se hace igual que ese.
- El texto se escribe en español primero. Frases cortas. Nada de vocabulario de agencia.
- Los nombres propios no se traducen. Los precios van en euros con el mismo formato en los dos
  idiomas.
- Cualquier texto visible lleva sus `data-en` y `data-es`. Si algo se queda en un idioma al cambiar
  al otro, es un fallo.
