const pool = require("../config/database");

const groupTypes = new Set([
  "Study Group",
  "Assignment Group",
  "Presentation Group",
  "Course Community",
  "Other",
]);
const maxMessageLength = 2000;

function groupId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function safeUser(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    studentId: row.student_id,
  };
}

function groupFromRow(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    course: row.course,
    type: row.group_type,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    memberCount: Number(row.member_count || 0),
    currentUserRole: row.current_user_role || null,
    latestMessage: row.latest_message || null,
    latestMessageAt: row.latest_message_at || null,
    unreadCount: Number(row.unread_count || 0),
  };
}

function messageFromRow(row) {
  return {
    id: row.id,
    groupId: row.group_id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    senderStudentId: row.sender_student_id,
    content: row.content,
    createdAt: row.created_at,
    read: Boolean(row.is_read),
  };
}

function normalizeGroup(body) {
  return {
    name: String(body.name || "").trim(),
    description: String(body.description || "").trim(),
    course: String(body.course || "").trim(),
    type: String(body.type || "Study Group").trim(),
  };
}

function validateGroup(data) {
  if (!data.name) return "Group name is required.";
  if (!data.description) return "Group description is required.";
  if (!data.course) return "Course is required.";
  if (data.name.length > 180) return "Group name is too long.";
  if (data.course.length > 160) return "Course is too long.";
  if (!groupTypes.has(data.type)) return "Invalid group type.";
  return null;
}

async function getMembership(id, userId, connection = pool) {
  const [rows] = await connection.execute(
    "SELECT id, role FROM group_members WHERE group_id = ? AND user_id = ? LIMIT 1",
    [id, userId],
  );
  return rows[0] || null;
}

async function requireMember(req, res) {
  const id = groupId(req.params.id);
  if (!id) {
    res.status(400).json({ success: false, message: "A valid group is required." });
    return null;
  }
  const membership = await getMembership(id, req.user.id);
  if (!membership) {
    res.status(403).json({ success: false, message: "You are not a member of this group." });
    return null;
  }
  return { id, membership };
}

async function requireAdmin(req, res) {
  const access = await requireMember(req, res);
  if (!access) return null;
  if (access.membership.role !== "admin") {
    res.status(403).json({ success: false, message: "Only group administrators can perform this action." });
    return null;
  }
  return access;
}

async function findGroup(id) {
  const [rows] = await pool.execute(
    "SELECT id, created_by FROM `groups` WHERE id = ? LIMIT 1",
    [id],
  );
  return rows[0] || null;
}

async function searchStudents(req, res) {
  const search = String(req.query.search || "").trim();
  const term = search ? `%${search}%` : "%";
  try {
    const [rows] = await pool.execute(
      `SELECT id, full_name, student_id
       FROM users
       WHERE id <> ? AND (full_name LIKE ? OR student_id LIKE ? OR email LIKE ?)
       ORDER BY full_name ASC
       LIMIT 50`,
      [req.user.id, term, term, term],
    );
    return res.json({ success: true, students: rows.map(safeUser) });
  } catch (error) {
    console.error("Search group students error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to search students right now." });
  }
}

async function listGroups(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT g.id, g.name, g.description, g.course, g.group_type, g.created_by,
              g.created_at, g.updated_at, membership.role AS current_user_role,
              (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) AS member_count,
              (SELECT message.content FROM group_messages message
               WHERE message.group_id = g.id ORDER BY message.created_at DESC, message.id DESC LIMIT 1) AS latest_message,
              (SELECT message.created_at FROM group_messages message
               WHERE message.group_id = g.id ORDER BY message.created_at DESC, message.id DESC LIMIT 1) AS latest_message_at,
              (SELECT COUNT(*) FROM group_messages message
               WHERE message.group_id = g.id AND message.sender_id <> ?
                 AND NOT EXISTS (
                   SELECT 1 FROM group_message_reads message_read
                   WHERE message_read.message_id = message.id AND message_read.user_id = ?
                 )) AS unread_count
       FROM \`groups\` g
       JOIN group_members membership ON membership.group_id = g.id AND membership.user_id = ?
       ORDER BY COALESCE((SELECT MAX(message.created_at) FROM group_messages message WHERE message.group_id = g.id), g.updated_at) DESC, g.id DESC`,
      [req.user.id, req.user.id, req.user.id],
    );
    return res.json({ success: true, groups: rows.map(groupFromRow) });
  } catch (error) {
    console.error("List groups error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load groups right now." });
  }
}

