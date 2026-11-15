# 老虎狗與獅子狗：多來源核對

核對日期：2026-11-15。此紀錄取代 V0.24 依使用者暫定說法建立的暱稱對照；先前將對照寫成確定答案，證據不足。

## 採用的對照

| 玩家稱呼 | 學名 | 中文名與證據範圍 |
|---|---|---|
| 老虎狗 | Hyllus diardi (Walckenaer, 1837) | 斑腹蠅象。台灣店家原始商品標題直接列出三者，另一店家確認中文名／學名。 |
| 獅子狗 | Hyllus giganteus C. L. Koch, 1846 | 玩家原始貼文直接對應暱稱與學名。「巨蠅象」尚未找到足夠中文文獻支持，網站只保留為暫用中文名。 |

這是有來源的玩家／店家名稱用法，不宣稱是所有地區統一俗名，也不能替代個體鑑定。ITIS 和 GBIF 支持學名的分類地位，不證明中文暱稱。

## 已讀取的原始來源

1. [海兔有蠍特蛛專門店](https://seaharescorpion.com/product/%e6%96%91%e8%85%b9%e8%a0%85%e8%b1%a1-hyllus-diardi)：商品標題為「斑腹蠅象 / 老虎狗跳蛛 Hyllus diardi」。本次直接讀取頁面，作為台灣店家使用暱稱的依據。
2. [森流 GreenFlow](https://www.greenflow.hk/products/giant-jumping-spider-hyllus-diardi)：商品標題為「斑腹蠅象 Giant Jumping Spider (Hyllus diardi)」。本次直接讀取頁面，支持斑腹蠅象／學名對照；該標題沒有老虎狗或獅子狗。沒有沿用其中的體長、飼養數值或其他描述。
3. [Jumpers Fever 跳蛛狂熱原始貼文](https://www.facebook.com/JumpersFever/videos/609658169616470/)（[完整網址](https://www.facebook.com/JumpersFever/videos/hyllus-giganteus-%E7%8D%85%E5%AD%90%E7%8B%97%E8%B7%B3%E8%9B%9B/609658169616470/?locale=zh_TW)）：原頁標題／貼文文字直接包含「Hyllus giganteus (獅子狗跳蛛)」，並說明這個暱稱由朋友幫忙取名。本次可讀取原頁的公開標題文字，未播放影片。支持的是該玩家的名稱用法。
4. ITIS：[H. diardi，TSN 881697](https://www.itis.gov/servlet/SingleRpt/SingleRpt?search_topic=TSN&search_value=881697)／[H. giganteus，TSN 881704](https://www.itis.gov/servlet/SingleRpt/SingleRpt?search_topic=TSN&search_value=881704)：兩筆 Current Standing 均為 valid，列出學名及命名者。該批資料引用 WSC 2019，不宣稱是最新分類修訂。
5. GBIF：[H. diardi](https://www.gbif.org/species/5172263)／[H. giganteus](https://www.gbif.org/species/5172346)：本次透過 [diardi API](https://api.gbif.org/v1/species/match?name=Hyllus%20diardi) 與 [giganteus API](https://api.gbif.org/v1/species/match?name=Hyllus%20giganteus) 核對，均回傳 SPECIES、ACCEPTED、EXACT。與 ITIS 的分類來源可能重疊，不計為兩次獨立分類研究。

## 搜尋線索與限制

- Brave 搜尋另找到跳蛛狂熱的 [YouTube 影片](https://www.youtube.com/watch?v=YR1ntlsHM8U)，摘要以老虎狗對應 H. diardi；原影片頁回 403，僅作旁證，沒有宣稱看過影片。
- Gramhir 轉載同一玩家的 Instagram 文字也以獅子狗對應 H. giganteus；與上述玩家同源，不計為獨立證據。
- WSC 的兩個物種頁本次都回 503；未宣稱完成 WSC 即時核對。
- HKinsector 回驗證頁，百度百科的巨蠅象頁回驗證頁；沒有以頁面標題或搜尋失敗推論物種不存在。
- 未找到足以支持「老虎狗＝H. giganteus、獅子狗＝H. diardi」的原始來源。這不證明其他人絕不這樣使用，只表示本站不再採用沒有證據的反向對照。
- 「巨蠅象」中文名仍待核對。這次不變更綠翠與西邁塔的資料狀態。

## 網站處理

- `#atlas/hyllus` 始終對應 H. diardi，顯示老虎狗／斑腹蠅象；`#atlas/giganteus` 始終對應 H. giganteus，顯示獅子狗。
- 既有 `hyllus.jpg` 的物種標示是 H. diardi，配回老虎狗；獅子狗缺少已核對照片，圖鑑留位、活體區使用明確標示的一般蜘蛛圖。
- 首頁圖注、圖鑑目錄、活體卡片與輪播、來源／授權說明一致修正。每個圖鑑條目可點開本次名稱來源。
- 沒有下載或重用店家與玩家的照片、影片或長段文案；本站原有照片授權不變。
