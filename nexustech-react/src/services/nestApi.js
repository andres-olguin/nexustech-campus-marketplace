const uuid = (value) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
const string = (value) => typeof value === "string";
const integer = (value) => Number.isSafeInteger(value) && value >= 0;
const statuses = [
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
];
const baseRecord = (value) =>
  value &&
  uuid(value.id) &&
  string(value.createdAt) &&
  !Number.isNaN(Date.parse(value.createdAt));
const user = (value) =>
  value && uuid(value.id) && string(value.email) && string(value.name);
const category = (value) =>
  baseRecord(value) && string(value.name) && uuid(value.ownerId);
const product = (value) =>
  baseRecord(value) &&
  string(value.name) &&
  string(value.description) &&
  uuid(value.categoryId) &&
  uuid(value.sellerId) &&
  integer(value.price) &&
  integer(value.stock) &&
  typeof value.isActive === "boolean" &&
  (value.imageUrl === null || string(value.imageUrl));
const item = (value) =>
  baseRecord(value) &&
  uuid(value.orderId) &&
  uuid(value.productId) &&
  uuid(value.sellerId) &&
  string(value.name) &&
  integer(value.unitPrice) &&
  integer(value.quantity) &&
  value.quantity > 0;
const fulfillment = (value) =>
  baseRecord(value) &&
  uuid(value.orderId) &&
  uuid(value.sellerId) &&
  statuses.includes(value.status) &&
  string(value.updatedAt);
const transaction = (value) =>
  baseRecord(value) &&
  uuid(value.orderId) &&
  value.provider === "simulation" &&
  ["approved", "reversed"].includes(value.status) &&
  integer(value.amount);
const array = (check) => (value) => Array.isArray(value) && value.every(check);
const page = (check) => (value) =>
  value &&
  array(check)(value.items) &&
  integer(value.total) &&
  integer(value.page) &&
  value.page > 0 &&
  integer(value.limit) &&
  value.limit > 0;
const order = (value) =>
  baseRecord(value) &&
  uuid(value.userId) &&
  statuses.includes(value.status) &&
  integer(value.total) &&
  string(value.shippingAddress) &&
  string(value.idempotencyKey) &&
  array(item)(value.items) &&
  array(fulfillment)(value.fulfillments) &&
  array(transaction)(value.transactions);
const sellerOrder = (value) =>
  baseRecord(value) &&
  statuses.includes(value.orderStatus) &&
  string(value.shippingAddress) &&
  integer(value.subtotal) &&
  array(item)(value.items) &&
  fulfillment(value.fulfillment);
const cartItem = (value) =>
  baseRecord(value) &&
  uuid(value.userId) &&
  uuid(value.productId) &&
  integer(value.quantity) &&
  value.quantity > 0;
const favorite = (value) =>
  baseRecord(value) && uuid(value.userId) && uuid(value.productId);

