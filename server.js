const http = require('http');
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const SYSTEM = require('./netlify/functions/system-prompt');

require('dotenv').config();

const PORT = 3002;
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.woff2': 'font/woff2',
};

const server = http.createServer(async (req, res) => {
  // CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Chat API
  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', async () => {
      try {
        const { messages } = JSON.parse(body);
        const response = await client.messages.create({
          model: 'claude-haiku-4-5',
          max_tokens: 600,
          system: SYSTEM,
          messages,
        });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply: response.content[0].text }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Agent unavailable. Email hello@arcmediahouse.com' }));
      }
    });
    return;
  }

  // Static files
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n  ARC Media House — local preview`);
  console.log(`  ➜  http://localhost:${PORT}\n`);
});
