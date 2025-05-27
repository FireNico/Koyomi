document.addEventListener("DOMContentLoaded", async function () {
  let eventos = [];

  async function getEventos() {
    try {
      const resp = await fetch("http://localhost:5000/eventos");
      if (!resp.ok) throw new Error(`Error: ${resp.status} ${resp.statusText}`);
      const json = await resp.json();
      return json.events.map((evento) => ({
        id: evento.id,
        title: evento.title,
        start: evento.start,
        end: evento.end,
        description: evento.descripcion,
      }));
    } catch (error) {
      console.error("Fallo en la obtención de productos:", error);
      return [];
    }
  }

  eventos = await getEventos();
  console.log(eventos);

  const calendar = new FullCalendar.Calendar(
    document.getElementById("calendar"),
    {
      initialView: "dayGridMonth",

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
        const eventId = info.event._def.publicId;
        if (eventId) {
          window.location.href = `/editEvent.html?id=${eventId}`;
        } else {
          alert("Este evento no tiene ID");
        }
      },
    }
  );
  calendar.render();
});
