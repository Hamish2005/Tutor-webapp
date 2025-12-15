import { db } from "../db.js";

// -------------------------------------------------------------
// 1. FIND MATCHING OR CLOSEST AVAILABILITY
// -------------------------------------------------------------
export const getBestAvailability = async (req, res) => {
  const { student_id, tutor_id } = req.params;

  try {
    // Load tutor availability
    const [tutorAvail] = await db.query(
      "SELECT * FROM tutor_availability WHERE tutor_id = ? ORDER BY start_time",
      [tutor_id]
    );

    // Load student availability
    const [studentAvail] = await db.query(
      "SELECT * FROM student_availability WHERE student_id = ? ORDER BY start_time",
      [student_id]
    );

    if (tutorAvail.length === 0 || studentAvail.length === 0) {
      return res.json({
        success: false,
        message: "Either the student or tutor has no availability.",
      });
    }

    // ⭐ Use the MOST RECENT student availability
    const studentLast = studentAvail[studentAvail.length - 1];

    let overlaps = [];
    let closest = null;
    let closestDiff = Infinity;

    for (let t of tutorAvail) {
      const tStart = new Date(t.start_time);
      const tEnd = new Date(t.end_time);
      const sStart = new Date(studentLast.start_time);
      const sEnd = new Date(studentLast.end_time);

      // Check overlap
      const overlapStart = new Date(Math.max(tStart, sStart));
      const overlapEnd = new Date(Math.min(tEnd, sEnd));

      if (overlapStart < overlapEnd) {
        overlaps.push({
          tutor_availability_id: t.tutor_availability_id,
          student_availability_id: studentLast.student_availability_id,
          start_time: overlapStart,
          end_time: overlapEnd,
        });
      }

      // Track closest match
      const diff = Math.abs(tStart - sStart);
      if (diff < closestDiff) {
        closestDiff = diff;

        closest = {
          tutor_availability_id: t.tutor_availability_id,
          tutor_start: t.start_time,
          tutor_end: t.end_time,
          student_availability_id: studentLast.student_availability_id,
          student_start: studentLast.start_time,
          student_end: studentLast.end_time,
        };
      }
    }

    // If overlaps exist → return them
    if (overlaps.length > 0) {
      return res.json({
        success: true,
        type: "overlap",
        availability: overlaps,
      });
    }

    // Otherwise return closest slot
    return res.json({
      success: true,
      type: "closest",
      closest,
    });

  } catch (err) {
    console.error("Availability Error:", err);
    res.status(500).json({ error: err.message });
  }
};



// -------------------------------------------------------------
// 2. CREATE BOOKING
// -------------------------------------------------------------
export const createBooking = async (req, res) => {
  const { 
    student_id, 
    tutor_id, 
    course_id, 
    location_id, 
    tutor_availability_id, 
    student_availability_id,
    start_time,
    end_time
  } = req.body;

  // Validate fields
  if (!student_id || !tutor_id || !course_id || !location_id ||
      !tutor_availability_id || !student_availability_id || !start_time || !end_time) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1️⃣ CREATE availability row
    const [availabilityRes] = await db.query(
      `
      INSERT INTO availability 
      (tutor_availability_id, student_availability_id, start_time, end_time)
      VALUES (?, ?, ?, ?)
      `,
      [
        tutor_availability_id,
        student_availability_id,
        start_time,
        end_time
      ]
    );

    const availability_id = availabilityRes.insertId;

    // CREATE booking row (now using REAL availability_id)
    const [bookingRes] = await db.query(
      `
      INSERT INTO booking 
      (tutor_id, student_id, course_id, location_id, availability_id, price_dollars)
      VALUES (?, ?, ?, ?, ?, 0)
      `,
      [tutor_id, student_id, course_id, location_id, availability_id]
    );

    const booking_id = bookingRes.insertId;

    // CREATE payment row
    await db.query(
      `
      INSERT INTO payment (booking_id, method, status)
      VALUES (?, 'credit_card', 'pending')
      `,
      [booking_id]
    );

    res.json({
      success: true,
      message: "Booking created successfully",
      booking_id,
      availability_id
    });

  } catch (err) {
    console.error("Booking Error:", err);
    res.status(500).json({ error: err.message });
  }
};

