const API_URL = "http://localhost:5000";

// Register User
async function registerUser() {
  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();
  if (res.status === 201) {
    alert("Registration successful! Redirecting...");
    loginUser(email, password); // Auto-login after registration
  } else {
    alert(data.msg);
  }
}

// Login User
async function loginUser(email = null, password = null) {
  if (!email || !password) {
    email = document.getElementById("loginEmail").value;
    password = document.getElementById("loginPassword").value;
  }

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (res.ok) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("userName", data.user.name);
    alert("Login successful! Redirecting...");
    window.location.href = "main.html"; // Redirect to dashboard
  } else {
    alert(data.msg);
  }
}

// Logout User
function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  window.location.href = "index.html"; // Redirect to login page
}
