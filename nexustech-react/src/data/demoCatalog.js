import { illustrations, localProductImage } from "./imageAssets.js";
import { part1Products } from "./catalogPart1.js";
import { part2Products } from "./catalogPart2.js";
import { part3Products } from "./catalogPart3.js";

const PHOTO_URLS = {
  laptopPro: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
  laptopDark: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&q=80",
  ultrabook: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80",
  laptopSilver: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80",
  laptopDev: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500&q=80",
  miniPc: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&q=80",
  gpuRig: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&q=80",
  cpuChip: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&q=80",
  ssdStorage: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&q=80",
  ramModules: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&q=80",
  rackServer: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80",
  networkSwitch: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&q=80",
  motherboard: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80",
  headphones: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
  keyboard: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80",
  monitor: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80",
  mouse: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80",
  microphone: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80",
  analytics: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80",
  tabletWeb: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80",
  tabletTouch: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&q=80",
};

function resolveAsset(imgKey) {
  if (illustrations[imgKey]) {
    return { url: illustrations[imgKey], isIllustration: true };
  }
  const photoUrl = PHOTO_URLS[imgKey];
  return {
    url: localProductImage(photoUrl),
    isIllustration: false,
  };
}

export const DEMO_CATEGORIES = [
  "Notebooks",
  "Computadores",
  "Componentes",
  "Almacenamiento",
  "Monitores",
  "Periféricos",
  "Audio",
  "Smartphones",
  "Tablets",
  "Redes",
  "Impresoras",
  "Accesorios",
];

const allRaw = [...part1Products, ...part2Products, ...part3Products];

export function getDemoCatalog() {
  return allRaw.map((item, idx) => {
    const asset = resolveAsset(item.imgKey);
    return {
      ...item,
      orderIndex: idx,
      imageUrl: asset.url,
      isIllustration: asset.isIllustration,
      isActive: true,
      isDemo: true,
      sellerId: "00000000-0000-4000-8000-000000000000",
      sellerLabel: "Catálogo de demostración · Viña del Mar",
      createdAt: "2026-11-01T12:00:00.000Z",
      updatedAt: "2026-11-09T12:00:00.000Z",
    };
  });
}
