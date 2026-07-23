# Cierre de la Fase 3

*Revisión de qué se construyó, qué falta antes de la Fase 4, y qué sigue.*

## Qué existe hoy

El sistema dejó de ser una sola pantalla y se separó en dos aplicaciones:

- **`app/backend`**: API en Node.js + PostgreSQL. Expone datos en JSON (con CORS) para clientes, ventas y SKUs/inventario, además de las rutas HTML originales de la Fase 2 (movimientos bancarios).
- **`app/frontend`**: aplicación en React (Vite), con tres pantallas — Clientes, Ventas, Inventario — navegables desde una sola página, cada una en su propio componente (`src/paginas/`).

Con datos de prueba, el sistema ya resuelve un pedazo real de dos preguntas de negocio de la [visión](../00-vision-y-negocio/vision.md):

- **Pregunta 2 — "¿dónde se pierde el dinero?"**: cada venta ligada a un SKU calcula su margen real (`monto − costo`).
- **Pregunta 4 — "¿qué gastos puedo reducir?"**: el costo promedio (PMP) de cada SKU se recalcula automáticamente con cada compra, y el stock se descuenta solo al vender — la base para detectar productos que cuestan más de lo que rinden.

Se eligió **SimpleAPI** ([ADR-007](../01-arquitectura/decisiones-tecnicas-ADR.md)) como proveedor de facturación electrónica, aunque todavía no está conectado — las ventas se siguen registrando con datos de prueba.

Desde el capítulo de Introducción a React, el código lo escribe y prueba el CTO directamente, no línea por línea ([ADR-008](../01-arquitectura/decisiones-tecnicas-ADR.md)).

## Qué falta antes de la Fase 4

1. **Conectar SimpleAPI de verdad**: hoy los documentos de venta son datos de prueba con folio y fecha generados localmente, no DTE reales emitidos y timbrados por el SII.
2. **Una venta solo admite un SKU**: no hay "líneas de detalle" para vender varios productos en un mismo documento — suficiente para probar el cálculo de margen, pero no para un documento de venta real con varias líneas.
3. **`centro_costo` sigue siendo texto libre** (`"Providencia"`, `"Ñuñoa"`), no la entidad propia con jerarquía que define el [modelo de datos](../02-modelo-de-datos/modelo-de-datos.md) — pendiente arrastrado desde el cierre de la Fase 2.
4. **Credenciales de Postgres hardcodeadas** en `server.js` — mismo pendiente de seguridad de la Fase 2, aún sin resolver.
5. **Rutas HTML antiguas de Clientes y Ventas** (`/clientes`, `/ventas` en `server.js`) quedaron sin uso una vez migradas a React — conviene limpiarlas en algún momento para no dejar código muerto.
6. **Sin autenticación ni roles**: el [diseño de interfaces](../03-diseno-interfaces/diseno-interfaces.md) define accesos por rol, pero hoy cualquiera que abra la app ve y edita todo.
7. **Dashboard ejecutivo (Pantalla 1)** todavía no se construye — sigue esperando a que haya datos reales de venta, gasto y deuda para tener algo significativo que mostrar.

## Qué sigue (Fase 4 del roadmap)

Integración con BUK/Talana (remuneraciones), módulo de deuda y leasing con tabla de amortización, y motor de proyección de caja a 60-90 días. Cierra las preguntas de negocio 5 ("¿cuánto puedo retirar?") y 6 ("¿voy a necesitar financiamiento?").

## Estado de la Fase 3

| Capítulo | Estado |
|---|---|
| Proveedor de facturación electrónica (SimpleAPI) | ✅ |
| Módulo Clientes | ✅ |
| Documentos de venta | ✅ |
| Introducción a React | ✅ |
| Inventario por SKU | ✅ |
| Costeo y margen | ✅ |
| Cierre de fase | ✅ |

**Fase 3 completa.**
