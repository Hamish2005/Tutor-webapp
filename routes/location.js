import express from "express";
import { getTutorsByPostal } from "../controllers/locationController.js";

const router = express.Router();

// GET /api/tutors/by-postal/:postal_code → tutors near postal code
// replace :postal_code with actual postal code

// TEST:
// GET
// http://localhost:3000/api/tutors/by-postal/N6G1B2

router.get("/by-postal/:postal_code", getTutorsByPostal);

export default router;