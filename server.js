const http = require('http');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('<h1>¡Hola desde Node.js en Ubuntu!</h1>');
});

server.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
