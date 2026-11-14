const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:Number(process.env.DEVICE_SCALE_FACTOR||1)});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 // Deliberately exercise the documented offline fallback independently of remote services.
 await page.route('https://**/*',r=>r.abort());
 await page.clock.install();
 await page.goto(process.env.BASE_URL||'http://127.0.0.1:8000/',{waitUntil:'load'});
 await page.locator('#fitBoard').click();
 await page.mouse.move(1,1);
 const count=k=>page.locator(`#${k}CoverCount`).innerText();
 const first=await count('spiders');
 await page.clock.runFor(5700);
 assert.notEqual(await count('spiders'),first);
 console.log('PASS carousel autoplay');
 await page.locator('.atlas-cover').hover();const hover=await count('spiders');
 await page.clock.runFor(5700);assert.equal(await count('spiders'),hover);
 console.log('PASS carousel hover pause');
 await page.mouse.move(1,1);await page.locator('[data-cover-next="spiders"]').focus();
 const focused=await count('spiders');await page.clock.runFor(5700);assert.equal(await count('spiders'),focused);
 await page.locator('[data-cover-next="spiders"]').click();assert.notEqual(await count('spiders'),focused);
 assert(await page.locator('#viewport').isVisible());
 console.log('PASS focus pause and manual carousel without navigation');
 await page.locator('#fitBoard').focus();await page.mouse.move(1,1);
 await page.emulateMedia({reducedMotion:'reduce'});
 const reduced=await count('spiders');await page.clock.runFor(5700);assert.equal(await count('spiders'),reduced);
 console.log('PASS reduced-motion pause');
 const before=await count('enclosures');await page.locator('[data-cover-next="enclosures"]').click();assert.notEqual(await count('enclosures'),before);
 await page.locator('#spidersCoverImage').evaluate(img=>new Promise((resolve,reject)=>{if(img.complete&&img.naturalWidth)resolve();else{img.onload=resolve;img.onerror=reject;}}));
 assert.match(await page.locator('#spidersCoverImage').getAttribute('src'),/assets\/spider-/);
 console.log('PASS enclosure manual carousel and image fallback');
 await page.locator('#zoomIn').click();await page.locator('#zoomIn').click();
 const h=await page.locator('.atlas-cover h2').boundingBox();assert(h);
 const transform=await page.locator('#board').evaluate(e=>[e.style.left,e.style.top].join(','));
 await page.mouse.move(h.x+h.width/2,h.y+h.height/2);await page.mouse.down();await page.mouse.move(h.x+h.width/2+80,h.y+h.height/2+45,{steps:8});await page.mouse.up();await page.clock.runFor(40);
 assert.notEqual(await page.locator('#board').evaluate(e=>[e.style.left,e.style.top].join(',')),transform);
 assert(await page.locator('#viewport').isVisible());assert.equal(await page.evaluate(()=>getSelection().toString()),'');
 console.log('PASS drag moves board without opening detail or selecting text');
 await page.locator('#fitBoard').click();
 await page.locator('.atlas-cover h2').click();assert(await page.locator('[data-page="atlas"]').isVisible());
 for(let i=0;i<3;i++){await page.locator(`[data-species="${i}"]`).click();assert.equal(await page.locator(`[data-species="${i}"]`).getAttribute('aria-pressed'),'true');assert((await page.locator('#speciesPanel h3').innerText()).length>0);}
 console.log('PASS note click and three atlas tabs');
 await page.locator('nav [data-go="lab"]').click();
 const paused=await count('enclosures');await page.clock.runFor(5700);assert.equal(await count('enclosures'),paused);
 for(const size of ['mini','standard','large','xl']){await page.locator(`[data-size="${size}"]`).click();assert.equal(await page.locator(`[data-size="${size}"]`).getAttribute('aria-pressed'),'true');}
 await page.goBack();assert(await page.locator('[data-page="atlas"]').isVisible());
 console.log('PASS four sizes and browser back');
 await page.locator('#detailBack').click();assert(await page.locator('#viewport').isVisible());

 await page.locator('#fitBoard').click();
 for(const key of ['Enter',' ']){
   const old=await count('live');await page.locator('[data-cover-next="live"]').focus();await page.keyboard.press(key);
   assert.notEqual(await count('live'),old);assert(await page.locator('#viewport').isVisible());
 }
 await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('#fitBoard').focus();await page.mouse.move(1,1);
 const auto=await count('live');await page.clock.runFor(5700);assert.notEqual(await count('live'),auto);
 await page.locator('.live-cover').hover();const held=await count('live');await page.clock.runFor(5700);assert.equal(await count('live'),held);

 await page.mouse.move(1,1);await page.locator('[data-cover-next="live"]').focus();
 const focusLive=await count('live');await page.clock.runFor(5700);assert.equal(await count('live'),focusLive);
 await page.locator('#fitBoard').focus();await page.emulateMedia({reducedMotion:'reduce'});
 const reducedLive=await count('live');await page.clock.runFor(5700);assert.equal(await count('live'),reducedLive);
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.locator('.live-cover h2').click();assert(await page.locator('[data-page="live"]').isVisible());

 const detailLive=await count('live');await page.clock.runFor(5700);assert.equal(await count('live'),detailLive);
 assert.equal(await page.locator('.live-card').count(),3);
 assert.equal(await page.locator('.live-status').allTextContents().then(a=>a.every(x=>x==='示意 / 規劃中')),true);
 await page.locator('nav [data-go="lab"]').click();
 await page.locator('#addToCart').click();assert.equal(await page.locator('#cartCount').innerText(),'1');
 await page.locator('[data-qty="plus"]').click();assert.equal(await page.locator('#cartCount').innerText(),'2');
 await page.locator('#clearCart').click();assert.equal(await page.locator('#cartCount').innerText(),'0');await page.locator('#cartClose').click();
 await page.locator('#showAllPrices').click();assert(await page.locator('#pricePopover').isVisible());await page.locator('#closePrices').click();
 await page.locator('nav [data-go="knowledge"]').click();await page.locator('#faqSearch').fill('zzzz-no-match');assert.match(await page.locator('#faqResults').innerText(),/找不到/);await page.locator('#faqSearch').fill('');assert(await page.locator('#faqResults details').count()>0);
 await page.locator('nav [data-go="beginner"]').click();await page.locator('#guideNext').click();assert.match(await page.locator('#guideStepText').innerText(),/第 2/);await page.locator('#guidePrev').click();
 await page.locator('nav [data-go="home"]').click();
 for(let i=0;i<7;i++)await page.locator('#zoomIn').click();
 assert.equal(await page.locator('#board').evaluate(e=>getComputedStyle(e).transform),'none');
 assert.equal(await page.locator('.atlas-cover').evaluate(e=>getComputedStyle(e).transform),'none');
 assert.equal(await page.locator('#zoomText').innerText(),'140%');
 await page.screenshot({path:'/tmp/hachime-desktop-140.png'});
 await page.locator('#fitBoard').click();await page.screenshot({path:'/tmp/hachime-desktop-overview.png'});
 console.log('PASS live carousel keyboard/autoplay/hover, live detail, cart, prices, FAQ, guide, untransformed text at 140%');
 await page.setViewportSize({width:390,height:844});await page.clock.runFor(150);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));

 await page.locator('nav [data-go="live"]').click();await page.screenshot({path:'/tmp/hachime-mobile-live.png'});
 assert(await page.locator('.live-card').first().isVisible());
 const overflow=await page.locator('#detailScroll').evaluate(e=>e.scrollWidth>e.clientWidth);assert.equal(overflow,false);
 for(const route of ['home','beginner','atlas','knowledge','lab','about','live']){await page.locator(`nav [data-go="${route}"]`).click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}

 await page.goto((process.env.BASE_URL||'http://127.0.0.1:8000/')+'#live',{waitUntil:'load'});
 assert(await page.locator('[data-page="live"]').isVisible());
 // Compare real rendered card bounds in mobile detail, not just body overflow.
 assert(await page.locator('.live-card').evaluateAll(cards=>cards.every(c=>{const r=c.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;})));
 await page.locator('nav [data-go="home"]').click();await page.locator('#resetBoard').click();
 // Pan the mobile notebook down to the sixth note with the same wheel path users use.
 await page.mouse.move(180,420);await page.mouse.wheel(0,2500);await page.clock.runFor(100);
 await page.screenshot({path:'/tmp/hachime-mobile-note.png'});
 await page.locator('.live-cover h2').click();assert(await page.locator('[data-page="live"]').isVisible());
 assert.deepEqual(errors,[]);
 console.log('PASS return home, mobile no document horizontal overflow, no JS exceptions');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
