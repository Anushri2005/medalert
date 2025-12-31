document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await apiRequest("/auth/login", "POST", {
      email, password
    });

    localStorage.setItem("token", res.token);
    alert("Login successful");
    window.location.href = "dashboard.html";

  } catch (err) {
    alert(err.message);
  }
});
