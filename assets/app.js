// 熱股雷達 — 前端邏輯
// 資料來源：n8n（kailinstock）的 hot-stocks / stock-analysis webhook
// 若即時抓取失敗（網路問題、n8n 主機異常等），會自動退回 data/snapshot.json 內的快照資料。

const HOT_STOCKS_ENDPOINT = "https://kailinstock.zeabur.app/webhook/hot-stocks";
const STOCK_ANALYSIS_ENDPOINT = "https://kailinstock.zeabur.app/webhook/stock-analysis";
const LOCAL_SNAPSHOT_PATH = "data/snapshot.json";

// 內建保底快照：即使 data/snapshot.json 也抓不到（例如直接雙擊開啟 index.html，
// 瀏覽器會擋掉 file:// 底下的 fetch），頁面仍能顯示這份資料，不會開天窗。
const BUNDLED_FALLBACK_SNAPSHOT = {"tradingDates": ["20260921", "20260918", "20260917"], "baseDate": "20260916", "marketDate": "20260921", "marketStockCount": 1121, "marketETFCount": 234, "hotStocks": [{"code": "2330", "name": "台積電", "price": 2480, "changePct": 4.2, "tradeVolume": 75096172, "tradeValue": 184100029769, "hotScore": 67.52}, {"code": "2303", "name": "聯電", "price": 157, "changePct": 10.56, "tradeVolume": 722205123, "tradeValue": 110348130166, "hotScore": 62.68}, {"code": "2454", "name": "聯發科", "price": 5010, "changePct": 10.6, "tradeVolume": 28098102, "tradeValue": 133795732795, "hotScore": 59.06}, {"code": "2409", "name": "友達", "price": 33.35, "changePct": 13.44, "tradeVolume": 1540594477, "tradeValue": 48558558861, "hotScore": 55.83}, {"code": "2308", "name": "台達電", "price": 1875, "changePct": 9.65, "tradeVolume": 42949700, "tradeValue": 76222827980, "hotScore": 40.01}], "hotETFs": [{"code": "00631L", "name": "元大台灣50正2", "price": 38.45, "changePct": 8.13, "tradeVolume": 598227478, "tradeValue": 22407009432, "hotScore": 76.46}, {"code": "0050", "name": "元大台灣50", "price": 111.35, "changePct": 4.16, "tradeVolume": 256257901, "tradeValue": 28193753632, "hotScore": 73.34}, {"code": "00918", "name": "大華優利高填息30", "price": 34.19, "changePct": -4.18, "tradeVolume": 504518608, "tradeValue": 17634766380, "hotScore": 57.78}, {"code": "00685L", "name": "群益臺灣加權正2", "price": 12.71, "changePct": 8.35, "tradeVolume": 763244169, "tradeValue": 9417457102, "hotScore": 53.72}, {"code": "00981A", "name": "主動統一台股增長", "price": 29.57, "changePct": 4.38, "tradeVolume": 488018403, "tradeValue": 14107260052, "hotScore": 50.12}], "stockAIAnalysis": "# 🔥 熱門股票 Top 5 分析\n\n## 1. 台積電（2330）\n- 最新股價：2,480元\n- 近3日漲跌幅：+4.2%\n- 近3日累計成交金額：約1,841億元\n- 熱度分數：67.52\n- 市場熱度分析：以近3日累計成交金額而言，台積電居五檔之冠，顯示資金高度集中於此檔權值股，儘管漲幅相對溫和，但成交量能與資金流入規模龐大，反映法人與市場資金對其關注度極高，帶動整體熱度分數位居第一。\n\n## 2. 聯電（2303）\n- 最新股價：157元\n- 近3日漲跌幅：+10.56%\n- 近3日累計成交金額：約1,103億元\n- 熱度分數：62.68\n- 市場熱度分析：聯電近3日成交量高達7.2億股，為五檔中量能最大者，顯示散戶與短線資金積極參與，加上漲幅超過一成，價量齊揚態勢明顯，市場交易熱絡程度極高。\n\n## 3. 聯發科（2454）\n- 最新股價：5,010元\n- 近3日漲跌幅：+10.6%\n- 近3日累計成交金額：約1,338億元\n- 熱度分數：59.06\n- 市場熱度分析：聯發科股價維持在高單位數千元區間，漲幅逾一成且成交金額緊追台積電，顯示雖然成交量不算最大，但因股價基期高，帶動成交金額龐大，反映資金對其市場關注度持續升溫。\n\n## 4. 友達（2409）\n- 最新股價：33.35元\n- 近3日漲跌幅：+13.44%\n- 近3日累計成交金額：約486億元\n- 熱度分數：55.83\n- 市場熱度分析：友達為五檔中漲幅最高者，且成交量高達15.4億股，屬於低價股中資金活躍度極高的標的，顯示短線投機性買盤積極介入，價量表現相當強勢。\n\n## 5. 台達電（2308）\n- 最新股價：1,875元\n- 近3日漲跌幅：+9.65%\n- 近3日累計成交金額：約762億元\n- 熱度分數：40.01\n- 市場熱度分析：台達電漲幅接近一成，成交金額也有一定規模，但整體熱度分數相對五檔中最低，顯示市場關注度雖存在，但資金追捧程度不如其他四檔積極。\n\n## 📌 股票市場觀察\n- 五檔股票近3日皆呈現上漲格局，漲幅介於4.2%至13.44%之間，顯示市場資金明顯偏多操作。\n- 台積電雖漲幅最小，但成交金額最高，顯示資金仍以權值股為主要佈局重心。\n- 聯電與友達成交量能極為龐大（分別逾7億股與15億股），顯示中低價股受到散戶與短線資金高度追捧。\n- 聯發科與台達電屬於高價股，雖成交量不若聯電、友達龐大，但憑藉股價基期高，帶動成交金額同樣可觀。\n- 整體而言，五檔股票呈現「價量齊揚」態勢，反映近期台股市場交投氣氛熱絡，資金集中於權值股與高成交動能標的。", "etfAIAnalysis": "# 🔥 近3日台股熱門排行\n\n## 📈 熱門股票 Top 5\n\n**1. 台積電（2330）**\n- 最新股價：2,480 元\n- 近3日漲跌幅：+4.2%\n- 近3日累計成交金額：約1,841億元\n- 熱度分數：67.52\n- 熱度特色：成交金額居冠，資金最集中的權值股，漲勢穩健帶動大盤關注。\n\n**2. 聯電（2303）**\n- 最新股價：157 元\n- 近3日漲跌幅：+10.56%\n- 近3日累計成交金額：約1,103億元\n- 熱度分數：62.68\n- 熱度特色：成交量高達7.2億張為五檔之冠，漲幅雙位數，散戶交投最活躍。\n\n**3. 聯發科（2454）**\n- 最新股價：5,010 元\n- 近3日漲跌幅：+10.6%\n- 近3日累計成交金額：約1,338億元\n- 熱度分數：59.06\n- 熱度特色：高價股中漲幅與成交金額雙高，資金積極追捧。\n\n**4. 友達（2409）**\n- 最新股價：33.35 元\n- 近3日漲跌幅：+13.44%\n- 近3日累計成交金額：約486億元\n- 熱度分數：55.83\n- 熱度特色：五檔中漲幅最大，且成交量高達15億張，籌碼十分活躍。\n\n**5. 台達電（2308）**\n- 最新股價：1,875 元\n- 近3日漲跌幅：+9.65%\n- 近3日累計成交金額：約762億元\n- 熱度分數：40.01\n- 熱度特色：漲幅接近10%，成交金額穩定，屬於中等熱度族群。\n\n---\n\n## 📊 熱門 ETF Top 5\n\n**1. 元大台灣50正2（00631L）**\n- 最新價格：38.45 元\n- 近3日漲跌幅：+8.13%\n- 近3日累計成交金額：約224億元\n- 熱度分數：76.46\n- 熱度特色：五檔ETF中熱度最高，槍桿式正2型商品吸引大量資金與交易。\n\n**2. 元大台灣50（0050）**\n- 最新價格：111.35 元\n- 近3日漲跌幅：+4.16%\n- 近3日累計成交金額：約282億元\n- 熱度分數：73.34\n- 熱度特色：成交金額最高，市值型龍頭ETF資金穩定進駐。\n\n**3. 大華優利高填息30（00918）**\n- 最新價格：34.19 元\n- 近3日漲跌幅：-4.18%\n- 近3日累計成交金額：約176億元\n- 熱度分數：57.78\n- 熱度特色：唯一下跌標的，但成交量高達5億張，賣壓與交投同步熱絡。\n\n**4. 群益臺灣加權正2（00685L）**\n- 最新價格：12.71 元\n- 近3日漲跌幅：+8.35%\n- 近3日累計成交金額：約94億元\n- 熱度分數：53.72\n- 熱度特色：成交量高達7.6億張，屬低價槓桿商品吸引短線資金。\n\n**5. 主動統一台股增長（00981A）**\n- 最新價格：29.57 元\n- 近3日漲跌幅：+4.38%\n- 近3日累計成交金額：約141億元\n- 熱度分數：50.12\n- 熱度特色：主動式ETF熱度中等，成交量與金額表現平穩。\n\n---\n\n## 🔎 市場觀察\n\n- **資金集中方向**：個股資金明顯集中在台積電、聯發科、聯電三大權值股／科技股，三者近3日合計成交金額超過4,280億元，是市場焦點所在。\n- **上漲吸金為主**：熱門股票Top 5全數上漲，漲幅普遍在4%～13%之間，顯示這波熱度主要來自「股價上漲吸引資金追價」，而非下跌抄底的交投。\n- **ETF資金型態**：熱門ETF資金主要集中在**市值型與槓桿型（0050、00631L、00685L）**，顯示市場對台股大盤走勢偏向樂觀，槓桿工具（正2）需求明顯。\n- **股票 vs ETF 熱度**：個股Top 5合計成交金額約5,530億元，遠高於ETF Top 5合計約917億元，顯示本期**個股交易熱度明顯強於ETF**。\n- **需留意標的**：**00918（大華優利高填息30）**是唯一逆勢下跌的標的（-4.18%），但成交量與金額仍相當可觀（5億張、176億元），屬於「成交熱絡但股價走弱」的觀察對象。\n\n---\n\n## 🎯 今日重點\n\n1. 台積電、聯發科、聯電為近3日資金最集中的三大個股，合計成交金額逾4,000億元，是市場關注核心。\n2. 熱門股票全數上漲，顯示這波熱度屬於「多頭追價型」，而非恐慌性下跌交易。\n3. 正2槓桿型ETF（00631L、00685L）熱度高、漲幅同步走揚，反映市場做多氣氛濃厚。\n4. 00918逆勢下跌但成交量仍大，是本期唯一「量大價跌」需留意的ETF標的。\n5. 整體而言，個股交易熱度明顯高於ETF，資金主要流向科技權值股與相關指數型商品。\n\n---\n*以上資訊僅為近3日市場數據整理，供研究參考，不構成任何買賣建議。*"};

