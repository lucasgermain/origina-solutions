# Hello World

*Fase 2, capítulo 2. Primer código corriendo de punta a punta.*

## Qué se construyó

Un servidor HTTP mínimo en JavaScript puro (sin frameworks, sin dependencias externas), que responde con un texto fijo. Código en [`app/hello-world/server.js`](../../app/hello-world/server.js).

```js
const http = require('http');

const servidor = http.createServer((peticion, respuesta) => {
  respuesta.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  respuesta.end('Hola, Centro de Control PYME. El servidor está funcionando.');
});

servidor.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
```

## Cómo correrlo

```bash
cd app/hello-world
node server.js
```

Abrir `http://localhost:3000` en el navegador. Detener con `Ctrl+C` en la terminal.

## Por qué esto ya vale como "primer producto funcionando" (a nivel de infraestructura)

Prueba que el circuito completo funciona: código → Node lo ejecuta → abre un puerto → el navegador le pide algo → el servidor responde. Todo lo que construyamos después (NestJS, la base de datos, el frontend en React) es una versión más sofisticada de este mismo circuito, no algo distinto.

## Errores que nos encontramos (y quedan para la posteridad)

Al primer intento, el navegador mostró **"Se rechazó la conexión"**. Diagnóstico paso a paso:

1. `cd app/hello-world` dio `No such file or directory` — la terminal no estaba parada dentro de `CentroControlPYME` cuando se corrió `mkdir`. Se resolvió confirmando la ubicación con `pwd` y volviendo a crear la carpeta ya parados en el lugar correcto.
2. Con la carpeta ya bien ubicada, `node server.js` no mostraba ningún error pero tampoco funcionaba — volvía al `$` de inmediato. Se verificó el contenido del archivo con `cat server.js` y salió vacío: el código nunca se había guardado en el archivo.
3. Se volvió a abrir el archivo (`code server.js`), se pegó el código, se guardó explícitamente con `Ctrl+S`, y se confirmó con `cat server.js` que el contenido quedó completo antes de volver a correr `node server.js`.

**Lección para los próximos capítulos**: cuando algo "no hace nada" (ni error, ni resultado), sospechar primero de que el archivo no se guardó — `cat archivo.js` es la forma más rápida de confirmarlo antes de seguir buscando el problema en otro lado.

---

**Checkpoint de este capítulo**: `http://localhost:3000` muestra el texto en el navegador. ✅ Cumplido.
