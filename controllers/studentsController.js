import { db } from "../db.js";
import bcrypt from "bcrypt";

export const createStudent = async (req, res) => {
  const { full_name, email, location_postal, stu_password } = req.body;

  // Basic validation
  if (!full_name || !email || !stu_password) {
    return res.status(400).json({
      error: "full_name, email, and stu_password are required",
    });
  }

    // Canadian postal code validation
  const postalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

  if (location_postal && !postalRegex.test(location_postal)) {
    return res.status(400).json({
      error: "Invalid Canadian postal code format (expected A1A 1A1)"
    });
  }

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(stu_password, 10);

    const [result] = await db.query(
      `INSERT INTO student (full_name, email, location_postal, stu_password)
       VALUES (?, ?, ?, ?)`,
      [full_name, email, location_postal, hashedPassword]
    );

    res.status(201).json({
      success: true,
      student_id: result.insertId,
      message: "Student account created successfully",
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};
