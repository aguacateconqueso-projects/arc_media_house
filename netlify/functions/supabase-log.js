const { createClient } = require('@supabase/supabase-js');

let cached = null;
function getClient() {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn('[supabase-log] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — logging disabled');
    return null;
  }
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}

async function logMessages(rows) {
  const sb = getClient();
  if (!sb || !rows.length) return;
  try {
    const { error } = await sb.from('conversation_messages').insert(rows);
    if (error) console.error('[supabase-log] insert error', error);
  } catch (err) {
    console.error('[supabase-log] threw', err);
  }
}

exports.logMessages = logMessages;
exports.getClient = getClient;
