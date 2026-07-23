# Cierre de la Fase 2

*Revisión de qué se construyó, qué falta antes de conectar el banco real, y qué sigue.*

## Qué existe hoy

Un servidor Node (`app/hello-world/server.js`) que:

- Se conecta a PostgreSQL (corriendo en Docker vía `docker-compose.yml`).
- Guarda y lee movimientos bancarios de una tabla real (`movimientos_bancarios`), no de un arreglo en memoria.
- Muestra esos movimientos en una tabla HTML, con un selector que filtra por centro de costo directamente en la consulta SQL.
- Todo el código y la documentación de cada paso está en Git, subido a GitHub.

Esto cumple, con datos de prueba, la primera versión de la [Pantalla 2 — Conciliación bancaria](../03-diseno-interfaces/diseno-interfaces.md) y prueba el principio central de la [arquitectura](../01-arquitectura/arquitectura-tecnica.md): todo transacción lleva su centro de costo.

## Qué falta antes de conectar Fintoc de verdad ([ADR-001](../01-arquitectura/decisiones-tecnicas-ADR.md))

1. **Reemplazar los datos sembrados a mano** por una llamada real a la API de Fintoc, que trae movimientos de cuentas bancarias reales.
2. **Manejo de credenciales**: hoy el usuario/contraseña de Postgres están escritos directo en `server.js` — antes de tocar datos bancarios reales, esto debe moverse a variables de entorno (no comprometido a Git), y las credenciales de Fintoc van a necesitar el mismo tratamiento, más estricto.
3. **El campo `centro_costo` hoy es un texto libre** ("Providencia", "Ñuñoa"); en el [modelo de datos](../02-modelo-de-datos/modelo-de-datos.md) es una entidad propia (`centro_costo`) con jerarquía y reglas de prorrateo — falta esa tabla y su relación real.
4. **La conciliación** (hacer calzar un movimiento bancario con una venta/compra/remuneración/deuda) todavía no existe — hoy solo se muestran movimientos, no se concilian contra nada.

Esto es intencional: según el [roadmap](../04-roadmap/roadmap.md), la conexión bancaria real queda para el final (Fase 5), después de construir el resto del sistema con datos controlados.

## Qué sigue (Fase 3 del roadmap)

Módulo de Clientes/CRM e Inventario por SKU, conectado a un proveedor real de facturación electrónica (API DTE/RCV). Esto habilita medir margen real por producto y cliente — las preguntas de negocio 2 y 4 de la [visión](../00-vision-y-negocio/vision.md).

## Estado de la Fase 2

| Capítulo | Estado |
|---|---|
| Fundamentos | ✅ |
| Hello World | ✅ |
| Datos de prueba | ✅ |
| Centros de costo | ✅ |
| Persistencia real (PostgreSQL) | ✅ |
| Hábitos de equipo (ramas) | ✅ |
| Cierre de fase | ✅ |

**Fase 2 completa.**
