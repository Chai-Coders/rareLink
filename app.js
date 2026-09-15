import { hospitals, symptomCatalog, getHeatmapData, searchSymptoms } from './mock-data.js';

const app = document.querySelector('#app');
let activeSymptom = symptomCatalog[0];
let selectedSymptoms = [activeSymptom];
let queryResults = [];

function hospitalCards(ids) {
  return ids.map(id => { const h = hospitals[id]; return `<div class="hospital-result"><div class="hospital-avatar">${h.initials}</div><div><strong>${h.name}</strong><span>${h.city} · ${h.code}</span><small>${h.contact} · ${h.email}</small></div><button class="link-button" data-contact="${id}">Contact</button></div>`; }).join('');
}

function render() {
  const tagsHtml = selectedSymptoms.map(s => `<button class="tag ${s.id === activeSymptom.id ? 'selected' : ''}" data-symptom="${s.id}">${s.name}<span data-remove="${s.id}">×</span></button>`).join('');
  const pointsHtml = activeSymptom.points.map(([x,y,v]) => `<span class="heat-point" style="left:${x}%;top:${y}%;--intensity:${v}" title="${activeSymptom.name} · ${(v*100).toFixed(0)}% signal"></span>`).join('');
  const resultsHtml = queryResults.map(r => `<button class="result-card" data-symptom="${r.id}"><div class="result-top"><span class="result-name">${r.name}</span><span class="similarity">${Math.round(r.match*100)}% match</span></div><div class="result-meta"><span>${r.category}</span><span>${r.hpo}</span></div><div class="result-hospitals">${r.hospitals.map(id => `<span>◉ ${hospitals[id].name}</span>`).join('')}</div></button>`).join('');
  const queryHtml = queryResults.length ? `<div class="query-label">MATCHED SIGNALS</div>${resultsHtml}` : `<div class="empty-search"><span>⌕</span><p>Try <b>“fever and joint pain”</b><br/>or <b>“muscle weakness”</b></p></div>`;
  app.innerHTML = `<main class="shell">
    <aside class="sidebar"><div class="brand"><div class="brand-mark">✦</div><div><b>RareLink</b><span>Hospital intelligence</span></div></div>
      <div class="nav-label">WORKSPACE</div><button class="nav-item active"><span>⌁</span> Symptom landscape</button><button class="nav-item"><span>⌕</span> Query network</button><div class="sidebar-bottom"><div class="privacy"><span class="status-dot"></span><div><b>Privacy boundary active</b><small>Embeddings only · No raw records shared</small></div></div><div class="user"><div class="user-avatar">DR</div><div><b>Dr. Rhea Menon</b><small>Hospital admin</small></div><span>•••</span></div></div>
    </aside>
    <section class="content"><header class="topbar"><div><p class="eyebrow">HOSP-A / BENGALURU</p><h1>Symptom landscape</h1></div><div class="top-actions"><span class="live-pill"><i></i> Network live</span><button class="icon-button">⌘ K</button><div class="notification">♢<em>3</em></div></div></header>
      <div class="intro"><div><h2>Map the signal.</h2><p>Explore symptom patterns across the network without exposing patient records.</p></div><div class="last-sync">Last network sync <b>Just now</b></div></div>
      <section class="workspace-grid"><div class="map-panel panel"><div class="panel-header"><div><h3>Symptom heatmap</h3><p>Network-wide signal density · anonymized</p></div><button class="ghost-button" id="clear-map">Clear map</button></div><div class="symptom-entry"><span class="search-icon">⌕</span><input id="symptom-input" placeholder="Add a symptom, e.g. recurrent fever" autocomplete="off"/><button id="add-symptom">Add symptom <b>↵</b></button><div id="suggestions" class="suggestions hidden"></div></div><div class="active-tags">${tagsHtml}</div><div class="map-wrap"><div class="map-grid"></div><div class="map-water"></div><div class="map-label label-1">NORTH ZONE</div><div class="map-label label-2">SOUTH ZONE</div><div id="heat-points">${pointsHtml}</div><div class="map-legend"><span>LOW</span><i></i><span>HIGH</span></div></div><div class="map-footer"><div><span class="metric-number">${activeSymptom.points.length}</span><span>signal clusters</span></div><div><span class="metric-number">${activeSymptom.hospitals.length}</span><span>contributing hospitals</span></div><div><span class="metric-number">${activeSymptom.hpo}</span><span>HPO term</span></div></div></div>
        <div class="query-panel panel"><div class="panel-header"><div><h3>Query the network</h3><p>Semantic search across categorized symptoms</p></div><span class="ai-badge">AI</span></div><div class="chat-area"><div class="assistant-message"><div class="mini-avatar">✦</div><div><b>Network assistant</b><p>Describe a symptom or symptom cluster. I’ll surface the closest categorized signals and the hospitals that contributed them.</p></div></div>${queryHtml}</div><div class="query-box"><textarea id="query-input" rows="2" placeholder="Ask about a symptom or cluster..."></textarea><button id="query-submit">↑</button><small>Mock vector search · Replace with service later</small></div></div></section>
      <div class="disclaimer"><span>ⓘ</span><p><b>Decision support only.</b> Signals are aggregated from participating hospitals and must be reviewed by a qualified specialist before clinical action.</p><span class="secure">▣ Encrypted channel</span></div>
    </section></main>`;
  bindEvents();
}

function bindEvents() {
  document.querySelector('#query-submit').onclick = () => { queryResults = searchSymptoms(document.querySelector('#query-input').value); render(); };
  document.querySelector('#query-input').onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); document.querySelector('#query-submit').click(); } };
  document.querySelector('#add-symptom').onclick = addSymptom;
  document.querySelector('#symptom-input').onkeydown = e => { if (e.key === 'Enter') addSymptom(); };
  document.querySelector('#symptom-input').oninput = e => { const matches = searchSymptoms(e.target.value); const box = document.querySelector('#suggestions'); box.innerHTML = matches.slice(0,3).map(s => `<button data-suggestion="${s.id}">${s.name}<small>${s.category}</small></button>`).join(''); box.classList.toggle('hidden', !e.target.value || !matches.length); box.querySelectorAll('[data-suggestion]').forEach(b => b.onclick = () => chooseSymptom(b.dataset.suggestion)); };
  document.querySelector('#clear-map').onclick = () => { selectedSymptoms=[]; render(); };
  document.querySelectorAll('[data-symptom]').forEach(b => b.onclick = () => chooseSymptom(b.dataset.symptom));
  document.querySelectorAll('[data-remove]').forEach(b => b.onclick = e => { e.stopPropagation(); selectedSymptoms = selectedSymptoms.filter(s => s.id !== b.dataset.remove); if (!selectedSymptoms.length) selectedSymptoms=[activeSymptom]; render(); });
  document.querySelectorAll('[data-contact]').forEach(b => b.onclick = () => alert(`Contact ${hospitals[b.dataset.contact].name} through the secure hospital channel.`));
}
function chooseSymptom(id) { const s = getHeatmapData(id); activeSymptom=s; if (!selectedSymptoms.find(x=>x.id===id)) selectedSymptoms.push(s); render(); }
function addSymptom() { const input=document.querySelector('#symptom-input'); const result=searchSymptoms(input.value)[0]; if(result) chooseSymptom(result.id); }
render();
