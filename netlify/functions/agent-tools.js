const { google } = require('googleapis');
const { Resend } = require('resend');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const calendarCopy = (lang) => {
  const l = ['en', 'es', 'pt'].includes(lang) ? lang : 'en';
  return {
    en: {
      title: (note) => `ARC discovery — ${note}`,
      descLead: 'Discovery call scheduled via the ARC site agent.',
      transcriptLine: 'Conversation: see transcript email sent to Adrián.',
    },
    es: {
      title: (note) => `ARC discovery — ${note}`,
      descLead: 'Llamada de discovery agendada desde el agente del sitio de ARC.',
      transcriptLine: 'Conversación: ver email de transcripción enviado a Adrián.',
    },
    pt: {
      title: (note) => `ARC discovery — ${note}`,
      descLead: 'Discovery call agendada pelo agente do site da ARC.',
      transcriptLine: 'Conversa: ver email de transcrição enviado para Adrián.',
    },
  }[l];
};

async function scheduleCall(input) {
  const {
    visitor_email,
    visitor_name,
    preferred_datetime_iso,
    scoping_note,
    language,
  } = input || {};

  if (!visitor_email || !EMAIL_RE.test(visitor_email)) {
    return { success: false, error: 'Invalid visitor_email.' };
  }
  if (!preferred_datetime_iso) {
    return { success: false, error: 'Missing preferred_datetime_iso.' };
  }
  const start = new Date(preferred_datetime_iso);
  if (isNaN(start.getTime())) {
    return { success: false, error: 'Unparseable preferred_datetime_iso.' };
  }
  if (start.getTime() <= Date.now()) {
    const nowIso = new Date().toISOString();
    return {
      success: false,
      error: `preferred_datetime_iso (${preferred_datetime_iso}) is in the past. Server clock is ${nowIso}. Re-read the CURRENT DATE block in the system prompt and pick a date strictly after today, using the correct year.`,
    };
  }
  if (!scoping_note || !scoping_note.trim()) {
    return { success: false, error: 'Missing scoping_note.' };
  }

  const copy = calendarCopy(language);
  const end = new Date(start.getTime() + 30 * 60000);
  const displayName = visitor_name && visitor_name.trim()
    ? visitor_name.trim()
    : visitor_email.split('@')[0];

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/oauth/callback'
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const calendarEvent = {
    summary: copy.title(scoping_note),
    description: [
      copy.descLead,
      '',
      `Visitor: ${displayName} <${visitor_email}>`,
      `Scoping: ${scoping_note}`,
      '',
      copy.transcriptLine,
    ].join('\n'),
    start: { dateTime: start.toISOString(), timeZone: 'Europe/Madrid' },
    end: { dateTime: end.toISOString(), timeZone: 'Europe/Madrid' },
    attendees: [{ email: visitor_email, displayName }],
    conferenceData: {
      createRequest: {
        requestId: `arc-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: calendarEvent,
      conferenceDataVersion: 1,
      sendUpdates: 'all',
    });
    return {
      success: true,
      confirmed_datetime: start.toISOString(),
      event_link: response.data.htmlLink,
      meet_link: response.data.conferenceData?.entryPoints?.[0]?.uri || null,
    };
  } catch (err) {
    return { success: false, error: err.message || 'Calendar API error.' };
  }
}

async function sendTranscript(input) {
  const {
    summary,
    visitor_email,
    scheduled_call_datetime,
    full_transcript,
  } = input || {};

  if (!summary || !summary.trim()) {
    return { success: false, error: 'Missing summary.' };
  }
  if (!full_transcript || !full_transcript.trim()) {
    return { success: false, error: 'Missing full_transcript.' };
  }

  const firstSentence = summary.split(/(?<=[.!?])\s/)[0].slice(0, 120);
  const subject = `[ARC Agent] ${firstSentence}`;
  const escape = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const html = `
    <h2>ARC site agent — conversation log</h2>
    <p><strong>Summary:</strong><br/>${escape(summary)}</p>
    <p><strong>Visitor email:</strong> ${escape(visitor_email || '—')}</p>
    <p><strong>Scheduled call:</strong> ${escape(scheduled_call_datetime || '—')}</p>
    <hr/>
    <h3>Full transcript</h3>
    <pre style="font-family:ui-monospace,Menlo,monospace;font-size:13px;white-space:pre-wrap;">${escape(full_transcript)}</pre>
  `;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'agent@arcmediahouse.com',
      to: 'hello@arcmediahouse.com',
      reply_to: visitor_email && EMAIL_RE.test(visitor_email) ? visitor_email : undefined,
      subject,
      html,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message || 'Resend API error.' };
  }
}

async function executeTool(toolName, toolInput) {
  if (toolName === 'schedule_call') return scheduleCall(toolInput);
  if (toolName === 'send_transcript') return sendTranscript(toolInput);
  return { success: false, error: `Unknown tool: ${toolName}` };
}

exports.executeTool = executeTool;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON.' }) };
  }

  const { tool_name, tool_input } = body;
  if (!tool_name) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing tool_name.' }) };
  }

  const result = await executeTool(tool_name, tool_input || {});
  return {
    statusCode: result.success ? 200 : 500,
    headers,
    body: JSON.stringify(result),
  };
};
