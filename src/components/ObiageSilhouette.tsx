/**
 * ObiageSilhouette コンポーネントのプロパティ
 */
interface ObiageSilhouetteProps {
  /** 帯揚げの塗りつぶし色（CSS カラーコード） */
  color: string;
  /** 追加の CSS クラス名 */
  className?: string;
}

/**
 * 帯揚げのシルエットを SVG で描画するコンポーネント
 * 帯の上端から覗く布で、左右の端が高く中央へ向かってなだらかに下がり、
 * 中央には結び目の丸い膨らみがある
 * @param props - コンポーネントのプロパティ
 * @param props.color - 帯揚げの塗りつぶし色
 * @param props.className - 追加の CSS クラス名
 * @returns 帯揚げシルエットの SVG 要素
 */
export function ObiageSilhouette({ color, className = "" }: ObiageSilhouetteProps) {
  return (
    <svg
      viewBox="0 0 200 300"
      preserveAspectRatio="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 帯揚げ本体（下端は帯の裏に潜り込ませる） */}
      <path
        d="M 30 92
           L 30 87.5
           Q 30 85.5, 36 85.5
           C 55 85.8, 72 87, 95 87
           C 97 84.9, 103 84.9, 105 87
           C 128 87, 145 85.8, 164 85.5
           Q 170 85.5, 170 87.5
           L 170 92
           Z"
        fill={color}
      />
    </svg>
  );
}
