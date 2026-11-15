import { profileForProduct, profileForId } from '../data/filterProfiles.js';
import { formatSpecValue, productAttributes } from './productSpecs.js';

export function describeProduct({ name, description, profileId, brand, series, text }) {
  const declared = profileForId(profileId);
  const source = { nombre: name, descripcion: description, marca: brand, linea: series, tipo: declared?.label, perfilTecnico: declared?.id, fichaTecnica: text };
  const values = Object.fromEntries(Object.entries(productAttributes(source)).filter(([, v]) => v !== undefined));
  const profile = declared?.id ?? profileForProduct(source).id;
  return profile === 'general' && !text && !Object.keys(values).length ? null : { profile, text, values };
}

export function demoFilterSource(product) {
  return {
    ...product, nombre: product.name, precio: product.price, categoria: product.category,
    tipo: [product.subcategory, product.category].filter(Boolean).join(' '),
    descripcion: product.description, fichaTecnica: (product.specs || []).join('; '),
  };
}

export function optionsFromApi(fields, rows, selections) {
  const options = {};
  for (const field of fields) {
    const values = new Set(rows.filter(({ key }) => key === (field.source || field.key)).map(({ value }) => String(value)));
    const currentlySelected = selections[field.key];
    if (currentlySelected) values.add(currentlySelected);
    if (!values.size) continue;
    options[field.key] = [...values].sort((a, b) => field.mode === 'exact'
      ? a.localeCompare(b, 'es', { numeric: true })
      : Number(a) - Number(b)).map(value => ({ value, label: formatSpecValue(field, value) }));
  }
  return options;
}
