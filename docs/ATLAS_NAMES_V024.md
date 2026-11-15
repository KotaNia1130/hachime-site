# V0.24 圖鑑名稱與資料來源

核對日期：2026-11-15。玩家名稱採本專案用法；物種名稱不代表個體鑑定。使用者最後更正為「老虎狗＝巨蠅象、獅子狗＝斑腹蠅象」，已撤回先前「巨腹」線索。

| 顯示暱稱 | 學名／狀態 | 名稱來源與處理 |
|---|---|---|
| 安德遜 | Hasarius adansoni | [TaiCOL t0029542](https://taicol.tw/zh-hant/taxon/t0029542)，中文名安德遜蠅虎，台灣有紀錄。 |
| 雙帶扁 | Menemerus bivittatus | [TaiCOL t0096348](https://taicol.tw/zh-hant/taxon/t0096348)，中文名雙帶扁蠅虎，別名包氏扁蠅虎，台灣有紀錄。 |
| 綠翠 | 學名待確認 | 目前沒有可靠名稱對照；不套用 Siler cupreus（TaiCOL 記為藍翠蛛），也不以綠色外觀指定物種。保留台灣觀察入口與待補欄位。 |
| 佛跳 | Phidippus regius | 沿用物種資料與既有授權照片；[學名、命名者與分布參考](https://en.wikipedia.org/wiki/Phidippus_regius)。 |
| 老虎狗 | Hyllus giganteus | 中文巨蠅象與暱稱依使用者最後指定；[學名、命名者及物種參考](https://en.wikipedia.org/wiki/Hyllus_giganteus)。不再借用 H. diardi 照片。 |
| 獅子狗 | Hyllus diardi | [斑腹蠅象中文名稱](https://zh.wikipedia.org/zh-tw/%E6%96%91%E8%85%B9%E8%9D%87%E8%B1%A1)／[物種資料](https://en.wikipedia.org/wiki/Hyllus_diardi)。此中文條目引述中國動物物種編目資料庫。 |
| 唇形孔蛛 | Portia labiata | [中文名稱](https://zh.wikipedia.org/zh-tw/%E5%94%87%E5%BD%A2%E5%AD%94%E8%9B%9B)／[物種及行為文獻](https://en.wikipedia.org/wiki/Portia_labiata)。不增加未核對的飼養參數。 |
| 西邁塔 | 學名待確認 | 使用者未確定；Simaetha 屬雖存在，尚不能只用音譯判定對應，未當作已確認學名。 |
| 澳洲孔雀蜘蛛 | Maratus spp. | [Maratus 屬](https://en.wikipedia.org/wiki/Maratus)，是多物種類群，不當成單一種。以 [M. volans](https://en.wikipedia.org/wiki/Maratus_volans) 作未來可拆分條目的例子。 |
| 大膽跳蛛 | Phidippus audax | 保留原有條目與照片；[學名及物種參考](https://en.wikipedia.org/wiki/Phidippus_audax)。 |

TaiCOL 的即時 API 已取得安德遜、雙帶扁及藍翠蛛紀錄。WSC 直接連線本次回 503，未宣稱完成 WSC 即時核對；相關百科條目中的分類來源可供後續交叉查證。文字為本專案重新整理的簡短摘要，未抄錄長段原文。

## 照片與舊連結

`assets/photos/hyllus.jpg` 的原始檔名與中繼資料標示 **Hyllus diardi**。因此現在用於獅子狗／斑腹蠅象，首頁圖注、圖鑑、活體卡片與輪播同步改名。檔案本身、作者 Doreen 與 CC BY 4.0 不變。

`#atlas/hyllus` 保留指向原學名 H. diardi，現在顯示獅子狗。老虎狗新增 `#atlas/giganteus`。既有 `#atlas/regius`、`#atlas/audax` 保持。

只有既有三張照片可直接使用。其他條目以「照片待補」留位，不拿別種照片冒充；活體規劃區的老虎狗暫用既有 OpenMoji 一般蜘蛛圖，明確標示非該物種外觀。
