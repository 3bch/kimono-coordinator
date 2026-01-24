import { useCallback, useRef, useState, useEffect } from "react";

/**
 * スワイプ方向を表す型
 * - "left": 左方向へのスワイプ
 * - "right": 右方向へのスワイプ
 * - null: スワイプなし
 */
type SwipeDirection = "left" | "right" | null;

/**
 * useSwipe フックのオプション
 */
interface UseSwipeOptions {
  /** スワイプを確定するための閾値（ピクセル単位、デフォルト: 50） */
  threshold?: number;
  /** コンテナの幅（アニメーション計算用、デフォルト: 280） */
  containerWidth?: number;
  /** 左スワイプ完了時のコールバック */
  onSwipeLeft?: () => void;
  /** 右スワイプ完了時のコールバック */
  onSwipeRight?: () => void;
}

/**
 * useSwipe フックの戻り値
 */
interface UseSwipeReturn {
  /** 現在の要素の X 軸オフセット（ピクセル） */
  offsetX: number;
  /** 次/前の要素の X 軸オフセット（ピクセル） */
  nextOffsetX: number;
  /** 現在のスワイプ方向 */
  swipeDirection: SwipeDirection;
  /** スワイプ中かどうか */
  isSwiping: boolean;
  /** アニメーション中かどうか */
  isAnimating: boolean;
  /** リセット中かどうか */
  isResetting: boolean;
  /** イベントハンドラー */
  handlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
  };
}

/**
 * スワイプ操作を管理するカスタムフック
 * タッチデバイスとマウス操作の両方に対応し、リング状のスワイプアニメーションを実現する
 * @param options - スワイプの設定オプション
 * @returns スワイプの状態とイベントハンドラー
 */
export function useSwipe(options: UseSwipeOptions = {}): UseSwipeReturn {
  const { threshold = 50, containerWidth = 280, onSwipeLeft, onSwipeRight } = options;

  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  const startX = useRef(0);
  const isDragging = useRef(false);

  // アニメーション完了後にコールバックを呼び出す
  useEffect(() => {
    if (!isAnimating || !pendingCallback) {
      return;
    }
    const timer = setTimeout(() => {
      pendingCallback();
      setIsResetting(true); // transitionを無効化
      setOffsetX(0);
      setSwipeDirection(null);
      setIsAnimating(false);
      setPendingCallback(null);
    }, 300); // CSSのtransition時間と同じ
    return () => clearTimeout(timer);
  }, [isAnimating, pendingCallback]);

  // リセット完了後にフラグを下ろす
  useEffect(() => {
    if (!isResetting) {
      return;
    }
    // 次のフレームでリセットフラグを下ろす
    const frame = requestAnimationFrame(() => {
      setIsResetting(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [isResetting]);

  const handleStart = useCallback((clientX: number) => {
    startX.current = clientX;
    isDragging.current = true;
    setIsSwiping(true);
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!isDragging.current) {
      return;
    }
    const diff = clientX - startX.current;
    setOffsetX(diff);
    // スワイプ方向を更新（左にドラッグ = 左スワイプ = 次へ、右にドラッグ = 右スワイプ = 前へ）
    if (diff < 0) {
      setSwipeDirection("left");
    } else if (diff > 0) {
      setSwipeDirection("right");
    }
  }, []);

  const handleEnd = useCallback(() => {
    if (!isDragging.current) {
      return;
    }

    isDragging.current = false;
    setIsSwiping(false);

    // スワイプが確定した場合、アニメーションを開始
    if (offsetX > threshold && onSwipeRight) {
      setIsAnimating(true);
      setOffsetX(containerWidth); // 現在の要素を右に出す
      setPendingCallback(() => onSwipeRight);
    } else if (offsetX < -threshold && onSwipeLeft) {
      setIsAnimating(true);
      setOffsetX(-containerWidth); // 現在の要素を左に出す
      setPendingCallback(() => onSwipeLeft);
    } else {
      // スワイプがキャンセルされた場合、元に戻す
      setOffsetX(0);
      setSwipeDirection(null);
    }
  }, [offsetX, threshold, containerWidth, onSwipeLeft, onSwipeRight]);

  const handlers = {
    onTouchStart: (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        handleStart(touch.clientX);
      }
    },
    onTouchMove: (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        handleMove(touch.clientX);
      }
    },
    onTouchEnd: () => {
      handleEnd();
    },
    onMouseDown: (e: React.MouseEvent) => {
      handleStart(e.clientX);
    },
    onMouseMove: (e: React.MouseEvent) => {
      handleMove(e.clientX);
    },
    onMouseUp: () => {
      handleEnd();
    },
    onMouseLeave: () => {
      if (isDragging.current) {
        handleEnd();
      }
    },
  };

  // 次の要素のオフセットを計算
  // 左スワイプ時: 次の要素は右端から入ってくる (containerWidth + offsetX)
  // 右スワイプ時: 前の要素は左端から入ってくる (-containerWidth + offsetX)
  const calcNextOffsetX = (): number => {
    if (swipeDirection === "left") {
      return containerWidth + offsetX;
    }
    if (swipeDirection === "right") {
      return -containerWidth + offsetX;
    }
    return 0;
  };

  return {
    offsetX,
    nextOffsetX: calcNextOffsetX(),
    swipeDirection,
    isSwiping,
    isAnimating,
    isResetting,
    handlers,
  };
}
