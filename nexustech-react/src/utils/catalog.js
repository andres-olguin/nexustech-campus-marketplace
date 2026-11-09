import { normalize } from './format.js';

const searchText = new WeakMap();
const names = new Intl.Collator('es');

function searchable(product) {
  if (!searchText.has(product)) {
    searchText.set(product, normalize([product.nombre, product.descripcion, product.vendedor].join(' ')));
  }
  return searchText.get(product);
}

export function filterCatalog(products, { query, category, maxPrice, sort, favorites }) {
  const term = normalize(query.trim());
  const result = products.filter((product) =>
    (!favorites || favorites.has(product.id)) &&
    (category === 'all' || product.categoria === category) &&
    product.precio <= maxPrice &&
    (!term || searchable(product).includes(term))
  );
  if (sort === 'low') result.sort((a, b) => a.precio - b.precio);
  if (sort === 'high') result.sort((a, b) => b.precio - a.precio);
  if (sort === 'name') result.sort((a, b) => names.compare(a.nombre, b.nombre));
  return result;
}
