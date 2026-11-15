const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const checked = new Set();
function localReference(source, url) {
  if (!url || /^(?:[a-z][a-z\d+.-]*:|#|\/\/)/i.test(url) || url.includes('${')) return;
  const clean = decodeURIComponent(url.split(/[?#]/)[0]);
  if (!clean) return;
  const target = path.resolve(root, path.dirname(source), clean);
  assert(
    target.startsWith(root + path.sep) || target === root,
    `${source}: reference outside project: ${url}`,
  );
  assert(fs.existsSync(target), `${source}: missing ${url}`);
  checked.add(target);
}
const html = read('index.html');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate IDs in index.html');
for (const m of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) localReference('index.html', m[1]);
for (const m of html.matchAll(/<script\b[^>]*src="\.\/([^\"]+)"/g)) {
  const file = m[1];
  new vm.Script(read(file), { filename: file });
  for (const item of read(file).matchAll(/["'`](\.\/assets\/[^"'`<>\s]+)["'`]/g))
    localReference('index.html', item[1]);
}
for (const m of html.matchAll(/href="\.\/([^\"]+\.css)"/g)) {
  const file = m[1];
  for (const item of read(file).matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"]*))\s*\)/g))
    localReference(file, item[1] ?? item[2] ?? item[3]);
}
const context = { window: {} };
for (const file of ['assets/site-content.js', 'assets/species-data.js'])
  vm.runInNewContext(read(file), context, { filename: file });
const { HACHIME_CONTENT: content, HACHIME_SPECIES: species } = context.window;
assert.equal(content.guide.length, 7);
assert.equal(content.notes.length, 5);
assert.equal(species.length, 31);
assert.equal(new Set(species.map((s) => s.id)).size, species.length);
for (const s of species) {
  assert(s.common && s.latin && s.origin);
  if (s.photo) assert(content.photos[s.photo], `Missing photo mapping: ${s.id}`);
}
for (const live of content.liveSpiders)
  assert(
    species.some((s) => s.id === live.atlasId),
    `Missing atlas target: ${live.name}`,
  );
function assets(value) {
  if (typeof value === 'string' && value.startsWith('./assets/'))
    localReference('index.html', value);
  else if (value && typeof value === 'object') Object.values(value).forEach(assets);
}
assets(content);
function markdown(dir = '') {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) markdown(file);
    else if (file.endsWith('.md')) {
      const text = read(file).replace(/```[\s\S]*?```/g, '');
      for (const m of text.matchAll(/\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) localReference(file, m[1]);
    }
  }
}
markdown();
console.log(
  `PASS static scripts, unique IDs, content mappings, local assets and documentation links (${checked.size} local targets)`,
);
