export const DOLLAR_ENDPOINT = 'https://mindicador.cl/api/dolar';
export const DOLLAR_CACHE_KEY = 'nexustech-dollar-v1';
const SOURCE = 'mindicador.cl';
const FRESH_MS = 30 * 60 * 1000;
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

export function parseDollarRate(data, fetchedAt = Date.now()) {
  if (data?.codigo !== 'dolar' || !Array.isArray(data.serie)) {
    throw new Error('La API devolvió un formato inesperado.');
  }
  let latest = null;
  let latestTime = -Infinity;
  for (const record of data.serie) {
    if (!record || !Number.isFinite(record.valor) || record.valor <= 0 || typeof record.fecha !== 'string') continue;
    const time = Date.parse(record.fecha);
    if (time > latestTime) {
      latest = record;
      latestTime = time;
    }
  }
  if (!latest) throw new Error('La API no incluyó una tasa válida.');
  return { value: latest.valor, date: latest.fecha, source: SOURCE, fetchedAt };
}

function isUsableRate(rate, now = Date.now()) {
  return rate?.source === SOURCE && Number.isFinite(rate.value) && rate.value > 0 &&
    typeof rate.date === 'string' && Number.isFinite(Date.parse(rate.date)) &&
    Number.isFinite(rate.fetchedAt) && rate.fetchedAt <= now && now - rate.fetchedAt < RETENTION_MS;
}

export function isFreshDollarRate(rate, now = Date.now()) {
  return isUsableRate(rate, now) && now - rate.fetchedAt < FRESH_MS;
}

export function readSavedDollarRate() {
  try {
    const rate = JSON.parse(localStorage.getItem(DOLLAR_CACHE_KEY));
    return isUsableRate(rate) ? rate : null;
  } catch {
    return null;
  }
}

export function saveDollarRate(rate) {
  if (!isUsableRate(rate)) return;
  try { localStorage.setItem(DOLLAR_CACHE_KEY, JSON.stringify(rate)); }
  catch { /* La referencia sigue disponible en memoria durante la sesión. */ }
}

// Consulta real; nunca se sustituye una respuesta fallida por una tasa inventada.
export async function getDollarRate(signal) {
  const controller = new AbortController();
  let timedOut = false;
  const abort = () => controller.abort();
  if (signal?.aborted) abort();
  signal?.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 8000);
  try {
    const response = await fetch(DOLLAR_ENDPOINT, { signal: controller.signal });
    if (!response.ok) throw new Error('La API respondió con un error. Intentá nuevamente.');
    return parseDollarRate(await response.json());
  } catch (error) {
    if (timedOut) throw new Error('La consulta demoró demasiado. Intentá nuevamente.');
    if (signal?.aborted) throw error;
    throw new Error(error.name === 'TypeError' ? 'No se pudo conectar con la API. Revisá tu conexión e intentá nuevamente.' : error.message);
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}
