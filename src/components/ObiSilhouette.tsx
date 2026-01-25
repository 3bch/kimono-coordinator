/**
 * ObiSilhouette コンポーネントのプロパティ
 */
interface ObiSilhouetteProps {
  /** 帯の塗りつぶし色（CSS カラーコード） */
  color: string;
  /** 追加の CSS クラス名 */
  className?: string;
}

/**
 * 帯のシルエットを SVG で描画するコンポーネント
 * @param props - コンポーネントのプロパティ
 * @param props.color - 帯の塗りつぶし色
 * @param props.className - 追加の CSS クラス名
 * @returns 帯シルエットの SVG 要素
 */
export function ObiSilhouette({ color, className = "" }: ObiSilhouetteProps) {
  return (
    <svg
      viewBox="0 0 200 300"
      preserveAspectRatio="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 帯本体 */}
      <rect x="30" y="90" width="140" height="70" fill={color} />
    </svg>
  );
}
