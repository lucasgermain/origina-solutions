const http = require('http');

const servidor = http.createServer((peticion, respuesta) => {
  respuesta.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  respuesta.end('Hola, Centro de Control PYME. El servidor está funcionando.');
});

servidor.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