let SNAPSHOT = BUNDLED_FALLBACK_SNAPSHOT;

// ---------- formatting helpers ----------
const fmtPrice = n => Number(n).toLocaleString('zh-Hant-TW', { maximumFractionDigits: 2 });
const fmtPct = n => (n > 0 ? '+' : '') + n.toFixed(2) + '%';
const fmtValue = n => (n / 1e8).toFixed(1) + ' 億';
const fmtDate = d => `${d.slice(0,4)}/${d.slice(4,6)}/${d.slice(6,8)}`;
const fmtTime = d => d.toLocaleTimeString('zh-Hant-TW', { hour: '2-digit', minute: '2-digit' });

function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function inline(s){
  return escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

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
  refreshLive(); // 只在頁面載入/重新整理時抓一次即時資料，不背景輪詢
}

// ---------- stock search ----------
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultArea = document.getElementById('result-area');
const statusText = document.getElementById('search-status-text');
const connDot = document.getElementById('conn-dot');
const suggestionsList = document.getElementById('stock-suggestions');

const STOCK_LIST_ENDPOINT = "https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockInfo";
const STOCK_LIST_CACHE_KEY = "stockRadar.stockList.v1";
const STOCK_LIST_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 小時

// 股票代號 <-> 名稱對照表（用來支援輸入名稱查詢），背景載入、不擋畫面。
let stockListState = 'idle'; // idle | loading | ready | error
let nameToCode = new Map();     // 名稱 -> 代號（含常見別名比對用的小寫/去空白版本）
let codeToName = new Map();     // 代號 -> 名稱
let codeToIndustry = new Map(); // 代號 -> 產業分類（例如台積電 -> 半導體業）

