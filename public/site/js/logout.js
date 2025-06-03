document.addEventListener("DOMContentLoaded", () => {
  const logoutLink = document.getElementById("logoutLink");

  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault(); // Evita la navegación directa
      localStorage.removeItem("token"); // Elimina el JWT
      window.location.href = "../login/index.html"; // Redirige manualmente
    });
  }
});
