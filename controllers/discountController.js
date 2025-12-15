import { db } from "../db.js";

export const getTutorCourseDiscount = async (req, res) => {
  const { tutor_id, course_id } = req.params;
  const percent = Number(req.query.percent);

  if (!percent || percent <= 0 || percent >= 100) {
    return res.status(400).json({ error: "Invalid discount percent" });
  }

  try {
    const [rows] = await db.query(
      `
      SELECT hourly_rate_dollars 
      FROM tutor_course
      WHERE tutor_id = ? AND course_id = ?
      `,
      [tutor_id, course_id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Tutor does not teach this course" });
    }

    const base = Number(rows[0].hourly_rate_dollars);
    const discounted = base - base * (percent / 100);

    res.json({
      success: true,
      base_rate: base,
      discount_percent: percent,
      discounted_rate: discounted
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
