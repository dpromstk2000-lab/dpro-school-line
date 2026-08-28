/* DPRO TUTORIAL SCHOOL / STANDARD V1.1 / R3 FIX V1.1 / 2026-08-29
 * First10 exactly 10. Tutorial-local state only. Business mutation = 0.
 */
(function(){
  'use strict';
  if (window.DPRO_TUTORIAL_SCHOOL) return;

  const TUTORIAL_ID='school-first10-v1';
  const VERSION='1.0.1-r3';
  const DEVICE_KEY='dpro_tutorial_device_key';
  const allowedRoutes=new Set(['/index.html','/member.html','/owner-ipad.html']);
  const forbiddenIds=new Set(['submitTrialBtn','sendAbsenceBtn','sendMakeupBtn','saveAdminBtn','fillAdminBtn','clearAdminBtn']);
  const forbiddenActionPattern=/(submit|save|approve|cancel|delete|send|payment|reservation|attendance|lesson.?status)/i;
  const steps=[
    {step:1,key:'school.first10.01',title:'全体像を確認',route:'/index.html',primary:'.hero h1',fallback:'.hero',purpose:'保護者・生徒画面が、体験予約・欠席連絡・振替希望の入口であることを確認します。',safety:'表示を見るだけです。フォーム入力や送信は行いません。'},
    {step:2,key:'school.first10.02',title:'体験予約の入口',route:'/index.html',primary:'#trialBlock',fallback:'[data-switch-mode="trial"]',purpose:'体験授業のコース・日付・時間を選ぶ領域の位置を確認します。',safety:'体験予約は送信しません。選択操作も完了条件ではありません。'},
    {step:3,key:'school.first10.03',title:'欠席受付の場所',route:'/index.html',primary:'#absenceBlock',fallback:'[data-mode="absence"]',purpose:'欠席連絡の入力領域と受付導線の位置を確認します。',safety:'欠席連絡は送信しません。画面確認だけで次へ進めます。'},
    {step:4,key:'school.first10.04',title:'振替受付の場所',route:'/index.html',primary:'#makeupBlock',fallback:'[data-mode="makeup"]',purpose:'振替希望の入力領域と受付導線の位置を確認します。',safety:'振替希望は送信しません。次へ進むとTutorial自身のGET遷移で生徒証へ移動します。',nextRoute:'/member.html'},
    {step:5,key:'school.first10.05',title:'生徒証の確認入口',route:'/member.html',primary:'#loadBtn',fallback:'.hero-main',purpose:'電話番号・生徒番号で生徒証と授業予定を確認する入口を把握します。',safety:'生徒証の照合ボタンは自動クリックしません。認証・照合は任意で、Tutorial完了条件ではありません。',backRoute:'/index.html'},
    {step:6,key:'school.first10.06',title:'教室確認と授業予定',route:'/member.html',primary:'#contactStatusSection',fallback:'#lessonList',purpose:'教室確認中・対応済み・今後の授業と授業予定の見方を確認します。',safety:'更新・欠席・振替などの業務操作は要求しません。'},
    {step:7,key:'school.first10.07',title:'保護者LINE文面',route:'/member.html',primary:'#lineMessageBox',fallback:'.hero-side',purpose:'保護者向け確認文面をLINEへコピーして使う位置を確認します。',safety:'メッセージ送信は行いません。コピーも必須ではありません。次へ進むとTutorial自身のGET遷移でiPad画面へ移動します。',nextRoute:'/owner-ipad.html'},
    {step:8,key:'school.first10.08',title:'受付・講師iPadの全体像',route:'/owner-ipad.html',primary:'.hero h1',fallback:'.hero-main',purpose:'受付・講師向け現場画面の役割と、管理画面との位置づけを確認します。',safety:'管理コード入力・API更新・業務変更はTutorialから実行しません。',backRoute:'/member.html'},
    {step:9,key:'school.first10.09',title:'現場モードと管理・準備モード',route:'/owner-ipad.html',primary:'#fieldModeBar',fallback:'.field-mode-copy',purpose:'通常の現場モードと管理・準備モードの役割を確認します。',safety:'モードボタンのクリックや管理コード入力は完了条件ではありません。'},
    {step:10,key:'school.first10.10',title:'今日の受付・授業を読む',route:'/owner-ipad.html',primary:'#statsGrid',fallback:'main.grid .card:first-child',purpose:'今日の受付・授業、要返信、授業進行の集約位置を確認してFirst10を完了します。',safety:'更新・出席・授業中・完了・対応済み等の業務変更は実行しません。'}
  ];

  let root,launcher,launcherBtn,card,highlight,handle,titleEl,countEl,purposeEl,safetyEl,warningEl,backBtn,nextBtn,closeBtn,skipBtn;
  let currentIndex=-1,currentTarget=null,drag=null,lastFocus=null;

  function normalizeRoute(){
    let p=location.pathname.replace(/\/+/g,'/');
    if (p.endsWith('/')) p+="index.html";
    const base='/dpro-school-line/';
    if (p.includes(base)) p='/'+p.split(base).pop();
    const name='/'+(p.split('/').pop()||'index.html');
    return name==='/'?'/index.html':name;
  }
  function deviceKey(){
    let key=localStorage.getItem(DEVICE_KEY);
    if(!key){key=(crypto.randomUUID?crypto.randomUUID():'dev-'+Date.now()+'-'+Math.random().toString(36).slice(2));localStorage.setItem(DEVICE_KEY,key);}
    return key;
  }
  function stateKey(){return `dpro_tutorial_state:${deviceKey()}:${TUTORIAL_ID}`;}
  function now(){return Date.now();}
  function defaultState(){return {tutorialId:TUTORIAL_ID,currentStepKey:steps[0].key,nextStepKey:steps[0].key,completedStepKeys:[],route:'/index.html',closed:true,skipped:false,complete:false,updatedAt:now(),version:VERSION};}
  function readState(){
    try{const raw=localStorage.getItem(stateKey());if(!raw)return defaultState();const s=JSON.parse(raw);if(!s||s.tutorialId!==TUTORIAL_ID)return defaultState();return Object.assign(defaultState(),s);}catch(_){return defaultState();}
  }
  function writeState(patch){const cur=readState();const next=Object.assign({},cur,patch,{tutorialId:TUTORIAL_ID,updatedAt:now(),version:VERSION});localStorage.setItem(stateKey(),JSON.stringify(next));return next;}
  function stepIndexByKey(key){return Math.max(0,steps.findIndex(s=>s.key===key));}
  function isVisible(el){if(!el||!el.isConnected)return false;const st=getComputedStyle(el);if(st.display==='none'||st.visibility==='hidden'||Number(st.opacity)===0)return false;const r=el.getBoundingClientRect();return r.width>0&&r.height>0;}
  function safeSelector(selector){try{return document.querySelector(selector);}catch(_){return null;}}
  function isForbiddenTarget(el){if(!el)return false;if(el.id&&forbiddenIds.has(el.id))return true;const idClass=[el.id,el.className,el.getAttribute?.('name'),el.getAttribute?.('data-action')].filter(Boolean).join(' ');return forbiddenActionPattern.test(String(idClass));}
  function resolveTarget(step){const a=safeSelector(step.primary);if(isVisible(a)&&!isForbiddenTarget(a))return {el:a,kind:'primary'};const b=safeSelector(step.fallback);if(isVisible(b)&&!isForbiddenTarget(b))return {el:b,kind:'fallback'};return null;}
  function pathFor(route){const base=String(window.DPRO_SCHOOL_CONFIG?.pagesBaseUrl||location.origin+location.pathname.replace(/[^/]*$/,'')).replace(/\/+$/,'/');return new URL(route.replace(/^\//,''),base).toString();}
  function persistForIndex(i,extra){const s=steps[i];const completed=Array.from(new Set([...(readState().completedStepKeys||[]),...steps.slice(0,i).map(x=>x.key)]));return writeState(Object.assign({currentStepKey:s.key,nextStepKey:s.key,completedStepKeys:completed,route:s.route,closed:false,skipped:false,complete:false},extra||{}));}
  function navigateTo(route,nextKey){writeState({currentStepKey:nextKey,nextStepKey:nextKey,route,closed:false});location.assign(pathFor(route));}

  function buildUI(){
    if(root)return;
    root=document.createElement('div');root.id='dpro-tutorial-school-root';root.setAttribute('data-dpro-tutorial-root','school');
    root.innerHTML=`<div class="dpro-tut-highlight" data-dpro-tutorial-highlight></div>
      <div class="dpro-tut-card" data-dpro-tutorial-card hidden role="dialog" aria-modal="false" aria-labelledby="dproTutTitle">
        <div class="dpro-tut-handle" data-dpro-tutorial-drag-handle tabindex="0" aria-label="チュートリアルカードを移動">
          <span class="dpro-tut-grip">DRAG</span><span class="dpro-tut-count" data-dpro-tutorial-count>1 / 10</span>
        </div>
        <div class="dpro-tut-body"><p class="dpro-tut-kicker">DPRO TUTORIAL / SCHOOL</p><h2 class="dpro-tut-title" id="dproTutTitle" data-dpro-tutorial-title tabindex="-1"></h2><p class="dpro-tut-copy" data-dpro-tutorial-purpose></p><div class="dpro-tut-safety" data-dpro-tutorial-safety></div><div class="dpro-tut-warning" data-dpro-tutorial-warning></div><div class="dpro-tut-actions"><button type="button" data-dpro-tutorial-action="back">戻る</button><button type="button" data-dpro-tutorial-action="next">次へ</button></div><div class="dpro-tut-utility"><button type="button" data-dpro-tutorial-action="close">閉じる</button><button type="button" data-dpro-tutorial-action="skip">スキップ</button></div></div>
      </div>
      <div class="dpro-tut-launcher" data-dpro-tutorial-launcher><button type="button" data-dpro-tutorial-start>操作ガイドを開始</button></div>`;
    document.body.appendChild(root);
    launcher=root.querySelector('[data-dpro-tutorial-launcher]');launcherBtn=root.querySelector('[data-dpro-tutorial-start]');card=root.querySelector('[data-dpro-tutorial-card]');highlight=root.querySelector('[data-dpro-tutorial-highlight]');handle=root.querySelector('[data-dpro-tutorial-drag-handle]');titleEl=root.querySelector('[data-dpro-tutorial-title]');countEl=root.querySelector('[data-dpro-tutorial-count]');purposeEl=root.querySelector('[data-dpro-tutorial-purpose]');safetyEl=root.querySelector('[data-dpro-tutorial-safety]');warningEl=root.querySelector('[data-dpro-tutorial-warning]');backBtn=root.querySelector('[data-dpro-tutorial-action="back"]');nextBtn=root.querySelector('[data-dpro-tutorial-action="next"]');closeBtn=root.querySelector('[data-dpro-tutorial-action="close"]');skipBtn=root.querySelector('[data-dpro-tutorial-action="skip"]');
    launcherBtn.addEventListener('click',()=>{const s=readState();if(s.complete||s.skipped)replay();else startOrResume();});
    backBtn.addEventListener('click',back);nextBtn.addEventListener('click',next);closeBtn.addEventListener('click',close);skipBtn.addEventListener('click',skip);
    handle.addEventListener('pointerdown',beginDrag);window.addEventListener('pointermove',moveDrag,{passive:false});window.addEventListener('pointerup',endDrag);window.addEventListener('pointercancel',endDrag);
    window.addEventListener('resize',()=>{clampCard();updateHighlight();});window.addEventListener('scroll',updateHighlight,{passive:true});document.addEventListener('keydown',onKey);
    updateLauncher();
  }
  function updateLauncher(){if(!launcherBtn)return;const fresh=!localStorage.getItem(stateKey());const s=readState();launcherBtn.textContent=fresh?'操作ガイドを開始':(s.complete||s.skipped?'Replay':(s.closed?'Resume':'操作ガイドを再開'));launcherBtn.setAttribute('data-state',fresh?'fresh':s.complete?'complete':s.skipped?'skipped':s.closed?'closed':'active');}
  function showStep(i,opts){
    opts=opts||{};currentIndex=Math.max(0,Math.min(steps.length-1,i));const s=steps[currentIndex];persistForIndex(currentIndex);lastFocus=opts.keepLastFocus?lastFocus:document.activeElement;
    card.hidden=false;launcher.hidden=true;countEl.textContent=`${s.step} / ${steps.length}`;titleEl.textContent=s.title;purposeEl.textContent=s.purpose;safetyEl.textContent=s.safety;backBtn.disabled=currentIndex===0;nextBtn.textContent=currentIndex===steps.length-1?'完了':'次へ';nextBtn.setAttribute('data-dpro-tutorial-action',currentIndex===steps.length-1?'complete':'next');
    const resolved=resolveTarget(s);currentTarget=resolved?.el||null;if(resolved){warningEl.classList.remove('show');warningEl.textContent='';positionHighlight(resolved.el);try{resolved.el.scrollIntoView({block:'center',inline:'nearest',behavior:'auto'});}catch(_){}}else{highlight.style.display='none';warningEl.textContent='対象が現在表示されていないため、安全な案内モードで続行します。業務操作は実行しません。';warningEl.classList.add('show');}
    clampCard();titleEl.focus({preventScroll:true});setTimeout(updateHighlight,30);
  }
  function positionHighlight(el){if(!isVisible(el)){highlight.style.display='none';return;}const r=el.getBoundingClientRect();const pad=6;const l=Math.max(2,r.left-pad),t=Math.max(2,r.top-pad),rr=Math.min(innerWidth-2,r.right+pad),bb=Math.min(innerHeight-2,r.bottom+pad);highlight.style.left=l+'px';highlight.style.top=t+'px';highlight.style.width=Math.max(0,rr-l)+'px';highlight.style.height=Math.max(0,bb-t)+'px';highlight.style.display='block';}
  function updateHighlight(){if(card&&!card.hidden&&currentTarget)positionHighlight(currentTarget);}
  function startOrResume(){const s=readState();const idx=stepIndexByKey(s.nextStepKey||s.currentStepKey);const st=steps[idx];if(normalizeRoute()!==st.route){navigateTo(st.route,st.key);return;}showStep(idx);}
  function start(){writeState(Object.assign(defaultState(),{closed:false,currentStepKey:steps[0].key,nextStepKey:steps[0].key,route:steps[0].route}));if(normalizeRoute()!==steps[0].route)navigateTo(steps[0].route,steps[0].key);else showStep(0);}
  function next(){
    if(currentIndex<0)return;const s=steps[currentIndex];const nextIndex=currentIndex+1;const completed=Array.from(new Set([...(readState().completedStepKeys||[]),s.key]));
    if(currentIndex===steps.length-1){writeState({completedStepKeys:completed,currentStepKey:s.key,nextStepKey:s.key,route:s.route,closed:true,complete:true,skipped:false});hideCard();updateLauncher();launcher.hidden=false;launcherBtn.focus();return;}
    const n=steps[nextIndex];writeState({completedStepKeys:completed,currentStepKey:n.key,nextStepKey:n.key,route:n.route,closed:false});if(n.route!==s.route){navigateTo(n.route,n.key);return;}showStep(nextIndex,{keepLastFocus:true});
  }
  function back(){if(currentIndex<=0)return;const p=steps[currentIndex-1];writeState({currentStepKey:p.key,nextStepKey:p.key,route:p.route,closed:false,complete:false,skipped:false});if(p.route!==normalizeRoute()){navigateTo(p.route,p.key);return;}showStep(currentIndex-1,{keepLastFocus:true});}
  function hideCard(){card.hidden=true;highlight.style.display='none';currentTarget=null;currentIndex=-1;}
  function close(){if(currentIndex>=0){const s=steps[currentIndex];writeState({currentStepKey:s.key,nextStepKey:s.key,route:s.route,closed:true});}hideCard();updateLauncher();launcher.hidden=false;if(lastFocus&&isVisible(lastFocus)){try{lastFocus.focus({preventScroll:true});return;}catch(_){}}launcherBtn.focus();}
  function skip(){const s=currentIndex>=0?steps[currentIndex]:steps[0];writeState({currentStepKey:s.key,nextStepKey:s.key,route:s.route,closed:true,skipped:true,complete:false});hideCard();updateLauncher();launcher.hidden=false;launcherBtn.focus();}
  function replay(){localStorage.removeItem(stateKey());writeState({closed:false,currentStepKey:steps[0].key,nextStepKey:steps[0].key,route:steps[0].route,completedStepKeys:[],skipped:false,complete:false});if(normalizeRoute()!==steps[0].route)navigateTo(steps[0].route,steps[0].key);else showStep(0);}
  function onKey(e){if(e.key==='Escape'&&card&&!card.hidden){e.preventDefault();close();return;}if(card&&!card.hidden&&e.altKey&&e.key==='ArrowRight'){e.preventDefault();next();}if(card&&!card.hidden&&e.altKey&&e.key==='ArrowLeft'){e.preventDefault();back();}}
  function beginDrag(e){if(e.button!==undefined&&e.button!==0)return;if(!card||card.hidden)return;const r=card.getBoundingClientRect();drag={id:e.pointerId,dx:e.clientX-r.left,dy:e.clientY-r.top};card.style.right='auto';card.style.bottom='auto';card.style.left=r.left+'px';card.style.top=r.top+'px';try{handle.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();}
  function moveDrag(e){if(!drag||e.pointerId!==drag.id)return;const r=card.getBoundingClientRect();const maxX=Math.max(0,innerWidth-r.width),maxY=Math.max(0,innerHeight-r.height);card.style.left=Math.max(0,Math.min(maxX,e.clientX-drag.dx))+'px';card.style.top=Math.max(0,Math.min(maxY,e.clientY-drag.dy))+'px';e.preventDefault();}
  function endDrag(e){if(!drag||e.pointerId!==drag.id)return;try{handle.releasePointerCapture(e.pointerId);}catch(_){}drag=null;clampCard();}
  function clampCard(){if(!card||card.hidden)return;const r=card.getBoundingClientRect();const maxX=Math.max(0,innerWidth-r.width),maxY=Math.max(0,innerHeight-r.height);let left=r.left,top=r.top;if(getComputedStyle(card).right!=='auto'&&!card.style.left)return;left=Math.max(0,Math.min(maxX,left));top=Math.max(0,Math.min(maxY,top));card.style.left=left+'px';card.style.top=top+'px';card.style.right='auto';card.style.bottom='auto';}
  function status(){const s=readState();return {tutorialId:TUTORIAL_ID,version:VERSION,route:normalizeRoute(),state:s,first10Count:steps.length,currentIndex,currentTargetSelector:currentIndex>=0?(isVisible(safeSelector(steps[currentIndex].primary))?steps[currentIndex].primary:steps[currentIndex].fallback):null,businessMutation:0};}
  function init(){buildUI();const route=normalizeRoute();if(!allowedRoutes.has(route)){launcher.hidden=true;return;}const s=readState();updateLauncher();if(!s.closed&&!s.complete&&!s.skipped){const idx=stepIndexByKey(s.nextStepKey||s.currentStepKey);if(steps[idx].route===route)showStep(idx);}}

  window.DPRO_TUTORIAL_SCHOOL={id:TUTORIAL_ID,version:VERSION,steps:steps.map(x=>Object.assign({},x)),first10Count:steps.length,start,startOrResume,resume:startOrResume,replay,close,skip,status,stateKey,readState};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
