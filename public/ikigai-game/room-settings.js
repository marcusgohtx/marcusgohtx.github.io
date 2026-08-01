(function () {
  const cats=['love','strength','opportunity','need'];
  const code=new URLSearchParams(location.search).get('room');
  function settings() {
    const start=document.querySelector('[data-r="start"]');
    if(!start || document.getElementById('room-settings')) return;
    start.closest('.form-foot').insertAdjacentHTML('afterbegin', `<div id="room-settings"><p class="field-label">Game mode</p><select id="room-setting-mode"><option value="quick">Quick · draft pre-made activities</option><option value="deep">Deep · write your own activities</option><option value="custom">Custom</option></select><div id="room-setting-custom" hidden><label class="field-label">Activity source</label><select id="room-setting-source"><option value="premade">Pre-made cards</option><option value="own">Self-generated activities</option></select><div class="config-grid"><label>Items/category<input id="room-setting-items" type="number" min="1" max="8" value="5"></label><label>Table rounds<input id="room-setting-rounds" type="number" min="1" max="24" value="1"></label></div>${cats.map(c=>`<label>${c==='love'?'What you love':c==='strength'?'What you are good at':c==='opportunity'?'What you can be paid for':'What the world needs'}<input id="room-setting-${c}" type="number" min="0" max="8" value="1"></label>`).join('')}</div><button class="button quiet" data-save-settings>Save game settings</button><p class="helper" id="room-settings-status">Quick is selected by default.</p></div>`);
  }
  async function save() {
    const mode=document.getElementById('room-setting-mode').value, custom=mode==='custom';
    const config={mode,source:mode==='deep'?'own':mode==='quick'?'premade':document.getElementById('room-setting-source').value,itemsPerCategory:custom?+document.getElementById('room-setting-items').value:5,roundCount:custom?+document.getElementById('room-setting-rounds').value:1,roundCardCounts:Object.fromEntries(cats.map(c=>[c,custom?+document.getElementById('room-setting-'+c).value:1]))};
    const db=supabase.createClient(IKIGAI_SUPABASE.url,IKIGAI_SUPABASE.publishableKey); const {error}=await db.rpc('configure_ikigai_room',{p_code:code,p_config:config});
    document.getElementById('room-settings-status').textContent=error?error.message:'Settings saved. You can start when ready.';
  }
  document.addEventListener('click',event=>{if(event.target.closest('[data-save-settings]'))save();});
  document.addEventListener('change',event=>{if(event.target.id==='room-setting-mode'){document.getElementById('room-setting-custom').hidden=event.target.value!=='custom';document.getElementById('room-settings-status').textContent=event.target.value==='deep'?'Deep: everyone writes five activities in each category.':event.target.value==='quick'?'Quick: everyone drafts five pre-made activities in each category.':'Custom: choose the counts below.';}});
  new MutationObserver(settings).observe(document.getElementById('app'),{childList:true,subtree:true}); settings();
}());
