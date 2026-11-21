/**
 * Starts a PostgreSQL server on this computer when PostgreSQL is not installed.
 * The CampusFix API does not import this file. Render uses DATABASE_URL instead.
 */
import EmbeddedPostgres from "embedded-postgres";
import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));
const database = new EmbeddedPostgres({
  databaseDir: path.join(directory, ".pgdata"),
  user: "postgres",
  password: "campusfix",
  port: 5433,
  persistent: true,
  autoRehydrateSymlinks: true,
  initdbFlags: ["--encoding=UTF8", "--locale=C"]
});

await database.initialise();
await database.start();

try {
  await database.createDatabase("campusfix");
  console.log("Created database campusfix");
} catch (error) {
  const message = String(error && error.message ? error.message : error);
  if (!/already exists/i.test(message)) {
    throw error;
  }
  console.log("Database campusfix already exists");
}

console.log("PostgreSQL listening on 127.0.0.1:5433");

process.on("SIGINT", async () => {
  await database.stop();
  process.exit(0);
});
