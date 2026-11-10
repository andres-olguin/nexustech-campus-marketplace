console.log("[RUNNER] Starting isolated integration test runner...");
const { spawn, execFile } = require("node:child_process");
const { promisify } = require("node:util");
const { once } = require("node:events");
const { mkdtemp, rm } = require("node:fs/promises");
const { existsSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join, resolve, dirname, sep } = require("node:path");
const { pathToFileURL } = require("node:url");
const { randomBytes } = require("node:crypto");
const exec = promisify(execFile);
const root = resolve(__dirname, "..");
const backend = resolve(root, "../backend");
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
    postgresFlags: ["-c", "io_method=sync"],
    onLog: () => {},
    onError: () => {},
  });
  let mongo;
  try {
    const { MongoMemoryServer } = require(require.resolve("mongodb-memory-server", { paths: [backend] }));
    mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 120000, storageEngine: "wiredTiger" } });
    console.log("[RUNNER] Starting postgres...");
    await pg.initialise();
    await pg.start();
    await pg.createDatabase("nexustech_browser_test");
    console.log("[RUNNER] Postgres started, compiling typescript...");
    const env = {
      ...process.env,
      DATABASE_URL: `postgresql://postgres:${password}@localhost:${pgPort}/nexustech_browser_test`,
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
    await ready(apiUrl + "/api/v1/health", api);
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
      "Isolated real PostgreSQL + canonical Nest API + Vite are ready. Running browser flow.",
    );
    const channel =
      process.env.PW_BROWSER_CHANNEL ||
      (process.platform === "win32" &&
      existsSync("C:/Program Files/Google/Chrome/Application/chrome.exe")
        ? "chrome"
        : "");
    const runner = spawn(
      process.execPath,
      [join(root, "node_modules/@playwright/test/cli.js"), "test", ...process.argv.slice(2)],
      {
        cwd: root,
        windowsHide: true,
        stdio: "inherit",
        env: {
          ...process.env,
          PW_BROWSER_CHANNEL: channel,
          TEST_API_URL: apiUrl + "/api/v1",
          TEST_UI_URL: uiUrl,
        },
      },
    );
    const [code] = await once(runner, "exit");
    process.exitCode = code ?? 1;
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
