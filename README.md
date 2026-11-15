# 八目 HACHIME

跳蛛圖鑑、飼養筆記與 A1 飼養盒的靜態網站。保留筆記本首頁、可拖曳便條和翻頁閱讀；部署在 [GitHub Pages](https://kotania1130.github.io/hachime-site/)。

## 本機開啟

需要 Node.js 20 以上。網站本身沒有套件依賴或建置步驟。

```sh
npm ci
npm run dev
```

開啟 `http://127.0.0.1:8000/`。可用 `PORT`、`HOST` 調整預覽伺服器；也可以直接使用其他靜態伺服器。

## 要改哪裡

| 內容 | 檔案 |
|---|---|
| 頁面結構、首頁與各頁固定文案 | [index.html](index.html) |
| 新手指南、飼養筆記、FAQ、產品與活體資料 | [assets/site-content.js](assets/site-content.js) |
| 31 筆圖鑑名稱、學名、分布與來源 | [assets/species-data.js](assets/species-data.js) |
| 導覽、章節捲動、拖曳、輪播、購物車 | [assets/app.js](assets/app.js) |
| 基礎樣式／目前筆記本版面 | [base.css](assets/styles/base.css)、[notebook.css](assets/styles/notebook.css) |
| 首次引導／翻頁效果 | [welcome.js](assets/welcome.js)、[paper-turn.js](assets/paper-turn.js) |
| 照片及署名 | [assets/photos/](assets/photos/)、[ASSET_CREDITS.md](ASSET_CREDITS.md) |

`index.html` 依序載入圖鑑資料、網站內容及互動程式。CSS 維持原本覆蓋順序，沒有導入框架或打包工具。舊版 CSS 已封存，不再由正式頁面載入。

## 檢查與測試

```sh
npm run check
npm test
```

`check` 檢查本地引用、文件連結、JS 語法、重複 ID 與資料對應。`test` 自動啟動暫時的本機伺服器，執行六套 Chromium 瀏覽器測試，結束後關閉。

若電腦沒有 Chromium，先執行 `npx playwright install chromium`。測試會優先採用 `CHROMIUM_PATH`，其次是 `/usr/bin/chromium`，再使用 Playwright 安裝的版本。

- `npm run test:smoke`：只跑主要操作。
- `npm test -- atlas-catalog paper-interactions`：指定測試。
- `BASE_URL=http://127.0.0.1:8000/ npm test`：使用已開啟的伺服器。
- `npm run format`：格式化目前頁面、資料、樣式及維護腳本。
- `npm run share`：重新產生分享預覽圖。

## 目前功能與限制

首頁六張主要便條；新手指南七章；飼養筆記五主題與 FAQ；圖鑑 31 個入口；活體介紹三項；A1 四種尺寸、三種款式。內頁目錄置左，章節快速捲動，開啟／關閉內容才翻頁。

繁殖日記尚無實際紀錄，社群入口準備中；活體與產品未販售。購物車只供試用，沒有訂單、付款或後端。未定種、類群及暫用名稱仍明示；照片待補處不拿其他物種代替。

## 文件與發布

- [現行設計規格](DESIGN_SPEC.md)
- [全站文案檢查與維護原則](docs/CONTENT_REVIEW.md)
- [文件索引](docs/README.md)：分類研究、設計參考、歷史規格與預覽。
- [歷史版本紀錄](docs/archive/RELEASE_HISTORY.md)

修改建立獨立分支，測試後透過 PR 合併。GitHub Pages 從 `main` 根目錄發布；合併後應確認部署成功、正式站資源可載入。
