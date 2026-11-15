# HACHIME｜素材來源與授權（更新至 V0.22）

## V0.22：內頁連續閱讀

沒有新增圖片、字型或第三方素材。移除首頁目錄；內頁章節目錄、分隔線與長文配置由本站 HTML／CSS 製作。既有照片署名與授權保持。

## V0.21：首頁還原與內容轉場

沒有新增圖檔或字型。照片回到同一張首頁桌面的原位置，V0.20 的紙型、自然文案與分享圖保留；翻頁覆層改用於開啟／關閉詳細內容。圖片來源與授權不變。


## V0.20：分頁與紙型

本版沒有新增第三方圖檔或字型。既有三張授權照片分配到首頁與圖鑑頁；A1 沿用原創概念圖。中央摺痕移除，撕頁清單、橫線紙、索引卡、資料袋與翻頁覆層由本站 CSS 製作，不包含參考站素材。正文與圖注不參與翻頁變形。

分享圖 `assets/hachime-share.png` 由 `scripts/render-share.cjs` 以既有原創標誌／概念插圖重新排版，文字改為分類說明，未新增外部圖片。


## V0.19：沿用照片，調整內容與相紙構圖

沒有新增第三方圖檔或字型。首頁三張照片各使用一次：佛跳作品牌觀察主圖，大膽跳蛛及老虎狗作圖鑑入口；攝影者、來源、授權沿用下方 V0.17 記錄。照片皆是第三方物種參考，非八目個體或繁殖成果。

CSS 調整裁切、相片與相紙的旋轉；圖注、標題、正文保持水平。老虎狗的攝影者及 CC BY 4.0 在照片下標示，來源與授權入口可開啟關於頁完整連結。A1 沿用原創 PLUS 概念圖。紙張、格線、註記線條與目錄外觀為本站 CSS／SVG，未取用ほとりで的圖片、字標或程式。

首頁不再展示蕨類歷史圖版與舊裝飾插圖；原檔、授權和歷史記錄保留。手寫旁註沿用本地 LXGW WenKai TC 子集，缺字依既有後備字體顯示。


## V0.18：植物圖版與本地手寫旁註

