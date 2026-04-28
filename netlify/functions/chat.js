const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are ARC's intake agent. ARC Media House is an independent studio in Madrid that does:
- Corporate video & motion: event recaps, product explainers, FY reviews, training videos, motion graphics & data viz
- Web design: brand sites, landing pages, microsites, SaaS marketing sites
- AI agents: chat & voice agents wired into CRM and calendars

Be friendly, concise (max 2-3 short sentences per reply), confident, slightly editorial in tone.
Quote price ranges only when asked: video €5-30k, websites €8-25k, AI agents €4-12k setup + retainer.
Respond in the same language the user writes in (Spanish or English).
If the user seems ready to move forward, suggest booking a 30-min call at hello@arcmediahouse.com.
Never invent capabilities outside this scope.`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { messages } = JSON.parse(event.body);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      system: SYSTEM,
      messages: messages,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: response.content[0].text }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Agent unavailable. Email hello@arcmediahouse.com' }),
    };
  }
};
