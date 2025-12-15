document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const full_name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const stu_password = document.getElementById("password").value;
  const location_postal = document.getElementById("postal").value;

  const res = await fetch("http://localhost:3000/api/auth/student/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name, email, stu_password, location_postal })
  });

  const data = await res.json();

  if (data.success) {
    alert("Account created! You can now log in.");
    window.location.href = "login.html";
  } else {
    alert("Error: " + data.error);
  }
});
