# スワイプライブラリ移行計画

## メタ情報

| 項目           | 値                                       |
| -------------- | ---------------------------------------- |
| 作成日時       | 2026-01-24 12:12:48 UTC                  |
| ベースコミット | 27f5e82b27fc067c3aa654837d531b6c6cf72f0e |
| ステータス     | 検討中（未着手）                         |

---

## 1. 背景・目的

### 背景

現在、スワイプ機能は `src/hooks/useSwipe.ts` で自前実装されている（約215行）。
React エコシステムには成熟したスワイプライブラリが存在し、それらへの移行を検討する。

### 目的

- メンテナンス負担の軽減
- バグリスクの低減（成熟したライブラリの活用）
- 将来的な機能拡張への対応力向上

---

## 2. 現状分析

### 現在の useSwipe 実装の機能

| 機能             | 説明                                  |
| ---------------- | ------------------------------------- |
| スワイプ検出     | タッチ/マウスイベントのハンドリング   |
| `offsetX`        | リアルタイムでドラッグ位置を追跡      |
| `nextOffsetX`    | 隣接要素（次/前）の位置を計算         |
| `swipeDirection` | 現在のスワイプ方向（left/right/null） |
| `isSwiping`      | スワイプ中かどうか                    |
| `isAnimating`    | アニメーション中かどうか              |
| `isResetting`    | リセット中かどうか                    |
| キャンセル処理   | 閾値未満のスワイプ時のスムーズな戻り  |

### 使用箇所

- `src/components/KimonoView.tsx`
    - 着物用スワイプ
    - 帯用スワイプ
    - 帯締め用スワイプ

---

## 3. 候補ライブラリの比較

### 3.1 react-swipeable

- **GitHub**: https://github.com/FormidableLabs/react-swipeable
- **npm**: https://www.npmjs.com/package/react-swipeable
- **週間DL**: 約50万
- **メンテナンス**: FormidableLabs（信頼性高）

#### 主な機能

```typescript
const handlers = useSwipeable({
  onSwiped: (eventData) => console.log("Swiped!", eventData),
  onSwipedLeft: () => console.log("Swiped left"),
  onSwipedRight: () => console.log("Swiped right"),
  onSwiping: (eventData) => console.log("Swiping", eventData.deltaX),
  delta: 10,                    // スワイプ確定の最小距離
  trackTouch: true,             // タッチイベント追跡
  trackMouse: true,             // マウスイベント追跡
  preventScrollOnSwipe: false,  // スワイプ中のスクロール防止
});

return <div {...handlers}>Swipe here</div>;
```

#### 評価

| 項目                   | 評価 | 備考                           |
| ---------------------- | ---- | ------------------------------ |
| スワイプ検出           | ◎    | 堅牢な実装                     |
| リアルタイムオフセット | ○    | onSwiping で deltaX/Y 取得可能 |
| 隣接要素アニメーション | ✕    | 自前実装が必要                 |
| アニメーション状態管理 | ✕    | 自前実装が必要                 |

### 3.2 @use-gesture/react

- **GitHub**: https://github.com/pmndrs/use-gesture
- **npm**: https://www.npmjs.com/package/@use-gesture/react
- **週間DL**: 約40万
- **メンテナンス**: Poimandres（react-spring 開発元）

#### 主な機能

```typescript
const bind = useDrag(({ movement: [mx], down, direction: [xDir] }) => {
  // ドラッグ中: down === true
  // 移動量: mx
  // 方向: xDir (-1 = left, 1 = right)
});

return <div {...bind()}>Drag here</div>;
```

#### 評価

| 項目                   | 評価 | 備考                            |
| ---------------------- | ---- | ------------------------------- |
| スワイプ検出           | ◎    | より高度なジェスチャー対応      |
| リアルタイムオフセット | ◎    | movement で詳細に取得可能       |
| 隣接要素アニメーション | ✕    | 自前実装が必要                  |
| アニメーション状態管理 | △    | react-spring との連携で対応可能 |
| 学習コスト             | 中   | APIが多機能なため               |

---

## 4. 移行方針

### 推奨案: react-swipeable を採用

#### 理由

1. シンプルなAPI（学習コストが低い）
2. 現在の useSwipe と設計思想が近い
3. 依存関係が少ない（軽量）
4. 十分な実績とコミュニティサポート

### 移行範囲

react-swipeable は**スワイプ検出のみ**を担当し、以下は引き続き自前実装とする：

- `nextOffsetX` の計算ロジック
- アニメーション状態管理（`isAnimating`, `isResetting`）
- キャンセル時の戻りアニメーション

### 代替案: 現状維持

移行のメリットが限定的なため、以下の場合は現状維持を推奨：

- 現在の実装に大きな問題がない
- 追加の依存関係を避けたい
- スワイプ機能の拡張予定がない

---

## 5. 移行手順

### Phase 1: 準備

1. react-swipeable をインストール

    ```bash
    pnpm add react-swipeable
    ```

2. 既存テストの確認・拡充

### Phase 2: useSwipe のリファクタリング

1. `useSwipe.ts` を `useSwipeAnimation.ts` にリネーム
2. スワイプ検出部分を react-swipeable に置き換え
3. アニメーション状態管理は維持

```typescript
// リファクタリング後のイメージ
import { useSwipeable } from "react-swipeable";

export function useSwipeAnimation(options: UseSwipeAnimationOptions) {
    const [offsetX, setOffsetX] = useState(0);
    const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null);
    // ... アニメーション状態管理

    const swipeHandlers = useSwipeable({
        onSwiping: ({ deltaX }) => {
            setOffsetX(deltaX);
            setSwipeDirection(deltaX < 0 ? "left" : "right");
        },
        onSwipedLeft: () => {
            /* アニメーション開始 */
        },
        onSwipedRight: () => {
            /* アニメーション開始 */
        },
        onTouchEndOrOnMouseUp: () => {
            /* キャンセル処理 */
        },
        delta: threshold,
        trackMouse: true,
    });

    return {
        offsetX,
        nextOffsetX: calcNextOffsetX(),
        swipeDirection,
        // ...
        handlers: swipeHandlers,
    };
}
```

### Phase 3: 動作確認

1. KimonoView での動作確認
2. タッチデバイスでのテスト
3. マウス操作のテスト
4. エッジケースの確認

### Phase 4: クリーンアップ

1. 不要になったコードの削除
2. ドキュメント更新

---

## 6. リスクと対策

| リスク              | 影響度 | 対策                               |
| ------------------- | ------ | ---------------------------------- |
| ライブラリのAPI変更 | 中     | バージョン固定、変更履歴の監視     |
| 微妙な動作の違い    | 低     | 十分なテスト、段階的移行           |
| パフォーマンス劣化  | 低     | 移行前後のベンチマーク             |
| 依存関係の増加      | 低     | react-swipeable は軽量（依存なし） |

---

## 7. 工数見積

| 作業                      | 見積        |
| ------------------------- | ----------- |
| ライブラリ調査・選定      | 完了        |
| useSwipe リファクタリング | 2-3時間     |
| KimonoView の動作確認     | 1時間       |
| テスト・デバッグ          | 1-2時間     |
| **合計**                  | **4-6時間** |

---

## 8. 結論

移行は**任意**とする。以下の状況になった場合に移行を検討：

1. 現在の useSwipe にバグが発生した
2. 上下スワイプなど新しいジェスチャーが必要になった
3. より複雑なアニメーション連携が必要になった

現時点では現状維持でも問題ない。
