import { matchesCatalogSection } from '../data/departments.js';
import { GENERAL_PROFILE, matchProfile, normalizeSearch, profileForProduct, profileForSection, profileHint, SPEC_FIELDS } from '../data/filterProfiles.js';
import { normalize } from './format.js';
import { formatSpecValue, productAttributes } from './productSpecs.js';

const searchText = new WeakMap();
const names = new Intl.Collator('es');
const optionOrder = new Intl.Collator('es', { numeric: true, sensitivity: 'base' });
const definitions = new Map(SPEC_FIELDS.map((definition) => [definition.key, definition]));
const profileDefinitions = new WeakMap();
const optionKey = (value) => normalize(value).trim();
const connectors = new Set(['de', 'del', 'para', 'con', 'en', 'el', 'la', 'los', 'las']);
const exactTechnicalTerm = /^(?:\d+(?:gb|tb|mhz|hz|bits|mm|rpm|dpi)|(?:rtx|gtx|rx|arc)[ab]?\d{3,4})$/;
const termsOf = (text) => text.replace(/\b(\d+)\s+(gb|tb|mhz|hz|bits|mm|rpm|dpi)\b/g, '$1$2')
  .replace(/\b(rtx|gtx|rx|arc)\s+([ab]?\d{3,4})\b/g, '$1$2').split(/\s+/).filter(Boolean);

export function catalogSearch(query, section) {
  const text = normalizeSearch(query);
  const scoped = profileForSection(section);
  const match = matchProfile(text);
  // Un modelo de GPU es una pista en el catálogo general. Dentro de otra
  // familia, como Notebooks, se conserva como una palabra clave.
  const hint = !scoped && profileHint(text, match);
  if (hint) return { profile: hint, terms: termsOf(text).filter((term) => !connectors.has(term)) };
  if (match && (!scoped || match.profile === scoped)) {
    const { profile, match: { index, 0: name } } = match;
    const terms = termsOf(text.slice(0, index) + ' ' + text.slice(index + name.length)).filter((term) => !connectors.has(term));
    return { profile, terms };
  }
  return { profile: null, terms: termsOf(text).filter((term) => !connectors.has(term)) };
}

export function catalogProfiles(products) {
  const counts = new Map();
  for (const product of products) {
    const profile = profileForProduct(product);
    counts.set(profile, (counts.get(profile) || 0) + 1);
  }
  return {
    inferred: counts.size === 1 ? counts.keys().next().value : GENERAL_PROFILE,
    choices: Array.from(counts, ([profile, count]) => ({ profile, count }))
      .filter(({ profile }) => profile !== GENERAL_PROFILE)
      .sort((a, b) => names.compare(a.profile.label, b.profile.label)),
  };
}

function searchable(product) {
  if (!searchText.has(product)) {
    const attributes = productAttributes(product);
    const specs = Object.entries(attributes).flatMap(([key, value]) => {
      if (value === undefined) return [];
      const definition = definitions.get(key);
      return (Array.isArray(value) ? value : [value]).flatMap((item) => [
        formatSpecValue(definition, item),
        ...(typeof item === 'number' && definition.unit ? [item + ' ' + (definition.unit === 'storage' ? 'GB' : definition.unit)] : []),
      ]);
    });
    const usage = attributes.ramFormat === 'DIMM' ? 'desktop escritorio udimm' :
      attributes.ramFormat === 'SO-DIMM' ? 'notebook portatil sodimm' : '';
    const name = product.catalogoDemo ? product.nombre.split(' (')[0] : product.nombre;
    const keywords = [attributes.ramType && 'ram', attributes.vramGb && 'vram gpu',
      attributes.cpuModel && 'procesador', attributes.panel && 'pantalla'].filter(Boolean);
    const text = normalizeSearch([name, product.tipo, product.vendedor, usage, ...keywords,
      ...specs, ...(!product.catalogoDemo ? [product.descripcion, product.fichaTecnica] : [])].join(' '));
    searchText.set(product, { text, compact: text.replace(/\s+/g, ''), technical: new Set(termsOf(text).filter((term) => exactTechnicalTerm.test(term))) });
  }
  return searchText.get(product);
}

export function filterCatalog(products, { query = '', category = 'all', maxPrice = Infinity, sort, favorites, section, search = catalogSearch(query, section) }) {
  const { terms, profile } = search;
  const result = products.filter((product) =>
    (!favorites || favorites.has(product.id)) &&
    (category === 'all' || product.categoria === category) &&
    product.precio <= maxPrice &&
    (!profile || profileForProduct(product) === profile) &&
    matchesCatalogSection(product, section) &&
    (!terms.length || terms.every((term) => {
      const { text, compact, technical } = searchable(product);
      return exactTechnicalTerm.test(term) ? technical.has(term) : text.includes(term) || compact.includes(term);
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
export function facetCatalog(candidates, selections, fields = SPEC_FIELDS) {
  if (!profileDefinitions.has(fields)) profileDefinitions.set(fields, new Map(fields.map((definition) => [definition.key, definition])));
  const allowed = profileDefinitions.get(fields);
  const active = Object.entries(selections).filter(([key, value]) => allowed.has(key) && value !== '').map(([key, value]) => [allowed.get(key), value]);
  const buckets = new Map();
  const results = [];
  productLoop:
  for (const product of candidates) {
    const attributes = productAttributes(product);
    let failedKey = null;
    for (const [definition, value] of active) {
      const { key, source } = definition;
      if (matchesFacet(attributes[source || key], definition, value)) continue;
      if (failedKey !== null) continue productLoop;
      failedKey = key;
    }
    if (failedKey === null) results.push(product);
    for (const { key, source } of fields) {
      const value = attributes[source || key];
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
  for (const definition of fields) {
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

export function activeFacetLabels(selections, fields = SPEC_FIELDS) {
  return fields.filter(({ key }) => selections[key]).map((definition) => ({
    key: definition.key,
    label: definition.label + ': ' + formatSpecValue(definition, selections[definition.key]),
  }));
}
