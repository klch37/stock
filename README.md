# 熱股雷達 Stock Radar

Kailin 的台股熱門排行 / AI 分析追蹤面板。純 HTML / CSS / JS 靜態網站，資料來自 [n8n](https://n8n.io)（kailinstock 實例）的兩個 workflow：

- `熱門股票 ETF Top5`（`GET /webhook/hot-stocks`）— 近三個交易日熱門股票、ETF 排行 + Claude AI 分析文字
- `股票分析`（`POST /webhook/stock-analysis?stockCode=xxxx`）— 個股查詢（技術面、月營收、法人、新聞）

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
2. 嘗試直接呼叫 n8n 的 `hot-stocks` webhook 拿即時資料，成功就覆蓋畫面，並每 60 秒重新抓一次
3. 若即時抓取失敗（例如 n8n 尚未開放 CORS），畫面會維持顯示快照，並在右上角標示「快照資料」而非「即時」

**要讓即時抓取生效，n8n 那邊需要在 `Respond to Webhook` 節點的回應加上一個 header：**

```
Access-Control-Allow-Origin: *
```

（或指定成部署後的網站網域，例如 `https://<你的帳號>.github.io`）沒有這個 header，瀏覽器會擋掉跨網域請求，頁面會自動退回快照資料，不會整個壞掉。

### 更新 `data/snapshot.json`（快照備援）

`hot-stocks` webhook 不需要驗證即可呼叫，要重新產生快照可以執行：

```bash
curl -s "https://kailinstock.zeabur.app/webhook/hot-stocks" | python3 -m json.tool > data/snapshot.json
```

## 個股分析頁面

「個股分析」分頁會即時呼叫 `stock-analysis` webhook。已知這個 webhook 目前尚未在 n8n 端註冊成 production URL（呼叫會得到 404），需要到 n8n 編輯畫面重新存檔 / 啟用該 workflow 才能使用。頁面本身已經處理好這個錯誤狀態，會顯示清楚的中文錯誤訊息（404 / CORS / 其他錯誤各自不同提示），修好後不需要改前端程式碼。

另外也發現 `hot-stocks` 回傳的兩段 AI 分析文字（`stockAIAnalysis`、`etfAIAnalysis`）目前常在句子中間被截斷，推測是 n8n 內 Claude 節點的輸出長度（max tokens）設太低，建議調高。

## 部署到 GitHub Pages

Repo 設定 → Pages → Source 選 `main` 分支 `/ (root)`，存檔後幾分鐘內就能透過 `https://<帳號>.github.io/<repo>/` 存取。這是純靜態檔案，不需要任何建置步驟。

## 安全性備註

- n8n 的 API Key（用來透過 n8n Management API 讀取 workflow 設定）**不會**出現在這個 repo 裡，只存在本機的 `.env`（已被 `.gitignore` 排除）。
- 前端實際呼叫的 `hot-stocks` / `stock-analysis` webhook 本身不需要驗證，屬於公開端點，所以直接寫在 `assets/app.js` 裡沒有安全疑慮。
