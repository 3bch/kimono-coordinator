interface ObiSilhouetteProps {
  color: string;
  className?: string;
}

export function ObiSilhouette({ color, className = "" }: ObiSilhouetteProps) {
  return (
    <svg viewBox="0 0 200 300" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* 帯本体（着物の腰部分に巻く） */}
      <path
        d={`
          M 10 155
          L 10 195
          L 45 195
          L 45 155
          L 85 155
          L 85 195
          L 115 195
          L 115 155
          L 155 155
          L 155 195
          L 190 195
          L 190 155
          Z
        `}
        fill={color}
        stroke="#333"
        strokeWidth="1"
      />
      {/* 帯締め（帯の中央を留める紐） */}
      <rect x="10" y="170" width="180" height="6" fill="#333" rx="1" />
      {/* 帯揚げ（帯の上部の布） */}
      <rect
        x="10"
        y="153"
        width="180"
        height="5"
        fill={color}
        opacity="0.7"
        stroke="#333"
        strokeWidth="0.5"
      />
    </svg>
  );
}
