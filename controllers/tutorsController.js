import { db } from "../db.js";
import bcrypt from "bcrypt";

export const createTutor = async (req, res) => {
    const {
        full_name,
        email,
        location_postal,
        tutor_password,
        ranking_score,
    } = req.body;

    // Basic validation
    if (!full_name || !email || !tutor_password) {
        return res.status(400).json({
            error: "full_name, email, and tutor_password are required",
        });
    }

    // Canadian postal code validation
    const postalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    if (location_postal && !postalRegex.test(location_postal)) {
        return res.status(400).json({
            error: "Invalid Canadian Postal code format (expected A1A 1A1)"
        })
    }

    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(tutor_password, 10);

        const [result] = await db.query(
           `
           INSERT INTO tutor (full_name, email, location_postal, ranking_score, tutor_password)
           VALUES (?, ?, ?, ?, ?)
           `,
           [
            full_name,
            email,
            location_postal || null,
            ranking_score ?? null,
            hashedPassword,
           ]
        );

        res.status(201).json({
            success: true,
            tutor_id: result.insertId,
            message: "Tutor account created successfully",
        });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({error: "Email already exists"});
        }
    console.error("CREATE TUTOR ERROR:", err);  // <– SHOW full backend error
    return res.status(500).json({ error: err.message });

    }
};
export const tutorLogin = async (req, res) => {
  const { email, tutor_password } = req.body;

  if (!email || !tutor_password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM tutor WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const tutor = rows[0];

    const passwordMatch = await bcrypt.compare(
      tutor_password,
      tutor.tutor_password
    );

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({
      success: true,
      message: "Login successful",
      tutor: {
        tutor_id: tutor.tutor_id,
        full_name: tutor.full_name,
        email: tutor.email,
        location_postal: tutor.location_postal,
      }
    });

  } catch (err) {
    console.error("Tutor login error:", err);
    res.status(500).json({ error: err.message });
  }
};