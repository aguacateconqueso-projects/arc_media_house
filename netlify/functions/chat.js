const Anthropic = require('@anthropic-ai/sdk');
const SYSTEM = require('./system-prompt');
const { executeTool, sendTranscript } = require('./agent-tools');

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
    description: "Books a 30-minute discovery call on Adrián's Google Calendar and sends a calendar invite to the visitor. Only call this after the visitor has provided their email, at least one workable time window, and a one-line scoping note. Returns success with confirmed datetime, or error with reason.",
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

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { messages: incoming } = JSON.parse(event.body);
    const messages = Array.isArray(incoming) ? [...incoming] : [];

    const systemWithDate = `${dateContextBlock()}\n\n${SYSTEM}`;

    let response;
    let scheduledCall = null;
    let transcriptCalled = false;

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
        const result = await executeTool(block.name, block.input);
        console.log('[chat] tool_result', block.name, result.success ? 'OK' : `ERR: ${result.error}`);

        if (block.name === 'schedule_call' && result.success) {
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
        if (block.name === 'send_transcript' && result.success) {
          transcriptCalled = true;
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result),
          is_error: !result.success,
        });
      }
      messages.push({ role: 'user', content: toolResults });
    }

    // Backstop: if a call was successfully scheduled but the model never
    // called send_transcript (web chats have no detectable end, so the
    // model often forgets), synthesize and send it server-side. We also
    // re-fire on the re-confirmation path: if the model re-invoked
    // schedule_call on a later turn and we returned already_booked,
    // that's our last reliable hook to deliver the transcript in case
    // the original turn's backstop never reached Resend. A duplicate
    // email to Adrián is cheaper than losing the lead entirely.
    if (scheduledCall && !transcriptCalled) {
      const tag = scheduledCall.reConfirmation ? 're-confirmation' : 'initial booking';
      console.log(`[chat] backstop: schedule_call ${tag} succeeded but send_transcript was not called — sending server-side`);
      try {
        const result = await sendTranscript(buildBackstopTranscript(incoming, scheduledCall));
        console.log('[chat] backstop send_transcript result', result.success ? 'OK' : `ERR: ${result.error}`);
      } catch (err) {
        console.error('[chat] backstop send_transcript threw', err);
      }
    }

    const text = (response.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

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
