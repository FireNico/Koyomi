document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".signin-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      // id_usuario: localStorage.getItem("id_usuario"),
      title: document.getElementById("nombre").value,
      ubicacion: document.getElementById("ubicacion").value,
      descripcion: document.getElementById("descripcion").value,
      start: document.getElementById("fechaInicio").value,
      end: document.getElementById("fechaFinal").value,
    };

    console.log(data);

    try {
      const token = localStorage.getItem("token");
      const resp = await fetch("http://107.22.221.236:5000/nuevoEvento", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!resp.ok) throw new Error(`Error: ${resp.status} ${resp.statusText}`);
      if (resp.status !== 204) {
        // Si la respuesta tiene contenido: 204 No Content
        const result = await resp.json();
        if (resp.ok) {
          alert("Evento creado correctamente");
          form.reset();
        } else {
          alert("Error al crear evento: " + result.message);
        }
      }
    } catch (error) {
      console.error("Error al enviar datos:", error.message);
      alert("Fallo en la conexión al servidor");
    }
  });
});
