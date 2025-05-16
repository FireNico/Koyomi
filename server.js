const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

// Servir la carpeta 'public'
app.use(express.static(path.join(__dirname, "site")));

// Ruta raíz opcional
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "site", "index.html"));
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
