import assert from "node:assert/strict";
import test from "node:test";
import { part1Products } from "../src/data/catalogPart1.js";
import { part2Products } from "../src/data/catalogPart2.js";
import { part3Products } from "../src/data/catalogPart3.js";
import { syntheticReviewsForProduct } from "../src/data/syntheticReviews.js";
import { photoUrlForItem } from "../src/data/photoCatalog.js";
const all = [...part1Products,...part2Products,...part3Products];
test("240 productos tienen foto de origen web y al menos dos reseñas simuladas",()=>{
  assert.equal(all.length,240);
  const recent=[];
  for(const [i,product] of all.entries()){
    const url=photoUrlForItem(product,i,recent);
    assert.equal(recent.includes(url),false,product.name);
    recent.push(url);if(recent.length>6)recent.shift();
    assert.match(url,/^https:\/\/images\.unsplash\.com\/photo-/);
    const reviews = syntheticReviewsForProduct(product,2);
    assert.ok(reviews.length>=2,product.id);
    assert.ok(reviews.every(x=>x.isDemo===true),product.id);
    assert.ok(reviews.every(x=>typeof x.comment==="string"&&x.comment.length>50),product.id);
  }
});
test("No se reutilizan identificadores de reseñas entre productos",()=>{
 const ids=all.flatMap(p=>syntheticReviewsForProduct(p,2).map(r=>r.id));
 assert.equal(new Set(ids).size,ids.length);
});

test("Las 24 publicaciones iniciales no repiten imágenes juntas",()=>{
 const names=["Memoria RAM demo 8 GB","Memoria RAM demo 16 GB","Tarjeta de video demo RTX 4060","SSD NVMe 1 TB demo","Procesador Ryzen 5 demo","Placa madre B550 demo","Teclado mecanico demo","Mouse inalambrico demo","Audifonos Bluetooth demo","Webcam USB 1080p demo","Microfono USB demo","Impresora 3D compacta demo","Notebook 14 pulgadas demo","Monitor 24 pulgadas IPS demo","Monitor ultrawide 34 pulgadas demo","Tablet 10 pulgadas demo","Router WiFi 6 demo","Switch de red 8 puertos demo","Kit de red Ethernet demo","Adaptador de red USB demo","Powerbank 20000 mAh demo","Cargador USB-C 65W demo","Soporte de notebook demo","Mochila para notebook demo"];
 const recent=[];
 for(const [i,name] of names.entries()){
  const photo=photoUrlForItem({name},i,recent);
  assert.equal(recent.includes(photo),false,name);
  recent.push(photo);if(recent.length>6)recent.shift();
 }
});
