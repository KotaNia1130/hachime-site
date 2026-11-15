// Exercise the collage through the same wheel, pointer and touch events used on the board.
const {chromium}=require('playwright');const assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:8000/';
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{
 const errors=[];
 for(const width of [320,390,1440]){
  const context=await browser.newContext({viewport:{width,height:900},hasTouch:true});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
  await page.addInitScript(()=>{sessionStorage.setItem('hachime-welcome-seen-v2','1');sessionStorage.setItem('hachime-entry-seen-v1','1');});
  await page.goto(base);await page.evaluate(()=>document.fonts.ready);
  assert(await page.evaluate(()=>[...document.fonts].some(f=>f.family==='HachimeFieldHand'&&f.status==='loaded')),'local handwriting loads without external fonts');
  await page.waitForFunction(()=>[...document.querySelectorAll('.brand-collage img,.specimen-strip img,.botanical-plate img,.field-photo img')].every(i=>i.complete&&i.naturalWidth>0));
  async function panTo(selector){
   const target=await page.locator(selector).boundingBox(),v=await page.locator('#viewport').boundingBox();
   await page.mouse.move(v.x+v.width/2,v.y+v.height/2);await page.mouse.wheel(target.x+target.width/2-v.x-v.width/2,target.y+target.height/2-v.y-v.height/2);
   await page.waitForTimeout(100);
  }
  for(const [id,route] of [['beginnerNote','beginner'],['atlasNote','atlas'],['careNote','knowledge'],['breedingNote','breeding'],['shopNote','shop'],['aboutNote','about']]){
   const selector='#'+id+' h2';await panTo(selector);if(width<600)await page.locator(selector).tap();else await page.locator(selector).click();
   assert(await page.locator(`[data-page="${route}"]`).isVisible(),`${width} ${id} tap/click`);await page.locator('.top-nav [data-go="home"]').click();
  }
  for(const selector of ['.spider-photo figcaption a:first-of-type','.atlas-cover .cover-footer a','.field-photo figcaption a:first-of-type','.botanical-plate figcaption a:first-of-type']){
   await panTo(selector);await page.locator(selector).click({trial:true});
  }
  await panTo('.specimen-label a');await page.locator('.specimen-label a').click();assert.match(await page.locator('#speciesPanel em').innerText(),/Hyllus diardi/);
  await page.locator('.top-nav [data-go="home"]').click();const before=await page.locator('#board').getAttribute('style');
  const cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:200,y:220}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:170,y:140}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(100);
  assert.notEqual(await page.locator('#board').getAttribute('style'),before,'touch pans board');assert(await page.locator('#viewport').isVisible());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await context.close();
  console.log(`PASS ${width}px note entrances, unobstructed credits, specimen link, local assets/font and touch drag`);
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
