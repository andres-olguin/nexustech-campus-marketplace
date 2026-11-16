console.log("[DEMO] NexusTech completo sin Docker: React + NestJS + PostgreSQL + MongoDB.");
const { spawn, execFile } = require("node:child_process");
const { promisify } = require("node:util");
const { once } = require("node:events");
const { mkdtemp, rm } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const { join, resolve, dirname, sep } = require("node:path");
const { pathToFileURL } = require("node:url");
const { randomBytes } = require("node:crypto");
const exec = promisify(execFile);
// Este script está en <repositorio>/scripts, no en nexustech-react/scripts.
const project = resolve(__dirname, "..");
const root = resolve(project, "nexustech-react");
const backend = resolve(project, "backend");
const children = [];
function launch(args, cwd, env, name = "child") {
  const child = spawn(process.execPath, args, {
    cwd,
    env,
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout?.on("data", (d) => process.stdout.write(`[${name}] ${d}`));
  child.stderr?.on("data", (d) => process.stderr.write(`[${name} ERR] ${d}`));
  children.push(child);
  return child;
}
async function freePort() {
  const server = require("node:net").createServer();
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  await new Promise(resolve => server.close(resolve));
  return port;
}
async function ready(url, child) {
  for (let i = 0; i < 480; i++) {
    if (child.exitCode !== null)
      throw new Error("Owned test server exited before readiness: " + url);
    try {
      if ((await fetch(url, { signal: AbortSignal.timeout(500) })).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error("Timed out waiting for test server: " + url);
}
(async () => {
  console.log("[RUNNER] Initializing embedded postgres and backend...");
  const { default: EmbeddedPostgres } = await import(
    pathToFileURL(require.resolve("embedded-postgres", { paths: [backend] }))
      .href
  );
  const directory = await mkdtemp(join(tmpdir(), "nexustech-react-pg-"));
  const password = randomBytes(24).toString("hex");
  const pgPort = await freePort();
  const apiPort = await freePort();
  const webPort = await freePort();
  const apiUrl = "http://127.0.0.1:" + apiPort;
  const uiUrl = "http://127.0.0.1:" + webPort;
  const pg = new EmbeddedPostgres({
    databaseDir: directory,
    user: "postgres",
    password,
    port: pgPort,
    persistent: false,
    initdbFlags: ["--locale=C", "--encoding=UTF8"],
    postgresFlags: ["-c", "io_method=sync", "-c", "listen_addresses=127.0.0.1", "-c", "unix_socket_directories="],
    onLog: () => {},
    onError: () => {},
  });
  let mongo;
  try {
    const { MongoMemoryServer } = require(require.resolve("mongodb-memory-server", { paths: [backend] }));
    mongo = await MongoMemoryServer.create({
      binary: { version: process.env.MONGOMS_VERSION || "7.0.24" },
      instance: { launchTimeout: 120000, storageEngine: "wiredTiger",
        args: ["--setParameter", "diagnosticDataCollectionEnabled=false", ...(process.platform === "win32" ? [] : ["--nounixsocket"])],
      },
    });
    console.log("[RUNNER] Starting postgres...");
    await pg.initialise();
    await pg.start();
    await pg.createDatabase("nexustech_browser_test");
    console.log("[RUNNER] Postgres started, compiling typescript...");
    const env = {
      ...process.env,
      DATABASE_URL: `postgresql://postgres:${password}@127.0.0.1:${pgPort}/nexustech_browser_test`,
      JWT_SECRET: randomBytes(48).toString("hex"),
      MONGODB_URI: mongo.getUri(),
      MONGODB_DB_NAME: "nexustech_browser_test",
      PORT: String(apiPort),
      CORS_ORIGINS: uiUrl,
    };
    await exec(
      process.execPath,
      [
        require.resolve("typescript/bin/tsc", { paths: [backend] }),
        "-p",
        "tsconfig.json",
      ],
      { cwd: backend },
    );
    console.log("[RUNNER] Compiling done, running migrations...");
    await exec(
      process.execPath,
      [
        require.resolve("typeorm/cli.js", { paths: [backend] }),
        "migration:run",
        "-d",
        "dist/database/data-source.js",
      ],
      { cwd: backend, env },
    );
    const api = launch(["dist/main.js"], backend, env, "API");
    await ready(apiUrl + "/api/v1/health/ready", api);
    const front = launch(
      [
        join(root, "node_modules/vite/bin/vite.js"),
        "--host",
        "127.0.0.1",
        "--port",
        String(webPort),
        "--strictPort",
      ],
      root,
      { ...process.env, VITE_API_BASE_URL: apiUrl + "/api/v1" },
      "VITE"
    );
    await ready(uiUrl, front);
    console.log(
      "PostgreSQL, MongoDB, NestJS y React preparados. Generando usuarios y productos ficticios.",
    );

    // Datos de demostracion: solo personas y productos ficticios.
    async function callApi(path, method = "GET", body, token, expected = 200) {
      const response = await fetch(apiUrl + "/api/v1" + path, {
        method, signal: AbortSignal.timeout(15000),
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      if (response.status !== expected) {
        throw new Error(method + " " + path + " devolvio " + response.status + ": " + (await response.text()).slice(0, 240));
      }
      return response.json();
    }
    const suffix = randomBytes(4).toString("hex");
    const passwordDemo = "DemoNexus!" + randomBytes(10).toString("hex");
    const seller = { name: "Vendedor de prueba", email: "vendedor-" + suffix + "@example.test", password: passwordDemo };
    const buyer = { name: "Comprador de prueba", email: "comprador-" + suffix + "@example.test", password: passwordDemo };
    const s = await callApi("/auth/register", "POST", seller, undefined, 201);
    await callApi("/auth/register", "POST", buyer, undefined, 201);

    const categoryIds = {};
    for (const [key, title] of Object.entries({
      components: "Componentes",
      peripherals: "Perifericos",
      computers: "Computadores y pantallas",
      networks: "Redes y conectividad",
      accessories: "Accesorios",
    })) {
      const item = await callApi("/categories", "POST", { name: title + " demo " + suffix }, s.accessToken, 201);
      categoryIds[key] = item.id;
    }
    // 24 publicaciones simuladas pero REALMENTE persistidas en PostgreSQL.
    // Una cuenta vendedor de prueba; no confundir con 240 fichas solo ilustrativas.
    const products = [
      { name: "Memoria RAM demo 8 GB", description: "Memoria ficticia DDR4 de 8 GB para pruebas de filtros y stock.", stock: 1, price: 24990,
        technical: { profile: "memory", text: "8 GB DDR4 DIMM 2666 MT/s", values: { ramGb: 8, ramType: "DDR4", ramFormat: "DIMM", ramSpeed: 2666 } } },
      { name: "Memoria RAM demo 16 GB", description: "Memoria ficticia DDR4 de 16 GB para pruebas de compra.", stock: 2, price: 39990,
        technical: { profile: "memory", text: "2x8 GB DDR4 DIMM 3200 MT/s", values: { ramGb: 16, ramType: "DDR4", ramFormat: "DIMM", ramSpeed: 3200 } } },
      { name: "Tarjeta de video demo RTX 4060", description: "Tarjeta grafica ficticia para comprobar publicaciones y precios.", stock: 1, price: 199990,
        technical: { profile: "graphics", text: "RTX 4060 GDDR6 8 GB", values: { gpuModel: "RTX 4060", vramGb: 8, vramType: "GDDR6", vramBusBits: 128 } } },
      { name: "SSD NVMe 1 TB demo", description: "Unidad solida ficticia para pruebas de catalogo y carrito.", stock: 6, price: 52990 },
      { name: "Procesador Ryzen 5 demo", description: "Procesador ficticio para demostracion academica del marketplace.", stock: 3, price: 109990 },
      { name: "Placa madre B550 demo", description: "Placa base ficticia para demostracion de publicaciones SQL.", stock: 4, price: 79990 },
      { categoryKey: "peripherals", name: "Teclado mecanico demo", description: "Teclado ficticio para demostrar pedidos y mensajes del vendedor.", stock: 2, price: 17990 },
      { categoryKey: "peripherals", name: "Mouse inalambrico demo", description: "Mouse ficticio para probar favoritos y agregar al carrito.", stock: 5, price: 12990 },
      { categoryKey: "peripherals", name: "Audifonos Bluetooth demo", description: "Audifonos de muestra para probar la busqueda del catalogo.", stock: 3, price: 21990 },
      { categoryKey: "peripherals", name: "Webcam USB 1080p demo", description: "Camara web ficticia para demostrar las categorias.", stock: 4, price: 25990 },
      { categoryKey: "peripherals", name: "Microfono USB demo", description: "Microfono de prueba para demostrar publicaciones.", stock: 2, price: 34990 },
      { categoryKey: "peripherals", name: "Impresora 3D compacta demo", description: "Impresora ficticia usada como ejemplo de producto tecnologico.", stock: 1, price: 239990 },
      { categoryKey: "computers", name: "Notebook 14 pulgadas demo", description: "Portatil de muestra para una publicacion de comprador y vendedor.", stock: 2, price: 289990 },
      { categoryKey: "computers", name: "Monitor 24 pulgadas IPS demo", description: "Monitor ficticio para comprobar precios y estados del catálogo.", stock: 4, price: 79990 },
      { categoryKey: "computers", name: "Monitor ultrawide 34 pulgadas demo", description: "Monitor de muestra para pruebas de navegación.", stock: 1, price: 249990 },
      { categoryKey: "computers", name: "Tablet 10 pulgadas demo", description: "Tableta de muestra para el marketplace universitario.", stock: 3, price: 119990 },
      { categoryKey: "networks", name: "Router WiFi 6 demo", description: "Router de muestra para comprobar filtros por categoria.", stock: 3, price: 59990 },
      { categoryKey: "networks", name: "Switch de red 8 puertos demo", description: "Switch ficticio utilizado en la demostracion SQL.", stock: 2, price: 35990 },
      { categoryKey: "networks", name: "Kit de red Ethernet demo", description: "Kit ficticio de cables y conectividad del campus.", stock: 6, price: 14990 },
      { categoryKey: "networks", name: "Adaptador de red USB demo", description: "Adaptador ficticio para ampliar el catalogo de la demo.", stock: 5, price: 12990 },
      { categoryKey: "accessories", name: "Powerbank 20000 mAh demo", description: "Bateria externa de muestra para el marketplace.", stock: 4, price: 26990 },
      { categoryKey: "accessories", name: "Cargador USB-C 65W demo", description: "Cargador ficticio para probar el flujo de compra.", stock: 5, price: 19990 },
      { categoryKey: "accessories", name: "Soporte de notebook demo", description: "Soporte ergonomico ficticio para una publicacion.", stock: 4, price: 15990 },
      { categoryKey: "accessories", name: "Mochila para notebook demo", description: "Mochila de muestra para pruebas de catalogo.", stock: 3, price: 24990 },
    ];
    const created = [];
    for (const product of products) {
      const { categoryKey = "components", ...payload } = product;
      const item = await callApi("/products", "POST",
        { ...payload, categoryId: categoryIds[categoryKey] }, s.accessToken, 201);
      created.push({ name: item.name, id: item.id });
    }
    console.log("\n========== NEXUSTECH EN EJECUCION SIN DOCKER ==========");
    console.log("Web:     " + uiUrl);
    console.log("Swagger: " + apiUrl + "/docs");
    console.log("Estado SQL+NoSQL: " + apiUrl + "/api/v1/health/ready");
    console.log("Vendedor: " + seller.email);
    console.log("Comprador: " + buyer.email);
    console.log("Clave de ambas cuentas: " + passwordDemo);
    console.log("Productos ficticios (UUID):");
    for (const item of created) console.log(" - " + item.name + " | " + item.id);
    console.log("Los pagos y despachos son simulados. Los datos temporales se eliminan al cerrar.");
    console.log("Deja esta terminal abierta mientras practicas. Presiona Ctrl+C para salir.\n");
    await new Promise(resolve => {
      process.once("SIGINT", resolve);
      process.once("SIGTERM", resolve);
      api.once("exit", resolve);
      front.once("exit", resolve);
    });
  } finally {
    for (const child of children.reverse())
      if (child.exitCode === null) {
        const ended = once(child, "exit");
        child.kill();
        await ended;
      }
    if (pg.process?.exitCode === null) {
      const owned = pg.process;
      const ctl = join(dirname(owned.spawnfile), process.platform === "win32" ? "pg_ctl.exe" : "pg_ctl");
      await exec(ctl, ["-D", directory, "-m", "fast", "-w", "-t", "30", "stop"], { timeout: 45000 });
      if (owned.exitCode === null) await once(owned, "exit");
    }
    pg.process = undefined;
    await mongo?.stop();
    const ownedDirectory = resolve(directory);
    if (!ownedDirectory.startsWith(resolve(tmpdir()) + sep + "nexustech-react-pg-")) throw new Error("Unexpected test directory");
    await rm(ownedDirectory, { recursive: true, force: true });
  }
})().catch((error) => {
  console.error("Integration runner failed:", error.message);
  process.exitCode = 1;
});
