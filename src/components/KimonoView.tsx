import { KimonoSilhouette } from "#src/components/KimonoSilhouette";
import { ObijimeSilhouette } from "#src/components/ObijimeSilhouette";
import { ObiSilhouette } from "#src/components/ObiSilhouette";
import { useSwipe } from "#src/hooks/useSwipe";
import type { KimonoItem, ObiItem, ObijimeItem } from "#src/types/kimono";
import { useRef, useState } from "react";

/**
 * KimonoView コンポーネントのプロパティ
 */
interface KimonoViewProps {
  /** 表示する着物アイテムの配列 */
  kimonos: KimonoItem[];
  /** 表示する帯アイテムの配列 */
  obis: ObiItem[];
  /** 表示する帯締めアイテムの配列 */
  obijimes: ObijimeItem[];
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
 * 帯締めエリアの開始位置（コンテナ高さに対する比率）
 * SVG viewBox="0 0 200 300" で帯締めは y=120 から開始
 */
const OBIJIME_AREA_START = 120 / 300;

/**
 * 帯締めエリアの終了位置（コンテナ高さに対する比率）
 * SVG viewBox="0 0 200 300" で帯締めは y=130 で終了
 */
const OBIJIME_AREA_END = 130 / 300;

/**
 * 着物と帯と帯締めを重ねて表示し、スワイプで切り替えるコンポーネント
 * タッチ位置に応じて着物・帯・帯締めを操作対象として判定する
 * @param props - コンポーネントのプロパティ
 * @param props.kimonos - 表示する着物アイテムの配列
 * @param props.obis - 表示する帯アイテムの配列
 * @param props.obijimes - 表示する帯締めアイテムの配列
 * @returns 着物コーディネートビューの React 要素
 */
export function KimonoView({ kimonos, obis, obijimes }: KimonoViewProps) {
  const [kimonoIndex, setKimonoIndex] = useState(0);
  const [obiIndex, setObiIndex] = useState(0);
  const [obijimeIndex, setObijimeIndex] = useState(0);
  const [activeLayer, setActiveLayer] = useState<"kimono" | "obi" | "obijime">("kimono");
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

  const goToPrevObijime = () => {
    setObijimeIndex((prev) => (prev === 0 ? obijimes.length - 1 : prev - 1));
  };

  const goToNextObijime = () => {
    setObijimeIndex((prev) => (prev === obijimes.length - 1 ? 0 : prev + 1));
  };

  const containerWidth = 200;
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

  const {
    offsetX: obijimeOffsetX,
    nextOffsetX: obijimeNextOffsetX,
    swipeDirection: obijimeSwipeDirection,
    isSwiping: obijimeSwiping,
    isResetting: obijimeResetting,
    handlers: obijimeHandlers,
  } = useSwipe({
    threshold: containerWidth / 4,
    containerWidth,
    onSwipeLeft: goToNextObijime,
    onSwipeRight: goToPrevObijime,
  });

  // タッチ位置から操作対象を判定
  const determineActiveLayer = (clientY: number): "kimono" | "obi" | "obijime" => {
    if (!containerRef.current) {
      return "kimono";
    }
    const rect = containerRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const ratio = relativeY / containerHeight;
    // 帯締めエリア内なら帯締め、帯エリア内なら帯、それ以外は着物
    if (ratio >= OBIJIME_AREA_START && ratio <= OBIJIME_AREA_END) {
      return "obijime";
    }
    if (ratio >= OBI_AREA_START && ratio <= OBI_AREA_END) {
      return "obi";
    }
    return "kimono";
  };

  // タッチ/マウス開始時に操作対象を判定してからハンドラーを呼び出す
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) {
      return;
    }
    const layer = determineActiveLayer(touch.clientY);
    setActiveLayer(layer);
    if (layer === "kimono") {
      kimonoHandlers.onTouchStart(e);
    } else if (layer === "obi") {
      obiHandlers.onTouchStart(e);
    } else {
      obijimeHandlers.onTouchStart(e);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const layer = determineActiveLayer(e.clientY);
    setActiveLayer(layer);
    if (layer === "kimono") {
      kimonoHandlers.onMouseDown(e);
    } else if (layer === "obi") {
      obiHandlers.onMouseDown(e);
    } else {
      obijimeHandlers.onMouseDown(e);
    }
  };

