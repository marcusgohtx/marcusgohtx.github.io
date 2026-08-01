// Room creation needs the returned code before room.js starts its live session.
(function () {
  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-r="create"]');
    if (!button) return;
    event.preventDefault(); event.stopImmediatePropagation();
    const name=document.getElementById('rn')?.value.trim(), title=document.getElementById('rt')?.value.trim();
    const mode=document.getElementById('rm')?.value, custom=mode==='custom';
    const source=mode==='deep'?'own':mode==='quick'?'premade':document.getElementById('rs')?.value;
    const config={mode,source,playerCount:+document.getElementById('rp').value,itemsPerCategory:custom?+document.getElementById('ri').value:5,roundCount:custom?+document.getElementById('rr').value:1,roundCardCounts:Object.fromEntries(['love','strength','opportunity','need'].map(k=>[k,custom?+document.getElementById('rc'+k).value:1]))};
    if(!name)return;
    const db=supabase.createClient(IKIGAI_SUPABASE.url,IKIGAI_SUPABASE.publishableKey);
    let {data:{session}}=await db.auth.getSession(); if(!session) await db.auth.signInAnonymously();
    const {data,error}=await db.rpc('create_ikigai_room',{p_name:name,p_title:title,p_config:config});
    if(error){ alert(error.message); return; }
    const code=data?.[0]?.code||data?.code; location.search='room='+encodeURIComponent(code);
  }, true);
}());
