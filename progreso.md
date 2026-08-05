# Progreso — ARC Media House

Estado del sitio y de lo que queda pendiente. Se actualiza cuando algo cambia de sitio.

Última actualización: 5 de agosto de 2026.

---

## Dónde estamos

El estudio pasó de vender tres cosas (web, agentes IA, vídeo) a vender una: **plataformas y webs
para marcas personales que venden cursos y membresías**.

El home ya refleja ese cambio. Las páginas de servicios, equipo y manifiesto siguen en el
repositorio y funcionando, pero **ya no se enlazan desde el menú ni desde el pie**. No están
borradas: se puede entrar por URL directa y se pueden volver a enlazar cuando haga falta.

**Y así se quedan.** En agosto se decidió no tocarlas: ni archivarlas, ni redirigirlas, ni
reescribirlas. Viven en el repositorio, ocultas, por si algún día vuelven a salir a flote. Dicen
cosas que ya no son la oferta —está detallado abajo— y se acepta.

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
7. Precio — construir, después, las cuentas, qué incluye y qué no
8. Preguntas honestas — doce, desplegables
9. Hablemos — contacto
10. El widget del agente
11. Newsletter

Menú: logo, Precio, Preguntas, Contacto. Pie: correo, ciudad y aviso de derechos.

**El encabezado va centrado:** el titular grande arriba, y debajo el párrafo, «Desde €2.500.» y el
botón, los cuatro sobre el mismo eje. El párrafo se corta a 46rem para que no se estire de margen a
margen. Los tres bloques numerados que había a la derecha se quitaron por decorativos. En móvil
sigue centrado, solo se aprieta el espacio entre bloques.

**El párrafo se reescribió** (agosto de 2026). Decía «Te construyo la página que vende… A tu nombre y
funcionando.» y ahora abre diciendo por qué va al grano: «Porque no te quiero hacer perder el tiempo,
te lo digo así: construyo la página que vende, el aula donde enseñas, el cobro y el panel donde lo
manejas todo. Todo a tu nombre, funcionando y viéndose muy pro.» La `<meta name="description">` del
`<head>`, que repetía la frase vieja, se puso al día con la nueva.

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

**La entradilla se reescribió** (agosto de 2026). Decía «Antes de hablar de lo que hago, esto es lo
que escucho.» y ahora dice «Ya te dije lo que hago, ahora te cuento / lo que escucho acerca de los
problemas que tiene mucha gente.» Va **en dos líneas cortadas a mano**, cada una en su `<span>` con
sus `data-en` y `data-es` y un `<br>` en medio — si los atributos se quedaran en el `<p>`, `app.js`
escribiría `textContent` y se llevaría por delante el corte. Sigue contra el margen derecho, con la
regla de siempre. Sin CSS nuevo.

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

**Los tres párrafos de la entradilla se reescribieron** (agosto de 2026). La lista de preguntas
inútiles se apretó en una sola frase —«Preguntan si uso plantillas, si el plugin es este o el otro,
colores. Preguntas válidas, sí, pero que realmente no llevan a ningún lado.»— y el segundo párrafo
da la vuelta al argumento: la plantilla no es cuestión de gusto, es una decisión que ya tomó un
montón de gente, y por eso es uno de tus problemas. El tercero pasa a «Todo se resume a tres cosas
que deciden si vendes o no:», que es la frase que entrega las tres filas. Solo texto: el alto de la
sección no se mueve en ninguno de los tres anchos.

**El botón «Hablemos quince minutos» aparece cuatro veces.** Las tres de arriba —encabezado, fin de
la prueba, fin del precio— bajan a contacto. La cuarta, la de dentro de contacto, no puede llevar a
sí misma: desde agosto de 2026 se lo pasa al agente, que pide el correo y la franja y agenda la
llamada. Está contado en la sección 08.

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

**El archivo se cambió por uno más ligero** (5 de agosto de 2026). Ahora es
`Videos/showcase_compressed.mp4`, que subió Adrián: **1080p y 11,6 MB** en vez de 4K y 24,4 MB. Misma
duración —74s— y la misma proporción 16:9, así que la caja no cambia. En el HTML solo cambia el
`src`.

**Y se le movió el `moov` al principio.** Venía como el anterior, `ftyp → free → mdat → moov`, o sea
con el índice al final: el navegador tenía que bajarse los 11,5 MB del `mdat` antes de saber siquiera
la duración del vídeo. Ahora es `ftyp → moov → free → mdat` y el índice empieza en el byte 32.

Eso se hace normalmente con `ffmpeg -movflags +faststart`, y **aquí sigue sin haber ffmpeg**. Pero no
hace falta: mover el `moov` es reordenar el contenedor, no recodificar. El script está en el
historial del PR y hace dos cosas — mueve la caja `moov` delante y **corrige las tres tablas `stco`**,
que guardan la posición absoluta en el fichero de cada chunk y por tanto se desplazan los 45.111
bytes que ocupa el `moov`.

