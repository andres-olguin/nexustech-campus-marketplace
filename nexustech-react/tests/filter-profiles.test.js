import assert from 'node:assert/strict';
import test from 'node:test';
import { getCatalogSection } from '../src/data/departments.js';
import { demoComponentSpecs } from '../src/data/demoComponentSpecs.js';
import { profileForSection } from '../src/data/filterProfiles.js';
import { catalogProfiles, catalogSearch, facetCatalog, filterCatalog } from '../src/utils/catalog.js';
import { productAttributes } from '../src/utils/productSpecs.js';

const desktopSection = getCatalogSection('computacion/ram/ddr4-desktop');
const gpuSection = getCatalogSection('computacion/graficas/nvidia');
const product = (id, tipo, fichaTecnica, props = {}) => ({ id, tipo, nombre: tipo, fichaTecnica, precio: 75000, ...props });
const demo = (id, type, variant) => {
  const { specs, title } = demoComponentSpecs(type, variant);
  return product(id, type, title, { catalogoDemo: true, nombre: type + ' (' + title + ')', especificaciones: specs });
};
const ram = (id, n) => demo(id, 'Kit Memoria RAM Dual Channel', n);
const gpu = (id, n) => demo(id, 'Tarjeta Gráfica GPU', n);
const ids = (list) => list.map(({ id }) => id);

test('DDR4 Desktop ofrece capacidades y velocidades de sus DIMM, no de los SO-DIMM', () => {
  const candidates = filterCatalog([ram('8', 0), ram('16', 1), ram('32', 2), ram('sodimm', 5), ram('ddr5', 6)],
    { section: desktopSection });
  const fields = profileForSection(desktopSection).fields;
  const { options, results } = facetCatalog(candidates, { ramSpeed: '3200', ramVoltage: '1.35' }, fields);
  assert.deepEqual(ids(candidates), ['8', '16', '32']);
  assert.deepEqual(ids(results), ['16', '32']);
  assert.deepEqual(options.ramCapacity.map(({ value }) => value), ['16', '32']);
  assert.deepEqual(options.ramFormat.map(({ value }) => value), ['DIMM']);
  assert.equal(options.vramGb, undefined);
  assert.deepEqual(ids(facetCatalog(candidates, { ramCapacity: '16' }, fields).results), ['16']);
});

test('NVIDIA combina modelo, VRAM y largo máximo solo entre tarjetas de video', () => {
  const notebook = product('portátil', 'Notebook', 'RTX 4060 8 GB, 32 GB DDR5');
  const candidates = filterCatalog([gpu('3060', 1), gpu('4060', 2), gpu('4080', 3), gpu('amd', 5), notebook],
    { section: gpuSection });
  const { options, results } = facetCatalog(candidates, { vramGb: '8', gpuLength: '242' }, profileForSection(gpuSection).fields);
  assert.deepEqual(ids(results), ['3060', '4060']);
  assert.deepEqual(options.vramBusBits.map(({ value }) => value), ['128', '192']);
  assert.deepEqual(options.pcieVersion.map(({ value }) => value), ['PCIe 4.0']);
  assert.equal(options.ramGb, undefined);
  assert.equal(options.gpuBenchmark, undefined);
});

test('el texto reconoce la familia y no confunde 16 GB con otros números de la ficha', () => {
  const notebook = product('notebook', 'Notebook', 'RTX 4060 8 GB y 16 GB RAM DDR4');
  const service = product('web', 'Landing Page', '32 GB RAM / 1 TB NVMe', {
    catalogoDemo: true, nombre: 'Landing Page (32 GB RAM / 1 TB NVMe)',
  });
  const candidates = [ram('8', 0), ram('16', 1), ram('32', 2), ram('sodimm', 5), gpu('gpu', 2), notebook, service];
  assert.deepEqual(ids(filterCatalog(candidates, { query: 'RAM' })), ['8', '16', '32', 'sodimm']);
  assert.deepEqual(ids(filterCatalog(candidates, { query: 'memoria RAM DDR4 escritorio 16 GB' })), ['16']);
  assert.deepEqual(ids(filterCatalog(candidates, { query: 'DDR4 notebook 16 GB' })), ['sodimm']);
  assert.deepEqual(ids(filterCatalog(candidates, { query: 'RTX4060' })), ['gpu']);
  assert.deepEqual(ids(filterCatalog(candidates, { query: 'notebook RTX 4060' })), ['notebook']);
  assert.equal(catalogSearch('monitor').profile.id, 'monitor');
  assert.equal(catalogProfiles(candidates).inferred.id, 'general');
  assert.equal(catalogProfiles([notebook]).inferred.id, 'notebook');
});

test('los datos de una publicación alimentan sus filtros sin completar especificaciones desconocidas', () => {
  const memory = product('a', 'Memoria RAM', '2×8 GB DDR4 SO-DIMM, 3200 MT/s, 1600 MHz, 1,2 V, CL22, ECC: no');
  const attributes = productAttributes(memory);
  assert.deepEqual(
    [attributes.ramGb, attributes.ramFormat, attributes.ramSpeed, attributes.ramClock, attributes.ramVoltage, attributes.ramCl, attributes.ramEcc],
    [16, 'SO-DIMM', 3200, 1600, 1.2, 22, 'No'],
  );
  assert.equal(attributes.ramHeatsink, undefined);
  const card = product('b', 'Tarjeta de video', 'RTX 5070, VRAM: 12 GB GDDR7, bus de memoria: 192 bits, PCIe 5.0 x16, largo: 250 mm, RGB: no');
  const v = productAttributes(card);
  assert.deepEqual([v.gpuBrand, v.gpuModel, v.vramGb, v.vramType, v.vramBusBits, v.pcieVersion, v.pcieLanes, v.gpuLength, v.rgb],
    ['NVIDIA', 'RTX 5070', 12, 'GDDR7', 192, 'PCIe 5.0', 16, 250, 'No']);
  assert.equal(v.ramGb, undefined);
});

test('una consulta dentro de notebooks puede buscar sus componentes sin cambiar de familia', () => {
  const section = getCatalogSection('tecnologia/notebooks');
  const notebook = product('notebook', 'Notebook', '16 GB RAM DDR4, RTX 4060 8 GB');
  const candidates = [notebook, ram('16', 1), gpu('gpu', 2)];
  assert.deepEqual(ids(filterCatalog(candidates, { section, query: 'RTX 4060' })), ['notebook']);
  assert.deepEqual(ids(filterCatalog(candidates, { section, query: 'RAM DDR4' })), ['notebook']);
});
