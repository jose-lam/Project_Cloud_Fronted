import type { AnalyticsRow } from "../types";

interface BarListProps {
  rows: AnalyticsRow[] | null | undefined;
  labelKey: string;
  valueKey: string;
  color?: string;
  suffix?: string;
}

export default function BarList({ rows, labelKey, valueKey, color = "var(--color-accent)", suffix = "" }: BarListProps) {
  if (!rows || rows.length === 0) {
    return <p style={{ color: "var(--color-ink-faint)", fontSize: 13.5 }}>Sin datos disponibles.</p>;
  }
  const values = rows.map((r) => Number(r[valueKey]) || 0);
  const max = Math.max(...values, 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map((row, i) => {
        const value = Number(row[valueKey]) || 0;
        const pct = Math.max((value / max) * 100, 3);
        return (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
              <span style={{ fontWeight: 600, color: "var(--color-ink)" }}>{String(row[labelKey])}</span>
              <span style={{ color: "var(--color-ink-soft)" }}>
                {value.toLocaleString("es-PE")}
                {suffix}
              </span>
            </div>
            <div style={{ background: "var(--color-bg-alt)", borderRadius: 6, height: 8, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 6 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
