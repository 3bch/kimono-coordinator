import { useRef, useState } from "react";

import { HaneriSilhouette } from "#src/components/HaneriSilhouette";
import { KimonoSilhouette } from "#src/components/KimonoSilhouette";
import { ObiageSilhouette } from "#src/components/ObiageSilhouette";
import { ObijimeSilhouette } from "#src/components/ObijimeSilhouette";
import { ObiSilhouette } from "#src/components/ObiSilhouette";
import { useSwipe } from "#src/hooks/useSwipe";
import type { HaneriItem, KimonoItem, ObiageItem, ObiItem, ObijimeItem } from "#src/types/kimono";

/**
 * KimonoView コンポーネントのプロパティ
 */
interface KimonoViewProps {
  /** 表示する着物アイテムの配列 */
  kimonos: KimonoItem[];
  /** 表示する半襟アイテムの配列 */
  haneris: HaneriItem[];
  /** 表示する帯アイテムの配列 */
  obis: ObiItem[];
  /** 表示する帯揚げアイテムの配列 */
  obiages: ObiageItem[];
  /** 表示する帯締めアイテムの配列 */
  obijimes: ObijimeItem[];
}

/**
 * 半襟エリアの開始位置（コンテナ高さに対する比率）
 * 着物の viewBox="0 0 1000 2000" で半襟は首元の開口部 y=20 付近から始まる
 */
const HANERI_AREA_START = 20 / 2000;

/**
 * 半襟エリアの終了位置（コンテナ高さに対する比率）
 * 着物の viewBox="0 0 1000 2000" で半襟は開口部の頂点 y=220 付近で終わる
 */
const HANERI_AREA_END = 220 / 2000;

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
 * 帯揚げエリアの開始位置（コンテナ高さに対する比率）
 * SVG viewBox="0 0 200 300" で帯揚げは y=80 から開始
 */
const OBIAGE_AREA_START = 80 / 300;

/**
 * 帯揚げエリアの終了位置（コンテナ高さに対する比率）
 * SVG viewBox="0 0 200 300" で帯揚げは y=90 で終了（帯の開始位置）
 */
const OBIAGE_AREA_END = 90 / 300;

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
 * 着物と半襟と帯と帯揚げと帯締めを重ねて表示し、スワイプで切り替えるコンポーネント
 * タッチ位置に応じて着物・半襟・帯・帯揚げ・帯締めを操作対象として判定する
 * @param props - コンポーネントのプロパティ
 * @param props.kimonos - 表示する着物アイテムの配列
 * @param props.haneris - 表示する半襟アイテムの配列
 * @param props.obis - 表示する帯アイテムの配列
 * @param props.obiages - 表示する帯揚げアイテムの配列
 * @param props.obijimes - 表示する帯締めアイテムの配列
 * @returns 着物コーディネートビューの React 要素
 */
