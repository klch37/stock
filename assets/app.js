// 熱股雷達 — 前端邏輯
// 資料來源：n8n（kailinstock）的 hot-stocks / stock-analysis webhook
// 若即時抓取失敗（例如 n8n 尚未開放 CORS），會自動退回 data/snapshot.json 內的快照資料。

const HOT_STOCKS_ENDPOINT = "https://kailinstock.zeabur.app/webhook/hot-stocks";
const STOCK_ANALYSIS_ENDPOINT = "https://kailinstock.zeabur.app/webhook/stock-analysis";
const LOCAL_SNAPSHOT_PATH = "data/snapshot.json";
const LIVE_REFRESH_INTERVAL_MS = 60 * 1000;

// 內建保底快照：即使 data/snapshot.json 也抓不到（例如直接雙擊開啟 index.html，
// 瀏覽器會擋掉 file:// 底下的 fetch），頁面仍能顯示這份資料，不會開天窗。
const BUNDLED_FALLBACK_SNAPSHOT = {"tradingDates": ["20260909", "20260908", "20260907"], "baseDate": "20260904", "marketDate": "20260909", "marketStockCount": 1129, "marketETFCount": 237, "hotStocks": [{"code": "2330", "name": "台積電", "price": 2465, "changePct": 2.28, "tradeVolume": 73628871, "tradeValue": 181645049698, "hotScore": 64.48}, {"code": "2303", "name": "聯電", "price": 141.5, "changePct": 8.85, "tradeVolume": 827229119, "tradeValue": 115993312377, "hotScore": 63.49}, {"code": "2409", "name": "友達", "price": 30.5, "changePct": 13.81, "tradeVolume": 1737057070, "tradeValue": 51787427341, "hotScore": 57.11}, {"code": "2454", "name": "聯發科", "price": 4625, "changePct": 4.76, "tradeVolume": 29090900, "tradeValue": 137401658351, "hotScore": 52.94}, {"code": "2344", "name": "華邦電", "price": 183, "changePct": 5.17, "tradeVolume": 481583833, "tradeValue": 89284567329, "hotScore": 44.18}], "hotETFs": [{"code": "00631L", "name": "元大台灣50正2", "price": 37.54, "changePct": 2.46, "tradeVolume": 522773797, "tradeValue": 19742009690, "hotScore": 71.78}, {"code": "0050", "name": "元大台灣50", "price": 109.65, "changePct": 1.62, "tradeVolume": 230021570, "tradeValue": 25279147468, "hotScore": 71.77}, {"code": "00981A", "name": "主動統一台股增長", "price": 29.92, "changePct": 0.5, "tradeVolume": 438270517, "tradeValue": 13178798415, "hotScore": 49.83}, {"code": "00919", "name": "群益台灣精選高息", "price": 32.58, "changePct": -1.33, "tradeVolume": 397250231, "tradeValue": 13014792752, "hotScore": 49.02}, {"code": "00685L", "name": "群益臺灣加權正2", "price": 12.39, "changePct": 2.14, "tradeVolume": 615614046, "tradeValue": 7673961263, "hotScore": 46.42}], "stockAIAnalysis": "# 🔥 熱門股票 Top 5 分析\n\n## 1. 台積電（2330）\n- 最新股價：2,465 元\n- 近3日漲跌幅：+2.28%\n- 近3日累計成交金額：約 1,816.45 億元\n- 熱度分數：64.48\n- 市場熱度分析：台積電以最高的熱度分數奪冠，成交金額也是五檔中最大，顯示資金集中度高。漲幅相對溫和，反映權值股在大盤中的穩定吸金能力，成交量雖非最大，但單價高，整體資金流入規模驚人，顯示法人與大戶籌碼動能仍集中在龍頭股上。\n\n## 2. 聯電（2303）\n- 最新股價：141.5 元\n- 近3日漲跌幅：+8.85%\n- 近3日累計成交金額：約 1,159.93 億元\n- 熱度分數：63.49\n- 市場熱度分析：聯電漲幅與成交量同步放大，累計成交量超過8億股，顯示市場交易熱絡、換手率高。漲跌幅接近9%，顯示短線資金積極追價，可能與晶圓代工族群及半導體景氣預期相關，是本次族群中價量齊揚的代表。\n\n## 3. 友達（2409）\n- 最新股價：30.5 元\n- 近3日漲跌幅：+13.81%\n- 近3日累計成交金額：約 517.87 億元\n- 熱度分數：57.11\n- 市場熱度分析：友達漲幅居五檔之冠，累計成交量高達17億股以上，屬於典型的低價高轉手股，顯示散戶與短線資金積極介入。雖然成交金額相對較低（因股價基期低），但成交量能", "etfAIAnalysis": "# 🔥 近3日台股熱門排行\n**統計交易日：20260907、20260908、20260909**\n\n## 📈 熱門股票 Top 5\n\n1. **台積電（2330）**\n   - 最新股價：2465 元\n   - 近3日漲跌幅：+2.28%\n   - 近3日累計成交金額：約 1,816 億元\n   - 熱度分數：64.48\n   - 特色：成交金額居冠，屬於資金最集中的權值股，漲勢穩健帶動關注度。\n\n2. **聯電（2303）**\n   - 最新股價：141.5 元\n   - 近3日漲跌幅：+8.85%\n   - 近3日累計成交金額：約 1,160 億元\n   - 熱度分數：63.49\n   - 特色：成交量最大（逾8億股），漲幅顯著，資金與價格同步強勢。\n\n3. **友達（2409）**\n   - 最新股價：30.5 元\n   - 近3日漲跌幅：+13.81%\n   - 近3日累計成交金額：約 518 億元\n   - 熱度分數：57.11\n   - 特色：漲幅最大且成交量驚人（逾17億股），屬於資金與投機動能雙高的標的。\n\n4. **聯發科（2454）**\n   - 最新股價：4625 元\n   - 近3日漲跌幅：+4.76%\n   - 近3日累計成交金額：約 1,374 億元\n   - 熱度分數：52.94\n   - 特色：高單價股仍吸引大量資金進場，成交金額排名第二。\n\n5. **華邦電（2344）**\n   - 最新股價：183 元\n   - 近3日漲跌幅：+5.17%\n   - 近3日累計成交金額：約 893 億元\n   - 熱度分數：44.18\n   - 特色：漲勢穩定，交易量與金額皆維持一定熱度，但相對前四者略低。\n\n---\n\n## 📊 熱門 ETF Top 5\n\n1. **元大台灣50正2（00631L）**\n   - 最新價格：37.54 元\n   - 近3日漲跌幅：+2.46%\n   - 近3日累計成交金額：約 197 億元\n"};

