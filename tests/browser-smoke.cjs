// Run against the static server. External requests are blocked to exercise fallbacks.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:8000/';
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try {
  const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:Number(process.env.DEVICE_SCALE_FACTOR||1)});
  await page.addInitScript(()=>sessionStorage.setItem('hachime-welcome-seen-v2','1'));
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://**/*',r=>r.abort());await page.clock.install();
  const go=async route=>{await page.goto(base+'#'+route,{waitUntil:'load'});await page.clock.runFor(50);};
  const visible=async selector=>assert(await page.locator(selector).isVisible(),selector);
  const count=()=>page.locator('#liveCoverCount').innerText();
  await go('home');
  assert.equal(await page.locator('#board .cover-note').count(),6);
  const first=await page.locator('.beginner-cover').boundingBox();assert(first.x>=0&&first.y>=78&&first.x+first.width<=1440);
  await page.locator('.beginner-cover h2').click();await visible('[data-page="beginner"]');
  for(let i=1;i<=7;i++){
   assert.match(await page.locator('#guideStepText').innerText(),new RegExp(`第 ${i} / 7`));
   await page.locator('#guideRead').check();
   if(i<7)await page.locator('#guideNext').click();
  }
  assert(await page.locator('#guideNext').isDisabled());assert.match(await page.locator('#guideProgress').innerText(),/7 \/ 7/);
  await page.reload();await page.clock.runFor(50);assert.match(await page.locator('#guideProgress').innerText(),/7 \/ 7/);
  await page.locator('#resetProgress').click();assert.match(await page.locator('#guideProgress').innerText(),/0 \/ 7/);
  await go('beginner/3');await page.locator('#guideContent [data-go="shop/equipment"]').click();await visible('[data-shop="equipment"]');
  await page.goBack();await visible('[data-page="beginner"]');assert.match(await page.locator('#guideStepText').innerText(),/第 3/);
  console.log('PASS seven-step journey, persistence/reset, contextual link and browser back');
  await go('atlas');
  for(let i=0;i<3;i++){
   await page.locator(`[data-species="${i}"]`).click();assert.equal(await page.locator(`[data-species="${i}"]`).getAttribute('aria-pressed'),'true');
   assert.match(await page.locator('#speciesPanel h3').innerText(),/跳蛛/);
   await page.waitForFunction(()=>document.querySelector('#speciesPanel img').src.includes('/assets/')&&document.querySelector('#speciesPanel img').naturalWidth>0);
  }
  await page.reload();await page.clock.runFor(50);assert.match(await page.locator('#speciesPanel h3').innerText(),/老虎狗/);
  await go('knowledge');
  for(const id of ['environment','feeding','molting','observation','help']){
   await page.locator(`#noteTopics [data-go="knowledge/${id}"]`).click();await visible('#noteArticle h3');
   assert.equal(await page.locator(`#noteTopics [data-go="knowledge/${id}"]`).getAttribute('aria-current'),'page');
  }
  await page.locator('[data-topic="全部"]').click();await page.locator('#faqSearch').fill('zzzz');assert.match(await page.locator('#faqResults').innerText(),/找不到/);
  await page.locator('#faqSearch').fill('');assert.equal(await page.locator('#faqResults details').count(),8);
  await page.locator('#faqResults summary').first().click();assert(await page.locator('#faqResults details').first().getAttribute('open')!==null);
  console.log('PASS three species/deep links/local photos and five care topics/FAQ');
  await go('shop');await visible('[data-shop="overview"]');
  await page.locator('.entry-card[data-go="shop/live"]').click();await visible('[data-shop="live"]');assert.equal(await page.locator('.live-card').count(),3);
  await page.locator('.shop-carousel').scrollIntoViewIfNeeded();await page.mouse.move(1,1);await page.locator('#detailScroll').focus();
  const initial=await count();await page.clock.runFor(5700);assert.notEqual(await count(),initial);
  await page.locator('.shop-carousel').hover();const hover=await count();await page.clock.runFor(5700);assert.equal(await count(),hover);
  await page.mouse.move(1,1);await page.locator('[data-cover-next="live"]').focus();const focus=await count();await page.clock.runFor(5700);assert.equal(await count(),focus);
  await page.keyboard.press('Enter');assert.notEqual(await count(),focus);await visible('[data-shop="live"]');
  await page.locator('#livePause').click();await page.mouse.move(1,1);await page.locator('#detailScroll').focus();const pause=await count();await page.clock.runFor(5700);assert.equal(await count(),pause);
  await page.locator('#livePause').click();await page.mouse.move(1,1);await page.locator('#detailScroll').focus();await page.emulateMedia({reducedMotion:'reduce'});const reduced=await count();await page.clock.runFor(5700);assert.equal(await count(),reduced);await page.emulateMedia({reducedMotion:'no-preference'});
  await page.locator('.live-card [data-go="atlas/regius"]').click();await visible('[data-page="atlas"]');const hidden=await count();await page.clock.runFor(5700);assert.equal(await count(),hidden);
  console.log('PASS shop carousel autoplay, hover/focus/manual/pause/reduced-motion/hidden-panel and species link');
  for(const [alias,panel] of [['lab','equipment'],['live','live'],['shop/equipment','equipment'],['shop/live','live']]){await go(alias);await visible(`[data-shop="${panel}"]`);assert.equal(await page.locator('.top-nav [data-go="shop"]').getAttribute('aria-current'),'page');}
  await go('shop/equipment');
  for(const size of ['mini','standard','large','xl']){await page.locator(`[data-size="${size}"]`).click();assert.equal(await page.locator(`[data-size="${size}"]`).getAttribute('aria-pressed'),'true');}
  for(const tier of ['core','plus','pro']){await page.locator(`[data-tier="${tier}"]`).click();assert.match(await page.locator('#selectedName').innerText(),new RegExp(tier.toUpperCase()));}
  await page.locator('#showAllPrices').click();await visible('#pricePopover');await page.locator('#closePrices').click();assert(await page.locator('#pricePopover').isHidden());
  await page.locator('#addToCart').click();assert.equal(await page.locator('#cartCount').innerText(),'1');await page.locator('[data-qty="plus"]').click();assert.equal(await page.locator('#cartCount').innerText(),'2');await page.locator('[data-qty="minus"]').click();assert.equal(await page.locator('#cartCount').innerText(),'1');await page.locator('#clearCart').click();assert.equal(await page.locator('#cartCount').innerText(),'0');await page.keyboard.press('Escape');assert.equal(await page.locator('#cartDrawer').getAttribute('aria-hidden'),'true');
  console.log('PASS legacy aliases, sizes/tiers, price table and cart');
  await go('home');await page.locator('#zoomIn').click();
  const before=await page.locator('#board').evaluate(e=>[e.style.left,e.style.top].join(','));const h=await page.locator('.beginner-cover h2').boundingBox();
  await page.mouse.move(h.x+30,h.y+20);await page.mouse.down();await page.mouse.move(h.x-50,h.y-30,{steps:8});await page.mouse.up();await page.clock.runFor(50);
  assert.notEqual(await page.locator('#board').evaluate(e=>[e.style.left,e.style.top].join(',')),before);await visible('#viewport');assert.equal(await page.evaluate(()=>getSelection().toString()),'');
  for(let i=0;i<5;i++)await page.locator('#zoomIn').click();assert.equal(await page.locator('#zoomText').innerText(),'140%');assert.equal(await page.locator('#board').evaluate(e=>getComputedStyle(e).transform),'none');
  await page.locator('#fitBoard').click();await page.screenshot({path:'/tmp/hachime-v015-overview.png'});
  await page.locator('[data-leaf-link="studio"]').click();await page.locator('.shop-cover [data-go="shop/equipment"]').click();await visible('[data-shop="equipment"]');
  await go('%E0%A4%A');await visible('#viewport');await go('shop/unknown');await visible('[data-shop="overview"]');
  console.log('PASS drag, zoom, six-card layout, direct shop entry and invalid routes');
  for(const width of [320,390,600,768,1024,1440]){
   await page.setViewportSize({width,height:900});await page.clock.runFor(150);
   for(const route of ['home','beginner/3','atlas','knowledge','shop','shop/live','shop/equipment','about','breeding']){
    await go(route);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`body overflow ${width} ${route}`);
    if(route!=='home')assert(await page.locator('#detailScroll').evaluate(e=>e.scrollWidth<=e.clientWidth),`detail overflow ${width} ${route}`);
    assert(await page.locator('#cartOpen').evaluate(e=>e.getBoundingClientRect().right<=innerWidth),`header overflow ${width}`);
   }
  }
  await page.setViewportSize({width:390,height:844});await go('home');await page.locator('#resetBoard').click();await page.screenshot({path:'/tmp/hachime-v015-mobile.png'});
  await page.locator('.home-actions [data-jump="beginner"]').click();await visible('[data-page="beginner"]');await page.screenshot({path:'/tmp/hachime-v015-mobile-guide.png'});
  await go('shop/live');await page.locator('.shop-carousel').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/hachime-v015-mobile-live.png'});
  assert.deepEqual(errors,[]);console.log('PASS responsive 320–1440px, mobile entry and no JavaScript exceptions');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
