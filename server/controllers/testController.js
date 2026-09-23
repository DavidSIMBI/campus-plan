const pool = require("../config/database");

const statuses = new Set(["Upcoming", "Completed", "Missed"]);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

function testFromRow(row) {
  return {
    id: row.id,
    title: row.title,
    course: row.course,
    description: row.description || "",
    date: row.test_date,
    time: row.test_time ? String(row.test_time).slice(0, 5) : "",
    room: row.room || "",
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeTest(body) {
  return {
    title: String(body.title || "").trim(),
    course: String(body.course || "").trim(),
    description: String(body.description || "").trim(),
    date: String(body.date || body.test_date || "").trim(),
    time: String(body.time || body.test_time || "").trim(),
    room: String(body.room || "").trim(),
    status: String(body.status || "Upcoming").trim(),
  };
}

function validateTest(data) {
  if (!data.title) return "Test title is required.";
  if (!data.course) return "Course is required.";
  const [year, month, day] = data.date.split("-").map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  const validDate =
    datePattern.test(data.date) &&
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day;
  if (!validDate) return "A valid test date is required.";
  if (data.time && !timePattern.test(data.time)) return "A valid test time is required.";
  if (!statuses.has(data.status)) return "Invalid test status.";
  return null;
}

const selectFields = `
  SELECT id, title, course, description,
         DATE_FORMAT(test_date, '%Y-%m-%d') AS test_date,
         TIME_FORMAT(test_time, '%H:%i') AS test_time,
         room, status, created_at, updated_at
  FROM tests`;

async function listTests(req, res) {
  try {
    const [rows] = await pool.execute(
      `${selectFields} WHERE user_id = ? ORDER BY test_date ASC, test_time ASC, id ASC`,
      [req.user.id],
    );
    return res.json({ success: true, tests: rows.map(testFromRow) });
  } catch (error) {
    console.error("List tests error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load tests right now." });
  }
}

async function getTest(req, res) {
  try {
    const [rows] = await pool.execute(
      `${selectFields} WHERE id = ? AND user_id = ? LIMIT 1`,
      [req.params.id, req.user.id],
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: "Test not found." });
    return res.json({ success: true, test: testFromRow(rows[0]) });
  } catch (error) {
    console.error("Get test error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load the test right now." });
  }
}

async function createTest(req, res) {
  const data = normalizeTest(req.body);
  const validationError = validateTest(data);
  if (validationError) return res.status(400).json({ success: false, message: validationError });
  try {
    const [result] = await pool.execute(
      `INSERT INTO tests
        (user_id, title, course, description, test_date, test_time, room, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, data.title, data.course, data.description || null, data.date, data.time || null, data.room || null, data.status],
    );
    const [rows] = await pool.execute(`${selectFields} WHERE id = ? AND user_id = ? LIMIT 1`, [result.insertId, req.user.id]);
    return res.status(201).json({ success: true, test: testFromRow(rows[0]) });
  } catch (error) {
    console.error("Create test error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to create the test right now." });
  }
}

async function updateTest(req, res) {
  const data = normalizeTest(req.body);
  const validationError = validateTest(data);
  if (validationError) return res.status(400).json({ success: false, message: validationError });
  try {
    const [result] = await pool.execute(
      `UPDATE tests
       SET title = ?, course = ?, description = ?, test_date = ?, test_time = ?, room = ?, status = ?
       WHERE id = ? AND user_id = ?`,
      [data.title, data.course, data.description || null, data.date, data.time || null, data.room || null, data.status, req.params.id, req.user.id],
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Test not found." });
    const [rows] = await pool.execute(`${selectFields} WHERE id = ? AND user_id = ? LIMIT 1`, [req.params.id, req.user.id]);
    return res.json({ success: true, test: testFromRow(rows[0]) });
  } catch (error) {
    console.error("Update test error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to update the test right now." });
  }
}

async function deleteTest(req, res) {
  try {
    const [result] = await pool.execute("DELETE FROM tests WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Test not found." });
    return res.json({ success: true, message: "Test deleted." });
  } catch (error) {
    console.error("Delete test error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to delete the test right now." });
  }
}

module.exports = { listTests, getTest, createTest, updateTest, deleteTest };