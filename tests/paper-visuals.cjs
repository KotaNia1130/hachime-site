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
      const forwardShapes = {};
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
        const clip = await page.locator('#viewport:visible,#detailView:visible').boundingBox();
        const desk = await page.locator('#workspace').boundingBox();
        assert(
          clip.x > desk.x &&
            clip.y > desk.y &&
            clip.x + clip.width < desk.x + desk.width &&
            clip.y + clip.height < desk.y + desk.height,
          'all notebook corners sit inside the desk',
        );
        const margin = { x: desk.x, y: clip.y, width: clip.x - desk.x - 1, height: clip.height };
        const deskBefore = await page.screenshot({ clip: margin });
        const before = await page.screenshot({ clip });
        await page.locator(`.top-nav [data-go="${target}"]`).evaluate((e) => e.click());
        const overlay = await page.locator('.paper-turn').boundingBox();
        for (const key of ['x', 'y', 'width', 'height'])
          assert(
            Math.abs(overlay[key] - clip[key]) < 1,
            'turn follows notebook edges, not the browser viewport',
          );
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
        const animations = await page.evaluate(() =>
          turnRoot.getAnimations().map((animation) => ({
            direction: animation.effect.getTiming().direction,
            frames: animation.effect.getKeyframes(),
          })),
        );
        assert.equal(animations.length, 4, 'no separate return rotation');
        assert(
          animations.every((a) => a.direction === 'normal'),
          'both folds start at the bottom, never play backward in time',
        );
        for (const time of [150, 380, 610]) {
          await seek(time);
          const shape = await page.evaluate(() =>
            ['.turn-face', '.turn-back'].map((selector) => {
              const style = getComputedStyle(turnRoot.querySelector(selector));
              return style.clipPath.match(/-?[\d.]+(?:e[-+]?\d+)?/g).map(Number);
            }),
          );
          if (!backward) forwardShapes[time] = shape;
          else
            shape.forEach((points, index) => {
              assert.equal(points.length, forwardShapes[time][index].length);
              points.forEach((value, point) =>
                assert(
                  Math.abs(
                    value -
                      (point % 2 === 0
                        ? clip.width - forwardShapes[time][index][point]
                        : forwardShapes[time][index][point]),
                  ) < 0.05,
                  'return mirrors the fold horizontally, keeping the same vertical path',
                ),
              );
            });
        }
        await seek(150);
        const corner = await page.evaluate(() => {
          const root = turnRoot,
            face = root.querySelector('.turn-face');
          const points = getComputedStyle(root.querySelector('.turn-back'))
            .clipPath.match(/-?[\d.]+/g)
            .map(Number);
          const xs = points.filter((_, i) => i % 2 === 0);
          const ys = points.filter((_, i) => i % 2 === 1);
          return {
            opacity: getComputedStyle(face).opacity,
            transform: getComputedStyle(face).transform,
            width: Math.max(...xs) - Math.min(...xs),
            left: Math.min(...xs),
            right: Math.max(...xs),
            top: Math.min(...ys),
            bottom: Math.max(...ys),
            height: root.host.clientHeight,
            backText: root.querySelector('.turn-back').textContent,
            oldArticle: !!root.querySelector('.turn-face #detailView'),
            separateRotation: !!root.querySelector('.turn-leaf,.turn-stage'),
          };
        });
        assert.equal(corner.opacity, '1');
        assert.equal(corner.transform, 'none', 'front text is never mirrored or rotated');
        assert.equal(corner.backText, '');
        assert(!corner.separateRotation);
        assert(
          corner.width > 20 && corner.width < 120,
          'both directions first lift a small corner',
        );
        assert(
          corner.top >= corner.height - 120 && Math.abs(corner.bottom - corner.height) < 1,
          'opening and return both lift from the bottom edge',
        );
        assert(
          backward ? Math.abs(corner.left) < 1 : Math.abs(corner.right - clip.width) < 1,
          'return uses bottom-left; opening uses bottom-right',
        );
        if (backward)
          assert(corner.oldArticle, 'outgoing article stays readable on the returning paper');
        await seek(380);
        assert.deepEqual(
          await page.screenshot({ clip: margin }),
          deskBefore,
          'desk stays fixed beside the turning notebook',
        );
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
        await page.locator('[data-page="atlas"]').isVisible(),
        'latest destination is ready below the outgoing paper',
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
      'PASS pixel continuity, bottom corners in both directions and horizontally mirrored fold geometry, scrolled article and atlas rail, readable front, latest navigation and reduced-motion cancellation at desktop/mobile sizes',
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
