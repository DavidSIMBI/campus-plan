const pool = require("../config/database");

const maxMessageLength = 2000;

function safeUser(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    studentId: row.student_id,
    email: row.email,
    institution: row.institution,
    program: row.program,
    yearOfStudy: row.year_of_study,
  };
}

function messageFromRow(row) {
  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    content: row.content,
    read: Boolean(row.is_read),
    createdAt: row.created_at,
  };
}

async function findUser(userId) {
  const [rows] = await pool.execute(
    "SELECT id, full_name, student_id, email, institution, program, year_of_study FROM users WHERE id = ? LIMIT 1",
    [userId],
  );
  return rows[0];
}

async function searchStudents(req, res) {
  const search = String(req.query.search || "").trim();
  const term = search ? `%${search}%` : "%";
  try {
    const [rows] = await pool.execute(
      `SELECT id, full_name, student_id, email, institution, program, year_of_study
       FROM users
       WHERE id <> ? AND (full_name LIKE ? OR student_id LIKE ? OR email LIKE ?)
       ORDER BY full_name ASC
       LIMIT 20`,
      [req.user.id, term, term, term],
    );
    return res.json({ success: true, students: rows.map(safeUser) });
  } catch (error) {
    console.error("Search students error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to search students right now." });
  }
}

async function listConversations(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT other.id, other.full_name, other.student_id, other.email,
              other.institution, other.program, other.year_of_study,
              latest.content AS latest_content,
              latest.created_at AS latest_created_at,
              unread.unread_count
       FROM users other
       JOIN (
         SELECT CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS other_id,
                MAX(created_at) AS latest_created_at
         FROM messages
         WHERE sender_id = ? OR receiver_id = ?
         GROUP BY CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END
       ) recent ON recent.other_id = other.id
       JOIN messages latest
         ON latest.created_at = recent.latest_created_at
        AND ((latest.sender_id = ? AND latest.receiver_id = other.id)
          OR (latest.sender_id = other.id AND latest.receiver_id = ?))
       LEFT JOIN (
         SELECT sender_id AS other_id, COUNT(*) AS unread_count
         FROM messages
         WHERE receiver_id = ? AND is_read = FALSE
         GROUP BY sender_id
       ) unread ON unread.other_id = other.id
       ORDER BY latest.created_at DESC`,
      [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id],
    );
    return res.json({
      success: true,
      conversations: rows.map((row) => ({
        user: safeUser(row),
        latestMessage: row.latest_content,
        latestMessageAt: row.latest_created_at,
        unreadCount: Number(row.unread_count || 0),
      })),
    });
  } catch (error) {
    console.error("List conversations error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load conversations right now." });
  }
}

async function getConversation(req, res) {
  const otherUserId = Number(req.params.userId);
  if (!Number.isInteger(otherUserId) || otherUserId <= 0 || otherUserId === req.user.id) {
    return res.status(400).json({ success: false, message: "A valid conversation student is required." });
  }
  try {
    const otherUser = await findUser(otherUserId);
    if (!otherUser) return res.status(404).json({ success: false, message: "Student not found." });
    const [rows] = await pool.execute(
      `SELECT id, sender_id, receiver_id, content, is_read, created_at
       FROM messages
       WHERE (sender_id = ? AND receiver_id = ?)
          OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC, id ASC`,
      [req.user.id, otherUserId, otherUserId, req.user.id],
    );
    return res.json({ success: true, user: safeUser(otherUser), messages: rows.map(messageFromRow) });
  } catch (error) {
    console.error("Get conversation error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load the conversation right now." });
  }
}

async function sendMessage(req, res) {
  const receiverId = Number(req.params.userId);
  const content = String(req.body.content || "").trim();
  if (!Number.isInteger(receiverId) || receiverId <= 0 || receiverId === req.user.id) {
    return res.status(400).json({ success: false, message: "A valid receiver is required." });
  }
  if (!content) return res.status(400).json({ success: false, message: "Message cannot be empty." });
  if (content.length > maxMessageLength) return res.status(400).json({ success: false, message: "Message is too long." });
  try {
    if (!(await findUser(receiverId))) return res.status(404).json({ success: false, message: "Student not found." });
    const [result] = await pool.execute(
      "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)",
      [req.user.id, receiverId, content],
    );
    const [rows] = await pool.execute(
      "SELECT id, sender_id, receiver_id, content, is_read, created_at FROM messages WHERE id = ? LIMIT 1",
      [result.insertId],
    );
    return res.status(201).json({ success: true, message: messageFromRow(rows[0]) });
  } catch (error) {
    console.error("Send message error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to send the message right now." });
  }
}

async function markConversationRead(req, res) {
  const senderId = Number(req.params.userId);
  if (!Number.isInteger(senderId) || senderId <= 0 || senderId === req.user.id) {
    return res.status(400).json({ success: false, message: "A valid conversation student is required." });
  }
  try {
    await pool.execute(
      "UPDATE messages SET is_read = TRUE WHERE receiver_id = ? AND sender_id = ?",
      [req.user.id, senderId],
    );
    return res.json({ success: true, message: "Conversation marked as read." });
  } catch (error) {
    console.error("Mark messages read error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to update message status right now." });
  }
}

module.exports = { searchStudents, listConversations, getConversation, sendMessage, markConversationRead };