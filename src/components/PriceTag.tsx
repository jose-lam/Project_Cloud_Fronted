export function formatPEN(amount: number | string | null | undefined): string {
  const n = Number(amount || 0);
  return n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type PriceTagSize = "sm" | "md" | "lg";

interface PriceTagProps {
  amount: number | string | null | undefined;
  size?: PriceTagSize;
}

const SIZES: Record<PriceTagSize, { symbol: number; whole: number; cents: number }> = {
  sm: { symbol: 12, whole: 16, cents: 11 },
  md: { symbol: 13, whole: 22, cents: 12 },
  lg: { symbol: 15, whole: 30, cents: 15 },
};

export default function PriceTag({ amount, size = "md" }: PriceTagProps) {
  const formatted = formatPEN(amount).split(".");
  const sizes = SIZES[size];

  return (
    <span style={{ color: "var(--color-primary)", fontWeight: 700, display: "inline-flex", alignItems: "flex-start", gap: 2 }}>
      <span style={{ fontSize: sizes.symbol, marginTop: 3 }}>S/</span>
      <span style={{ fontSize: sizes.whole, fontFamily: "var(--font-display)", lineHeight: 1 }}>{formatted[0]}</span>
      <span style={{ fontSize: sizes.cents, marginTop: 2 }}>{formatted[1]}</span>
    </span>
  );
}
