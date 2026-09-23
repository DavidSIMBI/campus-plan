const pool = require("../config/database");

const statuses = new Set(["Not Started", "Preparing", "Ready", "Completed"]);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function presentationFromRow(row) {
  return {
    id: row.id,
    title: row.title,
    course: row.course,
    description: row.description || "",
    date: row.presentation_date,
    group: row.group_name || "",
    part: row.my_part || "",
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizePresentation(body) {
  return {
    title: String(body.title || "").trim(),
    course: String(body.course || "").trim(),
    description: String(body.description || "").trim(),
    date: String(body.date || body.presentation_date || "").trim(),
    group: String(body.group || body.group_name || "").trim(),
    part: String(body.part || body.my_part || "").trim(),
    status: String(body.status || "Not Started").trim(),
  };
}

function validatePresentation(data) {
  if (!data.title) return "Presentation title is required.";
  if (!data.course) return "Course is required.";
  const [year, month, day] = data.date.split("-").map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  const validDate =
    datePattern.test(data.date) &&
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day;
  if (!validDate) return "A valid presentation date is required.";
  if (!statuses.has(data.status)) return "Invalid presentation status.";
  return null;
}

const selectFields = `
  SELECT id, title, course, description,
         DATE_FORMAT(presentation_date, '%Y-%m-%d') AS presentation_date,
         group_name, my_part, status, created_at, updated_at
  FROM presentations`;

async function listPresentations(req, res) {
  try {
    const [rows] = await pool.execute(
      `${selectFields} WHERE user_id = ? ORDER BY presentation_date ASC, id ASC`,
      [req.user.id],
    );
    return res.json({ success: true, presentations: rows.map(presentationFromRow) });
  } catch (error) {
    console.error("List presentations error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load presentations right now." });
  }
}

async function getPresentation(req, res) {
  try {
    const [rows] = await pool.execute(
      `${selectFields} WHERE id = ? AND user_id = ? LIMIT 1`,
      [req.params.id, req.user.id],
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: "Presentation not found." });
    return res.json({ success: true, presentation: presentationFromRow(rows[0]) });
  } catch (error) {
    console.error("Get presentation error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load the presentation right now." });
  }
}

async function createPresentation(req, res) {
  const data = normalizePresentation(req.body);
  const validationError = validatePresentation(data);
  if (validationError) return res.status(400).json({ success: false, message: validationError });
  try {
    const [result] = await pool.execute(
      `INSERT INTO presentations
        (user_id, title, course, description, presentation_date, group_name, my_part, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, data.title, data.course, data.description || null, data.date, data.group || null, data.part || null, data.status],
    );
    const [rows] = await pool.execute(`${selectFields} WHERE id = ? AND user_id = ? LIMIT 1`, [result.insertId, req.user.id]);
    return res.status(201).json({ success: true, presentation: presentationFromRow(rows[0]) });
  } catch (error) {
    console.error("Create presentation error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to create the presentation right now." });
  }
}

async function updatePresentation(req, res) {
  const data = normalizePresentation(req.body);
  const validationError = validatePresentation(data);
  if (validationError) return res.status(400).json({ success: false, message: validationError });
  try {
    const [result] = await pool.execute(
      `UPDATE presentations
       SET title = ?, course = ?, description = ?, presentation_date = ?, group_name = ?, my_part = ?, status = ?
       WHERE id = ? AND user_id = ?`,
      [data.title, data.course, data.description || null, data.date, data.group || null, data.part || null, data.status, req.params.id, req.user.id],
    );
    const [rows] = await pool.execute(`${selectFields} WHERE id = ? AND user_id = ? LIMIT 1`, [req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: "Presentation not found." });
    return res.json({ success: true, presentation: presentationFromRow(rows[0]) });
  } catch (error) {
    console.error("Update presentation error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to update the presentation right now." });
  }
}

async function deletePresentation(req, res) {
  try {
    const [result] = await pool.execute("DELETE FROM presentations WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Presentation not found." });
    return res.json({ success: true, message: "Presentation deleted." });
  } catch (error) {
    console.error("Delete presentation error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to delete the presentation right now." });
  }
}

module.exports = { listPresentations, getPresentation, createPresentation, updatePresentation, deletePresentation };