/* Progressive enhancement: failure never hides the notebook. No network assets gate entry. */
(() => {
  'use strict';
  const isHome=!location.hash||location.hash==='#home';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let previousFocus=null,entry=null,finished=false;
  const get=(storage,key)=>{try{return window[storage].getItem(key)==='1';}catch{return false;}};
  const set=(storage,key)=>{try{window[storage].setItem(key,'1');}catch{}};
  const dialog=document.createElement('dialog');
  dialog.id='welcomeDialog';dialog.className='welcome-dialog';dialog.setAttribute('aria-labelledby','welcomeTitle');
  dialog.innerHTML='<button class="welcome-close" type="button" aria-label="關閉操作說明">×</button><div class="welcome-mini" aria-hidden="true"><span></span><span></span><img src="./assets/hachime-symbol-v2.svg" alt=""></div><h2 id="welcomeTitle">筆記怎麼翻？</h2><p>用右側目錄選主題，或按下方按鈕翻頁。點擊便條可閱讀詳細內容，拖曳和縮放可以調整畫面。</p><div class="welcome-actions"><button type="button" id="welcomeExplore">開始翻閱</button><button type="button" id="welcomeStart">查看新手指南 ↗</button></div><p class="fine-print">問號按鈕可再次開啟操作說明。</p>';
  document.body.append(dialog);
  function close(){set('sessionStorage','hachime-welcome-seen-v2');set('localStorage','hachime-board-hint-seen');dialog.close();}
  function open(){if(dialog.open)return;previousFocus=document.activeElement;dialog.showModal();}
  dialog.querySelector('.welcome-close').addEventListener('click',close);
  dialog.querySelector('#welcomeExplore').addEventListener('click',close);
  dialog.querySelector('#welcomeStart').addEventListener('click',()=>{close();document.querySelector('.top-nav [data-go="beginner"]').click();});
  dialog.addEventListener('cancel',()=>{set('sessionStorage','hachime-welcome-seen-v2');});
  dialog.addEventListener('close',()=>{if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});});
  window.hachimeWelcome={open};
  function finish(){
    if(finished)return;finished=true;entry?.remove();
    if(isHome&&(!location.hash||location.hash==='#home')&&!get('sessionStorage','hachime-welcome-seen-v2'))open();
  }
  // Guard is scheduled before animation setup. Entry is skippable and cannot intercept content.
  setTimeout(finish,1300);
  if(isHome&&!reduced&&!get('sessionStorage','hachime-entry-seen-v1')){
    set('sessionStorage','hachime-entry-seen-v1');entry=document.createElement('div');entry.className='brand-entry';entry.setAttribute('aria-hidden','true');
    entry.innerHTML='<img src="./assets/hachime-symbol-v2.svg" alt=""><p>八目 HACHIME<br><small>跳蛛・飼養・日常觀察</small></p><button type="button" class="entry-skip" aria-label="略過進場動畫">略過動畫 →</button>';
    entry.removeAttribute('aria-hidden');document.body.append(entry);entry.querySelector('button').addEventListener('click',finish);
    entry.addEventListener('animationend',e=>{if(e.target===entry)finish();});
  }else finish();
})();
