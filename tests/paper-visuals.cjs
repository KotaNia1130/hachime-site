// Compare the outgoing paper to the real page, including scrolled text and atlas rail.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.BASE_URL || 'http://127.0.0.1:8000/';
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox'],
  });
  try {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({
        viewport: { width, height: width === 1440 ? 1000 : 844 },
      });
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.route('https://**/*', (r) => r.abort());
      await page.addInitScript(() => {
        sessionStorage.setItem('hachime-welcome-seen-v2', '1');
        sessionStorage.setItem('hachime-entry-seen-v1', '1');
        const attach = Element.prototype.attachShadow;
        Element.prototype.attachShadow = function (options) {
          const root = attach.call(this, options);
          if (this.classList.contains('paper-turn')) window.turnRoot = root;
          return root;
        };
      });
      await page.goto(base);
      await page.evaluate(() => document.fonts.ready);
      await page.clock.install();
      await page.clock.pauseAt(new Date(Date.now() + 1000));
      const seek = (time) =>
        page.evaluate((time) => {
          turnRoot.getAnimations().forEach((animation) => {
            animation.pause();
            animation.currentTime = time;
          });
        }, time);
      for (const [target, backward] of [
        ['beginner', false],
        ['home', true],
        ['atlas', false],
        ['knowledge', false],
        ['home', true],
      ]) {
        if (backward)
          await page.locator('#detailScroll').evaluate((e) => {
            e.scrollTop = 400;
          });
        if (await page.locator('#workspace').evaluate((e) => e.classList.contains('is-atlas'))) {
          await page.locator('#bookMenu').evaluate((e) => {
            e.scrollTop = 200;
          });
        }
        const clip = await page.locator('#workspace').boundingBox();
        const before = await page.screenshot({ clip });
        await page.locator(`.top-nav [data-go="${target}"]`).evaluate((e) => e.click());
        await seek(0);
        const after = await page.screenshot({ clip });
        const difference = await page.evaluate(
          async ([first, second]) => {
            async function pixels(data) {
              const img = new Image();
              img.src = 'data:image/png;base64,' + data;
              await img.decode();
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              return ctx.getImageData(0, 0, img.width, img.height).data;
            }
            const a = await pixels(first),
              b = await pixels(second);
            let changed = 0;
            for (let i = 0; i < a.length; i += 4)
              if (Math.max(...[0, 1, 2].map((c) => Math.abs(a[i + c] - b[i + c]))) > 20) changed++;
            return changed / (a.length / 4);
          },
          [before.toString('base64'), after.toString('base64')],
        );
        assert(
          difference < 0.001,
          `${width} → ${target}: outgoing paper changes ${(difference * 100).toFixed(3)}% of pixels`,
        );
        await seek(150);
        const corner = await page.evaluate(() => {
          const root = turnRoot,
            face = root.querySelector('.turn-face');
          const points = getComputedStyle(root.querySelector('.turn-back'))
            .clipPath.match(/-?[\d.]+/g)
            .map(Number);
          const xs = points.filter((_, i) => i % 2 === 0),
            ys = points.filter((_, i) => i % 2 === 1);
          return {
            clip: getComputedStyle(face).clipPath,
            opacity: getComputedStyle(face).opacity,
            transform: getComputedStyle(face).transform,
            left: Math.min(...xs),
            right: Math.max(...xs),
            top: Math.min(...ys),
            bottom: Math.max(...ys),
            backText: root.querySelector('.turn-back').textContent,
            returning: !!root.querySelector('.turn-leaf'),
            leafFacing: root.querySelector('.turn-leaf')
              ? new DOMMatrixReadOnly(getComputedStyle(root.querySelector('.turn-leaf')).transform)
                  .m11
              : 1,
            incomingHome: !!root.querySelector('.turn-leaf #viewport'),
            oldArticle: !!root.querySelector('.turn-underlay #detailView'),
          };
        });
        assert.equal(corner.opacity, '1', 'front never flashes to a faded paper back');
        assert.equal(corner.transform, 'none', 'front text is never mirrored');
        assert.equal(corner.backText, '', 'blank paper back cannot show reversed text');
        assert(
          corner.right - corner.left > 20 && corner.right - corner.left < 120,
          'first phase only lifts a small corner',
        );
        assert(
          corner.right > width - 1,
          'opening lifts the right corner; returning paper gently flattens it',
        );
        if (backward) {
          assert(
            corner.returning && corner.incomingHome && corner.oldArticle,
            'homepage swings in over the intact article',
          );
          assert(corner.leafFacing > 0, 'incoming printed side faces the reader, never mirrored');
        }
        await seek(380);
        assert.notEqual(
          await page.evaluate(
            () => getComputedStyle(turnRoot.querySelector('.turn-face')).clipPath,
          ),
          corner.clip,
          'after the corner lift, the crease continues across the page',
        );
        if (backward) {
          await seek(760);
          assert(
            await page.evaluate(() => {
              const matrix = new DOMMatrixReadOnly(
                getComputedStyle(turnRoot.querySelector('.turn-leaf')).transform,
              );
              return matrix.isIdentity;
            }),
            'return finishes with the paper laid flat',
          );
        }
        await page.clock.runFor(900);
        assert.equal(await page.locator('.paper-turn').count(), 0);
      }
      // Repeated clicks cannot tear down the current paper; the latest choice wins.
      await page.locator('.top-nav [data-go="beginner"]').evaluate((e) => e.click());
      const current = await page.locator('.paper-turn').elementHandle();
      await page.locator('.top-nav [data-go="atlas"]').evaluate((e) => e.click());
      await page.locator('.top-nav [data-go="knowledge"]').evaluate((e) => e.click());
      assert(await current.evaluate((e) => e.isConnected));
      assert.equal(await page.locator('.paper-turn').count(), 1);
      await page.clock.runFor(1800);
      assert.equal(new URL(page.url()).hash, '#knowledge');
      assert.equal(await page.locator('.paper-turn').count(), 0);
      // A preference change removes the paper while preserving the latest navigation.
      await page.locator('.top-nav [data-go="home"]').evaluate((e) => e.click());
      await page.locator('.top-nav [data-go="atlas"]').evaluate((e) => e.click());
      await page.clock.runFor(32);
      assert(
        await page.evaluate(() => !!turnRoot.querySelector('.turn-leaf [data-page="atlas"]')),
        'incoming sheet follows the newest destination',
      );
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.clock.runFor(32);
      await page.locator('.paper-turn').waitFor({ state: 'detached', timeout: 1500 });
      assert.equal(new URL(page.url()).hash, '#atlas');
      assert.equal(await page.locator('.paper-turn').count(), 0);
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log(
      'PASS outgoing page pixel continuity, scrolled article and atlas rail, corner lift, readable front, latest navigation and reduced-motion cancellation at desktop/mobile sizes',
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
