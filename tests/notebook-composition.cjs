// The book is paged, while articles keep their existing routes and reading layout.
const {chromium}=require('playwright');const assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:8000/';
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
 await page.addInitScript(()=>{sessionStorage.setItem('hachime-welcome-seen-v2','1');sessionStorage.setItem('hachime-entry-seen-v1','1');});
 async function choose(key){if(await page.locator('#bookMenuToggle').isVisible())await page.locator('#bookMenuToggle').click();await page.locator(`[data-leaf-link="${key}"]`).click();await page.waitForTimeout(50);}
 const keys=['cover','species','care','studio','about'];
 for(const [width,height] of [[320,740],[390,844],[600,900],[700,900],[768,900],[961,768],[1024,900],[1366,768],[1440,1000]]){
  await page.setViewportSize({width,height});await page.goto(base);await page.evaluate(()=>document.fonts.ready);
  if(width<=960){
   const toggle=page.locator('#bookMenuToggle');await toggle.focus();await page.keyboard.press('Enter');assert.equal(await toggle.getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert(await toggle.evaluate(e=>document.activeElement===e));
   await toggle.click();await page.locator('#zoomIn').click();assert.equal(await toggle.getAttribute('aria-expanded'),'false','outside action closes the menu');
  }else assert(await page.locator('#bookMenu').isVisible());
  for(const key of keys){
   await choose(key);assert.equal(await page.locator('.notebook-leaf:not([hidden])').count(),1);assert.equal(await page.locator('#board').getAttribute('data-active-leaf'),key);
   assert.equal(await page.locator('[data-leaf-link][aria-current]').count(),1);assert.equal(await page.locator('[data-leaf-link][aria-current]').getAttribute('data-leaf-link'),key);
   assert.equal(await page.evaluate(()=>document.activeElement.id),'leaf-'+key);assert.equal(new URL(page.url()).hash,'#home/'+key);
   assert.equal(await page.locator('#leafPrevious').isDisabled(),key==='cover');assert.equal(await page.locator('#leafNext').isDisabled(),key==='about');
   const geometry=await page.locator('.notebook-leaf:not([hidden])').evaluate(leaf=>{
    const board=document.querySelector('#board').getBoundingClientRect();
    const children=[...leaf.querySelectorAll('.cover-note,.development-note,.updates-note,.notebook-signoff,.species-key,.daily-record')];
    return children.map(e=>{const r=e.getBoundingClientRect();return {id:e.id||e.className,inside:r.x>=board.x-1&&r.right<=board.right+1&&r.y>=board.y-1&&r.bottom<=board.bottom+1}});
   });assert(geometry.every(x=>x.inside),`${width} ${key} content inside its leaf: ${JSON.stringify(geometry)}`);
   if(key==='species')assert(await page.evaluate(()=>{const f=document.querySelector('#atlasNote .cover-footer').getBoundingClientRect();return [...document.querySelectorAll('.specimen-strip figcaption')].every(e=>e.getBoundingClientRect().bottom<f.top)}),`${width} captions clear of footer`);
   if(key==='studio')assert(await page.locator('.development-copy a').evaluate(e=>e.getBoundingClientRect().bottom<document.querySelector('#developmentNote').getBoundingClientRect().bottom),`${width} development link stays on paper`);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(width>700){const box=await page.locator('#board').boundingBox(),v=await page.locator('#viewport').boundingBox();assert(box.x>=v.x-1&&box.x+box.width<=v.x+v.width+1&&box.y>=v.y-1&&box.y+box.height<=v.y+v.height+1,`${width} whole leaf visible`);}
  }
  const controls=await page.locator('#canvasControls').boundingBox(),pager=await page.locator('#pageNavigation').boundingBox();assert(controls.x+controls.width<=pager.x||pager.x+pager.width<=controls.x,`${width} controls and pager do not overlap`);
  assert(await page.evaluate(()=>[...document.querySelectorAll('#board h1,#board h2,#board p,#board figcaption')].every(e=>getComputedStyle(e).transform==='none')));
  await page.locator('#leafPrevious').click();assert.equal(await page.locator('#board').getAttribute('data-active-leaf'),'studio');await page.locator('#leafNext').click();assert.equal(await page.locator('#board').getAttribute('data-active-leaf'),'about');
  await choose('cover');await page.screenshot({path:`/tmp/hachime-v020-${width}.png`});console.log(`PASS ${width}×${height}: one leaf, sidebar/menu, focus, controls and content boundaries`);
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto(base+'#home/species');assert(await page.locator('#leaf-species').isVisible());await page.reload();assert(await page.locator('#leaf-species').isVisible());
 await page.locator('#leaf-species').focus();await page.keyboard.press('PageDown');assert.equal(new URL(page.url()).hash,'#home/care');await page.keyboard.press('PageUp');assert.equal(new URL(page.url()).hash,'#home/species');
 await page.goBack();assert(await page.locator('#leaf-care').isVisible());await page.goForward();assert(await page.locator('#leaf-species').isVisible());
 await page.locator('#zoomIn').click();const position=await page.locator('#board').getAttribute('style');await page.locator('#atlasNote [data-go="atlas/hyllus"]').click();assert(await page.locator('[data-page="atlas"]').isVisible());await page.locator('#detailBack').click();assert(await page.locator('#leaf-species').isVisible());assert.equal(await page.locator('#board').getAttribute('style'),position,'return restores the originating leaf and zoom');
 await choose('studio');await page.locator('.development-copy a').click();await page.locator('#detailBack').click();assert(await page.locator('#leaf-studio').isVisible());
 await page.goto(base+'#atlas/regius');await page.reload();await page.locator('#detailBack').click();assert(await page.locator('#leaf-species').isVisible(),'direct species article returns to species leaf');
 await page.goto(base+'#home/invalid');assert(await page.locator('#leaf-cover').isVisible());
 for(const key of ['species','care','studio','about','cover'])await choose(key);assert.equal(await page.locator('.notebook-leaf:not([hidden])').count(),1);
 await page.setViewportSize({width:768,height:900});await page.waitForTimeout(150);await choose('studio');const resized=await page.locator('#board').boundingBox();assert(resized.x>=0&&resized.x+resized.width<=768,'cached page resets to fit after resize');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(450);await choose('care');assert(await page.locator('#workspace').evaluate(e=>{const s=getComputedStyle(e,'::after');return s.display==='none'||(s.content==='none'&&s.animationName==='none')}),'reduced motion has no turning overlay');
 assert.deepEqual(errors,[]);console.log('PASS leaf deep links/reload, browser back/forward, PageUp/Down, article return/zoom, rapid turns, reduced motion and no JS errors');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
