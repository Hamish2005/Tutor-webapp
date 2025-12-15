import { db } from "../db.js";
import bcrypt from "bcrypt";

// --------------------
// STUDENT REGISTER
// --------------------
export const studentRegister = async (req, res) => {
  const { full_name, email, location_postal, stu_password } = req.body;

  if (!full_name || !email || !location_postal || !stu_password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // check if email exists
    const [existing] = await db.query(
      "SELECT * FROM student WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // hash password
    const hashed = await bcrypt.hash(stu_password, 10);

    // insert student
    await db.query(
      "INSERT INTO student (full_name, email, location_postal, stu_password) VALUES (?, ?, ?, ?)",
      [full_name, email, location_postal, hashed]
    );

    res.json({ success: true, message: "Student registered successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --------------------
// STUDENT LOGIN
// --------------------
export const studentLogin = async (req, res) => {
  const { email, stu_password } = req.body;

  if (!email || !stu_password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM student WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const student = rows[0];

    const passwordMatch = await bcrypt.compare(stu_password, student.stu_password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({
      success: true,
      message: "Login successful",
      student: {
        student_id: student.student_id,
        full_name: student.full_name,
        email: student.email,
        location_postal: student.location_postal
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tutor Login
export const tutorLogin = async (req, res) => {
  const { email, tutor_password } = req.body;

  if (!email || !tutor_password) {
    return res
      .status(400)
      .json({ error: "Email and password are required" });
  }

  try {
    // Find tutor by email
    const [rows] = await db.query(
      "SELECT * FROM tutor WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      // Don't reveal whether email exists
      return res
        .status(401)
        .json({ error: "Invalid email or password" });
    }

    const tutor = rows[0];

    if (!tutor.tutor_password) {
      // No password set for this tutor (old seeded data)
      return res
        .status(401)
        .json({ error: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(
      tutor_password,
      tutor.tutor_password
    );

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ error: "Invalid email or password" });
    }

    // Successful login
    res.json({
      success: true,
      message: "Login successful",
      tutor: {
        tutor_id: tutor.tutor_id,
        full_name: tutor.full_name,
        email: tutor.email,
        location_postal: tutor.location_postal,
        ranking_score: tutor.ranking_score,
      },
    });
  } catch (err) {
    console.error("tutorLogin error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
};
