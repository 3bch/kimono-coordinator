import { KimonoSilhouette } from "#src/components/KimonoSilhouette";
import { ObiSilhouette } from "#src/components/ObiSilhouette";
import { useSwipe } from "#src/hooks/useSwipe";
import type { KimonoItem, ObiItem } from "#src/types/kimono";
import { useMemo, useState } from "react";

interface KimonoViewProps {
  kimonos: KimonoItem[];
  obis: ObiItem[];
}

export function KimonoView({ kimonos, obis }: KimonoViewProps) {
  const [kimonoIndex, setKimonoIndex] = useState(0);
  const [obiIndex, setObiIndex] = useState(0);
  const [activeLayer, setActiveLayer] = useState<"kimono" | "obi">("kimono");

  const goToPrevKimono = () => {
    setKimonoIndex((prev) => (prev === 0 ? kimonos.length - 1 : prev - 1));
  };

  const goToNextKimono = () => {
    setKimonoIndex((prev) => (prev === kimonos.length - 1 ? 0 : prev + 1));
  };

  const goToPrevObi = () => {
    setObiIndex((prev) => (prev === 0 ? obis.length - 1 : prev - 1));
  };

  const goToNextObi = () => {
    setObiIndex((prev) => (prev === obis.length - 1 ? 0 : prev + 1));
  };

  const {
    offsetX: kimonoOffsetX,
    isSwiping: kimonoSwiping,
    handlers: kimonoHandlers,
  } = useSwipe({
    threshold: 50,
    onSwipeLeft: goToNextKimono,
    onSwipeRight: goToPrevKimono,
  });

  const {
    offsetX: obiOffsetX,
    isSwiping: obiSwiping,
    handlers: obiHandlers,
  } = useSwipe({
    threshold: 50,
    onSwipeLeft: goToNextObi,
    onSwipeRight: goToPrevObi,
  });

  const currentKimono = kimonos[kimonoIndex];
  const currentObi = obis[obiIndex];

  const kimonoStyle = useMemo(
    () => ({
      transform: activeLayer === "kimono" ? `translateX(${kimonoOffsetX}px)` : undefined,
      transition: kimonoSwiping ? "none" : "transform 0.3s ease-out",
    }),
    [activeLayer, kimonoOffsetX, kimonoSwiping],
  );

  const obiStyle = useMemo(
    () => ({
      transform: activeLayer === "obi" ? `translateX(${obiOffsetX}px)` : undefined,
      transition: obiSwiping ? "none" : "transform 0.3s ease-out",
    }),
    [activeLayer, obiOffsetX, obiSwiping],
  );

  if (!currentKimono || !currentObi) {
    return null;
  }

  const activeHandlers = activeLayer === "kimono" ? kimonoHandlers : obiHandlers;

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* レイヤー切り替えボタン */}
      <div className="flex gap-2">
        <button
          type="button"
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeLayer === "kimono" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveLayer("kimono")}
        >
          着物を選ぶ
        </button>
        <button
          type="button"
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeLayer === "obi" ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setActiveLayer("obi")}
        >
          帯を選ぶ
        </button>
      </div>

      {/* 着物と帯の重ね表示 */}
      <div className="relative h-[400px] w-[280px] cursor-grab select-none" {...activeHandlers}>
        {/* 着物レイヤー */}
        <div className="absolute inset-0" style={kimonoStyle}>
          <KimonoSilhouette color={currentKimono.color} className="h-full w-full" />
        </div>
        {/* 帯レイヤー（着物の上に重ねる） */}
        <div className="pointer-events-none absolute inset-0" style={obiStyle}>
          <ObiSilhouette color={currentObi.color} className="h-full w-full" />
        </div>
      </div>

      {/* 現在の選択情報 */}
      <div className="text-center">
        <p className="text-lg">
          <span className="font-medium">着物:</span> {currentKimono.name}
          <span className="mx-2">|</span>
          <span className="font-medium">帯:</span> {currentObi.name}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          {activeLayer === "kimono" ? "← 着物をスワイプで切り替え →" : "← 帯をスワイプで切り替え →"}
        </p>
      </div>

      {/* インジケーター */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-12 text-xs text-gray-600">着物:</span>
          <div className="flex gap-1">
            {kimonos.map((kimono, index) => (
              <button
                key={kimono.id}
                type="button"
                className={`h-3 w-3 rounded-full border transition-colors ${
                  index === kimonoIndex ? "border-gray-800 bg-gray-800" : "border-gray-400 bg-white"
                }`}
                style={{ backgroundColor: index === kimonoIndex ? kimono.color : undefined }}
                onClick={() => setKimonoIndex(index)}
                aria-label={`${kimono.name}を選択`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-12 text-xs text-gray-600">帯:</span>
          <div className="flex gap-1">
            {obis.map((obi, index) => (
              <button
                key={obi.id}
                type="button"
                className={`h-3 w-3 rounded-full border transition-colors ${
                  index === obiIndex ? "border-gray-800 bg-gray-800" : "border-gray-400 bg-white"
                }`}
                style={{ backgroundColor: index === obiIndex ? obi.color : undefined }}
                onClick={() => setObiIndex(index)}
                aria-label={`${obi.name}を選択`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
