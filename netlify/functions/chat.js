const Anthropic = require('@anthropic-ai/sdk');
const SYSTEM = require('./system-prompt');
const { executeTool, sendTranscript } = require('./agent-tools');
const { logMessages } = require('./supabase-log');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MADRID_TZ = 'Europe/Madrid';
const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAYS_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const WEEKDAYS_PT = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

function madridDateParts(d) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: MADRID_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(d).map((p) => [p.type, p.value]));
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    weekdayShort: parts.weekday,
    hour: parts.hour,
    minute: parts.minute,
  };
}

function dateContextBlock() {
  const now = new Date();
  const today = madridDateParts(now);
  const todayIso = `${today.year}-${today.month}-${today.day}`;

  // Compute weekday index (0=Sun..6=Sat) for the Madrid date.
  const dow = new Date(`${todayIso}T12:00:00Z`).getUTCDay();

  const upcoming = [];
  for (let i = 0; i < 8; i++) {
    const d = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const p = madridDateParts(d);
    const iso = `${p.year}-${p.month}-${p.day}`;
    const idx = new Date(`${iso}T12:00:00Z`).getUTCDay();
    upcoming.push({
      iso,
      en: WEEKDAYS_EN[idx],
      es: WEEKDAYS_ES[idx],
      pt: WEEKDAYS_PT[idx],
      label: i === 0 ? 'today' : i === 1 ? 'tomorrow' : `+${i}d`,
    });
  }

  const lines = upcoming
    .map((u) => `  - ${u.iso} — ${u.en} / ${u.es} / ${u.pt} (${u.label})`)
    .join('\n');

  return [
    '# CURRENT DATE & TIME — read this before scheduling',
    `Today (Europe/Madrid): ${todayIso} — ${WEEKDAYS_EN[dow]} / ${WEEKDAYS_ES[dow]} / ${WEEKDAYS_PT[dow]}.`,
    `Madrid local time right now: ${today.hour}:${today.minute} CET/CEST.`,
    '',
    'Upcoming dates (use these — never invent calendar dates):',
    lines,
    '',
    'When you call schedule_call, preferred_datetime_iso MUST:',
    '1. Use one of the ISO dates listed above (or further in the future). NEVER a date in the past.',
    '2. Use the YEAR shown above. Do not default to a previous year.',
    '3. Preserve the EXACT clock time the visitor proposed. If they said "10 a 11am",',
    '   the start is 10:00 in their stated timezone — not 16:00, not 11:00.',
    '4. Use the visitor\'s timezone offset. If they\'re in Madrid: +02:00 (CEST) for',
    '   dates in CEST window, +01:00 (CET) otherwise. If unsure, default to Madrid CEST.',
    '5. Pick the window that best fits Madrid working hours (9:00–19:00) and gives',
    '   24h+ of buffer when possible — do NOT default to "the first one". If the',
    '   chosen window comes back as a conflict, try the NEXT proposed window in',
    '   the same turn before asking the visitor for alternatives.',
    '',
    'When you confirm a slot back to the visitor, repeat the time EXACTLY as they',
    'gave it — do not silently shift hours. Read this before every reply involving',
    'a date, day-of-week, or "this/next Monday" reference.',
  ].join('\n');
}

