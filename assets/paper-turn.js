/* Disposable soft-paper transition. Reading and navigation remain ordinary HTML. */
(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let active=null,styles=null,sharedSheet=null;
  function stop(){
    if(!active)return;
    const previous=active;active=null;
    clearTimeout(previous.timer);cancelAnimationFrame(previous.frame);
    try{previous.flip?.destroy();}catch{}
    previous.host.remove();
    document.querySelector('#workspace').classList.remove('is-turning');
  }
  function capture(source){
    stop();
    if(reduced.matches||!window.St?.PageFlip)return null;
    return copySource(source);
  }
  function copySource(source){
    const copy=source.cloneNode(false);
    if(source.id==='viewport'){
      const board=source.querySelector('#board'),sheet=board.cloneNode(false),bounds=source.getBoundingClientRect();
      for(const child of board.children){
        const r=child.getBoundingClientRect();
        if(r.width&&r.height&&r.bottom>=bounds.top-80&&r.top<=bounds.bottom+80&&r.right>=bounds.left-80&&r.left<=bounds.right+80)sheet.append(child.cloneNode(true));
      }
      copy.append(sheet);
    }else{
      const original=source.querySelector('.detail-scroll'),scroll=original.cloneNode(false),offset=document.createElement('div');
      offset.style.transform=`translateY(-${original.scrollTop}px)`;
      const page=original.querySelector('.detail-page:not([hidden])');if(page)offset.append(page.cloneNode(true));
      scroll.append(offset);scroll.style.overflow='hidden';
      copy.append(source.querySelector('.detail-toolbar').cloneNode(true),scroll);
    }
    copy.querySelectorAll('[hidden],script').forEach(el=>el.remove());
    copy.querySelectorAll('[aria-live]').forEach(el=>el.removeAttribute('aria-live'));
    return copy;
  }
  function prepareStyles(){
    if(styles!==null)return;
    styles=[...document.styleSheets].map(sheet=>{try{return [...sheet.cssRules].map(rule=>rule.cssText.replace(/url\((['"]?)(.*?)\1\)/g,(_,quote,url)=>url.startsWith('data:')||url.startsWith('#')?`url("${url}")`:`url("${new URL(url,sheet.href||location.href).href}")`)).join('\n');}catch{return '';}}).join('\n');
    if('adoptedStyleSheets' in ShadowRoot.prototype){sharedSheet=new CSSStyleSheet();sharedSheet.replaceSync(styles);}
  }
  // Parse shared snapshot styles once while idle, not at the first click.
  const warm=()=>window.requestIdleCallback?requestIdleCallback(prepareStyles,{timeout:1500}):setTimeout(prepareStyles,60);
  if(document.readyState==='complete')warm();else window.addEventListener('load',warm,{once:true});
  function play(copy,backward=false){
    if(!copy||reduced.matches||!window.St?.PageFlip)return;
    stop();
    const surface=document.querySelector('#workspace'),rect=surface.getBoundingClientRect();
    const host=document.createElement('div');host.className='paper-turn';host.setAttribute('aria-hidden','true');host.inert=true;
    // Shadow DOM isolates snapshot IDs, selectors, controls and duplicate chapter markup.
    const shadow=host.attachShadow({mode:'closed'});
    prepareStyles();if(sharedSheet)shadow.adoptedStyleSheets=[sharedSheet];
    const style=document.createElement('style');style.textContent=(sharedSheet?'':styles)+`
      :host{display:block;pointer-events:none}*,*::before,*::after{pointer-events:none!important;animation:none!important;transition:none!important}
      .turn-book{width:${rect.width}px;height:${rect.height}px;position:relative;transform:${backward?'scaleX(-1)':'none'}}
      .turn-page{overflow:hidden;background:transparent}
      .turn-paper-back{background:repeating-linear-gradient(0deg,transparent 0 27px,#a5a88b20 27px 28px),#eee8d8}
      .turn-paper-back .turn-snapshot{opacity:.045}
      .turn-snapshot *,.turn-snapshot *::before,.turn-snapshot *::after{box-shadow:none!important;filter:none!important}
      .turn-snapshot .infinite-sheet{background-image:linear-gradient(#9aab9417 1px,transparent 1px),linear-gradient(90deg,#9aab9417 1px,transparent 1px);background-size:28px 28px}
      .turn-snapshot{position:absolute;inset:0;overflow:hidden;background:#f3f0e5;transform:${backward?'scaleX(-1)':'none'}}
      .turn-snapshot>.workspace,.turn-snapshot>.detail-view{position:absolute;inset:0;width:100%;height:100%;margin:0}
      .turn-snapshot .book-sidebar{display:none}.turn-snapshot .detail-scroll{margin-left:var(--book-rail);margin-right:0}
      .stf__parent,.stf__wrapper{pointer-events:none!important}
    `;
    const book=document.createElement('div');book.className='turn-book';
    const paper=document.createElement('div');paper.className='turn-page';paper.dataset.density='soft';
    const snapshot=document.createElement('div');snapshot.className='turn-snapshot';snapshot.append(copy);paper.append(snapshot);
    const clear=document.createElement('div');clear.className='turn-page';clear.dataset.density='soft';
    const pages=[paper,clear];book.append(...pages);shadow.append(style,book);surface.append(host);
    const state={host,flip:null,timer:0,frame:0};active=state;surface.classList.add('is-turning');
    try{
      const flip=new St.PageFlip(book,{width:Math.round(rect.width),height:Math.round(rect.height),size:'fixed',autoSize:false,usePortrait:true,startPage:0,flippingTime:680,drawShadow:true,maxShadowOpacity:.28,useMouseEvents:false,mobileScrollSupport:false,clickEventForward:false,disableFlipByClick:false,showPageCorners:false});
      state.flip=flip;let started=false;
      flip.on('changeState',event=>{if(event.data==='flipping')started=true;if(started&&event.data==='read'&&active===state)stop();});
      flip.loadFromHTML(pages);
      state.frame=requestAnimationFrame(()=>{if(active!==state)return;
        const destination=document.createElement('div');destination.className='turn-snapshot';
        destination.append(copySource(document.querySelector('#detailView').hidden?document.querySelector('#viewport'):document.querySelector('#detailView')));clear.append(destination);
        // Mirror only the disposable book for a left-to-right return; counter-mirror its print.
        flip.flipNext('bottom');
        book.querySelectorAll('.turn-page').forEach(page=>{if(!pages.includes(page))page.classList.add('turn-paper-back');});});
      state.timer=setTimeout(()=>{if(active===state)stop();},950);
    }catch{stop();}
  }
  window.addEventListener('resize',stop);
  reduced.addEventListener('change',()=>{if(reduced.matches)stop();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
  window.hachimePaperTurn={capture,play,stop};
})();
