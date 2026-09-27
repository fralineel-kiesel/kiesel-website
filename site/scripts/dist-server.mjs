// Mini-Server für den fertigen Build (dist/), unter demselben Pfad wie GitHub Pages
// (/kiesel-website/v2/). Für die Prüfskripte in diesem Ordner.
// Eigener Server statt "astro preview": Davon läuft pro Rechner nur einer, und ein schon
// laufender würde sonst stören. Port 0 = irgendein freier.
//   const { basis, schliessen } = await starteServer();
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const BASISPFAD = '/kiesel-website/v2/';
const TYPEN = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');

// gzip: wie GitHub Pages, damit Ladezeit-Messungen realistisch sind
export async function starteServer({ gzip = true } = {}) {
  if (!fs.existsSync(dist)) throw new Error('Kein Build gefunden: zuerst npm run build');
  const server = http.createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (!p.startsWith(BASISPFAD)) { res.writeHead(404).end(); return; }
    let datei = path.join(dist, p.slice(BASISPFAD.length));
    if (!datei.startsWith(dist)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(datei) && fs.statSync(datei).isDirectory()) datei = path.join(datei, 'index.html');
    if (!fs.existsSync(datei)) { res.writeHead(404).end(); return; }
    const typ = TYPEN[path.extname(datei)] ?? 'application/octet-stream';
    const packen = gzip && /text|javascript|svg/.test(typ) && /gzip/.test(req.headers['accept-encoding'] ?? '');
    res.writeHead(200, { 'content-type': typ, ...(packen ? { 'content-encoding': 'gzip' } : {}) });
    const strom = fs.createReadStream(datei);
    (packen ? strom.pipe(zlib.createGzip()) : strom).pipe(res);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return {
    basis: `http://127.0.0.1:${server.address().port}${BASISPFAD}`,
    schliessen: () => new Promise((r) => server.close(r)),
  };
}
