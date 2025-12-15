import { db } from "../db.js";

export const getTutorCourses = async (req, res) => {
  const { tutor_id } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT c.course_id, c.title
      FROM tutor_course tc
      JOIN course c ON tc.course_id = c.course_id
      WHERE tc.tutor_id = ?
      `,
      [tutor_id]
    );

    res.json({
      success: true,
      courses: rows
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
