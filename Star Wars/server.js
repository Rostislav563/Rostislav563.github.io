const http = require('http');
const path = require('path');
const { readFile } = require('fs/promises');
const { URL } = require('url');

const PORT = Number(process.env.PORT) || 3000;
const PROJECT_ROOT = __dirname;
const PUBLIC_ROOT = path.join(PROJECT_ROOT, 'public');
const API_BASE = process.env.STAR_WARS_API_BASE || 'https://starwars-databank-server.onrender.com/api/v1';
const ALLOWED_RESOURCES = new Set([
  'characters',
  'creatures',
  'droids',
  'locations',
  'organizations',
  'species',
  'vehicles',
]);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
};

function send(res, statusCode, body, headers = {}) {
  const payload = Buffer.isBuffer(body) ? body : Buffer.from(String(body));
  res.writeHead(statusCode, {
    'Content-Length': payload.length,
    ...headers,
  });
  res.end(payload);
}

function sendJson(res, statusCode, payload) {
  send(res, statusCode, JSON.stringify(payload), {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
}

function getContentType(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

async function serveFile(res, filePath) {
  try {
    const file = await readFile(filePath);
    send(res, 200, file, {
      'Content-Type': getContentType(filePath),
      'Cache-Control': 'no-cache',
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      sendJson(res, 404, { error: 'File not found.' });
      return;
    }

    console.error(`Failed to serve ${filePath}:`, error);
    sendJson(res, 500, { error: 'Failed to read static file.' });
  }
}

function resolvePublicAsset(requestPath) {
  const relativePath = requestPath.slice('/public/'.length);
  const resolvedPath = path.resolve(PUBLIC_ROOT, relativePath);

  if (!resolvedPath.startsWith(PUBLIC_ROOT + path.sep) && resolvedPath !== PUBLIC_ROOT) {
    return null;
  }

  return resolvedPath;
}

async function proxyStarWarsResource(res, resource, search) {
  if (!ALLOWED_RESOURCES.has(resource)) {
    sendJson(res, 404, { error: 'Unknown Star Wars resource.' });
    return;
  }

  const upstreamUrl = new URL(`${API_BASE}/${resource}${search}`);
  const response = await fetch(upstreamUrl);

  if (!response.ok) {
    throw new Error(`Star Wars API responded with ${response.status} for ${resource}.`);
  }

  const payload = await response.json();
  sendJson(res, 200, payload);
}

async function handleRequest(req, res) {
  const requestUrl = new URL(req.url, 'http://localhost');
  const { pathname, search } = requestUrl;

  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed.' });
    return;
  }

  if (pathname === '/' || pathname === '/index.html') {
    await serveFile(res, path.join(PROJECT_ROOT, 'index.html'));
    return;
  }

  if (pathname.startsWith('/public/')) {
    const assetPath = resolvePublicAsset(pathname);
    if (!assetPath) {
      sendJson(res, 400, { error: 'Invalid asset path.' });
      return;
    }

    await serveFile(res, assetPath);
    return;
  }

  if (pathname === '/api/star-wars') {
    sendJson(res, 200, {
      resources: [...ALLOWED_RESOURCES],
      upstream: API_BASE,
    });
    return;
  }

  if (pathname.startsWith('/api/star-wars/')) {
    const resource = pathname.slice('/api/star-wars/'.length).replace(/\/+$/, '');
    await proxyStarWarsResource(res, resource, search);
    return;
  }

  sendJson(res, 404, { error: 'Page not found.' });
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    console.error('Unhandled request error:', error);
    sendJson(res, 500, { error: 'Internal server error.' });
  });
});

server.listen(PORT, () => {
  console.log(`Star Wars Databank app running at http://localhost:${PORT}`);
});
