import { db } from "../db.js";

// GET all courses for a tutor
export const getTutorCourses = async (req, res) => {
  const { tutor_id } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        tc.course_id,
        c.course_code,
        c.title,
        COALESCE(tc.experience_years, 0) AS experience_years,
        COALESCE(tc.hourly_rate_dollars, 0) AS hourly_rate_dollars,
        COALESCE(tc.rating_avg, 2.5) AS rating_avg
      FROM tutor_course tc
      JOIN course c ON tc.course_id = c.course_id
      WHERE tc.tutor_id = ?
      ORDER BY tc.course_id
      `,
      [tutor_id]
    );

    res.json({ success: true, courses: rows });

  } catch (err) {
    console.error("getTutorCourses error:", err);
    res.status(500).json({ error: "Server error loading tutor courses" });
  }
};

// ADD or UPDATE a tutor's course
export const saveTutorCourse = async (req, res) => {
  const { tutor_id } = req.params;
  const { course_id, experience_years, hourly_rate_dollars } = req.body;

  if (!course_id || !hourly_rate_dollars) {
    return res.status(400).json({
      error: "course_id and hourly_rate_dollars are required"
    });
  }

  try {
    await db.query(
      `
      INSERT INTO tutor_course (tutor_id, course_id, experience_years, hourly_rate_dollars, rating_avg)
      VALUES (?, ?, ?, ?, 2.5)
      ON DUPLICATE KEY UPDATE
        experience_years = VALUES(experience_years),
        hourly_rate_dollars = VALUES(hourly_rate_dollars)
      `,
      [tutor_id, course_id, experience_years || 0, hourly_rate_dollars]
    );

    res.json({ success: true, message: "Course saved successfully" });

  } catch (err) {
    console.error("saveTutorCourse error:", err);
    res.status(500).json({ error: "Server error saving tutor course" });
  }
};
