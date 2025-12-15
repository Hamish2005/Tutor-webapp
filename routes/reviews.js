import express from "express";
import { getTutorReviews, createReview } from "../controllers/reviewsController.js";

const router = express.Router();

// GET all reviews for a tutor
router.get("/tutor/:tutor_id", getTutorReviews);

// POST submit a review
router.post("/", createReview);

export default router;
