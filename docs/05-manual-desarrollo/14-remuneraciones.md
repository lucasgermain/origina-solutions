# Remuneraciones

*Fase 4, capítulo 2. Primer módulo que registra un gasto recurrente por empleado y centro de costo, con datos de prueba mientras se conecta Talana ([ADR-009](../01-arquitectura/decisiones-tecnicas-ADR.md)).*

## Qué se construyó

**Backend** (`app/backend/server.js`):

- Tabla `empleados` (RUT, nombre, cargo, centro de costo).
- Tabla `liquidaciones` (empleado, periodo `AAAA-MM`, sueldo líquido, sueldo imponible, cotizaciones, estado de pago).
- `GET/POST /api/empleados`, `GET/POST /api/liquidaciones`.
- `POST /api/liquidaciones/:id/pagar`: marca una liquidación como pagada (simula lo que en producción pasaría al conciliar el pago contra un movimiento bancario real — esa conciliación automática todavía no existe, se marca a mano).

**Frontend**: nueva pantalla `src/paginas/Remuneraciones.jsx`, agregada a la navegación. Formularios para crear empleados y registrar liquidaciones por periodo, tabla con estado de pago y un botón para marcarlas como pagadas.

## Conceptos nuevos usados

| Concepto | Qué es |
|---|---|
| Ruta con parámetro (`/api/liquidaciones/:id/pagar`) | Hasta ahora todas las rutas eran fijas (`/api/clientes`, `/api/skus`). Esta lleva un ID variable en el medio de la URL — se resolvió con una expresión regular (`ruta.match(/^\/api\/liquidaciones\/\d+\/pagar$/)`) en vez de una comparación exacta, porque el ID cambia en cada liquidación |
| Estado de un documento (`pendiente` → `pagado`) | Primer caso en el sistema donde un registro cambia de estado después de creado, en vez de solo crearse y listarse — el mismo patrón que más adelante va a usar la conciliación bancaria real |

## Alcance de este capítulo

- Los datos de empleados y liquidaciones son de prueba, cargados a mano — la conexión real a Talana queda para cuando se resuelva el pendiente de autenticación/roles (dato sensible, señalado en el [cierre de la Fase 3](./13-cierre-de-fase.md)).
- "Marcar como pagada" es manual; la conciliación automática contra `movimientos_bancarios` (que el pago líquido efectivamente salió de la cuenta) no está implementada todavía.

## Cómo correrlo

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

`http://localhost:5173` — botón "Remuneraciones".

---

**Checkpoint de este capítulo**: pendiente de confirmación del fundador — crear un empleado, registrar una liquidación para un periodo, y marcarla como pagada.
