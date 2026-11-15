// The overview has no contents rail. An article is one scrollable document with local chapter links.
const {chromium}=require('playwright');const assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:8000/';
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
 await page.addInitScript(()=>{sessionStorage.setItem('hachime-welcome-seen-v2','1');sessionStorage.setItem('hachime-entry-seen-v1','1');});
 async function chapter(id){if(await page.locator('#bookMenuToggle').isVisible())await page.locator('#bookMenuToggle').click();await page.locator(`#bookMenu [data-section="${id}"]`).click();await page.waitForTimeout(60);}
 async function panTo(selector){const r=await page.locator(selector).boundingBox(),v=await page.locator('#viewport').boundingBox();await page.mouse.move(v.x+v.width/2,v.y+v.height/2);await page.mouse.wheel(r.x+r.width/2-v.x-v.width/2,r.y+r.height/2-v.y-v.height/2);await page.waitForTimeout(100);}
 for(const [width,height] of [[320,740],[390,844],[600,900],[768,900],[961,768],[1024,900],[1366,768],[1440,1000]]){
  await page.setViewportSize({width,height});await page.goto(base);await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('.notebook-leaf,#pageNavigation,[data-leaf-link]').count(),0);
  assert(await page.locator('#bookSidebar').isHidden(),'no homepage contents');assert(await page.locator('#bookMenuToggle').isHidden());
  const viewport=await page.locator('#viewport').boundingBox();assert(viewport.width>=width-2,'homepage uses full width');
  assert.equal(await page.locator('#board .cover-note:visible').count(),6);
  assert.equal(await page.locator('#board').evaluate(e=>e.offsetHeight),width<=600?4770:2600);
  const overflow=await page.locator('#board .cover-note').evaluateAll(notes=>notes.filter(n=>n.querySelector('.cover-footer').getBoundingClientRect().bottom>n.getBoundingClientRect().bottom+1).map(n=>n.id));assert.deepEqual(overflow,[]);
  await panTo('#beginnerNote h2');await page.locator('#beginnerNote h2').click();
  assert(await page.locator('[data-page="beginner"]').isVisible());assert.equal(await page.locator('.guide-chapter:visible').count(),7,'all chapters rendered together');
  assert.equal(await page.locator('#guideTabs,#guidePrev,#guideNext,.chapter-nums').count(),0);
  assert.equal(await page.locator('#bookMenu a').count(),7);assert.equal(await page.locator('#bookMenu [data-go="home"]').count(),0,'contents never navigates categories');
  if(width<=960){const toggle=page.locator('#bookMenuToggle');await toggle.focus();await page.keyboard.press('Enter');assert.equal(await toggle.getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert(await toggle.evaluate(e=>e===document.activeElement));}
  await page.waitForTimeout(450);await chapter('guide-chapter-5');
  assert.equal(new URL(page.url()).hash,'#beginner/5');assert.equal(await page.locator('.guide-chapter:visible').count(),7);
  assert(await page.locator('#detailScroll').evaluate(e=>e.scrollTop>500),'chapter link scrolls document');
  assert.equal(await page.locator('#bookMenu [aria-current]').getAttribute('data-section'),'guide-chapter-5');
  assert(!/is-turning/.test(await page.locator('#workspace').getAttribute('class')),'chapter jump does not turn page');
  assert(await page.evaluate(()=>document.activeElement.id==='guide-chapter-5'));
  const heading=await page.locator('#guide-chapter-5').boundingBox(),scroller=await page.locator('#detailScroll').boundingBox();assert(Math.abs(heading.y-scroller.y-28)<3,'target heading is at reading edge');
  await page.reload();await page.waitForTimeout(100);assert.equal(await page.locator('#bookMenu [aria-current]').getAttribute('data-section'),'guide-chapter-5');
  await chapter('guide-chapter-2');await page.goBack();await page.waitForTimeout(100);assert.equal(await page.locator('#bookMenu [aria-current]').getAttribute('data-section'),'guide-chapter-5');await page.goForward();await page.waitForTimeout(100);assert.equal(await page.locator('#bookMenu [aria-current]').getAttribute('data-section'),'guide-chapter-2');
  await page.locator('#detailScroll').evaluate(e=>e.scrollTop=0);await page.waitForTimeout(100);assert.equal(await page.locator('#bookMenu [aria-current]').getAttribute('data-section'),'guide-chapter-1','manual scroll updates chapter marker');
  await page.screenshot({path:`/tmp/hachime-v022-guide-${width}.png`});
  assert(await page.locator('#detailScroll').evaluate(e=>e.scrollWidth<=e.clientWidth));
  await page.locator('#detailBack').click();assert(await page.locator('#bookSidebar').isHidden());
  // A reload resets the board; an ordinary article return must preserve the current view.
  await panTo('#breedingNote h2');const currentPosition=await page.locator('#board').getAttribute('style');await page.locator('#breedingNote h2').click();await page.locator('#detailBack').click();assert.equal(await page.locator('#board').getAttribute('style'),currentPosition);
  await page.locator('.top-nav [data-go="knowledge"]').click();assert.equal(await page.locator('.care-chapter:visible').count(),5);assert.equal(await page.locator('#bookMenu a').count(),6);await chapter('care-feeding');assert.equal(new URL(page.url()).hash,'#knowledge/feeding');assert.equal(await page.locator('.care-chapter:visible').count(),5);await chapter('care-faq');assert.match(page.url(),/section=care-faq/);assert(await page.locator('#faqSearch').isVisible());
  for(const route of ['atlas','breeding','shop','about']){await page.locator(`.top-nav [data-go="${route}"]`).click();assert(await page.locator(`[data-page="${route}"]`).isVisible());assert(await page.locator('#detailScroll').evaluate(e=>e.scrollWidth<=e.clientWidth));}
  await page.locator('.top-nav [data-go="home"]').click();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert(await page.evaluate(()=>[...document.querySelectorAll('#board h1,#board h2,#board p,#board figcaption')].every(e=>getComputedStyle(e).transform==='none')));
  if(width>600){await page.locator('#fitBoard').click();const b=await page.locator('#board').boundingBox(),v=await page.locator('#viewport').boundingBox();assert(b.x>=v.x-1&&b.y>=v.y-1&&b.x+b.width<=v.x+v.width+1&&b.y+b.height<=v.y+v.height+1);}
  await page.locator('#resetBoard').click();await page.waitForTimeout(450);await page.screenshot({path:`/tmp/hachime-v022-home-${width}.png`});console.log(`PASS ${width}×${height}: no homepage contents, continuous guide/care, chapter anchors, focus/history/reload and return position`);
 }
 for(const [alias,pageName] of [['home/cover','home'],['home/species','atlas'],['home/care','knowledge'],['home/studio','shop'],['home/about','about']]){await page.goto(base+'#'+alias);assert(await page.locator(pageName==='home'?'#viewport':`[data-page="${pageName}"]`).isVisible());}
 await page.goto(base+'#development');await chapter('development-section-3');assert.match(page.url(),/section=development-section-3/);await page.reload();await page.waitForTimeout(100);assert(await page.locator('[data-page="development"]').isVisible());
 await page.locator('.top-nav [data-go="home"]').click();const before=page.url();await page.mouse.move(450,500);await page.mouse.wheel(0,250);assert.equal(page.url(),before);await page.locator('#zoomIn').click();assert.equal(page.url(),before);
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(450);await page.locator('.top-nav [data-go="knowledge"]').click();assert(await page.locator('#workspace').evaluate(e=>{const s=getComputedStyle(e,'::after');return s.display==='none'||s.content==='none'}));
 assert.deepEqual(errors,[]);console.log('PASS legacy links, article anchors, no scroll navigation, reduced motion and no JS errors');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
