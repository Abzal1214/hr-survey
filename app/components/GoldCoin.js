export default function GoldCoin({ size = 'md' }) {
  const sizes = {
    xs: { outer: 'h-5 w-5', inner: 'inset-[2px]', emoji: 'text-[9px]' },
    sm: { outer: 'h-7 w-7', inner: 'inset-[2px]', emoji: 'text-[11px]' },
    md: { outer: 'h-8 w-8', inner: 'inset-[2px]', emoji: 'text-[13px]' },
    lg: { outer: 'h-10 w-10', inner: 'inset-[3px]', emoji: 'text-[15px]' },
  };
  const s = sizes[size] || sizes.md;
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-400 shadow-sm shadow-amber-200 ring-2 ring-yellow-200 ${s.outer}`}>
      <span className={`absolute ${s.inner} rounded-full border border-yellow-200/80`} />
      <span className={`relative leading-none ${s.emoji}`} style={{ filter: 'sepia(1) saturate(4) brightness(1.1) hue-rotate(-5deg)' }}>🌊</span>
    </span>
  );
}
