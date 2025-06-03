document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const apellido = document.getElementById("apellido").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const fecha_nacimiento = document.getElementById("fecha_nacimiento").value;
    const contrasena = document.getElementById("contrasenya").value;
    const confirmar = document.getElementById("confirmar").value;
    const form = document.getElementById("registerForm");
    const privacyCheck = document.getElementById("privacyCheck");

    form.addEventListener("submit", (e) => {
      if (!privacyCheck.checked) {
        e.preventDefault();
        alert("Debes aceptar la Política de Privacidad para continuar.");
      }
    });

    if (contrasena !== confirmar) {
      return alert("Las contraseñas no coinciden");
    }

    try {
      // Verificar si el correo ya está registrado
      const checkCorreo = await fetch(
        `http://107.22.221.236:5000/usuarios/existe?correo=${encodeURIComponent(
          correo
        )}`
      );
      const correoExiste = await checkCorreo.json();

      console.log("Correo existe:", correoExiste);

      if (checkCorreo.ok && correoExiste.existe) {
        return alert("El correo ya está registrado");
      }

      // Enviar los datos para registrar al usuario
      const resp = await fetch("http://107.22.221.236:5000/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,
          apellido,
          fecha_nacimiento,
          correo,
          contrasenya: contrasena,
          imagen: "",
        }),
      });

      const data = await resp.json();

      if (resp.ok) {
        alert("Registro exitoso");
        window.location.href = "/login/index.html"; // Redireccionar al login, por ejemplo
      } else {
        alert(resp.statusText);
      }
    } catch (err) {
      console.error("Error en el registro:", err);
      alert("Error al conectar con el servidor");
    }
  });
});
