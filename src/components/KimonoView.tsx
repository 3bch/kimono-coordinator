import { useRef, useState } from "react";

import { HaneriSilhouette } from "#src/components/HaneriSilhouette";
import { HaoriSilhouette } from "#src/components/HaoriSilhouette";
import { KimonoSilhouette } from "#src/components/KimonoSilhouette";
import { ObiageSilhouette } from "#src/components/ObiageSilhouette";
import { ObidomeSilhouette } from "#src/components/ObidomeSilhouette";
import { ObijimeSilhouette } from "#src/components/ObijimeSilhouette";
import { ObiSilhouette } from "#src/components/ObiSilhouette";
import { useSwipe } from "#src/hooks/useSwipe";
import type {
  HaneriItem,
  HaoriItem,
  KimonoItem,
  ObiageItem,
  ObidomeItem,
  ObiItem,
  ObijimeItem,
} from "#src/types/kimono";

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
  /** 表示する帯留めアイテムの配列 */
  obidomes: ObidomeItem[];
  /** 表示する羽織アイテムの配列 */
  haoris: HaoriItem[];
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
 * 帯留めエリアの開始位置（コンテナ高さに対する比率）
 * SVG viewBox="0 0 200 300" で帯留めは y=115 付近から開始
 */
const OBIDOME_AREA_START = 115 / 300;

/**
 * 帯留めエリアの終了位置（コンテナ高さに対する比率）
 * SVG viewBox="0 0 200 300" で帯留めは y=135 付近で終了
 */
const OBIDOME_AREA_END = 135 / 300;

/**
 * 帯留めエリアの左端位置（コンテナ幅に対する比率）
 * 帯留めは帯締め中央（x=100 付近）の飾りなので、x 座標でも帯締めと区別する
 */
const OBIDOME_AREA_X_START = 75 / 200;

/**
 * 帯留めエリアの右端位置（コンテナ幅に対する比率）
 */
const OBIDOME_AREA_X_END = 125 / 200;

/**
 * 羽織エリアの終了位置（コンテナ高さに対する比率）
 * 羽織の viewBox="0 0 1000 2000" で裾は y=1400 で終わる
 */
const HAORI_AREA_Y_END = 1400 / 2000;

/**
 * 羽織着用時の羽織エリアの左端位置（コンテナ幅に対する比率）
 * 前の開き（左身頃の前端 x=212〜220 付近）より外側を羽織エリアとする
 */
const HAORI_WORN_X_START = 220 / 1000;

/**
 * 羽織着用時の羽織エリアの右端位置（コンテナ幅に対する比率）
 */
const HAORI_WORN_X_END = 780 / 1000;

/**
 * 羽織なし時の羽織エリアの左端位置（コンテナ幅に対する比率）
 * 着物の袖（x=0〜145）にあたる外縁だけを羽織エリアとして残し、
 * スワイプで羽織を再び着られるようにする
 */
const HAORI_NONE_X_START = 145 / 1000;

/**
 * 羽織なし時の羽織エリアの右端位置（コンテナ幅に対する比率）
 */
const HAORI_NONE_X_END = 855 / 1000;

/**
 * 着物と半襟と帯と帯揚げと帯締めと帯留めと羽織を重ねて表示し、スワイプで切り替えるコンポーネント
 * タッチ位置に応じて着物・半襟・帯・帯揚げ・帯締め・帯留め・羽織を操作対象として判定する
 * @param props - コンポーネントのプロパティ
 * @param props.kimonos - 表示する着物アイテムの配列
 * @param props.haneris - 表示する半襟アイテムの配列
 * @param props.obis - 表示する帯アイテムの配列
 * @param props.obiages - 表示する帯揚げアイテムの配列
 * @param props.obijimes - 表示する帯締めアイテムの配列
 * @param props.obidomes - 表示する帯留めアイテムの配列
 * @param props.haoris - 表示する羽織アイテムの配列
 * @returns 着物コーディネートビューの React 要素
 */
