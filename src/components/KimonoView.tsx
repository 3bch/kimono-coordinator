import { KimonoSilhouette } from "#src/components/KimonoSilhouette";
import { ObiSilhouette } from "#src/components/ObiSilhouette";
import { useSwipe } from "#src/hooks/useSwipe";
import type { KimonoItem, ObiItem } from "#src/types/kimono";
import { useCallback, useMemo, useRef, useState } from "react";

/**
 * KimonoView コンポーネントのプロパティ
 */
interface KimonoViewProps {
  /** 表示する着物アイテムの配列 */
  kimonos: KimonoItem[];
  /** 表示する帯アイテムの配列 */
  obis: ObiItem[];
}

/**
 * 帯エリアの開始位置（コンテナ高さに対する比率）
 * SVG viewBox="0 0 200 300" で帯は y=90 から開始
 */
const OBI_AREA_START = 90 / 300;

/**
 * 帯エリアの終了位置（コンテナ高さに対する比率）
 * SVG viewBox="0 0 200 300" で帯は y=160 で終了
 */
const OBI_AREA_END = 160 / 300;

/**
 * 着物と帯を重ねて表示し、スワイプで切り替えるコンポーネント
 * タッチ位置に応じて着物または帯を操作対象として判定する
 * @param props - コンポーネントのプロパティ
 * @param props.kimonos - 表示する着物アイテムの配列
 * @param props.obis - 表示する帯アイテムの配列
 * @returns 着物コーディネートビューの React 要素
 */
