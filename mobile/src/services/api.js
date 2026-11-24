import * as SecureStore from 'expo-secure-store';
import { DEFAULT_API_URL } from '../config';

// Único punto de comunicación con la API REST del Hito 3 (HTTP + JSON).

export class ApiError extends Error {
  constructor(message, status = 0, kind = 'http') {
    super(message);
    this.status = status;
    this.kind = kind; // 'network' | 'http'
  }
}

const state = { baseUrl: DEFAULT_API_URL, token: null, onUnauthorized: null };

export const configure = (patch) => Object.assign(state, patch);
export const getBaseUrl = () => state.baseUrl;
export const cleanUrl = (url) => url.trim().replace(/\/+$/, '').replace(/\/api\/v1$/, '');

const store = {
  get: async (key) => { try { return await SecureStore.getItemAsync(key); } catch { return null; } },
  set: async (key, value) => { try { await SecureStore.setItemAsync(key, value); } catch {} },
  del: async (key) => { try { await SecureStore.deleteItemAsync(key); } catch {} },
};
export const storage = store;

function buildQuery(query) {
  if (!query) return '';
  const parts = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

async function request(path, { method = 'GET', body, auth = true, query, timeout = 15000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && state.token) headers.Authorization = `Bearer ${state.token}`;

  let res;
  try {
    res = await fetch(`${state.baseUrl}/api/v1${path}${buildQuery(query)}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    const msg = e?.name === 'AbortError'
      ? 'El servidor tardó demasiado en responder.'
      : 'No se pudo conectar con el servidor. Revisa la dirección de la API y tu conexión.';
    throw new ApiError(msg, 0, 'network');
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  const text = await res.text();
  if (text) { try { data = JSON.parse(text); } catch { data = null; } }

  if (!res.ok) {
    // El backend responde { statusCode, message (texto o lista), error }
    const message = Array.isArray(data?.message)
      ? data.message.join('. ')
      : data?.message || `Error ${res.status}`;
    if (res.status === 401 && auth && state.onUnauthorized) state.onUnauthorized();
    throw new ApiError(message, res.status, 'http');
  }
  return data;
}

export const api = {
  // Auth y perfil
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  register: (email, password, name) => request('/auth/register', { method: 'POST', body: { email, password, name }, auth: false }),
  me: () => request('/users/me'),
  ready: () => request('/health/ready', { auth: false, timeout: 8000 }),

  // Catálogo
  categories: () => request('/categories', { auth: false }),
  products: (query) => request('/products', { query, auth: false }),
  product: (id) => request(`/products/${id}`, { auth: false }),

  // Favoritos
  favorites: (query) => request('/favorites', { query }),
  addFavorite: (productId) => request(`/favorites/${productId}`, { method: 'PUT' }),
  removeFavorite: (productId) => request(`/favorites/${productId}`, { method: 'DELETE' }),

  // Carrito
  cart: () => request('/cart'),
  setCartItem: (productId, quantity) => request('/cart', { method: 'PUT', body: { productId, quantity } }),
  removeCartItem: (productId) => request(`/cart/${productId}`, { method: 'DELETE' }),

  // Pedidos
  checkout: (shippingAddress, idempotencyKey) => request('/orders', { method: 'POST', body: { shippingAddress, idempotencyKey } }),
  orders: (query) => request('/orders', { query }),
  order: (id) => request(`/orders/${id}`),
  cancelOrder: (id) => request(`/orders/${id}/status`, { method: 'PATCH', body: { status: 'cancelled' } }),

  // Modo vendedor: ventas recibidas y avance de su parte del pedido
  sales: (query) => request('/seller/orders', { query }),
  advanceSale: (id, status) => request(`/seller/orders/${id}/status`, { method: 'PATCH', body: { status } }),

  // Preguntas entre comprador y vendedor (se guardan en MongoDB)
  interactions: (targetId, limit = 50) => request(`/activity/interactions/target/${targetId}`, { query: { limit } }),
  sendInteraction: (targetId, receiverId, message) =>
    request('/activity/interactions', { method: 'POST', body: { targetId, targetType: 'product', receiverId, message } }),
};
