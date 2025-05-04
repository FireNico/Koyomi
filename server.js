const express = require('express');
const app = express();
const path = require('path');

// Servir archivos estáticos desde la carpeta actual
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, () => {
  console.log('Servidor en http://localhost:3000');
});