const tools = [
  {
    name: 'schedule_call',
    description: "Books a 15-minute discovery call on Adrián's Google Calendar and sends a calendar invite to the visitor. Only call this after the visitor has provided their email, at least one workable time window, and a one-line scoping note. Returns success with confirmed datetime, or error with reason.",
    input_schema: {
      type: 'object',
      properties: {
        visitor_email: {
          type: 'string',
          description: "The visitor's email address — must be a valid email.",
        },
        visitor_name: {
          type: 'string',
          description: "The visitor's name if shared, otherwise the part of their email before the @.",
        },
        preferred_datetime_iso: {
          type: 'string',
          description: "The chosen datetime in ISO 8601 format with timezone, e.g. '2026-05-13T16:00:00+02:00'. Evaluate the windows the visitor offered and pick the one that best fits Madrid working hours (9:00–19:00) with 24h+ of buffer when possible — do NOT default to the first window. On a conflict response, retry with a DIFFERENT window from the visitor's options before asking for alternatives.",
        },
        scoping_note: {
          type: 'string',
          description: "One-line summary of what the visitor is trying to ship, in their own words when possible.",
        },
        language: {
          type: 'string',
          enum: ['en', 'es', 'pt'],
          description: 'Language the conversation has been in — used for the calendar invite copy.',
        },
      },
      required: ['visitor_email', 'preferred_datetime_iso', 'scoping_note', 'language'],
    },
  },
  {
    name: 'send_transcript',
    description: 'Sends the full conversation transcript to Adrián at hello@arcmediahouse.com. Call this once, at the end of any conversation that involved real project intent, a handoff, or a notable interaction. Never call it speculatively — only when the conversation is closing.',
    input_schema: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          description: 'A two-to-four sentence summary of the conversation: who the visitor seemed to be, what they wanted, what was promised, what is pending.',
        },
        visitor_email: {
          type: 'string',
          description: "The visitor's email if shared, otherwise an empty string.",
        },
        scheduled_call_datetime: {
          type: 'string',
          description: 'If a call was scheduled, the ISO 8601 datetime. Empty string if no call was scheduled.',
        },
        full_transcript: {
          type: 'string',
          description: "The full back-and-forth, formatted as 'Visitor: ...' / 'Agent: ...' lines.",
        },
      },
      required: ['summary', 'full_transcript'],
    },
  },
];

const MAX_TOOL_TURNS = 6;

// Se añade al final del system prompt solo en el primer turno. Va aparte
// porque en los siguientes el modelo ya ve un turno suyo en el historial y
// no hace falta contárselo.
const FIRST_TURN_REMINDER = `# Recordatorio: este es tu primer turno

El visitante ya tiene un saludo tuyo en pantalla. No está en el historial que
recibes, pero está: te presentó, dijo que no hablas como Adrián y pidió que te
cuenten qué venden y dónde lo tienen hoy.

No saludes. No te presentes. No repitas la petición. Entra directo por lo que
el visitante acaba de escribir, y si trajo poco, pregunta una sola cosa
concreta sobre su negocio.

Excepción: si lo que escribió es pedir la llamada — "quiero agendar los quince
minutos", "I'd like to book the fifteen minutes", "vamos a la llamada" — viene
del botón de la página y ya dijo que sí. No le preguntes por el negocio: pide
el email y proponle tres franjas en el mismo mensaje. La línea de scoping se la
pides después.

`;

