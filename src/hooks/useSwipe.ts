import { useRef, useState, useEffect } from "react";

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
  const [isCancelling, setIsCancelling] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  const startX = useRef(0);
  const isDragging = useRef(false);
  // handleEnd は window リスナーなど古いクロージャから呼ばれるため、最新値を ref でも保持する
  const offsetXRef = useRef(0);
  const swipeDirectionRef = useRef<SwipeDirection>(null);

  // アニメーション完了後にコールバックを呼び出す
  useEffect(() => {
    if (!isAnimating || !pendingCallback) {
      return undefined;
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
      return undefined;
    }
    // 次のフレームでリセットフラグを下ろす
    const frame = requestAnimationFrame(() => {
      setIsResetting(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [isResetting]);

  // キャンセルアニメーション完了後に swipeDirection をリセット
  useEffect(() => {
    if (!isCancelling) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setSwipeDirection(null);
      setIsCancelling(false);
    }, 300); // CSSのtransition時間と同じ
    return () => clearTimeout(timer);
  }, [isCancelling]);

  const handleStart = (clientX: number) => {
    startX.current = clientX;
    isDragging.current = true;
    offsetXRef.current = 0;
    setIsSwiping(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging.current) {
      return;
    }
    const diff = clientX - startX.current;
    offsetXRef.current = diff;
    setOffsetX(diff);
    // スワイプ方向を更新（左にドラッグ = 左スワイプ = 次へ、右にドラッグ = 右スワイプ = 前へ）
    if (diff < 0) {
      swipeDirectionRef.current = "left";
      setSwipeDirection("left");
    } else if (diff > 0) {
      swipeDirectionRef.current = "right";
      setSwipeDirection("right");
    }
  };

  const handleEnd = () => {
    if (!isDragging.current) {
      return;
    }

    isDragging.current = false;
    setIsSwiping(false);

    // スワイプが確定した場合、アニメーションを開始
    const endOffsetX = offsetXRef.current;
    if (endOffsetX > threshold && onSwipeRight) {
      setIsAnimating(true);
      setOffsetX(containerWidth); // 現在の要素を右に出す
      setPendingCallback(() => onSwipeRight);
    } else if (endOffsetX < -threshold && onSwipeLeft) {
      setIsAnimating(true);
      setOffsetX(-containerWidth); // 現在の要素を左に出す
      setPendingCallback(() => onSwipeLeft);
    } else {
      // スワイプがキャンセルされた場合、元に戻す
      setOffsetX(0);
      // swipeDirection はアニメーション完了後にリセット（隣の要素が瞬間的に消えるのを防ぐ）
      if (swipeDirectionRef.current) {
        setIsCancelling(true);
      }
    }
    swipeDirectionRef.current = null;
  };

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
    // マウス操作は要素外に出てもスワイプを継続できるよう、
    // mousedown 以降は window でマウスを追跡し mouseup で確定する
    onMouseDown: (e: React.MouseEvent) => {
      handleStart(e.clientX);
      const onWindowMouseMove = (event: MouseEvent) => {
        handleMove(event.clientX);
      };
      const onWindowMouseUp = () => {
        window.removeEventListener("mousemove", onWindowMouseMove);
        window.removeEventListener("mouseup", onWindowMouseUp);
        handleEnd();
      };
      window.addEventListener("mousemove", onWindowMouseMove);
      window.addEventListener("mouseup", onWindowMouseUp);
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
