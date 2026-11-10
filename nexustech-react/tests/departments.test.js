import assert from 'node:assert/strict';
import test from 'node:test';
import { catalogHref, getCatalogSection, matchesCatalogSection } from '../src/data/departments.js';
import { filterCatalog } from '../src/utils/catalog.js';

const product = (id, nombre, tipo, details = {}) => ({ id, nombre, tipo, precio: 150000, ...details });
const matches = (p, path) => matchesCatalogSection(p, getCatalogSection(path));
const search = { query: '', category: 'all', maxPrice: 2500000, sort: 'default' };

test('el enlace a una subcategoría identifica su ruta completa en el catálogo', () => {
  const path = 'computacion/teclados/mecanicos';
  const url = new URL(catalogHref(path), 'https://example.test');
  const section = getCatalogSection(new URLSearchParams(url.hash.split('?')[1]).get('seccion'));
  assert.deepEqual(section.trail.map(({ label }) => label), ['Computación', 'Teclados', 'Mecánicos']);
  assert.equal(getCatalogSection('computacion/otra-categoria'), null);
});

test('el filtro de familia distingue componentes y equipos que los incluyen', () => {
  const laptop = product('a', 'Lenovo ThinkPad RTX 4060', 'Notebook', { fichaTecnica: 'RTX 4060, SSD 1 TB' });
  const gpu = product('b', 'NVIDIA GeForce RTX 4060', 'Tarjeta gráfica');
  const ssd = product('c', 'SSD Samsung 1 TB', 'Unidad NVMe');
  const phone = product('d', 'Galaxy S25', 'Celular', { marca: 'Samsung' });
  assert.equal(matches(laptop, 'tecnologia/notebooks/gamer'), true);
  assert.equal(matches(laptop, 'computacion/graficas/nvidia'), false);
  assert.equal(matches(gpu, 'computacion/graficas/nvidia'), true);
  assert.equal(matches(ssd, 'computacion/ssd/m2-nvme'), true);
  assert.equal(matches(ssd, 'tecnologia/celulares/samsung'), false);
  assert.equal(matches(phone, 'tecnologia/celulares/samsung'), true);
});

test('una subcategoría combina la familia, las especificaciones y el presupuesto', () => {
  const monitor = product('a', 'Monitor IPS 165 Hz', 'Monitor', { fichaTecnica: 'IPS 165 Hz', precio: 100000 });
  const slower = product('b', 'Monitor IPS 120 Hz', 'Monitor', { fichaTecnica: 'IPS 120 Hz', precio: 70000 });
  const headphones = product('c', 'Audífonos Monitores DAC', 'Audífonos Monitores DAC');
  const section = getCatalogSection('computacion/monitores/144hz');
  const products = [monitor, slower, headphones];
  assert.deepEqual(filterCatalog(products, { ...search, section, query: 'ips' }).map(({ id }) => id), ['a']);
  assert.deepEqual(filterCatalog(products, { ...search, section, maxPrice: 90000 }), []);
  assert.equal(matches(headphones, 'computacion/monitores'), false);
});

test('una sección vacía empieza a mostrar una publicación que coincide con su tipo', () => {
  const section = getCatalogSection('electrohogar/refrigeradores/top-freezer');
  const laptop = product('a', 'Notebook de ejemplo', 'Notebook');
  const fridge = product('b', 'Refrigerador de prueba', 'Refrigerador Top Freezer');
  const products = [laptop, fridge];
  assert.deepEqual(filterCatalog([laptop], { ...search, section }), []);
  assert.deepEqual(filterCatalog(products, { ...search, section }).map(({ id }) => id), ['b']);
  assert.equal(matches(fridge, 'electrohogar/refrigeradores/freezer'), false);
});
