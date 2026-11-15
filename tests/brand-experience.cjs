const {chromium}=require('playwright');const assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:8000/';
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{
 const errors=[];
 async function fresh(options={}){const c=await b.newContext(options);const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());return {c,p};}
 const {c,p}=await fresh({viewport:{width:1440,height:1000}});
 await p.goto(base,{waitUntil:'domcontentloaded'});await p.locator('#welcomeDialog').waitFor({state:'visible'});assert.equal(await p.locator('.brand-entry').count(),0);
 await p.locator('#welcomeExplore').click();assert(await p.locator('#welcomeDialog').isHidden());
 await p.reload({waitUntil:'load'});assert(await p.locator('#welcomeDialog').isHidden());assert.equal(await p.locator('.brand-entry').count(),0);
 assert.equal(await p.evaluate(()=>sessionStorage.getItem('hachime-welcome-seen-v2')),'1');
 const newTab=await c.newPage();newTab.on('pageerror',e=>errors.push(e.message));await newTab.route('https://**/*',r=>r.abort());await newTab.goto(base);await newTab.locator('#welcomeDialog').waitFor({state:'visible'});await newTab.close();
 await p.locator('#hintReopen').click();assert(await p.locator('#welcomeDialog').isVisible());await p.keyboard.press('Escape');assert(await p.locator('#welcomeDialog').isHidden());assert(await p.locator('#viewport').isVisible());
 await p.locator('#hintReopen').click();await p.locator('#welcomeStart').click();assert(await p.locator('[data-page="beginner"]').isVisible());
 await p.locator('.top-nav [data-go="home"]').click();
 for(const width of [320,390,600,768,1024,1440]){
  await p.setViewportSize({width,height:900});
  for(const id of ['home','beginnerNote','breedingNote','developmentNote','updatesNote']){
   await p.locator(`.board-index [data-focus-note="${id}"]`).click();
   const box=await p.locator('#'+id).boundingBox();assert(box&&box.x>=-1&&box.x+box.width<=width+1,`note bounds ${width} ${id}`);
  }
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 }
 await p.locator('[data-focus-note="developmentNote"]').click();await p.locator('.development-copy a').click();assert(await p.locator('[data-page="development"]').isVisible());
 assert(await p.locator('#detailScroll').evaluate(e=>e.scrollWidth<=e.clientWidth));await p.reload();assert(await p.locator('[data-page="development"]').isVisible());await p.locator('.development-article [data-go="shop/equipment"]').click();assert(await p.locator('[data-shop="equipment"]').isVisible());
 await p.locator('.top-nav [data-go="home"]').click();await p.locator('[data-focus-note="updatesNote"]').click();await p.locator('.update-list a').first().click();assert(await p.locator('[data-page="beginner"]').isVisible());
 await p.locator('.top-nav [data-go="home"]').click();await p.locator('[data-focus-note="breedingNote"]').click();await p.locator('#breedingNote').focus();await p.keyboard.press('Enter');assert(await p.locator('[data-page="breeding"]').isVisible());assert.match(await p.locator('.journal-empty').innerText(),/尚無紀錄/);await p.reload();assert(await p.locator('[data-page="breeding"]').isVisible());await p.locator('.breeding-article [data-go="knowledge/observation"]').click();assert(await p.locator('#noteArticle').isVisible());
 await p.locator('.top-nav [data-go="about"]').click();assert.equal(await p.locator('[data-page="about"] .social-windows button:disabled').count(),3);assert.equal(await p.locator('.photo-sources a').count(),6);
 await p.goto(base+'#atlas/regius');assert.match(await p.locator('.species-common').innerText(),/佛跳/);assert.match(await p.locator('#speciesPanel em').innerText(),/Phidippus regius/);await p.waitForFunction(()=>document.querySelector('#speciesPanel img').naturalWidth>0);assert.match(await p.locator('#speciesPanel img').getAttribute('src'),/photos\/regius.jpg/);
 await c.close();console.log('PASS first visit, revisit, guide reopening/Escape/start, new content routes and responsive note bounds');
 const missingPhoto=await fresh();await missingPhoto.p.route('**/assets/photos/hyllus.jpg',r=>r.abort());await missingPhoto.p.goto(base+'#atlas/hyllus');await missingPhoto.p.waitForFunction(()=>document.querySelector('#speciesPanel img').dataset.fallback==='1'&&document.querySelector('#speciesPanel img').naturalWidth>0);assert.match(await missingPhoto.p.locator('#speciesPanel figcaption').innerText(),/示意/);await missingPhoto.c.close();console.log('PASS independent-tab welcome, breeding keyboard/deep link, disabled social slots, photo credits and failed-photo fallback');
 const reduced=await fresh({reducedMotion:'reduce'});await reduced.p.goto(base);assert.equal(await reduced.p.locator('.brand-entry').count(),0);await reduced.p.locator('#welcomeDialog').waitFor({state:'visible'});await reduced.c.close();
 const direct=await fresh();await direct.p.goto(base+'#shop/equipment');assert.equal(await direct.p.locator('.brand-entry').count(),0);assert(await direct.p.locator('#welcomeDialog').isHidden());await direct.c.close();
 const blocked=await fresh();await blocked.p.addInitScript(()=>{for(const name of ['localStorage','sessionStorage'])Object.defineProperty(window,name,{get(){throw new Error('Storage unavailable');}});});await blocked.p.goto(base);await blocked.p.locator('#welcomeDialog').waitFor({state:'visible'});await blocked.p.locator('#welcomeExplore').click();assert(await blocked.p.locator('#viewport').isVisible());await blocked.c.close();
 const delayed=await fresh();await delayed.p.route('**/assets/*.svg',async r=>{await new Promise(resolve=>setTimeout(resolve,1800));await r.abort();});await delayed.p.goto(base,{waitUntil:'domcontentloaded'});await delayed.p.locator('#welcomeDialog').waitFor({state:'visible',timeout:1700});assert.equal(await delayed.p.locator('.brand-entry').count(),0);await delayed.p.locator('#welcomeStart').click();assert(await delayed.p.locator('[data-page="beginner"]').isVisible());await delayed.c.close();
 const nojs=await fresh({javaScriptEnabled:false});await nojs.p.goto(base);assert(await nojs.p.locator('#homeTitle').isVisible());assert.equal(await nojs.p.locator('.brand-entry').count(),0);await nojs.c.close();
 assert.deepEqual(errors,[]);console.log('PASS reduced motion, deep-link bypass, unavailable storage, delayed/failed artwork and JS-disabled visible homepage');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
