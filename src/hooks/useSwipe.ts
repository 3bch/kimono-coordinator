import { useCallback, useRef, useState } from "react";

type SwipeDirection = "left" | "right" | null;

interface UseSwipeOptions {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

interface UseSwipeReturn {
  offsetX: number;
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
  const { threshold = 50, onSwipeLeft, onSwipeRight } = options;

  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

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

  return { offsetX, isSwiping, handlers };
}
