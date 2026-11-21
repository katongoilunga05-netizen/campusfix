require("dotenv").config();
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const studentNumber = process.env.STUDENT_NUMBER || "202508737";

const origins = (process.env.CLIENT_ORIGINS || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

app.set("trust proxy", 1);
app.use(cors({ origin: origins }));
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).type("html").send(renderGuide(requestBaseUrl(req)));
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error(error);
    res.status(503).json({ message: "Database is unavailable." });
  }
});

app.use("/api/records", require("./routes/records"));

app.use((req, res) => {
  res.status(404).json({ message: "That route does not exist." });
});

app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Request body must be valid JSON." });
  }

  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error(error);
  res.status(500).json({ message: "The server could not complete the request." });
});

function requestBaseUrl(req) {
  return `${req.protocol}://${req.get("host")}`;
}

function renderGuide(baseUrl) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CampusFix API guide</title>
  <style>
    body { margin: 0; font-family: "Segoe UI", system-ui, sans-serif; background: #f3f5f8; color: #1c2836; }
    header, main { padding: 1.25rem 1.5rem; }
    header { background: #0c2340; color: #fff; }
    h1 { margin: 0.2rem 0; }
    a { color: #1456a0; }
    header a { color: #fff; }
    table { width: 100%; border-collapse: collapse; background: #fff; }
    th, td { border: 1px solid #d5dce6; padding: 0.5rem; text-align: left; vertical-align: top; }
    pre { background: #fff; border: 1px solid #d5dce6; padding: 0.8rem; overflow-x: auto; }
    code { color: #0c2340; }
  </style>
</head>
<body>
  <header>
    <p>Mulungushi University · ICT251 · Activity 7</p>
    <h1>CampusFix API</h1>
    <p>Campus Maintenance Management System. Katongo Ilunga, student number ${studentNumber}.</p>
  </header>
  <main>
    <p>This service stores maintenance requests for broken lights, taps, furniture, and other campus faults. The first request to a free host can take a minute while the service wakes up.</p>
    <p>Base URL: <a href="${baseUrl}/">${baseUrl}</a></p>
    <p><a href="${baseUrl}/health">Health check</a> · <a href="${baseUrl}/api/records">All records</a></p>
    <h2>Routes</h2>
    <table>
      <thead><tr><th>Method</th><th>Path</th><th>Success</th></tr></thead>
      <tbody>
        <tr><td>GET</td><td>/</td><td>200 HTML guide</td></tr>
        <tr><td>GET</td><td>/health</td><td>200 when the database responds. 503 when it does not.</td></tr>
        <tr><td>GET</td><td>/api/records</td><td>200 and an array of records</td></tr>
        <tr><td>GET</td><td>/api/records/:id</td><td>200 and one record</td></tr>
        <tr><td>POST</td><td>/api/records</td><td>201 and the saved record, including its new id</td></tr>
        <tr><td>PUT</td><td>/api/records/:id</td><td>200 and the updated record. The id does not change.</td></tr>
        <tr><td>DELETE</td><td>/api/records/:id</td><td>200 and {"message":"Record deleted."}</td></tr>
      </tbody>
    </table>
    <h2>Fields</h2>
    <ul>
      <li><code>title</code>: text, 3 to 80 characters</li>
      <li><code>category</code>: text, 2 to 40 characters</li>
      <li><code>description</code>: text, 5 to 300 characters</li>
      <li><code>status</code>: exactly Pending, In progress, or Completed</li>
    </ul>
    <p>POST and PUT send only those four fields. The database creates the id. Spaces at the ends of text are removed before the length is checked.</p>
    <h2>Example body for POST and PUT</h2>
    <pre>{
  "title": "Broken classroom light",
  "category": "Electrical",
  "description": "The light in Room B12 does not switch on.",
  "status": "Pending"
}</pre>
    <h2>Status codes</h2>
    <ul>
      <li>200: a successful read, update, delete, guide, or health check</li>
      <li>201: a record was created</li>
      <li>400: invalid input, a bad id, or malformed JSON. The body is {"message":"..."}</li>
      <li>404: the record or route does not exist</li>
      <li>500: an unexpected server error</li>
      <li>503: the health check cannot reach the database</li>
    </ul>
  </main>
</body>
</html>`;
}

async function prepareDatabase() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  const seed = fs.readFileSync(path.join(__dirname, "seed.sql"), "utf8");
  await pool.query(schema);
  await pool.query(seed);
}

async function start() {
  try {
    await prepareDatabase();
    console.log("Database ready");
  } catch (error) {
    console.error("Database setup failed. GET /health will report it.");
    console.error(error);
  }

  const port = process.env.PORT || 3000;
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on port ${port}`);
  });
}

start();
