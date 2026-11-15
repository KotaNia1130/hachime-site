// Verify the collapsible directory, complete overview and readable content boundaries.
const {chromium}=require('playwright');const assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:8000/';
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
 await page.addInitScript(()=>{sessionStorage.setItem('hachime-welcome-seen-v2','1');sessionStorage.setItem('hachime-entry-seen-v1','1');});
 for(const [width,height] of [[320,740],[390,844],[600,900],[768,900],[1366,768],[1440,1000]]){
  await page.setViewportSize({width,height});await page.goto(base);await page.evaluate(()=>document.fonts.ready);
  const directory=page.locator('#notebookDirectory');assert.equal(await directory.getAttribute('open'),null);
  await directory.locator('summary').focus();await page.keyboard.press('Enter');assert.notEqual(await directory.getAttribute('open'),null);
  await page.keyboard.press('Escape');assert.equal(await directory.getAttribute('open'),null);assert(await directory.locator('summary').evaluate(e=>e===document.activeElement));
  await directory.locator('summary').click();await page.locator('#zoomIn').click();assert.equal(await directory.getAttribute('open'),null,'outside action closes directory');
  for(const id of ['home','beginnerNote','atlasNote','careNote','breedingNote','developmentNote','shopNote','updatesNote','aboutNote']){
   await directory.locator('summary').click();await directory.locator(`[data-focus-note="${id}"]`).click();assert.equal(await directory.getAttribute('open'),null);
   assert.equal(await page.evaluate(()=>document.activeElement.id),id,'keyboard focus follows destination');
   const geometry=await page.locator('#'+id).evaluate(e=>{const box=e.getBoundingClientRect();const v=document.querySelector('#viewport').getBoundingClientRect();return {x:box.x,y:box.y,right:box.right,bottom:box.bottom,vtop:v.top,vbottom:v.bottom}});
   assert(geometry.x>=-1&&geometry.right<=width+1&&geometry.y>=geometry.vtop-1&&geometry.bottom<=geometry.vbottom+1,`${width} ${id} fits viewport`);
  }
  const layout=await page.evaluate(()=>{
   const rect=s=>document.querySelector(s).getBoundingClientRect();const footer=rect('#atlasNote .cover-footer'),captions=[...document.querySelectorAll('.specimen-strip figcaption')].map(e=>e.getBoundingClientRect());
   const paper=rect('#developmentNote'),link=rect('.development-copy a');
   return {captionsClear:captions.every(r=>r.bottom<=footer.top+1),developmentContained:link.bottom<=paper.bottom-2,bodyOverflow:document.documentElement.scrollWidth>innerWidth,textTransforms:[...document.querySelectorAll('#board h1,#board h2,#board p,#board figcaption')].map(e=>getComputedStyle(e).transform)};
  });assert(layout.captionsClear,`${width} atlas captions do not collide with footer`);assert(layout.developmentContained,`${width} development link stays on paper`);assert(!layout.bodyOverflow);assert(layout.textTransforms.every(t=>t==='none'));
  if(width>600){await page.locator('#fitBoard').click();const board=await page.locator('#board').boundingBox(),v=await page.locator('#viewport').boundingBox();assert(board.x>=v.x&&board.y>=v.y&&board.x+board.width<=v.x+v.width+1&&board.y+board.height<=v.y+v.height+1,`${width} overview includes entire notebook`);const beforeZoom=Number(await page.locator('#board').evaluate(e=>e.style.zoom));await page.locator('#zoomOut').click();assert(Number(await page.locator('#board').evaluate(e=>e.style.zoom))<=beforeZoom,'zoom-out never enlarges a fitted board');}
  if(width<600){const controls=await page.locator('#canvasControls').boundingBox(),menu=await directory.locator('summary').boundingBox();assert(controls.x+controls.width<=menu.x,`${width} control groups do not overlap`);}
  await page.locator('#resetBoard').click();await page.screenshot({path:`/tmp/hachime-v019-${width}.png`});console.log(`PASS ${width}×${height} directory/focus, geometry, clear captions and controls`);
 }
 for(const [route,expected] of [['atlas/audax','atlas'],['atlas/hyllus','atlas'],['knowledge/environment','knowledge'],['knowledge/feeding','knowledge'],['knowledge/observation','knowledge']]){
  await page.goto(base);const id=route.startsWith('atlas')?'atlasNote':'careNote';await page.locator('#notebookDirectory summary').click();await page.locator(`.board-index [data-focus-note="${id}"]`).click();await page.locator(`#${id} [data-go="${route}"]`).click();assert(await page.locator(`[data-page="${expected}"]`).isVisible());assert.equal(new URL(page.url()).hash,'#'+route);assert(await page.locator('#notebookDirectory').isHidden());
 }
 assert.deepEqual(errors,[]);console.log('PASS nested photo/care links, directory hidden on articles, no JavaScript exceptions');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
