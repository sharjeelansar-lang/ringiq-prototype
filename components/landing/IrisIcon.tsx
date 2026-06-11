export function IrisIcon({ size = 32, color = "#274993", className = "" }: { size?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <circle cx="20" cy="20" r="18" stroke={color} strokeWidth="1.8" opacity="0.12" />
      <circle cx="20" cy="20" r="13" stroke={color} strokeWidth="1.8" opacity="0.22" />
      <circle cx="20" cy="20" r="8"  stroke={color} strokeWidth="2"   opacity="0.45" />
      <circle cx="20" cy="20" r="4"  fill={color} />
      <circle cx="21.4" cy="18.6" r="1.3" fill="white" opacity="0.75" />
    </svg>
  )
}
