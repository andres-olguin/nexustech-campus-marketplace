import { localProductImage, placeholder } from "./imageAssets.js";
import { photoUrlForItem } from "./photoCatalog.js";
import { syntheticReviewsForProduct } from "./syntheticReviews.js";
import { part1Products } from "./catalogPart1.js";
import { part2Products } from "./catalogPart2.js";
import { part3Products } from "./catalogPart3.js";

export const DEMO_CATEGORIES = [
  "Notebooks", "Computadores", "Componentes", "Almacenamiento",
  "Monitores", "Periféricos", "Audio", "Smartphones",
  "Tablets", "Redes", "Impresoras", "Accesorios",
];
const allRaw = [...part1Products, ...part2Products, ...part3Products];
export function getDemoCatalog() {
  const recent=[];
  return allRaw.map((item, idx) => {
    const image=photoUrlForItem(item, idx, recent);
    recent.push(image);
    if(recent.length>6)recent.shift();
    return {
    ...item,
    orderIndex: idx,
    imageUrl: localProductImage(image)===placeholder ? image : localProductImage(image),
    isIllustration: false,
    reviews: syntheticReviewsForProduct(item, 2),
    isActive: true,
    isDemo: true,
    sellerId: "00000000-0000-4000-8000-000000000000",
    sellerLabel: "Catálogo ficticio · Viña del Mar",
    createdAt: "2026-11-01T12:00:00.000Z",
    updatedAt: "2026-11-09T12:00:00.000Z",
    };
  });
}
