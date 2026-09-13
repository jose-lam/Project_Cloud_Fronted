import { getProducts } from "../api/ms1";
import type { Category } from "../types";

// ============================================================================
// El MS1 tiene 248 categorías cargadas, pero el catálogo de productos
// (19,999 productos) sólo tiene asignadas categorías reales a un subconjunto
// pequeño de ellas — el resto existe en la tabla de categorías pero no tiene
// ni un producto vinculado todavía (hueco de datos en el seed del MS1, no un
// error del front). Golpear /ms1/products/category/{id} para cada una de las
// 248 categorías sólo para descubrir cuáles tienen stock sería carísimo, así
// que en su lugar muestreamos unas cuantas páginas del listado general de
// productos (que sí trae `category` embebido en cada item) y con eso
// derivamos qué categorías vale la pena mostrar en Home/Header.
// ============================================================================

const SAMPLE_PAGES = [1, 60, 120, 180, 260, 340, 420, 520, 620, 740, 860, 960];
const PAGE_LIMIT = 50;

let cache: Category[] | null = null;
let inflight: Promise<Category[]> | null = null;

export function getPopulatedCategories(): Promise<Category[]> {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;

  inflight = (async () => {
    const counts = new Map<number, { category: Category; count: number }>();
    const settled = await Promise.allSettled(
      SAMPLE_PAGES.map((page) => getProducts({ page, limit: PAGE_LIMIT }))
    );

    for (const res of settled) {
      if (res.status !== "fulfilled") continue;
      for (const product of res.value.data) {
        const cat = product.category;
        if (!cat) continue;
        const entry = counts.get(cat.category_id);
        if (entry) entry.count += 1;
        else counts.set(cat.category_id, { category: cat, count: 1 });
      }
    }

    const sorted = [...counts.values()].sort((a, b) => b.count - a.count).map((e) => e.category);
    cache = sorted;
    inflight = null;
    return sorted;
  })();

  return inflight;
}