function indexStockList(rows){
  // 同一代號可能因產業分類異動而有多筆紀錄，只保留日期最新的一筆。
  const latest = new Map();
  for (const row of rows){
    const code = String(row.stock_id || '').trim();
    const name = String(row.stock_name || '').trim();
    if (!code || !name) continue;
    const prev = latest.get(code);
    if (!prev || String(row.date || '') > String(prev.date || '')){
      latest.set(code, { code, name, date: row.date, industry: String(row.industry_category || '').trim() });
    }
  }
  nameToCode = new Map();
  codeToName = new Map();
  codeToIndustry = new Map();
  for (const { code, name, industry } of latest.values()){
    codeToName.set(code, name);
    nameToCode.set(name, code);
    if (industry) codeToIndustry.set(code, industry);
  }
}

async function loadStockList(){
  stockListState = 'loading';
  try {
    const cached = localStorage.getItem(STOCK_LIST_CACHE_KEY);
    if (cached){
      const { fetchedAt, rows } = JSON.parse(cached);
      if (Date.now() - fetchedAt < STOCK_LIST_CACHE_TTL_MS){
        indexStockList(rows);
        stockListState = 'ready';
        populateSuggestions();
        return;
      }
    }
  } catch (err){
    console.warn('[熱股雷達] 讀取股票清單快取失敗：', err);
  }

  try {
    const res = await fetch(STOCK_LIST_ENDPOINT, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const rows = data.data || [];
    indexStockList(rows);
    stockListState = 'ready';
    populateSuggestions();
    try {
      localStorage.setItem(STOCK_LIST_CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), rows }));
    } catch (err){
      console.warn('[熱股雷達] 股票清單快取寫入失敗（可能超過 localStorage 容量）：', err);
    }
  } catch (err){
    console.warn('[熱股雷達] 股票清單載入失敗，仍可直接輸入代號查詢：', err);
    stockListState = 'error';
  }
}

function populateSuggestions(){
  // 只放熱門排行榜裡出現過的標的 + 常見大型股，避免上千筆選項拖慢瀏覽器。
  const seed = [...SNAPSHOT.hotStocks, ...SNAPSHOT.hotETFs].map(x => x.code);
  const codes = new Set(seed);
  suggestionsList.innerHTML = [...codes]
    .filter(code => codeToName.has(code))
    .map(code => `<option value="${escapeHtml(code)} ${escapeHtml(codeToName.get(code))}">`)
    .join('');

  // 產業分類資料（跟代號/名稱同一份清單）這時候才就緒，如果持股圖表已經畫過，補畫一次產業配置。
  if (lastComputedRows.length){
    const indEl = document.getElementById('chart-industry');
    indEl.innerHTML = buildIndustryChart(lastComputedRows);
    wireChartTooltips(indEl);
  }
}

function resolveStockCode(input){
  const trimmed = input.trim();
  if (!trimmed) return { code: null, error: '請輸入股票代號或名稱。' };

  // 開頭是純英數字（例如「2330」或從建議清單選的「2330 台積電」），直接取代號使用。
  const codeMatch = trimmed.match(/^([0-9A-Za-z]{2,6})(?:\s|$)/);
  if (codeMatch) return { code: codeMatch[1] };

  // 否則當作股票名稱查詢。
  if (stockListState !== 'ready'){
    return { code: null, error: stockListState === 'loading'
      ? '股票名稱對照表載入中，請稍候幾秒再試一次，或直接輸入代號。'
      : '股票名稱對照表載入失敗，請直接輸入股票代號查詢。' };
  }
  if (nameToCode.has(trimmed)) return { code: nameToCode.get(trimmed) };
  const partial = [...nameToCode.entries()].find(([name]) => name.includes(trimmed));
  if (partial) return { code: partial[1] };
  return { code: null, error: `找不到符合「${trimmed}」的股票，請確認名稱或改用代號查詢。` };
}

function renderStockReport(code, name, markdown){
  const label = name ? `${name}（${code}）` : code;
  resultArea.innerHTML = `
    <div class="report-meta mono">${escapeHtml(label)} · ${fmtTime(new Date())} 查詢</div>
    ${mdToHtml(markdown)}
  `;
}

async function queryStock(code, name){
  searchBtn.disabled = true;
  statusText.textContent = `查詢中…（${name ? name + ' ' : ''}${code}）`;
  connDot.className = 'conn-dot';
  resultArea.innerHTML = '<p class="result-empty">查詢中，請稍候（技術面／營收／法人／新聞都要抓，約需 10～20 秒）…</p>';

  try {
    const res = await fetch(`${STOCK_ANALYSIS_ENDPOINT}?stockCode=${encodeURIComponent(code)}`, { method: 'POST' });
    const text = await res.text();
    if (!res.ok){
      throw { kind: 'http', status: res.status, body: text };
    }
    // 這個 webhook 回傳的是純文字 Markdown 報告，不是 JSON。
    connDot.className = 'conn-dot ok';
    statusText.textContent = `已連線 · ${code} 查詢成功`;
    renderStockReport(code, name, text);
  } catch (err){
    connDot.className = 'conn-dot err';
    let title = '查詢失敗';
    let detail = '發生未預期的錯誤，請稍後再試。';
    if (err && err.kind === 'http' && err.status === 404){
      title = 'workflow 尚未啟用（404）';
      detail = 'n8n 的 stock-analysis webhook 目前沒有註冊 production URL。請到 n8n 編輯畫面重新啟用 / 儲存這個 workflow 後再試一次。';
    } else if (err && err.kind === 'http'){
      title = `伺服器回應錯誤（HTTP ${err.status}）`;
      detail = '請確認股票代號是否正確，或查看該 workflow 的 Executions 記錄。';
    } else {
      title = '無法連線到 n8n';
      detail = '請檢查網路連線，或稍後再試一次。';
    }
    statusText.textContent = title;
    resultArea.innerHTML = `<div class="result-error"><strong>${escapeHtml(title)}</strong>${escapeHtml(detail)}</div>`;
  } finally {
    searchBtn.disabled = false;
  }
}

searchForm.addEventListener('submit', e => {
  e.preventDefault();
  const input = searchInput.value;
  const { code, error } = resolveStockCode(input);
  if (error){
    statusText.textContent = error;
    resultArea.innerHTML = `<p class="result-empty">${escapeHtml(error)}</p>`;
    return;
  }
  const name = codeToName.get(code) || null;
  queryStock(code, name);
});

loadStockList();

