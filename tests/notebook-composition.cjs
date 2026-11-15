// The homepage is one continuous board; paper transitions open actual detail routes.
const {chromium}=require('playwright');const assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:8000/';
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
 await page.addInitScript(()=>{sessionStorage.setItem('hachime-welcome-seen-v2','1');sessionStorage.setItem('hachime-entry-seen-v1','1');});
 async function menu(route){if(await page.locator('#bookMenuToggle').isVisible())await page.locator('#bookMenuToggle').click();await page.locator(`#bookMenu [data-go="${route}"]`).click();}
 async function panTo(selector){const r=await page.locator(selector).boundingBox(),v=await page.locator('#viewport').boundingBox();await page.mouse.move(v.x+v.width/2,v.y+v.height/2);await page.mouse.wheel(r.x+r.width/2-v.x-v.width/2,r.y+r.height/2-v.y-v.height/2);await page.waitForTimeout(100);}
 for(const [width,height] of [[320,740],[390,844],[600,900],[768,900],[961,768],[1024,900],[1366,768],[1440,1000]]){
  await page.setViewportSize({width,height});await page.goto(base);await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('.notebook-leaf,#pageNavigation,[data-leaf-link]').count(),0,'no homepage paging remains');
  assert.equal(await page.locator('#board .cover-note:visible').count(),6,'all six notes rendered together');
  assert.equal(await page.locator('#board').evaluate(e=>e.offsetHeight),width<=600?4770:2600,'original continuous overview restored');
  const overflow=await page.locator('#board .cover-note').evaluateAll(notes=>notes.filter(n=>n.querySelector('.cover-footer').getBoundingClientRect().bottom>n.getBoundingClientRect().bottom+1).map(n=>n.id));assert.deepEqual(overflow,[],`${width} note footers stay on paper`);
  if(width<=960){const toggle=page.locator('#bookMenuToggle');await toggle.focus();await page.keyboard.press('Enter');assert.equal(await toggle.getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert(await toggle.evaluate(e=>e===document.activeElement));await toggle.click();await page.locator('#zoomIn').click();assert.equal(await toggle.getAttribute('aria-expanded'),'false');}
  for(const route of ['beginner','atlas','knowledge','breeding','shop','development','about']){
   await menu(route);assert(await page.locator(`[data-page="${route}"]`).isVisible());assert(await page.locator('#viewport').isHidden());assert.equal(new URL(page.url()).hash,'#'+route);assert.equal(await page.locator('#bookMenu [aria-current]').getAttribute('data-go'),route);
   assert(await page.locator('#detailScroll').evaluate(e=>e.scrollWidth<=e.clientWidth));await page.locator('#detailBack').click();assert.equal(await page.locator('#board .cover-note:visible').count(),6);
  }
  await panTo('#breedingNote h2');const position=await page.locator('#board').getAttribute('style');await page.locator('#breedingNote h2').click();assert(await page.locator('[data-page="breeding"]').isVisible());assert.match(await page.locator('#workspace').getAttribute('class'),/is-turning/);
  await page.locator('#detailBack').click();assert.equal(await page.locator('#board').getAttribute('style'),position,'return restores original board position and zoom');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert(await page.evaluate(()=>[...document.querySelectorAll('#board h1,#board h2,#board p,#board figcaption')].every(e=>getComputedStyle(e).transform==='none')));
  if(width>600){await page.locator('#fitBoard').click();const b=await page.locator('#board').boundingBox(),v=await page.locator('#viewport').boundingBox();assert(b.x>=v.x-1&&b.y>=v.y-1&&b.x+b.width<=v.x+v.width+1&&b.y+b.height<=v.y+v.height+1,'overview fits completely');}
  await page.locator('#resetBoard').click();await page.waitForTimeout(450);await page.screenshot({path:`/tmp/hachime-v021-${width}.png`});console.log(`PASS ${width}×${height}: continuous board, direct contents, click-to-open transition and return position`);
 }
 await panTo('#atlasNote h2');await page.locator('#atlasNote h2').click();await page.goBack();assert(await page.locator('#viewport').isVisible());await page.goForward();assert(await page.locator('[data-page="atlas"]').isVisible());
 await page.goto(base+'#atlas/regius');await page.reload();assert(await page.locator('[data-page="atlas"]').isVisible());await page.locator('#detailBack').click();assert.equal(await page.locator('#board .cover-note:visible').count(),6);
 for(const [alias,pageName] of [['home/cover','home'],['home/species','atlas'],['home/care','knowledge'],['home/studio','shop'],['home/about','about']]){await page.goto(base+'#'+alias);assert(await page.locator(pageName==='home'?'#viewport':`[data-page="${pageName}"]`).isVisible());}
 await menu('home');const before=page.url();await page.mouse.move(450,500);await page.mouse.wheel(0,250);assert.equal(page.url(),before,'scroll does not navigate');await page.locator('#zoomIn').click();assert.equal(page.url(),before,'zoom does not navigate');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(450);await menu('knowledge');assert(await page.locator('#workspace').evaluate(e=>{const s=getComputedStyle(e,'::after');return s.display==='none'||s.content==='none'}));
 assert.deepEqual(errors,[]);console.log('PASS history, article reload, legacy links, no scroll navigation, reduced motion and no JS errors');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
