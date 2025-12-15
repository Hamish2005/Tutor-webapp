import express from "express";
import {
  getTutorAvailability,
  createAvailability,
  updateTutorAvailability,
  deleteTutorAvailability
} from "../controllers/availabilityController.js";

const router = express.Router();

// GET /api/tutors/availability/:tutor_id
router.get("/:tutor_id", getTutorAvailability);

// POST /api/tutors/availability/:tutor_id
router.post("/:tutor_id", createAvailability);

// PUT /api/tutors/availability/:tutor_id/:availability_id
router.put("/:tutor_id/:availability_id", updateTutorAvailability);

// DELETE /api/tutors/availability/:tutor_id/:availability_id
router.delete("/:tutor_id/:availability_id", deleteTutorAvailability);

export default router;
