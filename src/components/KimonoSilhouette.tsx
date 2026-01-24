interface KimonoSilhouetteProps {
  color: string;
  className?: string;
}

export function KimonoSilhouette({ color, className = "" }: KimonoSilhouetteProps) {
  return (
    <svg viewBox="0 0 200 300" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* 着物本体 */}
      <path
        d={`
          M 100 10
          L 70 10
          L 60 30
          L 20 30
          L 10 50
          L 10 300
          L 45 300
          L 45 80
          L 55 60
          L 75 80
          L 85 300
          L 115 300
          L 125 80
          L 145 60
          L 155 80
          L 155 300
          L 190 300
          L 190 50
          L 180 30
          L 140 30
          L 130 10
          L 100 10
          Z
        `}
        fill={color}
        stroke="#333"
        strokeWidth="1"
      />
      {/* 左襟 */}
      <path
        d={`
          M 100 10
          L 70 10
          L 60 30
          L 55 60
          L 75 80
          L 85 180
          L 100 180
          Z
        `}
        fill={color}
        stroke="#333"
        strokeWidth="1"
        filter="brightness(0.9)"
      />
      {/* 右襟 */}
      <path
        d={`
          M 100 10
          L 130 10
          L 140 30
          L 145 60
          L 125 80
          L 115 180
          L 100 180
          Z
        `}
        fill={color}
        stroke="#333"
        strokeWidth="1"
        opacity="0.85"
      />
      {/* 襟の白い部分（半襟） */}
      <path
        d={`
          M 100 15
          L 78 15
          L 70 30
          L 68 50
          L 80 65
          L 88 140
          L 100 140
          Z
        `}
        fill="white"
        stroke="#ccc"
        strokeWidth="0.5"
      />
    </svg>
  );
}
