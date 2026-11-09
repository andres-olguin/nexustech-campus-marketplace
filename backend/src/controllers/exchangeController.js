let cachedRate = {
  codigo: 'dolar',
  nombre: 'Dólar observado',
  unidad_medida: 'Pesos',
  fecha: new Date().toISOString(),
  valor: 981.61,
  fuente: 'mindicador.cl (Caché local resiliente)'
};
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

export async function getUsdRate(req, res) {
  const now = Date.now();
  if (now - lastFetchTime < CACHE_TTL_MS && cachedRate.valor) {
    return res.json({ ...cachedRate, fromCache: true });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const response = await fetch('https://mindicador.cl/api/dolar', {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data && data.serie && data.serie.length > 0) {
      cachedRate = {
        codigo: data.codigo,
        nombre: data.nombre,
        unidad_medida: data.unidad_medida,
        fecha: data.serie[0].fecha,
        valor: data.serie[0].valor,
        fuente: 'https://mindicador.cl/api/dolar (En vivo)'
      };
      lastFetchTime = now;
      return res.json({ ...cachedRate, fromCache: false });
    }
    throw new Error('Respuesta sin serie válida');
  } catch (err) {
    console.warn('[Exchange API] Advertencia al consultar mindicador.cl:', err.message, '- Utilizando valor de respaldo');
    return res.json({
      ...cachedRate,
      fromCache: true,
      advertencia: 'Proveedor externo no disponible temporalmente; tasa de referencia respaldada.'
    });
  }
}