// ---------- portfolio ----------
const PORTFOLIO_ENDPOINT = "https://kailinstock.zeabur.app/webhook/portfolio";
const PROFILE_STORAGE_KEY = "stockRadar.profileId";
const PRICE_CACHE_TTL_MS = 5 * 60 * 1000;

const profileBar = document.getElementById('profile-bar');
const portfolioContent = document.getElementById('portfolio-content');
const portfolioStatsEl = document.getElementById('portfolio-stats');
const portfolioUpdatedEl = document.getElementById('portfolio-updated');
const holdingListEl = document.getElementById('holding-list');
const portfolioForm = document.getElementById('portfolio-form');
const pfHint = document.getElementById('pf-hint');

let currentHoldings = [];
let currentHistory = [];
let lastComputedRows = [];
const priceCache = new Map(); // code -> { price, fetchedAt }

function getProfileId(){
  try { return localStorage.getItem(PROFILE_STORAGE_KEY) || ''; } catch (err) { return ''; }
}
function setProfileId(id){
  try { localStorage.setItem(PROFILE_STORAGE_KEY, id); } catch (err) { console.warn('[熱股雷達] 無法寫入 localStorage：', err); }
}
function clearProfileId(){
  try { localStorage.removeItem(PROFILE_STORAGE_KEY); } catch (err){ /* ignore */ }
}

let amountsHidden = false;
try { amountsHidden = localStorage.getItem('stockRadar.amountsHidden') === '1'; } catch (err){ /* ignore */ }

function applyHideState(){
  portfolioContent.classList.toggle('amounts-hidden', amountsHidden);
  const btn = document.getElementById('pf-toggle-hide');
  if (btn){
    btn.textContent = amountsHidden ? '🙈' : '👁️';
    btn.title = amountsHidden ? '顯示金額' : '隱藏金額';
  }
}

function renderProfileBar(){
  const profileId = getProfileId();
  if (!profileId){
    profileBar.innerHTML = `
      <div class="profile-setup">
        <p>幫自己取一個代號，之後在其他裝置輸入同一個代號就能看到這份持股（朋友用別的代號就不會混到彼此的資料）。</p>
        <input type="text" id="profile-input" class="mono" placeholder="例如 kailin" maxlength="24">
        <button id="profile-confirm" type="button">確認</button>
      </div>`;
    document.getElementById('profile-confirm').addEventListener('click', () => {
      const val = document.getElementById('profile-input').value.trim();
      if (!val) return;
      setProfileId(val);
      renderProfileBar();
      loadPortfolio();
    });
    document.getElementById('profile-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('profile-confirm').click();
    });
    portfolioContent.hidden = true;
  } else {
    profileBar.innerHTML = `
      <div class="pf-current">
        身份：<strong>${escapeHtml(profileId)}</strong>
        <button class="pf-icon-btn" id="pf-refresh" type="button" title="重新整理現價">⟳</button>
        <button class="pf-icon-btn" id="pf-toggle-hide" type="button" title="隱藏金額">👁️</button>
        <button class="pf-switch" id="profile-switch" type="button">切換身份</button>
      </div>`;
    document.getElementById('profile-switch').addEventListener('click', () => {
      clearProfileId();
      currentHoldings = [];
      renderProfileBar();
    });
    document.getElementById('pf-refresh').addEventListener('click', (e) => {
      const btn = e.currentTarget;
      btn.classList.add('spinning');
      loadPortfolio().finally(() => btn.classList.remove('spinning'));
    });
    document.getElementById('pf-toggle-hide').addEventListener('click', () => {
      amountsHidden = !amountsHidden;
      try { localStorage.setItem('stockRadar.amountsHidden', amountsHidden ? '1' : '0'); } catch (err){ /* ignore */ }
      applyHideState();
    });
    portfolioContent.hidden = false;
    applyHideState();
  }
}

