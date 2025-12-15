import express from "express";
import { db } from "../db.js"; 
import { createStudent } from "../controllers/studentsController.js";

const router = express.Router();

/**
 * CREATE STUDENT (rarely used now; UI uses AUTH REGISTER)
 * POST /api/students
 */
router.post("/", createStudent);

/**
 * ADD STUDENT AVAILABILITY
 * POST /api/students/availability
 */
router.post("/availability", async (req, res) => {
  const { student_id, start_time, end_time } = req.body;

  if (!student_id || !start_time || !end_time) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await db.query(
      "INSERT INTO student_availability (student_id, start_time, end_time) VALUES (?, ?, ?)",
      [student_id, start_time, end_time]
    );

    res.json({ success: true, message: "Student availability added" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * GET ALL AVAILABILITY FOR A STUDENT
 * GET /api/students/availability/:student_id
 */
router.get("/availability/:student_id", async (req, res) => {
  const { student_id } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM student_availability WHERE student_id = ? ORDER BY start_time",
      [student_id]
    );

    res.json({ success: true, availability: rows });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
