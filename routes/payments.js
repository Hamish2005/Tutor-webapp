import express from "express";
import { getOutstandingBills, payBill } from "../controllers/paymentController.js";

const router = express.Router();

router.get("/outstanding/:student_id", getOutstandingBills);
router.put("/pay/:payment_id", payBill);

export default router;