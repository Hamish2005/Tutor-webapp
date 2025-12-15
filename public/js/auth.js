console.log("auth.js loaded");

//
// --------------------------
// STUDENT REGISTRATION
// --------------------------
//
const regForm = document.getElementById("regForm");

if (regForm) {
    regForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const full_name = document.getElementById("full_name")?.value;
        const email = document.getElementById("email")?.value;
        const location_postal = document.getElementById("location_postal")?.value;
        const stu_password = document.getElementById("stu_password")?.value;
        const confirm_password = document.getElementById("confirm_password")?.value;

        if (!full_name || !email || !location_postal || !stu_password || !confirm_password) {
            document.getElementById("msg").innerText = "All fields are required";
            return;
        }

        if (stu_password !== confirm_password) {
            document.getElementById("msg").innerText = "Passwords do not match";
            return;
        }

        const res = await fetch("http://localhost:3000/api/auth/student/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ full_name, email, location_postal, stu_password }),
        });

        const data = await res.json();

        if (data.success) {
            alert("Account created! You can now log in.");
            window.location.href = "login.html";
        } else {
            document.getElementById("msg").innerText = data.error || "Error creating account";
        }
    });
}

//
// --------------------------
// STUDENT LOGIN
// --------------------------
//
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email")?.value;
        const stu_password = document.getElementById("stu_password")?.value;

        if (!email || !stu_password) {
            document.getElementById("msg").innerText = "Email and password required";
            return;
        }

        const res = await fetch("http://localhost:3000/api/auth/student/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, stu_password }),
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem("student", JSON.stringify(data.student));
            window.location.href = "dashboard.html";
        } else {
            document.getElementById("msg").innerText = data.error || "Login failed";
        }
    });
}
