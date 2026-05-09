const { getClient } = require('./supabase-log');

function unauthorized() {
  return {
    statusCode: 401,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Unauthorized.' }),
  };
}

function checkAuth(event) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const header = (event.headers && (event.headers['x-admin-password'] || event.headers['X-Admin-Password'])) || '';
  return header === expected;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  if (!checkAuth(event)) return unauthorized();

  const sb = getClient();
  if (!sb) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Supabase not configured on server.' }),
    };
  }

  const params = event.queryStringParameters || {};
  const sessionId = params.session_id;

  try {
    if (sessionId) {
      const { data, error } = await sb
        .from('conversation_messages')
        .select('id, ts, role, content, tool_events, visitor_email, scheduled_call_at, lang')
        .eq('session_id', sessionId)
        .order('ts', { ascending: true })
        .limit(500);
      if (error) throw error;
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, messages: data }),
      };
    }

    // List sessions, newest first.
    const { data, error } = await sb
      .from('conversation_sessions')
      .select('*')
      .order('last_seen', { ascending: false })
      .limit(200);
    if (error) throw error;
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessions: data }),
    };
  } catch (err) {
    console.error('[admin-conversations] error', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message || 'Server error.' }),
    };
  }
};
