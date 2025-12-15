document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("tutorLoginForm");
    const msg = document.getElementById("tutorMsg");
  
    if (!form) return;
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "";
  
      const email = document.getElementById("tutor_email").value.trim();
      const password = document
        .getElementById("tutor_password")
        .value.trim();
  
      if (!email || !password) {
        msg.textContent = "Please enter both email and password.";
        return;
      }
  
      try {
        const res = await fetch("/api/auth/tutor/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            tutor_password: password, 
          }),
        });
  
        const data = await res.json();
  
        if (!res.ok || !data.success) {
          msg.textContent = data.error || "Invalid email or password.";
          return;
        }
  
        // Save tutor info for the dashboard
        localStorage.setItem("tutor", JSON.stringify(data.tutor));
  
        // Redirect to tutor dashboard
        window.location.href = "/tutor-dashboard.html";
      } catch (err) {
        console.error("Tutor login error:", err);
        msg.textContent = "Server error during login. Please try again.";
      }
    });
  });