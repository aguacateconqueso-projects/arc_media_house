const Anthropic = require('@anthropic-ai/sdk');
const SYSTEM = require('./system-prompt');
const { executeTool } = require('./agent-tools');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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
          description: "The chosen datetime in ISO 8601 format with timezone, e.g. '2026-05-13T16:00:00+02:00'. Pick the first viable window the visitor proposed.",
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

    let response;
    for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
      response = await client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        system: SYSTEM,
        tools,
        messages,
      });

      if (response.stop_reason !== 'tool_use') break;

      messages.push({ role: 'assistant', content: response.content });

      const toolResults = [];
      for (const block of response.content) {
        if (block.type !== 'tool_use') continue;
        const result = await executeTool(block.name, block.input);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result),
          is_error: !result.success,
        });
      }
      messages.push({ role: 'user', content: toolResults });
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
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Agent unavailable. Email hello@arcmediahouse.com' }),
    };
  }
};
