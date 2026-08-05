/* ============ RESUMEN DIARIO DE CONVERSACIONES ============
   Función programada. Cada mañana lee de Supabase las conversaciones del día
   anterior que NO acabaron en reserva y las manda en un solo correo.

   Por qué existe: las que sí agendan ya avisan solas, con el `send_transcript`
   del agente. Las que no, se quedaban solo en Supabase — guardadas, sí, pero
   había que acordarse de entrar a `admin.html` a mirarlas. Y son justo las
   interesantes para corregir al agente: donde la conversación se torció.

   Va una vez al día y no por conversación a propósito. Un chat web no tiene
   final limpio, así que un correo por charla llegaría a deshora y varias veces;
   y esto no es una alerta, es material de estudio.

   Horario en netlify.toml. Silencioso: si no hubo conversaciones, no manda
   nada — un correo diario diciendo «nada» enseña a ignorar el remitente.
   ========================================================== */
const { Resend } = require('resend');
const { getClient } = require('./supabase-log');

const MADRID_TZ = 'Europe/Madrid';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// El día de ayer en Madrid, devuelto como los dos instantes UTC que lo
// delimitan. Se calcula con Intl y no con getTimezoneOffset porque el runtime
// de Netlify va en UTC y el cambio de hora movería la ventana dos veces al año.
function yesterdayInMadrid(now = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: MADRID_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
  const todayLocal = fmt.format(now); // YYYY-MM-DD en Madrid
  const startOfToday = madridMidnightToUtc(todayLocal);
  const start = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
  return { start, end: startOfToday, label: fmt.format(start) };
}

// Medianoche de una fecha local de Madrid, en UTC. Se prueban los dos offsets
// posibles (+01:00 y +02:00) y se queda el que al volver a formatear da la
// misma fecha local: así el cambio de hora se resuelve solo.
function madridMidnightToUtc(ymd) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: MADRID_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false,
  });
  for (const offset of ['+01:00', '+02:00']) {
    const guess = new Date(`${ymd}T00:00:00${offset}`);
    const parts = Object.fromEntries(fmt.formatToParts(guess).map((p) => [p.type, p.value]));
    if (`${parts.year}-${parts.month}-${parts.day}` === ymd && parts.hour === '00') return guess;
  }
  return new Date(`${ymd}T00:00:00Z`);
}

// «conversación» pierde la tilde en plural, así que no vale con pegarle «es».
function plural(n) {
  return n === 1 ? 'conversación' : 'conversaciones';
}

