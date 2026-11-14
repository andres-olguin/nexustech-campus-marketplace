import assert from 'node:assert/strict';
import test from 'node:test';
import { DOLLAR_CACHE_KEY, isFreshDollarRate, parseDollarRate, readSavedDollarRate, saveDollarRate } from '../src/services/publicApi.js';

test('toma la fecha válida más reciente aunque la serie venga desordenada', () => {
  const rate = parseDollarRate({ codigo: 'dolar', serie: [
    { fecha: '2026-11-06T03:00:00Z', valor: 990.12 },
    null,
    { fecha: '2026-11-09T03:00:00Z', valor: 981.61 },
    { fecha: '2026-11-10T03:00:00Z', valor: -3 },
  ] }, 1000);
  assert.equal(rate.value, 981.61);
  assert.equal(rate.date, '2026-11-09T03:00:00Z');
  assert.equal(rate.fetchedAt, 1000);
});

test('rechaza respuestas sin una referencia real y válida', () => {
  assert.throws(() => parseDollarRate({ codigo: 'dolar', serie: [
    { fecha: 'no es fecha', valor: 1000 }, { fecha: '2026-11-09', valor: '1000' },
  ] }), /no incluyó una tasa válida/);
  assert.throws(() => parseDollarRate({ codigo: 'euro', serie: [] }), /formato inesperado/);
});

test('recupera una referencia guardada y descarta caché caducada o dañada', (t) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const storage = new Map();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true, value: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
  });
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  });
  const now = Date.now();
  const rate = parseDollarRate({ codigo: 'dolar', serie: [{ fecha: '2026-11-09T03:00:00Z', valor: 995 }] }, now);
  saveDollarRate(rate);
  assert.deepEqual(readSavedDollarRate(), rate);
  assert.equal(isFreshDollarRate(rate, now + 1000), true);
  assert.equal(isFreshDollarRate(rate, now + 30 * 60 * 1000), false);
  storage.set(DOLLAR_CACHE_KEY, JSON.stringify({ ...rate, fetchedAt: now - 8 * 24 * 60 * 60 * 1000 }));
  assert.equal(readSavedDollarRate(), null);
  storage.set(DOLLAR_CACHE_KEY, '{');
  assert.equal(readSavedDollarRate(), null);
});
