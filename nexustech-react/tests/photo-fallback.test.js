import assert from "node:assert/strict";
import test from "node:test";
import { uniquePhotoForItem } from "../src/data/photoCatalog.js";
import { fallbackArtworkForProduct, productVisualKind } from "../src/data/productVisualFallback.js";

test("El respaldo reconoce tipos de productos que antes mostraban fotos equivocadas", () => {
  const cases = [
    ["Mochila para notebook demo", "bag"],
    ["Soporte de notebook demo", "stand"],
    ["Impresora 3D compacta demo", "printer3d"],
    ["Webcam USB 1080p demo", "webcam"],
    ["Microfono USB demo", "microphone"],
    ["Router WiFi 6 demo", "router"],
    ["Switch de red 8 puertos demo", "switch"],
    ["Memoria RAM DDR4 16 GB demo", "ram"],
    ["Monitor ultrawide 34 pulgadas demo", "monitor"],
    ["Tablet 10 pulgadas demo", "tablet"],
  ];
  for (const [name, type] of cases) assert.equal(productVisualKind(name), type, name);
});

test("Respaldos distintos por publicación e identificables como SVG local", () => {
  const a = fallbackArtworkForProduct("Mochila para notebook demo", "producto-1");
  const b = fallbackArtworkForProduct("Soporte de notebook demo", "producto-2");
  const c = fallbackArtworkForProduct("Mochila para notebook demo", "producto-3");
  assert.match(a, /^data:image\/svg\+xml;charset=utf-8,/);
  assert.notEqual(a, b);
  assert.notEqual(a, c);
  const xml = decodeURIComponent(a.split(",")[1]);
  assert.match(xml, /MOCHILA/);
  assert.match(xml, /Mochila para notebook demo/);
  const safeSvg = decodeURIComponent(fallbackArtworkForProduct("<script>alert(1)</script>").split(",")[1]);
  assert.doesNotMatch(safeSvg, /<script>/);
  assert.match(safeSvg, /&lt;script&gt;/);
});

test("Las publicaciones SQL nunca reciben la misma URL de foto", () => {
  const names = [
    "Mochila para notebook demo", "Soporte de notebook demo",
    "Memoria RAM demo 8 GB", "Memoria RAM demo 16 GB",
    "Router WiFi 6 demo", "Switch de red 8 puertos demo",
    "Kit de red Ethernet demo", "Adaptador de red USB demo",
    "Monitor 24 pulgadas IPS demo", "Monitor ultrawide 34 pulgadas demo",
    "Impresora 3D compacta demo", "Microfono USB demo",
    "Webcam USB 1080p demo", "Cargador USB-C 65W demo",
  ];
  const used = new Set();
  const results = names.map(name => uniquePhotoForItem({ name }, used));
  const urls = results.filter(Boolean);
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(results.every(url => !url || url.startsWith("https://images.unsplash.com/")));
  // El cupo temático se agota: no asignar una foto no relacionada.
  assert.ok(uniquePhotoForItem({ name: "Mochila para notebook demo" }, new Set([
    "https://images.unsplash.com/photo-1535982330050-f1c2fb79ff78?w=500&q=78",
    "https://images.unsplash.com/photo-1668114844900-537ab91478b9?w=500&q=78",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80",
  ])) === null);
});
