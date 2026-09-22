const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT) || 3000;
const host = '0.0.0.0';
const distDirectory = path.join(__dirname, 'dist');
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const sendFile = (response, filePath) => {
  const extension = path.extname(filePath).toLowerCase();
  response.writeHead(200, {
    'Content-Type': mimeTypes[extension] || 'application/octet-stream',
  });
  fs.createReadStream(filePath).pipe(response);
};

const server = http.createServer((request, response) => {
  const requestPath = decodeURIComponent(request.url.split('?')[0]);
  const requestedFile = path.resolve(distDirectory, `.${requestPath}`);
  const isInsideDist = requestedFile.startsWith(`${distDirectory}${path.sep}`);
  const filePath = isInsideDist && fs.existsSync(requestedFile) && fs.statSync(requestedFile).isFile()
    ? requestedFile
    : path.join(distDirectory, 'index.html');

  if (!fs.existsSync(filePath)) {
    response.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Frontend build not found. Run npm run build:prod first.');
    return;
  }

  sendFile(response, filePath);
});

server.listen(port, host, () => {
  console.log(`Frontend listening on http://${host}:${port}`);
});
