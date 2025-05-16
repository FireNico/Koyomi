document.addEventListener("DOMContentLoaded", function () {
  const calendar = new FullCalendar.Calendar(
    document.getElementById("calendar"),
    {
      initialView: "dayGridMonth", // Vista inicial (mes)
      events: [
        {
          title: "Evento 1",
          start: "2025-05-14T09:00:00",
          end: "2025-05-14T11:00:00",
        },
        {
          title: "Evento 2",
          start: "2025-05-15T13:00:00",
          end: "2025-05-15T15:00:00",
        },
        {
          title: "Evento 3",
          start: "2025-05-16T10:00:00",
          end: "2025-05-16T12:00:00",
        },
      ],
    }
  );
  calendar.render();
});
