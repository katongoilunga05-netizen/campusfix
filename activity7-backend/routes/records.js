const express = require("express");
const pool = require("../db");
const { cleanRecord, parseId } = require("../validate");

const router = express.Router();

const SELECT_COLUMNS = "id, title, category, description, status";

function toRecord(row) {
  return {
    id: Number(row.id),
    title: row.title,
    category: row.category,
    description: row.description,
    status: row.status
  };
}

router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT ${SELECT_COLUMNS} FROM records ORDER BY id`
    );
    res.status(200).json(result.rows.map(toRecord));
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const result = await pool.query(
      `SELECT ${SELECT_COLUMNS} FROM records WHERE id = $1`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Record not found." });
    }
    res.status(200).json(toRecord(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const record = cleanRecord(req.body);
    const result = await pool.query(
      `INSERT INTO records (title, category, description, status)
       VALUES ($1, $2, $3, $4)
       RETURNING ${SELECT_COLUMNS}`,
      [record.title, record.category, record.description, record.status]
    );
    res.status(201).json(toRecord(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const record = cleanRecord(req.body);
    const result = await pool.query(
      `UPDATE records
       SET title = $1, category = $2, description = $3, status = $4
       WHERE id = $5
       RETURNING ${SELECT_COLUMNS}`,
      [record.title, record.category, record.description, record.status, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Record not found." });
    }
    res.status(200).json(toRecord(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const result = await pool.query(
      "DELETE FROM records WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Record not found." });
    }
    res.status(200).json({ message: "Record deleted." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
