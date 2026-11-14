import assert from 'node:assert/strict';
import test from 'node:test';
import { filterCatalog } from '../src/utils/catalog.js';

test('la búsqueda sin tildes combina presupuesto, categoría y favoritos', () => {
  const products = [
    { id: 'a', nombre: 'Ratón óptico', precio: 25000, categoria: 'Periféricos' },
    { id: 'b', nombre: 'Ratón ergonómico', precio: 45000, categoria: 'Periféricos' },
    { id: 'c', nombre: 'Ratón inalámbrico', precio: 15000, categoria: 'Periféricos' },
    { id: 'd', nombre: 'Ratón industrial', precio: 12000, categoria: 'Hardware' },
  ];
  const selection = filterCatalog(products, {
    query: 'raton', maxPrice: 30000, category: 'Periféricos', sort: 'low', favorites: new Set(['a', 'b', 'd']),
  });
  assert.deepEqual(selection.map((product) => product.id), ['a']);
  assert.deepEqual(products.map((product) => product.id), ['a', 'b', 'c', 'd']);
});
