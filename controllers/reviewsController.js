import { db } from "../db.js";

export const getTutorReviews = async (req, res) => {
  const tutor_id = req.params.tutor_id;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        r.review_id,
        r.tutor_feedback,
        s.full_name AS student_name
      FROM review r
      JOIN booking b ON b.booking_id = r.booking_id
      JOIN student s ON s.student_id = b.student_id
      WHERE b.tutor_id = ?
      ORDER BY r.review_id DESC
      `,
      [tutor_id]
    );

    // Normalize MySQL booleans: 0, 1, "0", "1", true, false
    const normalizedReviews = rows.map(r => ({
      ...r,
      tutor_feedback:
        r.tutor_feedback === 1 ||
        r.tutor_feedback === "1" ||
        r.tutor_feedback === true
    }));

    const totalReviews = normalizedReviews.length;

    const satisfiedReviews = normalizedReviews.filter(
      r => r.tutor_feedback === true
    ).length;

    const satisfactionPercent =
      totalReviews > 0
        ? Number(((satisfiedReviews / totalReviews) * 100).toFixed(2))
        : 0;

    res.json({
      success: true,
      tutor_id: Number(tutor_id),
      totalReviews,
      satisfiedReviews,
      satisfactionPercent,
      reviews: normalizedReviews
    });

  } catch (err) {
    console.error("Error fetching tutor reviews:", err);
    res.status(500).json({ error: err.message });
  }
};
export const createReview = async (req, res) => {
  const { booking_id, rating, grade_before, grade_after, student_feedback } = req.body;

  if (!booking_id || !rating || grade_before === undefined || grade_after === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1️⃣ Find booking data
    const [bookingRows] = await db.query(
      `
      SELECT tutor_id, student_id,
             TIMESTAMPDIFF(MINUTE, start_time, end_time) / 60 AS total_hours
      FROM booking
      WHERE booking_id = ?
      `,
      [booking_id]
    );

    if (bookingRows.length === 0) {
      return res.status(400).json({ error: "Invalid booking ID" });
    }

    const booking = bookingRows[0];

    const grade_change = Number(grade_after) - Number(grade_before);
    const total_hours = booking.total_hours || 0;

    // 2️⃣ Insert review
    const [insert] = await db.query(
      `
      INSERT INTO review 
      (booking_id, student_id, tutor_id, tutor_feedback, rating, grade_before, grade_after, grade_change, total_hours)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        booking_id,
        booking.student_id,
        booking.tutor_id,
        student_feedback == "1",
        rating,
        grade_before,
        grade_after,
        grade_change,
        total_hours
      ]
    );

    return res.json({
      success: true,
      message: "Review submitted!",
      review_id: insert.insertId
    });

  } catch (err) {
    console.error("createReview error:", err);
    res.status(500).json({ error: "Server error creating review" });
  }
};