async function fetchLatestPrice(code){
  const cached = priceCache.get(code);
  if (cached && Date.now() - cached.fetchedAt < PRICE_CACHE_TTL_MS) return cached.price;
  try {
    const start = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
    const startStr = start.toISOString().slice(0, 10);
    const url = `https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockPrice&data_id=${encodeURIComponent(code)}&start_date=${startStr}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const json = await res.json();
    const rows = json.data || [];
    const last = rows[rows.length - 1];
    const price = last ? Number(last.close) : null;
    priceCache.set(code, { price, fetchedAt: Date.now() });
    return price;
  } catch (err){
    console.warn(`[熱股雷達] 抓取 ${code} 現價失敗：`, err);
    return null;
  }
}

function fmtSigned(n, digits = 2){
  const sign = n > 0 ? '+' : '';
  return sign + n.toFixed(digits);
}

function fmtCompact(n){
  if (Math.abs(n) >= 1e8) return (n / 1e8).toFixed(2) + '億';
  if (Math.abs(n) >= 1e4) return (n / 1e4).toFixed(1) + '萬';
  return fmtPrice(n);
}

// ---------- portfolio charts ----------
// 8 色分類色票（經 dataviz 驗證工具跑過 CVD/對比度檢查，深色底專用）
const CHART_PALETTE = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'];

const chartTooltip = document.getElementById('chart-tooltip');
function showTooltip(evt, title, rows){
  chartTooltip.innerHTML = `<div class="tt-title">${escapeHtml(title)}</div>` + rows.map(r => `<div class="tt-row">${r}</div>`).join('');
  chartTooltip.hidden = false;
  chartTooltip.style.left = evt.clientX + 'px';
  chartTooltip.style.top = evt.clientY + 'px';
}
function hideTooltip(){ chartTooltip.hidden = true; }
function wireChartTooltips(container){
  if (container.dataset.ttWired) return;
  container.dataset.ttWired = '1';
  container.addEventListener('mousemove', e => {
    const mark = e.target.closest('.viz-mark');
    if (!mark){ hideTooltip(); return; }
    const rows = (mark.dataset.ttRows || '').split('||').filter(Boolean);
    showTooltip(e, mark.dataset.ttTitle || '', rows);
  });
  container.addEventListener('mouseleave', hideTooltip);
}

function polar(cx, cy, radius, angleDeg){
  const rad = (angleDeg * Math.PI) / 180;
  return [cx + radius * Math.cos(rad), cy + radius * Math.sin(rad)];
}

// 共用的甜甜圈圖繪製：傳入已經分好組的 [{name, value}]，超過 MAX_SLICES 自動併成「其他」
function buildDonut(items, { centerLabel, maxSlices = 6 } = {}){
  const data = items.filter(x => x.value > 0).sort((a, b) => b.value - a.value);
  if (!data.length) return null;

  const slices = data.slice(0, maxSlices).map(x => ({ name: x.name, value: x.value }));
  if (data.length > maxSlices){
    slices.push({ name: '其他', value: data.slice(maxSlices).reduce((s, x) => s + x.value, 0) });
  }
  const total = slices.reduce((s, x) => s + x.value, 0);
  const isOtherSlice = (s, i) => s.name === '其他' && i === slices.length - 1 && data.length > maxSlices;

  const R = 70, r = 44, cx = 80, cy = 80;
  let angle = -90;
  const paths = slices.map((s, i) => {
    const frac = s.value / total;
    const sweep = Math.max(frac * 360, 0.5);
    const start = angle;
    const end = angle + sweep;
    angle = end;
    const color = isOtherSlice(s, i) ? null : CHART_PALETTE[i % CHART_PALETTE.length];
    const large = sweep > 180 ? 1 : 0;
    const [x1, y1] = polar(cx, cy, R, start);
    const [x2, y2] = polar(cx, cy, R, end);
    const [ix1, iy1] = polar(cx, cy, r, end);
    const [ix2, iy2] = polar(cx, cy, r, start);
    const d = `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L ${ix1.toFixed(1)} ${iy1.toFixed(1)} A ${r} ${r} 0 ${large} 0 ${ix2.toFixed(1)} ${iy2.toFixed(1)} Z`;
    const ttRows = [`市值 ${fmtPrice(Math.round(s.value))}`, `佔比 ${(frac * 100).toFixed(1)}%`].map(escapeHtml).join('||');
    const fillAttr = color ? `fill="${color}"` : `style="fill:var(--ink-faint)"`;
    return `<path class="viz-mark" d="${d}" ${fillAttr} style="stroke:var(--surface-1);stroke-width:2;" data-tt-title="${escapeHtml(s.name)}" data-tt-rows="${ttRows}"></path>`;
  }).join('');

  // 排行榜式橫條：色塊直接當條狀圖的底色，比純圖例更容易一眼比較大小
  const rankedCount = Math.min(slices.length, 5);
  const cumPct = (slices.slice(0, rankedCount).reduce((s, x) => s + x.value, 0) / total * 100).toFixed(1);
  const rankBars = slices.slice(0, rankedCount).map((s, i) => {
    const color = isOtherSlice(s, i) ? 'var(--ink-faint)' : CHART_PALETTE[i % CHART_PALETTE.length];
    const pct = (s.value / total) * 100;
    return `
    <div class="rank-bar-row viz-mark" data-tt-title="${escapeHtml(s.name)}" data-tt-rows="${escapeHtml('市值 ' + fmtPrice(Math.round(s.value)))}||${escapeHtml('佔比 ' + pct.toFixed(1) + '%')}">
      <span class="rank-bar-name">${escapeHtml(s.name)}</span>
      <span class="rank-bar-track"><span class="rank-bar-fill" style="width:${pct.toFixed(1)}%; background:${color};"></span></span>
      <span class="rank-bar-pct">${pct.toFixed(1)}%</span>
    </div>`;
  }).join('');

  return `
    <div class="viz" style="display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
      <svg viewBox="0 0 160 160" style="width:150px; height:150px; flex:none;">
        ${paths}
        <text x="80" y="76" text-anchor="middle" class="donut-total-value">${fmtCompact(total)}</text>
        <text x="80" y="92" text-anchor="middle" class="donut-total-label">${escapeHtml(centerLabel || '')}</text>
      </svg>
      <div style="flex:1; min-width:160px;">
        <div class="rank-bar-header">前 ${rankedCount} 大 <span>合計佔 ${cumPct}%</span></div>
        ${rankBars}
      </div>
    </div>`;
}

function buildAllocationChart(rows){
  const items = rows.filter(r => r.value !== null && r.value > 0)
    .map(r => ({ name: r.name || r.code, value: r.value }));
  const html = buildDonut(items, { centerLabel: '總市值' });
  return html || '<p class="chart-empty">尚無市值資料可顯示。</p>';
}

function buildIndustryChart(rows){
  const priced = rows.filter(r => r.value !== null && r.value > 0);
  if (!priced.length) return '<p class="chart-empty">尚無市值資料可顯示。</p>';
  if (stockListState !== 'ready'){
    return '<p class="chart-empty">產業分類資料載入中，請稍候再切換回來看看。</p>';
  }
  const byIndustry = new Map();
  for (const r of priced){
    const industry = codeToIndustry.get(r.code) || '未分類';
    byIndustry.set(industry, (byIndustry.get(industry) || 0) + r.value);
  }
  const items = [...byIndustry.entries()].map(([name, value]) => ({ name, value }));
  const html = buildDonut(items, { centerLabel: '總市值', maxSlices: 7 });
  return html || '<p class="chart-empty">尚無市值資料可顯示。</p>';
}

function buildGainLossChart(rows){
  const data = rows.filter(r => r.gain !== null).sort((a, b) => b.gain - a.gain);
  if (!data.length) return '<p class="chart-empty">尚無損益資料可顯示。</p>';

  const maxAbs = Math.max(...data.map(r => Math.abs(r.gain)), 1);
  const body = data.map(r => {
    const up = r.gain >= 0;
    const widthPct = Math.min((Math.abs(r.gain) / maxAbs) * 50, 50).toFixed(1);
    const sideStyle = up ? `left:50%; width:${widthPct}%;` : `right:50%; width:${widthPct}%;`;
    const color = up ? 'var(--up)' : 'var(--down)';
    const ttRows = [`損益 ${fmtSigned(Math.round(r.gain), 0)}`, `報酬率 ${fmtSigned(r.gainPct ?? 0)}%`].map(escapeHtml).join('||');
    return `
    <div class="gl-row viz-mark" data-tt-title="${escapeHtml(r.name || r.code)}" data-tt-rows="${ttRows}">
      <span class="gl-name">${escapeHtml(r.name || r.code)}</span>
      <span class="gl-track"><span class="gl-mid"></span><span class="gl-fill" style="${sideStyle} background:${color};"></span></span>
      <span class="gl-value" style="color:${color}">${fmtSigned(Math.round(r.gain), 0)}</span>
    </div>`;
  }).join('');

  return `<div class="viz gl-chart">${body}</div>`;
}

function buildTrendChart(history){
  if (!history || history.length < 2){
    const n = history ? history.length : 0;
    return { html: `<p class="chart-empty">資料還太少（目前 ${n} 筆），每天打開頁面都會自動多記一筆快照，過幾天就會看到趨勢線。</p>`, count: n, summary: '' };
  }
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const values = sorted.map(h => h.value);
  const costs = sorted.map(h => h.cost);
  const min = Math.min(...values, ...costs), max = Math.max(...values, ...costs);
  const pad = (max - min) * 0.15 || max * 0.05 || 1;
  const yMin = Math.max(min - pad, 0), yMax = max + pad;
  const W = 640, H = 170, padL = 6, padR = 6, padT = 14, padB = 10;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const n = sorted.length;
  const x = i => padL + (n === 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const y = v => padT + plotH - ((v - yMin) / (yMax - yMin || 1)) * plotH;

  const valuePts = sorted.map((h, i) => [x(i), y(h.value)]);
  const costPts = sorted.map((h, i) => [x(i), y(h.cost)]);
  const valueLine = valuePts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const costLine = costPts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');

  const last = sorted[n - 1];
  const gainUp = last.value >= last.cost;
  const gapColor = gainUp ? 'var(--up)' : 'var(--down)';

  // 市值線與成本線之間的區域上色，直接視覺化「賺 / 賠」的缺口
  const costPtsRev = [...costPts].reverse();
  const gapPath = `${valueLine} L ${costPtsRev.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L ')} Z`;

  const gridLines = [0, 0.5, 1].map(f => {
    const gy = (padT + plotH * f).toFixed(1);
    return `<line class="viz-grid" x1="${padL}" x2="${W - padR}" y1="${gy}" y2="${gy}"></line>`;
  }).join('');

  const dots = sorted.map((h, i) => {
    const [px, py] = valuePts[i];
    const isLast = i === n - 1;
    const gain = h.value - h.cost;
    const gainPct = h.cost > 0 ? (gain / h.cost) * 100 : 0;
    const ttRows = [`總市值 ${fmtPrice(h.value)}`, `成本 ${fmtPrice(h.cost)}`, `損益 ${fmtSigned(Math.round(gain), 0)}（${fmtSigned(gainPct)}%）`].map(escapeHtml).join('||');
    const fillStyle = isLast ? 'fill:var(--accent);' : 'fill:var(--surface-1);';
    return `<circle class="viz-mark" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${isLast ? 4.5 : 3}" style="${fillStyle}stroke:var(--accent);stroke-width:1.5;" data-tt-title="${escapeHtml(h.date)}" data-tt-rows="${ttRows}"></circle>`;
  }).join('');

  const html = `
    <div class="trend-legend">
      <span><i style="background:var(--accent);"></i>總市值</span>
      <span><i style="background:var(--ink-faint); background-image:repeating-linear-gradient(90deg, var(--ink-faint) 0 3px, transparent 3px 6px);"></i>總成本</span>
    </div>
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="width:100%; height:170px;">
      ${gridLines}
      <path d="${gapPath}" fill="${gapColor}" fill-opacity="0.14" stroke="none"></path>
      <path d="${costLine}" fill="none" style="stroke:var(--ink-faint);stroke-width:1.5;stroke-dasharray:4 3;"></path>
      <path d="${valueLine}" fill="none" style="stroke:var(--accent);stroke-width:2;"></path>
      ${dots}
    </svg>`;

  // 摘要：區間最高/最低市值、較上一筆的變化
  const maxVal = Math.max(...values), minVal = Math.min(...values);
  const prev = sorted[n - 2];
  const delta = last.value - prev.value;
  const deltaPct = prev.value > 0 ? (delta / prev.value) * 100 : 0;
  const deltaColor = delta >= 0 ? 'var(--up)' : 'var(--down)';
  const summary = `
    <div class="trend-summary">
      <span>區間最高 <strong>${fmtPrice(maxVal)}</strong></span>
      <span>區間最低 <strong>${fmtPrice(minVal)}</strong></span>
      <span>較上一筆 <strong style="color:${deltaColor}">${fmtSigned(Math.round(delta), 0)}（${fmtSigned(deltaPct)}%）</strong></span>
      <span>目前 <strong style="color:${gapColor}">${gainUp ? '市值高於成本' : '市值低於成本'}</strong></span>
    </div>`;

  return { html: `<div class="viz">${html}</div>${summary}`, count: n };
}

let trendRange = 'all'; // week | month | year | all

function filterHistoryByRange(history, range){
  if (range === 'all' || !history) return history;
  const now = new Date();
  let cutoff;
  if (range === 'week') cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  else if (range === 'month') cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  else if (range === 'year') cutoff = new Date(now.getFullYear(), 0, 1);
  else return history;
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return history.filter(h => h.date >= cutoffStr);
}

function renderTrendChart(){
  const trendEl = document.getElementById('chart-trend');
  const hintEl = document.getElementById('chart-trend-hint');
  const filtered = filterHistoryByRange(currentHistory, trendRange);
  const { html, count } = buildTrendChart(filtered);
  trendEl.innerHTML = (currentHistory.length >= 2 && count < 2)
    ? '<p class="chart-empty">這個區間內資料不足，試試看切換到「全部」。</p>'
    : html;
  hintEl.textContent = count ? `已記錄 ${count} 天` : '';
  wireChartTooltips(trendEl);
}

document.getElementById('trend-range-tabs').addEventListener('click', e => {
  const btn = e.target.closest('button[data-range]');
  if (!btn) return;
  trendRange = btn.dataset.range;
  document.querySelectorAll('#trend-range-tabs button').forEach(b => b.classList.toggle('active', b === btn));
  renderTrendChart();
});

async function recordSnapshotIfNeeded(value, cost){
  const profileId = getProfileId();
  if (!profileId) return;
  const today = new Date().toISOString().slice(0, 10);
  if (currentHistory.some(h => h.date === today)) return;
  try {
    const res = await fetch(PORTFOLIO_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, snapshot: { value, cost } }),
    });
    if (res.ok){
      const data = await res.json();
      currentHistory = data.history || currentHistory;
      renderTrendChart();
    }
  } catch (err){
    console.warn('[熱股雷達] 記錄每日快照失敗：', err);
  }
}