// Va al final del system prompt en TODOS los turnos, y por eso está fuera del
// recordatorio de arriba. Antes vivía dentro de él y solo salía en el primero:
// a partir del segundo, la única regla contra el voseo que le quedaba al modelo
// era la del punto d) de "Voz", enterrada en la línea 56 de un prompt de casi
// 500. Observado en producción el 6 de agosto de 2026 — los dos primeros turnos
// de tú y a partir del tercero «¿Para cuándo lo querés listo?». Lo último que
// lee es lo que más pesa, así que la regla se repite ahí, cada vez.
const REGISTER_REMINDER = `# Registro — lo último y lo más importante

Si esta conversación va en español, escribes en latinoamericano neutro y de tú.
NUNCA voseo, ni en el primer turno ni en el décimo. Lo que delata es el verbo:

✕ tenés · querés · podés · sabés · hacés · vendés · necesitás · pensás
✕ entendés · preferís · decís · venís · sos
✕ decime · contame · mirá · fijate · mandá · escribime · esperá · andá

✓ tienes · quieres · puedes · sabes · haces · vendes · necesitas · piensas
✓ entiendes · prefieres · dices · vienes · eres
✓ dime · cuéntame · mira · fíjate · manda · escríbeme · espera · ve

Si el visitante te vosea a él, tú sigues de tú. Antes de enviar, relee tu
respuesta y comprueba que no se te ha colado ninguna de las de arriba.`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Top-of-handler heartbeat. If even this line never reaches the Netlify
  // logs, the function isn't being invoked at all (cached bundle, wrong
  // site, or the front-end is hitting a different host) — not a logging
  // issue inside the handler.
  console.log('[chat] handler invoked', {
    ts: new Date().toISOString(),
    method: event.httpMethod,
    hasResendKey: Boolean(process.env.RESEND_API_KEY),
    resendFrom: process.env.RESEND_FROM || '(default agent@arcmediahouse.com)',
    resendTo: process.env.RESEND_TO || '(default hello@arcmediahouse.com)',
    resendToRecipients: (process.env.RESEND_TO || 'hello@arcmediahouse.com').split(',').length,
  });

  try {
    const body = JSON.parse(event.body);
    const incoming = body.messages;
    const sessionId = (body.session_id && String(body.session_id)) || 'anon';
    const lang = (body.lang && String(body.lang)) || null;
    const userAgent = (event.headers && (event.headers['user-agent'] || event.headers['User-Agent'])) || null;
    const messages = Array.isArray(incoming) ? [...incoming] : [];

    // The static greeting is painted by the front-end and never stored in
    // ARCChat history, so a first-turn request arrives as a single user
    // message and the conversation *looks* like a cold open to the model.
    // The prompt says so under "Cómo abrir", but the observed failure was
    // that it re-sent the greeting verbatim anyway. Repeat the rule last,
    // where it can't be outweighed by everything in between.
    const isFirstTurn = messages.filter((m) => m && m.role === 'user').length <= 1;
    const systemWithDate = [
      dateContextBlock(),
      SYSTEM,
      isFirstTurn ? FIRST_TURN_REMINDER : null,
      REGISTER_REMINDER,
    ]
      .filter(Boolean)
      .join('\n\n');

    // Detect whether this conversation already produced a booking in a
    // prior turn. The front-end only persists text (role + content) across
    // requests, so the model has no memory of its own tool calls — it has
    // re-invoked schedule_call on follow-up "gracias" messages, and the
    // observed-in-prod failure mode was that it ALSO re-invoked
    // send_transcript, sending Adrián a duplicate email per follow-up
    // turn. Prompt-only mitigation isn't enough; we intercept tool calls
    // server-side instead.
    const priorBookingDetected = detectPriorBooking(incoming);
    if (priorBookingDetected) {
      console.log('[chat] prior booking detected in history — tool calls will be intercepted');
    }

    let response;
    let scheduledCall = null;
    let transcriptCalled = false;
    const toolEvents = [];
    let visitorEmailSeen = null;

    for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
      response = await client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 4096,
        system: systemWithDate,
        tools,
        messages,
      });

      if (response.stop_reason !== 'tool_use') break;

      messages.push({ role: 'assistant', content: response.content });

      const toolResults = [];
      for (const block of response.content) {
        if (block.type !== 'tool_use') continue;
        console.log('[chat] tool_use', block.name, JSON.stringify(block.input).slice(0, 300));

        let result;
        if (priorBookingDetected && block.name === 'schedule_call') {
          console.log('[chat] intercept schedule_call — booking already confirmed in earlier turn');
          result = {
            success: true,
            already_booked: true,
            intercepted: true,
            note: 'A booking was confirmed earlier in this conversation. Do NOT call schedule_call or send_transcript again. Reply with a short warm closing message and end your turn.',
          };
        } else if (priorBookingDetected && block.name === 'send_transcript') {
          console.log('[chat] intercept send_transcript — transcript already sent in earlier turn');
          result = {
            success: true,
            intercepted: true,
            note: 'Transcript was sent in the earlier turn. Suppressing duplicate. Reply with a short warm closing message and end your turn.',
          };
          transcriptCalled = true;
        } else {
          result = await executeTool(block.name, block.input);
        }
        console.log('[chat] tool_result', block.name, result.success ? 'OK' : `ERR: ${result.error}`);

        if (block.name === 'schedule_call' && result.success && !result.intercepted) {
          // Capture either the original booking or a re-confirmation hit
          // (already_booked === true means the agent re-invoked schedule_call
          // on a follow-up turn against its own existing event — the original
          // transcript may have silently failed, so we still want the backstop
          // to fire on this turn).
          scheduledCall = {
            input: block.input,
            result,
            reConfirmation: Boolean(result.already_booked),
          };
        }
        if (block.name === 'send_transcript' && result.success && !result.intercepted) {
          transcriptCalled = true;
        }
        if (block.input && typeof block.input.visitor_email === 'string') {
          visitorEmailSeen = block.input.visitor_email;
        }
        toolEvents.push({
          name: block.name,
          input: block.input,
          success: !!result.success,
          error: result.error || null,
        });

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result),
          is_error: !result.success,
        });
      }
      messages.push({ role: 'user', content: toolResults });
    }

    // Primary backstop: if a call was successfully scheduled but the model
    // never called send_transcript, synthesize and send it server-side.
    // Also re-fires on the re-confirmation path (already_booked) as a
    // recovery hook in case the original turn's email never reached
    // Resend.
    if (scheduledCall && !transcriptCalled) {
      const tag = scheduledCall.reConfirmation ? 're-confirmation' : 'initial booking';
      console.log(`[chat] backstop: schedule_call ${tag} succeeded but send_transcript was not called — sending server-side`);
      try {
        const result = await sendTranscript(buildBackstopTranscript(incoming, scheduledCall));
        console.log('[chat] backstop send_transcript result', result.success ? 'OK' : `ERR: ${result.error}`);
        if (result.success) transcriptCalled = true;
      } catch (err) {
        console.error('[chat] backstop send_transcript threw', err);
      }
    }

    // Secondary backstop: lead captured but no booking happened (model
    // bailed to "Adrián will email you" path, or the model never invoked
    // schedule_call at all). If the visitor shared a real email and the
    // assistant has acknowledged a handoff, we still want the transcript
    // — that lead would otherwise vanish. Skip when a prior booking was
    // already confirmed: the original turn's transcript covered the lead.
    if (!scheduledCall && !transcriptCalled && !priorBookingDetected) {
      const lead = detectLead(incoming);
      if (lead) {
        console.log('[chat] secondary backstop: lead captured without booking — sending transcript', { email: lead.email });
        try {
          const result = await sendTranscript(buildLeadTranscript(incoming, lead));
          console.log('[chat] secondary backstop send_transcript result', result.success ? 'OK' : `ERR: ${result.error}`);
        } catch (err) {
          console.error('[chat] secondary backstop send_transcript threw', err);
        }
      }
    }

    let text = (response.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    // Empty-response safety net: if the model finished without emitting
    // any conversational text (e.g. tool-only response, or a quirk on
    // short follow-ups like "gracias"), reply with a safe default so the
    // visitor never sees an empty bubble.
    if (!text) {
      console.warn('[chat] model returned empty text — using fallback reply');
      text = defaultClosingFor(incoming);
    }

    // Último paso antes de contestar: se corrige lo que se ve y lo que se
    // guarda, para que el registro de admin.html no enseñe un voseo que el
    // visitante nunca llegó a leer.
    text = deVoseo(text);

    // Log this turn to Supabase: the latest user message + the assistant
    // reply, with any tool events captured along the way. Fire-and-forget
    // so a Supabase outage never blocks the chat reply.
    const lastUser = [...incoming].reverse().find((m) => m && m.role === 'user' && typeof m.content === 'string');
    const scheduledAt = scheduledCall && scheduledCall.result && scheduledCall.result.confirmed_datetime
      ? scheduledCall.result.confirmed_datetime
      : null;
    const rows = [];
    if (lastUser) {
      rows.push({
        session_id: sessionId,
        role: 'user',
        content: lastUser.content,
        lang,
        user_agent: userAgent,
      });
    }
    if (text) {
      rows.push({
        session_id: sessionId,
        role: 'assistant',
        content: text,
        tool_events: toolEvents.length ? toolEvents : null,
        visitor_email: visitorEmailSeen,
        scheduled_call_at: scheduledAt,
        lang,
      });
    }
    logMessages(rows).catch((e) => console.error('[chat] logMessages failed', e));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: text }),
    };
  } catch (err) {
    console.error('[chat] handler threw', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Agent unavailable. Email hello@arcmediahouse.com' }),
    };
  }
};

