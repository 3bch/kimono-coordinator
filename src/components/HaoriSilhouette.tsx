/**
 * HaoriSilhouette コンポーネントのプロパティ
 */
interface HaoriSilhouetteProps {
  /** 羽織の塗りつぶし色（CSS カラーコード） */
  color: string;
  /** 追加の CSS クラス名 */
  className?: string;
}

/**
 * 羽織のシルエットを SVG で描画するコンポーネント
 * 着物と同じ viewBox を使い、前が開いた左右の身頃と袖を描く
 * 中央の開きから着物や帯まわりの小物が見える
 * @param props - コンポーネントのプロパティ
 * @param props.color - 羽織の塗りつぶし色
 * @param props.className - 追加の CSS クラス名
 * @returns 羽織シルエットの SVG 要素
 */
export function HaoriSilhouette({ color, className = "" }: HaoriSilhouetteProps) {
  return (
    <svg viewBox="0 0 1000 2000" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* 羽織（右身頃・左身頃）- 前は開いており裾は膝上 y=1400 まで */}
      <path
        d={`
          M 0655 0000
          Q 0833 0055 0903 0205
          L 1000 0467
          L 1000 1360
          Q 0870 1490 0855 1360
          L 0855 0480
          L 0850 0480
          L 0850 1400
          L 0640 1400
          L 0630 0100
          Z

          M 0345 0000
          Q 0167 0055 0097 0205
          L 0000 0467
          L 0000 1360
          Q 0130 1490 0145 1360
          L 0145 0480
          L 0150 0480
          L 0150 1400
          L 0360 1400
          L 0370 0100
          Z
        `}
        fill={color}
        fillRule="evenodd"
      />
    </svg>
  );
}
