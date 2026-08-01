// A room begins with a code, not a headcount. The host starts whenever at
// least one friend has joined; the database then locks in that player count.
(function () {
  const categories = ['love', 'strength', 'opportunity', 'need'];
  function showHost() {
    document.getElementById('app').innerHTML = `<div class="shell"><header class="topbar"><button class="brand" data-r="local"><span class="brand-mark">i</span>ikigai</button></header><section class="screen-head"><div class="eyebrow">host a room</div><h2>Create a room code.</h2><p class="lead">Share it with friends. You can start as soon as at least one friend joins.</p></section><section class="panel"><label class="field-label" for="simple-name">Your name</label><input id="simple-name" maxlength="24" autofocus><div class="form-foot"><button class="button coral" data-simple-create>Create room →</button></div></section></div>`;
  }
  async function create() {
    const name=document.getElementById('simple-name').value.trim(); if(!name)return;
    const db=supabase.createClient(IKIGAI_SUPABASE.url,IKIGAI_SUPABASE.publishableKey);
    let {data:{session}}=await db.auth.getSession(); if(!session) await db.auth.signInAnonymously();
    const config={mode:'quick',source:'premade',playerCount:8,itemsPerCategory:5,roundCount:1,roundCardCounts:Object.fromEntries(categories.map(category=>[category,1]))};
    const {data,error}=await db.rpc('create_ikigai_room',{p_name:name,p_title:'Career Possibilities',p_config:config});
    if(error){alert(error.message);return;} location.search='room='+encodeURIComponent(data?.[0]?.code||data?.code);
  }
  function unlockStart() {
    const start=document.querySelector('[data-r="start"]'); if(!start)return;
    const count=document.querySelectorAll('.stack-list .pass-card').length;
    start.disabled=count<2;
    const prior=document.getElementById('room-waiting-hint');
    if(prior) prior.textContent=count<2?'Waiting for one friend to join with this room code.':'Ready — the host can start whenever you like.';
  }
  document.addEventListener('click',event=>{
    const host=event.target.closest('[data-r="host"],[data-room-action="host"]');
    if(host){event.preventDefault();event.stopImmediatePropagation();showHost();return;}
    if(event.target.closest('[data-simple-create]')){event.preventDefault();event.stopImmediatePropagation();create();}
  },true);
  new MutationObserver(unlockStart).observe(document.getElementById('app'),{childList:true,subtree:true});
  unlockStart();
}());
