// @ts-nocheck
/* The page's behaviour (clock, dock, About view, chibi, cursor bubbles, password pop-up), moved over
   from the single-file site. It works directly on the DOM that App renders, so it runs once after
   the first render. Type checking is off here because this is the original plain-JavaScript code. */
let started = false

export function initSite() {
  if (started) return            // React's dev mode mounts twice; the page only needs wiring once
  started = true
  const clock=document.getElementById('clock');
  const fmt=new Intl.DateTimeFormat('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23',timeZone:'America/New_York'});
  const tzEl=document.getElementById('clockTz');
  const tzFmt=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',timeZoneName:'short'});
  function tick(){const now=new Date();clock.textContent=fmt.format(now);tzEl.textContent=(tzFmt.formatToParts(now).find(x=>x.type==='timeZoneName')||{}).value||'EST';}
  tick(); setInterval(tick,1000);

  // "3 hours ahead of you": New York's UTC offset minus the visitor's (both from the browser, no location lookup)
  const diffTxt=document.getElementById('clockDiffTxt');
  function nyOffset(d){const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric'}).formatToParts(d).map(x=>[x.type,x.value]));
    return Math.round((Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute)-Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate(),d.getUTCHours(),d.getUTCMinutes()))/60000);}
  function showDiff(){
    const d=new Date(), mins=nyOffset(d)+d.getTimezoneOffset();   // getTimezoneOffset is minus the visitor's offset
    if(!mins){diffTxt.textContent='Same time as you';return;}
    const a=Math.abs(mins), h=Math.floor(a/60), m=a%60;
    const amt=[h&&`${h} hour${h>1?'s':''}`, m&&`${m} minutes`].filter(Boolean).join(' ');
    diffTxt.textContent=`${amt} ${mins>0?'ahead of':'behind'} you`;
  }
  showDiff();
  document.querySelector('.clock .time').addEventListener('mouseenter',showDiff);
  document.querySelector('.clock .time').addEventListener('focus',showDiff);

  // highlight the nav item for the section in view (nothing is highlighted while the intro is in view)
  const links=[...document.querySelectorAll('.fdock a')];
  const io=new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting && !window.__onAbout){ links.forEach(l=>l.classList.toggle('on', l.getAttribute('href')==='#'+e.target.id)); } });
  },{rootMargin:'-40% 0px -55% 0px'});
  ['intro','work','playground'].forEach(id=>io.observe(document.getElementById(id)));



  /* ---------- cursor bubble on the Pokédex ---------- */
  (function(){
    const box=document.getElementById('dex'), shield=document.getElementById('dexShield'), bubble=document.getElementById('dexBubble');
    if(!box||!shield||!bubble) return;
    if(matchMedia('(hover: none)').matches){ shield.hidden=true; return; }   // touch: no hover bubble, no extra tap
    const move=e=>{ bubble.style.transform=`translate(${e.clientX+16}px,${e.clientY+18}px)`; };
    // typewriter: the message types itself out each time the bubble appears
    const msg=bubble.textContent, still=matchMedia('(prefers-reduced-motion: reduce)').matches;
    bubble.textContent='';
    const typed=document.createElement('span'); bubble.append(typed);
    let timer=0;
    const type=()=>{
      clearInterval(timer);
      if(still){ typed.textContent=msg; return; }
      let i=0; typed.textContent='';
      timer=setInterval(()=>{ typed.textContent=msg.slice(0,++i); if(i>=msg.length) clearInterval(timer); },15);
    };
    const hide=()=>{ clearInterval(timer); bubble.classList.remove('show'); };
    shield.addEventListener('pointerenter',e=>{ move(e); bubble.classList.add('show'); type(); });
    shield.addEventListener('pointermove',move);
    shield.addEventListener('pointerleave',hide);
    shield.addEventListener('click',e=>{
      hide();
      shield.hidden=true;                                   // hand control to the Pokédex
      const under=document.elementFromPoint(e.clientX,e.clientY);
      if(under && under.tagName!=='IFRAME'){ under.focus?.(); under.click?.(); }
    });
    // re-arm once the cursor is back outside the window
    document.addEventListener('pointerover',e=>{ if(shield.hidden && !box.contains(e.target)) shield.hidden=false; });
  })();

  /* ---------- cursor bubbles on the About photos: follow the pointer like the Pokédex one, no typing.
     Each photo's message is its data-bubble text ---------- */
  (function(){
    const bubble=document.getElementById('aboutBubble');
    if(!bubble||matchMedia('(hover: none)').matches) return;
    // sits to the right of the cursor, or flips to its left when it would run off the window
    const move=e=>{ const w=bubble.offsetWidth, x=e.clientX+16+w>innerWidth-8?e.clientX-16-w:e.clientX+16;
      bubble.style.transform=`translate(${x}px,${e.clientY+18}px)`; };
    document.querySelectorAll('[data-bubble]').forEach(el=>{
      el.addEventListener('pointerenter',e=>{ bubble.textContent=el.dataset.bubble; move(e); bubble.classList.add('show'); });
      el.addEventListener('pointermove',move);
      el.addEventListener('pointerleave',()=>bubble.classList.remove('show'));
    });
  })();

  /* ---------- 3D model: model-viewer draws its own grab cursor inside its shadow DOM; swap in the site's circle ---------- */
  customElements.whenDefined('model-viewer').then(()=>{
    document.querySelectorAll('model-viewer').forEach(mv=>{
      if(!mv.shadowRoot) return;
      const st=document.createElement('style');
      st.textContent='*{cursor:var(--cursor-hot,pointer)!important}';
      mv.shadowRoot.appendChild(st);
    });
  });

  /* ---------- landing animation: run once, then drop the class so returning from About doesn't replay it ---------- */
  (function(){
    const intro=document.getElementById('intro'), chibi=intro&&intro.querySelector('.chibi');
    if(!intro) return;
    const done=()=>intro.classList.remove('play-in');
    // start the drop with her feet level with the top of "Sharon" (the chibi sits on the text block's baseline)
    const name=intro.querySelector('.name'), text=intro.querySelector('.intro-text');
    if(chibi&&name&&text){
      const restBottom=text.getBoundingClientRect().bottom-parseFloat(getComputedStyle(chibi).marginBottom||0);   // her resting feet (she sits lower via a negative margin)
      chibi.style.setProperty('--drop-from',Math.round(name.getBoundingClientRect().top-restBottom)+'px');
    }
    if(chibi) chibi.addEventListener('animationend',done,{once:true});
    setTimeout(done,3200);   // fallback: reduced motion, or the page opened straight onto About
  })();

  /* ---------- click the chibi: she takes turns yawning and doing her cat face
     (each plays once; extra clicks while one is playing are ignored) ---------- */
  (function(){
    const chibi=document.querySelector('#intro .chibi'), img=chibi&&chibi.querySelector('img');
    if(!img) return;
    const BLINK=img.getAttribute('src');
    const moves=[
      {src:'/assets/sharon-yawn.webp',ms:2300},   // yawn 700 + bubble 1100 + yawn 300 + open 200
      {src:'/assets/sharon-cat.webp', ms:3200}    // happy 900 + smug 1100 + sparkle 1000 + open 200
    ];
    moves.forEach(m=>fetch(m.src).then(r=>r.ok?r.blob():null).then(b=>{m.blob=b;}).catch(()=>{}));
    let next=0, busy=false;
    const play=()=>{
      const m=moves[next];
      if(busy||!m.blob||matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      busy=true; next=(next+1)%moves.length;
      const url=URL.createObjectURL(m.blob);   // a fresh URL each time so the animation always starts from the first frame
      img.src=url;
      setTimeout(()=>{ img.src=BLINK; URL.revokeObjectURL(url); busy=false; },m.ms);
    };
    chibi.addEventListener('click',play);
    chibi.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); play(); } });
  })();

  /* ---------- one-file navigation: About is a separate view ---------- */
  (function(){
    const homeParts=[...document.querySelectorAll('main > #intro, main > #work, main > #playground')];
    const aboutView=document.getElementById('about');
    const navLinks=[...document.querySelectorAll('.fdock a')];
    window.__onAbout=false;
    // every visit opens on the intro: don't restore the last scroll position, and drop a leftover #work / #playground
    // (About stays reachable by link because it is its own view)
    if('scrollRestoration' in history) history.scrollRestoration='manual';
    if(/^#(work|playground)$/.test(location.hash)) history.replaceState(null,'',location.pathname+location.search);
    function route(){
      const id=(location.hash||'').slice(1);
      const onAbout=id==='about';
      window.__onAbout=onAbout;
      aboutView.hidden=!onAbout;
      homeParts.forEach(el=>el.hidden=onAbout);
      navLinks.forEach(l=>{const on=l.getAttribute('href')==='#'+(onAbout?'about':id);l.classList.toggle('on',on);on?l.setAttribute('aria-current','page'):l.removeAttribute('aria-current');});
      // glide to the section on a nav click; jump on first load, and for anyone who prefers reduced motion
      const behavior=first||matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
      first=false;
      if(onAbout){window.scrollTo({top:0,behavior:'auto'});}          // a different view: start at its top
      else if(!id){window.scrollTo({top:0,behavior});}
      else{const t=document.getElementById(id); if(t) requestAnimationFrame(()=>t.scrollIntoView({behavior,block:'start'}));}
    }
    let first=true;
    // dock clicks: stop the browser's instant jump to the anchor, record the hash, then glide there ourselves
    navLinks.forEach(l=>l.addEventListener('click',e=>{
      e.preventDefault();
      const href=l.getAttribute('href');
      if(href!==location.hash) history.pushState(null,'',href);
      route();
    }));
    // the name in the corner: back to the top of home
    document.querySelector('.wordmark').addEventListener('click',e=>{
      e.preventDefault();
      if(location.hash) history.pushState(null,'',location.pathname+location.search);
      route();
    });
    addEventListener('hashchange',route); route();
  })();

  /* ---------- locked case study: ask for the password in a pop-up, then open it ---------- */
  (function(){
    const dlg=document.getElementById('lockDlg'), form=document.getElementById('lockForm'), pw=document.getElementById('lockPw'),
          err=document.getElementById('lockErr'), btn=form.querySelector('.go');
    if(!dlg||!window.MMLock||typeof dlg.showModal!=='function') return;   // no pop-up support: the link's own page asks instead
    let target='market-monitor.html';
    document.querySelectorAll('a[data-locked]').forEach(a=>a.addEventListener('click',async e=>{
      e.preventDefault(); target=a.getAttribute('href');
      err.textContent=''; pw.value=''; btn.disabled=false; btn.textContent='Unlock';
      dlg.showModal(); pw.focus();
    }));
    document.getElementById('lockClose').addEventListener('click',()=>dlg.close());
    dlg.addEventListener('click',e=>{ if(e.target===dlg) dlg.close(); });   // click outside the box
    form.addEventListener('submit',async e=>{
      e.preventDefault(); err.textContent=''; btn.disabled=true; btn.textContent='Unlocking…';
      try{ await window.MMLock.unlock(pw.value,true); pw.value=''; location.href=target; }
      catch(x){
        err.textContent=x.code==='missing'?'This case study hasn\'t been locked yet.':'That password isn\'t right. Try again.';
        btn.disabled=false; btn.textContent='Unlock'; pw.select();
        dlg.classList.remove('shake'); void dlg.offsetWidth; dlg.classList.add('shake');
      }
    });
  })();
}