Como aquí el Chromium de Playwright no trae códecs H.264, **el vídeo no se puede reproducir en este
entorno** y la comprobación fue estructural, no visual: mismo tamaño de fichero, `mdat` byte a byte
idéntico, y las 290 entradas de offset desplazadas exactamente el tamaño del `moov`, dentro del
`mdat` nuevo y apuntando a los mismos bytes que en el original. Conviene mirarlo una vez en
producción de todas formas.

Sigue sin haber imagen de `poster`, por lo mismo: extraer un fotograma pide decodificar H.264.

El 4K viejo, `showcase_palataforma_emilse_rios_v2.mp4`, **se queda en el repositorio** sin que nadie
lo enlace. Son 24 MB de despliegue que ya no ve ningún visitante; borrarlo es de una línea el día que
se quiera.

**Los dos párrafos se reescribieron y llegó la cita** (agosto de 2026).

El primero ya no abre con «Academia de contrabajo». Abre con lo que la hace única: «La primera
membresía de contrabajo online del mundo (o por lo menos no hemos encontrado otra).» Detrás va la
lista de piezas, ahora con Emilse por su nombre —«foro donde los alumnos preguntan y Emilse responde
y todos lo ven»— y con lo que el panel hace de verdad: programa vídeos, en inglés y español, ve los
miembros activos y responde las preguntas. El segundo cambia el punto de partida: no era «material
grabado y parado», era «un plan, el material, la experiencia, y no sabía cómo darle forma».

**La cita de Emilse Ríos ya está**, y con ella se corrige el nombre: ponía «Emil Serios». El dominio
sigue igual, `emilseriosacademy.com`, que es la URL real.

**«Entra y míralo. No es una maqueta.» se quitó.** El `.sec__close` de la 04 desaparece; la clase
sigue viva en la 03, así que no queda CSS muerto.

**La cita y el botón van en la misma fila**, en un `.proof__outro`: rejilla flex de dos, la cita
contra el margen izquierdo y el botón contra el derecho, alineados por abajo (`align-items:
flex-end`), así que el botón queda a la altura de la firma. Es el mismo movimiento que la 08, donde
el titular y el botón comparten fila.

Dos detalles del bloque: la cita **se ensancha a 62ch** solo aquí (`.pull-quote` va a 46ch en
general, y a ese ancho esta cita caía en ocho líneas con todo el lado derecho vacío; a 62ch entra en
cinco), y el botón lleva `margin-left: auto` **además** del `space-between`, porque en tablet la fila
no cabe y se parte — sin eso el botón caería contra el margen izquierdo. En ≤720px el contenedor pasa
a `display: block` y el botón vuelve a colgar debajo, como estaba.

Alto de la sección: de 2082 a 2088px en escritorio (2161 en inglés), de 1325 a 1380px en tablet en
los dos idiomas, y de 1191 a 1389px en móvil (1415 en inglés). Crece por el primer párrafo y por la
cita, que antes eran dos palabras.

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

**Las cuatro tarjetas se reescribieron enteras** (agosto de 2026). El paso a paso estaba contado
desde el proceso; ahora está contado desde lo que el cliente hace en cada paso:

- **01 Escuchar** — «Nos llamamos, me explicas lo que vendes como a un niño pequeño, a quién y por
  qué te compran a ti.» Fuera «un mensaje desordenado»: la llamada es la que se vende arriba.
- **02 Encuadrar** — ya no es «una página con lo que entendí», es **una primera muestra**: qué se
  construye, cómo se ve y cómo funciona. Y el final cambia de tono: no es «se corrige ahí y no en la
  última semana», es «a partir de ahí trabajamos y vamos creando juntos».
- **03 Hacer** — «Yo hago todo, de principio a fin, no delego.» En primera persona, que es lo que
  decía la metáfora de «las mismas manos» dando un rodeo.
- **04 Entregar** — la misma lista de siempre (dominio, códigos, archivos, claves) y **la palabra
  «fee» dicha en claro**: si lo mantengo yo hay un fee, si además lo manejo es otro fee. Sigue
  distinguiendo mantenimiento de gestión, que es lo que pide la sección 06, pero sin nombrarlos.

Los cuatro tiempos (`48h`, `3 días`, `3 semanas`, `siempre`) no se tocaron.

Alto de la sección: de 705 a 750px en escritorio, de 886 a 931px en tablet (909 en inglés) y de 1120
a 1255px en móvil (1188 en inglés). Crece por la tarjeta 04, que es la más larga.

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

#### El precio se reordenó para decir lo mismo que el agente

La sección tenía cuatro precios sueltos en una fila de «extras» y el resto lo daba por sabido. Ahora
va en **tres grupos**, que es como lo cuenta el prompt del agente:

**Construir — pago único.** Los tres precios de entrada, uno por columna: la plataforma completa
desde €2.500, la página de venta sola desde €1.500 y el agente desde €1.200. Los €1.500 y el
«desde €1.200» ya estaban en el sitio, pero enterrados en una pregunta de la 07 y en el bloque del
añadido; aquí se leen a la vez, que es como se compara. Debajo, «Mitad al empezar, mitad al
entregar.»

