import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createApiClient, schemas } from "../src/services/nestApi.js";
const fixture = JSON.parse(
  await readFile(
    new URL("../../backend/docs/HTTP_EXAMPLES.json", import.meta.url),
  ),
);
const sample = (name) =>
  fixture.examples.find((e) => e.path === "/api/v1/" + name && e.status === 201)
    .response;
const json = (value, status = 200, headers) =>
  new Response(JSON.stringify(value), { status, headers });
test("Captured Nest product and order validate; Express envelopes and malformed data do not", () => {
  assert.ok(schemas.product(sample("products")));
  assert.ok(schemas.order(sample("orders")));
  assert.equal(
    schemas.products({ data: [sample("products")], meta: { total: 1 } }),
    false,
  );
  assert.equal(
    schemas.product({ ...sample("products"), id: "prod-001" }),
    false,
  );
  assert.equal(
    schemas.order({
      ...sample("orders"),
      transactions: [{ provider: "bank" }],
    }),
    false,
  );
});
test("Checkout sends only allowed fields, Bearer header and never x-user-id", async () => {
  let sent;
  const api = createApiClient({
    fetchImpl: async (url, options) => {
      sent = { url, ...options };
      return json(sample("orders"), 201);
    },
  });
  api.setToken("signed.jwt.token");
  await api.checkout({
    shippingAddress: "Retiro sintético",
    idempotencyKey: "attempt-001",
    items: ["forged"],
    total: 1,
    userId: "forged",
  });
  assert.deepEqual(JSON.parse(sent.body), {
    shippingAddress: "Retiro sintético",
    idempotencyKey: "attempt-001",
  });
  assert.equal(sent.headers.Authorization, "Bearer signed.jwt.token");
  assert.equal("x-user-id" in sent.headers, false);
});
for (const status of [400, 401, 403, 404, 409, 429, 500, 503]) {
  test(`HTTP ${status} produces a typed error and does not confirm success`, async () => {
    let expired = 0;
    const api = createApiClient({
      onUnauthorized: () => expired++,
      fetchImpl: async () =>
        json({ message: ["Synthetic validation"] }, status, {
          "Retry-After": "2",
        }),
    });
    api.setToken("signed.jwt.token");
    await assert.rejects(
      api.profile(),
      (e) => e.status === status && e.message.includes("Synthetic validation"),
    );
    assert.equal(expired, status === 401 ? 1 : 0);
    if (status === 429)
      await assert.rejects(
        api.profile(),
        (e) => e.status === 429 && e.retryAfter > 0,
      );
  });
}
test("Network failure, malformed successful responses and invalid UUID never become success", async () => {
  const offline = createApiClient({
    fetchImpl: async () => {
      throw new TypeError("offline");
    },
  });
  await assert.rejects(offline.categories(), /No se pudo conectar/);
  const malformed = createApiClient({
    fetchImpl: async () => json({ connected: true }),
  });
  await assert.rejects(malformed.categories(), /incompatible/);
  assert.throws(
    () => malformed.product("prod-001"),
    (e) => e.status === 400,
  );
});
test("External abort remains AbortError instead of showing service failure", async () => {
  const api = createApiClient({
    fetchImpl: async () => {
      throw new DOMException("aborted", "AbortError");
    },
  });
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    api.categories(controller.signal),
    (e) => e.name === "AbortError",
  );
});

test("Activity contract validates real Mongo documents and sends Bearer credentials", async () => {
  const id = "11111111-1111-4111-8111-111111111111";
  const doc = { _id: "a".repeat(24), targetId: id, targetType: "product", senderId: id, receiverId: id, message: "Consulta", createdAt: new Date().toISOString() };
  let sent;
  const api = createApiClient({ fetchImpl: async (url, options) => {
    sent = { url, ...options };
    return json(options.method === "POST" ? doc : [doc], options.method === "POST" ? 201 : 200);
  } });
  api.setToken("signed.jwt.token");
  assert.deepEqual(await api.targetInteractions(id), [doc]);
  assert.equal(sent.headers.Authorization, "Bearer signed.jwt.token");
  assert.deepEqual(await api.createInteraction(doc), doc);
  assert.equal(JSON.parse(sent.body).receiverId, id);
  assert.equal(schemas.interactions([{ ...doc, _id: undefined }]), false);
  const malformed = createApiClient({ fetchImpl: async () => json({ success: true }) });
  malformed.setToken("signed.jwt.token");
  await assert.rejects(malformed.myInteractions(), /incompatible/);
});
