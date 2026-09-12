import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  getCarritosAbiertos,
  getClientesFrecuentes,
  getPedidosPorFecha,
  getProductoMasPedido,
  getProductoMenosPedido,
  getProductosMejoresResenas,
  getProductosMenosStock,
  getProductosPeoresResenas,
  getProductosPorCategoria,
} from "../api/ms5";
import DataTable from "../components/DataTable";
import BarList from "../components/BarList";
import type {
  CarritoAbiertoRow,
  ClienteFrecuenteRow,
  PedidoPorFechaRow,
  ProductoMenosStockRow,
  ProductoPedidoRow,
  ProductoPorCategoriaRow,
  ProductoResenaRow,
} from "../types";

// Cada tarjeta se resuelve de forma independiente: si un endpoint de MS5
// falla (por ejemplo porque Athena aún no tiene datos para esa consulta), el
// resto del dashboard sigue funcionando con normalidad.
const ENDPOINTS = {
  carritosAbiertos: getCarritosAbiertos,
  clientesFrecuentes: getClientesFrecuentes,
  pedidosPorFecha: getPedidosPorFecha,
  productoMasPedido: getProductoMasPedido,
  productoMenosPedido: getProductoMenosPedido,
  productosMejoresResenas: getProductosMejoresResenas,
  productosMenosStock: getProductosMenosStock,
  productosPeoresResenas: getProductosPeoresResenas,
  productosPorCategoria: getProductosPorCategoria,
} as const;

type EndpointKey = keyof typeof ENDPOINTS;

interface DashboardData {
  carritosAbiertos?: CarritoAbiertoRow[];
  clientesFrecuentes?: ClienteFrecuenteRow[];
  pedidosPorFecha?: PedidoPorFechaRow[];
  productoMasPedido?: ProductoPedidoRow[];
  productoMenosPedido?: ProductoPedidoRow[];
  productosMejoresResenas?: ProductoResenaRow[];
  productosMenosStock?: ProductoMenosStockRow[];
  productosPeoresResenas?: ProductoResenaRow[];
  productosPorCategoria?: ProductoPorCategoriaRow[];
}

type DashboardErrors = Partial<Record<EndpointKey, boolean>>;

interface KpiCardProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "primary" | "danger";
}