function buildMeterRow(r){
  if (r.price === null) return '';
  const stop = r.stopPrice, target = r.targetPrice;
  const vals = [r.costPrice, r.price];
  if (stop !== null) vals.push(stop);
  if (target !== null) vals.push(target);
  let low = Math.min(...vals), high = Math.max(...vals);
  if (low === high){ low *= 0.95; high *= 1.05; }
  const pad = (high - low) * 0.08;
  low -= pad; high += pad;
  const pct = v => Math.max(0, Math.min(100, ((v - low) / (high - low)) * 100));

  const up = r.gain === null || r.gain >= 0;
  const fillColor = up ? 'var(--up)' : 'var(--down)';
  const costTick = `<span class="hm-tick cost" style="left:${pct(r.costPrice).toFixed(1)}%;" title="成本價 ${fmtPrice(r.costPrice)}"></span>`;
  const stopTick = stop !== null ? `<span class="hm-tick" style="left:${pct(stop).toFixed(1)}%; background:var(--up);" title="停損價 ${fmtPrice(stop)}"></span>` : '';
  const targetTick = target !== null ? `<span class="hm-tick" style="left:${pct(target).toFixed(1)}%; background:var(--accent);" title="目標價 ${fmtPrice(target)}"></span>` : '';

  return `
  <div class="holding-meter">
    <span class="hm-label">${stop !== null ? fmtPrice(stop) : '—'}</span>
    <span class="hm-track">
      <span class="hm-fill" style="width:${pct(r.price).toFixed(1)}%; background:${fillColor};"></span>
      ${costTick}${stopTick}${targetTick}
    </span>
    <span class="hm-label" style="text-align:right;">${target !== null ? fmtPrice(target) : '—'}</span>
  </div>`;
}

