import express from "express";
import { 
    getBangForBuckByCourse,
    resolveCourse
} from "../controllers/valueController.js";

const router = express.Router();

// Resolve by ID, name, or course code
router.get("/resolve/:query", resolveCourse);

// Get bang-for-buck by numeric ID
router.get("/course/:course_id", getBangForBuckByCourse);

export default router;
