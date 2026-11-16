const {chromium}=require('playwright'),assert=require('node:assert/strict');
const base=process.env.BASE_URL||'http://127.0.0.1:8000/';
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{
 const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('https://**/*',r=>r.abort());await p.addInitScript(()=>sessionStorage.setItem('hachime-welcome-seen-v2','1'));
 const entries=[["adansoni","安德遜","Hasarius adansoni"],["bivittatus","雙帶扁","Menemerus bivittatus"],["paykulli","褐條斑蠅虎","Plexippus paykulli"],["xanthogramma","橙黃蠅虎","Carrhotus xanthogramma"],["versicolor","眼鏡黑條蠅虎","Phintelloides versicolor"],["incognitus","淡色條斑蠅虎","Plexippus incognitus"],["petersi","彼得條斑蠅虎","Plexippus petersi"],["cupreus","藍翠蛛","Siler cupreus"],["fulvus","白鬚扁蠅虎","Menemerus fulvus"],["suboppressa","細齒方胸蛛","Thiania suboppressa"],["strupifer","毛垛兜蠅虎","Ptocasius strupifer"],["albopunctatus","波氏緬蛛","Burmattus albopunctatus"],["bulbus","球斑馬蛛","Zebraplatys bulbus"],["japonica","日本蟻蛛","Myrmarachne japonica"],["lauta","華美麗跳蛛","Chrysilla lauta"],["regius","佛跳","Phidippus regius"],["hyllus","老虎狗","Hyllus diardi"],["giganteus","獅子狗","Hyllus giganteus"],["simaetha","西邁塔","Simaetha sp."],["audax","大膽跳蛛","Phidippus audax"],["otiosus","大黃蜂跳蛛","Phidippus otiosus"],["pius","教皇跳蛛","Phidippus pius"],["flavigera","黃毛寬胸蠅虎","Rhene flavigera"],["portia","唇形孔蛛","Portia labiata"],["scenicus","斑馬蜘蛛","Salticus scenicus"],["maratus","孔雀蜘蛛","Maratus spp."],["magnus","大蟻蛛","Toxeus magnus"],["fimbriata","纓孔蛛","Portia fimbriata"],["bhamoensis","巴莫方胸蛛","Thiania bhamoensis"],["acerosa","針狀麗跳蛛","Chrysilla acerosa"],["crassipes","粗腳盤蛛","Pancorius crassipes"]];
 for(const width of [320,390,768,1024,1440]){
  await p.setViewportSize({width,height:900});await p.goto(base+'#atlas');
  assert.equal(await p.locator('#speciesTabs').count(),0);assert.equal(await p.locator('#bookMenu [data-species-id]').count(),31);
  assert.equal(await p.locator('#speciesTitle').innerText(),'佛跳');
  assert.equal(await p.locator('#bookMenu .species-menu-group').count(),3);
  for(const group of ['台灣觀察','寵物與飼養圈','特色與國際物種'])assert.equal(await p.locator('#bookMenu h4').filter({hasText:group}).count(),1);
  assert.match(await p.locator('#bookMenu>p').innerText(),/31 筆/);

  for(const [id,name,latin]of entries){
   if(width<=960)await p.locator('#bookMenuToggle').click();
   await p.locator(`#bookMenu [data-species-id="${id}"]`).click();
   assert.equal(await p.locator('#speciesTitle').innerText(),name);
   assert.equal(await p.locator('.species-display-kind,.species-menu-kind').count(),0,'editorial categories are not public copy');
   assert.equal(await p.locator('.species-sources').getAttribute('open'),null,'references start collapsed');
   assert(await p.locator('.species-sources a').count()>0,'original references remain available');
   assert.match(await p.locator('#speciesPanel .species-field-label').first().innerText(),/學名/);
   if(id==='paykulli')assert.equal(await p.locator('.species-common').count(),0,'do not repeat the heading as a Chinese name');
   if(id==='petersi'){assert.match(await p.locator('.species-common').innerText(),/溝渠蠅虎/);await p.locator('.species-sources summary').click();assert.match(await p.locator('.species-sources').innerText(),/溝渠蠅虎/);await p.locator('.species-sources summary').click();}
   if(id==='scenicus')assert.equal(await p.locator('#speciesTitle').innerText(),'斑馬蜘蛛');
   if(id==='simaetha')assert.match(await p.locator('.species-status').innerText(),/尚未定種/);
   if(id==='maratus')assert.match(await p.locator('.species-status').innerText(),/類群/);
   if(id==='crassipes')assert.match(await p.locator('.species-common').innerText(),/粗腳條斑蠅虎/);
   if(id==='lauta')assert.match(await p.locator('.species-common').innerText(),/優美金毛蛛/);
   if(id==='regius'){
    // Navigation focuses the reader in its next animation frame.
    await p.waitForFunction(()=>document.activeElement.id==='detailScroll');
    await p.locator('.species-sources summary').focus();await p.keyboard.press('Enter');
    assert(await p.locator('.species-sources a').first().isVisible(),'references expand by keyboard');
    await p.keyboard.press('Enter');assert(await p.locator('.species-sources a').first().isHidden());
   }


   assert.equal(new URL(p.url()).hash,'#atlas/'+id);
   assert.equal(await p.locator(`#bookMenu [data-species-id="${id}"]`).getAttribute('aria-current'),'page');
   if(latin)assert.equal(await p.locator('#speciesPanel em').innerText(),latin);else{assert.equal(await p.locator('#speciesPanel em').count(),0);assert.match(await p.locator('.species-latin').innerText(),/待確認/);}
   if(!['regius','audax','hyllus'].includes(id)){assert.equal(await p.locator('#speciesPanel img').count(),0);assert.match(await p.locator('.species-photo-pending').innerText(),/照片待補/);}
   assert(await p.locator('#detailScroll').evaluate(e=>e.scrollWidth<=e.clientWidth),`${width} ${id} overflow`);
   if(width>960){const menu=await p.locator('#bookSidebar').boundingBox(),article=await p.locator('#atlas').boundingBox();const paper=await p.locator('#detailView').boundingBox();assert(Math.abs(menu.x-paper.x)<1&&menu.x+menu.width<article.x);}
   else assert.equal(await p.locator('#bookMenuToggle').getAttribute('aria-expanded'),'false');
  }
  await p.reload();assert.equal(await p.locator('#speciesTitle').innerText(),entries.at(-1)[1]);
  assert.equal(new URL(p.url()).hash,'#atlas/'+entries.at(-1)[0]);
  await p.goto(base+'#atlas/hyllus');await p.waitForFunction(()=>document.querySelector('#speciesPanel img').naturalWidth>0);assert.equal(await p.locator('#speciesTitle').innerText(),'老虎狗');assert.match(await p.locator('#speciesPanel img').getAttribute('src'),/hyllus.jpg/);
  await p.goto(base+'#atlas/giganteus');assert.equal(await p.locator('#speciesTitle').innerText(),'獅子狗');assert.equal(await p.locator('#speciesPanel img').count(),0);
  await p.goBack();assert.equal(await p.locator('#speciesTitle').innerText(),'老虎狗');await p.goForward();assert.equal(await p.locator('#speciesTitle').innerText(),'獅子狗');
  await p.screenshot({path:`/tmp/hachime-v0262-atlas-${width}.png`});
  await p.locator('#detailBack').click();assert(await p.locator('#bookSidebar').isHidden());
  for(const selector of ['.home-actions [data-jump]','.observation-slip [data-go]','.update-list [data-go]','.notebook-signoff>[data-go]'])assert(await p.locator(selector).first().evaluate(e=>['none','normal'].includes(getComputedStyle(e,'::before').content)),'small links have no paper backing');
  console.log(`PASS ${width}px: ${entries.length} left-side entries, names, unresolved taxa, photos, history and plain links`);
 }
 await p.goto(base+'#atlas/maratus-volans');
 assert.equal(await p.locator('#speciesTitle').innerText(),'孔雀蜘蛛');
 await p.goto(base+'#atlas/simaetha-thoracica');
 assert.equal(await p.locator('#speciesTitle').innerText(),'西邁塔');
 await p.goto(base+'#atlas/maratus');
 assert.equal(await p.locator('#speciesTitle').innerText(),'孔雀蜘蛛');
 await p.goto(base+'#atlas/simaetha');
 assert.equal(await p.locator('#speciesTitle').innerText(),'西邁塔');

 await p.goto(base+'#atlas');
 assert(await p.locator('.atlas-reference-links a').count()>=4);
 assert.match(await p.locator('.atlas-reference-links').innerText(),/臺灣蛛式會社/);
 await p.goto(base+'#shop/live');
 await p.locator('#livePause').click();
 assert.equal(await p.locator('#liveCoverName').innerText(),'佛跳');
 await p.locator('[data-cover-next="live"]').click();assert.equal(await p.locator('#liveCoverName').innerText(),'老虎狗');assert.match(await p.locator('#liveCoverImage').getAttribute('src'),/hyllus.jpg/);
 await p.locator('[data-cover-next="live"]').click();assert.equal(await p.locator('#liveCoverName').innerText(),'獅子狗');assert.match(await p.locator('#liveCoverImage').getAttribute('src'),/openmoji/);assert.match(await p.locator('#liveCoverCredit').innerText(),/非獅子狗外觀/);
 const lion=p.locator('.live-card').filter({has:p.locator('h3',{hasText:'獅子狗'})}),tiger=p.locator('.live-card').filter({has:p.locator('h3',{hasText:'老虎狗'})});
 assert.match(await lion.innerText(),/Hyllus giganteus/);assert.match(await lion.locator('img').getAttribute('src'),/openmoji/);
 assert.match(await p.locator('[data-shop="live"] .live-intro').innerText(),/尚未開放販售或預訂/);
 assert.match(await p.locator('[data-shop="live"] .asset-note').innerText(),/獅子狗插圖/);
 assert.match(await p.locator('.photo-sources').innerText(),/老虎狗（斑腹蠅象）/);
 assert.match(await tiger.innerText(),/Hyllus diardi/);assert.match(await tiger.locator('img').getAttribute('src'),/hyllus.jpg/);
 await tiger.locator('[data-go="atlas/hyllus"]').click();assert.equal(await p.locator('#speciesTitle').innerText(),'老虎狗');
 await p.locator('.species-sources summary').click();assert(await p.locator('.species-sources a[href*="seaharescorpion.com"]').isVisible());
 await p.goto(base+'#atlas/giganteus');assert.match(await p.locator('.species-common').innerText(),/暫稱/);await p.locator('.species-sources summary').click();assert(await p.locator('.species-sources a[href*="facebook.com/JumpersFever"]').isVisible());
 assert.deepEqual(errors,[]);console.log('PASS V0.26.2 concise catalog, scientific names, expandable references, live/atlas consistency; no JS exceptions');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