export function KimonoView({ kimonos, haneris, obis, obiages, obijimes }: KimonoViewProps) {
  const [kimonoIndex, setKimonoIndex] = useState(0);
  const [haneriIndex, setHaneriIndex] = useState(0);
  const [obiIndex, setObiIndex] = useState(0);
  const [obiageIndex, setObiageIndex] = useState(0);
  const [obijimeIndex, setObijimeIndex] = useState(0);
  const [activeLayer, setActiveLayer] = useState<
    "kimono" | "haneri" | "obi" | "obiage" | "obijime"
  >("kimono");
  const containerRef = useRef<HTMLDivElement>(null);

  const goToPrevKimono = () => {
    setKimonoIndex((prev) => (prev === 0 ? kimonos.length - 1 : prev - 1));
  };

  const goToNextKimono = () => {
    setKimonoIndex((prev) => (prev === kimonos.length - 1 ? 0 : prev + 1));
  };

  const goToPrevHaneri = () => {
    setHaneriIndex((prev) => (prev === 0 ? haneris.length - 1 : prev - 1));
  };

  const goToNextHaneri = () => {
    setHaneriIndex((prev) => (prev === haneris.length - 1 ? 0 : prev + 1));
  };

  const goToPrevObi = () => {
    setObiIndex((prev) => (prev === 0 ? obis.length - 1 : prev - 1));
  };

  const goToNextObi = () => {
    setObiIndex((prev) => (prev === obis.length - 1 ? 0 : prev + 1));
  };

  const goToPrevObiage = () => {
    setObiageIndex((prev) => (prev === 0 ? obiages.length - 1 : prev - 1));
  };

  const goToNextObiage = () => {
    setObiageIndex((prev) => (prev === obiages.length - 1 ? 0 : prev + 1));
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
    offsetX: haneriOffsetX,
    nextOffsetX: haneriNextOffsetX,
    swipeDirection: haneriSwipeDirection,
    isSwiping: haneriSwiping,
    isResetting: haneriResetting,
    handlers: haneriHandlers,
  } = useSwipe({
    threshold: containerWidth / 4,
    containerWidth,
    onSwipeLeft: goToNextHaneri,
    onSwipeRight: goToPrevHaneri,
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
    offsetX: obiageOffsetX,
    nextOffsetX: obiageNextOffsetX,
    swipeDirection: obiageSwipeDirection,
    isSwiping: obiageSwiping,
    isResetting: obiageResetting,
    handlers: obiageHandlers,
  } = useSwipe({
    threshold: containerWidth / 4,
    containerWidth,
    onSwipeLeft: goToNextObiage,
    onSwipeRight: goToPrevObiage,
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
  const determineActiveLayer = (
    clientY: number,
  ): "kimono" | "haneri" | "obi" | "obiage" | "obijime" => {
    if (!containerRef.current) {
      return "kimono";
    }
    const rect = containerRef.current.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    const ratio = relativeY / containerHeight;
    // 半襟エリア内なら半襟、帯締めエリア内なら帯締め、帯揚げエリア内なら帯揚げ、帯エリア内なら帯、それ以外は着物
    if (ratio >= HANERI_AREA_START && ratio <= HANERI_AREA_END) {
      return "haneri";
    }
    if (ratio >= OBIJIME_AREA_START && ratio <= OBIJIME_AREA_END) {
      return "obijime";
    }
    if (ratio >= OBIAGE_AREA_START && ratio < OBIAGE_AREA_END) {
      return "obiage";
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
    } else if (layer === "haneri") {
      haneriHandlers.onTouchStart(e);
    } else if (layer === "obi") {
      obiHandlers.onTouchStart(e);
    } else if (layer === "obiage") {
      obiageHandlers.onTouchStart(e);
    } else {
      obijimeHandlers.onTouchStart(e);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const layer = determineActiveLayer(e.clientY);
    setActiveLayer(layer);
    if (layer === "kimono") {
      kimonoHandlers.onMouseDown(e);
    } else if (layer === "haneri") {
      haneriHandlers.onMouseDown(e);
    } else if (layer === "obi") {
      obiHandlers.onMouseDown(e);
    } else if (layer === "obiage") {
      obiageHandlers.onMouseDown(e);
    } else {
      obijimeHandlers.onMouseDown(e);
    }
  };

  // Move/End/Leave は現在の activeLayer に応じて振り分け
  const getActiveHandlers = () => {
    if (activeLayer === "kimono") {
      return kimonoHandlers;
    }
    if (activeLayer === "haneri") {
      return haneriHandlers;
    }
    if (activeLayer === "obi") {
      return obiHandlers;
    }
    if (activeLayer === "obiage") {
      return obiageHandlers;
    }
    return obijimeHandlers;
  };
  const activeHandlers = getActiveHandlers();

  const currentKimono = kimonos[kimonoIndex];
  const currentHaneri = haneris[haneriIndex];
  const currentObi = obis[obiIndex];
  const currentObiage = obiages[obiageIndex];
  const currentObijime = obijimes[obijimeIndex];

  // 次/前の着物インデックスを計算
  const nextKimonoIndex = kimonoIndex === kimonos.length - 1 ? 0 : kimonoIndex + 1;
  const prevKimonoIndex = kimonoIndex === 0 ? kimonos.length - 1 : kimonoIndex - 1;
  const adjacentKimonoIndex = kimonoSwipeDirection === "left" ? nextKimonoIndex : prevKimonoIndex;
  const adjacentKimono = kimonoSwipeDirection ? kimonos[adjacentKimonoIndex] : null;

  // 次/前の半襟インデックスを計算
  const nextHaneriIndex = haneriIndex === haneris.length - 1 ? 0 : haneriIndex + 1;
  const prevHaneriIndex = haneriIndex === 0 ? haneris.length - 1 : haneriIndex - 1;
  const adjacentHaneriIndex = haneriSwipeDirection === "left" ? nextHaneriIndex : prevHaneriIndex;
  const adjacentHaneri = haneriSwipeDirection ? haneris[adjacentHaneriIndex] : null;

  // 次/前の帯インデックスを計算
  const nextObiIndex = obiIndex === obis.length - 1 ? 0 : obiIndex + 1;
  const prevObiIndex = obiIndex === 0 ? obis.length - 1 : obiIndex - 1;
  const adjacentObiIndex = obiSwipeDirection === "left" ? nextObiIndex : prevObiIndex;
  const adjacentObi = obiSwipeDirection ? obis[adjacentObiIndex] : null;

  // 次/前の帯揚げインデックスを計算
  const nextObiageIndex = obiageIndex === obiages.length - 1 ? 0 : obiageIndex + 1;
  const prevObiageIndex = obiageIndex === 0 ? obiages.length - 1 : obiageIndex - 1;
  const adjacentObiageIndex = obiageSwipeDirection === "left" ? nextObiageIndex : prevObiageIndex;
  const adjacentObiage = obiageSwipeDirection ? obiages[adjacentObiageIndex] : null;

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

  const haneriStyle = {
    transform: activeLayer === "haneri" ? `translateX(${haneriOffsetX}px)` : undefined,
    transition: haneriSwiping || haneriResetting ? "none" : "transform 0.3s ease-out",
  };

  const haneriNextStyle = {
    transform: `translateX(${haneriNextOffsetX}px)`,
    transition: haneriSwiping || haneriResetting ? "none" : "transform 0.3s ease-out",
  };

  const obiStyle = {
    transform: activeLayer === "obi" ? `translateX(${obiOffsetX}px)` : undefined,
    transition: obiSwiping || obiResetting ? "none" : "transform 0.3s ease-out",
  };

  const obiNextStyle = {
    transform: `translateX(${obiNextOffsetX}px)`,
    transition: obiSwiping || obiResetting ? "none" : "transform 0.3s ease-out",
  };

  const obiageStyle = {
    transform: activeLayer === "obiage" ? `translateX(${obiageOffsetX}px)` : undefined,
    transition: obiageSwiping || obiageResetting ? "none" : "transform 0.3s ease-out",
  };

  const obiageNextStyle = {
    transform: `translateX(${obiageNextOffsetX}px)`,
    transition: obiageSwiping || obiageResetting ? "none" : "transform 0.3s ease-out",
  };

  const obijimeStyle = {
    transform: activeLayer === "obijime" ? `translateX(${obijimeOffsetX}px)` : undefined,
    transition: obijimeSwiping || obijimeResetting ? "none" : "transform 0.3s ease-out",
  };

  const obijimeNextStyle = {
    transform: `translateX(${obijimeNextOffsetX}px)`,
    transition: obijimeSwiping || obijimeResetting ? "none" : "transform 0.3s ease-out",
  };

  if (!currentKimono || !currentHaneri || !currentObi || !currentObiage || !currentObijime) {
    return null;
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* 着物と帯の重ね表示 */}
      {/* カスタムのスワイプ操作面のため、静的要素へのハンドラ付与に関する a11y ルールを抑制 */}
      {/* oxlint-disable-next-line jsx-a11y/no-static-element-interactions */}
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
        {/* 半襟レイヤー（現在）- 着物の衿の前面に覗く */}
        <div className="pointer-events-none absolute inset-0" style={haneriStyle}>
          <HaneriSilhouette color={currentHaneri.color} className="h-full w-full" />
        </div>
        {/* 半襟レイヤー（次/前）- スワイプ中のみ表示 */}
        {activeLayer === "haneri" && adjacentHaneri && (
          <div className="pointer-events-none absolute inset-0" style={haneriNextStyle}>
            <HaneriSilhouette color={adjacentHaneri.color} className="h-full w-full" />
          </div>
        )}
        {/* 帯揚げレイヤー（現在）- 帯の裏に潜り込むため帯より先に描画 */}
        <div className="pointer-events-none absolute inset-0" style={obiageStyle}>
          <ObiageSilhouette color={currentObiage.color} className="h-full w-full" />
        </div>
        {/* 帯揚げレイヤー（次/前）- スワイプ中のみ表示 */}
        {activeLayer === "obiage" && adjacentObiage && (
          <div className="pointer-events-none absolute inset-0" style={obiageNextStyle}>
            <ObiageSilhouette color={adjacentObiage.color} className="h-full w-full" />
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
          <span className="font-medium">半襟:</span> {currentHaneri.name}
          <span className="mx-2">|</span>
          <span className="font-medium">帯:</span> {currentObi.name}
          <span className="mx-2">|</span>
          <span className="font-medium">帯揚げ:</span> {currentObiage.name}
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
          <span className="w-12 text-xs text-gray-600">半襟:</span>
          <div className="flex gap-1">
            {haneris.map((haneri, index) => (
              <button
                key={haneri.id}
                type="button"
                className={`h-3 w-3 rounded-full border transition-colors ${
                  index === haneriIndex ? "border-gray-800 bg-gray-800" : "border-gray-400 bg-white"
                }`}
                style={{ backgroundColor: index === haneriIndex ? haneri.color : undefined }}
                onClick={() => setHaneriIndex(index)}
                aria-label={`${haneri.name}を選択`}
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
          <span className="w-12 text-xs text-gray-600">帯揚げ:</span>
          <div className="flex gap-1">
            {obiages.map((obiage, index) => (
              <button
                key={obiage.id}
                type="button"
                className={`h-3 w-3 rounded-full border transition-colors ${
                  index === obiageIndex ? "border-gray-800 bg-gray-800" : "border-gray-400 bg-white"
                }`}
                style={{ backgroundColor: index === obiageIndex ? obiage.color : undefined }}
                onClick={() => setObiageIndex(index)}
                aria-label={`${obiage.name}を選択`}
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
