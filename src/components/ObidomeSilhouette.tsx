/**
 * ObidomeSilhouette コンポーネントのプロパティ
 */
interface ObidomeSilhouetteProps {
  /** 帯留めの塗りつぶし色（imageUrl 未指定時の単色描画に使用） */
  color: string;
  /** 帯留めの画像 URL（指定時は単色の四角の代わりに画像を描画） */
  imageUrl?: string | undefined;
  /** 追加の CSS クラス名 */
  className?: string;
}

/**
 * 帯留め画像の描画幅（viewBox 単位）
 */
const IMAGE_WIDTH = 36;

/**
 * 帯留め画像の描画高さ（viewBox 単位）
 * 元画像 547x296 の縦横比を保ちつつ、コンテナが viewBox 300 を 400px に
 * 縦へ引き伸ばす分（4/3 倍）を打ち消すため 3/4 を掛けている
 * 36 / (547 / 296) * (3 / 4) ≒ 14.6
 */
const IMAGE_HEIGHT = 14.6;

/**
 * 帯留めの中心位置（viewBox 単位）
 * 帯締め（y=123〜127）の中央に重ねる
 */
const CENTER_X = 100;

/**
 * 帯留めの中心位置（viewBox 単位）
 */
const CENTER_Y = 125;

/**
 * 帯留めのシルエットを SVG で描画するコンポーネント
 * 画像 URL があれば背景透過済みの画像を、なければ単色の四角を帯締めの中央に描画する
 * @param props - コンポーネントのプロパティ
 * @param props.color - 帯留めの塗りつぶし色
 * @param props.imageUrl - 帯留めの画像 URL
 * @param props.className - 追加の CSS クラス名
 * @returns 帯留めシルエットの SVG 要素
 */
export function ObidomeSilhouette({ color, imageUrl, className = "" }: ObidomeSilhouetteProps) {
  return (
    <svg
      viewBox="0 0 200 300"
      preserveAspectRatio="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {imageUrl !== undefined && imageUrl !== "" ? (
        // 帯留め本体（実写画像）: 縦横比の補正は width/height で済ませているため
        // preserveAspectRatio は none にして枠いっぱいに描画する
        <image
          href={imageUrl}
          x={CENTER_X - IMAGE_WIDTH / 2}
          y={CENTER_Y - IMAGE_HEIGHT / 2}
          width={IMAGE_WIDTH}
          height={IMAGE_HEIGHT}
          preserveAspectRatio="none"
        />
      ) : (
        // 帯留め本体（単色）: 見た目がほぼ正方形になる大きさ（20x15 → 表示 20x20）
        <rect x={CENTER_X - 10} y={CENTER_Y - 7.5} width={20} height={15} fill={color} />
      )}
    </svg>
  );
}
