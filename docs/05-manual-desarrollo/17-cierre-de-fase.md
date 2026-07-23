# Cierre de la Fase 4

*Revisión de qué se construyó, qué falta antes de la Fase 5, y qué sigue.*

## Qué existe hoy

La aplicación en React (`app/frontend`) pasó de 3 a **6 pantallas**: Clientes, Ventas, Inventario, Remuneraciones, Deuda y Proyección de caja. El backend (`app/backend`) expone todas estas entidades en JSON, y la última pantalla no crea datos — solo **cruza** los que ya existen en las demás para responder una pregunta que ningún módulo por separado podía responder.

Con datos de prueba, la Fase 4 cierra las dos preguntas de negocio que le tocaban, de la [visión](../00-vision-y-negocio/vision.md):

- **Pregunta 5 — "¿cuánto puedo retirar?"**: todavía no hay un cálculo explícito de capacidad de retiro, pero ahora existe la información de base (saldo bancario, deuda vigente, sueldos comprometidos) para construirlo.
- **Pregunta 6 — "¿voy a necesitar financiamiento?"**: respondida directamente por la Proyección de caja, que avisa la fecha exacta en que el saldo se pondría negativo si nada cambia.

Se eligió **Talana** ([ADR-009](../01-arquitectura/decisiones-tecnicas-ADR.md)) como proveedor de nómina, aunque —igual que con SimpleAPI en la Fase 3— todavía no está conectado de verdad.

## Qué falta antes de la Fase 5

1. **Conectar Talana de verdad**: empleados y liquidaciones siguen siendo datos de prueba cargados a mano.
2. **Falta el módulo de Proveedores / cuentas por pagar** (`documento_compra` del [modelo de datos](../02-modelo-de-datos/modelo-de-datos.md)): nunca se construyó, ni en la Fase 3 ni en esta. La Proyección de caja lo señala explícitamente como una subestimación real de los egresos futuros — es probablemente el hueco más importante que queda antes de que la proyección sea confiable con datos reales.
3. **Los supuestos de la proyección son fijos**: facturas a 30 días, sueldos a fin de mes — no configurables todavía por el usuario.
4. **`centro_costo` sigue siendo texto libre**, no la entidad propia con jerarquía del modelo de datos — pendiente arrastrado desde el cierre de la Fase 2.
5. **Credenciales de Postgres hardcodeadas** en `server.js` — mismo pendiente de seguridad arrastrado desde la Fase 2.
6. **Sin autenticación ni roles**: con remuneraciones ya en el sistema, este pendiente (señalado desde el cierre de la Fase 3) se vuelve más urgente — hoy cualquiera que abra la app ve sueldos de todos los empleados.
7. **Dashboard ejecutivo (Pantalla 1)** sigue sin construirse, pero ahora hay bastante más información real (margen de ventas, deuda, remuneraciones, proyección) para que valga la pena — es un candidato fuerte para la próxima mejora, más allá del roadmap original.

## Qué sigue (Fase 5 del roadmap)

Conexión bancaria real vía Fintoc ([ADR-001](../01-arquitectura/decisiones-tecnicas-ADR.md)), reemplazando los datos de prueba del módulo de movimientos bancarios — la última pieza de datos de prueba que queda por reemplazar en el sistema.

## Estado de la Fase 4

| Capítulo | Estado |
|---|---|
| Proveedor de nómina (Talana) | ✅ |
| Remuneraciones | ✅ |
| Deuda y leasing | ✅ |
| Proyección de caja | ✅ |
| Cierre de fase | ✅ |

**Fase 4 completa.**