  // Move/End/Leave は現在の activeLayer に応じて振り分け
  const getActiveHandlers = () => {
    if (activeLayer === "kimono") {
      return kimonoHandlers;
    }
    if (activeLayer === "obi") {
      return obiHandlers;
    }
    return obijimeHandlers;
  };
  const activeHandlers = getActiveHandlers();

  const currentKimono = kimonos[kimonoIndex];
  const currentObi = obis[obiIndex];
  const currentObijime = obijimes[obijimeIndex];

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

  // 次/前の帯締めインデックスを計算
  const nextObijimeIndex = obijimeIndex === obijimes.length - 1 ? 0 : obijimeIndex + 1;
  const prevObijimeIndex = obijimeIndex === 0 ? obijimes.length - 1 : obijimeIndex - 1;
  const adjacentObijimeIndex =
    obijimeSwipeDirection === "left" ? nextObijimeIndex : prevObijimeIndex;
  const adjacentObijime = obijimeSwipeDirection ? obijimes[adjacentObijimeIndex] : null;

  const kimonoStyle = {
    transform: activeLayer === "kimono" ? `translateX(${kimonoOffsetX}px)` : undefined,
    transition: kimonoSwiping || kimonoResetting ? "none" : "transform 0.3s ease-out",
  };

  const kimonoNextStyle = {
    transform: `translateX(${kimonoNextOffsetX}px)`,
    transition: kimonoSwiping || kimonoResetting ? "none" : "transform 0.3s ease-out",
  };

  const obiStyle = {
    transform: activeLayer === "obi" ? `translateX(${obiOffsetX}px)` : undefined,
    transition: obiSwiping || obiResetting ? "none" : "transform 0.3s ease-out",
  };

  const obiNextStyle = {
    transform: `translateX(${obiNextOffsetX}px)`,
    transition: obiSwiping || obiResetting ? "none" : "transform 0.3s ease-out",
  };

  const obijimeStyle = {
    transform: activeLayer === "obijime" ? `translateX(${obijimeOffsetX}px)` : undefined,
    transition: obijimeSwiping || obijimeResetting ? "none" : "transform 0.3s ease-out",
  };

  const obijimeNextStyle = {
    transform: `translateX(${obijimeNextOffsetX}px)`,
    transition: obijimeSwiping || obijimeResetting ? "none" : "transform 0.3s ease-out",
  };

  if (!currentKimono || !currentObi || !currentObijime) {
    return null;
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* 着物と帯の重ね表示 */}
      <div
        ref={containerRef}
        className="relative h-[400px] w-[200px] cursor-grab overflow-hidden select-none"
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
        {/* 帯締めレイヤー（現在） */}
        <div className="pointer-events-none absolute inset-0" style={obijimeStyle}>
          <ObijimeSilhouette color={currentObijime.color} className="h-full w-full" />
        </div>
        {/* 帯締めレイヤー（次/前）- スワイプ中のみ表示 */}
        {activeLayer === "obijime" && adjacentObijime && (
          <div className="pointer-events-none absolute inset-0" style={obijimeNextStyle}>
            <ObijimeSilhouette color={adjacentObijime.color} className="h-full w-full" />
          </div>
        )}
      </div>

      {/* 現在の選択情報 */}
      <div className="text-center">
        <p className="text-lg">
          <span className="font-medium">着物:</span> {currentKimono.name}
          <span className="mx-2">|</span>
          <span className="font-medium">帯:</span> {currentObi.name}
          <span className="mx-2">|</span>
          <span className="font-medium">帯締め:</span> {currentObijime.name}
        </p>
        <p className="mt-1 text-sm text-gray-500">← スワイプで切り替え →</p>
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
        <div className="flex items-center gap-2">
          <span className="w-12 text-xs text-gray-600">帯締め:</span>
          <div className="flex gap-1">
            {obijimes.map((obijime, index) => (
              <button
                key={obijime.id}
                type="button"
                className={`h-3 w-3 rounded-full border transition-colors ${
                  index === obijimeIndex
                    ? "border-gray-800 bg-gray-800"
                    : "border-gray-400 bg-white"
                }`}
                style={{ backgroundColor: index === obijimeIndex ? obijime.color : undefined }}
                onClick={() => setObijimeIndex(index)}
                aria-label={`${obijime.name}を選択`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
