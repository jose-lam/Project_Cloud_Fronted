import type { AnalyticsRow } from "../types";

const LABELS: Record<string, string> = {
  id: "ID",
  nombre: "Nombre",
  stock_disponible: "Stock disponible",
  categoria: "Categoría",
  producto: "Producto",
  stars: "Estrellas",
  reviews: "Reseñas",
  fecha_pedido: "Fecha",
  estado: "Estado",
  total_pedidos: "Pedidos",
  email: "Correo",
  producto_id: "ID producto",
  nombre_producto: "Producto",
  total_pedido: "Unidades pedidas",
  total_carritos_abiertos: "Carritos abiertos",
};

function formatValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (key === "fecha_pedido") {
    const d = new Date(value as string);
    return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString("es-PE");
  }
  if (key === "stars") return Number(value).toFixed(1) + " ★";
  const strValue = String(value).trim();
  if (strValue !== "" && !key.toLowerCase().includes("email")) {
    const n = Number(value);
    if (Number.isFinite(n) && !Number.isNaN(n) && /^-?\d+(\.\d+)?$/.test(strValue)) {
      return n.toLocaleString("es-PE");
    }
  }
  return String(value);
}

interface DataTableProps {
  rows: AnalyticsRow[] | null | undefined;
  emptyLabel?: string;
}

export default function DataTable({ rows, emptyLabel = "Sin datos disponibles." }: DataTableProps) {
  if (!rows || rows.length === 0) {
    return <p style={{ color: "var(--color-ink-faint)", fontSize: 13.5 }}>{emptyLabel}</p>;
  }
  const columns = Object.keys(rows[0]);

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="analytics-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{LABELS[c] || c.replace(/_/g, " ")}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c}>{formatValue(c, row[c])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
