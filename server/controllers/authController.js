const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeUser(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    studentId: row.student_id,
    email: row.email,
    institution: row.institution,
    program: row.program,
    yearOfStudy: row.year_of_study,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeRegistration(body) {
  return {
    fullName: String(body.fullName || "").trim(),
    studentId: String(body.studentId || "").trim(),
    email: String(body.email || "").trim().toLowerCase(),
    institution: String(body.institution || "").trim(),
    program: String(body.program || "").trim(),
    yearOfStudy: String(body.yearOfStudy || "").trim(),
    password: String(body.password || ""),
  };
}

async function register(req, res) {
  const data = normalizeRegistration(req.body);
  if (
    !data.fullName ||
    !data.studentId ||
    !data.email ||
    !data.institution ||
    !data.program ||
    !data.yearOfStudy ||
    !data.password
  ) {
    return res.status(400).json({ success: false, message: "Please complete every required field." });
  }
  if (!emailPattern.test(data.email)) {
    return res.status(400).json({ success: false, message: "Please enter a valid email address." });
  }
  if (data.password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
  }

  try {
    const [existing] = await pool.execute(
      "SELECT student_id, email FROM users WHERE student_id = ? OR email = ? LIMIT 2",
      [data.studentId, data.email],
    );
    if (existing.some((user) => user.student_id === data.studentId)) {
      return res.status(409).json({ success: false, message: "Student ID already exists." });
    }
    if (existing.some((user) => user.email === data.email)) {
      return res.status(409).json({ success: false, message: "Email already exists." });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const [result] = await pool.execute(
      `INSERT INTO users
        (full_name, student_id, email, institution, program, year_of_study, password_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.fullName,
        data.studentId,
        data.email,
        data.institution,
        data.program,
        data.yearOfStudy,
        passwordHash,
      ],
    );
    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: { id: result.insertId, studentId: data.studentId, email: data.email },
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to create the account right now." });
  }
}

async function login(req, res) {
  const identity = String(req.body.identity || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!identity || !password) {
    return res.status(400).json({ success: false, message: "Email or Student ID and password are required." });
  }

  try {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(student_id) = ? LIMIT 1",
      [identity, identity],
    );
    const user = rows[0];
    const valid = user && (await bcrypt.compare(password, user.password_hash));
    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid email/student ID or password." });
    }

    const token = jwt.sign(
      { id: user.id, studentId: user.student_id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );
    return res.json({ success: true, token, user: safeUser(user) });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to log in right now." });
  }
}

async function me(req, res) {
  try {
    const [rows] = await pool.execute("SELECT * FROM users WHERE id = ? LIMIT 1", [req.user.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: "Student account not found." });
    return res.json({ success: true, user: safeUser(rows[0]) });
  } catch (error) {
    console.error("Profile lookup error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load the student profile." });
  }
}

module.exports = { register, login, me };
