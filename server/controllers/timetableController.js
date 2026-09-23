const pool = require("../config/database");

const days = new Set(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]);
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

function timetableFromRow(row) {
  return {
    id: row.id,
    courseName: row.course_name,
    courseCode: row.course_code || "",
    day: row.day_of_week,
    startTime: row.start_time ? String(row.start_time).slice(0, 5) : "",
    endTime: row.end_time ? String(row.end_time).slice(0, 5) : "",
    room: row.room || "",
    lecturer: row.lecturer || "",
    notes: row.notes || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeTimetable(body) {
  return {
    courseName: String(body.courseName || body.course_name || "").trim(),
    courseCode: String(body.courseCode || body.course_code || "").trim(),
    day: String(body.day || body.dayOfWeek || body.day_of_week || "").trim(),
    startTime: String(body.startTime || body.start_time || "").trim(),
    endTime: String(body.endTime || body.end_time || "").trim(),
    room: String(body.room || "").trim(),
    lecturer: String(body.lecturer || "").trim(),
    notes: String(body.notes || "").trim(),
  };
}

function validateTimetable(data) {
  if (!data.courseName) return "Course or module name is required.";
  if (!days.has(data.day)) return "A valid day is required.";
  if (!timePattern.test(data.startTime) || !timePattern.test(data.endTime)) {
    return "Valid start and end times are required.";
  }
  if (data.endTime <= data.startTime) return "End time must be after the start time.";
  return null;
}

const selectFields = `
  SELECT id, course_name, course_code, day_of_week,
         TIME_FORMAT(start_time, '%H:%i') AS start_time,
         TIME_FORMAT(end_time, '%H:%i') AS end_time,
         room, lecturer, notes, created_at, updated_at
  FROM timetable`;

async function listTimetable(req, res) {
  try {
    const [rows] = await pool.execute(
      `${selectFields} WHERE user_id = ? ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), start_time, id`,
      [req.user.id],
    );
    return res.json({ success: true, timetable: rows.map(timetableFromRow) });
  } catch (error) {
    console.error("List timetable error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load the timetable right now." });
  }
}

async function getTimetableEntry(req, res) {
  try {
    const [rows] = await pool.execute(`${selectFields} WHERE id = ? AND user_id = ? LIMIT 1`, [req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: "Timetable entry not found." });
    return res.json({ success: true, timetableEntry: timetableFromRow(rows[0]) });
  } catch (error) {
    console.error("Get timetable entry error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load the timetable entry right now." });
  }
}

async function createTimetableEntry(req, res) {
  const data = normalizeTimetable(req.body);
  const validationError = validateTimetable(data);
  if (validationError) return res.status(400).json({ success: false, message: validationError });
  try {
    const [result] = await pool.execute(
      `INSERT INTO timetable
        (user_id, course_name, course_code, day_of_week, start_time, end_time, room, lecturer, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, data.courseName, data.courseCode || null, data.day, data.startTime, data.endTime, data.room || null, data.lecturer || null, data.notes || null],
    );
    const [rows] = await pool.execute(`${selectFields} WHERE id = ? AND user_id = ? LIMIT 1`, [result.insertId, req.user.id]);
    return res.status(201).json({ success: true, timetableEntry: timetableFromRow(rows[0]) });
  } catch (error) {
    console.error("Create timetable entry error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to create the timetable entry right now." });
  }
}

async function updateTimetableEntry(req, res) {
  const data = normalizeTimetable(req.body);
  const validationError = validateTimetable(data);
  if (validationError) return res.status(400).json({ success: false, message: validationError });
  try {
    await pool.execute(
      `UPDATE timetable
       SET course_name = ?, course_code = ?, day_of_week = ?, start_time = ?, end_time = ?, room = ?, lecturer = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
      [data.courseName, data.courseCode || null, data.day, data.startTime, data.endTime, data.room || null, data.lecturer || null, data.notes || null, req.params.id, req.user.id],
    );
    const [rows] = await pool.execute(`${selectFields} WHERE id = ? AND user_id = ? LIMIT 1`, [req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: "Timetable entry not found." });
    return res.json({ success: true, timetableEntry: timetableFromRow(rows[0]) });
  } catch (error) {
    console.error("Update timetable entry error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to update the timetable entry right now." });
  }
}

async function deleteTimetableEntry(req, res) {
  try {
    const [result] = await pool.execute("DELETE FROM timetable WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Timetable entry not found." });
    return res.json({ success: true, message: "Timetable entry deleted." });
  } catch (error) {
    console.error("Delete timetable entry error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to delete the timetable entry right now." });
  }
}

module.exports = { listTimetable, getTimetableEntry, createTimetableEntry, updateTimetableEntry, deleteTimetableEntry };