async function renderPortfolio(){
  if (!currentHoldings.length){
    lastComputedRows = [];
    holdingListEl.innerHTML = '<li class="result-empty" style="padding:16px;">還沒有持股，從左邊表單新增第一筆吧。</li>';
    document.getElementById('portfolio-hero').innerHTML = '';
    portfolioStatsEl.innerHTML = '';
    portfolioUpdatedEl.textContent = '';
    document.getElementById('chart-allocation').innerHTML = '<p class="chart-empty">還沒有持股可以分析。</p>';
    document.getElementById('chart-gainloss').innerHTML = '<p class="chart-empty">還沒有持股可以分析。</p>';
    document.getElementById('chart-industry').innerHTML = '<p class="chart-empty">還沒有持股可以分析。</p>';
    document.getElementById('chart-trend').innerHTML = '<p class="chart-empty">還沒有持股可以分析。</p>';
    document.getElementById('chart-trend-hint').textContent = '';
    return;
  }

  holdingListEl.innerHTML = '<li class="result-empty" style="padding:16px;">讀取最近收盤價中…</li>';

  const prices = await Promise.all(currentHoldings.map(h => fetchLatestPrice(h.code)));

  let totalCost = 0, totalValue = 0;
  const rows = currentHoldings.map((h, i) => {
    const price = prices[i];
    const cost = h.costPrice * h.quantity;
    const value = price !== null ? price * h.quantity : null;
    totalCost += cost;
    if (value !== null) totalValue += value;
    const gain = value !== null ? value - cost : null;
    const gainPct = (gain !== null && cost > 0) ? (gain / cost) * 100 : null;
    return { ...h, price, cost, value, gain, gainPct };
  });
  lastComputedRows = rows;

  portfolioUpdatedEl.textContent = `最近收盤價 · ${fmtTime(new Date())} 更新`;

  holdingListEl.innerHTML = rows.map((r, i) => {
    const up = r.gain !== null && r.gain >= 0;
    const badges = [];
    if (r.targetPrice !== null && r.price !== null && r.price >= r.targetPrice){
      badges.push('<span class="holding-badge target">🎯 達目標價</span>');
    }
    if (r.stopPrice !== null && r.price !== null && r.price <= r.stopPrice){
      badges.push('<span class="holding-badge stop">⚠️ 跌破停損</span>');
    }
    return `
    <li class="holding-row">
      <span class="holding-id">
        <span class="holding-name">${escapeHtml(r.name || r.code)}</span>
        <span class="holding-meta">${escapeHtml(r.code)} · ${r.quantity.toLocaleString('zh-Hant-TW')} 股 · 成本 ${fmtPrice(r.costPrice)}${badges.length ? ' ' + badges.join(' ') : ''}</span>
      </span>
      <span class="holding-price">${r.price !== null ? fmtPrice(r.price) : '—'}<span class="label">最近收盤</span></span>
      <span class="holding-price">${r.value !== null ? fmtPrice(Math.round(r.value)) : '—'}<span class="label">市值</span></span>
      <span class="holding-gain ${r.gain === null ? '' : (up ? 'up' : 'down')}">
        <span class="amount">${r.gain !== null ? fmtSigned(Math.round(r.gain), 0) : '—'}</span>
        <span class="pct">${r.gainPct !== null ? fmtSigned(r.gainPct) + '%' : ''}</span>
      </span>
      <button class="holding-action" data-analyze="${escapeHtml(r.code)}" data-name="${escapeHtml(r.name || '')}" title="查看 AI 分析">📄</button>
      <button class="holding-action" data-edit="${i}" title="編輯">✎</button>
      <button class="holding-action danger" data-delete="${i}" title="刪除">✕</button>
      ${buildMeterRow(r)}
    </li>`;
  }).join('');

  const totalGain = totalValue - totalCost;
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
  const gainUp = totalGain >= 0;

  document.getElementById('portfolio-hero').innerHTML = `
    <div class="stat-label">總市值</div>
    <div class="hero-value mono">${fmtPrice(Math.round(totalValue))}<span class="hero-pct" style="color:${gainUp ? 'var(--up)' : 'var(--down)'}">${fmtSigned(totalGainPct)}%</span></div>
    <div class="stat-sub">總成本 ${fmtPrice(Math.round(totalCost))} · 損益 <span style="color:${gainUp ? 'var(--up)' : 'var(--down)'}">${fmtSigned(Math.round(totalGain), 0)}</span></div>
  `;

  portfolioStatsEl.innerHTML = `
    <div class="stat-tile">
      <div class="stat-label">總成本</div>
      <div class="stat-value mono">${fmtPrice(Math.round(totalCost))}</div>
    </div>
    <div class="stat-tile">
      <div class="stat-label">總損益</div>
      <div class="stat-value mono" style="color:${gainUp ? 'var(--up)' : 'var(--down)'}">${fmtSigned(Math.round(totalGain), 0)}</div>
    </div>
    <div class="stat-tile">
      <div class="stat-label">總報酬率</div>
      <div class="stat-value mono" style="color:${gainUp ? 'var(--up)' : 'var(--down)'}">${fmtSigned(totalGainPct)}%</div>
    </div>
  `;

  const allocEl = document.getElementById('chart-allocation');
  const glEl = document.getElementById('chart-gainloss');
  const indEl = document.getElementById('chart-industry');
  allocEl.innerHTML = buildAllocationChart(rows);
  glEl.innerHTML = buildGainLossChart(rows);
  indEl.innerHTML = buildIndustryChart(rows);
  wireChartTooltips(allocEl);
  wireChartTooltips(glEl);
  wireChartTooltips(indEl);
  renderTrendChart();

  recordSnapshotIfNeeded(totalValue, totalCost);
}

