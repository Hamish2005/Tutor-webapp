import { db } from "../db.js";

/*
==========================================
 GET ALL AVAILABILITY FOR A TUTOR
 /api/tutors/availability/:tutor_id
==========================================
*/
export const getTutorAvailability = async (req, res) => {
  const { tutor_id } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT tutor_availability_id, start_time, end_time
      FROM tutor_availability
      WHERE tutor_id = ?
      ORDER BY start_time
      `,
      [tutor_id]
    );

    res.json({
      success: true,
      availability: rows
    });

  } catch (err) {
    console.error("getTutorAvailability error:", err);
    res.status(500).json({ error: "Server error fetching availability" });
  }
};

/*
==========================================
 CREATE NEW AVAILABILITY SLOT
 POST /api/tutors/availability/:tutor_id
==========================================
*/
export const createAvailability = async (req, res) => {
  const { tutor_id } = req.params;
  const { start_time, end_time } = req.body;

  if (!start_time || !end_time) {
    return res.status(400).json({
      error: "start_time and end_time are required",
    });
  }

  try {
    const [result] = await db.query(
      `
      INSERT INTO tutor_availability (tutor_id, start_time, end_time)
      VALUES (?, ?, ?)
      `,
      [tutor_id, start_time, end_time]
    );

    res.json({
      success: true,
      message: "Availability added successfully",
      availability_id: result.insertId
    });

  } catch (err) {
    console.error("createAvailability error:", err);
    res.status(500).json({ error: "Server error creating availability" });
  }
};

/*
==========================================
 UPDATE EXISTING AVAILABILITY
 PUT /api/tutors/availability/:tutor_id/:availability_id
==========================================
*/
export const updateTutorAvailability = async (req, res) => {
  const { tutor_id, availability_id } = req.params;
  const { start_time, end_time } = req.body;

  if (!start_time || !end_time) {
    return res.status(400).json({
      error: "start_time and end_time are required",
    });
  }

  try {
    const [result] = await db.query(
      `
      UPDATE tutor_availability
      SET start_time = ?, end_time = ?
      WHERE tutor_availability_id = ? AND tutor_id = ?
      `,
      [start_time, end_time, availability_id, tutor_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Availability slot not found for this tutor",
      });
    }

    res.json({
      success: true,
      message: "Availability updated successfully",
    });

  } catch (err) {
    console.error("updateTutorAvailability error:", err);
    res.status(500).json({ error: "Server error updating availability" });
  }
};

/*
==========================================
 DELETE AVAILABILITY
 DELETE /api/tutors/availability/:tutor_id/:availability_id
==========================================
*/
export const deleteTutorAvailability = async (req, res) => {
  const { tutor_id, availability_id } = req.params;

  try {
    const [result] = await db.query(
      `
      DELETE FROM tutor_availability
      WHERE tutor_availability_id = ? AND tutor_id = ?
      `,
      [availability_id, tutor_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Availability not found for this tutor",
      });
    }

    res.json({
      success: true,
      message: "Availability deleted successfully",
    });

  } catch (err) {
    console.error("deleteTutorAvailability error:", err);
    res.status(500).json({ error: "Server error deleting availability" });
  }
};
