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
          M 80 0
          L 100 30
          L 120 0
          L 160 12
          L 180 30
          L 200 70
          L 200 200
          Q 174 220 171 200
          L 171 70
          L 170 70
          L 170 200
          L 164 300
          L 36 300
          L 30 200
          L 30 70
          L 29 70
          L 29 200
          Q 26 220 0 200
          L 0 70
          L 20 30
          L 40 12
          L 80 0
          Z
        `}
        fill={color}
      />
    </svg>
  );
}
