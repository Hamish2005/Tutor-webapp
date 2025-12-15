import { db } from "../db.js";

export const getBangForBuckByCourse = async (req, res) => {
  const { course_id } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        t.tutor_id,
        t.full_name,
        tc.course_id,
        tc.hourly_rate_dollars,
        COALESCE(r.rating_avg, 0) AS rating_avg,
        ROUND(COALESCE(r.rating_avg, 0) / tc.hourly_rate_dollars, 4) AS value_score
      FROM tutor t
      JOIN tutor_course tc ON tc.tutor_id = t.tutor_id
      LEFT JOIN tutor_course_ratings r 
             ON r.tutor_id = tc.tutor_id 
            AND r.course_id = tc.course_id
      WHERE tc.course_id = ?
      ORDER BY value_score DESC;
      `,
      [course_id]
    );

    res.json({
      success: true,
      course_id,
      tutors: rows
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// -------------------------------------------------------------
// Resolve course by ID, name, or course code
// -------------------------------------------------------------
export const resolveCourse = async (req, res) => {
  const query = req.params.query.trim();

  try {
    let rows;

    // Case 1: Numeric direct course ID
    if (!isNaN(query)) {
      [rows] = await db.query(
        "SELECT course_id, title, course_code FROM course WHERE course_id = ?",
        [query]
      );
    } else {
      // Case 2: Search by course name or course code
      [rows] = await db.query(
        `
        SELECT course_id, title, course_code
        FROM course
        WHERE title LIKE ? OR course_code LIKE ?
        `,
        [`%${query}%`, `%${query}%`]
      );
    }

    if (rows.length === 0) {
      return res.json({
        success: false,
        error: "Course not found. Try course ID, name, or code."
      });
    }

    const course = rows[0];

    res.json({
      success: true,
      course_id: course.course_id,
      course_name: `${course.title} (${course.course_code})`
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