/* ---------- El filtro de voseo ----------
   La red de seguridad, por debajo del prompt. El prompt lo prohíbe en tres
   sitios —el punto d) de "Voz", el bloque de "Idioma" y el recordatorio de
   registro que ahora va en todos los turnos— y aun así se cuela: se arregló
   dos veces sobre el papel y las dos veces siguió apareciendo en producción.
   Con un modelo pequeño y un prompt largo, pedirlo no basta.

   Esto no pide: sustituye. Lista cerrada y explícita, nada de reglas generales
   por terminación —"estás", "vas", "quizás" y "atrás" son correctas y una regla
   automática se las llevaría por delante—. Cuando salta lo deja escrito en los
   logs, que es la única forma de saber si el prompt está mejorando o si el
   filtro es lo único que nos separa del voseo. */
// Las fronteras se construyen con `\p{L}` y no con `\b`. `\b` en JavaScript
// solo conoce el ASCII, así que detrás de una vocal acentuada no ve frontera
// ninguna: `/\bmirá\b/` no encuentra «mirá esto». Con los imperativos de voseo,
// que casi todos acaban en á, eso deja fuera media lista.
const L = '[\\p{L}\\p{M}]';
function vRe(word, flags = 'giu') {
  return new RegExp(`(?<!${L})${word}(?!${L})`, flags);
}