function escape(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function hhmm(ts) {
  return new Intl.DateTimeFormat('es-ES', {
    timeZone: MADRID_TZ, hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(ts));
}

// Agrupa las filas por sesión conservando el orden temporal.
function groupBySession(rows) {
  const sessions = new Map();
  for (const r of rows) {
    if (!sessions.has(r.session_id)) {
      sessions.set(r.session_id, {
        id: r.session_id,
        messages: [],
        email: null,
        booked: null,
        lang: r.lang || null,
      });
    }
    const s = sessions.get(r.session_id);
    s.messages.push(r);
    if (r.visitor_email) s.email = r.visitor_email;
    if (r.scheduled_call_at) s.booked = r.scheduled_call_at;
    if (r.lang) s.lang = r.lang;
  }
  return [...sessions.values()];
}

function renderHtml(sessions, label) {
  const blocks = sessions.map((s, i) => {
    const turns = s.messages.map((m) => {
      const who = m.role === 'user' ? 'Visitante' : 'Agente';
      const colour = m.role === 'user' ? '#111' : '#555';
      return `<p style="margin:0 0 10px;color:${colour};">`
        + `<strong>${who}</strong> <span style="color:#999;font-size:12px;">${hhmm(m.ts)}</span><br/>`
        + `${escape(m.content).replace(/\n/g, '<br/>')}</p>`;
    }).join('');

    const visitorTurns = s.messages.filter((m) => m.role === 'user').length;
    const meta = [
      `${visitorTurns} mensaje${visitorTurns === 1 ? '' : 's'} del visitante`,
      s.email ? `correo: ${escape(s.email)}` : 'sin correo',
      s.lang ? `idioma: ${s.lang}` : null,
    ].filter(Boolean).join(' · ');

    return `
      <div style="border:1px solid #ddd;padding:16px;margin:0 0 20px;">
        <div style="font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#999;margin-bottom:12px;">
          #${i + 1} · ${escape(s.id.slice(0, 8))} · ${meta}
        </div>
        ${turns}
      </div>`;
  }).join('');

  const n = sessions.length;
  return `
    <h2 style="font-family:system-ui,sans-serif;">Conversaciones sin reserva — ${escape(label)}</h2>
    <p style="font-family:system-ui,sans-serif;color:#555;">
      ${n} ${plural(n)} que no ${n === 1 ? 'acabó' : 'acabaron'} en llamada agendada.
      Las que sí agendaron llegaron aparte, en su propio correo.
    </p>
    <div style="font-family:system-ui,sans-serif;font-size:14px;line-height:1.5;">${blocks}</div>
    <p style="font-family:system-ui,sans-serif;color:#999;font-size:12px;">
      Generado por daily-digest. Todo esto está también en admin.html.
    </p>`;
}

exports.handler = async () => {
  const { start, end, label } = yesterdayInMadrid();
  console.log('[daily-digest] ventana', { start: start.toISOString(), end: end.toISOString(), label });

  const sb = getClient();
  if (!sb) {
    console.warn('[daily-digest] Supabase no configurado — no hay nada que leer');
    return { statusCode: 200, body: 'supabase not configured' };
  }

  const { data, error } = await sb
    .from('conversation_messages')
    .select('session_id, ts, role, content, visitor_email, scheduled_call_at, lang')
    .gte('ts', start.toISOString())
    .lt('ts', end.toISOString())
    .order('ts', { ascending: true });

  if (error) {
    console.error('[daily-digest] error leyendo Supabase', error);
    return { statusCode: 500, body: 'supabase read failed' };
  }

  const all = groupBySession(data || []);
  // Fuera las que agendaron: de esas ya llegó la transcripción en su momento.
  const sessions = all.filter((s) => !s.booked);
  console.log('[daily-digest] sesiones', { total: all.length, sinReserva: sessions.length });

  if (sessions.length === 0) {
    console.log('[daily-digest] nada que mandar');
    return { statusCode: 200, body: 'nothing to send' };
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('[daily-digest] RESEND_API_KEY sin configurar — no se puede mandar');
    return { statusCode: 500, body: 'RESEND_API_KEY not configured' };
  }

  const from = process.env.RESEND_FROM || 'agent@arcmediahouse.com';
  const toList = (process.env.RESEND_TO || 'hello@arcmediahouse.com')
    .split(',').map((s) => s.trim()).filter((s) => s && EMAIL_RE.test(s));
  if (toList.length === 0) {
    console.error('[daily-digest] RESEND_TO sin direcciones válidas');
    return { statusCode: 500, body: 'no valid recipients' };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from,
      to: toList.length === 1 ? toList[0] : toList,
      subject: `[ARC Agent] ${sessions.length} ${plural(sessions.length)} sin reserva — ${label}`,
      html: renderHtml(sessions, label),
    });
    if (result && result.error) {
      console.error('[daily-digest] Resend devolvió error', result.error);
      return { statusCode: 500, body: 'resend error' };
    }
    console.log('[daily-digest] enviado', { to: toList, sesiones: sessions.length });
    return { statusCode: 200, body: `sent ${sessions.length}` };
  } catch (err) {
    console.error('[daily-digest] falló el envío', err);
    return { statusCode: 500, body: 'send threw' };
  }
};

// Exportado para poder probar el troceado sin tocar la red.
exports._internals = { yesterdayInMadrid, groupBySession, renderHtml };
