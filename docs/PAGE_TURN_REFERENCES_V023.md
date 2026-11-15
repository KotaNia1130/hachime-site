# 翻頁參考與 HACHIME 採用方式

檢視日期：2026-11-15。比對公開說明、範例及原始碼；StPageFlip 另檢視官方動畫示範逐格畫面。

| 參考 | 可參考之處 | 本次決定 |
|---|---|---|
| [StPageFlip](https://nodlik.github.io/StPageFlip/) / [原始碼](https://github.com/Nodlik/StPageFlip) | 軟紙由角落捲起、折線裁切、紙背與內外陰影；可用 HTML，也有手機單頁模式 | 採用 MIT 授權 2.0.7 的軟紙幾何，作短暫頁面轉場。本地保存程式及授權。 |
| [Turn.js](https://www.turnjs.com/) / [公開版本](https://github.com/blasten/turn.js) | 雜誌式雙頁、頁角翻動、翻頁時的漸層陰影 | 只作參考。公開版本 README 標示 non-commercial BSD，且依賴 jQuery；沒有把此版本放進品牌網站。 |
| [BookBlock](https://tympanus.net/Development/BookBlock/) / [原始碼](https://github.com/codrops/BookBlock) | 翻動方向、兩面的陰影與速度配置 | 只作參考；它偏向平面折頁，這次希望有更明顯的軟紙捲角。 |

## 對應需求

- 首頁仍是一張完整的筆記桌面，內頁仍是連續長文。
- 點便條／跨分類閱讀時，前一畫面的暫存副本從右下角翻走，露出新內容；返回則從左側反向翻走。
- 紙背使用暖色格線與非常淡的正面透印，陰影隨折線移動。沒有增加固定中央摺痕。
- 動畫使用隔離的視覺副本，不改動正在閱讀的文字層。副本設為 inert、aria-hidden、不接收指標事件；不加入可操作的重複控制項。
- 章節目錄位於內頁左邊。點章節只做 280–520ms 捲動，不觸發翻頁；手機使用左上角「章節」按鈕。
- 使用者自行捲動、觸控或鍵盤移動時可以中斷章節動畫；連點以最後一次為準。減少動態設定略過兩種動畫。

## 本地實作與授權

`assets/vendor/page-flip/` 保存 2.0.7、MIT LICENSE、來源及原始檔 SHA-256。對上游做一項生命週期修正：destroy 時取消動畫框架排程，避免一次性轉場留下循環。幾何未修改。

`assets/paper-turn.js` 負責畫面副本、紙背、方向與結束清理。返回採用鏡像翻動、印刷內容再反向鏡像，避免單頁模式的返回翻動跑到可視範圍外。文字最後仍回到原本無 transform 的閱讀層。

第三方範例的照片、文字及版面未引入本站。現有照片署名與授權沿用 ASSET_CREDITS.md。
