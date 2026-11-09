import { normalize } from './format.js';
import { formatSpecValue, productAttributes, SPEC_FIELDS } from './productSpecs.js';

const searchText = new WeakMap();
const names = new Intl.Collator('es');
const optionOrder = new Intl.Collator('es', { numeric: true, sensitivity: 'base' });
const definitions = new Map(SPEC_FIELDS.map((definition) => [definition.key, definition]));
const optionKey = (value) => normalize(value).trim();

function searchable(product) {
  if (!searchText.has(product)) {
    const kind = normalize(product.tipo || product.nombre);
    const aliases = /\b(laptop|notebook|portatil|workstation movil)\b/.test(kind)
      ? 'laptop laptops notebook notebooks portatil portatiles' : kind.includes('monitor') ? 'monitor monitores pantalla' : '';
    const attributes = Object.values(productAttributes(product)).filter((value) => value !== undefined);
    const text = normalize([product.nombre, product.descripcion, product.vendedor, product.fichaTecnica, aliases, ...attributes].join(' '));
    searchText.set(product, { text, compact: text.replace(/\s+/g, '') });
  }
  return searchText.get(product);
}

export function filterCatalog(products, { query, category, maxPrice, sort, favorites }) {
  const terms = normalize(query.trim()).split(/\s+/).filter(Boolean);
  const result = products.filter((product) =>
    (!favorites || favorites.has(product.id)) &&
    (category === 'all' || product.categoria === category) &&
    product.precio <= maxPrice &&
    (!terms.length || terms.every((term) => {
      const { text, compact } = searchable(product);
      return text.includes(term) || compact.includes(term);
    }))
  );
  if (sort === 'low') result.sort((a, b) => a.precio - b.precio);
  if (sort === 'high') result.sort((a, b) => b.precio - a.precio);
  if (sort === 'name') result.sort((a, b) => names.compare(a.nombre, b.nombre));
  return result;
}

function matchesFacet(actual, definition, selected) {
  if (actual === undefined) return false;
  if (definition.mode === 'min') return typeof actual === 'number' && actual >= Number(selected);
  if (definition.mode === 'max') return typeof actual === 'number' && actual <= Number(selected);
  return (Array.isArray(actual) ? actual : [actual]).some((value) => optionKey(value) === optionKey(selected));
}

// Cada selector cuenta coincidencias respetando los demás filtros. Su propio
// valor no restringe las alternativas, así se puede cambiar sin limpiar todo.
export function facetCatalog(candidates, selections) {
  const active = Object.entries(selections).filter(([key, value]) => definitions.has(key) && value !== '');
  const buckets = new Map();
  const results = [];
  productLoop:
  for (const product of candidates) {
    const attributes = productAttributes(product);
    let failedKey = null;
    for (const [key, value] of active) {
      if (matchesFacet(attributes[key], definitions.get(key), value)) continue;
      if (failedKey !== null) continue productLoop;
      failedKey = key;
    }
    if (failedKey === null) results.push(product);
    for (const [key, value] of Object.entries(attributes)) {
      if (value === undefined || failedKey !== null && failedKey !== key) continue;
      if (!buckets.has(key)) buckets.set(key, new Map());
      const bucket = buckets.get(key);
      for (const item of Array.isArray(value) ? value : [value]) {
        const normalized = optionKey(item);
        const existing = bucket.get(normalized);
        if (existing) existing.count += 1;
        else bucket.set(normalized, { value: String(item), count: 1 });
      }
    }
  }

  const options = {};
  for (const definition of SPEC_FIELDS) {
    const { key, mode } = definition;
    const bucket = buckets.get(key) || new Map();
    const selected = selections[key];
    if (selected) {
      const normalized = optionKey(selected);
      if (bucket.has(normalized)) bucket.get(normalized).value = selected;
      else bucket.set(normalized, { value: selected, count: 0 });
    }
    const choices = Array.from(bucket.values());
    if (mode === 'exact') choices.sort((a, b) => optionOrder.compare(a.value, b.value));
    else {
      const direction = mode === 'min' ? -1 : 1;
      choices.sort((a, b) => direction * (Number(a.value) - Number(b.value)));
      let total = 0;
      for (const choice of choices) { total += choice.count; choice.count = total; }
      if (mode === 'min') choices.reverse();
    }
    if (choices.length) options[key] = choices.map((choice) => ({ ...choice, label: formatSpecValue(definition, choice.value) }));
  }
  return { results, options };
}

export function activeFacetLabels(selections) {
  return SPEC_FIELDS.filter(({ key }) => selections[key]).map((definition) => ({
    key: definition.key,
    label: definition.label + ': ' + formatSpecValue(definition, selections[definition.key]),
  }));
}
