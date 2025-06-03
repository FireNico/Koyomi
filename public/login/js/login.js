document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const correo = document.getElementById("correo").value;
    const contrasenya = document.getElementById("password-field").value;

    try {
      const resp = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ correo, contrasenya }),
      });

      const data = await resp.json();

      if (resp.ok) {
        localStorage.setItem("token", data.token);
        alert("Login exitoso");
        window.location.href = "../";
      } else {
        alert("Error: " + (data.message || "Credenciales incorrectas"));
      }
    } catch (err) {
      console.error("Fallo en login:", err);
      alert("Error al conectar con el servidor");
    }
  });
});
