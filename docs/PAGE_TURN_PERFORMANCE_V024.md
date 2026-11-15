# V0.24 翻頁效能檢查

日期：2026-11-15。測量 Linux headless Chromium、1440×1000、CDP 4× CPU slowdown、本機靜態伺服器，外部資源封鎖。依序開啟新手／返回／再開啟／返回，各觀察 1.1 秒。修改前後使用同一份腳本並循序執行，沒有在量測時並跑其他瀏覽器測試。

## 觀察到的原因

V0.23 每次深複製整個首頁或含隱藏分頁的詳細區，再建立完整樣式的 Shadow DOM；StPageFlip 另會產生紙背副本。首次樣式解析、重複 DOM、紙紋濾鏡及多層陰影讓工作集中在點擊瞬間。這不是章節捲動的速度設定造成的。

V0.24 改為閒置時預先解析、跨轉場共用樣式；首頁只複製視窗附近區塊，內頁只複製正在閱讀的文章。暫時副本去除噪點與多層陰影，實際頁面樣式不變；翻頁引擎的折線陰影仍保留。

## 同環境前後結果

| 指標 | V0.23 | V0.24 |
|---|---:|---:|
| 首次 play 同步耗時 | 104.6 ms | 25.7 ms |
| 四次 play 同步耗時中位數 | 44.4 ms | 25.0 ms |
| 最大長任務 | 158.0 ms | 83.0 ms |
| 最大動畫框架間隔 | 283.3 ms | 133.4 ms |

首次轉場的同步建立成本明顯下降，但 4× CPU 慢速條件下仍有掉幀；此結果不表示穩定 60fps，也不能替代 Windows／實際手機檢查。重繪與系統負載會影響單次結果。

重現命令：`BASE_URL=http://127.0.0.1:8001/ node scripts/profile-page-turn.cjs`。腳本輸出各次 capture、play、longtask 與框架間隔，不設易受環境影響的 CI 時間門檻。另由 paper-interactions 驗證快速連點、resize、減少動態、銷毀後無殘留 RAF 及套件失敗時仍可導覽。

原始四次數據（毫秒）：

```json
{
  "before": [
    {
      "samples": [
        {
          "type": "capture",
          "duration": 2.100000001490116
        },
        {
          "type": "play",
          "duration": 104.60000000149012
        },
        {
          "type": "longtask",
          "duration": 158
        },
        {
          "type": "longtask",
          "duration": 136
        },
        {
          "type": "longtask",
          "duration": 78
        }
      ],
      "frames": 56,
      "max": 283.30000000000007,
      "p95": 66.80000000000018,
      "over33": 9,
      "overlay": false
    },
    {
      "samples": [
        {
          "type": "capture",
          "duration": 6.100000001490116
        },
        {
          "type": "play",
          "duration": 59.5
        },
        {
          "type": "longtask",
          "duration": 78
        },
        {
          "type": "longtask",
          "duration": 51
        },
        {
          "type": "longtask",
          "duration": 63
        }
      ],
      "frames": 49,
      "max": 116.70000000000027,
      "p95": 66.70000000000027,
      "over33": 12,
      "overlay": false
    },
    {
      "samples": [
        {
          "type": "capture",
          "duration": 2.1999999955296516
        },
        {
          "type": "play",
          "duration": 16.200000002980232
        },
        {
          "type": "longtask",
          "duration": 58
        },
        {
          "type": "longtask",
          "duration": 123
        }
      ],
      "frames": 54,
      "max": 166.5999999999999,
      "p95": 50.100000000000364,
      "over33": 8,
      "overlay": false
    },
    {
      "samples": [
        {
          "type": "capture",
          "duration": 4.5
        },
        {
          "type": "play",
          "duration": 29.200000002980232
        }
      ],
      "frames": 46,
      "max": 66.69999999999982,
      "p95": 50.099999999999454,
      "over33": 13,
      "overlay": false
    }
  ],
  "after": [
    {
      "samples": [
        {
          "type": "capture",
          "duration": 2.8000000044703484
        },
        {
          "type": "play",
          "duration": 25.700000002980232
        },
        {
          "type": "longtask",
          "duration": 83
        },
        {
          "type": "longtask",
          "duration": 52
        }
      ],
      "frames": 54,
      "max": 133.39999999999998,
      "p95": 66.70000000000005,
      "over33": 8,
      "overlay": false
    },
    {
      "samples": [
        {
          "type": "capture",
          "duration": 0.6000000014901161
        },
        {
          "type": "play",
          "duration": 66.19999999552965
        },
        {
          "type": "longtask",
          "duration": 75
        }
      ],
      "frames": 46,
      "max": 100.10000000000014,
      "p95": 66.69999999999982,
      "over33": 11,
      "overlay": false
    },
    {
      "samples": [
        {
          "type": "capture",
          "duration": 3
        },
        {
          "type": "play",
          "duration": 8.700000002980232
        }
      ],
      "frames": 43,
      "max": 116.59999999999991,
      "p95": 66.69999999999982,
      "over33": 11,
      "overlay": false
    },
    {
      "samples": [
        {
          "type": "capture",
          "duration": 1.2999999970197678
        },
        {
          "type": "play",
          "duration": 24.299999997019768
        }
      ],
      "frames": 50,
      "max": 83.29999999999927,
      "p95": 50,
      "over33": 7,
      "overlay": false
    }
  ]
}
```
