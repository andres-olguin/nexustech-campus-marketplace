console.log("[RUNNER] Starting isolated integration test runner...");
const { spawn, execFile } = require("node:child_process");
const { promisify } = require("node:util");
const { once } = require("node:events");
const { mkdtemp } = require("node:fs/promises");
const { existsSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join, resolve } = require("node:path");
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
async function ready(url, child) {
  for (let i = 0; i < 100; i++) {
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
  const pg = new EmbeddedPostgres({
    databaseDir: directory,
    user: "postgres",
    password,
    port: 55449,
    persistent: false,
    initdbFlags: ["--locale=C", "--encoding=UTF8"],
    postgresFlags: ["-c", "io_method=sync"],
    onLog: () => {},
    onError: () => {},
  });
  try {
    console.log("[RUNNER] Starting postgres...");
    await pg.initialise();
    await pg.start();
    await pg.createDatabase("nexustech_browser_test");
    console.log("[RUNNER] Postgres started, compiling typescript...");
    const env = {
      ...process.env,
      DATABASE_URL: `postgresql://postgres:${password}@localhost:55449/nexustech_browser_test`,
      JWT_SECRET: randomBytes(48).toString("hex"),
      PORT: "55450",
      CORS_ORIGINS: "http://127.0.0.1:5178",
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
    await ready("http://127.0.0.1:55450/api/v1/health", api);
    const front = launch(
      [
        join(root, "node_modules/vite/bin/vite.js"),
        "--host",
        "127.0.0.1",
        "--port",
        "5178",
        "--strictPort",
      ],
      root,
      { ...process.env, VITE_API_BASE_URL: "http://127.0.0.1:55450/api/v1" },
      "VITE"
    );
    await ready("http://127.0.0.1:5178", front);
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
      [join(root, "node_modules/@playwright/test/cli.js"), "test"],
      {
        cwd: root,
        windowsHide: true,
        stdio: "inherit",
        env: {
          ...process.env,
          PW_BROWSER_CHANNEL: channel,
          TEST_API_URL: "http://127.0.0.1:55450/api/v1",
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
    await pg.stop();
  }
})().catch((error) => {
  console.error("Integration runner failed:", error.message);
  process.exitCode = 1;
});
