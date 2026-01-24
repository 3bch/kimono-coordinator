interface ObiSilhouetteProps {
  color: string;
  className?: string;
}

export function ObiSilhouette({ color, className = "" }: ObiSilhouetteProps) {
  return (
    <svg viewBox="0 0 200 300" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* 帯本体 */}
      <rect x="30" y="90" width="140" height="70" fill={color} />
    </svg>
  );
}
