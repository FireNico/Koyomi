document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login/index.html"; // Redirige si no hay token
  }

  let eventos = [];

  function getUserIdFromToken(token) {
    if (!token) return null;

    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.id || decoded.userId || null;
    } catch (e) {
      console.error("Token inválido", e);
      return null;
    }
  }

  const userId = getUserIdFromToken(token);

  async function getImagen() {
    try {
      const resp = await fetch("http://localhost:5000/usuarios/imagen", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!resp.ok) throw new Error(`Error: ${resp.status} ${resp.statusText}`);
      const json = await resp.json();
      return "data:image/jpeg;base64," + json[0].imagen;
    } catch (error) {
      console.error("Fallo en la obtención de eventos:", error);
      return [];
    }
  }

  localStorage.setItem("userPhoto", await getImagen());

  async function getEventos() {
    try {
      const resp = await fetch("http://localhost:5000/eventos", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!resp.ok) throw new Error(`Error: ${resp.status} ${resp.statusText}`);
      const json = await resp.json();
      return json.events.map((evento) => ({
        id_usuario: evento.id_usuario,
        id: evento.id,
        title: evento.title,
        start: evento.start,
        end: evento.end,
        description: evento.descripcion,
        participants: evento.participantes || [],
      }));
    } catch (error) {
      console.error("Fallo en la obtención de eventos:", error);
      return [];
    }
  }

  eventos = await getEventos();
  console.log(eventos);

  const calendar = new FullCalendar.Calendar(
    document.getElementById("calendar"),
    {
      initialView: "dayGridMonth",
      handleWindowResize: true,

      eventDidMount: function (info) {
        new bootstrap.Tooltip(info.el, {
          title: `<div>${info.event.title}<br>${info.event.extendedProps.description}<br>${info.event.start}<br>${info.event.end}</div>`,
          placement: "top",
          trigger: "hover",
          container: "body",
          html: true,
        });
      },
      events: eventos,

      eventClick: function (info) {
        const event = info.event;
        const eventId = info.event._def.publicId;
        async function loadParticipants(eventId) {
          const list = document.getElementById("participantList");
          list.innerHTML = "<li>Cargando...</li>";

          try {
            const resp = await fetch(
              `http://localhost:5000/evento/${eventId}/participantes`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const data = await resp.json();
            list.innerHTML = "";

            if (data.length === 0) {
              list.innerHTML = "<li>No hay participantes aún.</li>";
            } else {
              data.forEach((p) => {
                const li = document.createElement("li");
                li.textContent = `${p.nombre} ${p.apellido}`;
                list.appendChild(li);
              });
            }
          } catch (err) {
            list.innerHTML = "<li>Error al cargar participantes.</li>";
            console.error(err);
          }
        }

        console.log("Evento ID:", info.event.id_usuario);
        // Llenar modal con datos del evento
        document.getElementById("modalEventTitle").textContent =
          event.title || "Sin título";
        document.getElementById("modalEventDescription").textContent =
          event.extendedProps.description || "Sin descripción";

        // Formatear fechas
        const start = event.start
          ? event.start.toLocaleString()
          : "No disponible";
        const end = event.end ? event.end.toLocaleString() : "No disponible";

        document.getElementById("modalEventStart").textContent = start;
        document.getElementById("modalEventEnd").textContent = end;

        // document.getElementById("modalEventParticipants").textContent =
        //   event.extendedProps.participants;

        if (eventId && info.event.extendedProps.id_usuario === userId) {
          document.getElementById(
            "modalEditLink"
          ).href = `/editEvent.html?id=${eventId}`;
          document.getElementById("modalEditLink").style.display =
            "inline-block";
          document.getElementById("modalSignLink").style.display = "none";
        } else {
          document.getElementById("modalEditLink").style.display = "none";
          document.getElementById("modalSignLink").style.display =
            "inline-block";
        }
        document
          .getElementById("modalSignLink")
          .addEventListener("click", async () => {
            try {
              const resp = await fetch(
                `http://localhost:5000/evento/${eventId}/inscribirse`,
                {
                  method: "PUT",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              const data = await resp.json();
              if (!resp.ok)
                throw new Error(data.message || "Error en la inscripción");

              alert("Te has inscrito al evento correctamente.");
              modal.hide(); // Cierra el modal (si tienes la instancia global)
            } catch (err) {
              alert(err.message);
            }
          });

        // Mostrar el modal (Bootstrap 5)
        const modal = new bootstrap.Modal(
          document.getElementById("eventModal")
        );
        loadParticipants(eventId);

        modal.show();
      },
    }
  );
  calendar.render();
});
