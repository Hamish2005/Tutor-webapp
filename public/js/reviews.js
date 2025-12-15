const API = "http://localhost:3000/api";
let reviewModal;

// ===============================
// Load Reviews
// ===============================
async function loadReviews() {
    const tutor_id = document.getElementById("tutor_id").value.trim();

    if (!tutor_id) {
        alert("Enter a Tutor ID first.");
        return;
    }

    try {
        const res = await fetch(`${API}/reviews/tutor/${tutor_id}`);
        const data = await res.json();

        const div = document.getElementById("reviewList");
        div.innerHTML = "";

        if (!data.reviews || data.reviews.length === 0) {
            div.innerHTML = "<p>No reviews for this tutor.</p>";
            return;
        }

        div.innerHTML += `
            <div class="card p-3 mb-3">
                <h4>Tutor Review Summary</h4>
                <p><b>Total Reviews:</b> ${data.totalReviews}</p>
                <p><b>Helpfulness %:</b> ${data.satisfactionPercent}%</p>
                <p><b>Satisfied Reviews:</b> ${data.satisfiedReviews}</p>
            </div>
        `;

        data.reviews.forEach(r => {
            div.innerHTML += `
                <div class="card p-3 mt-2">
                    <p><b>Review ID:</b> ${r.review_id}</p>
                    <p><b>Student:</b> ${r.student_name}</p>
                    <p><b>Helpful:</b> ${r.tutor_feedback ? "Yes" : "No"}</p>
                </div>
            `;
        });

    } catch (err) {
        console.error("Error loading reviews:", err);
        document.getElementById("reviewList").innerHTML =
            "<p class='text-danger'>Failed to load reviews.</p>";
    }
}

// ===============================
// Modal Setup
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    const openBtn = document.getElementById("openReviewBtn");
    reviewModal = new bootstrap.Modal(document.getElementById("reviewModal"));

    openBtn.addEventListener("click", () => {
        document.getElementById("reviewMsg").textContent = "";
        reviewModal.show();
    });

    document
        .getElementById("submitReviewBtn")
        .addEventListener("click", submitReview);
});

// ===============================
// Submit a Review
// ===============================
async function submitReview() {
    const msg = document.getElementById("reviewMsg");

    const booking_id = document.getElementById("booking_id").value;
    const rating = document.getElementById("rating").value;
    const grade_before = document.getElementById("grade_before").value;
    const grade_after = document.getElementById("grade_after").value;
    const student_feedback = document.getElementById("student_feedback").value;

    if (!booking_id || !rating || !grade_before || !grade_after) {
        msg.textContent = "All fields must be filled.";
        msg.classList.add("text-danger");
        return;
    }

    const body = {
        booking_id,
        rating,
        grade_before,
        grade_after,
        student_feedback
    };

    try {
        const res = await fetch(`${API}/reviews`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (!res.ok) {
            msg.textContent = data.error || "Error submitting review.";
            msg.classList.add("text-danger");
            return;
        }

        msg.textContent = "Review submitted!";
        msg.classList.remove("text-danger");
        msg.classList.add("text-success");

        loadReviews();

    } catch (err) {
        console.error("Error submitting review", err);
        msg.textContent = "Server error.";
        msg.classList.add("text-danger");
    }
}
