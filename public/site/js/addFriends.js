document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login/index.html"; // Redirige si no hay token
  }
  let usuarios = [];
  let solicitudes = [];

  const tabla = document.getElementById("tablaUsuarios");
  const pendientes = document.getElementById("tablaPendientes");
  const filtro = document.getElementById("filtroNombre");

  async function getUsuarios() {
    try {
      const resp = await fetch("http://localhost:5000/usuarios", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!resp.ok) throw new Error(`Error: ${resp.status} ${resp.statusText}`);
      const json = await resp.json();
      return json.users;
    } catch (error) {
      console.error("Fallo en la obtención de eventos:", error);
      return [];
    }
  }

  usuarios = await getUsuarios();

  async function getSolicitudes() {
    try {
      const resp = await fetch("http://localhost:5000/solicitud", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!resp.ok) throw new Error(`Error: ${resp.status} ${resp.statusText}`);
      const json = await resp.json();
      return json.users;
    } catch (error) {
      console.error("Fallo en la obtención de eventos:", error);
      return [];
    }
  }

  solicitudes = await getSolicitudes();

  function renderizarUsuarios(filtrados) {
    tabla.innerHTML = "";

    filtrados.forEach((user) => {
      const fila = document.createElement("tr");

      const celdaNombre = document.createElement("td");
      celdaNombre.textContent = `${user.nombre} ${user.apellido}`;
      fila.appendChild(celdaNombre);

      const celdaCorreo = document.createElement("td");
      celdaCorreo.textContent = user.correo;
      fila.appendChild(celdaCorreo);

      const celdaBoton = document.createElement("td");
      const boton = document.createElement("button");

      if (user.estado === 0) {
        boton.textContent = "Pendiente";
        boton.classList.add("btn", "btn-warning", "btn-sm");
        boton.disabled = true;
      } else if (user.estado === 1) {
        boton.textContent = "Amigo";
        boton.classList.add("btn", "btn-info", "btn-sm");
        boton.disabled = true;
      } else {
        boton.textContent = "Agregar";
        boton.id = `btnAgregar-${user.id}`;
        boton.classList.add("btn", "btn-success", "btn-sm");
      }

      celdaBoton.appendChild(boton);
      fila.appendChild(celdaBoton);

      tabla.appendChild(fila);
    });
  }

  function renderizarPendientes(filtrados) {
    // Limpia la tabla primero
    pendientes.innerHTML = "";

    filtrados.forEach((user) => {
      const fila = document.createElement("tr");

      const celdaNombre = document.createElement("td");
      celdaNombre.textContent = `${user.nombre} ${user.apellido}`;
      fila.appendChild(celdaNombre);

      const celdaCorreo = document.createElement("td");
      celdaCorreo.textContent = user.correo;
      fila.appendChild(celdaCorreo);

      const celdaBoton = document.createElement("td");
      const boton = document.createElement("button");
      boton.textContent = "Aceptar";
      boton.id = `btnAceptar-${user.id}`;
      boton.classList.add("btn", "btn-success", "btn-sm", "me-2");
      celdaBoton.appendChild(boton);
      const espacio = document.createElement("span");
      espacio.textContent = " ";
      celdaBoton.appendChild(espacio);
      const boton2 = document.createElement("button");
      boton2.textContent = "Denegar";
      boton2.id = `btnDenegar-${user.id}`;
      boton2.classList.add("btn", "btn-danger", "btn-sm", "me-2");
      celdaBoton.appendChild(boton2);

      fila.appendChild(celdaBoton);

      pendientes.appendChild(fila);
    });
  }

  renderizarUsuarios(usuarios);
  renderizarPendientes(solicitudes);

  filtro.addEventListener("input", () => {
    const texto = filtro.value.toLowerCase();

    const filtrados = usuarios.filter(
      (u) =>
        u.nombre.toLowerCase().includes(texto) ||
        u.apellido.toLowerCase().includes(texto) ||
        u.correo.toLowerCase().includes(texto)
    );

    renderizarUsuarios(filtrados);
  });

  document.querySelectorAll("button[id^='btnAgregar-']").forEach((btn) => {
    btn.addEventListener("click", () => {
      let id = btn.id;
      id = id.split("-")[1];
      envairAmistad(id);
    });
  });
  async function envairAmistad(id) {
    try {
      const resp = await fetch(`http://localhost:5000/nuevoAmigo`, {
        method: "POST",
        body: JSON.stringify({
          id_amigo: id,
          estado: 0,
        }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!resp.ok) throw new Error(`Error: ${resp.status} ${resp.statusText}`);

      const data = await resp.json();
      alert(data.message || "Solicitud enviada correctamente");
      location.reload();
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      alert("Fallo en la conexión al servidor");
    }
  }

  async function aceptarSolicitud(idAmigo) {
    try {
      const resp = await fetch(`http://localhost:5000/solicitud/${idAmigo}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!resp.ok) throw new Error(`Error: ${resp.status} ${resp.statusText}`);

      const result = await resp.json();
      alert(result.message);
      window.location.reload(); // Recargar la página después de aceptar
    } catch (error) {
      console.error("Error al aceptar solicitud:", error);
      alert("Error al aceptar la solicitud");
    }
  }

  async function denegarSolicitud(idAmigo) {
    try {
      const resp = await fetch(`http://localhost:5000/solicitud/${idAmigo}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!resp.ok) throw new Error(`Error: ${resp.status} ${resp.statusText}`);

      const result = await resp.json();
      alert(result.message);
      window.location.reload(); // Recargar la página después de denegar
    } catch (error) {
      console.error("Error al denegar solicitud:", error);
      alert("Error al denegar la solicitud");
    }
  }

  document.querySelectorAll("button[id^='btnAceptar-']").forEach((btn) => {
    btn.addEventListener("click", () => {
      let id = btn.id;
      id = id.split("-")[1];
      aceptarSolicitud(id);
    });
  });
  document.querySelectorAll("button[id^='btnDenegar-']").forEach((btn) => {
    btn.addEventListener("click", () => {
      let id = btn.id;
      id = id.split("-")[1];
      denegarSolicitud(id);
    });
  });
});
