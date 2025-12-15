import express from "express";
import { 
  getTutorCourses, 
  saveTutorCourse 
} from "../controllers/tutorCoursesController.js";

const router = express.Router();

/* 
  GET /api/tutor-courses/:tutor_id
*/
router.get("/:tutor_id", getTutorCourses);

/* 
  POST /api/tutor-courses/:tutor_id
  Body: { course_id, experience_years, hourly_rate_dollars }
*/
router.post("/:tutor_id", saveTutorCourse);

export default router;
