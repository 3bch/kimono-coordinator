import { useSwipe } from "#src/hooks/useSwipe";
import { useMemo, useState } from "react";

interface ItemIndicatorProps {
  isActive: boolean;
  onClick: () => void;
  label: string;
}

function ItemIndicator({ isActive, onClick, label }: ItemIndicatorProps) {
  return (
    <button
      type="button"
      className={`h-2 w-2 rounded-full transition-colors ${
        isActive ? "bg-gray-800" : "bg-gray-300"
      }`}
      onClick={onClick}
      aria-label={label}
    />
  );
}

interface SwipeableItemProps<T extends { id: string; name: string; color: string }> {
  items: T[];
  label: string;
  height?: string;
}

export function SwipeableItem<T extends { id: string; name: string; color: string }>({
  items,
  label,
  height = "200px",
}: SwipeableItemProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  const { offsetX, isSwiping, handlers } = useSwipe({
    threshold: 50,
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrev,
  });

  const currentItem = items[currentIndex];

  const containerStyle = useMemo(() => ({ height }), [height]);

  const itemStyle = useMemo(
    () => ({
      backgroundColor: currentItem?.color ?? "transparent",
      transform: `translateX(${offsetX}px)`,
      transition: isSwiping ? "none" : "transform 0.3s ease-out",
      cursor: "grab" as const,
    }),
    [currentItem?.color, offsetX, isSwiping],
  );

  if (!currentItem) {
    return null;
  }

  return (
    <div className="w-full select-none">
      <div className="mb-2 text-center text-lg font-medium">{label}</div>
      <div className="relative overflow-hidden rounded-lg" style={containerStyle} {...handlers}>
        <div className="flex h-full w-full items-center justify-center" style={itemStyle}>
          <span className="text-2xl font-bold text-white drop-shadow-lg">{currentItem.name}</span>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-center gap-2">
        {items.map((item, index) => (
          <ItemIndicator
            key={item.id}
            isActive={index === currentIndex}
            onClick={() => setCurrentIndex(index)}
            label={`${item.name}を選択`}
          />
        ))}
      </div>
    </div>
  );
}
