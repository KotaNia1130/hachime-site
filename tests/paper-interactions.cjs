// Behaviour checks for visible movement, cancellation, left contents and disposable paper snapshots.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:8000/';
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{
 const errors=[];const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
 await page.addInitScript(()=>{
  sessionStorage.setItem('hachime-welcome-seen-v2','1');sessionStorage.setItem('hachime-entry-seen-v1','1');
  const request=window.requestAnimationFrame.bind(window),cancel=window.cancelAnimationFrame.bind(window);window.pendingFrames=new Set();
  window.requestAnimationFrame=callback=>{let id=request(time=>{pendingFrames.delete(id);callback(time)});pendingFrames.add(id);return id};
  window.cancelAnimationFrame=id=>{pendingFrames.delete(id);cancel(id)};
 });
 await page.goto(base+'#beginner');await page.clock.install();
 assert(await page.locator('#bookSidebar').evaluate(e=>Math.abs(e.getBoundingClientRect().left-document.querySelector('#detailView').getBoundingClientRect().left)<1));
 const left=await page.locator('#bookSidebar').boundingBox(),content=await page.locator('#detailScroll').boundingBox();assert(left.x+left.width<=content.x+1);
 const position=()=>page.locator('#detailScroll').evaluate(e=>e.scrollTop);
 const destination=()=>page.evaluate(()=>{const s=document.querySelector('#detailScroll'),h=document.querySelector('#guide-chapter-7');return Math.min(s.scrollHeight-s.clientHeight,s.scrollTop+h.getBoundingClientRect().top-s.getBoundingClientRect().top-28)});
 const end=await destination();await page.locator('#bookMenu [data-section="guide-chapter-7"]').click();await page.clock.runFor(80);
 const middle=await position();assert(middle>0&&middle<end-50,'chapter visibly travels through intermediate scroll positions');assert.equal(await page.locator('.paper-turn').count(),0,'chapter does not flip');
 await page.clock.runFor(550);assert(Math.abs(await position()-end)<3);assert.equal(await page.evaluate(()=>document.activeElement.id),'guide-chapter-7');
 await page.locator('#bookMenu [data-section="guide-chapter-1"]').click();await page.clock.runFor(80);
 await page.locator('#detailScroll').dispatchEvent('wheel',{deltaY:80});const stopped=await position();await page.clock.runFor(600);assert.equal(await position(),stopped,'manual scroll cancels animation');
 await page.locator('#bookMenu [data-section="guide-chapter-6"]').click();await page.clock.runFor(70);await page.locator('#bookMenu [data-section="guide-chapter-2"]').click();await page.clock.runFor(600);assert.equal(await page.locator('#bookMenu [aria-current]').getAttribute('data-section'),'guide-chapter-2');
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#bookMenu [data-section="guide-chapter-7"]').click();await page.clock.runFor(32);assert(Math.abs(await position()-end)<3);
 await page.locator('#detailBack').click();assert.equal(await page.locator('.paper-turn').count(),0);assert(await page.locator('#bookSidebar').isHidden());
 await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('.beginner-cover h2').click();await page.clock.runFor(80);
 assert.equal(await page.locator('.paper-turn').count(),1);assert.equal(await page.locator('.paper-turn').getAttribute('data-direction'),'forward');assert.equal(await page.locator('.paper-turn').getAttribute('aria-hidden'),'true');assert(await page.locator('.paper-turn').evaluate(e=>e.inert&&getComputedStyle(e).pointerEvents==='none'));
 assert.equal(await page.locator('.guide-chapter').count(),7,'snapshots never duplicate live DOM chapter targets');assert(await page.evaluate(()=>new Set([...document.querySelectorAll('[id]')].map(e=>e.id)).size===document.querySelectorAll('[id]').length));
 await page.screenshot({path:'/tmp/hachime-v023-turn-forward.png'});await page.clock.runFor(1000);assert.equal(await page.locator('.paper-turn').count(),0);
 await page.locator('#detailBack').click();await page.clock.runFor(180);assert.equal(await page.locator('.paper-turn').count(),1);assert.equal(await page.locator('.paper-turn').getAttribute('data-direction'),'backward');await page.screenshot({path:'/tmp/hachime-v023-turn-back.png'});await page.clock.runFor(1000);
 for(let i=0;i<6;i++){await page.locator('.top-nav [data-go="beginner"]').click();await page.clock.runFor(30);await page.locator('#detailBack').click();await page.clock.runFor(30);}
 await page.clock.runFor(1200);assert.equal(await page.locator('.paper-turn').count(),0);assert.equal(await page.evaluate(()=>pendingFrames.size),0,'destroyed flip renderers do not leak animation frames');
 await page.locator('.top-nav [data-go="beginner"]').click();await page.clock.runFor(30);await page.setViewportSize({width:390,height:844});await page.clock.runFor(150);assert.equal(await page.locator('.paper-turn').count(),0,'resize cancels old-size snapshot');
 const toggle=await page.locator('#bookMenuToggle').boundingBox();assert(toggle.x<25,'mobile chapter toggle is left');await page.locator('#bookMenuToggle').click();const menu=await page.locator('#bookMenu').boundingBox();assert(menu.x<25&&menu.x+menu.width<=390);await page.locator('#bookMenu [data-section="guide-chapter-5"]').click();await page.clock.runFor(600);assert.equal(await page.locator('#bookMenuToggle').getAttribute('aria-expanded'),'false');
 await page.locator('#detailBack').click();await page.clock.runFor(1000);await page.locator('#developmentNote').focus();await page.keyboard.press('Enter');assert(await page.locator('[data-page="development"]').isVisible());await page.clock.runFor(1000);
 await page.locator('.top-nav [data-go="home"]').click();await page.clock.runFor(1000);
 assert(await page.locator('#atlasNote').evaluate(e=>{const s=getComputedStyle(e,'::after');return s.backgroundColor!=='rgba(0, 0, 0, 0)'&&parseFloat(s.borderTopWidth)>0&&s.boxShadow!=='none'}));
 assert(await page.locator('.home-actions [data-jump]').evaluate(e=>getComputedStyle(e,'::before').content==='none'));
 assert(await page.locator('.updates-note').evaluate(e=>getComputedStyle(e).backgroundColor==='rgba(0, 0, 0, 0)'));
 const fallback=await browser.newPage();fallback.on('pageerror',e=>errors.push(e.message));await fallback.route('https://**/*',r=>r.abort());await fallback.addInitScript(()=>{Element.prototype.animate=undefined;});await fallback.goto(base+'#beginner');await fallback.locator('.top-nav [data-go="knowledge"]').click();assert(await fallback.locator('[data-page="knowledge"]').isVisible());assert.equal(await fallback.locator('.paper-turn').count(),0);await fallback.close();
 assert.deepEqual(errors,[]);console.log('PASS smooth intermediate motion, cancellation, rapid chapter changes, reduced motion, left contents, forward/back paper, frame cleanup, resize, large paper entrances, plain small links and unsupported animation fallback');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
