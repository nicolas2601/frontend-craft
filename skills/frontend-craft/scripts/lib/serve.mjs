// Tiny static server for built folders (dist/, out/, build/). Serves on 127.0.0.1, never port 3000.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.mp4': 'video/mp4',
  '.webm': 'video/webm', '.txt': 'text/plain', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json',
};

function resolveFile(root, urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const abs = path.resolve(root, `.${clean}`);
  if (!abs.startsWith(path.resolve(root))) return null;
  const tries = [abs, `${abs}.html`, path.join(abs, 'index.html')];
  return tries.find((p) => fs.existsSync(p) && fs.statSync(p).isFile()) ?? null;
}

/** Serve root; resolves to { url, close() }. */
export function serve(root, { port = 0 } = {}) {
  const server = http.createServer((req, res) => {
    const file = resolveFile(root, req.url ?? '/');
    if (!file) { res.writeHead(404).end('not found'); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      const { port: p } = server.address();
      resolve({ url: `http://127.0.0.1:${p}/`, close: () => new Promise((r) => server.close(r)) });
    });
  });
}
