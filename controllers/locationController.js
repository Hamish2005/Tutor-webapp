import { db } from "../db.js";

export const getTutorsByPostal = async (req, res) => {
  const { postal_code } = req.params;

  if (!postal_code) {
    return res.status(400).json({ error: "postal_code is required" });
  }

  // Normalize to FSA (first 3 chars: A1A)
  const normalized = postal_code.replace(/\s+/g, "").toUpperCase().slice(0, 3);

  try {
    const [rows] = await db.query(
      `
      SELECT tutor_id, full_name, email, location_postal, ranking_score
      FROM tutor
      WHERE UPPER(REPLACE(location_postal, ' ', '')) LIKE CONCAT(?, '%')
      ORDER BY ranking_score DESC, full_name ASC
      `,
      [normalized]
    );

    res.json({
      success: true,
      search_postal_fsa: normalized,
      tutors: rows,
    });
  } catch (err) {
    console.error("getTutorsByPostal error:", err);
    res.status(500).json({ error: "Server error fetching tutors" });
  }
};
