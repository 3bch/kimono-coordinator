# テーマ

段階 2（`app-design-plan.md`）で決めた、色とタイポグラフィの定義。
実物のプレビューは `design/theme/` にあり、Claude Design のプロジェクト
「Kimono Coordinator Design System」と同期している。

段階 3 でこの内容を `src/main.css` の CSS 変数に落とす。shadcn/ui の生成物は
これらの変数を参照するため、ボタンやダイアログはテーマ経由で自動的に追従する
（生成物には手を入れない。`CLAUDE.md` の方針）。

## 色

桜をイメージした薄いピンクを基調とし、**すべての色を青み側に寄せる**。
oklch の色相を桜系（330〜350）と青みグレー系（290〜320）の帯に収め、
黄み（60〜110）は使わない。

パレットは UI の地の色であり、**アイテムの色（紅色・藍色など）は含まない**。
アイテムの色はユーザーデータで、シルエットの主役として映える必要があるため、
UI 側は彩度を抑えて競合させない。

### ライト（桜）

| トークン       | 和名       | 値                      |
| -------------- | ---------- | ----------------------- |
| background     | 薄桜       | `oklch(0.97 0.013 350)` |
| card / popover | 白桜       | `oklch(0.99 0.007 350)` |
| foreground     | 青墨       | `oklch(0.26 0.018 290)` |
| primary        | 梅紫       | `oklch(0.5 0.13 345)`   |
| primary-fg     | 薄桜の白   | `oklch(0.98 0.01 350)`  |
| secondary      | 桜鼠       | `oklch(0.93 0.02 345)`  |
| secondary-fg   | 濃い桜鼠   | `oklch(0.32 0.03 320)`  |
| muted          | 桜鼠（淡） | `oklch(0.94 0.016 345)` |
| muted-fg       | 灰桜（濃） | `oklch(0.52 0.025 320)` |
| accent         | 撫子色     | `oklch(0.9 0.05 350)`   |
| accent-fg      | 濃撫子     | `oklch(0.35 0.09 340)`  |
| destructive    | 紅色       | `oklch(0.55 0.21 12)`   |
| border / input | 灰桜       | `oklch(0.9 0.018 345)`  |
| ring           | 梅紫       | `oklch(0.5 0.13 345)`   |

### ダーク（夜桜）

夜桜のイメージで、青墨の下地に桜色を浮かせる。

| トークン       | 和名       | 値                           |
| -------------- | ---------- | ---------------------------- |
| background     | 夜の青墨   | `oklch(0.21 0.022 295)`      |
| card / popover | 青墨（明） | `oklch(0.26 0.024 295)`      |
| foreground     | 桜の白     | `oklch(0.95 0.012 350)`      |
| primary        | 夜桜       | `oklch(0.8 0.085 350)`       |
| primary-fg     | 濃梅紫     | `oklch(0.26 0.05 340)`       |
| secondary      | 紫鼠       | `oklch(0.31 0.03 320)`       |
| secondary-fg   | 淡桜       | `oklch(0.92 0.02 350)`       |
| muted          | 紫鼠（暗） | `oklch(0.3 0.028 310)`       |
| muted-fg       | 灰桜（明） | `oklch(0.72 0.025 330)`      |
| accent         | 暗撫子     | `oklch(0.36 0.05 335)`       |
| accent-fg      | 淡撫子     | `oklch(0.93 0.03 350)`       |
| destructive    | 紅色（明） | `oklch(0.66 0.19 12)`        |
| border         | —          | `oklch(0.95 0.02 350 / 15%)` |
| input          | —          | `oklch(0.95 0.02 350 / 18%)` |
| ring           | 夜桜       | `oklch(0.8 0.085 350)`       |

角丸（`--radius`）は現状の `0.625rem` を変えない。

## タイポグラフィ

| 用途                       | フォント        | ウェイト  |
| -------------------------- | --------------- | --------- |
| 見出し（`--font-heading`） | Kaisei Decol    | 400 / 700 |
| 本文・UI（`--font-sans`）  | Zen Maru Gothic | 400 / 700 |

装飾明朝の Kaisei Decol が「和」を締め、丸ゴシックの Zen Maru Gothic が
本文全体をやわらげる。かわいさは本文側が担うため、幼くなりすぎない。

段階 3 では `@fontsource/kaisei-decol` と `@fontsource/zen-maru-gothic` を
pnpm で導入し、`src/main.css` の `@import` に加える。現在の Figtree は
和文向けの設計ではないため置き換える。

### スケール

| 役割        | フォント        | サイズ | ウェイト | 用途例           |
| ----------- | --------------- | ------ | -------- | ---------------- |
| Display     | Kaisei Decol    | 32px   | 700      | アプリ名         |
| Title L     | Kaisei Decol    | 22px   | 700      | 画面タイトル     |
| Title M     | Kaisei Decol    | 18px   | 400      | セクション見出し |
| Body        | Zen Maru Gothic | 16px   | 400      | 本文（行間 1.9） |
| Body Strong | Zen Maru Gothic | 16px   | 700      | 強調             |
| UI Label    | Zen Maru Gothic | 14px   | 400      | ラベル・ボタン   |
| Caption     | Zen Maru Gothic | 12px   | 400      | 補足・状態表示   |

### 採らなかった案

見出しの候補を 4 案比較した上で Kaisei Decol を採った。

- **Zen Old Mincho**（上品和風） … 凛として美しいが、かわいさを出す方針から外れる
- **Kiwi Maru**（ふんわり） … レトロかわいいが「昭和レトロ」寄りで和装の落ち着きが薄れる。
  加えて Bold（700）が無く、見出しの太さを作れない（提供は Light 300 / Regular 400 / Medium 500）
- **Klee One**（手書き風） … 上品だが細く、見出しとしての存在感が足りない

## プレビューの作り方

Claude Design へ送る HTML は生成物で、**直接編集しない**。編集するのは
`design/templates/` の下で、次のコマンドで生成する。

```sh
uv run design/tools/build-previews.py
```

`design/` 以下の構成は次のとおり。

| パス                                    | 役割                                                 |
| --------------------------------------- | ---------------------------------------------------- |
| `templates/partials/`                   | 共通パーツ（テーマのトークン定義、シルエットの SVG） |
| `templates/theme/`                      | テーマ見本のテンプレート                             |
| `templates/components/`                 | アプリ固有コンポーネントのテンプレート               |
| `tools/`                                | ビルドスクリプト                                     |
| `theme/` `components/` `thumbnail.html` | 生成物。Claude Design と同期する                     |

ビルドがしていることは 2 つ。

- `<!-- @include foo.html -->` を `templates/partials/foo.html` の内容に置き換える
- フォントを**そのページに出てくるグリフだけへサブセット化し**、data URI で埋め込む。
  Claude Design のプレビューは外部へ通信できず、和文フォントは元が数 MB あるため、
  そのままでは埋め込めない

依存（fonttools）はスクリプト先頭の PEP 723 で宣言してあり、uv が解決するので
事前の準備は要らない。元の TTF は Google Fonts から取得して `design/tools/.fonts/`
にキャッシュする（gitignore 済み）。

いずれもプレビュー専用の措置であり、アプリ本体には関係しない
（本体は @fontsource で導入する）。
