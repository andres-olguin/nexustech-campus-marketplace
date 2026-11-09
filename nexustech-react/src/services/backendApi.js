// NexusTech Campus Marketplace — Cliente API Backend Fullstack
// Conecta con Express + PostgreSQL + MongoDB (http://localhost:4000/api/v1)
// Incluye modo de resiliencia transparente ante desconexión de red.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timeout);

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `Error HTTP ${response.status}`);
    }
    return { data, success: true, offline: false };
  } catch (err) {
    return { data: null, error: err.message, success: false, offline: true };
  }
}

export const api = {
  // Autenticación y Perfiles
  async login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async register(values) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(values)
    });
  },

  async getProfile(userId) {
    return request('/auth/me', {
      headers: { 'x-user-id': userId }
    });
  },

  async switchRole(userId, targetRole) {
    return request('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ userId, targetRole })
    });
  },

  // Productos (PostgreSQL)
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.search) query.append('search', params.search);
    if (params.categoria && params.categoria !== 'Todas') query.append('categoria', params.categoria);
    if (params.minPrice) query.append('minPrice', params.minPrice);
    if (params.maxPrice) query.append('maxPrice', params.maxPrice);
    if (params.sortBy) query.append('sortBy', params.sortBy);

    return request(`/products?${query.toString()}`);
  },

  async getProductById(id) {
    return request(`/products/${id}`);
  },

  async createProduct(productData) {
    return request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  async updateProduct(id, productData) {
    return request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },

  async deleteProduct(id) {
    return request(`/products/${id}`, {
      method: 'DELETE'
    });
  },

  async restoreProduct(id) {
    return request(`/products/${id}/restore`, {
      method: 'POST'
    });
  },

  async getCategories() {
    return request('/products/categories');
  },

  // Pedidos y Rastreo (PostgreSQL)
  async createOrder(orderData) {
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  async getOrderByCode(code) {
    return request(`/orders/${code}`);
  },

  async advanceOrderStatus(code, paso) {
    return request(`/orders/${code}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ paso })
    });
  },

  // Transacciones Simuladas (Webpay Plus)
  async simulatePayment(paymentData) {
    return request('/transactions/simulate', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
  },

  // Telemetría e Interacciones en MongoDB
  async logInteraction(eventType, metadata = {}, productId = null) {
    return request('/interactions', {
      method: 'POST',
      body: JSON.stringify({ eventType, metadata, productId })
    });
  },

  async getInteractions(params = {}) {
    const query = new URLSearchParams();
    if (params.eventType) query.append('eventType', params.eventType);
    if (params.limit) query.append('limit', params.limit);
    return request(`/interactions?${query.toString()}`);
  },

  async getAnalytics() {
    return request('/interactions/analytics');
  },

  // Healthcheck y Diagnóstico
  async checkHealth() {
    return request('/health');
  }
};

export default api;