async function loadPortfolio(){
  const profileId = getProfileId();
  if (!profileId) return;
  holdingListEl.innerHTML = '<li class="result-empty" style="padding:16px;">載入中…</li>';
  try {
    const res = await fetch(`${PORTFOLIO_ENDPOINT}?profileId=${encodeURIComponent(profileId)}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    currentHoldings = data.holdings || [];
    currentHistory = data.history || [];
    renderPortfolio();
  } catch (err){
    console.warn('[熱股雷達] 讀取持股失敗：', err);
    holdingListEl.innerHTML = '<li class="result-error" style="margin:8px;"><strong>讀取持股失敗</strong>請檢查網路連線後重新整理頁面。</li>';
  }
}

async function savePortfolio(){
  const profileId = getProfileId();
  if (!profileId) return;
  try {
    await fetch(PORTFOLIO_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, holdings: currentHoldings }),
    });
  } catch (err){
    console.warn('[熱股雷達] 儲存持股失敗：', err);
    pfHint.textContent = '儲存失敗，請檢查網路連線後再試一次。';
    pfHint.className = 'pf-hint error';
  }
}

let editingIndex = null;
const pfSubmitBtn = document.getElementById('pf-submit');
const pfCancelEditBtn = document.getElementById('pf-cancel-edit');
const pfCodeInput = document.getElementById('pf-code');

function enterEditMode(idx){
  const h = currentHoldings[idx];
  if (!h) return;
  editingIndex = idx;
  pfCodeInput.value = h.code;
  document.getElementById('pf-cost').value = h.costPrice;
  document.getElementById('pf-qty').value = h.quantity;
  document.getElementById('pf-target').value = h.targetPrice ?? '';
  document.getElementById('pf-stop').value = h.stopPrice ?? '';
  pfSubmitBtn.textContent = '儲存修改';
  pfCancelEditBtn.hidden = false;
  pfHint.textContent = `正在編輯：${h.name || h.code}`;
  pfHint.className = 'pf-hint';
  pfCodeInput.focus();
}

function exitEditMode(){
  editingIndex = null;
  portfolioForm.reset();
  pfSubmitBtn.textContent = '加入持股';
  pfCancelEditBtn.hidden = true;
  pfHint.textContent = '';
  pfHint.className = 'pf-hint';
}

pfCancelEditBtn.addEventListener('click', exitEditMode);

portfolioForm.addEventListener('submit', async e => {
  e.preventDefault();
  pfHint.textContent = '';
  pfHint.className = 'pf-hint';

  const codeInput = pfCodeInput.value;
  const { code, error } = resolveStockCode(codeInput);
  if (error){
    pfHint.textContent = error;
    pfHint.className = 'pf-hint error';
    return;
  }
  const cost = Number(document.getElementById('pf-cost').value);
  const qty = Number(document.getElementById('pf-qty').value);
  const targetRaw = document.getElementById('pf-target').value;
  const stopRaw = document.getElementById('pf-stop').value;

  if (!cost || cost <= 0 || !qty || qty <= 0){
    pfHint.textContent = '請輸入正確的成本價與股數。';
    pfHint.className = 'pf-hint error';
    return;
  }

  const name = codeToName.get(code) || null;
  const entry = {
    code, name,
    costPrice: cost,
    quantity: qty,
    targetPrice: targetRaw ? Number(targetRaw) : null,
    stopPrice: stopRaw ? Number(stopRaw) : null,
  };

  if (editingIndex !== null){
    entry.addedAt = currentHoldings[editingIndex].addedAt || new Date().toISOString();
    currentHoldings = currentHoldings.map((h, i) => i === editingIndex ? entry : h);
  } else {
    entry.addedAt = new Date().toISOString();
    currentHoldings = [...currentHoldings, entry];
  }

  exitEditMode();
  await savePortfolio();
  renderPortfolio();
});

holdingListEl.addEventListener('click', e => {
  const analyzeBtn = e.target.closest('[data-analyze]');
  if (analyzeBtn){
    const code = analyzeBtn.dataset.analyze;
    const name = analyzeBtn.dataset.name || null;
    switchView('view-search');
    searchInput.value = name ? `${code} ${name}` : code;
    queryStock(code, name);
    return;
  }
  const editBtn = e.target.closest('[data-edit]');
  if (editBtn){
    enterEditMode(Number(editBtn.dataset.edit));
    return;
  }
  const deleteBtn = e.target.closest('[data-delete]');
  if (deleteBtn){
    const idx = Number(deleteBtn.dataset.delete);
    if (editingIndex !== null) exitEditMode(); // 刪除後索引會位移，直接離開編輯模式最保險
    currentHoldings = currentHoldings.filter((_, i) => i !== idx);
    savePortfolio();
    renderPortfolio();
  }
});

renderProfileBar();
if (getProfileId()) loadPortfolio();

// ---------- nav ----------
const navButtons = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.view');
const titles = { 'view-overview': '台股市場總覽', 'view-ranking': '熱門排行榜', 'view-search': '個股分析查詢', 'view-portfolio': '我的持股' };

function switchView(id){
  navButtons.forEach(b => b.classList.toggle('active', b.dataset.view === id));
  views.forEach(v => v.hidden = v.id !== id);
  document.getElementById('topbar-title').textContent = titles[id] || '';
  if (id === 'view-portfolio' && getProfileId()) loadPortfolio();
}
navButtons.forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));
document.addEventListener('click', e => {
  const jump = e.target.closest('[data-jump]');
  if (jump) switchView(jump.dataset.jump);
});

init();
