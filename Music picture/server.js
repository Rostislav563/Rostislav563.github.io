const http = require('node:http');
const { promises: fs } = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
};

function safeResolve(requestPath) {
  try {
    const rawPath = requestPath.split('?')[0];
    let normalizedPath = decodeURIComponent(rawPath);

    if (normalizedPath === '/') {
      normalizedPath = '/index.html';
    } else if (normalizedPath.endsWith('/')) {
      normalizedPath += 'index.html';
    }

    const relativePath = path.normalize(normalizedPath).replace(/^([/\\])+/, '');
    const filePath = path.resolve(PUBLIC_DIR, relativePath);
    const publicRoot = path.resolve(PUBLIC_DIR);

    if (filePath !== publicRoot && !filePath.startsWith(`${publicRoot}${path.sep}`)) {
      return null;
    }

    return filePath;
  } catch {
    return null;
  }
}

async function serveFile(req, res, requestPath) {
  const filePath = safeResolve(requestPath);

  if (!filePath) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();

    res.writeHead(200, {
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    });

    res.end(req.method === 'HEAD' ? undefined : data);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Server error');
  }
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, {
      Allow: 'GET, HEAD',
      'Content-Type': 'text/plain; charset=utf-8',
    });
    res.end('Method not allowed');
    return;
  }

  if (req.url.split('?')[0] === '/health') {
    res.writeHead(200, {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json; charset=utf-8',
    });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  void serveFile(req, res, req.url);
});

server.listen(PORT, () => {
  console.log(`Photo-to-Music running at http://localhost:${PORT}`);
});
