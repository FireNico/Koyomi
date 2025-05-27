document.addEventListener("DOMContentLoaded", async () => {
  const form = document.querySelector(".signin-form");

  // Función para obtener el parámetro "id" de la URL
  function getEventIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id"); // devuelve null si no existe
  }

  const eventId = getEventIdFromUrl();

  if (eventId) {
    try {
      // Obtener datos del evento desde el backend
      const resp = await fetch(`http://localhost:5000/evento/${eventId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!resp.ok) throw new Error(`Error: ${resp.status} ${resp.statusText}`);

      const data = await resp.json();

      const eventData = data[0];

      function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toISOString().split("T")[0]; // Solo la parte YYYY-MM-DD
      }

      // Rellenar el formulario con los datos recibidos
      console.log(eventData.title);
      document.getElementById("nombre").value = eventData.title || "";
      document.getElementById("ubicacion").value = eventData.ubicacion || "";
      document.getElementById("descripcion").value =
        eventData.descripcion || "";
      document.getElementById("fechaInicio").value =
        formatDate(eventData.start) || "";
      document.getElementById("fechaFinal").value =
        formatDate(eventData.end) || "";

      // Cambiar texto del botón para que sea "Actualizar Evento"
      form.querySelector("button[type=submit]").textContent =
        "Actualizar Evento";
    } catch (error) {
      console.error("Error al cargar datos del evento:", error);
      alert("No se pudo cargar la información del evento.");
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      id_usuario: 1, // O obtén de localStorage si prefieres
      title: document.getElementById("nombre").value,
      ubicacion: document.getElementById("ubicacion").value,
      descripcion: document.getElementById("descripcion").value,
      start: document.getElementById("fechaInicio").value,
      end: document.getElementById("fechaFinal").value,
    };

    try {
      let url = "http://localhost:5000/nuevoEvento";
      let method = "POST";

      if (eventId) {
        // Si tenemos ID, hacemos PUT para actualizar
        url = `http://localhost:5000/evento/${eventId}`;
        method = "PUT";
      }

      const resp = await fetch(`http://localhost:5000/evento/${eventId}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!resp.ok) throw new Error(`Error: ${resp.status} ${resp.statusText}`);

      if (resp.status !== 204) {
        const result = await resp.json();
        if (resp.ok) {
          alert(
            eventId
              ? "Evento actualizado correctamente"
              : "Evento creado correctamente"
          );
          form.reset();
          if (eventId) {
            window.location.href = "/index.html";
          }
        } else {
          alert("Error: " + result.message);
        }
      }
    } catch (error) {
      console.error("Error al enviar datos:", error);
      alert("Fallo en la conexión al servidor");
    }
  });
});
