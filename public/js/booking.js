console.log("booking.js loaded");

// ---------------------------
// LOAD STUDENT FROM LOGIN
// ---------------------------
const student = JSON.parse(localStorage.getItem("student"));
if (!student) {
    alert("You must be logged in!");
    window.location.href = "login.html";
}

// Stores student availability from DB + user input
let availabilityList = [];

// ---------------------------
// ADD STUDENT AVAILABILITY
// ---------------------------
async function addStudentAvailability() {
    const start = document.getElementById("student_start").value;
    const end = document.getElementById("student_end").value;

    if (!start || !end) {
        alert("Please enter both start and end");
        return;
    }

    const res = await fetch("http://localhost:3000/api/students/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            student_id: student.student_id,
            start_time: start,
            end_time: end
        })
    });

    const data = await res.json();

    if (!data.success) {
        alert("Error saving availability");
        return;
    }

    availabilityList.push({ start, end });
    updateStudentList();
}

function updateStudentList() {
    const list = document.getElementById("studentList");
    list.innerHTML = "";

    availabilityList.forEach(a => {
        const li = document.createElement("li");
        li.textContent = `${new Date(a.start).toLocaleString()} → ${new Date(a.end).toLocaleString()}`;
        list.appendChild(li);
    });
}

// ---------------------------
// CHECK AVAILABILITY
// ---------------------------
async function checkAvailability() {
    const tutor_id = document.getElementById("tutor_id").value;

    if (!tutor_id) {
        alert("Please enter a tutor ID");
        return;
    }

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "<p>Checking availability...</p>";

    const res = await fetch(
        `http://localhost:3000/api/booking/availability/${student.student_id}/${tutor_id}`
    );
    const data = await res.json();

    console.log("Availability Response:", data);

    // -------------------------------
    // CASE 1: OVERLAP EXISTS
    // -------------------------------
    if (data.success && data.type === "overlap") {
        let html = `<h4>Matching Availability Found!</h4>`;
        
        data.availability.forEach(slot => {
            const tutorStart = new Date(slot.start_time).toLocaleString();
            const tutorEnd = new Date(slot.end_time).toLocaleString();

            html += `
                <div class="alert alert-success mt-2">
                    ${tutorStart} → ${tutorEnd}
                    <br><br>
                    <button class="btn btn-primary"
                        onclick="createBooking(
                            ${slot.tutor_availability_id}, 
                            ${slot.student_availability_id},
                            '${slot.start_time}',
                            '${slot.end_time}',
                            ${tutor_id}
                        )">
                        Book This Time
                    </button>
                </div>
            `;
        });

        resultDiv.innerHTML = html;
        return;
    }

    // -------------------------------
    // CASE 2: NO OVERLAP → CLOSEST
    // -------------------------------
    if (data.success && data.type === "closest" && data.closest) {
        const c = data.closest;

        const tutorStart = new Date(c.tutor_start).toLocaleString();
        const tutorEnd = new Date(c.tutor_end).toLocaleString();
        const studentStart = new Date(c.student_start).toLocaleString();
        const studentEnd = new Date(c.student_end).toLocaleString();

        resultDiv.innerHTML = `
            <h4>No Overlap Found</h4>

            <p><b>Closest Tutor Availability:</b></p>

            <div class="alert alert-warning">
                <b>Tutor:</b><br>
                ${tutorStart} → ${tutorEnd}
                <br><br>
                <b>Your Availability:</b><br>
                ${studentStart} → ${studentEnd}
                <br><br>
                <button class="btn btn-primary"
                    onclick="createBooking(
                        ${c.tutor_availability_id},
                        ${c.student_availability_id},
                        '${c.tutor_start}',
                        '${c.tutor_end}',
                        ${tutor_id}
                    )">
                    Book This Time
                </button>
            </div>
        `;
        return;
    }

    resultDiv.innerHTML = `<div class="alert alert-danger">No availability found.</div>`;
}

function toMySQLFormat(isoString) {
    return new Date(isoString)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
}

// ---------------------------
// CREATE BOOKING
// ---------------------------
async function createBooking(
    tutorAvailabilityID,
    studentAvailabilityID,
    start_time,
    end_time,
    tutor_id
) {
    const student_id = student.student_id;

    // Convert ISO → MySQL format
    const mysqlStart = toMySQLFormat(start_time);
    const mysqlEnd   = toMySQLFormat(end_time);

    const course_id = document.getElementById("course_id").value;
    const location_id = 1;

    const res = await fetch(`http://localhost:3000/api/booking/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            student_id,
            tutor_id,
            course_id,
            location_id,
            tutor_availability_id: tutorAvailabilityID,
            student_availability_id: studentAvailabilityID,
            start_time: mysqlStart,
            end_time: mysqlEnd
        })
    });

    const data = await res.json();

    if (data.success) {
        alert("Booking created! A payment has been added to your account.");
    } else {
        alert("Booking failed: " + data.error);
    }
}

async function loadTutorCourses() {
    const tutor_id = document.getElementById("tutor_id").value;
    if (!tutor_id) return;

    const res = await fetch(`http://localhost:3000/api/tutors/${tutor_id}/courses`);
    const data = await res.json();

    const select = document.getElementById("course_id");
    select.innerHTML = "";

    if (!data.success || data.courses.length === 0) {
        select.innerHTML = "<option>No courses found</option>";
        return;
    }

    data.courses.forEach(c => {
        select.innerHTML += `
            <option value="${c.course_id}">${c.title}</option>
        `;
    });
}



// ---------------------------
// LOAD EXISTING STUDENT AVAILABILITY
// ---------------------------
async function loadExistingAvailability() {
    const res = await fetch(
        `http://localhost:3000/api/students/availability/${student.student_id}`
    );
    const data = await res.json();

    if (data.success) {
        const now = new Date();

        availabilityList = data.availability
            .filter(a => new Date(a.end_time) > now)
            .map(a => ({
                start: a.start_time,
                end: a.end_time
            }));

        updateStudentList();
    }
}

loadExistingAvailability();
