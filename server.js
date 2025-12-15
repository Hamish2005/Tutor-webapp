import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { db } from "./db.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

/* ====================================
   STATIC FRONT-END FILES
===================================== */
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

/* ====================================
   API ROUTES
===================================== */

import auth from "./routes/auth.js";
import students from "./routes/students.js";
import payments from "./routes/payments.js";
import reviews from "./routes/reviews.js";
import booking from "./routes/booking.js";
import value from "./routes/value.js";

import tutors from "./routes/tutors.js";
import updateInfo from "./routes/updateInfo.js";
import availability from "./routes/availability.js";
import location from "./routes/location.js";
import discount from "./routes/discount.js";

// NEW tutor courses route namespace
import tutorCourses from "./routes/tutorCourses.js";

// Core routes
app.use("/api/auth", auth);
app.use("/api/students", students);
app.use("/api/payments", payments);
app.use("/api/reviews", reviews);
app.use("/api/booking", booking);
app.use("/api/value", value);

// Tutor-related routes
app.use("/api/tutors", tutors);
app.use("/api/tutors/update", updateInfo);
app.use("/api/tutors/availability", availability);
app.use("/api/tutors/location", location);
app.use("/api/tutors/discount", discount);

// NEW — No conflict with /api/tutors
app.use("/api/tutor-courses", tutorCourses);

/* ====================================
   STARTUP
===================================== */
db.getConnection()
  .then(() => console.log("Connected to database"))
  .catch((err) => console.error("DB connection error:", err));

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