function KpiCard({ label, value, sub, tone = "primary" }: KpiCardProps) {
  return (
    <div className="analytics-card">
      <span className="analytics-sub" style={{ marginTop: 0 }}>
        {label}
      </span>
      <span
        className="analytics-stat"
        style={{ color: tone === "danger" ? "var(--color-danger)" : "var(--color-primary)" }}
      >
        {value}
      </span>
      {sub && <span style={{ fontSize: 12.5, color: "var(--color-ink-soft)" }}>{sub}</span>}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({});
  const [errors, setErrors] = useState<DashboardErrors>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function loadAll() {
      const entries = Object.entries(ENDPOINTS) as [EndpointKey, () => Promise<unknown[]>][];
      const results = await Promise.allSettled(entries.map(([, fn]) => fn()));
      if (!alive) return;

      const nextData: DashboardData = {};
      const nextErrors: DashboardErrors = {};
      results.forEach((res, i) => {
        const [key] = entries[i];
        if (res.status === "fulfilled") {
          (nextData as Record<EndpointKey, unknown>)[key] = res.value;
        } else {
          nextErrors[key] = true;
        }
      });
      setData(nextData);
      setErrors(nextErrors);
      setLoading(false);
    }
    loadAll();
    return () => {
      alive = false;
    };
  }, []);

  // --- Derivados para las tarjetas KPI y gráficos ---
  const totalPedidos = useMemo(() => {
    const rows = data.pedidosPorFecha;
    if (!rows) return null;
    return rows.reduce((sum, r) => sum + (Number(r.total_pedidos) || 0), 0);
  }, [data.pedidosPorFecha]);

  const pedidosPorEstado = useMemo(() => {
    const rows = data.pedidosPorFecha;
    if (!rows) return [];
    const map: Record<string, number> = {};
    rows.forEach((r) => {
      map[r.estado] = (map[r.estado] || 0) + (Number(r.total_pedidos) || 0);
    });
    return Object.entries(map)
      .map(([estado, total_pedidos]) => ({ estado, total_pedidos }))
      .sort((a, b) => b.total_pedidos - a.total_pedidos);
  }, [data.pedidosPorFecha]);

  const pedidosPorFechaAgregado = useMemo(() => {
    const rows = data.pedidosPorFecha;
    if (!rows) return [];
    const map: Record<string, number> = {};
    rows.forEach((r) => {
      const fecha = new Date(r.fecha_pedido).toLocaleDateString("es-PE");
      map[fecha] = (map[fecha] || 0) + (Number(r.total_pedidos) || 0);
    });
    return Object.entries(map)
      .map(([fecha_pedido, total_pedidos]) => ({ fecha_pedido, total_pedidos }))
      .sort((a, b) => new Date(b.fecha_pedido).getTime() - new Date(a.fecha_pedido).getTime())
      .slice(0, 10);
  }, [data.pedidosPorFecha]);

  const productosPorCategoriaAgregado = useMemo(() => {
    const rows = data.productosPorCategoria;
    if (!rows) return [];
    const map: Record<string, number> = {};
    rows.forEach((r) => {
      map[r.categoria] = (map[r.categoria] || 0) + 1;
    });
    return Object.entries(map)
      .map(([categoria, total_productos]) => ({ categoria, total_productos }))
      .sort((a, b) => b.total_productos - a.total_productos);
  }, [data.productosPorCategoria]);

  const carritosAbiertosTotal = data.carritosAbiertos?.[0]?.total_carritos_abiertos ?? null;
  const productoMasPedido = data.productoMasPedido?.[0];
  const productoMenosPedido = data.productoMenosPedido?.[0];

  return (
    <div className="container">
      <div className="page-heading">
        <h1>Panel de ventas</h1>
        <p>
          Todo lo que ves aquí viene en vivo del MS5, ejecutando consultas SQL directamente sobre AWS Athena
          contra el Data Lake (MS1 + MS2 + MS3).
        </p>
      </div>

      <div className="page-body">
        {loading && (
          <div className="analytics-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 110 }} />
            ))}
          </div>
        )}

        {!loading && (
          <>
            {/* ---------- KPIs ---------- */}
            <div className="analytics-grid" style={{ marginBottom: 4 }}>
              <KpiCard
                label="Pedidos totales registrados"
                value={totalPedidos !== null ? totalPedidos.toLocaleString("es-PE") : "—"}
                sub={errors.pedidosPorFecha ? "MS5 no respondió esta consulta" : "Suma de todos los estados"}
              />
              <KpiCard
                label="Carritos abiertos"
                value={carritosAbiertosTotal !== null ? Number(carritosAbiertosTotal).toLocaleString("es-PE") : "—"}
                sub={errors.carritosAbiertos ? "MS5 no respondió esta consulta" : "Carritos sin finalizar en MS3"}
                tone="danger"
              />
              <KpiCard
                label="Producto más pedido"
                value={productoMasPedido ? productoMasPedido.nombre_producto : "—"}
                sub={
                  productoMasPedido
                    ? `${Number(productoMasPedido.total_pedido).toLocaleString("es-PE")} unidades`
                    : errors.productoMasPedido
                    ? "MS5 no respondió esta consulta"
                    : "Sin datos"
                }
              />
              <KpiCard
                label="Producto menos pedido"
                value={productoMenosPedido ? productoMenosPedido.nombre_producto : "—"}
                sub={
                  productoMenosPedido
                    ? `${Number(productoMenosPedido.total_pedido).toLocaleString("es-PE")} unidades`
                    : errors.productoMenosPedido
                    ? "MS5 no respondió esta consulta"
                    : "Sin datos"
                }
              />
            </div>

            <div className="analytics-grid">
              {/* ---------- Pedidos por fecha ---------- */}
              <div className="analytics-card wide">
                <h3>Pedidos por fecha (últimas 10 fechas)</h3>
                <p className="analytics-sub">GET /api/analytics/pedidos-por-fecha</p>
                {errors.pedidosPorFecha ? (
                  <p className="analytics-error">No se pudo cargar esta consulta desde el MS5.</p>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 28 }}>
                    <BarList
                      rows={pedidosPorFechaAgregado}
                      labelKey="fecha_pedido"
                      valueKey="total_pedidos"
                      color="var(--color-primary)"
                      suffix=" pedidos"
                    />
                    <div>
                      <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-ink-soft)", marginBottom: 10 }}>
                        Por estado
                      </p>
                      <BarList
                        rows={pedidosPorEstado}
                        labelKey="estado"
                        valueKey="total_pedidos"
                        color="var(--color-teal)"
                        suffix=" pedidos"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ---------- Productos con menos stock ---------- */}
              <div className="analytics-card">
                <h3>Productos con menos stock</h3>
                <p className="analytics-sub">GET /api/analytics/productos-menos-stock</p>
                {errors.productosMenosStock ? (
                  <p className="analytics-error">No se pudo cargar esta consulta desde el MS5.</p>
                ) : (
                  <BarList
                    rows={data.productosMenosStock}
                    labelKey="nombre"
                    valueKey="stock_disponible"
                    color="var(--color-danger)"
                    suffix=" u."
                  />
                )}
              </div>

              {/* ---------- Productos por categoría ---------- */}
              <div className="analytics-card">
                <h3>Catálogo por categoría</h3>
                <p className="analytics-sub">GET /api/analytics/productos-por-categoria</p>
                {errors.productosPorCategoria ? (
                  <p className="analytics-error">No se pudo cargar esta consulta desde el MS5.</p>
                ) : (
                  <BarList
                    rows={productosPorCategoriaAgregado}
                    labelKey="categoria"
                    valueKey="total_productos"
                    color="var(--color-accent-dark)"
                    suffix=" productos"
                  />
                )}
              </div>

              {/* ---------- Reseñas ---------- */}
              <div className="analytics-card">
                <h3>Productos mejor calificados</h3>
                <p className="analytics-sub">GET /api/analytics/productos-mejores-resenas</p>
                {errors.productosMejoresResenas ? (
                  <p className="analytics-error">No se pudo cargar esta consulta desde el MS5.</p>
                ) : (
                  <DataTable rows={data.productosMejoresResenas} />
                )}
              </div>

              <div className="analytics-card">
                <h3>Productos peor calificados</h3>
                <p className="analytics-sub">GET /api/analytics/productos-peores-resenas</p>
                {errors.productosPeoresResenas ? (
                  <p className="analytics-error">No se pudo cargar esta consulta desde el MS5.</p>
                ) : (
                  <DataTable rows={data.productosPeoresResenas} />
                )}
              </div>

              {/* ---------- Clientes frecuentes ---------- */}
              <div className="analytics-card wide">
                <h3>Clientes frecuentes (más de 3 pedidos)</h3>
                <p className="analytics-sub">GET /api/analytics/clientes-frecuentes</p>
                {errors.clientesFrecuentes ? (
                  <p className="analytics-error">No se pudo cargar esta consulta desde el MS5.</p>
                ) : (
                  <DataTable
                    rows={data.clientesFrecuentes}
                    emptyLabel="Todavía no hay clientes con más de 3 pedidos."
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
