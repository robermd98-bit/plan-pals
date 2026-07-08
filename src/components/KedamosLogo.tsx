export function KedamosLogo({ size = 110 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="92" height="92" rx="26" fill="var(--pin)" />
      <text
        x="50"
        y="54"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-sans)"
        fontWeight={800}
        fontSize="58"
        fill="var(--pin-foreground)"
      >
        ?
      </text>
    </svg>
  );
}
