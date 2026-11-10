import assert from 'node:assert/strict';
import test from 'node:test';
import { facetCatalog, filterCatalog } from '../src/utils/catalog.js';
import { productAttributes } from '../src/utils/productSpecs.js';

const product = (id, name, fichaTecnica, marca = 'Lenovo') => ({
  id, nombre: name, marca, fichaTecnica, tipo: 'Laptop Ultrabook', categoria: 'Workstations', precio: 950000,
});

test('la ficha separa RAM de memoria de video y reconoce capacidades y pantalla', () => {
  const specs = productAttributes(product('a', 'Equipo de prueba',
    'Intel Core i7-13700H, 16 GB RAM DDR5, RTX 4060 8 GB, SSD 512 GB, IPS 15,6 pulgadas 1920x1080 144 Hz, Windows 11 Pro, HDMI, USB-C'));
  assert.equal(specs.cpuModel, 'Core i7 13700H');
  assert.equal(specs.ramGb, 16);
  assert.equal(specs.ramType, 'DDR5');
  assert.equal(specs.vramGb, 8);
  assert.equal(specs.gpuModel, 'RTX 4060');
  assert.equal(specs.storageGb, 512);
  assert.equal(specs.displayInches, 15.6);
  assert.equal(specs.resolution, 1080);
  assert.equal(specs.refreshHz, 144);
  assert.equal(specs.osVersion, 'Windows 11 Pro');
  assert.deepEqual(specs.ports, ['USB-C', 'HDMI']);
});

test('un periférico de ejemplo no hereda la RAM ni la GPU de una ficha genérica', () => {
  const keyboard = { catalogoDemo: true, nombre: 'Teclado demo', categoria: 'Periféricos',
    tipo: 'Teclado Mecánico Custom', fichaTecnica: '64GB DDR5 / RTX 4080 16GB', marca: 'Logitech' };
  const { options } = facetCatalog([keyboard], {});
  assert.deepEqual(Object.keys(options), ['brand', 'kind']);
});

test('los filtros ofrecen alternativas compatibles y cuentan correctamente los mínimos', () => {
  const products = [
    product('a', 'Equipo 1', '16 GB RAM DDR5, 512GB SSD'),
    product('b', 'Equipo 2', '32 GB RAM DDR5, 1TB NVMe'),
    product('c', 'Equipo 3', '8 GB RAM DDR4, 1TB HDD', 'ASUS'),
    product('d', 'Equipo sin RAM declarada', '512GB SSD'),
  ];
  const { results, options } = facetCatalog(products, { brand: 'Lenovo', ramGb: '16' });
  assert.deepEqual(results.map(({ id }) => id), ['a', 'b']);
  assert.deepEqual(options.ramGb.map(({ value, count }) => [value, count]), [['16', 2], ['32', 1]]);
  assert.deepEqual(options.ramType.map(({ value }) => value), ['DDR5']);
  assert.deepEqual(options.storageGb.map(({ label }) => label), ['512 GB', '1 TB']);
});

test('una búsqueda de notebook reconoce los portátiles y conserva el orden por precio', () => {
  const laptop = product('a', 'Lenovo Ultrabook', '16 GB RAM DDR5, RTX 4060');
  const other = { ...laptop, id: 'b', nombre: 'Equipo RTX', tipo: 'Tarjeta gráfica', categoria: 'Hardware' };
  const cheaper = { ...laptop, id: 'c', precio: 850000 };
  const matches = filterCatalog([laptop, other, cheaper], { query: 'notebook rtx4060', category: 'all', maxPrice: 2500000, sort: 'low' });
  assert.deepEqual(matches.map(({ id }) => id), ['c', 'a']);
});

test('un filtro que ya no coincide sigue disponible para quitarlo', () => {
  const { results, options } = facetCatalog([], { ramGb: '16' });
  assert.deepEqual(results, []);
  assert.deepEqual(options.ramGb, [{ value: '16', count: 0, label: '16 GB' }]);
});
