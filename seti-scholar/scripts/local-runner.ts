/**
 * Zero-Docker local runner. Uses an embedded PostgreSQL (real Postgres
 * binaries fetched via npm — no Docker, no system install) so the only
 * prerequisite on any machine is Node.js.
 *
 *   npx tsx scripts/local-runner.ts setup   # init DB, schema, content, ASU plan
 *   npx tsx scripts/local-runner.ts start   # start DB + app server (Ctrl+C stops both)
 *
 * Data persists in .pgdata/ next to the app.
 */

import { spawn, spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import EmbeddedPostgres from "embedded-postgres";

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, ".pgdata");
const PORT = 5433; // avoid clashing with any system Postgres on 5432
const DB_NAME = "seti_scholar";
const DATABASE_URL = `postgresql://postgres:postgres@localhost:${PORT}/${DB_NAME}`;

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: "postgres",
  password: "postgres",
  port: PORT,
  persistent: true,
});

function run(cmd: string, args: string[], extraEnv: Record<string, string> = {}) {
  const res = spawnSync(cmd, args, {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, DATABASE_URL, ...extraEnv },
  });
  if (res.status !== 0) {
    throw new Error(`${cmd} ${args.join(" ")} exited with ${res.status}`);
  }
}

async function ensureCluster() {
  if (!existsSync(path.join(DATA_DIR, "PG_VERSION"))) {
    // A failed earlier init can leave a partial data dir that blocks initdb.
    if (existsSync(DATA_DIR)) rmSync(DATA_DIR, { recursive: true, force: true });
    console.log("[db] Initialising embedded PostgreSQL cluster…");
    await pg.initialise();
  }
  await pg.start();
  const client = pg.getPgClient();
  await client.connect();
  const exists = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [DB_NAME]);
  await client.end();
  if (exists.rowCount === 0) await pg.createDatabase(DB_NAME);
}

async function setup() {
  await ensureCluster();
  console.log("[db] Applying schema…");
  run("npx", ["prisma", "db", "push", "--skip-generate"]);
  console.log("[db] Seeding content + demo user…");
  run("npx", ["tsx", "prisma/seed.ts"]);
  console.log("[db] Importing the official ASU degree plan…");
  run("npx", ["tsx", "scripts/import-asu-aps-map.ts"]);
  await pg.stop();
  console.log("[db] Setup complete.");
}

async function start() {
  await ensureCluster();
  console.log(`[db] Embedded PostgreSQL running on port ${PORT}`);
  console.log("[app] Starting SETI Scholar at http://localhost:3000 …");

  const server = spawn("npx", ["next", "start"], {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, DATABASE_URL },
  });

  let shuttingDown = false;
  const shutdown = async (code: number) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log("\n[app] Shutting down…");
    try {
      server.kill();
    } catch {
      /* already gone */
    }
    try {
      await pg.stop();
    } catch {
      /* already stopped */
    }
    process.exit(code);
  };

  server.on("exit", (code) => void shutdown(code ?? 0));
  process.on("SIGINT", () => void shutdown(0));
  process.on("SIGTERM", () => void shutdown(0));
}

const mode = process.argv[2];
const main = mode === "setup" ? setup : mode === "start" ? start : null;
if (!main) {
  console.error("Usage: tsx scripts/local-runner.ts <setup|start>");
  process.exit(1);
}
main().catch((err) => {
  const message = err instanceof Error ? err.message : String(err);
  if (message.includes("administrative permissions")) {
    console.error(
      "\n[!] PostgreSQL refuses to run with administrator rights." +
        "\n    Close this window and double-click the launcher NORMALLY" +
        "\n    (do not use 'Run as administrator').\n",
    );
  } else {
    console.error(message);
  }
  process.exit(1);
});
