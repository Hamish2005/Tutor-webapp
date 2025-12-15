import express from "express";
import { getTutorCourses } from "../controllers/tutorController.js";
import { createTutor } from "../controllers/tutorsController.js";

const router = express.Router();

// REGISTER tutor
router.post("/register", createTutor);

// GET tutor courses
router.get("/:tutor_id/courses", getTutorCourses);

export default router;
