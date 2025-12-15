const API_BASE = "http://localhost:3000/api";
let currentTutor = null;

document.addEventListener("DOMContentLoaded", () => {
  initTutor();
  initNav();
  initProfileForm();
  initAvailabilityForm();
  initCourses();
  initValueForm();
  initDiscountForm();
  initLogout();
});

/*
===========================================
 LOAD TUTOR FROM LOCALSTORAGE
===========================================
*/
function initTutor() {
  const stored = localStorage.getItem("tutor");
  if (stored) {
    currentTutor = JSON.parse(stored);
  } else {
    const tid = prompt("Enter tutor_id (demo):");
    currentTutor = { tutor_id: Number(tid), full_name: "Tutor", email: "" };
  }

  document.getElementById("tutor-name").textContent =
    currentTutor.full_name;
  document.getElementById("tutor-email").textContent =
    currentTutor.email;

  document.getElementById("profile-full-name").value =
    currentTutor.full_name;
  document.getElementById("profile-email").value =
    currentTutor.email;
  document.getElementById("profile-postal").value =
    currentTutor.location_postal || "";

  loadReviews();
}

/*
===========================================
 SIDEBAR NAVIGATION
===========================================
*/
function initNav() {
  const buttons = document.querySelectorAll(".nav-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const target = btn.dataset.target;

      document.querySelectorAll(".panel").forEach((p) =>
        p.classList.remove("active")
      );

      document.getElementById(target).classList.add("active");
    });
  });
}

/*
===========================================
 PROFILE UPDATE FORM
===========================================
*/
function initProfileForm() {
  const form = document.getElementById("profile-form");
  const messageEl = document.getElementById("profile-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const body = {
      full_name: document.getElementById("profile-full-name").value.trim(),
      email: document.getElementById("profile-email").value.trim(),
      location_postal: document.getElementById("profile-postal").value.trim(),
    };
    const pw = document.getElementById("profile-password").value.trim();
    if (pw) body.tutor_password = pw;

    const res = await fetch(
      `${API_BASE}/tutors/update/${currentTutor.tutor_id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      messageEl.textContent = data.error;
      messageEl.classList.add("error");
      return;
    }

    messageEl.textContent = "Profile updated!";
    currentTutor.full_name = body.full_name;
    currentTutor.email = body.email;
    localStorage.setItem("tutor", JSON.stringify(currentTutor));
  });
}

/*
===========================================
 AVAILABILITY MANAGEMENT
===========================================
*/
function initAvailabilityForm() {
  const form = document.getElementById("availability-form");
  const messageEl = document.getElementById("availability-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const start = document.getElementById("avail-start").value;
    const end = document.getElementById("avail-end").value;

    const res = await fetch(
      `${API_BASE}/tutors/availability/${currentTutor.tutor_id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start_time: start, end_time: end }),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      messageEl.textContent = data.error;
      return;
    }

    messageEl.textContent = "Availability added.";
    loadTutorAvailability();
  });

  loadTutorAvailability();
}

// Load availability table
async function loadTutorAvailability() {
  const table = document.querySelector("#availability-table tbody");
  table.innerHTML = "";

  const res = await fetch(
    `${API_BASE}/tutors/availability/${currentTutor.tutor_id}`
  );

  const data = await res.json();
  if (!res.ok) return;

  data.availability.forEach((slot) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${slot.tutor_availability_id}</td>
      <td>${slot.start_time}</td>
      <td>${slot.end_time}</td>
      <td>
        <button class="btn btn-danger btn-sm"
                onclick="deleteAvailability(${slot.tutor_availability_id})">
          Delete
        </button>
      </td>
    `;
    table.appendChild(tr);
  });
}

async function deleteAvailability(id) {
  await fetch(
    `${API_BASE}/tutors/availability/${currentTutor.tutor_id}/${id}`,
    { method: "DELETE" }
  );
  loadTutorAvailability();
}

/*
===========================================
 COURSE PANEL (fully working)
===========================================
*/
function initCourses() {
  const form = document.getElementById("course-form");
  const table = document.querySelector("#course-table tbody");
  const msg = document.getElementById("course-message");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const course_id = document.getElementById("course-id").value;
    const exp = document.getElementById("course-exp").value;
    const rate = document.getElementById("course-rate").value;

    const res = await fetch(`${API_BASE}/tutors/${currentTutor.tutor_id}/courses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        course_id,
        experience_years: exp,
        hourly_rate_dollars: rate
      })
    });

    const data = await res.json();
    msg.textContent = data.message;
    loadTutorCourses();
  });

  loadTutorCourses();
}

