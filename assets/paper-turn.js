/* One bottom-corner fold: right to open, left to return. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 760;
  let active = null;
  let sharedSheet;
  let styles;

  function prepareStyles() {
    if (styles !== undefined) return;
    styles = [...document.styleSheets]
      .map((sheet) => {
        try {
          return [...sheet.cssRules]
            .map((rule) =>
              rule.cssText.replace(
                /url\((['"]?)(.*?)\1\)/g,
                (_, quote, url) => `url("${new URL(url, sheet.href || location.href).href}")`,
              ),
            )
            .join('\n');
        } catch {
          return '';
        }
      })
      .join('\n');
    if ('adoptedStyleSheets' in ShadowRoot.prototype) {
      sharedSheet = new CSSStyleSheet();
      sharedSheet.replaceSync(styles);
    }
  }

  function finish() {
    if (!active) return;
    const previous = active;
    active = null;
    clearTimeout(previous.timer);
    previous.animations.forEach((animation) => animation.cancel());
    previous.host.remove();
  }

  // Navigation stays immediate underneath. Keep an in-flight paper intact so
  // repeated clicks reveal the latest destination without restarting the fold.
  function capture() {
    if (active || reduced.matches || !Element.prototype.animate || document.hidden) return null;
    return copySurface();
  }

  function copySurface() {
    const surface = document.querySelector('#workspace');
    const copy = surface.cloneNode(true);
    copy.style.setProperty(
      '--book-rail',
      getComputedStyle(surface).getPropertyValue('--book-rail'),
    );
    const originals = [surface, ...surface.querySelectorAll('*')];
    const clones = [copy, ...copy.querySelectorAll('*')];
    const scrolls = originals.flatMap((node, index) =>
      node.scrollTop || node.scrollLeft
        ? [{ node: clones[index], top: node.scrollTop, left: node.scrollLeft }]
        : [],
    );
    copy.querySelectorAll('[hidden],script,.paper-turn').forEach((node) => node.remove());
    copy.querySelectorAll('[aria-live]').forEach((node) => node.removeAttribute('aria-live'));
    return { copy, scrolls };
  }

  // Clip the rectangle at x+y=crease, then reflect only the blank paper back.
  // Five vertices per frame keeps polygon interpolation stable at the page edges.
  function geometry(width, height, distance, backward) {
    const crease = width + height - distance;
    const rectangle = [
      [0, 0],
      [width, 0],
      [width, height],
      [0, height],
    ];
    function half(peeled) {
      const points = [];
      for (let i = 0; i < 4; i++) {
        const a = rectangle[i],
          b = rectangle[(i + 1) % 4];
        const da = a[0] + a[1] - crease,
          db = b[0] + b[1] - crease;
        if (peeled ? da >= 0 : da <= 0) points.push(a);
        if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
          const t = da / (da - db);
          points.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
        }
      }
      if (!points.length) points.push([0, 0]);
      while (points.length < 5) points.push(points.at(-1));
      return points;
    }
    function polygon(points) {
      return `polygon(${points.map(([x, y]) => `${backward ? width - x : x}px ${y}px`).join(',')})`;
    }
    return {
      face: polygon(half(false)),
      back: polygon(half(true).map(([x, y]) => [crease - y, crease - x])),
    };
  }

  function play(snapshot, backward = false) {
    // Keep the outgoing paper intact while navigation updates the page below it.
    if (active) return;
    if (!snapshot || reduced.matches) return;
    const surface = document.querySelector('#workspace');
    const { width, height } = surface.getBoundingClientRect();
    const host = document.createElement('div');
    host.className = 'paper-turn';
    host.setAttribute('aria-hidden', 'true');
    host.dataset.direction = backward ? 'backward' : 'forward';
    host.inert = true;
    const shadow = host.attachShadow({ mode: 'closed' });
    const state = { host, animations: [], timer: 0 };
    active = state;
    try {
      prepareStyles();
      if (sharedSheet) shadow.adoptedStyleSheets = [sharedSheet];
      const style = document.createElement('style');
      style.textContent =
        (sharedSheet ? '' : styles) +
        `
        :host { display:block; pointer-events:none }
        *,*::before,*::after { pointer-events:none!important; animation:none!important; transition:none!important }
        .turn-face,.turn-back,.turn-shadow { position:absolute; inset:0; will-change:clip-path }
        .turn-face { overflow:hidden; z-index:1 }
        .turn-face > .main-area { inset:0; width:100%; height:100%; margin:0 }
        .turn-shadow { z-index:2 }
        .turn-back { z-index:3 }
        .turn-back { background:linear-gradient(${backward ? 225 : 135}deg,#faf7e9 0%,#f1ead6 45%,#d5cbb2 100%); }
        .turn-back::after { content:''; position:absolute; inset:0; opacity:.45;
          background:repeating-linear-gradient(0deg,transparent 0 27px,#b4ae9730 27px 28px) }
        .turn-crease { position:absolute; left:0; top:0; width:${Math.hypot(width, height) * 2}px; height:70px;
          transform-origin:0 0; will-change:transform;
          background:linear-gradient(0deg,#85785c66 0%,#fcfaefcc 24%,#fffdf444 48%,transparent 100%) }
        .turn-shadow { background:#3b382e; opacity:.16; transform:translate(${backward ? 5 : -5}px,5px) }
      `;
      const face = document.createElement('div');
      face.className = 'turn-face';
      face.append(snapshot.copy);
      const back = document.createElement('div');
      back.className = 'turn-back';
      const crease = document.createElement('div');
      crease.className = 'turn-crease';
      back.append(crease);
      const shade = document.createElement('div');
      shade.className = 'turn-shadow';
      shadow.append(style);
      shadow.append(face, shade, back);
      surface.append(host);
      function restoreScroll(paper) {
        paper.scrolls.forEach(({ node, top, left }) => {
          node.scrollTop = top;
          node.scrollLeft = left;
        });
      }
      restoreScroll(snapshot);
      const faceFrames = [],
        backFrames = [],
        creaseFrames = [];
      const lift = Math.min(110, width * 0.19, height * 0.16);
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        // Both directions share these frames, including the small corner lift.
        const p = Math.max(0, (t - 0.24) / 0.76);
        const distance =
          t <= 0.24
            ? lift * Math.sin(((t / 0.24) * Math.PI) / 2)
            : lift + (width + height - lift + 2) * (p * p * (3 - 2 * p));
        const shape = geometry(width, height, distance, backward);
        faceFrames.push({ clipPath: shape.face, offset: t });
        backFrames.push({ clipPath: shape.back, offset: t });
        const x = width - distance / 2,
          y = height - distance / 2;
        creaseFrames.push({
          transform: `translate(${backward ? width - x : x}px,${y}px) rotate(${backward ? 45 : -45}deg) translate(-50%,-100%)`,
          offset: t,
        });
      }
      face.style.clipPath = faceFrames[0].clipPath;
      back.style.clipPath = shade.style.clipPath = backFrames[0].clipPath;
      const options = {
        duration,
        fill: 'both',
        easing: 'linear',
      };
      state.animations = [
        face.animate(faceFrames, options),
        back.animate(backFrames, options),
        shade.animate(backFrames, options),
        crease.animate(creaseFrames, options),
      ];
      state.animations[0].onfinish = () => {
        if (active === state) finish();
      };
      // Also clean up when a browser suspends animation completion events.
      state.timer = setTimeout(() => {
        if (active === state) finish();
      }, duration + 100);
    } catch {
      finish();
    }
  }

  window.addEventListener('resize', finish);
  reduced.addEventListener('change', () => {
    if (reduced.matches) finish();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) finish();
  });
  window.hachimePaperTurn = { capture, play, stop: finish };
  const warm = () =>
    window.requestIdleCallback
      ? requestIdleCallback(prepareStyles, { timeout: 1500 })
      : setTimeout(prepareStyles, 60);
  if (document.readyState === 'complete') warm();
  else window.addEventListener('load', warm, { once: true });
})();
