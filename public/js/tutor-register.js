document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("tutorRegForm");
    const msg = document.getElementById("tutorRegMsg");
  
    if (!form) return;
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "";
  
      const full_name = document.getElementById("tutor_full_name").value.trim();
      const email = document.getElementById("tutor_email").value.trim();
      const location_postal = document
        .getElementById("tutor_location_postal")
        .value.trim();
      const password = document
        .getElementById("tutor_password")
        .value.trim();
      const confirmPassword = document
        .getElementById("tutor_confirm_password")
        .value.trim();
  
      if (!full_name || !email || !password || !confirmPassword) {
        msg.textContent = "Please fill in all required fields.";
        return;
      }
  
      if (password !== confirmPassword) {
        msg.textContent = "Passwords do not match.";
        return;
      }
  
      try {
        const res = await fetch("http://localhost:3000/api/tutors/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name,
            email,
            location_postal: location_postal || null,
            tutor_password: password,
          }),
        });
  
        const data = await res.json();
  
        if (!res.ok || !data.success) {
          msg.textContent = data.error || "Failed to create tutor account.";
          return;
        }
  
        msg.classList.remove("text-danger");
        msg.classList.add("text-success");
        msg.textContent = "Tutor account created successfully! Redirecting to login...";
  
        // small delay then go to tutor-login
        setTimeout(() => {
          window.location.href = "tutor-login.html";
        }, 1500);
      } catch (err) {
        console.error("Tutor register error:", err);
        msg.textContent = "Server error creating account. Please try again.";
      }
    });
  });