# Módulo Clientes

*Fase 3, capítulo 2. Primera pantalla que además de leer datos, los crea.*

## Qué se construyó

Una segunda ruta en `app/hello-world/server.js`, `/clientes`, con:

- Tabla `clientes` en PostgreSQL (`rut`, `nombre`, `centro_costo`).
- Un formulario HTML (`GET /clientes` la muestra) que al enviarse hace `POST /clientes`, guarda el cliente en la base de datos, y redirige de vuelta a `GET /clientes` para mostrar la lista actualizada.
- Navegación simple entre `/` (movimientos bancarios) y `/clientes`.

## Conceptos nuevos usados

| Concepto | Qué es |
|---|---|
| Ruteo por `pathname` + `method` | El servidor ahora decide qué hacer mirando la ruta (`/` vs `/clientes`) y el método HTTP (`GET` vs `POST`) — así una sola aplicación atiende varias pantallas |
| Leer el cuerpo de un `POST` | Los datos de un formulario no llegan de una vez; llegan en fragmentos (eventos `data`) y hay que esperar el evento `end`. Se envolvió en una `Promise` (`leerCuerpo`) para poder usar `await` |
| `querystring.parse()` | Decodifica el formato `rut=...&nombre=...` que manda un formulario HTML por `POST` |
| Patrón Post-Redirect-Get (`writeHead(302, { Location: ... })`) | Después de guardar, se redirige a un `GET` en vez de dejar la respuesta del `POST` — evita que recargar la página vuelva a enviar el formulario |

## Problema encontrado (repetido de un capítulo anterior)

Al editar `server.js` sin haber entrado antes a `app/hello-world`, se volvió a crear un archivo duplicado en la raíz del proyecto — el mismo error de la Fase 2. Se resolvió igual que la vez pasada: mover el archivo con `mv server.js app/hello-world/server.js` y confirmar que la raíz quedara sin `server.js` suelto. **Lección reforzada**: siempre `pwd` antes de `code server.js`.

## Cómo correrlo

```bash
cd app/backend
docker compose up -d   # si Postgres no está corriendo
node server.js
```

`http://localhost:3000/clientes` muestra el formulario y la lista; `http://localhost:3000` sigue mostrando los movimientos bancarios, con un link para ir a Clientes.

---

**Checkpoint de este capítulo**: se agregó un cliente de prueba desde el formulario y apareció en la tabla sin recargar manualmente. ✅ Cumplido.
