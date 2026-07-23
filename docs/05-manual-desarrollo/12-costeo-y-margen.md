# Costeo y margen

*Fase 3, capítulo 6. Se cruza la venta con el costo del SKU vendido — primera vez que el sistema calcula margen real.*

## Qué se construyó

Hasta ahora, "Documentos de venta" y "Inventario" eran dos módulos separados: uno registraba cuánto se le cobró a un cliente, el otro cuánto costaba y cuánto stock quedaba de cada producto. Este capítulo los conecta.

**Backend** (`app/backend/server.js`):

- `documentos_venta` gana tres columnas nuevas: `sku_id`, `cantidad`, `costo_unitario` (todas opcionales, para no romper las ventas ya registradas sin esa información).
- Al registrar una venta con SKU, el sistema **congela** el costo promedio (PMP) vigente del SKU en ese momento, como `costo_unitario` de esa venta — para que el margen de una venta antigua no cambie si el costo del SKU sigue moviéndose después.
- Registrar una venta con SKU **también genera automáticamente una salida de inventario** (`movimientos_inventario`, tipo `salida`) — así el stock calculado en la pantalla de Inventario queda al día solo, sin doble carga de datos.
- `GET /api/ventas` calcula el margen de cada venta al vuelo: `monto - (cantidad × costo_unitario)`.

**Frontend**: nueva pantalla `src/paginas/Ventas.jsx`, que reemplaza la versión HTML de `/ventas`. El formulario permite elegir un SKU opcional (si la venta no está ligada a un producto de inventario, se registra igual, sin margen calculado). La tabla muestra el margen de cada venta.

## Conceptos nuevos usados

| Concepto | Qué es |
|---|---|
| Margen | Lo que queda de una venta después de descontar el costo de lo vendido: `monto − (cantidad × costo)`. Es la primera vez que el sistema responde, con datos reales de prueba, la pregunta de negocio "¿dónde se pierde el dinero?" |
| Congelar (snapshot) un valor que cambia con el tiempo | El costo promedio de un SKU se sigue moviendo con cada entrada nueva. Si el margen de una venta se calculara siempre contra el costo *actual*, el margen de ventas viejas cambiaría solo con el tiempo — lo cual no tiene sentido contablemente. Por eso se guarda una copia del costo al momento exacto de la venta |
| Efecto en cascada de una acción | Registrar una venta ahora dispara dos cosas: crear la fila en `documentos_venta` y crear una salida en `movimientos_inventario`. Se resolvió con una función (`registrarVenta`) que orquesta ambos pasos, en vez de duplicar esa lógica en el frontend |
| `ADD COLUMN IF NOT EXISTS` | Instrucción SQL para agregar una columna a una tabla que ya existe (con datos adentro) sin borrar nada — necesaria porque `documentos_venta` ya tenía filas de capítulos anteriores |

## Alcance de este capítulo

- Una venta solo puede llevar **un** SKU (no hay "líneas de detalle" para vender varios productos en un mismo documento) — suficiente para probar el cálculo de margen con datos controlados; una venta multi-producto es una extensión futura si se necesita.
- La ruta HTML vieja (`/ventas`, generada por el servidor) se dejó intacta pero sin uso — la pantalla real ahora es la de React.

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

`http://localhost:5173` — botón "Ventas". Al registrar una venta con SKU, revisa también la pantalla de Inventario: el stock debería haber bajado en la cantidad vendida.

---

**Checkpoint de este capítulo**: pendiente de confirmación del fundador — registrar una venta ligada a un SKU y confirmar que (a) aparece con su margen calculado en Ventas, y (b) el stock de ese SKU bajó en Inventario.
