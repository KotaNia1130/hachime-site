# 專案整理（V0.27）

## 正式網站

- `index.html`：頁面 HTML 與固定文案。
- `assets/app.js`：從原 HTML 移出的互動程式。
- `assets/site-content.js`：新手、飼養筆記、FAQ、產品、活體與照片資料；移除未使用的章節 label、主題欄位與舊首頁輪播資料。
- `assets/species-data.js`：圖鑑資料。
- `assets/styles/base.css`：原本的 HTML 內嵌樣式。
- `assets/styles/notebook.css`：原本使用的 V0.16、V0.17、V0.19、V0.24 樣式，依同樣順序合併，修正本地字體相對路徑。
- `assets/welcome.js`、`assets/paper-turn.js`：首次引導與翻頁；第三方翻頁程式及 MIT 授權留在 vendor。

抽離程式與樣式後，先以 390、768、1440px 的首頁、新手、圖鑑及產品頁比對幾何位置與字體，再進行文案修改。CSS 覆蓋關係保留，沒有憑選擇器看似重複就刪掉會影響手機版或翻頁快照的規則。

## 封存與素材

舊版規格放在 `docs/archive/specs/`，規劃放在 `docs/archive/planning/`，預覽放在 `docs/archive/previews/`，版本 CSS 放在 `docs/archive/styles/`。舊 README 改為版本紀錄。Markdown 連結與預覽返回網址已依新位置調整。

未載入正式站的蕨類、舊插圖與舊標誌仍保留原始素材及授權，因為歷史設計與來源紀錄會用到。它們不會被正式頁面載入。需要刪除時應同時核對歷史引用，不能只靠目前首頁沒顯示就移除。

## 開發工具

`package.json` 和 lockfile 鎖定 Playwright 與格式工具。網站依然可直接用靜態伺服器開啟。`scripts/serve.cjs` 供本機預覽；`scripts/check.cjs` 檢查資源及文件連結；`scripts/test.cjs` 自動開啟暫時伺服器並執行既有六套測試。

`.gitignore` 排除套件、機密環境檔與測試輸出。沒有修改雲端環境設定或 GitHub Pages 的發布來源。

## 本次驗證

- `npm run check`：本地資源、文件連結、JS 語法、ID 與內容對應通過。
- `npm test`：六套瀏覽器測試全部通過，涵蓋 320–1440px、觸控、鍵盤、返回、輪播、引導、購物車及翻頁中斷／清理。
- 最後刪減重複標示後，再跑 `npm test -- browser-smoke field-layout`，兩套通過。
- 抽離程式／樣式前後，12 組頁面與視窗尺寸的幾何位置及字體相同。逐頁人工檢視手機／桌面截圖；31 筆圖鑑資料比對一致，只有程式格式整理。

瀏覽器自動驗收使用 Linux Chromium，未包含 Windows ClearType 實機畫質判斷。實際照片、社群網址及商品上市資料仍需後續提供。
