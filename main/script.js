// Auto login if data exists
const userData = localStorage.getItem("userData");
if (userData) {
  window.location.href = "dashboard.html";
}

const form = document.getElementById("signupForm");

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const pin = document.getElementById("pin").value.trim();

    // Basic email check
    if (!email.includes("@") || pin.length < 4 || pin.length > 8 || isNaN(pin)) {
      alert("Invalid email or PIN. Please check your input.");
      return;
    }

    const user = { username, email, pin };
    localStorage.setItem("userData", JSON.stringify(user));

    window.location.href = "dashboard.html";
  });
}