**Después — mensual y opcional.** El mantenimiento se queda en €150 pero cambia de contenido: es
«que no se caiga» y ya no promete dos horas de cambios al mes — ese trabajo es el nivel nuevo. La
**gestión, desde €500/mes**, es todo lo del mantenimiento más subir y programar hasta cuatro
contenidos al mes, dar de alta y de baja a los miembros y un informe mensual. El mensual del agente
sube de €100 a €150 y ahora dice qué paga: el uso y el trabajo de corregir lo que contestó mal.
Debajo, la línea de sin permanencia, la revisión de €200 al volver y la revisión de volumen antes de
que suba la factura.

**Las cuentas son tuyas.** Bloque nuevo, y el que arregla la contradicción más fea que tenía la
página: el mantenimiento decía «hosting, base de datos, dominio y respaldos **a mi cargo**» mientras
la pregunta «¿De quién es todo esto cuando terminas?» decía que las cuentas se abren a nombre del
cliente. Ahora se dice una sola cosa, y con la razón: si el hosting lo pagara Adrián, el día que
dejara de pagarlo se caería todo. En «Qué no incluye» entra un tercer punto con lo mismo en corto.

**Maquetación:** no hay componentes nuevos. Cada grupo es una `.price-extras` de tres columnas —la
misma rejilla que ya tenía la fila de extras— con un `.price-group__label` que comparte regla con
`.price-col__label`. Lo único que se añade es `.price-group` (margen entre grupos, para que dos
rejillas seguidas no peguen sus reglas), `.price-group__note` y `.price-group__body`, y un
`border-top` en `.price-extras`, que antes solo tenía el de abajo porque iba pegada a las columnas.
En ≤820px todo cae a una columna, que es lo que ya hacía.

Alto de la sección: de 1665 a 2515px en escritorio (1665 a 2567 en inglés), de 1506 a 2306px en
tablet (1454 a 2328), y de 2032 a 3447px en móvil (2005 a 3419). Es la sección que más crece del
sitio y es a propósito: pasa de cuatro cifras a la tabla completa de qué se paga una vez, qué se paga
al mes y qué no se paga nunca.

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

#### Cuatro preguntas más: de ocho a doce

Las cuatro que trae el prompt del agente, todas sobre lo mismo —quién paga qué y hasta cuándo—, así
que van juntas al final, detrás de «¿De quién es todo esto cuando terminas?», que es la que abre el
tema:

- «¿El hosting y todo eso va incluido?»
- «¿Puedo no contratar mantenimiento?» — con el precio de la ayuda puntual: media hora son €100.
- «¿Me tengo que amarrar por un año?»
- «¿Por qué el agente cobra todos los meses?» — la única que se permite señalarse a sí misma: el
  agente de esta página se ha corregido varias veces con conversaciones de verdad.

Sin marcado nuevo: cada una es un `<details class="faq-item">` igual que las ocho anteriores.

Doce preguntas es el techo. Si entra una más, conviene mirar cuál de las viejas sobra antes que
alargar la lista.

Alto de la sección: de 1449 a 1823px en escritorio en los dos idiomas, de 1244 a 1607px en tablet, y
de 1393 a 1724px en móvil (1406 a 1737 en inglés).

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

#### El botón ya no abre el correo: se lo pasa al agente

Agosto de 2026. **`mailto:` pierde visitantes en silencio.** Depende de que haya un cliente de correo
configurado: en móvil suele ir, pero en escritorio con webmail en el navegador —que es la mayoría— o
no pasa nada, o se abre un programa que esa persona no usa. No hay error y no hay aviso, así que el
lead se pierde sin que se entere ninguno de los dos. Y encima era el punto de más fricción de la
página: la web promete que te construye el sistema que agenda y cobra solo, y el botón final te
mandaba a redactar un correo en blanco.

El agente ya sabe hacer esto. `agent-tools.js` agenda los quince minutos en el calendario, manda la
invitación al visitante y le pasa la transcripción a Adrián, con dos backstops en `chat.js` para que
el lead no se pierda aunque el modelo falle. Estaba construido y el botón principal lo ignoraba.

