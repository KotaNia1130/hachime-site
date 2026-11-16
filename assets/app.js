(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const money = (n) => 'NT$' + n.toLocaleString('zh-TW');

  const { guide, faq, sizes, tiers, prices, photos, liveSpiders, notes } = window.HACHIME_CONTENT;

  const species = window.HACHIME_SPECIES;

  // Local, licensed reference photos. None represents HACHIME inventory or breeding records.

  function photoCredit(art) {
    return `<a href="${art.source}" target="_blank" rel="noopener noreferrer">${art.credit} · 來源</a> · <a href="${art.license === 'CC0' ? 'https://creativecommons.org/publicdomain/zero/1.0/' : 'https://creativecommons.org/licenses/by/4.0/'}" target="_blank" rel="noopener noreferrer">授權</a> · 裁切顯示`;
  }
  for (const item of liveSpiders) {
    item.art = photos[item.photo];
    if (item.art) item.image = item.art.image;
  }
  function liveCredit(item) {
    return item.art
      ? '物種參考照<br>' + photoCredit(item.art)
      : 'OpenMoji 一般蜘蛛示意，非' + item.name + '外觀';
  }
  $('#liveCards').innerHTML = liveSpiders
    .map(
      (item) =>
        `<article class="live-card"><figure><img src="${item.image}" alt="${item.name}${item.art ? '物種參考照，非八目個體' : '一般蜘蛛示意，非物種照片'}"><figcaption>${liveCredit(item)}</figcaption></figure><span class="live-status">尚未開放販售</span><h3>${item.name}</h3><p>${item.short}</p><dl><dt>物種名稱</dt><dd>${item.species}</dd><dt>學名</dt><dd>${item.latin}</dd></dl><p class="cross-links"><a href="#${item.atlasId ? 'atlas/' + item.atlasId : 'beginner/2'}" data-go="${item.atlasId ? 'atlas/' + item.atlasId : 'beginner/2'}">${item.atlasId ? '認識這個物種' : '先了解物種確認方式'} →</a></p></article>`,
    )
    .join('');
  let liveIndex = 0,
    livePaused = false;
  const carousel = $('.shop-carousel');
  function renderLive() {
    const item = liveSpiders[liveIndex];
    $('#liveCoverImage').src = item.image;
    $('#liveCoverImage').alt =
      item.name + (item.art ? '物種參考照，非八目個體' : '一般蜘蛛示意，非物種照片');
    $('#liveCoverCredit').innerHTML = liveCredit(item);
    $('#liveCoverName').textContent = item.name;
    $('#liveCoverDesc').textContent = item.short;
    $('#liveCoverCount').textContent = String(liveIndex + 1).padStart(2, '0') + ' — 03';
  }
  $('[data-cover-next="live"]').addEventListener('click', () => {
    liveIndex = (liveIndex + 1) % liveSpiders.length;
    renderLive();
  });
  $('#livePause').addEventListener('click', () => {
    livePaused = !livePaused;
    $('#livePause').setAttribute('aria-pressed', String(livePaused));
    $('#livePause').textContent = livePaused ? '恢復自動輪播' : '暫停自動輪播';
  });
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  setInterval(() => {
    if (
      livePaused ||
      document.hidden ||
      prefersReducedMotion.matches ||
      !carousel.getClientRects().length ||
      carousel.matches(':hover') ||
      carousel.contains(document.activeElement)
    )
      return;
    liveIndex = (liveIndex + 1) % liveSpiders.length;
    renderLive();
  }, 5600);
  renderLive();

  // All guide chapters are part of one document; progress remains per chapter.
  let completed = [];
  try {
    const stored = JSON.parse(localStorage.getItem('hachime-guide-v015') || '[]');
    if (Array.isArray(stored))
      completed = [
        ...new Set(stored.filter((n) => Number.isInteger(n) && n >= 0 && n < guide.length)),
      ];
  } catch {}
  function saveProgress() {
    try {
      localStorage.setItem('hachime-guide-v015', JSON.stringify(completed));
    } catch {}
  }
  function updateProgress() {
    $('#guideProgress').textContent = `已讀 ${completed.length} / ${guide.length} 章`;
    $$('[data-guide-read]').forEach(
      (input) => (input.checked = completed.includes(+input.dataset.guideRead)),
    );
  }
  $('#guideContent').innerHTML =
    guide
      .map(
        (a, i) =>
          `<section class="guide-chapter" aria-labelledby="guide-chapter-${i + 1}"><h3 id="guide-chapter-${i + 1}">${a.title}</h3><p>${a.desc}</p><ul>${a.bullets.map((t) => `<li>${t}</li>`).join('')}</ul><label class="guide-check"><input data-guide-read="${i}" type="checkbox"> ${a.check}</label><p class="cross-links"><a data-go="${a.route}" href="#${a.route}">${a.link} ↗</a></p></section>`,
      )
      .join('') + '<p class="chapter-caption">閱讀進度會保留在這個瀏覽器。</p>';
  $('#guideContent').addEventListener('change', (e) => {
    const input = e.target.closest('[data-guide-read]');
    if (!input) return;
    const index = +input.dataset.guideRead;
    completed = completed.filter((n) => n !== index);
    if (input.checked) completed.push(index);
    saveProgress();
    updateProgress();
  });
  $('#resetProgress').addEventListener('click', () => {
    completed = [];
    saveProgress();
    updateProgress();
  });
  updateProgress();

  // Species
  let speciesIndex = 0;

  function drawSpecies() {
    const s = species[speciesIndex],
      art = photos[s.photo];
    const photo = art
      ? `<figure><img src="${art.image}" alt="${s.name}物種參考照片，非八目個體" width="960" height="720"><figcaption>物種參考照<br>${photoCredit(art)}</figcaption></figure>`
      : `<figure class="species-photo-pending"><p>照片待補</p></figure>`;
    $('#speciesPanel').innerHTML =
      `<header class="species-heading">${s.status ? `<span class="species-status">${s.status}</span>` : ''}<h3 id="speciesTitle" tabindex="-1">${s.common}</h3><p class="species-latin"><span class="species-field-label">學名</span>${s.latin ? `<em>${s.latin}</em><small>${s.authority}</small>` : '學名待確認'}</p>${s.name && s.name !== s.common ? `<p class="species-common"><span class="species-field-label">中文名</span><strong>${s.name}</strong></p>` : ''}</header><div class="species-profile">${photo}<div class="species-info">${s.summary ? `<p>${s.summary}</p>` : ''}<dl class="species-grid"><dt>分布</dt><dd>${s.origin}</dd></dl>${s.sources.length ? `<details class="species-sources"><summary>參考資料</summary>${s.sources.map((source) => `<a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.label} ↗</a>`).join('')}</details>` : ''}</div></div>`;
    const img = $('#speciesPanel img');
    img?.addEventListener('error', () => {
      if (img.dataset.fallback) return;
      img.dataset.fallback = '1';
      img.src = art.fallback;
      img.alt = s.name + '概念示意插畫，非物種鑑別照片';
      $('#speciesPanel figcaption').textContent = '照片無法載入，改用示意插畫';
    });
  }
  drawSpecies();

  $('#noteArticle').innerHTML = notes
    .map(
      (note) =>
        `<section class="care-chapter" aria-labelledby="care-${note.id}"><h3 id="care-${note.id}">${note.title}</h3><p>${note.body}</p><p class="cross-links"><a href="#beginner/${note.step}" data-go="beginner/${note.step}">閱讀相關的新手指南 →</a></p></section>`,
    )
    .join('');
  // FAQ filtering
  let activeTopic = '全部';
  const topics = ['全部', '餵食', '脫皮', '環境', '行為', '緊急'];
  function drawTopics() {
    $('#faqTopics').innerHTML = topics
      .map(
        (t) =>
          `<button type="button" class="${t === activeTopic ? 'active' : ''}" data-topic="${t}" aria-pressed="${t === activeTopic}">${t}</button>`,
      )
      .join('');
    $$('[data-topic]').forEach((b) =>
      b.addEventListener('click', () => {
        activeTopic = b.dataset.topic;
        drawTopics();
        drawFaq();
      }),
    );
  }
  function drawFaq() {
    const q = $('#faqSearch').value.trim().toLowerCase();
    const filtered = faq.filter(
      (f) =>
        (activeTopic === '全部' || f.cat === activeTopic) &&
        `${f.q} ${f.a} ${f.cat} ${f.tags}`.toLowerCase().includes(q),
    );
    $('#faqResults').innerHTML = filtered.length
      ? filtered
          .map((f) => `<details><summary><span>${f.q}</span></summary><p>${f.a}</p></details>`)
          .join('')
      : '<p class="no-results">找不到相符的問題。可以改用較短的關鍵字搜尋。</p>';
  }
  $('#faqSearch').addEventListener('input', drawFaq);
  drawTopics();
  drawFaq();

  // Product and cart state (session-only, no checkout)
  let selectedSize = 'standard',
    selectedTier = 'plus';
  const cart = new Map();
  function drawProduct() {
    $('#sizeChoices').innerHTML = Object.entries(sizes)
      .map(
        ([id, s]) =>
          `<button type="button" class="${selectedSize === id ? 'active' : ''}" data-size="${id}" aria-pressed="${selectedSize === id}"><b>${s.label}</b><small>${s.dims}</small></button>`,
      )
      .join('');
    $('#tierChoices').innerHTML = Object.entries(tiers)
      .map(
        ([id, t]) =>
          `<button type="button" class="${selectedTier === id ? 'active' : ''}" data-tier="${id}" aria-pressed="${selectedTier === id}">${t.label}</button>`,
      )
      .join('');
    const size = sizes[selectedSize],
      tier = tiers[selectedTier];
    $('#selectedName').textContent = `A1 ${size.label} ${tier.label}`;
    $('#selectedPrice').textContent = money(prices[selectedSize][selectedTier]);
    $('#selectedSize').textContent = size.dims;
    $('#selectedTier').textContent = `${tier.label} ／ ${tier.zh}`;
    $('#selectedDescription').textContent = tier.desc;
    $('#selectedFeatures').innerHTML = tier.features.map((x) => `<li>${x}</li>`).join('');
    $('#selectedIllustration').src = `./assets/enclosure-${selectedTier}.svg`;
    $('#selectedIllustration').alt = `A1 ${tier.label} 飼養盒規劃示意圖，非商品實拍`;
    $$('[data-size]').forEach((b) =>
      b.addEventListener('click', () => {
        selectedSize = b.dataset.size;
        drawProduct();
      }),
    );
    $$('[data-tier]').forEach((b) =>
      b.addEventListener('click', () => {
        selectedTier = b.dataset.tier;
        drawProduct();
      }),
    );
  }
  drawProduct();
  const priceTable = `<table><thead><tr><th>尺寸</th><th>CORE</th><th>PLUS</th><th>PRO</th></tr></thead><tbody>${Object.entries(
    sizes,
  )
    .map(
      ([id, s]) =>
        `<tr><td>${s.label}<small>${s.dims}</small></td>${Object.keys(tiers)
          .map((t) => `<td>${money(prices[id][t])}</td>`)
          .join('')}</tr>`,
    )
    .join('')}</tbody></table>`;
  $('#priceTable').innerHTML = priceTable;
  $('#showAllPrices').addEventListener('click', () => {
    $('#pricePopover').hidden = false;
  });
  $('#closePrices').addEventListener('click', () => {
    $('#pricePopover').hidden = true;
  });

  function redrawCart() {
    const items = [...cart.entries()],
      count = items.reduce((n, [, qty]) => n + qty, 0),
      total = items.reduce((n, [key, qty]) => {
        const [s, t] = key.split('/');
        return n + prices[s][t] * qty;
      }, 0);
    $('#cartCount').textContent = count;
    $('#cartTotal').textContent = money(total);
    $('#cartItems').innerHTML = items.length
      ? items
          .map(([key, qty]) => {
            const [s, t] = key.split('/');
            return `<div class="cart-line" data-key="${key}"><div><strong>A1 ${sizes[s].label} ${tiers[t].label}</strong><small>${sizes[s].dims} ／ 設計中</small></div><span>${money(prices[s][t] * qty)}</span><div class="qty-controls"><button type="button" data-qty="minus" data-key="${key}" aria-label="減少數量">−</button><span>${qty}</span><button type="button" data-qty="plus" data-key="${key}" aria-label="增加數量">＋</button><button type="button" class="remove-line" data-qty="remove" data-key="${key}">移除</button></div></div>`;
          })
          .join('')
      : '<div class="cart-empty">購物車是空的。<br>可以到 A1 系列看看尺寸與款式。</div>';
  }
  const drawer = $('#cartDrawer'),
    backdrop = $('#drawerBackdrop');
  let lastFocused = null;
  function openCart() {
    lastFocused = document.activeElement;
    backdrop.hidden = false;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open');
    $('#cartClose').focus();
  }
  function closeCart() {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    backdrop.hidden = true;
    document.body.classList.remove('drawer-open');
    if (lastFocused?.focus) lastFocused.focus();
  }
  $('#cartOpen').addEventListener('click', openCart);
  $('#cartClose').addEventListener('click', closeCart);
  backdrop.addEventListener('click', closeCart);
  $('#addToCart').addEventListener('click', () => {
    const k = `${selectedSize}/${selectedTier}`;
    cart.set(k, (cart.get(k) || 0) + 1);
    redrawCart();
    openCart();
  });
  $('#clearCart').addEventListener('click', () => {
    cart.clear();
    redrawCart();
  });
  $('#cartItems').addEventListener('click', (e) => {
    const b = e.target.closest('[data-qty]');
    if (!b) return;
    const k = b.dataset.key,
      old = cart.get(k) || 0;
    if (b.dataset.qty === 'plus') cart.set(k, old + 1);
    if (b.dataset.qty === 'minus') {
      if (old <= 1) cart.delete(k);
      else cart.set(k, old - 1);
    }
    if (b.dataset.qty === 'remove') cart.delete(k);
    redrawCart();
  });
  drawer.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const nodes = $$('button:not([disabled]),a[href],input', drawer);
    const first = nodes[0],
      last = nodes.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
  redrawCart();

  // V0.3: overview is a draggable canvas; each category is a readable document.
  const viewport = $('#viewport'),
    board = $('#board'),
    detailView = $('#detailView'),
    detailScroll = $('#detailScroll');
  const names = {
    home: '首頁',
    beginner: '新手起步',
    atlas: '跳蛛圖鑑',
    knowledge: '飼養筆記',
    shop: '活體與用品',
    about: '關於八目',
    breeding: '繁殖日記',
    development: '開發札記',
  };
  let scale = 1,
    panX = 0,
    panY = 0,
    drag = null,
    raf = 0,
    lastRoute = 'home',
    overviewFocus = null;
  function closeBookMenu() {
    $('#bookSidebar').classList.remove('is-open');
    $('#bookMenuToggle').setAttribute('aria-expanded', 'false');
  }
  let hintDismissed = false;
  try {
    hintDismissed = localStorage.getItem('hachime-board-hint-seen') === '1';
  } catch (e) {}
  if (window.matchMedia('(max-width:600px)').matches) hintDismissed = true;
  function updateHint() {
    const showing = !detailView.hidden;
    $('#viewportHint').hidden = showing;
    $('#viewportHint').classList.toggle('is-dismissed', hintDismissed);
    $('#hintReopen').hidden = showing;
    $('.start-note').classList.toggle('is-dismissed', hintDismissed);
  }
  function collapseHint() {
    if (hintDismissed) return;
    hintDismissed = true;
    try {
      localStorage.setItem('hachime-board-hint-seen', '1');
    } catch (e) {}
    updateHint();
  }
  function reopenHint() {
    if (window.hachimeWelcome) {
      window.hachimeWelcome.open();
      return;
    }
    hintDismissed = false;
    updateHint();
  }
  const boardSize = () => ({ w: board.offsetWidth, h: board.offsetHeight });
  const bounds = () => ({ w: viewport.clientWidth, h: viewport.clientHeight });
  const mobile = () => window.matchMedia('(max-width:600px)').matches;
  function clamp() {
    const { w, h } = bounds(),
      { w: bw, h: bh } = boardSize();
    const sx = bw * scale,
      sy = bh * scale,
      edge = mobile() ? 4 : 24;
    panX = sx <= w ? (w - sx) / 2 : Math.max(w - sx - edge, Math.min(edge, panX));
    panY = sy <= h ? (h - sy) / 2 : Math.max(h - sy - edge, Math.min(edge, panY));
  }
  // CSS zoom performs layout at target size instead of scaling a cached text layer.
  // Offsets are in zoomed CSS coordinates; pan/zoom math remains in viewport pixels.
  function apply() {
    clamp();
    board.style.zoom = scale;
    board.style.left = `${Math.round(panX / scale)}px`;
    board.style.top = `${Math.round(panY / scale)}px`;
    $('#zoomText').textContent = Math.round(scale * 100) + '%';
  }
  function fitScale() {
    const { w, h } = bounds(),
      b = boardSize();
    return Math.min(
      mobile() ? 1 : 0.93,
      (w - (mobile() ? 15 : 110)) / b.w,
      (h - (mobile() ? 40 : 95)) / b.h,
    );
  }
  function zoom(newScale, x, y) {
    const { w, h } = bounds();
    x ??= w / 2;
    y ??= h / 2;
    const worldX = (x - panX) / scale,
      worldY = (y - panY) / scale;
    scale = Math.max(Math.min(0.25, fitScale()), Math.min(1.4, newScale));
    panX = x - worldX * scale;
    panY = y - worldY * scale;
    apply();
  }
  function centerBoard() {
    const { w, h } = bounds(),
      b = boardSize();
    scale = fitScale();
    panX = (w - b.w * scale) / 2;
    panY = (h - b.h * scale) / 2;
    apply();
  }
  function focusHome() {
    const { w, h } = bounds();
    if (mobile()) {
      scale = Math.min(1, w / 420);
      panX = (w - 420 * scale) / 2;
      panY = 0;
    } else {
      scale = Math.min(1, (w - 32) / 1680, (h - 48) / 760);
      panX = (w - 1680 * scale) / 2;
      panY = 12;
    }
    apply();
  }
  function resolveRoute(value) {
    const [path, query = ''] = value.split('?');
    value = path;
    const section = new URLSearchParams(query).get('section') || '';
    value =
      {
        'home/cover': 'home',
        'home/species': 'atlas',
        'home/care': 'knowledge',
        'home/studio': 'shop',
        'home/about': 'about',
        'atlas/maratus-volans': 'atlas/maratus',
        'atlas/simaetha-thoracica': 'atlas/simaetha',
      }[value] || value;
    if (value === 'lab') value = 'shop/equipment';
    if (value === 'live') value = 'shop/live';
    const [page, sub, ...extra] = value.split('/');
    if (!Object.hasOwn(names, page) || extra.length) return { page: 'home', sub: '', id: 'home' };
    const valid =
      !sub ||
      (page === 'shop' && ['live', 'equipment'].includes(sub)) ||
      (page === 'beginner' && /^[1-7]$/.test(sub)) ||
      (page === 'knowledge' && notes.some((n) => n.id === sub)) ||
      (page === 'atlas' && species.some((n) => n.id === sub));
    return {
      page,
      sub: valid ? sub || '' : '',
      section,
      id: (valid ? value : page) + (section ? '?section=' + encodeURIComponent(section) : ''),
    };
  }
  function currentRoute() {
    try {
      return decodeURIComponent((location.hash || '#home').slice(1));
    } catch {
      return 'home';
    }
  }
  let chapterHeadings = [],
    chapterFrame = 0,
    navigationFrame = 0;
  function updateChapterMarker() {
    if (detailView.hidden || !chapterHeadings.length) return;
    const edge = detailScroll.getBoundingClientRect().top + 65;
    let active = chapterHeadings[0];
    for (const heading of chapterHeadings) {
      if (heading.getBoundingClientRect().top <= edge) active = heading;
    }
    if (
      detailScroll.scrollHeight > detailScroll.clientHeight + 2 &&
      detailScroll.scrollTop + detailScroll.clientHeight >= detailScroll.scrollHeight - 2
    )
      active = chapterHeadings.at(-1);
    $$('#bookMenu [data-section]').forEach((link) => {
      if (link.dataset.section === active?.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function buildChapterMenu(route) {
    const page = $(`.detail-page[data-page="${route.page}"]`);
    const isAtlas = route.page === 'atlas';
    $('#workspace').classList.toggle('is-atlas', isAtlas);
    $('#bookMenuToggle').innerHTML =
      (isAtlas ? '物種' : '章節') + ' <span aria-hidden="true">☰</span>';
    $('#bookMenu').setAttribute('aria-label', isAtlas ? '跳蛛物種目錄' : '本篇章節');
    $('#bookSidebar').setAttribute('aria-label', isAtlas ? '跳蛛物種目錄' : '本篇章節目錄');
    if (isAtlas) {
      chapterHeadings = [];
      $('#bookMenu').innerHTML =
        '<p>跳蛛目錄<small>' +
        species.length +
        ' 筆</small></p>' +
        ['台灣觀察', '寵物與飼養圈', '特色與國際物種']
          .map(
            (group) =>
              `<section class="species-menu-group"><h4>${group}</h4>${species
                .filter((s) => s.group === group)
                .map(
                  (s) =>
                    `<a href="#atlas/${s.id}" data-go="atlas/${s.id}" data-species-id="${s.id}" ${s.id === species[speciesIndex].id ? 'aria-current="page"' : ''}><strong>${s.common}</strong><small>${s.latin || '學名待確認'}</small></a>`,
                )
                .join('')}</section>`,
          )
          .join('');
      $('#bookSidebar').hidden = false;
      return;
    }
    const selector =
      route.page === 'beginner'
        ? '.guide-chapter h3'
        : route.page === 'knowledge'
          ? '.care-chapter h3,#care-faq'
          : 'h2,h3';
    chapterHeadings = $$(selector, page).filter((h) => h.getClientRects().length);
    const allHeadings = $$('h2,h3', page);
    chapterHeadings.forEach((heading) => {
      heading.id ||= `${route.page}-section-${allHeadings.indexOf(heading) + 1}`;
      heading.tabIndex = -1;
    });
    const title = document.createElement('p');
    title.textContent = '本篇章節';
    $('#bookMenu').replaceChildren(title);
    for (const heading of chapterHeadings) {
      const link = document.createElement('a');
      link.textContent = heading.textContent;
      link.dataset.section = heading.id;
      const target =
        route.page === 'beginner'
          ? 'beginner/' + heading.id.replace('guide-chapter-', '')
          : route.page === 'knowledge' && heading.id !== 'care-faq'
            ? 'knowledge/' + heading.id.replace('care-', '')
            : route.page +
              (route.sub ? '/' + route.sub : '') +
              '?section=' +
              encodeURIComponent(heading.id);
      link.href = '#' + target;
      link.dataset.go = target;
      $('#bookMenu').append(link);
    }
    $('#bookSidebar').hidden = !chapterHeadings.length;
  }
  detailScroll.addEventListener(
    'scroll',
    () => {
      if (chapterFrame) return;
      chapterFrame = requestAnimationFrame(() => {
        chapterFrame = 0;
        updateChapterMarker();
      });
    },
    { passive: true },
  );
  let scrollFrame = 0;
  function stopReadingScroll() {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = 0;
  }
  function scrollToChapter(target, animated) {
    stopReadingScroll();
    const start = detailScroll.scrollTop;
    const end = Math.max(
      0,
      Math.min(
        detailScroll.scrollHeight - detailScroll.clientHeight,
        target
          ? start +
              target.getBoundingClientRect().top -
              detailScroll.getBoundingClientRect().top -
              28
          : 0,
      ),
    );
    const finish = () => {
      scrollFrame = 0;
      (target || detailScroll).focus({ preventScroll: true });
      updateChapterMarker();
    };
    if (
      !animated ||
      matchMedia('(prefers-reduced-motion: reduce)').matches ||
      Math.abs(end - start) < 2
    ) {
      detailScroll.scrollTop = end;
      finish();
      return;
    }
    const duration = Math.min(520, Math.max(280, Math.abs(end - start) * 0.12)),
      began = performance.now();
    function step(now) {
      const progress = Math.min(1, (now - began) / duration),
        eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      detailScroll.scrollTop = start + (end - start) * eased;
      if (progress < 1) scrollFrame = requestAnimationFrame(step);
      else finish();
    }
    scrollFrame = requestAnimationFrame(step);
  }
  // Manual scrolling immediately takes over from a chapter animation.
  for (const event of ['wheel', 'touchstart', 'pointerdown'])
    detailScroll.addEventListener(event, stopReadingScroll, { passive: true });
  detailScroll.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key))
      stopReadingScroll();
  });
  window.addEventListener('resize', stopReadingScroll);
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', stopReadingScroll);
  function navigate(value, updateUrl = true) {
    const route = resolveRoute(value),
      id = route.page,
      previousPage = resolveRoute(lastRoute).page;
    const changedPage = previousPage !== id;
    const snapshot =
      updateUrl && changedPage
        ? window.hachimePaperTurn?.capture(detailView.hidden ? viewport : detailView)
        : null;
    stopReadingScroll();
    if (updateUrl) collapseHint();
    const showing = id !== 'home',
      wasDetail = !detailView.hidden;
    if (!wasDetail && showing) overviewFocus = document.activeElement;
    detailView.hidden = !showing;
    viewport.hidden = showing;
    $('#canvasControls').hidden = showing;
    $('#bottomMark').hidden = showing;
    closeBookMenu();
    updateHint();
    $$('.detail-page').forEach((el) => (el.hidden = el.dataset.page !== id));
    $$('.shop-panel').forEach((el) => (el.hidden = el.dataset.shop !== (route.sub || 'overview')));

    if (id === 'atlas') {
      speciesIndex = Math.max(
        0,
        species.findIndex((n) => n.id === (route.sub || 'regius')),
      );
      drawSpecies();
    }
    cancelAnimationFrame(navigationFrame);
    if (showing) {
      $('#currentPageName').textContent = names[id];
      buildChapterMenu(route);
      const targetId =
        route.section ||
        (id === 'beginner' && route.sub
          ? 'guide-chapter-' + route.sub
          : id === 'knowledge' && route.sub
            ? 'care-' + route.sub
            : '');
      navigationFrame = requestAnimationFrame(() => {
        const target = chapterHeadings.find((h) => h.id === targetId);
        scrollToChapter(target, updateUrl && !changedPage && Boolean(target));
      });
    } else
      requestAnimationFrame(() => {
        apply();
        if (wasDetail && overviewFocus?.isConnected) overviewFocus.focus({ preventScroll: true });
      });
    $$('[data-go]:not([data-section])').forEach((el) => {
      const active = el.closest('.top-nav')
        ? el.dataset.go === (id === 'development' ? 'shop' : id)
        : el.dataset.go === (id === 'atlas' ? 'atlas/' + species[speciesIndex].id : route.id);
      el.classList.toggle('active', active);
      if (active) el.setAttribute('aria-current', 'page');
      else el.removeAttribute('aria-current');
    });
    if (updateUrl && location.hash !== `#${route.id}`) history.pushState(null, '', `#${route.id}`);
    $('#pricePopover').hidden = true;
    if (!showing) $('#workspace').classList.remove('is-atlas');
    window.hachimePaperTurn?.play(snapshot, !showing);
    lastRoute = route.id;
  }
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-go],[data-jump]');
    if (!link || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const id = link.dataset.go || link.dataset.jump;
    navigate(id);
    if (id === 'home') focusHome();
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#bookSidebar')) closeBookMenu();
  });
  $('#bookMenuToggle').addEventListener('click', () => {
    const open = $('#bookSidebar').classList.toggle('is-open');
    $('#bookMenuToggle').setAttribute('aria-expanded', String(open));
  });
  $('#detailBack').addEventListener('click', () => navigate('home'));
  window.addEventListener('hashchange', () => navigate(currentRoute(), false));
  window.addEventListener('popstate', () => navigate(currentRoute(), false));
  $('#resetBoard').addEventListener('click', () => {
    collapseHint();
    focusHome();
  });
  $('#zoomIn').addEventListener('click', () => {
    collapseHint();
    zoom(scale + 0.12);
  });
  $('#zoomOut').addEventListener('click', () => {
    collapseHint();
    zoom(scale - 0.12);
  });
  $('#fitBoard').addEventListener('click', () => {
    collapseHint();
    centerBoard();
  });
  $('#hintClose').addEventListener('click', collapseHint);
  $('#hintReopen').addEventListener('click', reopenHint);
  // The notebook is a draggable UI, not a selectable document.
  // Prevent native selection and image dragging without affecting details.
  viewport.addEventListener('selectstart', (e) => e.preventDefault());
  viewport.addEventListener('dragstart', (e) => e.preventDefault());
  viewport.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || !e.isPrimary) return;
    if (e.target.closest('button,a,input,textarea,select,summary')) return;
    // Prevent text highlighting from the very first pixel of a drag.
    // Cover-note taps still open on pointerup; keyboard activation remains supported.
    e.preventDefault();
    drag = {
      pointer: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      startX: panX,
      startY: panY,
      moved: false,
      openId: e.target.closest('[data-open]')?.dataset.open || null,
    };
    viewport.setPointerCapture(e.pointerId);
  });
  viewport.addEventListener('pointermove', (e) => {
    if (!drag || drag.pointer !== e.pointerId) return;
    const dx = e.clientX - drag.x,
      dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 7) {
      drag.moved = true;
      viewport.classList.add('dragging');
      collapseHint();
    }
    if (!drag.moved) return;
    panX = drag.startX + dx;
    panY = drag.startY + dy;
    if (!raf)
      raf = requestAnimationFrame(() => {
        raf = 0;
        apply();
      });
  });
  function endDrag(e) {
    if (!drag || drag.pointer !== e.pointerId) return;
    const openId = !drag.moved ? drag.openId : null;
    drag = null;
    viewport.classList.remove('dragging');
    if (viewport.hasPointerCapture(e.pointerId)) viewport.releasePointerCapture(e.pointerId);
    if (openId) navigate(openId);
  }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', (e) => {
    if (drag) {
      drag = null;
      viewport.classList.remove('dragging');
    }
  });
  $$('#board [data-open]').forEach((n) =>
    n.addEventListener('keydown', (e) => {
      if (e.target !== n) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigate(n.dataset.open);
      }
    }),
  );
  viewport.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      collapseHint();
      const r = viewport.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey)
        zoom(scale * (e.deltaY > 0 ? 0.93 : 1.07), e.clientX - r.left, e.clientY - r.top);
      else {
        panX -= e.deltaX;
        panY -= e.deltaY;
        apply();
      }
    },
    { passive: false },
  );
  document.addEventListener('keydown', (e) => {
    if (document.querySelector('#welcomeDialog[open]')) return;
    if (e.key === 'Escape' && $('#bookSidebar').classList.contains('is-open')) {
      closeBookMenu();
      $('#bookMenuToggle').focus();
      return;
    }
    if (e.key === 'Escape') {
      $('#pricePopover').hidden = true;
      if (drawer.classList.contains('open')) {
        closeCart();
        return;
      }
      if (!detailView.hidden) {
        navigate('home');
        return;
      }
    }
    if (
      !detailView.hidden ||
      drawer.classList.contains('open') ||
      e.target.closest('input,button,a,textarea,select')
    )
      return;
    const step = e.shiftKey ? 130 : 70;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      collapseHint();
      panY += step;
      apply();
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      collapseHint();
      panY -= step;
      apply();
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      collapseHint();
      panX += step;
      apply();
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      collapseHint();
      panX -= step;
      apply();
    }
  });
  let resizeTimer,
    lastMobile = mobile();
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const changed = lastMobile !== mobile();
      lastMobile = mobile();
      if (changed) focusHome();
      else if (detailView.hidden) apply();
    }, 90);
  });
  requestAnimationFrame(() => {
    focusHome();
    navigate(currentRoute(), false);
  });
})();
