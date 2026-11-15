const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ttf': 'font/ttf',
  '.md': 'text/plain; charset=utf-8',
};
function createPreviewServer() {
  return http.createServer((req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405);
      return res.end();
    }
    let file;
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (pathname.split('/').some((part) => part.startsWith('.') || part === 'node_modules'))
        throw new Error('Private path');
      file = path.resolve(root, '.' + pathname);
      if (file !== root && !file.startsWith(root + path.sep)) throw new Error('Outside root');
      if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      const real = fs.realpathSync(file);
      if (!real.startsWith(root + path.sep) || !fs.statSync(real).isFile())
        throw new Error('Not a public file');
      file = real;
    } catch {
      res.writeHead(404);
      return res.end('Not found');
    }
    res.writeHead(200, {
      'Content-Type': types[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file)
      .on('error', () => res.destroy())
      .pipe(res);
  });
}
module.exports = { createPreviewServer };
if (require.main === module) {
  const server = createPreviewServer();
  server.on('error', (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
  server.listen(Number(process.env.PORT || 8000), process.env.HOST || '127.0.0.1', () =>
    console.log(`HACHIME: http://${process.env.HOST || '127.0.0.1'}:${server.address().port}/`),
  );
}
