require("dotenv").config();
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing. Copy .env.example to .env and set your PostgreSQL connection string.");
}

/**
 * Hosted PostgreSQL (Render, Neon, and similar) expects SSL.
 * A database on this computer does not. DATABASE_SSL can force either choice.
 */
function needsSsl(url) {
  if (process.env.DATABASE_SSL === "true") {
    return true;
  }
  if (process.env.DATABASE_SSL === "false") {
    return false;
  }
  return !/localhost|127\.0\.0\.1/i.test(url);
}

const pool = new Pool({
  connectionString,
  ssl: needsSsl(connectionString) ? { rejectUnauthorized: false } : undefined
});

module.exports = pool;
