// ============================================================================
// SIMULACIÓN DE MS2 — Clientes / Pedidos / Pago
// ----------------------------------------------------------------------------
// El microservicio MS2 (SQL 2) todavía no ha sido implementado por el equipo,
// así que este módulo simula sus endpoints (mismo modelo de datos que el
// diagrama E/R del proyecto: Cliente, Pedido, Detalle_Pedido, Pago) usando
// localStorage como "base de datos" del navegador.
//
// Nada de esto toca a MS4 (orquestador): el checkout de este front llama
// directamente a este mock, tal como llamaría a MS2 real, sin pasar por un
// orquestador.
//
// Cuando el equipo despliegue el MS2 real, basta con:
//   1. Escribir un archivo src/api/ms2.ts con las mismas firmas de función,
//      pero usando `ms2Client` (ver src/api/client.ts) en vez de localStorage.
//   2. Cambiar VITE_USE_MOCK_MS2=false en .env y actualizar VITE_MS2_URL.
//   3. Cambiar el import en los componentes de `ms2.mock` a `ms2`.
// ============================================================================

import type {
  Cliente,
  ClienteConPassword,
  CrearPedidoPayload,
  DetallePedido,
  IniciarSesionPayload,
  Pago,
  Pedido,
  PedidoConDetalle,
  RegistrarClientePayload,
} from "../types";

interface MockDb {
  clientes: ClienteConPassword[];
  pedidos: Pedido[];
  detallesPedido: DetallePedido[];
  pagos: Pago[];
  nextId: number;
}

const DB_KEY = "ms2_mock_db_v1";
const SESSION_KEY = "ms2_mock_session_v1";
const LATENCY_MS = 250;

function wait(ms: number = LATENCY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readDb(): MockDb {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) return JSON.parse(raw) as MockDb;
  const seed: MockDb = { clientes: [], pedidos: [], detallesPedido: [], pagos: [], nextId: 1000 };
  localStorage.setItem(DB_KEY, JSON.stringify(seed));
  return seed;
}

function writeDb(db: MockDb): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function nextId(db: MockDb): number {
  db.nextId += 1;
  return db.nextId;
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

// ---------------------------------------------------------------------------
// Clientes
// ---------------------------------------------------------------------------

export async function registrarCliente({
  nombre,
  email,
  password,
  direccion = "",
  telefono = "",
}: RegistrarClientePayload): Promise<Cliente> {
  await wait();
  const db = readDb();
  if (db.clientes.some((c) => c.email.toLowerCase() === email.toLowerCase())) {
    throw new ApiError("Ya existe una cuenta registrada con ese correo.", 409);
  }
  const cliente: ClienteConPassword = {
    id: nextId(db),
    nombre,
    email,
    password, // demo únicamente — un MS2 real nunca guardaría esto en texto plano
    direccion,
    telefono,
    creado_en: new Date().toISOString(),
  };
  db.clientes.push(cliente);
  writeDb(db);
  return sanitizeCliente(cliente);
}

export async function iniciarSesion({ email, password }: IniciarSesionPayload): Promise<Cliente> {
  await wait();
  const db = readDb();
  const cliente = db.clientes.find((c) => c.email.toLowerCase() === email.toLowerCase());
  if (!cliente || cliente.password !== password) {
    throw new ApiError("Correo o contraseña incorrectos.", 401);
  }
  return sanitizeCliente(cliente);
}

export async function getClienteById(id: string | number): Promise<Cliente> {
  await wait(120);
  const db = readDb();
  const cliente = db.clientes.find((c) => String(c.id) === String(id));
  if (!cliente) throw new ApiError("Cliente no encontrado.", 404);
  return sanitizeCliente(cliente);
}

function sanitizeCliente(cliente: ClienteConPassword): Cliente {
  const { password, ...rest } = cliente;
  return rest;
}

// Sesión simulada guardada en localStorage (equivalente a un token JWT)
export function guardarSesion(cliente: Cliente): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(cliente));
}
export function obtenerSesion(): Cliente | null {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as Cliente) : null;
}
export function cerrarSesion(): void {
  localStorage.removeItem(SESSION_KEY);
}

// ---------------------------------------------------------------------------
// Pedidos + Detalle + Pago
// ---------------------------------------------------------------------------

const IMPUESTO_TASA = 0.18; // IGV Perú

// Crea un pedido (+ su detalle) a partir de los items de un carrito de MS3,
// y registra el pago asociado. Simula lo que MS2 haría al recibir la orden
// directamente desde el front (sin pasar por el orquestador MS4).
export async function crearPedidoDesdeCarrito({
  clienteId,
  items,
  metodoPago,
}: CrearPedidoPayload): Promise<PedidoConDetalle> {
  await wait(500);
  const db = readDb();

  const subTotal = items.reduce((sum, it) => sum + it.precioUnitario * it.cantidad, 0);
  const impuestos = Number((subTotal * IMPUESTO_TASA).toFixed(2));
  const total = Number((subTotal + impuestos).toFixed(2));

  const pedido: Pedido = {
    id: nextId(db),
    cliente_id: clienteId,
    fecha_pedido: new Date().toISOString(),
    estado: "pagado",
    sub_total: Number(subTotal.toFixed(2)),
    impuestos,
    total,
  };
  db.pedidos.push(pedido);

  items.forEach((it) => {
    db.detallesPedido.push({
      id: nextId(db),
      pedido_id: pedido.id,
      producto_id: it.idProducto,
      nombre_producto: it.nombre,
      precio_unitario: it.precioUnitario,
      cantidad: it.cantidad,
      sub_total: Number((it.precioUnitario * it.cantidad).toFixed(2)),
    });
  });

  const pago: Pago = {
    id: nextId(db),
    pedido_id: pedido.id,
    metodo_pago: metodoPago,
    monto: total,
    estado_pago: "aprobado",
    fecha_pago: new Date().toISOString(),
  };
  db.pagos.push(pago);

  writeDb(db);
  return { pedido, detalle: db.detallesPedido.filter((d) => d.pedido_id === pedido.id), pago };
}

export async function getPedidosByCliente(clienteId: string | number): Promise<Pedido[]> {
  await wait(200);
  const db = readDb();
  return db.pedidos
    .filter((p) => String(p.cliente_id) === String(clienteId))
    .sort((a, b) => new Date(b.fecha_pedido).getTime() - new Date(a.fecha_pedido).getTime());
}

export async function getPedidoById(pedidoId: string | number): Promise<PedidoConDetalle> {
  await wait(150);
  const db = readDb();
  const pedido = db.pedidos.find((p) => String(p.id) === String(pedidoId));
  if (!pedido) throw new ApiError("Pedido no encontrado.", 404);
  const detalle = db.detallesPedido.filter((d) => d.pedido_id === pedido.id);
  const pago = db.pagos.find((p) => p.pedido_id === pedido.id) || null;
  return { pedido, detalle, pago };
}