export function KimonoView({
  kimonos,
  haneris,
  obis,
  obiages,
  obijimes,
  obidomes,
  haoris,
}: KimonoViewProps) {
  const [kimonoIndex, setKimonoIndex] = useState(0);
  const [haneriIndex, setHaneriIndex] = useState(0);
  const [obiIndex, setObiIndex] = useState(0);
  const [obiageIndex, setObiageIndex] = useState(0);
  const [obijimeIndex, setObijimeIndex] = useState(0);
  const [obidomeIndex, setObidomeIndex] = useState(0);
  const [haoriIndex, setHaoriIndex] = useState(0);
  const [activeLayer, setActiveLayer] = useState<
    "kimono" | "haneri" | "obi" | "obiage" | "obijime" | "obidome" | "haori"
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

  const goToPrevObidome = () => {
    setObidomeIndex((prev) => (prev === 0 ? obidomes.length - 1 : prev - 1));
  };

  const goToNextObidome = () => {
    setObidomeIndex((prev) => (prev === obidomes.length - 1 ? 0 : prev + 1));
  };

  const goToPrevHaori = () => {
    setHaoriIndex((prev) => (prev === 0 ? haoris.length - 1 : prev - 1));
  };

  const goToNextHaori = () => {
    setHaoriIndex((prev) => (prev === haoris.length - 1 ? 0 : prev + 1));
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

  const {
    offsetX: obidomeOffsetX,
    nextOffsetX: obidomeNextOffsetX,
    swipeDirection: obidomeSwipeDirection,
    isSwiping: obidomeSwiping,
    isResetting: obidomeResetting,
    handlers: obidomeHandlers,
  } = useSwipe({
    threshold: containerWidth / 4,
    containerWidth,
    onSwipeLeft: goToNextObidome,
    onSwipeRight: goToPrevObidome,
  });

  const {
    offsetX: haoriOffsetX,
    nextOffsetX: haoriNextOffsetX,
    swipeDirection: haoriSwipeDirection,
    isSwiping: haoriSwiping,
    isResetting: haoriResetting,
    handlers: haoriHandlers,
  } = useSwipe({
    threshold: containerWidth / 4,
    containerWidth,
    onSwipeLeft: goToNextHaori,
    onSwipeRight: goToPrevHaori,
  });

  // タッチ位置から操作対象を判定
  const determineActiveLayer = (
    clientX: number,
    clientY: number,
  ): "kimono" | "haneri" | "obi" | "obiage" | "obijime" | "obidome" | "haori" => {
    if (!containerRef.current) {
      return "kimono";
    }
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = clientX - rect.left;
    const relativeY = clientY - rect.top;
    const ratioX = relativeX / containerWidth;
    const ratio = relativeY / containerHeight;
    // 左右の外縁エリア内なら羽織、半襟エリア内なら半襟、
    // 帯留めエリア（帯締め中央付近）内なら帯留め、
    // 帯締めエリア内なら帯締め、帯揚げエリア内なら帯揚げ、帯エリア内なら帯、それ以外は着物
    // 羽織エリアの幅は着用状態で変える（着用時は見えている身頃・袖全体、
    // なし時は着物の袖にあたる外縁のみを残して再着用のスワイプ経路とする）
    const haoriWorn = haoris[haoriIndex]?.none !== true;
    const haoriXStart = haoriWorn ? HAORI_WORN_X_START : HAORI_NONE_X_START;
    const haoriXEnd = haoriWorn ? HAORI_WORN_X_END : HAORI_NONE_X_END;
    if (ratio <= HAORI_AREA_Y_END && (ratioX <= haoriXStart || ratioX >= haoriXEnd)) {
      return "haori";
    }
    if (ratio >= HANERI_AREA_START && ratio <= HANERI_AREA_END) {
      return "haneri";
    }
    if (
      ratio >= OBIDOME_AREA_START &&
      ratio <= OBIDOME_AREA_END &&
      ratioX >= OBIDOME_AREA_X_START &&
      ratioX <= OBIDOME_AREA_X_END
    ) {
      return "obidome";
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
    const layer = determineActiveLayer(touch.clientX, touch.clientY);
    setActiveLayer(layer);
    if (layer === "kimono") {
      kimonoHandlers.onTouchStart(e);
    } else if (layer === "haneri") {
      haneriHandlers.onTouchStart(e);
    } else if (layer === "obi") {
      obiHandlers.onTouchStart(e);
    } else if (layer === "obiage") {
      obiageHandlers.onTouchStart(e);
    } else if (layer === "obidome") {
      obidomeHandlers.onTouchStart(e);
    } else if (layer === "haori") {
      haoriHandlers.onTouchStart(e);
    } else {
      obijimeHandlers.onTouchStart(e);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const layer = determineActiveLayer(e.clientX, e.clientY);
    setActiveLayer(layer);
    if (layer === "kimono") {
      kimonoHandlers.onMouseDown(e);
    } else if (layer === "haneri") {
      haneriHandlers.onMouseDown(e);
    } else if (layer === "obi") {
      obiHandlers.onMouseDown(e);
    } else if (layer === "obiage") {
      obiageHandlers.onMouseDown(e);
    } else if (layer === "obidome") {
      obidomeHandlers.onMouseDown(e);
    } else if (layer === "haori") {
      haoriHandlers.onMouseDown(e);
    } else {
      obijimeHandlers.onMouseDown(e);
    }
  };

  // タッチの Move/End は現在の activeLayer に応じて振り分け
  // （マウスの Move/Up は useSwipe が window で追跡するため不要）
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
    if (activeLayer === "obidome") {
      return obidomeHandlers;
    }
    if (activeLayer === "haori") {
      return haoriHandlers;
    }
    return obijimeHandlers;
  };
  const activeHandlers = getActiveHandlers();

  const currentKimono = kimonos[kimonoIndex];
  const currentHaneri = haneris[haneriIndex];
  const currentObi = obis[obiIndex];
  const currentObiage = obiages[obiageIndex];
  const currentObijime = obijimes[obijimeIndex];
  const currentObidome = obidomes[obidomeIndex];
  const currentHaori = haoris[haoriIndex];

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

  // 次/前の帯留めインデックスを計算
  const nextObidomeIndex = obidomeIndex === obidomes.length - 1 ? 0 : obidomeIndex + 1;
  const prevObidomeIndex = obidomeIndex === 0 ? obidomes.length - 1 : obidomeIndex - 1;
  const adjacentObidomeIndex =
    obidomeSwipeDirection === "left" ? nextObidomeIndex : prevObidomeIndex;
  const adjacentObidome = obidomeSwipeDirection ? obidomes[adjacentObidomeIndex] : null;

  // 次/前の羽織インデックスを計算
  const nextHaoriIndex = haoriIndex === haoris.length - 1 ? 0 : haoriIndex + 1;
  const prevHaoriIndex = haoriIndex === 0 ? haoris.length - 1 : haoriIndex - 1;
  const adjacentHaoriIndex = haoriSwipeDirection === "left" ? nextHaoriIndex : prevHaoriIndex;
  const adjacentHaori = haoriSwipeDirection ? haoris[adjacentHaoriIndex] : null;

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

  const obidomeStyle = {
    transform: activeLayer === "obidome" ? `translateX(${obidomeOffsetX}px)` : undefined,
    transition: obidomeSwiping || obidomeResetting ? "none" : "transform 0.3s ease-out",
  };

  const obidomeNextStyle = {
    transform: `translateX(${obidomeNextOffsetX}px)`,
    transition: obidomeSwiping || obidomeResetting ? "none" : "transform 0.3s ease-out",
  };

  const haoriStyle = {
    transform: activeLayer === "haori" ? `translateX(${haoriOffsetX}px)` : undefined,
    transition: haoriSwiping || haoriResetting ? "none" : "transform 0.3s ease-out",
  };

  const haoriNextStyle = {
    transform: `translateX(${haoriNextOffsetX}px)`,
    transition: haoriSwiping || haoriResetting ? "none" : "transform 0.3s ease-out",
  };

  if (
    !currentKimono ||
    !currentHaneri ||
    !currentObi ||
    !currentObiage ||
    !currentObijime ||
    !currentObidome ||
    !currentHaori
  ) {
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
        {/* 帯留めレイヤー（現在）- 帯締めの前面に重ねる */}
        <div className="pointer-events-none absolute inset-0" style={obidomeStyle}>
          <ObidomeSilhouette
            color={currentObidome.color}
            imageUrl={currentObidome.imageUrl}
            className="h-full w-full"
          />
        </div>
        {/* 帯留めレイヤー（次/前）- スワイプ中のみ表示 */}
        {activeLayer === "obidome" && adjacentObidome && (
          <div className="pointer-events-none absolute inset-0" style={obidomeNextStyle}>
            <ObidomeSilhouette
              color={adjacentObidome.color}
              imageUrl={adjacentObidome.imageUrl}
              className="h-full w-full"
            />
          </div>
        )}
        {/* 羽織レイヤー（現在）- 最前面に重ねる。「なし」のときは描画しない */}
        <div className="pointer-events-none absolute inset-0" style={haoriStyle}>
          {currentHaori.none !== true && (
            <HaoriSilhouette color={currentHaori.color} className="h-full w-full" />
          )}
        </div>
        {/* 羽織レイヤー（次/前）- スワイプ中のみ表示。「なし」のときは描画しない */}
        {activeLayer === "haori" && adjacentHaori && (
          <div className="pointer-events-none absolute inset-0" style={haoriNextStyle}>
            {adjacentHaori.none !== true && (
              <HaoriSilhouette color={adjacentHaori.color} className="h-full w-full" />
            )}
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
          <span className="mx-2">|</span>
          <span className="font-medium">帯留め:</span> {currentObidome.name}
          <span className="mx-2">|</span>
          <span className="font-medium">羽織:</span> {currentHaori.name}
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
        <div className="flex items-center gap-2">
          <span className="w-12 text-xs text-gray-600">帯留め:</span>
          <div className="flex gap-1">
            {obidomes.map((obidome, index) => (
              <button
                key={obidome.id}
                type="button"
                className={`h-3 w-3 rounded-full border transition-colors ${
                  index === obidomeIndex
                    ? "border-gray-800 bg-gray-800"
                    : "border-gray-400 bg-white"
                }`}
                style={{ backgroundColor: index === obidomeIndex ? obidome.color : undefined }}
                onClick={() => setObidomeIndex(index)}
                aria-label={`${obidome.name}を選択`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-12 text-xs text-gray-600">羽織:</span>
          <div className="flex gap-1">
            {haoris.map((haori, index) => (
              <button
                key={haori.id}
                type="button"
                className={`h-3 w-3 rounded-full border transition-colors ${
                  index === haoriIndex ? "border-gray-800 bg-gray-800" : "border-gray-400 bg-white"
                }`}
                style={{ backgroundColor: index === haoriIndex ? haori.color : undefined }}
                onClick={() => setHaoriIndex(index)}
                aria-label={`${haori.name}を選択`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
