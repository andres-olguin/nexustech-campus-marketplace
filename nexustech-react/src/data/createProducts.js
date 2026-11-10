import { getDemoCatalog } from "./demoCatalog.js";

// Catálogo curado de 48 productos tecnológicos de demostración para UNAB Sede Viña del Mar.
// Sustituye la combinatoria repetitiva de 2.400 ítems por variedad realista y específica.
// Nota: nombres, precios, stock y reseñas de ejemplo son únicamente demostrativos.
export function createProducts() {
  return getDemoCatalog().map((p) => ({
    id: p.id,
    nombre: p.name,
    categoria: p.category,
    estado: p.condition,
    precio: p.price,
    stock: p.stock,
    imagen: p.imageUrl,
    descripcion: p.description,
    caracteristicas: p.specs,
    vendedor: p.sellerLabel,
    reseñas: p.reviews,
    isDemo: true,
  }));
}
