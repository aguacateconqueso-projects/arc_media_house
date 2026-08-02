# Progreso — ARC Media House

Estado del sitio y de lo que queda pendiente. Se actualiza cuando algo cambia de sitio.

Última actualización: 2 de agosto de 2026.

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
`ai-chat-widget.css`, `hero-bloom.css`.

JavaScript: `app.js` (tema, idioma, cursor, apariciones, menú móvil, reloj, animación de entrada),
`ai-chat-store.js` (estado compartido del chat), `ai-chat.js` (chat incrustado del home),
`ai-chat-widget.js` (widget flotante, en todas las páginas), `home.js`, `hero-bloom.js`.

---

## El home nuevo

Once secciones, en este orden:

1. Encabezado — titular, qué se construye, «Desde €2.500.» y el botón
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

**El botón «Hablemos quince minutos» aparece tres veces** (encabezado, fin de la prueba, fin del
precio) y las tres bajan a contacto. El de dentro de contacto abre el correo, porque un botón que
lleva a sí mismo no hace nada.

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

## Pendiente

### Contenido

- [ ] **Repasar la traducción al inglés del home.** El español manda; el inglés está a la espera de
      corrección. El titular en inglés ocupa dos líneas donde el español ocupa una — buen momento
      para acortarlo.
- [ ] **Vídeo de la prueba.** Hay un recuadro vacío con «Video en camino» en la sección 04, a
      proporción 16:9 y ancho completo. Sustituir por el vídeo cuando exista.
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

### Decisiones abiertas

- [ ] **Qué hacer con las páginas de servicios, equipo y manifiesto.** Están vivas pero sin enlazar.
      Hay que decidir si se archivan, se redirigen al home o se reescriben para el posicionamiento
      nuevo.

---

## Cómo se trabaja aquí

- Se conserva la familia visual: no se cambian tipografías, colores ni tamaños. Si un bloque nuevo
  se parece a uno que ya existe, se hace igual que ese.
- El texto se escribe en español primero. Frases cortas. Nada de vocabulario de agencia.
- Los nombres propios no se traducen. Los precios van en euros con el mismo formato en los dos
  idiomas.
- Cualquier texto visible lleva sus `data-en` y `data-es`. Si algo se queda en un idioma al cambiar
  al otro, es un fallo.
