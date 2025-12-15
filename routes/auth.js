import express from "express";
import { studentLogin, studentRegister } from "../controllers/authController.js";
import { tutorLogin } from "../controllers/tutorsController.js";

const router = express.Router();

// student routes
router.post("/student/register", studentRegister);
router.post("/student/login", studentLogin);

// tutor login route
router.post("/tutor/login", tutorLogin);

export default router;