export function KimonoView({ kimonos, obis }: KimonoViewProps) {
  const [kimonoIndex, setKimonoIndex] = useState(0);
  const [obiIndex, setObiIndex] = useState(0);
  const [activeLayer, setActiveLayer] = useState<"kimono" | "obi">("kimono");
  const containerRef = useRef<HTMLDivElement>(null);

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

  const containerWidth = 280;
  const containerHeight = 400;

  const {
    offsetX: kimonoOffsetX,
    nextOffsetX: kimonoNextOffsetX,
    swipeDirection: kimonoSwipeDirection,
    isSwiping: kimonoSwiping,
    isResetting: kimonoResetting,
    handlers: kimonoHandlers,
  } = useSwipe({
    threshold: containerWidth / 4,
    containerWidth,
    onSwipeLeft: goToNextKimono,
    onSwipeRight: goToPrevKimono,
  });

  const {
    offsetX: obiOffsetX,
    nextOffsetX: obiNextOffsetX,
    swipeDirection: obiSwipeDirection,
    isSwiping: obiSwiping,
    isResetting: obiResetting,
    handlers: obiHandlers,
  } = useSwipe({
    threshold: containerWidth / 4,
    containerWidth,
    onSwipeLeft: goToNextObi,
    onSwipeRight: goToPrevObi,
  });

  // タッチ位置から操作対象を判定
  const determineActiveLayer = useCallback(
    (clientY: number): "kimono" | "obi" => {
      if (!containerRef.current) {
        return "kimono";
      }
      const rect = containerRef.current.getBoundingClientRect();
      const relativeY = clientY - rect.top;
      const ratio = relativeY / containerHeight;
      // 帯エリア内なら帯、それ以外は着物
      if (ratio >= OBI_AREA_START && ratio <= OBI_AREA_END) {
        return "obi";
      }
      return "kimono";
    },
    [containerHeight],
  );

  // タッチ/マウス開始時に操作対象を判定してからハンドラーを呼び出す
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) {
        return;
      }
      const layer = determineActiveLayer(touch.clientY);
      setActiveLayer(layer);
      if (layer === "kimono") {
        kimonoHandlers.onTouchStart(e);
      } else {
        obiHandlers.onTouchStart(e);
      }
    },
    [determineActiveLayer, kimonoHandlers, obiHandlers],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const layer = determineActiveLayer(e.clientY);
      setActiveLayer(layer);
      if (layer === "kimono") {
        kimonoHandlers.onMouseDown(e);
      } else {
        obiHandlers.onMouseDown(e);
      }
    },
    [determineActiveLayer, kimonoHandlers, obiHandlers],
  );

  // Move/End/Leave は現在の activeLayer に応じて振り分け
  const activeHandlers = activeLayer === "kimono" ? kimonoHandlers : obiHandlers;

  const currentKimono = kimonos[kimonoIndex];
  const currentObi = obis[obiIndex];

  // 次/前の着物インデックスを計算
  const nextKimonoIndex = kimonoIndex === kimonos.length - 1 ? 0 : kimonoIndex + 1;
  const prevKimonoIndex = kimonoIndex === 0 ? kimonos.length - 1 : kimonoIndex - 1;
  const adjacentKimonoIndex = kimonoSwipeDirection === "left" ? nextKimonoIndex : prevKimonoIndex;
  const adjacentKimono = kimonoSwipeDirection ? kimonos[adjacentKimonoIndex] : null;

  // 次/前の帯インデックスを計算
  const nextObiIndex = obiIndex === obis.length - 1 ? 0 : obiIndex + 1;
  const prevObiIndex = obiIndex === 0 ? obis.length - 1 : obiIndex - 1;
  const adjacentObiIndex = obiSwipeDirection === "left" ? nextObiIndex : prevObiIndex;
  const adjacentObi = obiSwipeDirection ? obis[adjacentObiIndex] : null;

  const kimonoStyle = useMemo(
    () => ({
      transform: activeLayer === "kimono" ? `translateX(${kimonoOffsetX}px)` : undefined,
      transition: kimonoSwiping || kimonoResetting ? "none" : "transform 0.3s ease-out",
    }),
    [activeLayer, kimonoOffsetX, kimonoSwiping, kimonoResetting],
  );

  const kimonoNextStyle = useMemo(
    () => ({
      transform: `translateX(${kimonoNextOffsetX}px)`,
      transition: kimonoSwiping || kimonoResetting ? "none" : "transform 0.3s ease-out",
    }),
    [kimonoNextOffsetX, kimonoSwiping, kimonoResetting],
  );

  const obiStyle = useMemo(
    () => ({
      transform: activeLayer === "obi" ? `translateX(${obiOffsetX}px)` : undefined,
      transition: obiSwiping || obiResetting ? "none" : "transform 0.3s ease-out",
    }),
    [activeLayer, obiOffsetX, obiSwiping, obiResetting],
  );

  const obiNextStyle = useMemo(
    () => ({
      transform: `translateX(${obiNextOffsetX}px)`,
      transition: obiSwiping || obiResetting ? "none" : "transform 0.3s ease-out",
    }),
    [obiNextOffsetX, obiSwiping, obiResetting],
  );

  if (!currentKimono || !currentObi) {
    return null;
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* 着物と帯の重ね表示 */}
      <div
        ref={containerRef}
        className="relative h-[400px] w-[280px] cursor-grab overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={activeHandlers.onTouchMove}
        onTouchEnd={activeHandlers.onTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={activeHandlers.onMouseMove}
        onMouseUp={activeHandlers.onMouseUp}
        onMouseLeave={activeHandlers.onMouseLeave}
      >
        {/* 着物レイヤー（現在） */}
        <div className="absolute inset-0" style={kimonoStyle}>
          <KimonoSilhouette color={currentKimono.color} className="h-full w-full" />
        </div>
        {/* 着物レイヤー（次/前）- スワイプ中のみ表示 */}
        {activeLayer === "kimono" && adjacentKimono && (
          <div className="absolute inset-0" style={kimonoNextStyle}>
            <KimonoSilhouette color={adjacentKimono.color} className="h-full w-full" />
          </div>
        )}
        {/* 帯レイヤー（現在） */}
        <div className="pointer-events-none absolute inset-0" style={obiStyle}>
          <ObiSilhouette color={currentObi.color} className="h-full w-full" />
        </div>
        {/* 帯レイヤー（次/前）- スワイプ中のみ表示 */}
        {activeLayer === "obi" && adjacentObi && (
          <div className="pointer-events-none absolute inset-0" style={obiNextStyle}>
            <ObiSilhouette color={adjacentObi.color} className="h-full w-full" />
          </div>
        )}
      </div>

      {/* 現在の選択情報 */}
      <div className="text-center">
        <p className="text-lg">
          <span className="font-medium">着物:</span> {currentKimono.name}
          <span className="mx-2">|</span>
          <span className="font-medium">帯:</span> {currentObi.name}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          ← スワイプで切り替え（帯部分をタッチで帯を変更）→
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
