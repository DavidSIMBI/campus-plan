const pool = require("../config/database");

const priorities = new Set(["High", "Medium", "Low"]);
const eventTypes = new Set(["Personal", "Study", "Meeting", "Other"]);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

function eventFromRow(row) {
  return {
    id: row.id,
    title: row.title,
    date: row.event_date,
    startTime: row.event_time ? String(row.event_time).slice(0, 5) : "",
    endTime: row.event_end_time ? String(row.event_end_time).slice(0, 5) : "",
    description: row.description || "",
    priority: row.priority,
    type: row.event_type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeEvent(body) {
  return {
    title: String(body.title || "").trim(),
    date: String(body.date || body.event_date || "").trim(),
    startTime: String(body.startTime || body.event_time || "").trim(),
    endTime: String(body.endTime || body.event_end_time || "").trim(),
    description: String(body.description || "").trim(),
    priority: String(body.priority || "Medium").trim(),
    type: String(body.type || body.event_type || "Personal").trim(),
  };
}

function validateEvent(data) {
  if (!data.title) return "Event title is required.";
  const [year, month, day] = data.date.split("-").map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  const validDate =
    datePattern.test(data.date) &&
    !Number.isNaN(parsedDate.getTime()) &&
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day;
  if (!validDate) return "A valid event date is required.";
  if (data.startTime && !timePattern.test(data.startTime)) return "A valid event time is required.";
  if (data.endTime && !timePattern.test(data.endTime)) return "A valid event end time is required.";
  if (data.endTime && !data.startTime) return "Add a start time before setting an end time.";
  if (data.startTime && data.endTime && data.endTime <= data.startTime) return "End time must be after the start time.";
  if (!priorities.has(data.priority)) return "Invalid event priority.";
  if (!eventTypes.has(data.type)) return "Invalid event type.";
  return null;
}

const selectFields = `
  SELECT id, title, DATE_FORMAT(event_date, '%Y-%m-%d') AS event_date,
         TIME_FORMAT(event_time, '%H:%i') AS event_time,
         TIME_FORMAT(event_end_time, '%H:%i') AS event_end_time,
         description, priority, event_type, created_at, updated_at
  FROM calendar_events`;

async function listEvents(req, res) {
  try {
    const [rows] = await pool.execute(`${selectFields} WHERE user_id = ? ORDER BY event_date ASC, event_time ASC, id ASC`, [req.user.id]);
    return res.json({ success: true, events: rows.map(eventFromRow) });
  } catch (error) {
    console.error("List calendar events error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load calendar events right now." });
  }
}

async function getEvent(req, res) {
  try {
    const [rows] = await pool.execute(`${selectFields} WHERE id = ? AND user_id = ? LIMIT 1`, [req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: "Calendar event not found." });
    return res.json({ success: true, event: eventFromRow(rows[0]) });
  } catch (error) {
    console.error("Get calendar event error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load the calendar event right now." });
  }
}

async function createEvent(req, res) {
  const data = normalizeEvent(req.body);
  const validationError = validateEvent(data);
  if (validationError) return res.status(400).json({ success: false, message: validationError });
  try {
    const [result] = await pool.execute(
      `INSERT INTO calendar_events
        (user_id, title, event_date, event_time, event_end_time, description, priority, event_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, data.title, data.date, data.startTime || null, data.endTime || null, data.description || null, data.priority, data.type],
    );
    const [rows] = await pool.execute(`${selectFields} WHERE id = ? AND user_id = ? LIMIT 1`, [result.insertId, req.user.id]);
    return res.status(201).json({ success: true, event: eventFromRow(rows[0]) });
  } catch (error) {
    console.error("Create calendar event error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to create the calendar event right now." });
  }
}

async function updateEvent(req, res) {
  const data = normalizeEvent(req.body);
  const validationError = validateEvent(data);
  if (validationError) return res.status(400).json({ success: false, message: validationError });
  try {
    await pool.execute(
      `UPDATE calendar_events
      SET title = ?, event_date = ?, event_time = ?, event_end_time = ?, description = ?, priority = ?, event_type = ?
       WHERE id = ? AND user_id = ?`,
      [data.title, data.date, data.startTime || null, data.endTime || null, data.description || null, data.priority, data.type, req.params.id, req.user.id],
    );
    const [rows] = await pool.execute(`${selectFields} WHERE id = ? AND user_id = ? LIMIT 1`, [req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: "Calendar event not found." });
    return res.json({ success: true, event: eventFromRow(rows[0]) });
  } catch (error) {
    console.error("Update calendar event error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to update the calendar event right now." });
  }
}

async function deleteEvent(req, res) {
  try {
    const [result] = await pool.execute("DELETE FROM calendar_events WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Calendar event not found." });
    return res.json({ success: true, message: "Calendar event deleted." });
  } catch (error) {
    console.error("Delete calendar event error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to delete the calendar event right now." });
  }
}

module.exports = { listEvents, getEvent, createEvent, updateEvent, deleteEvent };