const VOSEO = [
  // Presente.
  ['tenés', 'tienes'], ['querés', 'quieres'], ['podés', 'puedes'],
  ['sabés', 'sabes'], ['hacés', 'haces'], ['vendés', 'vendes'],
  ['necesitás', 'necesitas'], ['buscás', 'buscas'], ['pensás', 'piensas'],
  ['entendés', 'entiendes'], ['preferís', 'prefieres'], ['decís', 'dices'],
  ['venís', 'vienes'], ['contás', 'cuentas'], ['llevás', 'llevas'],
  ['mandás', 'mandas'], ['esperás', 'esperas'], ['mirás', 'miras'],
  // Imperativos.
  ['decime', 'dime'], ['contame', 'cuéntame'], ['escribime', 'escríbeme'],
  ['mandame', 'mándame'], ['avisame', 'avísame'], ['pedime', 'pídeme'],
  ['fijate', 'fíjate'], ['mirá', 'mira'], ['contá', 'cuenta'],
  ['mandá', 'manda'], ['esperá', 'espera'], ['probá', 'prueba'],
  ['andá', 've'], ['dejá', 'deja'],
  // Pronombre. Las preposicionales van primero: "para vos" no es "para tú".
  ['con vos', 'contigo'], ['para vos', 'para ti'],
  ['a vos', 'a ti'], ['de vos', 'de ti'],
].map(([voseo, tuteo]) => [vRe(voseo), tuteo]);

// "sos" aparte: solo en minúscula, porque "SOS" en mayúsculas es otra cosa.
VOSEO.push([vRe('sos', 'gu'), 'eres']);

