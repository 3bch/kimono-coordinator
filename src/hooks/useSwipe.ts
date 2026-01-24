import { useCallback, useRef, useState } from "react";

type SwipeDirection = "left" | "right" | null;

interface UseSwipeOptions {
  threshold?: number;
  containerWidth?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

interface UseSwipeReturn {
  offsetX: number;
  nextOffsetX: number;
  swipeDirection: SwipeDirection;
  isSwiping: boolean;
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

export function useSwipe(options: UseSwipeOptions = {}): UseSwipeReturn {
  const { threshold = 50, containerWidth = 280, onSwipeLeft, onSwipeRight } = options;

  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection>(null);

  const startX = useRef(0);
  const isDragging = useRef(false);

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

    let direction: SwipeDirection = null;
    if (offsetX > threshold) {
      direction = "right";
      onSwipeRight?.();
    } else if (offsetX < -threshold) {
      direction = "left";
      onSwipeLeft?.();
    }

    setOffsetX(0);
    setSwipeDirection(null);
    return direction;
  }, [offsetX, threshold, onSwipeLeft, onSwipeRight]);

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

  return { offsetX, nextOffsetX: calcNextOffsetX(), swipeDirection, isSwiping, handlers };
}
