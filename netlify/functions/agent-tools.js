const { google } = require('googleapis');
const { Resend } = require('resend');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getCalendarClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/oauth/callback'
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return google.calendar({ version: 'v3', auth: oauth2Client });
}

// Creates a private "[ARC notes] …" event on Adrián's primary calendar at
// the same time as the discovery call. No attendees → the visitor never
// receives it and cannot see it. Adrián opens his calendar and finds the
// full transcript sitting right next to the discovery call event.
// This is the durable second-channel for the conversation log when email
// delivery to hello@arcmediahouse.com is unreliable (Resend Receiving /
// MX routing).
async function attachTranscriptToCalendar({ scheduled_call_datetime, summary, full_transcript, visitor_email }) {
  if (!scheduled_call_datetime) {
    return { skipped: true, reason: 'no scheduled_call_datetime — nothing to attach to' };
  }
  const start = new Date(scheduled_call_datetime);
  if (isNaN(start.getTime())) {
    return { skipped: true, reason: 'unparseable scheduled_call_datetime' };
  }
  // The companion notes event mirrors the call window. visibility=private
  // hides it from anyone else who might share the calendar.
  const end = new Date(start.getTime() + 30 * 60000);

  const description = [
    'ARC site agent — internal conversation log.',
    'This event has no attendees and is only visible to the calendar owner.',
    '',
    `Visitor: ${visitor_email || '—'}`,
    `Discovery call: ${scheduled_call_datetime}`,
    '',
    '— Summary —',
    summary || '(no summary captured)',
    '',
    '— Full transcript —',
    full_transcript || '(no transcript captured)',
  ].join('\n');

  const notesEvent = {
    summary: `[ARC notes] ${visitor_email || 'lead'}`,
    description,
    start: { dateTime: start.toISOString(), timeZone: 'Europe/Madrid' },
    end: { dateTime: end.toISOString(), timeZone: 'Europe/Madrid' },
    visibility: 'private',
    transparency: 'transparent',
    reminders: { useDefault: false, overrides: [] },
    extendedProperties: {
      private: {
        arc_kind: 'transcript',
        arc_visitor_email: visitor_email || '',
      },
    },
  };

  try {
    const calendar = getCalendarClient();
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: notesEvent,
      sendUpdates: 'none',
    });
    console.log('[transcript-calendar] notes event created', {
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
      visitor: visitor_email,
    });
    return { success: true, event_id: response.data.id, event_link: response.data.htmlLink };
  } catch (err) {
    console.error('[transcript-calendar] failed to create notes event', err && err.message);
    return { success: false, error: err && err.message };
  }
}

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

  const calendar = getCalendarClient();

  // Conflict check — refuse to double-book Adrián's primary calendar.
  // Important: the agent runs stateless across HTTP turns, so on a follow-up
  // message ("thanks") the model has no memory of the booking it just made.
  // If it re-issues schedule_call with the same datetime, the freshly-created
  // event shows up in busy[] and we'd report a fake conflict against ourselves.
  // Detect that case by listing the actual events in the window and checking
  // whether one of them has this visitor as an attendee — if so, treat the
  // call as idempotent and return the existing booking.
  try {
    const fb = await calendar.freebusy.query({
      requestBody: {
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        timeZone: 'Europe/Madrid',
        items: [{ id: 'primary' }],
      },
    });
    const busy = (fb.data.calendars && fb.data.calendars.primary && fb.data.calendars.primary.busy) || [];
    if (busy.length > 0) {
      let existing = null;
      try {
        const events = await calendar.events.list({
          calendarId: 'primary',
          timeMin: start.toISOString(),
          timeMax: end.toISOString(),
          singleEvents: true,
          maxResults: 10,
        });
        const items = (events.data && events.data.items) || [];
        existing = items.find((ev) =>
          (ev.attendees || []).some(
            (a) => a.email && a.email.toLowerCase() === visitor_email.toLowerCase()
          )
        );
      } catch (lookupErr) {
        console.error('[schedule_call] events.list lookup failed', lookupErr);
      }

      if (existing) {
        console.log('[schedule_call] idempotent re-call — visitor already booked', {
          eventId: existing.id,
          start: existing.start && existing.start.dateTime,
        });
        return {
          success: true,
          already_booked: true,
          confirmed_datetime: (existing.start && existing.start.dateTime) || start.toISOString(),
          event_link: existing.htmlLink,
          meet_link:
            (existing.conferenceData &&
              existing.conferenceData.entryPoints &&
              existing.conferenceData.entryPoints[0] &&
              existing.conferenceData.entryPoints[0].uri) ||
            null,
          note: 'This visitor is already booked at this time. Do not call schedule_call again — confirm conversationally instead.',
        };
      }

      console.log('[schedule_call] conflict', { start: start.toISOString(), busy });
      const conflict = busy[0];
      return {
        success: false,
        error: `Adrián is already booked at ${preferred_datetime_iso}. Conflicting block: ${conflict.start} → ${conflict.end}. Pick a DIFFERENT window from the visitor's other proposed options (or propose an adjacent slot) and call schedule_call again with the new datetime — do not retry the same time.`,
      };
    }
  } catch (err) {
    console.error('[schedule_call] freebusy check failed', err);
    return { success: false, error: `Calendar availability check failed: ${err.message || 'unknown error'}` };
  }

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

  console.log('[send_transcript] entry', {
    hasApiKey: Boolean(process.env.RESEND_API_KEY),
    fromEnv: process.env.RESEND_FROM || '(unset — defaulting to agent@arcmediahouse.com)',
    toEnv: process.env.RESEND_TO || '(unset — defaulting to hello@arcmediahouse.com)',
    toRecipientCount: (process.env.RESEND_TO || 'hello@arcmediahouse.com').split(',').length,
    visitor: visitor_email || '(none)',
    transcriptChars: full_transcript.length,
  });

  if (!process.env.RESEND_API_KEY) {
    console.error('[send_transcript] RESEND_API_KEY is not set in env — emails cannot be sent');
    return { success: false, error: 'RESEND_API_KEY not configured on server.' };
  }

  const fromAddr = process.env.RESEND_FROM || 'agent@arcmediahouse.com';
  // RESEND_TO accepts a single address OR a comma-separated list. Multi-
  // recipient is the recommended quick-fix when the primary inbox isn't
  // wired to a real mailbox yet (Resend reports "Sent" once SMTP hands
  // off, but if the destination silently drops or routes to an internal
  // Resend Receiving inbox, the lead never reaches a human). Listing a
  // guaranteed-real backup address (e.g. a personal Gmail) ensures
  // delivery while DNS / mailbox setup is being finalised.
  const toRaw = process.env.RESEND_TO || 'hello@arcmediahouse.com';
  const toList = toRaw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && EMAIL_RE.test(s));
  if (toList.length === 0) {
    console.error('[send_transcript] RESEND_TO contained no valid addresses', { toRaw });
    return { success: false, error: 'RESEND_TO has no valid recipient addresses.' };
  }
  const toAddr = toList.length === 1 ? toList[0] : toList;

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

  console.log('[send_transcript] sending', { from: fromAddr, to: toList, subject });

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: fromAddr,
      to: toAddr,
      reply_to: visitor_email && EMAIL_RE.test(visitor_email) ? visitor_email : undefined,
      subject,
      html,
    });

    // The Resend SDK returns { data, error } and does NOT throw on API
    // errors (e.g. unverified domain, invalid from). Inspect the error
    // field explicitly — otherwise the email silently never sends.
    let emailOutcome;
    if (result && result.error) {
      console.error('[send_transcript] Resend API error', result.error);
      const msg = result.error.message
        || result.error.name
        || JSON.stringify(result.error);
      emailOutcome = { ok: false, error: `Resend: ${msg}` };
    } else {
      console.log('[send_transcript] sent OK', { id: result && result.data && result.data.id });
      emailOutcome = { ok: true, email_id: result && result.data && result.data.id };
    }

    // Always also attach the transcript to Adrián's calendar as a private
    // companion event. This is the durable second channel: even when
    // Resend reports "Sent" but the message never reaches a real inbox
    // (Resend Receiving / MX routing), the transcript is still readable
    // by opening the calendar event that already exists for the call.
    const calendarOutcome = await attachTranscriptToCalendar({
      scheduled_call_datetime,
      summary,
      full_transcript,
      visitor_email,
    });

    // Treat the overall send_transcript call as successful if EITHER
    // channel landed — Adrián can always read the calendar event even
    // when email is misrouted.
    const success = emailOutcome.ok || calendarOutcome.success;
    return {
      success,
      email_ok: emailOutcome.ok,
      email_id: emailOutcome.email_id,
      email_error: emailOutcome.error,
      calendar_ok: Boolean(calendarOutcome.success),
      calendar_event_id: calendarOutcome.event_id,
      calendar_event_link: calendarOutcome.event_link,
      calendar_error: calendarOutcome.error,
      calendar_skipped_reason: calendarOutcome.reason,
      ...(success ? {} : { error: emailOutcome.error || calendarOutcome.error || 'Both channels failed.' }),
    };
  } catch (err) {
    console.error('[send_transcript] threw', err);
    // Even if Resend throws, try the calendar attach so the lead isn't lost.
    const calendarOutcome = await attachTranscriptToCalendar({
      scheduled_call_datetime,
      summary,
      full_transcript,
      visitor_email,
    });
    if (calendarOutcome.success) {
      console.log('[send_transcript] recovered via calendar attach despite Resend throw');
      return {
        success: true,
        email_ok: false,
        email_error: err.message || 'Resend API error.',
        calendar_ok: true,
        calendar_event_id: calendarOutcome.event_id,
        calendar_event_link: calendarOutcome.event_link,
      };
    }
    return { success: false, error: err.message || 'Resend API error.' };
  }
}

async function executeTool(toolName, toolInput) {
  if (toolName === 'schedule_call') return scheduleCall(toolInput);
  if (toolName === 'send_transcript') return sendTranscript(toolInput);
  return { success: false, error: `Unknown tool: ${toolName}` };
}

exports.executeTool = executeTool;
exports.sendTranscript = sendTranscript;

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
