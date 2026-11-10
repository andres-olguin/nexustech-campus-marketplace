import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
const ui = process.env.TEST_UI_URL || "http://127.0.0.1:5178";
const api = process.env.TEST_API_URL;
const password = "Synthetic-browser-2026!";
async function register(page, email, name) {
  await page.goto(ui + "/#/acceso");
  await page.getByRole("button", { name: "Crear cuenta", exact: true }).click();
  await page.getByLabel("Nombre", { exact: true }).fill(name);
  await page.getByLabel("Correo electrónico", { exact: true }).fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page
    .getByRole("button", { name: "Registrar cuenta", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Perfil comprador y vendedor" }),
  ).toBeVisible();
}
async function login(page, email) {
  await page.goto(ui + "/#/acceso");
  await page.getByLabel("Correo electrónico", { exact: true }).fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Ingresar", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Perfil comprador y vendedor" }),
  ).toBeVisible();
}
async function nav(page, route) {
  await page.evaluate((route) => {
    location.hash = "/" + route;
  }, route);
}
async function checkout(page) {
  await page.getByRole("button", { name: /^Abrir carrito/ }).click();
  await page
    .getByRole("button", { name: "Continuar con pedido simulado", exact: true })
    .click();
  await page
    .getByLabel("Dirección o punto de retiro")
    .fill("Punto de retiro sintético de demostración");
  const response = page.waitForResponse(
    (r) => r.url() === api + "/orders" && r.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Confirmar pedido simulado", exact: true })
    .click();
  const received = await response;
  expect(received.status()).toBe(201);
  expect(Object.keys(received.request().postDataJSON()).sort()).toEqual([
    "idempotencyKey",
    "shippingAddress",
  ]);
  await expect(
    page.getByText("Pedido guardado en el servidor", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("No es un comprobante bancario u oficial.", {
      exact: false,
    }),
  ).toBeVisible();
  const order = await received.json();
  await page
    .getByRole("link", { name: "Ver mis pedidos", exact: true })
    .click();
  await expect(
    page.getByRole("article").filter({ hasText: order.id }),
  ).toBeVisible();
  return order;
}
test("Real browser registration → publication/edit → favorites/cart → multi-seller order → tracking/cancellation → relogin persistence", async ({
  browser,
  page,
  request,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const run = randomUUID().slice(0, 8);
  const sellerEmail = `seller-${run}@example.test`;
  const buyerEmail = `buyer-${run}@example.test`;
  const categoryName = "Hardware " + run;
  const firstName = "Monitor Sintético " + run;
  const secondName = "Teclado Sintético " + run;
  await register(page, sellerEmail, "Vendedor Sintético");
  await page.getByLabel("Nombre de vendedor").fill("Tienda Sintética");
  await page
    .getByRole("button", { name: "Guardar perfil", exact: true })
    .click();
  await expect(page.getByText("Perfil guardado en el servidor.")).toBeVisible();
  await page.getByLabel("Nueva categoría").fill(categoryName);
  await page
    .getByRole("button", { name: "Crear categoría", exact: true })
    .click();
  await expect(
    page.getByText("Categoría creada.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Publicar", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nombre del producto").fill(firstName);
  await dialog
    .getByLabel("Descripción", { exact: true })
    .fill("Monitor de prueba sintético para laboratorio");
  await dialog
    .getByLabel("Categoría", { exact: true })
    .selectOption({ label: categoryName });
  await dialog.getByLabel("Precio en CLP").fill("65000");
  await dialog.getByLabel("Stock", { exact: true }).fill("4");
  await dialog
    .getByRole("button", { name: "Publicar producto", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await nav(page, "catalogo");
  await page
    .getByRole("button", { name: "Editar producto: " + firstName, exact: true })
    .click();
  await dialog.getByLabel("Precio en CLP").fill("60000");
  await dialog
    .getByRole("button", { name: "Guardar cambios", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  const categories = await (await request.get(api + "/categories")).json();
  const categoryId = categories.find((c) => c.name === categoryName).id;
  const sellerB = await (
    await request.post(api + "/auth/register", {
      data: {
        name: "Segundo Vendedor Sintético",
        email: `seller-b-${run}@example.test`,
        password,
      },
    })
  ).json();
  const second = await request.post(api + "/products", {
    headers: { Authorization: `Bearer ${sellerB.accessToken}` },
    data: {
      name: secondName,
      description: "Teclado sintético para integración multivendedor",
      categoryId,
      price: 15000,
      stock: 4,
    },
  });
  expect(second.status()).toBe(201);
  const buyer = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  buyer.on("pageerror", (e) => errors.push(e.message));
  await register(buyer, buyerEmail, "Comprador Sintético");
  await nav(buyer, "catalogo");
  await buyer.getByLabel("Buscar productos", { exact: true }).fill("Sintético");
  await buyer.getByLabel("Categoría", { exact: true }).selectOption(categoryId);
  await expect(
    buyer.getByRole("button", {
      name: "Ver detalle de " + firstName,
      exact: true,
    }),
  ).toBeVisible();
  await buyer
    .getByRole("button", {
      name: "Guardar en favoritos: " + firstName,
      exact: true,
    })
    .click();
  await expect(
    buyer.getByText("Favoritos actualizados.", { exact: true }),
  ).toBeVisible();
  await nav(buyer, "favoritos");
  await expect(
    buyer.getByRole("button", {
      name: "Ver detalle de " + firstName,
      exact: true,
    }),
  ).toBeVisible();
  await buyer
    .getByRole("button", {
      name: "Quitar de favoritos: " + firstName,
      exact: true,
    })
    .click();
  await expect(buyer.locator(".nt-product-card")).toHaveCount(0);
  await nav(buyer, "catalogo");
  await buyer
    .getByRole("button", {
      name: "Agregar al carrito: " + firstName,
      exact: true,
    })
    .click();
  await expect(
    buyer.getByRole("button", {
      name: "Abrir carrito, 1 unidades",
      exact: true,
    }),
  ).toBeVisible();
  await buyer.getByRole("button", { name: /^Abrir carrito/ }).click();
  await buyer
    .getByRole("button", {
      name: "Aumentar cantidad de " + firstName,
      exact: true,
    })
    .click();
  await expect(
    buyer.getByRole("button", {
      name: "Abrir carrito, 2 unidades",
      exact: true,
    }),
  ).toBeVisible();
  await buyer
    .getByRole("button", {
      name: "Reducir cantidad de " + firstName,
      exact: true,
    })
    .click();
  await expect(
    buyer.getByRole("button", {
      name: "Abrir carrito, 1 unidades",
      exact: true,
    }),
  ).toBeVisible();
  await buyer
    .getByRole("button", { name: "Cerrar ventana", exact: true })
    .click();
  await buyer
    .getByRole("button", {
      name: "Agregar al carrito: " + secondName,
      exact: true,
    })
    .click();
  await expect(
    buyer.getByRole("button", {
      name: "Abrir carrito, 2 unidades",
      exact: true,
    }),
  ).toBeVisible();
  const order = await checkout(buyer);
  expect(order.total).toBe(75000);
  expect(order.fulfillments).toHaveLength(2);
  await nav(page, "rastreo");
  await page.getByRole("button", { name: "Mis ventas", exact: true }).click();
  const sold = page.getByRole("article").filter({ hasText: order.id });
  await expect(sold).toContainText(firstName);
  await expect(sold).not.toContainText(secondName);
  await sold
    .getByRole("button", { name: "Marcar: En preparación", exact: true })
    .click();
  await buyer
    .getByRole("button", { name: "Actualizar pedidos", exact: true })
    .click();
  const bought = buyer.getByRole("article").filter({ hasText: order.id });
  await expect(
    bought.getByRole("button", { name: "Cancelar pedido", exact: true }),
  ).toBeDisabled();
  await sold
    .getByRole("button", { name: "Marcar: Despacho declarado", exact: true })
    .click();
  await sold
    .getByRole("button", { name: "Marcar: Entrega declarada", exact: true })
    .click();
  const third = await browser.newPage();
  await login(third, `seller-b-${run}@example.test`);
  await nav(third, "rastreo");
  await third.getByRole("button", { name: "Mis ventas", exact: true }).click();
  const soldB = third.getByRole("article").filter({ hasText: order.id });
  for (const next of [
    "En preparación",
    "Despacho declarado",
    "Entrega declarada",
  ])
    await soldB
      .getByRole("button", { name: "Marcar: " + next, exact: true })
      .click();
  await buyer
    .getByRole("button", { name: "Actualizar pedidos", exact: true })
    .click();
  await expect(bought).toContainText("Entrega declarada · SIMULADO");
  await nav(buyer, "catalogo");
  await buyer
    .getByRole("button", {
      name: "Agregar al carrito: " + firstName,
      exact: true,
    })
    .click();
  await expect(
    buyer.getByRole("button", {
      name: "Abrir carrito, 1 unidades",
      exact: true,
    }),
  ).toBeVisible();
  const cancellable = await checkout(buyer);
  const cancelCard = buyer
    .getByRole("article")
    .filter({ hasText: cancellable.id });
  await cancelCard
    .getByRole("button", { name: "Cancelar pedido", exact: true })
    .click();
  await expect(cancelCard).toContainText("Cancelado · SIMULADO");
  await buyer.reload();
  await expect(
    buyer.getByText("para consultar tus pedidos.", { exact: false }),
  ).toBeVisible();
  await login(buyer, buyerEmail);
  await nav(buyer, "rastreo");
  await expect(
    buyer.getByRole("article").filter({ hasText: order.id }),
  ).toContainText("Entrega declarada · SIMULADO");
  await expect(
    buyer.getByRole("article").filter({ hasText: cancellable.id }),
  ).toContainText("Cancelado · SIMULADO");
  await nav(page, "catalogo");
  await page
    .getByRole("button", {
      name: "Archivar publicación: " + firstName,
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Confirmar archivado", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Ver detalle de " + firstName,
      exact: true,
    }),
  ).toHaveCount(0);
  const invalid = await request.get(api + "/products?limit=101");
  expect(invalid.status()).toBe(400);
  await nav(buyer, "historial");
  await expect(
    buyer.getByRole("heading", { name: /Historial de Actividad/ }),
  ).toBeVisible();
  expect(errors).toEqual([]);
  await buyer.close();
  await third.close();
});
test("Mobile navigation and responsive layout, 390px and 768px", async ({
  page,
}) => {
  for (const width of [390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/#/catalogo");
    await expect(
      page.getByRole("heading", {
        name: "Catálogo del marketplace",
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.getByText("Cargando publicaciones…")).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/catalog-${width}.png`,
      fullPage: true,
    });
    const toggle = page.getByRole("button", {
      name: "Abrir menú",
      exact: true,
    });
    if (await toggle.isVisible()) {
      await toggle.click();
      await page.getByRole("link", { name: "Pedidos", exact: true }).click();
      await expect(
        page.getByRole("heading", { name: "Pedidos y ventas.", exact: true }),
      ).toBeVisible();
    }
    await page.screenshot({
      path: `test-results/responsive-${width}.png`,
      fullPage: true,
    });
  }
});
test("Lost checkout response retries the same real committed order without double purchase", async ({
  page,
  request,
}) => {
  const run = randomUUID().slice(0, 8);
  const seller = await (
    await request.post(api + "/auth/register", {
      data: {
        email: `retry-seller-${run}@example.test`,
        name: "Vendedor Reintento Sintético",
        password,
      },
    })
  ).json();
  const headers = { Authorization: `Bearer ${seller.accessToken}` };
  const category = await (
    await request.post(api + "/categories", {
      headers,
      data: { name: "Reintentos " + run },
    })
  ).json();
  const product = await (
    await request.post(api + "/products", {
      headers,
      data: {
        name: "Producto Reintento " + run,
        description: "Producto sintético de prueba de idempotencia",
        categoryId: category.id,
        price: 12000,
        stock: 2,
      },
    })
  ).json();
  await register(
    page,
    `retry-buyer-${run}@example.test`,
    "Comprador Reintento Sintético",
  );
  await nav(page, "catalogo");
  await page
    .getByRole("button", {
      name: "Agregar al carrito: " + product.name,
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Abrir carrito, 1 unidades",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^Abrir carrito/ }).click();
  await page
    .getByRole("button", { name: "Continuar con pedido simulado", exact: true })
    .click();
  await page
    .getByLabel("Dirección o punto de retiro")
    .fill("Retiro sintético para reintento");
  const bodies = [];
  let committed;
  await page.route("**/api/v1/orders", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    bodies.push(route.request().postDataJSON());
    if (bodies.length === 1) {
      const response = await route.fetch();
      expect(response.status()).toBe(201);
      committed = await response.json();
      return route.abort("failed");
    }
    return route.continue();
  });
  await page
    .getByRole("button", { name: "Confirmar pedido simulado", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByText("Intento pendiente de verificar", { exact: true }),
  ).toBeVisible();
  await expect(dialog.getByLabel("Dirección o punto de retiro")).toBeDisabled();
  await expect(
    dialog.getByText("Pedido guardado en el servidor", { exact: true }),
  ).toHaveCount(0);
  const retry = page.waitForResponse(
    (r) => r.url() === api + "/orders" && r.request().method() === "POST",
  );
  await page
    .getByRole("button", { name: "Reintentar mismo pedido", exact: true })
    .click();
  expect((await (await retry).json()).id).toBe(committed.id);
  await expect(
    dialog.getByText("Pedido guardado en el servidor", { exact: true }),
  ).toBeVisible();
  expect(bodies).toHaveLength(2);
  expect(bodies[0]).toEqual(bodies[1]);
  expect(
    (await (await request.get(api + "/products/" + product.id)).json()).stock,
  ).toBe(1);
  await page
    .getByRole("link", { name: "Ver mis pedidos", exact: true })
    .click();
  await expect(page.getByRole("article")).toHaveCount(1);
});
test("A 401 clears the session and does not retain authenticated account data", async ({
  page,
}) => {
  const run = randomUUID().slice(0, 8);
  await register(page, `expired-${run}@example.test`, "Sesión Sintética");
  await page.route("**/api/v1/users/me", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({
        statusCode: 401,
        message: "Token expirado de prueba",
        error: "Unauthorized",
      }),
    }),
  );
  await nav(page, "catalogo");
  await page.getByRole("button", { name: "Actualizar", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Ingresar", exact: true }),
  ).toBeVisible();
  await nav(page, "rastreo");
  await expect(
    page.getByText("para consultar tus pedidos.", { exact: false }),
  ).toBeVisible();
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});
test("Unavailable and incompatible API responses never show a fallback catalog", async ({
  page,
}) => {
  await page.route("**/api/v1/products?*", (route) => route.abort("failed"));
  await page.goto("/#/catalogo");
  await expect(
    page.getByText("Catálogo no disponible", { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".nt-product-card")).toHaveCount(0);
  await page.unroute("**/api/v1/products?*");
  await page.route("**/api/v1/products?*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [{ id: "prod-fake" }], meta: { total: 1 } }),
    }),
  );
  await page.getByRole("button", { name: "Reintentar", exact: true }).click();
  await expect(
    page.getByText(
      "La API devolvió una respuesta incompatible. No se confirma la operación.",
    ),
  ).toBeVisible();
  await expect(page.locator(".nt-product-card")).toHaveCount(0);
});

test("React sends private messages to real MongoDB and reads them after reload", async ({ page, request }) => {
  const run = randomUUID().slice(0, 8);
  const seller = await (await request.post(api + "/auth/register", { data: { email: "mongo-seller-" + run + "@example.test", name: "Mongo Seller", password } })).json();
  const headers = { Authorization: "Bearer " + seller.accessToken };
  const category = await (await request.post(api + "/categories", { headers, data: { name: "Mongo " + run } })).json();
  const product = await (await request.post(api + "/products", { headers, data: { name: "Mongo product " + run, description: "Real Mongo browser integration", categoryId: category.id, price: 15000, stock: 2 } })).json();
  await register(page, "mongo-buyer-" + run + "@example.test", "Mongo Buyer");
  await nav(page, "historial");
  await page.getByRole("button", { name: /Conversaciones e Interacciones/ }).click();
  await page.locator("form input").first().fill(product.id);
  await page.getByLabel("UUID del destinatario").fill(seller.user.id);
  const message = "Pregunta persistente " + run;
  await page.locator("form textarea").fill(message);
  const saved = page.waitForResponse(r => r.url() === api + "/activity/interactions" && r.request().method() === "POST");
  await page.locator("form button[type=submit]").click();
  const response = await saved;
  expect(response.status()).toBe(201);
  expect((await response.json())._id).toMatch(/^[a-f0-9]{24}$/i);
  await expect(page.getByText(message, { exact: true })).toBeVisible();
  await page.reload();
  // Session tokens intentionally live only in memory: authenticate again after reload.
  await login(page, "mongo-buyer-" + run + "@example.test");
  await nav(page, "historial");
  await page.getByRole("button", { name: /Conversaciones e Interacciones/ }).click();
  await expect(page.getByText(message, { exact: true })).toBeVisible();
});