export const schemas = {
  session: (value) =>
    value &&
    string(value.accessToken) &&
    value.accessToken.split(".").length === 3 &&
    user(value.user),
  profile: (value) =>
    user(value) &&
    baseRecord(value.buyerProfile) &&
    baseRecord(value.sellerProfile) &&
    value.buyerProfile.userId === value.id &&
    value.sellerProfile.userId === value.id &&
    string(value.sellerProfile.displayName),
  categories: array(category),
  category,
  product,
  products: page(product),
  order,
  orders: page(order),
  sellerOrder,
  sellerOrders: page(sellerOrder),
  cartItem,
  cart: (value) =>
    value &&
    integer(value.total) &&
    array((i) => cartItem(i) && product(i.product))(value.items),
  favorite,
  favorites: page((i) => favorite(i) && product(i.product)),
  deleted: (value) => value?.deleted === true,
};
const labels = {
  400: "Revisa los campos ingresados.",
  401: "Tu sesión venció. Vuelve a ingresar.",
  403: "No tienes permiso para esta acción.",
  404: "El recurso no está disponible para tu cuenta.",
  409: "Los datos cambiaron. Actualiza el stock o el estado.",
  429: "Demasiadas solicitudes. Espera antes de reintentar.",
  500: "El servidor no pudo completar la solicitud.",
  503: "El servicio está temporalmente indisponible.",
};
export class ApiError extends Error {
  constructor(message, status = 0, retryAfter = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

export function createApiClient({
  baseUrl = import.meta.env?.VITE_API_BASE_URL ||
    "http://localhost:3000/api/v1",
  fetchImpl = globalThis.fetch,
  onUnauthorized = () => {},
} = {}) {
  const base = baseUrl.replace(/\/$/, "");
  if (!/^https?:\/\//.test(base))
    throw new Error("VITE_API_BASE_URL debe ser una URL HTTP válida.");
  let token = null;
  let blockedUntil = 0;
  async function request(
    path,
    { method = "GET", body, signal, schema, secure = false } = {},
  ) {
    if (secure && !token)
      throw new ApiError("Inicia sesión para continuar.", 401);
    if (Date.now() < blockedUntil)
      throw new ApiError(
        labels[429],
        429,
        Math.ceil((blockedUntil - Date.now()) / 1000),
      );
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 12000);
    const requestToken = token;
    try {
      const response = await fetchImpl(base + path, {
        method,
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...(secure ? { Authorization: `Bearer ${requestToken}` } : {}),
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
      let data;
      try {
        data = await response.json();
      } catch {
        data = undefined;
      }
      if (!response.ok) {
        if (response.status === 401 && secure && requestToken === token) {
          token = null;
          onUnauthorized();
        }
        const header = response.headers.get("Retry-After");
        // Retry-After may not be exposed by the API's CORS configuration.
        const retry = header
          ? Math.max(
              0,
              Number(header) ||
                Math.ceil((Date.parse(header) - Date.now()) / 1000) ||
                0,
            )
          : response.status === 429
            ? 60
            : 0;
        if (response.status === 429)
          blockedUntil = Date.now() + Math.max(1, retry) * 1000;
        const message = Array.isArray(data?.message)
          ? data.message.join(" ")
          : string(data?.message)
            ? data.message
            : "";
        throw new ApiError(
          [
            labels[response.status] || "La solicitud falló.",
            message,
            response.status === 429
              ? `Reintenta en ${Math.max(1, retry)} segundos.`
              : "",
          ]
            .filter(Boolean)
            .join(" "),
          response.status,
          retry,
        );
      }
      if (!schema || !schema(data))
        throw new ApiError(
          "La API devolvió una respuesta incompatible. No se confirma la operación.",
        );
      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (signal?.aborted)
        throw new DOMException("Solicitud cancelada", "AbortError");
      throw new ApiError(
        timedOut
          ? "La API demoró demasiado. El resultado de una compra debe verificarse antes de repetirla."
          : "No se pudo conectar con la API. No se confirmó la operación.",
      );
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
    }
  }
  const id = (value) => {
    if (!uuid(value)) throw new ApiError("Identificador UUID inválido.", 400);
    return value;
  };
  return {
    setToken: (value) => {
      token = value;
    },
    request,
    register: (body) =>
      request("/auth/register", {
        method: "POST",
        body,
        schema: schemas.session,
      }),
    login: (body) =>
      request("/auth/login", { method: "POST", body, schema: schemas.session }),
    profile: (signal) =>
      request("/users/me", { secure: true, signal, schema: schemas.profile }),
    updateProfile: (body) =>
      request("/users/me", {
        method: "PATCH",
        secure: true,
        body,
        schema: schemas.profile,
      }),
    categories: (signal) =>
      request("/categories", { signal, schema: schemas.categories }),
    createCategory: (name) =>
      request("/categories", {
        method: "POST",
        secure: true,
        body: { name },
        schema: schemas.category,
      }),
    products: (query, signal) =>
      request(
        "/products?" +
          new URLSearchParams(
            Object.entries(query).filter(
              ([, v]) => v !== "" && v !== undefined,
            ),
          ),
        { signal, schema: schemas.products },
      ),
    product: (value, signal) =>
      request("/products/" + id(value), { signal, schema: schemas.product }),
    publish: (body) =>
      request("/products", {
        method: "POST",
        secure: true,
        body,
        schema: schemas.product,
      }),
    edit: (value, body) =>
      request("/products/" + id(value), {
        method: "PATCH",
        secure: true,
        body,
        schema: schemas.product,
      }),
    archive: (value) =>
      request("/products/" + id(value), {
        method: "DELETE",
        secure: true,
        schema: schemas.deleted,
      }),
    cart: (signal) =>
      request("/cart", { secure: true, signal, schema: schemas.cart }),
    setQuantity: (productId, quantity) =>
      request("/cart", {
        method: "PUT",
        secure: true,
        body: { productId: id(productId), quantity },
        schema: schemas.cartItem,
      }),
    removeCart: (value) =>
      request("/cart/" + id(value), {
        method: "DELETE",
        secure: true,
        schema: schemas.deleted,
      }),
    favorites: (page = 1, signal) =>
      request(`/favorites?page=${page}&limit=20`, {
        secure: true,
        signal,
        schema: schemas.favorites,
      }),
    favorite: (value, remove) =>
      request("/favorites/" + id(value), {
        method: remove ? "DELETE" : "PUT",
        secure: true,
        schema: remove ? schemas.deleted : schemas.favorite,
      }),
    checkout: ({ shippingAddress, idempotencyKey }) =>
      request("/orders", {
        method: "POST",
        secure: true,
        body: { shippingAddress, idempotencyKey },
        schema: schemas.order,
      }),
    orders: (page = 1, seller = false, signal) =>
      request(`${seller ? "/seller" : ""}/orders?page=${page}&limit=20`, {
        secure: true,
        signal,
        schema: seller ? schemas.sellerOrders : schemas.orders,
      }),
    order: (value, signal) =>
      request("/orders/" + id(value), {
        secure: true,
        signal,
        schema: schemas.order,
      }),
    cancel: (value) =>
      request("/orders/" + id(value) + "/status", {
        method: "PATCH",
        secure: true,
        body: { status: "cancelled" },
        schema: schemas.order,
      }),
    advance: (value, status) =>
      request("/seller/orders/" + id(value) + "/status", {
        method: "PATCH",
        secure: true,
        body: { status },
        schema: schemas.sellerOrder,
      }),
  };
}
