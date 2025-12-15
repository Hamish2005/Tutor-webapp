import { db } from "../db.js";

// 1. Get all outstanding bills for a student
export const getOutstandingBills = async (req, res) => {
  const student_id = req.params.student_id;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        p.payment_id,
        p.method,
        p.status,
        b.booking_id,
        b.price_dollars,
        t.full_name AS tutor_name,
        c.title AS course_title
      FROM payment p
      JOIN booking b ON p.booking_id = b.booking_id
      JOIN tutor t ON b.tutor_id = t.tutor_id
      JOIN course c ON b.course_id = c.course_id
      WHERE p.status = 'pending' AND b.student_id = ?
      ORDER BY p.payment_id DESC
      `,
      [student_id]
    );

    res.json({
      success: true,
      outstandingBills: rows
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Pay a bill (mark as paid)
export const payBill = async (req, res) => {
  const payment_id = req.params.payment_id;

  try {
    // 1. Ensure the payment exists
    const [rows] = await db.query(
      `
      SELECT p.payment_id, b.price_dollars
      FROM payment p
      JOIN booking b ON p.booking_id = b.booking_id
      WHERE p.payment_id = ?
      `,
      [payment_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // 2. Mark as paid
    const [result] = await db.query(
      `
      UPDATE payment
      SET status = 'paid'
      WHERE payment_id = ?
      `,
      [payment_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Payment not updated" });
    }

    res.json({
      success: true,
      message: "Payment completed successfully",
      payment_id,
      amount_charged: rows[0].price_dollars
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
