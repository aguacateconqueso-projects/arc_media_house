const { google } = require('googleapis');
const { Resend } = require('resend');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { tool_name, tool_input } = JSON.parse(event.body);
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (tool_name === 'schedule_call') {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        'http://localhost:3000/oauth/callback'
      );
      oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
      });

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

      const startTime = new Date(tool_input.datetime);
      const endTime = new Date(startTime.getTime() + 30 * 60000);

      const event = {
        summary: `ARC Media House — Call with ${tool_input.name}`,
        description: `Project: ${tool_input.project_type}\nNotes: ${tool_input.notes || ''}`,
        start: { dateTime: startTime.toISOString(), timeZone: 'Europe/Madrid' },
        end: { dateTime: endTime.toISOString(), timeZone: 'Europe/Madrid' },
        attendees: [{ email: tool_input.email }],
        conferenceData: {
          createRequest: { requestId: `arc-${Date.now()}` }
        }
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all'
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          event_link: response.data.htmlLink,
          meet_link: response.data.conferenceData?.entryPoints?.[0]?.uri || null
        })
      };
    } catch (err) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: err.message })
      };
    }
  }

  if (tool_name === 'send_transcript') {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: 'agent@arcmediahouse.com',
        to: 'hello@arcmediahouse.com',
        subject: `Agent transcript — ${tool_input.visitor_name || 'Visitor'} · ${new Date().toLocaleDateString('es-ES')}`,
        html: `
          <h2>Transcript del agente</h2>
          <p><strong>Visitante:</strong> ${tool_input.visitor_name || 'Anónimo'}</p>
          <p><strong>Email:</strong> ${tool_input.visitor_email || 'No proporcionado'}</p>
          <p><strong>Interés:</strong> ${tool_input.interest || 'No especificado'}</p>
          <hr/>
          <pre style="font-family:monospace;font-size:13px;">${tool_input.transcript}</pre>
        `
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    } catch (err) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: err.message })
      };
    }
  }

  return {
    statusCode: 400,
    headers,
    body: JSON.stringify({ error: 'Unknown tool' })
  };
};