**Ahora el botón baja al chat y escribe la intención por él.** El enlace es `href="#ai"` y lleva
`data-agent-intent` con sus `data-intent-es` y `data-intent-en` («Quiero agendar los quince minutos.»
/ «I'd like to book the fifteen minutes.»). El manejador vive al final de `ai-chat.js`: baja a la
sección del chat, esconde las sugerencias y llama al mismo `ask()` que ya usaban esos botones. **Sin
JS el enlace sigue funcionando** y baja al chat igual — por eso es un `<a href="#ai">` y no un
`<button>`, que además habría necesitado CSS nuevo para parecerse a `.btn`.

**El segundo clic no repite la línea.** Dos banderas, `intentSent` y `intentPending`: si ya lo pidió,
el botón solo le devuelve el foco al campo. `ask()` ahora devuelve la promesa de `ARCChat.send()`
para poder saber cuándo termina.

**Los otros tres botones no se tocan.** Siguen bajando a contacto, que es lo correcto: el que se
lleva al agente es el del final del recorrido, cuando ya está todo dicho.

**El correo baja a respaldo**, en un `.contact-sales__fallback` debajo de la letra fina: «Te la
agenda aquí mismo. ¿Prefieres el correo? hello@arcmediahouse.com». Pequeño y en `--fg-2`, con el
enlace en `--fg` y subrayado. El texto traducible va en su `<span>` y el enlace fuera, porque
`app.js` escribe `textContent` y se llevaría por delante la etiqueta `<a>`.

**«¿Prefieres preguntar antes?…» se reescribió**, porque el cambio lo dejaba contradiciéndose: ese
párrafo vendía al agente como *la alternativa* al botón, y ahora el botón **es** el agente. Pasa a
«¿Quieres preguntar antes de agendar? El mismo agente te responde lo que sea — precios, plazos, qué
incluye y qué no.» Se queda la razón de siempre —está hecho con lo mismo que te vendo, así que de
paso lo ves funcionando—, que es lo que sostiene el bloque.

Alto de la sección: de 781 a 810px en escritorio (898 a 928 en inglés), de 690 a 767px en tablet (738
a 815) y de 772 a 849px en móvil (858 a 935). En escritorio los +29 son solo el párrafo del agente,
más largo: la columna del botón es más corta que el titular, así que la línea del correo no empuja
nada. En tablet y móvil todo va apilado y suman las dos cosas.

El desbordamiento a 390px **no lo toca este cambio**: sigue en 405px en español y 449px en inglés,
los de siempre.

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

La 08 —titular y botón en la misma fila, el vídeo de la prueba y la frase del foro de la 03— entró
con el #90. El #91 dejó anotado lo que había que alinear entre la web y el prompt, el #92 metió el
prompt nuevo del agente con su saludo, el #93 bajó la llamada a quince minutos y el #94 reordenó el
precio en tres grupos con las cuatro preguntas nuevas.

El #96, ya fusionado, quitó las cuatro contradicciones entre la página y el agente: la pieza 05 de la
03 y los tres textos del bloque del chat.

Después vino la pasada de copy de agosto: el párrafo del encabezado, la entradilla de la 01, los tres
párrafos de la 02, la 04 entera —texto nuevo, la cita de Emilse por fin, el nombre corregido, fuera
el «Entra y míralo» y el botón subido a la altura de la cita— y las cuatro tarjetas de la 05, más el
caso del prompt puesto al día detrás.

Y en agosto, el **#100**, que junta cuatro cosas: el botón de la 08 deja de abrir el correo y se lo
pasa al agente —con la excepción del prompt para quien llega pidiendo la llamada y el párrafo del
agente reescrito, que si no se quedaba contradiciendo al botón—, la frase del inglés de la 04, el
vídeo ligero con el `moov` movido al principio, y el desbordamiento lateral del móvil.

**No queda ninguno abierto.** El sitio y el agente dicen ya lo mismo sobre el precio, sobre el caso
de Emilse y sobre lo que el agente es. De copy queda un bloque, el 3 —el inglés—, y lo lleva Adrián
aparte.

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

### Copy

De los cinco bloques que había, **no queda ninguno vivo**. El 1 se hizo en el #96, el 2 se cerró al
llegar la cita de Emilse, el 3 se cerró el 5 de agosto de 2026 —el repaso hecho y sus dos puntos de
maquetación cerrados por decisión— y el 4 y el 5 se habían cerrado antes, también por decisión. **De
copy no queda nada pendiente.**

**El repaso del inglés ya está hecho** (5 de agosto de 2026) y salió limpio: una sola frase, en la
04. Los otros dos puntos del bloque no eran traducción sino maquetación —dos textos ingleses que no
caben— y se cerraron por decisión, mirados en móvil: se quedan como están.

**1. Lo que se contradice con el agente — hecho, en el #96**

**La página también calla la tecnología.** Era la decisión que quedaba abierta en los dos puntos de
en medio, y se resolvió del lado del prompt: es la regla más nueva, y la única de las dos que se
sostiene sin tener que actualizar la web cada vez que cambie algo por dentro.

- [x] **La pieza 05 de la sección 03.** Decía «Habla como tú, no como un robot» a dos scrolls del
      saludo del agente, que dice «no hablo como Adrián pero estoy aprendiendo». Bajó la pieza, no
      subió el saludo: ahora dice «No habla como tú todavía, pero contesta a las tres de la mañana».
      La honestidad se queda y la ventaja también, más concreta que el «a la hora que sea» que
      estaba antes al principio de la frase.
- [x] **El bloque «Tras el telón» pasa a «Qué no es».** Fuera la metáfora de escenario, fuera
      «entrenado con la voz de ARC» —no está entrenado, está instruido— y fuera la tecnología. Dice
      «No es Adrián y no se inventa nada: contesta con lo que está escrito. Lo que le cuentes le
      llega a él tal cual». Lo segundo es verdad y no estaba dicho en ningún sitio: las
      conversaciones se guardan y se leen en `admin.html`.
- [x] **La cabecera del chat ya no enseña el modelo.** «Modelo: claude-haiku-4-5» pasa a «Español o
      inglés». No caduca al cambiar de modelo, no nombra tecnología, y recoge lo único que se perdía
      del bloque de al lado —el multiidioma— que además es información útil justo antes de escribir.
- [x] **«Estimar precios y plazos» pasa a «Decir precios y plazos».** Ya no estima: los precios y los
      plazos son públicos desde que se reordenó la sección 06.

La latencia «<2s» ya solo se dice en la línea de Nietzsche de la cabecera, que se queda (bloque 5).
Comprobado a 1440, 834 y 390px en los dos idiomas: el ancho real no se mueve —405px en
español y 449px en inglés a 390px, los mismos de antes— así que el desbordamiento que hay sigue
siendo el del pie y el del bloque del chat, y no lo toca este cambio.

**2. Lo que falta por llegar — hecho**

- [x] **La cita de Emilse Ríos**, sección 04. Llegó y está puesta, en el formato de cita destacada
      que ya estaba montado. Fuera el «Cita pendiente».
- [x] **El nombre mal escrito debajo de esa cita.** Ponía «Emil Serios» y ahora pone **Emilse Ríos**.
      El dominio no se tocó: `emilseriosacademy.com` es la URL real y funciona.

**3. El inglés**

- [x] **Repasar la traducción del home entero — hecho.** Lo repasó Adrián el 5 de agosto de 2026, en
      los dos anchos, sobre todo lo que estaba esperando: los tres grupos del precio, el bloque de
      las cuentas, las cuatro preguntas nuevas, el saludo del agente y la pasada de copy de agosto
      —encabezado, 01, 02, 04 y las cuatro tarjetas de la 05—. **Salió una sola cosa**, en el segundo
      párrafo de la 04: decía «and no idea how to give it shape», que es la construcción española
      traducida de frente. Pasa a «and no idea how to shape it». No mueve el alto de la sección en
      ningún ancho.
- [x] **El pie que no cabe en inglés — cerrado: se queda.** «Make— something.» se sale 59px de la
      pantalla a 390px, y desde el 5 de agosto de 2026 **es la única causa** del desbordamiento a lo
      ancho que le queda al sitio: el otro, el del bloque del chat, se arregló. Adrián lo miró en
      móvil y decide que se queda. **Lo que eso acepta, a sabiendas:** en inglés la página mide 449px
      de ancho real a 390px y se puede arrastrar de lado 59px. En español no pasa. Si algún día se
      toca el pie por otra razón, ahí está la frase.
- [x] **El titular de la 08 en inglés — cerrado: se queda.** «Let's talk for fifteen minutes.» ocupa
      tres líneas donde el español ocupa dos. Se ve, pero no molesta. Agosto de 2026.

**4. Las páginas del posicionamiento viejo — cerrado: se quedan como están**

Decidido en agosto. `services-web.html`, `services-ai.html`, `services-video.html`, `people.html` y
`manifesto.html` **se quedan ocultas y no se tocan**. No se archivan, no se redirigen y no se
reescriben: siguen en el repositorio, sin enlazar desde el menú ni desde el pie, y ahí se quedan
por si algún día vuelven a hacer falta. Tampoco se las menciona en ningún sitio.

Lo que eso acepta, a sabiendas: sus `<title>` siguen diciendo «Web Design», «AI Agents» y «Video &
Motion»; dentro hay doce formatos con precios que el agente tiene prohibido decir, hasta €10.000
por un brand film; y `people.html` presenta a Robs y motion graphics. Se entra por URL directa y
Google las tiene indexadas. Es un coste conocido y asumido, no un olvido — **no volver a abrirlo
como pendiente.**

**5. Menudencias — cerrado: se quedan como están**

Decidido en agosto, con el resto.

- **«Ocupado leyendo a Nietzsche · responde en <2s»** se queda. El chiste gusta y vale más que la
  duplicación con el saludo. Es además el único sitio donde queda dicho el «<2s», desde que el
  bloque del lateral dejó de nombrar la tecnología en el #96.
- **«Hazme uno»** se queda sin precio en el botón.
- **«ARC / 2019—2026» y «v 3.0»** del pie se quedan sin comprobar. Si alguna vez se toca el pie por
  otra razón —la frase que no cabe en inglés, del bloque 3— es el momento de mirarlo de paso.

### Otros pendientes de contenido

- [x] **Comprimir el vídeo de la prueba — hecho.** 5 de agosto de 2026. Adrián subió
      `Videos/showcase_compressed.mp4` a 1080p y 11,6 MB, y en el mismo paso se le movió el `moov` al
      principio, que era la otra mitad del problema. Está contado en la sección 04.
- [ ] **El `poster` del vídeo.** Sigue sin haberlo, y sigue por la misma razón: sacar un fotograma
      pide decodificar H.264, y aquí no hay ni ffmpeg ni un Chromium con ese códec. Es de lo poco que
      no se puede hacer desde este entorno.
- [x] **Vídeo de la prueba.** Puesto en la sección 04.

### El agente

**Hecho, en el #92.** El prompt está reescrito entero para la oferta única y metido en
`netlify/functions/system-prompt.js`, en español: el bilingüe duplicado se comía la mitad del
archivo para decir dos veces lo mismo, y la detección de idioma no depende de él.

Trae la oferta y sus precios reales, las cinco piezas, qué incluye y qué no, el paso a paso, el caso
de Emilse Ríos y once preguntas con sus respuestas. Y reglas duras que antes no hacían falta: ARC no
paga el hosting, no se promete migración automática de suscripciones, no se inventan funciones que no
estén en la lista, no se nombra la tecnología de dentro, no se dan fechas de lanzamiento, y vídeo no
se ofrece nunca aunque Adrián sepa hacerlo.

**El saludo también.** Estaba escrito a mano en tres sitios y decía «Ayudo a equipos a definir
proyectos de vídeo, web e IA». Ahora los tres dicen «¡Hola! Soy el agente de ARC, no hablo como
Adrián pero estoy aprendiendo. ¿Vamos a trabajar juntos? Cuéntame de ti y de cómo vamos a mejorar tu
plataforma.» El prompt le dice al agente qué se sigue de él: que ya ha pedido que le cuenten, y que
«tu plataforma» es la que el visitante va a tener, no la que ya tiene.

#### El saludo repetido y el voseo — arreglados en agosto de 2026

Dos fallos vistos en conversaciones reales.

**El agente repetía el saludo entero en cuanto le escribías.** La causa está en el transporte, no en
el modelo: **el saludo se pinta solo en el DOM y nunca entra en el historial.** `ai-chat.js` y
`ai-chat-widget.js` lo escriben a mano en el log, pero `ARCChat` no lo guarda, así que
`ai-chat-store.js` manda `read()` y la primera petición sale con un único mensaje, el del visitante.
Al modelo la conversación le llega **empezando en frío**, y el prompt le ponía el saludo **citado
literal** justo al final, en «Cómo abrir». Le dábamos el texto y el hueco donde encajarlo.

No se puede arreglar sembrando el saludo como turno de `assistant` en la petición: **la Messages API
exige que el primer mensaje sea `user`.** Así que va por dos lados:

- **En el prompt.** «Cómo abrir» ya no cita el saludo como texto a tener en cuenta; explica que el
  historial engaña —que siempre hay un turno suyo antes aunque no lo vea—, lista lo que está
  prohibido en la primera respuesta, y trae tres ejemplos. El saludo literal aparece **solo dentro
  del ejemplo marcado como «Mal»**, que es lo contrario del cebo que era antes.
- **En `chat.js`, solo en el primer turno.** `FIRST_TURN_REMINDER` se pega al final del system
  prompt cuando el historial trae un único mensaje de `user`. Va al final a propósito: es donde no
  se lo come todo lo que hay en medio. En los turnos siguientes no se añade, porque ahí el modelo ya
  ve un turno suyo en el historial y no hace falta contárselo.

**Y hablaba argentino.** «¿Cuánto contenido tenés listo?», «¿querés que sigan pagando…?». La regla ya
existía, pero fallaba por dos razones: vivía enterrada en «# Idioma», que va de *detectar* el idioma,
y su único ejemplo era **«vos tenés»** — con el pronombre. El modelo lo cumplió al pie de la letra:
quitó el «vos» y siguió conjugando en voseo. Lo que delata es el verbo, no el pronombre.

Ahora la regla es el **punto d) de «Voz»**, que es donde viven las reglas de registro y se relee en
cada mensaje, y va con la tabla de pares (`tenés → tienes`, `querés → quieres`, `podés → puedes`,
`sos → eres`, `decime → dime`…) más los regionalismos sueltos: «che», «recién» por «apenas», «acá»,
«plata». En «# Idioma» queda una línea que apunta al punto d) y añade lo que faltaba: **si el
visitante vosea, el agente sigue contestando de tú.** El recordatorio del primer turno lo repite en
corto, porque es donde más se notaba.

