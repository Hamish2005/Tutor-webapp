const API = "http://localhost:3000/api";

async function loadValue() {
    const query = document.getElementById("course_id").value.trim();
    const div = document.getElementById("valueList");
    div.innerHTML = "";

    if (!query) {
        div.innerHTML = "<p>Please enter a course name or ID.</p>";
        return;
    }

    // 1. Resolve the course ID
    const resolveRes = await fetch(`${API}/value/resolve/${encodeURIComponent(query)}`);
    const resolved = await resolveRes.json();

    if (!resolved.success) {
        div.innerHTML = `<p>${resolved.error}</p>`;
        return;
    }

    const course_id = resolved.course_id;

    // 2. Fetch Bang-for-Buck tutors for this course
    const res = await fetch(`${API}/value/course/${course_id}`);
    const data = await res.json();

    if (!data.success || !data.tutors || data.tutors.length === 0) {
        div.innerHTML = "<p>No tutors found for this course.</p>";
        return;
    }

    div.innerHTML = `<h4>Results for: ${resolved.course_name}</h4>`;

    data.tutors.forEach(t => {
        div.innerHTML += `
        <div class="card p-3 mt-2">
            <h5>${t.full_name}</h5>

            <p><b>Tutor ID:</b> ${t.tutor_id}</p>
            <p><b>Hourly Rate:</b> $${Number(t.hourly_rate_dollars).toFixed(2)}</p>
            <p><b>Avg Rating:</b> ${Number(t.rating_avg).toFixed(2)}</p>
            <p><b>Bang for Buck Score:</b> ${Number(t.value_score).toFixed(4)}</p>
        </div>
        `;
    });
}
