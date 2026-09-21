# 熱股雷達 Stock Radar

Kailin 的台股熱門排行 / AI 分析追蹤面板。純 HTML / CSS / JS 靜態網站，資料來自 [n8n](https://n8n.io)（kailinstock 實例）的三個 workflow：

- `熱門股票 ETF Top5`（`GET /webhook/hot-stocks`）— 近三個交易日熱門股票、ETF 排行 + Claude AI 分析文字
- `股票分析`（`POST /webhook/stock-analysis?stockCode=xxxx`）— 個股查詢（技術面、月營收、法人、新聞）
- `持股管理`（`GET`/`POST /webhook/portfolio?profileId=xxx`）— 使用者自己的持股清單存取，見下方「持股功能」

## 專案結構

```
index.html          頁面骨架
assets/styles.css    樣式（含亮 / 暗色主題）
assets/app.js        資料抓取、畫面渲染、個股查詢邏輯
data/snapshot.json   快照資料（即時抓取失敗時的備援）
```

沒有任何建置流程，也沒有前端框架，改完檔案重新整理頁面即可看到結果。

## 本機開發

瀏覽器的 `fetch()` 在 `file://` 底下沒辦法讀取 `data/snapshot.json`（會被瀏覽器擋掉），所以本機測試請起一個簡單的 HTTP server，不要直接雙擊開啟 `index.html`：

```bash
python3 -m http.server 8000
# 開啟 http://localhost:8000
```

## 資料如何更新

頁面載入時會依序：

1. 讀取本地 `data/snapshot.json` 立刻畫面上色（快照，不一定是最新的）
2. 嘗試直接呼叫 n8n 的 `hot-stocks` webhook 拿即時資料，成功就覆蓋畫面（只在頁面載入/重新整理時抓一次，**不會**背景持續輪詢——這個 webhook 背後會呼叫 Claude API，之前曾經因為輪詢太頻繁在短時間內把 Anthropic 額度耗盡，所以改成只在真的有人開頁面時才抓）
3. 若即時抓取失敗（例如 n8n 尚未開放 CORS），畫面會維持顯示快照，並在右上角標示「快照資料」而非「即時」

n8n（透過 Zeabur）本身已經會針對請求動態回應 CORS header，所以瀏覽器直接呼叫不會被擋。如果之後真的遇到 CORS 錯誤（例如換了 n8n 主機），畫面會自動退回快照資料，不會整個壞掉。

### 更新 `data/snapshot.json`（快照備援）

`hot-stocks` webhook 不需要驗證即可呼叫，要重新產生快照可以執行：

```bash
curl -s "https://kailinstock.zeabur.app/webhook/hot-stocks" | python3 -m json.tool > data/snapshot.json
```

## 個股分析頁面

「個股分析」分頁會即時呼叫 `stock-analysis` webhook（`POST /webhook/stock-analysis?stockCode=xxxx`）。這個 webhook 回傳的是**純文字 Markdown 報告**，不是 JSON，前端用 `res.text()` 直接讀取後用內建的簡易 markdown 轉換器渲染成報告卡片。

（開發紀錄：這個 webhook 一度回 404，是 n8n 端「顯示 active 但 webhook 沒真的註冊」的問題，重新停用/啟用該 workflow 後排除；AI 分析文字被截斷則是三個 Claude 節點都用了 n8n 預設的 `maxTokens`（1024），已全部調高到 4096。）

## 持股功能

「持股」分頁讓使用者記錄自己的持股（代號、成本價、股數、目標價/停損價），計算即時損益，並可一鍵跳到「個股分析」查看該檔的 AI 報告。

**多人共用同一個網頁時如何區分資料：** 第一次使用時自己輸入一個代號（例如 `kailin`），存在瀏覽器的 `localStorage`；之後每次讀取/儲存持股都會帶著這個代號打 `portfolio` webhook。朋友用不同代號，資料就不會互相看到——這只是一個「識別用代號」，不是密碼，知道別人代號的話理論上可以查到對方持股，適合互相不涉隱私、隨性使用的場合。

**持股資料存在哪裡：** 沒有另外接資料庫或 Google Sheet，是用 n8n 內建的「workflow 靜態資料」（`$getWorkflowStaticData`）直接存在 `持股管理` 這個 workflow 裡，所有版本的 n8n 都支援、不用額外設定。壞處是：如果之後要用 API 大幅修改這個 workflow 的節點結構，要留意別不小心把既有的持股資料清空（一般只是改節點內容、不動 workflow 本身不會有事）。

**價格從哪來：** 持股的價格是前端直接呼叫 FinMind 的 `TaiwanStockPrice`（跟股票代號/名稱對照表一樣，是公開端點，不需要金鑰），跟熱門排行的資料來源是分開的兩條路。**注意這是「最近收盤價」，不是即時報價**——FinMind 這個資料集本來就是收盤後才更新，盤中查詢看到的會是前一個交易日的收盤價。

## 部署到 GitHub Pages

Repo 設定 → Pages → Source 選 `main` 分支 `/ (root)`，存檔後幾分鐘內就能透過 `https://<帳號>.github.io/<repo>/` 存取。這是純靜態檔案，不需要任何建置步驟。

## 安全性備註

- n8n 的 API Key（用來透過 n8n Management API 讀取 workflow 設定）**不會**出現在這個 repo 裡，只存在本機的 `.env`（已被 `.gitignore` 排除）。
- 前端實際呼叫的 `hot-stocks` / `stock-analysis` webhook 本身不需要驗證，屬於公開端點，所以直接寫在 `assets/app.js` 裡沒有安全疑慮。