// "Querés" a principio de frase tiene que salir "Quieres", no "quieres".
function matchCase(found, replacement) {
  const head = found[0];
  if (head !== head.toLowerCase() && head === head.toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

function deVoseo(text) {
  if (!text) return text;
  const hits = [];
  let out = text;
  for (const [re, tuteo] of VOSEO) {
    out = out.replace(re, (found) => {
      hits.push(found);
      return matchCase(found, tuteo);
    });
  }
  if (hits.length) console.warn('[chat] voseo corregido', hits);
  return out;
}

function buildBackstopTranscript(originalMessages, scheduledCall) {
  const lines = [];
  for (const m of originalMessages || []) {
    if (!m || typeof m.content !== 'string') continue;
    const who = m.role === 'user' ? 'Visitor' : 'Agent';
    lines.push(`${who}: ${m.content}`);
  }
  const transcript = lines.join('\n\n') || '(no prior transcript captured)';

  const { input, result, reConfirmation } = scheduledCall;
  const summary = [
    reConfirmation
      ? `Discovery call RE-CONFIRMED via the ARC site agent for ${input.visitor_email} — the agent re-invoked schedule_call on a follow-up turn and hit its own existing event. If you already received an earlier transcript for this visitor, this email is a duplicate; otherwise the original transcript never reached you and this is the recovery copy.`
      : `Discovery call booked via the ARC site agent for ${input.visitor_email}.`,
    `Scoping: ${input.scoping_note}.`,
    `Confirmed datetime: ${result.confirmed_datetime}.`,
    'Transcript sent automatically because the model did not invoke send_transcript.',
  ].join(' ');

  return {
    summary,
    visitor_email: input.visitor_email || '',
    scheduled_call_datetime: result.confirmed_datetime || '',
    full_transcript: transcript,
  };
}

const EMAIL_IN_TEXT = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const BOOKING_CONFIRM_RE = /\b(Listo|Done|Booked|Agendado|Confirmed)\b[\s\S]{0,200}?\b\d{1,2}[:h]\d{2}\b[\s\S]{0,200}?(invitaci[oó]n|invite|Calendar|Meet|CET|CEST)/i;

function detectPriorBooking(originalMessages) {
  for (const m of originalMessages || []) {
    if (!m || m.role !== 'assistant' || typeof m.content !== 'string') continue;
    if (BOOKING_CONFIRM_RE.test(m.content)) return true;
  }
  return false;
}

// Un correo escrito por el visitante es señal suficiente. Antes se exigían
// dos cosas a la vez —el correo Y que el agente hubiera dicho alguna palabra
// de HANDOFF_HINTS_RE— y ese segundo requisito perdía leads reales: si alguien
// deja su correo y el agente contesta sin decir «llamada», «agendar» ni
// «Adrián», el aviso no salía. Nadie escribe su correo en un chat por
// accidente.
function detectLead(originalMessages) {
  let email = null;
  for (const m of originalMessages || []) {
    if (!m || m.role !== 'user' || typeof m.content !== 'string') continue;
    const match = m.content.match(EMAIL_IN_TEXT);
    if (match) email = match[0];
  }
  if (!email) return null;
  return { email };
}

function buildLeadTranscript(originalMessages, lead) {
  const lines = [];
  for (const m of originalMessages || []) {
    if (!m || typeof m.content !== 'string') continue;
    const who = m.role === 'user' ? 'Visitor' : 'Agent';
    lines.push(`${who}: ${m.content}`);
  }
  const transcript = lines.join('\n\n') || '(no prior transcript captured)';
  const summary = [
    `Lead captured via the ARC site agent (${lead.email}) but no calendar booking was completed —`,
    'the agent reached a handoff intent but never successfully invoked schedule_call,',
    'so this transcript is the only durable record. Follow up by email if needed.',
  ].join(' ');
  return {
    summary,
    visitor_email: lead.email,
    scheduled_call_datetime: '',
    full_transcript: transcript,
  };
}

function defaultClosingFor(originalMessages) {
  const lastUser = [...(originalMessages || [])].reverse().find((m) => m && m.role === 'user' && typeof m.content === 'string');
  const text = (lastUser && lastUser.content) || '';
  const isSpanish = /(gracias|hola|qu[eé]|c[oó]mo|por favor|buenas)/i.test(text);
  return isSpanish
    ? 'Gracias a ti — un placer. Cualquier cosa, escríbenos a hello@arcmediahouse.com.'
    : "Thanks — happy to help. Reach out anytime at hello@arcmediahouse.com.";
}
