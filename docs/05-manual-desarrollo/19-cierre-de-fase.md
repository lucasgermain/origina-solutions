# Cierre de la Fase 5

*Revisión de qué se construyó, qué queda pendiente, y qué sigue — cierre del roadmap original completo.*

## Qué existe hoy

Con este capítulo se cierra la última fase planeada desde el [roadmap](../04-roadmap/roadmap.md) original. El sistema pasó de una idea documentada en `docs/` a una aplicación con **7 pantallas en React** (Bancos, Clientes, Ventas, Inventario, Remuneraciones, Deuda, Proyección de caja) sobre una API propia en Node + PostgreSQL, y con **una conexión externa real funcionando**: Fintoc, en modo sandbox.

De las seis preguntas de negocio de la [visión](../00-vision-y-negocio/vision.md), el sistema ya responde, con datos de prueba (y en el caso del banco, datos de sandbox reales):

1. **¿Cuánta plata ganó cada sucursal?** — movimientos bancarios y ventas, ambos por centro de costo.
2. **¿Dónde se pierde el dinero?** — margen por venta, cruzando precio de venta con costo (PMP) del SKU.
3. **¿Qué negocio genera caja?** — movimientos bancarios reales sincronizados desde Fintoc.
4. **¿Qué gastos puedo reducir?** — costo promedio por SKU, visible en Inventario.
5. **¿Cuánto puedo retirar?** — parcialmente: hay visibilidad de saldo y compromisos, pero no un cálculo explícito de "capacidad de retiro".
6. **¿Voy a necesitar financiamiento?** — Proyección de caja, con alerta de fecha exacta si el saldo se pondría negativo.

## Qué queda pendiente (acumulado de todas las fases)

Ninguno de estos bloquea seguir usando o mostrando el sistema, pero son las brechas reales entre "proyecto de aprendizaje funcionando" y "producto en producción con datos de un cliente real":

1. **Conexiones externas reales**: Fintoc, SimpleAPI ([ADR-007](../01-arquitectura/decisiones-tecnicas-ADR.md)) y Talana ([ADR-009](../01-arquitectura/decisiones-tecnicas-ADR.md)) están todas elegidas y probadas en modo sandbox/prueba — ninguna está conectada a datos de producción todavía. Eso implica cotizar planes pagos y, en el caso de Fintoc, autorizar una cuenta bancaria real.
2. **Sin autenticación ni roles**: el [diseño de interfaces](../03-diseno-interfaces/diseno-interfaces.md) definió accesos por rol desde el principio — nunca se implementó. Con remuneraciones y ahora movimientos bancarios reales en el sistema, es el pendiente más urgente antes de cualquier uso con datos sensibles reales.
3. **`centro_costo` sigue siendo texto libre**, no la entidad propia con jerarquía y reglas de prorrateo que define el [modelo de datos](../02-modelo-de-datos/modelo-de-datos.md).
4. **No existe el módulo de Proveedores / cuentas por pagar** (`documento_compra`) — nunca se construyó, y la Proyección de caja lo señala explícitamente como una subestimación real de los egresos futuros.
5. **Una venta solo admite un SKU** — no hay líneas de detalle para documentos de venta con varios productos.
6. **Credenciales de Postgres y Fintoc ya están en `.env`** (resuelto este capítulo), pero **SimpleAPI y Talana siguen sin integrarse de verdad**, así que esas credenciales todavía no existen en el proyecto.
7. **Dashboard ejecutivo (Pantalla 1)** nunca se construyó — ahora es, con diferencia, el candidato más fuerte para la próxima mejora: hay datos reales y calculados en casi todos los módulos (margen, deuda, proyección, bancos) esperando un resumen ejecutivo que los muestre juntos.
8. **Rutas HTML antiguas sin usar**: `server.js` todavía arrastra las rutas HTML de Fase 2/3 (`/`, `/clientes`, `/ventas`) que quedaron reemplazadas por React pero nunca se borraron — código muerto, sin urgencia pero pendiente de limpieza.

## Qué sigue

El roadmap original (Fases 0 a 5) está completo. Los siguientes pasos no vienen ya definidos en un documento — son decisiones de producto nuevas para el fundador, con estos candidatos como punto de partida natural, en orden sugerido:

1. **Autenticación y roles** — desbloquea poder mostrarle el sistema a alguien más sin exponer todo a todos.
2. **Dashboard ejecutivo** — la pantalla que más valor visual entrega con lo que ya existe.
3. **Proveedores / cuentas por pagar** — cierra el hueco más importante de la Proyección de caja.
4. Conectar SimpleAPI y Talana con credenciales reales, cuando haya un cliente/negocio real dispuesto a probarlo.

## Estado de la Fase 5

| Capítulo | Estado |
|---|---|
| Conexión real a Fintoc (sandbox) | ✅ |
| Cierre de fase | ✅ |

**Fase 5 completa. Roadmap original (Fases 0–5) completo.**
