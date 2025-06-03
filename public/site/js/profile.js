document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login/index.html"; // Redirige si no hay token
  }
  try {
    const resp = await fetch("http://localhost:5000/usuarios", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!resp.ok) throw new Error(`Error: ${resp.status} ${resp.statusText}`);

    const data = await resp.json();
    const userData = data[0];

    document.getElementById("imagen").src =
      "data:image/jpeg;base64," + userData.imagen || "";
    document.getElementById("nombre").textContent = userData.nombre || "";
    document.getElementById("apellido").textContent = userData.apellido || "";
    document.getElementById("correo").textContent = userData.correo || "";
  } catch (error) {
    console.error("Error al cargar perfil:", error);
    alert("No se pudo cargar la información del perfil.");
  }

  const form = document.getElementById("profile-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const inputFile = document.getElementById("foto");
    const file = inputFile.files[0];
    if (!file) return alert("Selecciona una imagen");

    const reader = new FileReader();

    reader.onload = async () => {
      const base64String = reader.result.split(",")[1]; // quitar prefijo data:image/png;base64,
      console.log("Base64 String:", base64String); // Para depuración
      try {
        const resp = await fetch("http://localhost:5000/usuarios/foto", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ imagen: base64String }),
        });

        if (!resp.ok) throw new Error("Error al actualizar la foto.");

        alert("Foto actualizada correctamente.");
        location.reload(); // opcional
      } catch (err) {
        console.error(err);
        alert("Error al subir la foto.");
      }
    };

    reader.onerror = () => {
      alert("Error al leer la imagen");
    };

    reader.readAsDataURL(file);
  });
});