let SNAPSHOT = BUNDLED_FALLBACK_SNAPSHOT;

// ---------- formatting helpers ----------
const fmtPrice = n => Number(n).toLocaleString('zh-Hant-TW', { maximumFractionDigits: 2 });
const fmtPct = n => (n > 0 ? '+' : '') + n.toFixed(2) + '%';
const fmtValue = n => (n / 1e8).toFixed(1) + ' 億';
const fmtDate = d => `${d.slice(0,4)}/${d.slice(4,6)}/${d.slice(6,8)}`;
const fmtTime = d => d.toLocaleTimeString('zh-Hant-TW', { hour: '2-digit', minute: '2-digit' });

function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function inline(s){ return escapeHtml(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); }

function mdToHtml(md){
  if (!md) return '';
  const lines = md.split('\n');
  let html = '', inList = false;
  const closeList = () => { if (inList){ html += '</ul>'; inList = false; } };
  for (let raw of lines){
    const line = raw.trim();
    if (!line){ closeList(); continue; }
    if (line.startsWith('### ')){ closeList(); html += `<h5 class="md-h3">${inline(line.slice(4))}</h5>`; continue; }
    if (line.startsWith('## ')){ closeList(); html += `<h4 class="md-h2">${inline(line.slice(3))}</h4>`; continue; }
    if (line.startsWith('# ')){ closeList(); html += `<h3 class="md-h1">${inline(line.slice(2))}</h3>`; continue; }
    if (line === '---'){ closeList(); html += '<hr class="md-hr">'; continue; }
    if (line.startsWith('- ')){ if (!inList){ html += '<ul class="md-list">'; inList = true; } html += `<li>${inline(line.slice(2))}</li>`; continue; }
    if (/^\d+\.\s/.test(line)){ if (!inList){ html += '<ul class="md-list">'; inList = true; } html += `<li>${inline(line.replace(/^\d+\.\s/, ''))}</li>`; continue; }
    closeList();
    html += `<p>${inline(line)}</p>`;
  }
  closeList();
  return html;
}

