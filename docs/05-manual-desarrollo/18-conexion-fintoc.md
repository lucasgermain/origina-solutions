# Conexión real a Fintoc

*Fase 5, único capítulo. Se reemplaza la última fuente de datos de prueba del sistema: los movimientos bancarios.*

## Qué se construyó

**Credenciales fuera del código** (`app/backend/.env`, nunca se sube a git):

Hasta este capítulo, el usuario y contraseña de PostgreSQL estaban escritos directo en `server.js` — un pendiente señalado desde el cierre de la Fase 2. Se aprovechó este capítulo para resolverlo de una vez: todas las credenciales (Postgres **y** Fintoc) ahora viven en un archivo `.env`, que `server.js` lee al arrancar usando el paquete `dotenv`. El archivo `.env` está en `.gitignore`, así que nunca queda expuesto en el repositorio.

**Conexión a Fintoc** ([ADR-001](../01-arquitectura/decisiones-tecnicas-ADR.md)):

- Se creó una cuenta de Fintoc y, desde su Dashboard en **modo Test**, un Link de prueba usando credenciales sandbox (no un banco real todavía).
- `sincronizarConFintoc()` usa el SDK oficial (`fintoc`) para pedir las cuentas del Link y, de cada una, sus movimientos — y los guarda en `movimientos_bancarios`.
- Cada movimiento se guarda con su `fintoc_id` (el id que le asigna Fintoc), con una restricción `UNIQUE` — así, sincronizar varias veces no duplica movimientos ya guardados (`ON CONFLICT (fintoc_id) DO NOTHING`).
- Fintoc no sabe nada de "centro de costo" — es un concepto propio de este proyecto. Cada movimiento nuevo entra con `centro_costo = 'Sin asignar'`, y hay que clasificarlo a mano.

**Frontend**: la pantalla de movimientos bancarios finalmente se migró a React (`src/paginas/Bancos.jsx`), reemplazando el HTML original de la Fase 2 — era la última pantalla que quedaba sin migrar. Tiene un botón "Sincronizar con Fintoc" y, en cada fila, un selector para asignar (o reasignar) el centro de costo del movimiento.

## Conceptos nuevos usados

| Concepto | Qué es |
|---|---|
| Variables de entorno (`.env` + `dotenv`) | Forma estándar de mantener configuración sensible (contraseñas, API keys) fuera del código fuente. `dotenv` lee el archivo `.env` y lo carga como si fueran variables del sistema (`process.env.LO_QUE_SEA`) |
| Modo sandbox / test de un proveedor externo | Igual que con SimpleAPI y Talana, Fintoc separa completamente los datos de prueba (`sk_test_...`) de los datos reales — nunca se mezclan, y en modo test es imposible conectar una cuenta bancaria real por error |
| Idempotencia al sincronizar (`ON CONFLICT ... DO NOTHING`) | Sincronizar debe poder ejecutarse muchas veces sin duplicar datos — el `fintoc_id` único es lo que se lo permite a Postgres detectar y descartar automáticamente los movimientos que ya existían |
| Dato que llega "sin clasificar" | Es la primera vez que el sistema recibe datos de un tercero que no vienen con toda la información que el negocio necesita (el centro de costo). Se resolvió con un valor por defecto explícito (`'Sin asignar'`) en vez de dejarlo vacío, para que sea visible y fácil de filtrar/corregir |

## Alcance de este capítulo

- Se probó contra el **sandbox** de Fintoc, con credenciales de prueba — no contra una cuenta bancaria real todavía. Conectar el banco real de la empresa es un paso de negocio (contratar el plan pagado de Fintoc, autorizar el acceso a la cuenta real) que queda para cuando corresponda.
- La sincronización es manual (botón), no automática — Fintoc soporta webhooks para avisar de movimientos nuevos en tiempo real, pero eso es una mejora futura, no necesaria para probar el flujo completo.
- La asignación de centro de costo sigue siendo manual, movimiento por movimiento — no hay reglas automáticas (por ejemplo, "todo lo que diga 'arriendo' va a Overhead").

## Cómo correrlo

**Antes de correrlo por primera vez**, instala los paquetes nuevos:

```bash
# Ventana 1
cd app/backend
npm install dotenv fintoc
```

Después:

```bash
# Ventana 1 — la API
docker compose up -d
node server.js
```

```bash
# Ventana 2 — la interfaz visual
cd app/frontend
npm run dev
```

`http://localhost:5173` — botón "Bancos" (ahora es la primera pantalla). Dale a "Sincronizar con Fintoc" y confirma que aparecen movimientos nuevos; después, asígnales un centro de costo desde el selector de cada fila.

---

**Checkpoint de este capítulo**: pendiente de confirmación del fundador — sincronizar y ver movimientos reales (de sandbox) aparecer en la tabla, y poder asignarles un centro de costo.