async function getGroup(req, res) {
  try {
    const access = await requireMember(req, res);
    if (!access) return;
    const [groups] = await pool.execute(
      `SELECT g.id, g.name, g.description, g.course, g.group_type, g.created_by,
              g.created_at, g.updated_at, membership.role AS current_user_role,
              (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) AS member_count
       FROM \`groups\` g
       JOIN group_members membership ON membership.group_id = g.id AND membership.user_id = ?
       WHERE g.id = ? LIMIT 1`,
      [req.user.id, access.id],
    );
    if (!groups[0]) return res.status(404).json({ success: false, message: "Group not found." });
    const [members] = await pool.execute(
      `SELECT u.id, u.full_name, u.student_id, gm.role, gm.joined_at
       FROM group_members gm
       JOIN users u ON u.id = gm.user_id
       WHERE gm.group_id = ?
       ORDER BY CASE WHEN gm.role = 'admin' THEN 0 ELSE 1 END, u.full_name ASC`,
      [access.id],
    );
    return res.json({
      success: true,
      group: groupFromRow(groups[0]),
      members: members.map((member) => ({ ...safeUser(member), role: member.role, joinedAt: member.joined_at })),
    });
  } catch (error) {
    console.error("Get group error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load this group right now." });
  }
}

async function createGroup(req, res) {
  const data = normalizeGroup(req.body);
  const validationError = validateGroup(data);
  if (validationError) return res.status(400).json({ success: false, message: validationError });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(
      "INSERT INTO `groups` (name, description, course, group_type, created_by) VALUES (?, ?, ?, ?, ?)",
      [data.name, data.description, data.course, data.type, req.user.id],
    );
    await connection.execute(
      "INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, 'admin')",
      [result.insertId, req.user.id],
    );
    await connection.commit();
    req.params.id = String(result.insertId);
    return getGroup(req, res);
  } catch (error) {
    await connection.rollback();
    console.error("Create group error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to create the group right now." });
  } finally {
    connection.release();
  }
}

async function updateGroup(req, res) {
  try {
    const access = await requireAdmin(req, res);
    if (!access) return;
    const data = normalizeGroup(req.body);
    const validationError = validateGroup(data);
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    const [result] = await pool.execute(
      "UPDATE `groups` SET name = ?, description = ?, course = ?, group_type = ? WHERE id = ?",
      [data.name, data.description, data.course, data.type, access.id],
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Group not found." });
    return getGroup(req, res);
  } catch (error) {
    console.error("Update group error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to update the group right now." });
  }
}

async function addMember(req, res) {
  try {
    const access = await requireAdmin(req, res);
    if (!access) return;
    const userId = groupId(req.body.userId);
    if (!userId) return res.status(400).json({ success: false, message: "A valid student is required." });
    const [users] = await pool.execute("SELECT id FROM users WHERE id = ? LIMIT 1", [userId]);
    if (!users[0]) return res.status(404).json({ success: false, message: "Student not found." });
    try {
      await pool.execute(
        "INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, 'member')",
        [access.id, userId],
      );
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ success: false, message: "This student is already a group member." });
      }
      throw error;
    }
    return res.status(201).json({ success: true, message: "Member added successfully." });
  } catch (error) {
    console.error("Add group member error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to add the student right now." });
  }
}

async function removeMember(req, res) {
  try {
    const access = await requireAdmin(req, res);
    if (!access) return;
    const userId = groupId(req.params.userId);
    if (!userId) return res.status(400).json({ success: false, message: "A valid student is required." });
    const group = await findGroup(access.id);
    if (!group) return res.status(404).json({ success: false, message: "Group not found." });
    if (userId === group.created_by) {
      return res.status(409).json({ success: false, message: "The group creator must use Leave group instead." });
    }
    const [result] = await pool.execute(
      "DELETE FROM group_members WHERE group_id = ? AND user_id = ?",
      [access.id, userId],
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Group member not found." });
    return res.json({ success: true, message: "Member removed successfully." });
  } catch (error) {
    console.error("Remove group member error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to remove the student right now." });
  }
}

