/**
 * ObijimeSilhouette コンポーネントのプロパティ
 */
interface ObijimeSilhouetteProps {
  /** 帯締めの塗りつぶし色（CSS カラーコード） */
  color: string;
  /** 追加の CSS クラス名 */
  className?: string;
}

/**
 * 帯締めのシルエットを SVG で描画するコンポーネント
 * @param props - コンポーネントのプロパティ
 * @param props.color - 帯締めの塗りつぶし色
 * @param props.className - 追加の CSS クラス名
 * @returns 帯締めシルエットの SVG 要素
 */
export function ObijimeSilhouette({ color, className = "" }: ObijimeSilhouetteProps) {
  return (
    <svg viewBox="0 0 200 300" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* 帯締め本体 */}
      <rect x="30" y="120" width="140" height="10" fill={color} />
    </svg>
  );
}
