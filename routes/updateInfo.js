import express from "express";
import { updateTutorInfo } from "../controllers/updateInfoController.js";

const router = express.Router();

// PUT /api/tutors/:tutor_id → update name/email/postal/password
// replace :tutor_id with real a tutor id

// TEST:
//{
//"full_name": "Chris F. Tutor",
//"location_postal": "N6G 1B2"
//}
router.put("/:tutor_id", updateTutorInfo);

export default router;