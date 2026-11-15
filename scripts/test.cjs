const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');
const { createPreviewServer } = require('./serve.cjs');
const root = path.resolve(__dirname, '..');
const suites = [
  'browser-smoke',
  'atlas-catalog',
  'brand-experience',
  'field-layout',
  'notebook-composition',
  'paper-interactions',
];
let server, child;
function run(file, env) {
  return new Promise((resolve, reject) => {
    child = spawn(process.execPath, [file], { cwd: root, env, stdio: 'inherit' });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      child = null;
      code === 0 ? resolve() : reject(new Error(`${file}: ${signal || code}`));
    });
  });
}
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => {
    child?.kill(signal);
    server?.close();
    process.exit(signal === 'SIGINT' ? 130 : 143);
  });
(async () => {
  const requested = process.argv.slice(2);
  const selected = requested.length ? requested : suites;
  for (const suite of selected)
    if (!suites.includes(suite)) throw new Error(`Unknown suite: ${suite}`);
  const browser =
    process.env.CHROMIUM_PATH ||
    (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : chromium.executablePath());
  if (!fs.existsSync(browser))
    throw new Error('Chromium not found. Run: npx playwright install chromium');
  await run('scripts/check.cjs', process.env);
  let base = process.env.BASE_URL;
  if (!base) {
    server = createPreviewServer();
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    base = `http://127.0.0.1:${server.address().port}/`;
  }
  for (const suite of selected) {
    console.log(`\nRunning ${suite}`);
    await run(`tests/${suite}.cjs`, { ...process.env, BASE_URL: base, CHROMIUM_PATH: browser });
  }
})()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => server?.close());