**Sin probar contra la API.** En este entorno no hay `ANTHROPIC_API_KEY`, así que los dos arreglos
están razonados sobre el código y el prompt, no verificados en conversación. Conviene abrir el chat
en producción, escribir «Hola, estoy interesado en armar una plataforma» y mirar dos cosas: que no
salude, y que trate de tú.

**El fallo del widget, arreglado.** `applyLang()` miraba si el log estaba vacío para reescribir el
saludo, pero el saludo mismo cuenta como mensaje: después del primer render nunca volvía a entrar, y
al cambiar a inglés se quedaba en español para siempre. Ahora mira si hay conversación guardada.

**La llamada baja de 30 a 15 minutos** (#93). El sitio la vende como «Hablemos quince minutos» en los
tres botones y el prompt dice lo mismo, pero el calendario bloqueaba media hora. La duración sale a
la constante `CALL_MINUTES` de `agent-tools.js`, que usan el evento de la llamada y el evento privado
de notas; antes eran dos `30 * 60000` en funciones distintas. También lo decía la descripción de la
tool en `chat.js`, que el modelo lee en cada turno.

#### El agente aprende a recibir al que llega pidiendo la llamada

Agosto de 2026, con el botón de la 08. Ahora el primer mensaje de muchas conversaciones va a ser
«Quiero agendar los quince minutos», y el prompt tal como estaba lo habría atendido mal por dos
sitios que se contradecían entre sí:

- **«Cómo abrir» mandaba preguntar por el negocio.** «Si trajo poco, preguntas UNA sola cosa
  concreta: la que más te falte para entender su negocio.» Aplicado a alguien que acaba de pulsar
  «agendar», eso es ponerle un trámite delante a quien ya dijo que sí — justo lo que el botón viene
  a quitar. Ahora lleva una excepción y dos ejemplos más, uno bien y uno mal.
- **El «Flujo de handoff» empezaba por reconocer la intención**, que en este caso ya está dada. Se
  le añade el bloque **«Cuando llegan pidiendo la llamada»**: se salta el paso 1, arranca por el
  email y **puede juntar el paso 2 y el 3 en un mensaje** —el correo y las tres franjas a la vez—
  porque ahí no está cualificando, está cerrando. La línea de scoping se sigue pidiendo, pero en el
  paso 4, cuando la invitación ya está medio hecha.

El bloque reconoce el texto del botón y también las variantes escritas a mano («quiero agendar»,
«vamos a la llamada», «apúntame», «book a call»), así que sirve igual para quien lo teclee por su
cuenta. **No hace falta ninguna bandera en la petición:** lo que dispara la regla es lo que dice el
visitante, no de dónde viene el clic.

El `FIRST_TURN_REMINDER` de `chat.js` lleva la misma excepción en corto, porque el clic del botón cae
casi siempre en el primer turno, que es donde ese recordatorio se añade.

**El caso del prompt se puso al día con la 04** (agosto de 2026). Al reescribir la sección se
abrieron tres diferencias con `system-prompt.js`: el prompt seguía diciendo «la academia de
contrabajo» donde la página ya dice «la primera membresía de contrabajo online del mundo», seguía
contando el punto de partida como «material grabado y parado», y —lo peor— llevaba una instrucción
sobre una errata que ya no existe: «en la página todavía aparece escrito de otra forma en la cita».
Las tres se corrigieron; de la errata queda solo la regla útil, que su nombre se escribe Emilse Ríos.

- [ ] **Repasar conversaciones reales.** Es lo que el sitio ahora cobra en el mensual del agente, así
      que conviene hacerlo: leer lo que guarda Supabase y corregir lo que conteste mal. **Ya dio dos
      capturas:** el saludo repetido y el voseo, los dos arreglados arriba. Vale la pena seguir.
- [ ] **Comprobar los dos arreglos en producción.** Aquí no hay `ANTHROPIC_API_KEY`. Abrir el chat,
      escribir «Hola, estoy interesado en armar una plataforma» y mirar que no salude y que trate de
      tú.
- [ ] **Comprobar el botón que agenda, en producción.** El clic y lo que pasa en el navegador sí está
      verificado —baja al chat, escribe la línea en el idioma que toca, la guarda en el historial y
      el segundo clic no la repite—, pero **la respuesta del agente no**, por lo mismo: sin clave, el
      chat devuelve el aviso de conexión. Pulsar «Hablemos quince minutos» en la 08 y mirar que pida
      el correo y proponga tres franjas **sin preguntar antes por el negocio**, y que la reserva
      llegue al calendario.

### La web contra el prompt nuevo

**Hecho, salvo las páginas viejas.** La sección 06 se reordenó en tres grupos, la 07 pasó de ocho
preguntas a doce y el paso 04 de la 05 distingue mantenimiento de gestión — todo está contado arriba,
en los bloques de cada sección. Lo que se resolvió:

- [x] **El hosting no lo paga Adrián.** Era la contradicción más fea: el mantenimiento decía
      «hosting, base de datos, dominio y respaldos **a mi cargo**» mientras la pregunta «¿De quién es
      todo esto cuando terminas?» decía que las cuentas son del cliente. Ahora hay un bloque, «Las
      cuentas son tuyas», que lo dice una sola vez y con la razón detrás.
- [x] **No hay permanencia.** Fuera el «mínimo doce meses»; entra la línea de treinta días de aviso y
      la revisión de €200 al volver.
- [x] **El agente son €150/mes, no €100.**
- [x] **Las dos horas de cambios al mes: quitadas.** Decidido en agosto. El mantenimiento se queda en
      «que no se caiga» y el trabajo mensual es la gestión; si las horas se quedaban, los dos niveles
      se solapaban y no se veía qué separa €150 de €500.
- [x] **Gestión — desde €500/mes**, con lo que incluye.
- [x] **Las cuentas de terceros, en «Qué no incluye»**, como tercer punto.
- [x] **La llamada suelta de €100**, dentro de «¿Puedo no contratar mantenimiento?».
- [x] **La revisión de volumen**, en la nota del bloque mensual.
- [x] **Cuatro preguntas nuevas en la sección 07.**
- [x] **El paso 04 del proceso.**
- [x] **Separar construir de después.**

**Las páginas viejas siguen contradiciendo al agente, y se acepta.** `services-video.html` llega a
€10.000 por un brand film, `services-ai.html` vende agentes de €2.500 a €8.500 con mensuales de €500
y €900, `services-web.html` webs de €3.500 a €6.500, y `people.html` presenta a Robs y motion
graphics. El prompt es explícito en lo contrario: vídeo no está en la oferta pública y el agente no
lo ofrece nunca.

Se decidió dejarlas ocultas tal cual, sin tocar (bloque 4 del copy). Quien llegue por URL directa o
por Google se encuentra el sitio viejo; es un coste conocido. **No es un pendiente.**

### Newsletter

- [x] **Elegir herramienta de correos — hecha.** Adrián la eligió en agosto de 2026. Falta
      configurarla, y falta anotar aquí cuál es.
- [ ] **Conectarla.** Hasta que esté, el formulario guarda una copia en el navegador (`localStorage`,
      clave `arc_newsletter_v1`) y envía a **Netlify Forms** con el nombre `newsletter` — se
      recuperan en el panel de Netlify, en Forms. **Si esa función no está activada en la cuenta, el
      envío falla en silencio** y el visitante ve igualmente «Listo, te escribo pronto». Nunca da
      error, así que no hay forma de enterarse desde fuera de que se están perdiendo. Cuando la
      herramienta esté configurada, se cambia el destino del `fetch` en el bloque `newsletter()` del
      final de `index.html`.

### Diseño

- [ ] **Contraste del verde de acento en tema claro.** Sobre el fondo hueso queda casi ilegible en
      texto pequeño. En el home nuevo se evitó: las etiquetas pequeñas van en gris. Donde se ve es en
      las páginas de servicio (los tiempos del proceso, `~48h`), que son las que se quedan ocultas y
      sin tocar — así que esto solo importa el día que se escriba texto pequeño en verde en el home.
      Está en `styles.css`, común a todo, si alguna vez se arregla de raíz.
- [x] **El home se desbordaba a lo ancho en móvil — arreglado.** 5 de agosto de 2026. A 390px la
      página medía 405px de ancho real y se podía arrastrar de lado.

      **La causa era una sola línea que no estaba escrita.** `.ai__panel` es una rejilla, y los hijos
      de una rejilla llevan `min-width: auto`: la columna no puede encogerse por debajo del contenido
      mínimo de lo que lleva dentro. El contenedor da 350px a 390px de pantalla y la columna se
      plantaba en 385, así que `.ai__chat` y `.ai__side` —y con ellos `.ai__log`, `.ai__form` y el
      `.btn` del lateral— se salían los 15px. La `.nav` salía en la lista de sospechosos porque es
      `position: fixed` con `left: 0; right: 0` y se estira hasta el ancho del documento: era el
      síntoma, no la causa.

      Se arregla con **`.ai__panel > * { min-width: 0; }`**. Comprobado: 405 → 390px, sin nada que se
      salga, y el panel se ve igual a 350px —el log, las sugerencias, la fila de escribir y los dos
      bloques del lateral entran sin recortarse—. A 834 y 1440px no cambia nada.

      Llevaba abierto desde antes del home nuevo. Se comprueba a 390px con
      `document.documentElement.scrollWidth > clientWidth`.
- [ ] **En inglés se sigue desbordando: 449px.** Y ahora es lo único que queda. Es el
      `.foot-display` del pie, la frase grande que acaba en «something.»: a ese cuerpo no cabe a
      390px y se sale 59px. En español no pasa. **Está cerrado por decisión** en el bloque 3 del
      copy —Adrián lo miró en móvil y se queda—, así que esta entrada es un recordatorio de lo que se
      acepta, no una tarea. Se arreglaría partiendo la frase, como en la 03, no tocando el `clamp`.
- [ ] **La sección 06 mide 3.447px en móvil.** Es la más larga del sitio, y es el precio de decirlo
      todo. Si se hace pesada, lo que pliega bien son las dos listas de «qué incluye / qué no» con el
      mismo desplegable de las preguntas: el visitante que solo quiere las cifras las tiene en los
      tres grupos de arriba.

### Decisiones cerradas

- [x] **Qué hacer con las páginas de servicios, equipo y manifiesto.** Se quedan ocultas, sin tocar y
      sin mencionar. Ni archivar, ni redirigir, ni reescribir: siguen en el repositorio por si algún
      día vuelven a hacer falta. Agosto de 2026.
- [x] **Si la página también calla la tecnología** o si se levanta la regla que se lo prohíbe al
      agente. Calla la página (#96): es la regla más nueva y la única que no obliga a actualizar la
      web cada vez que cambie algo por dentro.

No queda ninguna abierta.

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
