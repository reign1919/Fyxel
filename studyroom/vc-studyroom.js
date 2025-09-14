document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById("vcDropdown");

  dropdown.addEventListener("change", (e) => {
    const url = e.target.value;
    if (url) {
      window.open(url, "_blank"); // opens in new tab
    }
  });
});
