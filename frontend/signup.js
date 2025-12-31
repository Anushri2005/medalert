document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await apiRequest("/auth/signup", "POST", {
      name, email, password
    });

    alert("Account created! Please login.");
    window.location.href = "login.html";

  } catch (err) {
    alert(err.message);
  }
});
