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
           L 30 87
           Q 30 84, 36 84
           C 55 84.5, 70 87.5, 84 87.5
           C 90 79, 110 79, 116 87.5
           C 130 87.5, 145 84.5, 164 84
           Q 170 84, 170 87
           L 170 92
           Z"
        fill={color}
      />
    </svg>
  );
}
