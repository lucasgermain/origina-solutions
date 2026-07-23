# Deuda y leasing

*Fase 4, capítulo 3. Primera vez que el sistema calcula algo financiero no trivial: una tabla de amortización.*

## Qué se construyó

**Backend** (`app/backend/server.js`):

- Tabla `deudas_leasing` (tipo, acreedor, monto original, tasa de interés mensual, plazo en meses, fecha de inicio, centro de costo opcional — puede ser `null` si la deuda es de toda la empresa).
- Tabla `cuotas_deuda` (número de cuota, fecha de vencimiento, capital, interés, estado de pago).
- Al registrar una deuda (`POST /api/deudas`), el sistema **genera automáticamente todas las cuotas** con el sistema francés de amortización (cuota fija) — no hay que cargarlas a mano una por una.
- `GET /api/deudas`: lista las deudas con su saldo pendiente (suma del capital de las cuotas no pagadas) y la fecha de la próxima cuota, calculados al vuelo.
- `GET /api/deudas/:id/cuotas`: el detalle completo de la tabla de amortización de una deuda.
- `POST /api/cuotas/:id/pagar`: marca una cuota como pagada.

**Frontend**: nueva pantalla `src/paginas/Deuda.jsx`. El formulario registra la deuda; la tabla principal muestra cada deuda con su saldo pendiente; un botón "Ver cuotas" despliega la tabla de amortización completa debajo, con botón para marcar cada cuota como pagada.

## Conceptos nuevos usados

| Concepto | Qué es |
|---|---|
| Sistema francés de amortización | Método de pago de deudas donde la **cuota total es siempre el mismo monto**, pero la proporción entre interés y capital cambia mes a mes: al principio se paga más interés (porque el saldo pendiente es alto), y con el tiempo se paga más capital (porque el saldo baja). Es el sistema que usan la gran mayoría de créditos y leasings en Chile |
| Fórmula de la cuota fija | `cuota = monto × tasa / (1 − (1+tasa)^−plazo)` — se calcula una sola vez al crear la deuda, y de ahí se deriva cuánto de cada cuota es interés (`saldo_pendiente × tasa`) y cuánto es capital (`cuota − interés`) |
| Generar N filas a partir de una sola acción del usuario | Registrar una deuda crea 1 fila en `deudas_leasing` pero puede crear 12, 24 o 36 filas en `cuotas_deuda` de una vez — la función `generarTablaDeAmortizacion` hace ese trabajo en un loop, para que el usuario no tenga que cargar cuota por cuota |
| Estado calculado vs. estado guardado | `estado_pago` solo guarda `pendiente` o `pagado` — el estado `vencido` (que sí aparece en el [modelo de datos](../02-modelo-de-datos/modelo-de-datos.md)) no se guarda: se **calcula en la consulta** comparando la fecha de vencimiento con la fecha de hoy. Así nunca queda una cuota marcada "vencida" a mano que después haya que corregir |

## Alcance de este capítulo

- La tasa de interés se ingresa como **tasa mensual** directa (ej. `0.015` = 1,5%), no anual convertida — simplifica el cálculo y es coherente con cómo suelen cotizarse los créditos comerciales en Chile.
- No hay conciliación automática contra `movimientos_bancarios` (confirmar que la cuota efectivamente se pagó desde la cuenta bancaria real) — se marca a mano, igual que las liquidaciones de remuneraciones.

## Cómo correrlo

```bash
# Ventana 1 — la API
cd app/backend
docker compose up -d
node server.js
```

```bash
# Ventana 2 — la interfaz visual
cd app/frontend
npm run dev
```

`http://localhost:5173` — botón "Deuda".

---

**Checkpoint de este capítulo**: pendiente de confirmación del fundador — registrar una deuda, ver la tabla de amortización generada automáticamente, y marcar una cuota como pagada.