async function loadTutorCourses() {
  const table = document.querySelector("#course-table tbody");
  table.innerHTML = "";

  const res = await fetch(`${API_BASE}/tutor-courses/${currentTutor.tutor_id}`);
  const data = await res.json();

  if (!data.success) return;

  data.courses.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.course_id} – ${c.title}</td>
      <td>${c.experience_years} yrs</td>
      <td>$${Number(c.hourly_rate_dollars).toFixed(2)}</td>
      <td>${Number(c.rating_avg).toFixed(2)}</td>
      <td></td>
    `;
    table.appendChild(tr);
  });
}





/*
===========================================
 REVIEWS
===========================================
*/
async function loadReviews() {
  const totalEl = document.getElementById("review-total");
  const satEl = document.getElementById("review-satisfied");
  const pctEl = document.getElementById("review-percent");
  const table = document.querySelector("#reviews-table tbody");

  table.innerHTML = "";

  const res = await fetch(`${API_BASE}/reviews/tutor/${currentTutor.tutor_id}`);
  const data = await res.json();

  totalEl.textContent = data.totalReviews;
  satEl.textContent = data.satisfiedReviews;
  pctEl.textContent = data.satisfactionPercent + "%";

  data.reviews.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.review_id}</td>
      <td>${r.student_name}</td>
      <td>${r.tutor_feedback ? "👍" : "👎"}</td>`;
    table.appendChild(tr);
  });
}

/*
===========================================
 VALUE PANEL
===========================================
*/
function initValueForm() {
  const form = document.getElementById("value-form");
  const table = document.querySelector("#value-table tbody");
  const msg = document.getElementById("value-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("value-course-id").value;
    msg.textContent = "Loading...";
    table.innerHTML = "";

    const res = await fetch(`${API_BASE}/value/course/${id}`);
    const data = await res.json();

    data.tutors.forEach((t, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${t.full_name}</td>
        <td>${t.hourly_rate_dollars}</td>
        <td>${t.rating_avg}</td>
        <td>${t.value_score}</td>
      `;
      table.appendChild(tr);
    });

    msg.textContent = "";
  });
}

/*
===========================================
 DISCOUNT PANEL
===========================================
*/
// Discount tool
function initDiscountForm() {
  const form = document.getElementById("discount-form");
  const resultEl = document.getElementById("discount-result");
  const messageEl = document.getElementById("discount-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentTutor) return;

    const courseId = document.getElementById("discount-course-id").value.trim();
    const percent = document.getElementById("discount-percent").value.trim();

    if (!courseId || !percent) {
      messageEl.textContent = "Please enter course and percent.";
      return;
    }

    resultEl.textContent = "";
    messageEl.textContent = "Calculating...";
    messageEl.classList.remove("error");

    try {
      const res = await fetch(
        `${API_BASE}/tutors/discount/${currentTutor.tutor_id}/course/${courseId}/discount?percent=${encodeURIComponent(percent)}`
      );

      const data = await res.json();

      if (!res.ok) {
        messageEl.textContent = data.error || "Failed to calculate discount.";
        messageEl.classList.add("error");
        return;
      }

      messageEl.textContent = "";
      resultEl.innerHTML = `
        <div><strong>Base rate:</strong> $${data.base_rate.toFixed(2)}</div>
        <div><strong>Discount:</strong> ${data.discount_percent}%</div>
        <div><strong>Discounted rate:</strong> $${data.discounted_rate.toFixed(2)}</div>
      `;
    } catch (err) {
      console.error(err);
      messageEl.textContent = "Server error calculating discount.";
      messageEl.classList.add("error");
    }
  });
}


/*
===========================================
 LOG OUT
===========================================
*/
function initLogout() {
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("tutor");
    window.location.href = "/login.html";
  });
}