| 檔案 | 來源／署名 | 授權 | 使用方式 |
|---|---|---|---|
| `assets/photos/fern-plate.jpg` | [A fern frond, possibly Polystichum aculeatum — Wellcome V0043910](https://commons.wikimedia.org/wiki/File:A_fern_frond,_possibly_Polystichum_aculeatum_Wellcome_V0043910.jpg)；Wellcome Collection。來源描述為約 1860 年的自然印刷圖版，植物名稱保留原來源的不確定性。 | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | 官方 300px 寬縮圖；圖檔未編輯，CSS 裁切、旋轉、multiply 疊色。首頁圖注及關於頁皆署名、連結來源與授權。 |
| `assets/field-handwriting.ttf` | [LXGW WenKai TC](https://github.com/google/fonts/tree/main/ofl/lxgwwenkaitc)，Copyright 2024 The LXGW WenKai Project Authors；Google Fonts 提供文字子集 | SIL Open Font License 1.1 | 本地載入的手寫旁註片段；未自行改名或修改字型。授權全文：`assets/FIELD-FONT-OFL.txt`。 |

取得日期：2026-11-15。下載網址、用途、SHA-256 見 `assets/field-materials.json`；植物圖版 API 中繼資料保存於 `assets/photos/fern-metadata.json`。

植物圖版用於裝飾，不表示八目採集／飼養此植物，也不把它當成跳蛛棲地紀錄。物種名稱沿用來源描述，不將「possibly」省略為確定鑑定。

首頁圓形局部圖沿用 V0.17 的佛跳照片（spidereyes2020，CC0），只在 CSS 中放大裁切，並明示是同一張照片。紙張、撕邊、迴紋針、指示線、裝訂孔與紙面噪點為本站 CSS／內嵌 SVG 裝飾，未取用參考網站圖檔。照片、正文與出處連結的文字層不旋轉。

## V0.17：本地照片與相框

2026-11-15 透過 Wikimedia Commons API，以標明專案用途與儲存庫網址的 User-Agent 查詢來源並取得官方 960px 縮圖。三張照片各約 160–271 KiB，合計約 623 KiB。未編輯下載的圖檔，只用 CSS 依照片框裁切顯示。

| 本地檔案 | 作者 | 授權 | 來源 |
|---|---|---|---|
| `assets/photos/regius.jpg` | spidereyes2020 | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [Female Phidippus regius - 51291758782.jpg](https://commons.wikimedia.org/wiki/File:Female_Phidippus_regius_-_51291758782.jpg) |
| `assets/photos/audax.jpg` | Kaldari | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | [Kaldari Phidippus audax 01.jpg](https://commons.wikimedia.org/wiki/File:Kaldari_Phidippus_audax_01.jpg) |
| `assets/photos/hyllus.jpg` | Doreen | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | [Hyllus diardi 281266755.jpg](https://commons.wikimedia.org/wiki/File:Hyllus_diardi_281266755.jpg) |

- `assets/photos/sources.json` 保存來源、官方縮圖下載網址、授權、取得日期、使用說明及 SHA-256。
- `assets/photos/commons-metadata.json` 保存取得時的 API 回覆，含原始檔網址、作者與授權中繼資料。
- 用途：首頁照片框／圖鑑預覽、物種頁，以及佛跳／老虎狗活體規劃項目的物種參考。均不是八目的個體、商品或繁殖紀錄，不暗示作者為品牌背書。
- 圖鑑預覽的「來源與授權」連到關於頁逐張署名；獨立照片、圖鑑詳細頁與活體卡／輪播附來源及授權連結。CC BY 圖片明示裁切顯示。
- 獅子狗仍使用 OpenMoji 一般蜘蛛插圖，學名待確認。A1 沒有實物照片，維持原創概念圖，不找相似商品照片冒充。
- 相框、膠帶、紙張及顏色為本站 CSS。參考ほとりで的圖文留白與自由編排，未使用該站圖檔或字標。

以下保留各版歷史紀錄。

## V0.16：品牌拼貼與新增裝飾

於 2026-11-15 自 OpenMoji 官方儲存庫取得以下未修改的 SVG；作者為 OpenMoji，授權 CC BY-SA 4.0。僅在網頁中縮放／旋轉顯示。授權全文隨附於 `assets/OPENMOJI-LICENSE.txt`，取得日期、來源及 SHA-256 見 `assets/new-materials.json`。

| 本地檔案 | 官方來源 | 用途 |
|---|---|---|
| `assets/openmoji-seedling.svg` | https://github.com/hfg-gmuend/openmoji/blob/master/color/svg/1F331.svg | 品牌觀察拼貼的幼苗裝飾 |
| `assets/openmoji-magnifier.svg` | https://github.com/hfg-gmuend/openmoji/blob/master/color/svg/1F50D.svg | 品牌觀察拼貼的放大鏡裝飾 |

主圖採本站既有 `spider-regius.svg` 與 `enclosure-core.svg`，開發札記採 `enclosure-plus.svg`。全部為概念插圖，不代表八目在養個體、完成打樣或實際商品。新紙張、膠帶、引導縮圖與線條使用本站 CSS 排版，未複製參考站的圖檔。分享圖 `hachime-share.png` 由 `scripts/render-share.cjs` 排版本站標誌及原創跳蛛圖產生，不包含上述 OpenMoji 裝飾。

V0.16 當時重新查詢 Wikimedia 遇到 HTTP 403，未新增照片。V0.17 已依 Wikimedia 的 User-Agent 要求完成查詢並保存合法副本，見上方。

## V0.14：蜘蛛活體示意素材與 LOGO 修正

- 佛跳項目使用專案既有 `assets/spider-regius.svg`；老虎狗使用 `assets/spider-hyllus.svg`。均為原創概念插圖，不代表現有個體或商品實拍。
- 獅子狗項目暫用 `assets/openmoji-spider.svg`（OpenMoji 1F577，一般蜘蛛圖）。作者 OpenMoji，CC BY-SA 4.0；原圖未修改，僅顯示縮放／旋轉。此圖不代表獅子狗的真實外觀，學名待核對。原始連結及授權見下方外部開源插圖表，詳細頁亦提供署名與授權連結。
- 本版未引入新第三方圖片，也未把其他物種的照片當成獅子狗實拍。
- `assets/hachime-symbol-v2.svg` 僅調整最左眼高光至右上；每眼仍只有一個高光，其他構圖與配色不變。

網站目前為設計測試版。以下素材已列出來源，便於之後正式商業使用、替換和審核。

## 外部開源插圖

本次採用 [OpenMoji](https://openmoji.org/) 專案的 SVG 插圖，原始檔從 [hfg-gmuend/openmoji](https://github.com/hfg-gmuend/openmoji) 擷取。

**作者／權利標示**：All emojis designed by OpenMoji – the open-source emoji and icon project.  
**授權**：[Creative Commons Attribution–ShareAlike 4.0 International（CC BY-SA 4.0）](https://creativecommons.org/licenses/by-sa/4.0/)。  
**目前用途**：網站筆記總覽中的裝飾插圖。SVG 內容未修改，僅在網頁顯示時進行尺寸、透明度、旋轉和飽和度的調整。若未來重製、混合或改作素材，應重新檢查同條款分享的義務。

| 本站檔案 | OpenMoji 來源 | 說明 |
|---|---|---|
| `assets/openmoji-spider.svg` | [1F577.svg](https://github.com/hfg-gmuend/openmoji/blob/master/color/svg/1F577.svg) | 一般蜘蛛插圖；非跳蛛物種鑑別資料 |
| `assets/openmoji-herb.svg` | [1F33F.svg](https://github.com/hfg-gmuend/openmoji/blob/master/color/svg/1F33F.svg) | 葉片 |
| `assets/openmoji-cherry-blossom.svg` | [1F338.svg](https://github.com/hfg-gmuend/openmoji/blob/master/color/svg/1F338.svg) | 花朵 |
| `assets/openmoji-potted-plant.svg` | [1FAB4.svg](https://github.com/hfg-gmuend/openmoji/blob/master/color/svg/1FAB4.svg) | 盆栽 |

OpenMoji 相關圖片的 CC BY-SA 4.0 授權**不表示整個 HACHIME 網站程式碼也使用相同授權**。素材及其衍生作品適用條款應個別判斷。

## 自製暫用插圖

- `assets/terrarium-concept.svg`：為八目原型自行繪製的簡化飼養盒概念線稿，不代表正式商品尺寸、設計或安全驗證結果。
- 筆記弧線標語、虛線箭頭與曲線：本站 SVG 排版示意。

## 暫用標語

「科技始於人性」「千里之行，始於足下」「格物致知・記錄觀察」為**排版占位文字**，不代表已定稿品牌文案，亦不對外標示為原創名言或冒用作者署名。

## 日後要補充的素材

- 真正的跳蛛微距照片、物種與拍攝者註記；
- A1 飼養盒實拍與可驗證的規格；
- 統一美術風格的原創跳蛛插畫。

在正式使用第三方照片或插畫時，應逐件記錄來源、作者、授權及修改情況。

## V0.12 新增：品牌與展示概念插畫

以下 SVG 為此專案內新增的**原創設計草稿**，不是從 いらすとや 或其他商家圖片轉製：

| 檔案 | 用途與限制 |
|---|---|
| `assets/hachime-mark.svg` | 八眼前臉簡化 LOGO 草案；尚未正式定稿 |
| `assets/spider-regius.svg` | 佛羅里達跳蛛的 Q 版概念插圖，非物種鑑定圖 |
| `assets/spider-audax.svg` | 大膽跳蛛的 Q 版概念插圖，非物種鑑定圖 |
| `assets/spider-hyllus.svg` | 老虎狗跳蛛的 Q 版概念插圖，非物種鑑定圖 |
| `assets/enclosure-core.svg` | CORE 規劃概念，非商品實拍 |
| `assets/enclosure-plus.svg` | PLUS 規劃概念，非商品實拍 |
| `assets/enclosure-pro.svg` | PRO 規劃概念，非商品實拍 |

這些插畫僅用來驗證網站的版面、輪播與品牌語言。正式銷售前應替換為實物照片和經核對的飼養資訊。

## 字體來源

- **清松手寫體 6 號**：作者游清松，SIL Open Font License；使用遠端公開字型來源，尚未放入本站原始碼儲存庫。
- **Huninn／jf open 粉圓**：justfont，SIL Open Font License；網站透過 Google Fonts 提供。適用繁體中文的圓潤內文字體。
- **Noto Sans TC**：Google Fonts，SIL Open Font License，用於品牌資訊與常規內文。

## いらすとや使用說明

參考 [いらすとや](https://www.irasutoya.com/) 的親切資訊插畫呈現方式，**沒有直接複製或使用它的圖檔**。該網站素材的商業使用有獨立條件與數量限制；如日後採用，須先核對[官方利用規定](https://www.irasutoya.com/p/terms.html)。


## V0.13：Wikimedia Commons 跳蛛照片（新）

從 V0.13 起，原本「跳蛛圖鑑」便條與圖鑑詳細頁顯示 **Wikimedia Commons 的實際照片**，不是從搜尋結果直接抓不明來源圖片。原圖由作者提供或經平台授權審查，逐張使用如下：

| 跳蛛 | 原始檔與來源 | 攝影者 | 授權 | 使用／變更 |
|---|---|---|---|---|
| 佛羅里達跳蛛 (*Phidippus regius*) | [Female Phidippus regius - 51291758782.jpg](https://commons.wikimedia.org/wiki/File:Female_Phidippus_regius_-_51291758782.jpg) | spidereyes2020 | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | 網站照片框可裁切顯示，原始照片未修改 |
| 大膽跳蛛 (*Phidippus audax*) | [Kaldari Phidippus audax 01.jpg](https://commons.wikimedia.org/wiki/File:Kaldari_Phidippus_audax_01.jpg) | Kaldari | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | 網站照片框可裁切顯示，原始照片未修改 |
| 老虎狗跳蛛 (*Hyllus diardi*) | [Hyllus diardi 281266755.jpg](https://commons.wikimedia.org/wiki/File:Hyllus_diardi_281266755.jpg) | Doreen（iNaturalist 作者） | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | **須署名並提供授權連結；**網頁依圖片框裁切顯示，不改變原始照片 |

V0.13 當時透過 Wikimedia Commons 的 `Special:Redirect/file` 外部參照，未儲存照片二進位副本；V0.17 已下載本地副本，取代外部轉址。此方式可展示但可能受網路、檔案轉址及外部站點變更影響。若載入失敗，會替換成先前自繪的示意 SVG。正式對外營運前，宜按各授權下載保留合法可用的自有版本，並記錄來源日期與校驗值。

### 使用與授權注意

- **Wikimedia Commons 並非每張圖都屬公有領域**；照片著作權與使用條件依各檔案頁決定。
- CC BY 4.0 圖片的署名、原始檔和授權應可找到，並標示顯示時有版面裁切；不可暗示原攝影者為八目品牌背書。
- 這些照片不是八目的實際飼養個體，不得拿來代表商品實拍或作為嚴格物種鑑別證據。
- A1 箱體仍使用本站的原創概念 SVG，並註明規劃中／尚未上市，不用其他商家產品照片冒充八目設計。


## 品牌圖形補充：單高光八眼標誌

- `assets/hachime-symbol-v2.svg`：依照選定的「八眼＋米色弧線＋葉片」視覺方向整理成適合網站縮放的純圖形 SVG，八個眼睛各只有**一處**白色高光，沒有文字。
- 本版已用於頂端導覽與網站 favicon；現有「八目 HACHIME」文字標誌尚未重新設計。
- `assets/hachime-mark.svg`：上一版偏 Q 的蜘蛛臉草案，僅供比較，網站不再使用。