async function leaveGroup(req, res) {
  const id = groupId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "A valid group is required." });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const membership = await getMembership(id, req.user.id, connection);
    if (!membership) {
      await connection.rollback();
      return res.status(403).json({ success: false, message: "You are not a member of this group." });
    }
    const [groups] = await connection.execute(
      "SELECT id, created_by FROM `groups` WHERE id = ? FOR UPDATE",
      [id],
    );
    const group = groups[0];
    if (!group) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Group not found." });
    }
    if (group.created_by === req.user.id) {
      const [successorRows] = await connection.execute(
        "SELECT user_id FROM group_members WHERE group_id = ? AND user_id <> ? ORDER BY joined_at ASC, id ASC LIMIT 1",
        [id, req.user.id],
      );
      if (!successorRows[0]) {
        await connection.rollback();
        return res.status(409).json({ success: false, message: "The last group member cannot leave the group." });
      }
      const successorId = successorRows[0].user_id;
      await connection.execute("UPDATE `groups` SET created_by = ? WHERE id = ?", [successorId, id]);
      await connection.execute(
        "UPDATE group_members SET role = 'admin' WHERE group_id = ? AND user_id = ?",
        [id, successorId],
      );
    }
    await connection.execute("DELETE FROM group_members WHERE group_id = ? AND user_id = ?", [id, req.user.id]);
    await connection.commit();
    return res.json({ success: true, message: "You have left the group." });
  } catch (error) {
    await connection.rollback();
    console.error("Leave group error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to leave the group right now." });
  } finally {
    connection.release();
  }
}

async function listMessages(req, res) {
  try {
    const access = await requireMember(req, res);
    if (!access) return;
    const [rows] = await pool.execute(
      `SELECT message.id, message.group_id, message.sender_id, message.content, message.created_at,
              sender.full_name AS sender_name, sender.student_id AS sender_student_id,
              EXISTS(SELECT 1 FROM group_message_reads message_read
                     WHERE message_read.message_id = message.id AND message_read.user_id = ?) AS is_read
       FROM group_messages message
       JOIN users sender ON sender.id = message.sender_id
       WHERE message.group_id = ?
       ORDER BY message.created_at ASC, message.id ASC`,
      [req.user.id, access.id],
    );
    return res.json({ success: true, messages: rows.map(messageFromRow) });
  } catch (error) {
    console.error("List group messages error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load group messages right now." });
  }
}

async function sendMessage(req, res) {
  try {
    const access = await requireMember(req, res);
    if (!access) return;
    const content = String(req.body.content || "").trim();
    if (!content) return res.status(400).json({ success: false, message: "Message cannot be empty." });
    if (content.length > maxMessageLength) return res.status(400).json({ success: false, message: "Message is too long." });
    const [result] = await pool.execute(
      "INSERT INTO group_messages (group_id, sender_id, content) VALUES (?, ?, ?)",
      [access.id, req.user.id, content],
    );
    const [rows] = await pool.execute(
      `SELECT message.id, message.group_id, message.sender_id, message.content, message.created_at,
              sender.full_name AS sender_name, sender.student_id AS sender_student_id, TRUE AS is_read
       FROM group_messages message
       JOIN users sender ON sender.id = message.sender_id
       WHERE message.id = ? AND message.group_id = ? LIMIT 1`,
      [result.insertId, access.id],
    );
    return res.status(201).json({ success: true, message: messageFromRow(rows[0]) });
  } catch (error) {
    console.error("Send group message error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to send the message right now." });
  }
}

async function markMessagesRead(req, res) {
  try {
    const access = await requireMember(req, res);
    if (!access) return;
    await pool.execute(
      `INSERT IGNORE INTO group_message_reads (message_id, user_id)
       SELECT message.id, ?
       FROM group_messages message
       WHERE message.group_id = ? AND message.sender_id <> ?`,
      [req.user.id, access.id, req.user.id],
    );
    return res.json({ success: true, message: "Group messages marked as read." });
  } catch (error) {
    console.error("Mark group messages read error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to update group messages right now." });
  }
}

module.exports = {
  searchStudents,
  listGroups,
  getGroup,
  createGroup,
  updateGroup,
  addMember,
  removeMember,
  leaveGroup,
  listMessages,
  sendMessage,
  markMessagesRead,
};