function findSection(markdown, name){
  const parts = markdown.split(/\n(?=##\s)/);
  return parts.find(p => p.includes(name)) || '';
}

// ---------- ticker ----------
function renderTicker(){
  const combined = [...SNAPSHOT.hotStocks, ...SNAPSHOT.hotETFs];
  const chip = it => {
    const up = it.changePct >= 0;
    return `<span class="ticker-chip"><span class="t-code">${it.code}</span><span class="t-name">${it.name}</span><span class="t-pct ${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${fmtPct(it.changePct)}</span></span>`;
  };
  const row = combined.map(chip).join('');
  document.getElementById('ticker-track').innerHTML = row + row;
}

// ---------- overview ----------
function renderOverview(){
  const dates = SNAPSHOT.tradingDates;
  const range = `${fmtDate(dates[dates.length-1])} – ${fmtDate(dates[0])}`;
  document.getElementById('pill-date').textContent = fmtDate(SNAPSHOT.marketDate);

  const tiles = [
    { label: '大盤日期', value: fmtDate(SNAPSHOT.marketDate), sub: '資料快照時間' },
    { label: '統計區間', value: range, sub: `共 ${dates.length} 個交易日` },
    { label: '觀察股票數', value: SNAPSHOT.marketStockCount.toLocaleString('zh-Hant-TW'), sub: '全市場個股' },
    { label: '觀察 ETF 數', value: SNAPSHOT.marketETFCount.toLocaleString('zh-Hant-TW'), sub: '全市場 ETF' },
  ];
  document.getElementById('stat-grid').innerHTML = tiles.map(t => `
    <div class="stat-tile">
      <div class="stat-label">${t.label}</div>
      <div class="stat-value mono">${t.value}</div>
      <div class="stat-sub">${t.sub}</div>
    </div>`).join('');

  const spot = (it, kicker, blurbMd) => {
    const up = it.changePct >= 0;
    return `
    <div class="spotlight">
      <span class="spotlight-kicker">${kicker}</span>
      <div class="spotlight-head">
        <div>
          <div class="spotlight-name">${it.name}</div>
          <div class="spotlight-code mono">${it.code} · 成交額 ${fmtValue(it.tradeValue)}</div>
        </div>
        <span class="spotlight-pct ${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${fmtPct(it.changePct)}</span>
      </div>
      <div class="spotlight-price mono">${fmtPrice(it.price)}</div>
      <div class="spotlight-blurb">${mdToHtml(blurbMd) || '目前尚無 AI 分析文字。'}</div>
      <button class="spotlight-link" data-jump="view-ranking">查看完整分析 →</button>
    </div>`;
  };

  const topStock = SNAPSHOT.hotStocks[0];
  const topEtf = SNAPSHOT.hotETFs[0];
  const stockBlurb = findSection(SNAPSHOT.stockAIAnalysis, topStock.name);
  const etfBlurb = findSection(SNAPSHOT.etfAIAnalysis, topEtf.name);

  document.getElementById('spotlight-grid').innerHTML =
    spot(topStock, '熱度冠軍 · 個股', stockBlurb) +
    spot(topEtf, '熱度冠軍 · ETF', etfBlurb);
}

// ---------- ranking lists ----------
function renderRankList(elId, items){
  document.getElementById(elId).innerHTML = items.map((it, idx) => {
    const up = it.changePct >= 0;
    return `
    <li class="rank-row">
      <span class="rank-num ${idx === 0 ? 'top' : ''}">${idx + 1}</span>
      <span class="rank-id">
        <span class="rank-name">${it.name}</span>
        <span class="rank-code">${it.code} · 成交額 ${fmtValue(it.tradeValue)}</span>
      </span>
      <span class="rank-price mono">${fmtPrice(it.price)}</span>
      <span class="rank-pct ${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${fmtPct(it.changePct)}</span>
      <span class="rank-score">
        <span class="score-num">熱度 ${it.hotScore.toFixed(1)}</span>
        <span class="score-meter"><span class="score-meter-fill" style="width:${Math.min(it.hotScore, 100)}%"></span></span>
      </span>
    </li>`;
  }).join('');
}

function renderRanking(){
  renderRankList('list-stocks', SNAPSHOT.hotStocks);
  renderRankList('list-etfs', SNAPSHOT.hotETFs);

  document.getElementById('ai-stocks').innerHTML =
    mdToHtml(SNAPSHOT.stockAIAnalysis) +
    '<div class="note">註：此分析由 n8n 內的 Claude 節點產生，來源回應若中途截斷，可能是該節點的輸出長度限制所致。</div>';

  const etfSection = findSection(SNAPSHOT.etfAIAnalysis, '熱門 ETF Top 5') || SNAPSHOT.etfAIAnalysis;
  document.getElementById('ai-etfs').innerHTML =
    mdToHtml(etfSection) +
    '<div class="note">註：ETF 專屬分析同樣可能受來源回應長度限制而不完整。</div>';
}

function renderAll(){
  renderTicker();
  renderOverview();
  renderRanking();
}

// ---------- live status pill ----------
function setLiveStatus(state){
  const pill = document.getElementById('pill-live');
  pill.className = 'pill ' + state;
  if (state === 'live'){
    pill.innerHTML = `<span class="blip"></span>即時 · ${fmtTime(new Date())}`;
  } else if (state === 'fallback'){
    pill.innerHTML = `快照資料 · ${fmtTime(new Date())}`;
  } else {
    pill.innerHTML = `<span class="blip"></span>載入中`;
  }
}

// ---------- data loading ----------
async function loadLocalSnapshot(){
  const res = await fetch(LOCAL_SNAPSHOT_PATH, { cache: 'no-store' });
  if (!res.ok) throw new Error('local snapshot HTTP ' + res.status);
  return res.json();
}

async function loadLiveSnapshot(){
  const res = await fetch(HOT_STOCKS_ENDPOINT, { cache: 'no-store' });
  if (!res.ok) throw new Error('live fetch HTTP ' + res.status);
  return res.json();
}

async function refreshLive(){
  try {
    SNAPSHOT = await loadLiveSnapshot();
    renderAll();
    setLiveStatus('live');
  } catch (err){
    console.warn('[熱股雷達] 即時資料抓取失敗（可能是 n8n 尚未開放 CORS），沿用快照資料：', err);
    setLiveStatus('fallback');
  }
}

async function init(){
  setLiveStatus('loading');
  try {
    SNAPSHOT = await loadLocalSnapshot();
  } catch (err){
    console.warn('[熱股雷達] 無法載入 data/snapshot.json，使用內建的保底資料：', err);
    SNAPSHOT = BUNDLED_FALLBACK_SNAPSHOT;
  }
  renderAll();
  refreshLive();
  setInterval(refreshLive, LIVE_REFRESH_INTERVAL_MS);
}

// ---------- stock search ----------
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultArea = document.getElementById('result-area');
const statusText = document.getElementById('search-status-text');
const connDot = document.getElementById('conn-dot');

const FIELD_LABELS = {
  stockCode: '股票代號', stockName: '股票名稱', currentPrice: '目前股價',
};

function renderGenericResult(data){
  let html = '';
  const head = [];
  if (data.stockName) head.push(`<div class="spotlight-name">${escapeHtml(data.stockName)}</div>`);
  if (data.stockCode) head.push(`<span class="rank-code mono">${escapeHtml(data.stockCode)}</span>`);
  if (data.currentPrice !== undefined) head.push(`<span class="spotlight-price mono">${escapeHtml(String(data.currentPrice))}</span>`);
  if (head.length) html += `<div style="margin-bottom:14px;">${head.join('<br>')}</div>`;

  for (const [key, value] of Object.entries(data)){
    if (['stockCode','stockName','currentPrice'].includes(key)) continue;
    const label = FIELD_LABELS[key] || key;
    if (typeof value === 'string' && value.length > 30){
      html += `<h4 class="md-h2">${escapeHtml(label)}</h4>${mdToHtml(value)}`;
    } else if (Array.isArray(value)){
      html += `<h4 class="md-h2">${escapeHtml(label)}</h4><ul class="md-list">` +
        value.map(v => `<li>${typeof v === 'object' ? escapeHtml(JSON.stringify(v)) : escapeHtml(String(v))}</li>`).join('') +
        `</ul>`;
    } else if (typeof value === 'object' && value !== null){
      html += `<h4 class="md-h2">${escapeHtml(label)}</h4><pre style="white-space:pre-wrap;font-size:12px;color:var(--ink-muted);">${escapeHtml(JSON.stringify(value, null, 2))}</pre>`;
    } else if (value !== undefined && value !== null && value !== ''){
      html += `<p><strong>${escapeHtml(label)}：</strong>${escapeHtml(String(value))}</p>`;
    }
  }
  resultArea.innerHTML = html || '<p class="result-empty">查詢成功，但沒有可顯示的欄位。</p>';
}

async function queryStock(code){
  searchBtn.disabled = true;
  statusText.textContent = `查詢中…（${code}）`;
  connDot.className = 'conn-dot';
  resultArea.innerHTML = '<p class="result-empty">查詢中，請稍候…</p>';

  try {
    const res = await fetch(`${STOCK_ANALYSIS_ENDPOINT}?stockCode=${encodeURIComponent(code)}`, { method: 'POST' });
    if (!res.ok){
      throw { kind: 'http', status: res.status };
    }
    const data = await res.json();
    connDot.className = 'conn-dot ok';
    statusText.textContent = `已連線 · ${code} 查詢成功`;
    renderGenericResult(data);
  } catch (err){
    connDot.className = 'conn-dot err';
    let title = '查詢失敗';
    let detail = '發生未預期的錯誤，請稍後再試。';
    if (err && err.kind === 'http' && err.status === 404){
      title = 'workflow 尚未啟用（404）';
      detail = 'n8n 的 stock-analysis webhook 目前沒有註冊 production URL。請到 n8n 編輯畫面重新啟用 / 儲存這個 workflow 後再試一次。';
    } else if (err && err.kind === 'http'){
      title = `伺服器回應錯誤（HTTP ${err.status}）`;
      detail = '請確認 n8n workflow 是否正常執行，或查看該 workflow 的 Executions 記錄。';
    } else {
      title = '無法連線到 n8n（可能是 CORS 限制）';
      detail = '瀏覽器封鎖了跨網域請求。若 workflow 已啟用，請在「Respond to Webhook」節點的回應標頭加上 Access-Control-Allow-Origin，才能讓這個頁面直接查詢。';
    }
    statusText.textContent = title;
    resultArea.innerHTML = `<div class="result-error"><strong>${escapeHtml(title)}</strong>${escapeHtml(detail)}</div>`;
  } finally {
    searchBtn.disabled = false;
  }
}

searchForm.addEventListener('submit', e => {
  e.preventDefault();
  const code = searchInput.value.trim();
  if (code) queryStock(code);
});

// ---------- nav ----------
const navButtons = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');
const titles = { 'view-overview': '台股市場總覽', 'view-ranking': '熱門排行榜', 'view-search': '個股分析查詢' };

function switchView(id){
  navButtons.forEach(b => b.classList.toggle('active', b.dataset.view === id));
  views.forEach(v => v.hidden = v.id !== id);
  document.getElementById('topbar-title').textContent = titles[id] || '';
}
navButtons.forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));
document.addEventListener('click', e => {
  const jump = e.target.closest('[data-jump]');
  if (jump) switchView(jump.dataset.jump);
});

init();
