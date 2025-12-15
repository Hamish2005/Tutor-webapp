import express from "express";
import {
  getBestAvailability,
  createBooking
} from "../controllers/bookingController.js";
import { db } from "../db.js";

const router = express.Router();

// Check matching availability
router.get("/availability/:student_id/:tutor_id", getBestAvailability);

// Create booking  ← FIXED
router.post("/create", createBooking);

// Find closest tutor availability
router.post("/closest/:tutor_id", async (req, res) => {
  const { tutor_id } = req.params;
  const { stu_start } = req.body;

  try {
    const [rows] = await db.query(
      `
        SELECT *
        FROM tutor_availability
        WHERE tutor_id = ?
        ORDER BY ABS(TIMESTAMPDIFF(MINUTE, start_time, ?))
        LIMIT 1
      `,
      [tutor_id, stu_start]
    );

    if (!rows.length) {
      return res.json({
        success: false,
        message: "No tutor availability found."
      });
    }

    res.json({ success: true, closest: rows[0] });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/:booking_id", async (req, res) => {
  const { booking_id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT tutor_id, total_hours FROM booking WHERE booking_id = ?`,
      [booking_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json({ success: true, ...rows[0] });

  } catch (err) {
    res.status(500).json({ error: "Server error fetching booking" });
  }
});

export default router;
