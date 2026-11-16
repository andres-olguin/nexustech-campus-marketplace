import assert from "node:assert/strict";
import test from "node:test";
import { part1Products } from "../src/data/catalogPart1.js";
import { part2Products } from "../src/data/catalogPart2.js";
import { part3Products } from "../src/data/catalogPart3.js";
import { syntheticReviewsForProduct } from "../src/data/syntheticReviews.js";
import { photoUrlForKey } from "../src/data/photoCatalog.js";
const all = [...part1Products,...part2Products,...part3Products];
test("240 productos tienen foto de origen web y al menos dos reseñas simuladas",()=>{
  assert.equal(all.length,240);
  for(const product of all){
    assert.match(photoUrlForKey(product.imgKey),/^https:\/\/images\.unsplash\.com\/photo-/);
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
