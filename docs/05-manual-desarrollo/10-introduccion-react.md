# Introducción a React

*Fase 3, capítulo 4. Se separa el proyecto en backend (API) y frontend (React). Desde este capítulo, el código lo escribe y corre el CTO directamente ([ADR-008](../01-arquitectura/decisiones-tecnicas-ADR.md), reemplaza [ADR-005](../01-arquitectura/decisiones-tecnicas-ADR.md)).*

## Qué se construyó

Hasta ahora, `server.js` hacía dos trabajos a la vez: guardar/leer datos de PostgreSQL, y armar el HTML que se mostraba en el navegador. Ese segundo trabajo pasa ahora a una aplicación separada, escrita en **React**, que le pide los datos al servidor y decide cómo mostrarlos.

1. **`app/hello-world` renombrada a `app/backend`**, para reflejar que de ahora en adelante es solo la API — ya no arma páginas HTML para todas las pantallas.
2. **API en JSON**: se agregaron las rutas `GET /api/clientes` y `POST /api/clientes` en `app/backend/server.js`, que devuelven/reciben datos en formato JSON en vez de HTML. Las rutas HTML anteriores (`/`, `/clientes`, `/ventas`) se dejaron intactas por ahora — no las usa nadie todavía, pero no estorban.
3. **CORS habilitado**: se agregaron encabezados (`Access-Control-Allow-Origin`, etc.) para que un sitio corriendo en otro puerto (React, en `localhost:5173`) tenga permiso del navegador para pedirle datos a la API (`localhost:3000`).
4. **`app/frontend`**: aplicación nueva creada con **Vite**, con una sola pantalla (`src/App.jsx`) que reemplaza la página `/clientes` en HTML: pide la lista de clientes a la API al cargar, la muestra en una tabla, y tiene un formulario que agrega un cliente nuevo sin recargar la página.

## Conceptos nuevos usados

| Concepto | Qué es |
|---|---|
| API en JSON vs. servidor que arma HTML | Dos formas distintas de servir datos: la primera (`server.js` hasta ahora) devuelve páginas ya armadas y listas para mostrar; la segunda devuelve solo los datos "en crudo" y deja que otra aplicación (React) decida cómo mostrarlos. Esto es lo que permite que el mismo backend, más adelante, sirva también a una futura app de celular sin cambiar nada |
| CORS | Medida de seguridad del navegador: por defecto, una página no puede pedir datos a un servidor en otro origen (dominio o puerto) salvo que ese servidor lo autorice explícitamente con encabezados HTTP |
| Vite | Herramienta que arma el esqueleto de un proyecto React y lo sirve con recarga automática (*hot reload*) mientras se edita |
| Componente (`App.jsx`) | En React, una pantalla es una función que devuelve lo que se debe mostrar, en vez de un string de HTML armado a mano |
| `useState` | Guarda datos que pueden cambiar (la lista de clientes, lo que se está escribiendo en el formulario) y hace que React vuelva a dibujar la pantalla cuando cambian |
| `useEffect` | Ejecuta una acción (pedir los clientes a la API) automáticamente cuando la pantalla se muestra por primera vez |
| `fetch` | Forma en que el navegador le pide datos a un servidor por red — el equivalente, del lado del frontend, a lo que `pool.query` hace del lado del backend contra la base de datos |

## Cómo correrlo

Se necesitan **dos terminales abiertas al mismo tiempo**, porque ahora son dos programas distintos:

```bash
# Terminal 1 — la API
cd app/backend
docker compose up -d
node server.js
```

```bash
# Terminal 2 — la interfaz visual
cd app/frontend
npm run dev
```

`http://localhost:5173` muestra la pantalla de Clientes en React (lista + formulario). `http://localhost:3000/api/clientes` sigue mostrando los mismos datos, pero en JSON crudo — es lo que React consume por debajo.

## Cambio de modalidad de trabajo

Desde este capítulo, el CTO escribe y prueba el código directamente en los archivos del proyecto, en vez de dictarlo línea por línea. El fundador sigue corriendo los comandos que dependen de su máquina (Docker, `npm run dev`, `node server.js`, `git push`) y validando cada resultado en el navegador. El detalle de esta decisión y sus consecuencias está en [ADR-008](../01-arquitectura/decisiones-tecnicas-ADR.md).

---

**Checkpoint de este capítulo**: pendiente de confirmación del fundador — ver `http://localhost:5173` mostrando la lista de clientes y poder agregar uno nuevo desde el formulario.
