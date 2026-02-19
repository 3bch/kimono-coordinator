/**
 * KimonoSilhouette コンポーネントのプロパティ
 */
interface KimonoSilhouetteProps {
  /** 着物の塗りつぶし色（CSS カラーコード） */
  color: string;
  /** 追加の CSS クラス名 */
  className?: string;
}

/**
 * 着物のシルエットを SVG で描画するコンポーネント
 * @param props - コンポーネントのプロパティ
 * @param props.color - 着物の塗りつぶし色
 * @param props.className - 追加の CSS クラス名
 * @returns 着物シルエットの SVG 要素
 */
export function KimonoSilhouette({ color, className = "" }: KimonoSilhouetteProps) {
  return (
    <svg viewBox="0 0 1000 2000" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* 着物本体（右半身・左半身） */}
      <path
        d={`
          M 0500 0200
          L 0650 0000
          Q 0830 0053 0900 0200
          L 1000 0467
          L 1000 1333
          Q 0870 1467 0855 1333
          L 0855 1333
          L 0855 0467
          L 0850 0467
          L 0850 1333
          L 0820 2000
          L 0300 2000
          L 0300 1067
          L 0350 0667
          L 0380 0360
          Z

          M 0495 0200
          L 0350 0000
          Q 0170 0053 0100 0200
          L 0000 0467
          L 0000 1333
          Q 0130 1467 0145 1333
          L 0145 1333
          L 0145 0467
          L 0150 0467
          L 0150 1333
          L 0180 2000
          L 0295 2000
          L 0295 1067
          L 0345 0667
          L 0375 0360
          Z

          M 0850 1250
          L 0850 1255
          L 0150 1255
          L 0150 1250
          Z

          M 0390 0360
          L 0498 0422
          L 0767 0060
          L 0773 0060
          L 0500 0428
          L 0470 0735
          L 0429 1067
          L 0424 1067
          L 0465 0735
          L 0496 0426
          L 0380 0360
          Z

          M 0233 0060
          L 0416 0307
          L 0413 0311
          L 0227 0060
          Z
        `}
        fill={color}
        fillRule="evenodd"
      />
    </svg>
  );
}
