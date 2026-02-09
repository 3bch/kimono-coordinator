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
    <svg
      viewBox="0 0 200 300"
      preserveAspectRatio="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 着物本体（右半身・左半身） */}
      <path
        d={`
          M 100 30
          L 120 0
          Q 166 8 180 30
          L 200 70
          L 200 200
          Q 174 220 171 200
          L 171 200
          L 171 70
          L 170 70
          L 170 200
          L 164 300
          L 60 300
          L 60 160
          L 70 100
          L 84 54
          Z

          M 99 30
          L 80 0
          Q 34 8 20 30
          L 0 70
          L 0 200
          Q 26 220 29 200
          L 29 200
          L 29 70
          L 30 70
          L 30 200
          L 36 300
          L 59 300
          L 59 160
          L 69 100
          L 83 54
          Z
        `}
        fill={color}
      />
    </svg>
  );
}
