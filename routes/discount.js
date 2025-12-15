import express from "express";
import { getTutorCourseDiscount } from "../controllers/discountController.js";

const router = express.Router();

// GET /api/tutors/:tutor_id/course/:course_id/discount?percent=:discount
// replace :tutor_id, :course_id, and :discount with real values

// TEST:
// http://localhost:3000/api/tutors/1/course/2/discount?percent=20
router.get("/:tutor_id/course/:course_id/discount", getTutorCourseDiscount);

export default router;