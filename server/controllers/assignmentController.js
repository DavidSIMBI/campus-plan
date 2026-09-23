const pool = require("../config/database");

const priorities = new Set(["High", "Medium", "Low"]);
const statuses = new Set(["Not Started", "In Progress", "Completed"]);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function assignmentFromRow(row) {
  return {
    id: row.id,
    title: row.title,
    course: row.course,
    description: row.description,
    dueDate: row.due_date,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeAssignment(body) {
  return {
    title: String(body.title || "").trim(),
    course: String(body.course || "").trim(),
    description: String(body.description || "").trim(),
    dueDate: String(body.dueDate || "").trim(),
    priority: String(body.priority || "Medium").trim(),
    status: String(body.status || "Not Started").trim(),
  };
}

function validateAssignment(data) {
  if (!data.title) return "Assignment title is required.";
  if (!data.course) return "Course is required.";
  if (!data.description) return "Description is required.";
  const [year, month, day] = data.dueDate.split("-").map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  const validDate =
    datePattern.test(data.dueDate) &&
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day;
  if (!validDate) {
    return "A valid due date is required.";
  }
  if (!priorities.has(data.priority)) return "Invalid assignment priority.";
  if (!statuses.has(data.status)) return "Invalid assignment status.";
  return null;
}

async function listAssignments(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT id, title, course, description,
              DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date,
              priority, status, created_at, updated_at
       FROM assignments
       WHERE user_id = ?
       ORDER BY due_date ASC, id ASC`,
      [req.user.id],
    );
    return res.json({ success: true, assignments: rows.map(assignmentFromRow) });
  } catch (error) {
    console.error("List assignments error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load assignments right now." });
  }
}

async function getAssignment(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT id, title, course, description,
              DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date,
              priority, status, created_at, updated_at
       FROM assignments
       WHERE id = ? AND user_id = ?
       LIMIT 1`,
      [req.params.id, req.user.id],
    );
    if (!rows[0]) return res.status(404).json({ success: false, message: "Assignment not found." });
    return res.json({ success: true, assignment: assignmentFromRow(rows[0]) });
  } catch (error) {
    console.error("Get assignment error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load the assignment right now." });
  }
}

async function createAssignment(req, res) {
  const data = normalizeAssignment(req.body);
  const validationError = validateAssignment(data);
  if (validationError) return res.status(400).json({ success: false, message: validationError });

  try {
    const [result] = await pool.execute(
      `INSERT INTO assignments
        (user_id, title, course, description, due_date, priority, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, data.title, data.course, data.description, data.dueDate, data.priority, data.status],
    );
    const [rows] = await pool.execute(
      `SELECT id, title, course, description,
              DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date,
              priority, status, created_at, updated_at
       FROM assignments WHERE id = ? AND user_id = ? LIMIT 1`,
      [result.insertId, req.user.id],
    );
    return res.status(201).json({ success: true, assignment: assignmentFromRow(rows[0]) });
  } catch (error) {
    console.error("Create assignment error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to create the assignment right now." });
  }
}

async function updateAssignment(req, res) {
  const data = normalizeAssignment(req.body);
  const validationError = validateAssignment(data);
  if (validationError) return res.status(400).json({ success: false, message: validationError });

  try {
    const [result] = await pool.execute(
      `UPDATE assignments
       SET title = ?, course = ?, description = ?, due_date = ?, priority = ?, status = ?
       WHERE id = ? AND user_id = ?`,
      [data.title, data.course, data.description, data.dueDate, data.priority, data.status, req.params.id, req.user.id],
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Assignment not found." });
    const [rows] = await pool.execute(
      `SELECT id, title, course, description,
              DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date,
              priority, status, created_at, updated_at
       FROM assignments WHERE id = ? AND user_id = ? LIMIT 1`,
      [req.params.id, req.user.id],
    );
    return res.json({ success: true, assignment: assignmentFromRow(rows[0]) });
  } catch (error) {
    console.error("Update assignment error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to update the assignment right now." });
  }
}

async function deleteAssignment(req, res) {
  try {
    const [result] = await pool.execute(
      "DELETE FROM assignments WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id],
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Assignment not found." });
    return res.json({ success: true, message: "Assignment deleted." });
  } catch (error) {
    console.error("Delete assignment error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to delete the assignment right now." });
  }
}

module.exports = {
  listAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
};