# Roadmap

## Fase 0 — Documentación (en curso)

Visión, problema y cliente, glosario, arquitectura, modelo de datos, diseño de interfaces y decisiones técnicas — los documentos de esta carpeta `docs/`. No se escribe código de producto hasta que esta fase esté cerrada y validada por el fundador (ver [ADR-006](../01-arquitectura/decisiones-tecnicas-ADR.md)).

## Fase 1 — Instalación de herramientas

Instalar en el computador del fundador: Git, Visual Studio Code, Docker, Node.js, y crear las cuentas necesarias (GitHub como mínimo). El **manual de instalación**, escrito para alguien que nunca ha instalado herramientas de desarrollo, ya está redactado: [docs/05-manual-desarrollo/00-instalacion-de-herramientas.md](../05-manual-desarrollo/00-instalacion-de-herramientas.md). Falta que el fundador lo siga paso a paso y confirme los checkpoints.

## Fase 2 — Manual de desarrollo: primer producto funcionando

Con el entorno ya instalado, se construye el primer producto funcionando siguiendo el principio de "documentación ya definida, el código es su implementación". Se avanza en escalones pequeños, cada uno con una victoria visible, dentro del módulo elegido como punto de partida: **movimientos bancarios por centro de costo** (ver [pantalla 2 del diseño de interfaces](../03-diseno-interfaces/diseno-interfaces.md)).

1. **Fundamentos**: qué es programar en la práctica, qué es un repositorio, la terminal, y cómo se relacionan con lo ya documentado en `docs/`.
2. **Hello World**: una página que muestra un texto en el navegador — probar que el circuito completo (código → servidor → navegador) funciona.
3. **Datos de prueba**: una lista de movimientos bancarios ficticios (fecha, monto, glosa) mostrada en una tabla, usando el modelo de datos ya definido en `movimiento_bancario`.
4. **Centros de costo**: se agrega el concepto de `centro_costo` a cada movimiento y se arma el filtro/agrupador — esto ya es el corazón diferenciador del producto funcionando.
5. **Persistencia real**: los datos dejan de vivir en un archivo estático y pasan a PostgreSQL (vía Docker, [ADR-004](../01-arquitectura/decisiones-tecnicas-ADR.md)).
6. **Hábitos de equipo**: git commit/push explicados de verdad, qué es una rama, cómo se documenta lo que se hizo.
7. **Cierre de fase**: revisión de qué falta para que este módulo deje de usar datos de prueba y se conecte a Fintoc de verdad (ver [ADR-001](../01-arquitectura/decisiones-tecnicas-ADR.md)).

Al cerrar esta fase, el sistema ya resuelve, aunque sea con datos de prueba, las preguntas de negocio 1 ("¿cuánta plata ganó cada sucursal?") y 3 ("¿qué negocio genera caja?") a nivel de movimiento bancario.

## Fase 3 — V2: Clientes/CRM e Inventario por SKU

Conexión real a un proveedor de API DTE/RCV (ver [integraciones](../01-arquitectura/arquitectura-tecnica.md)), módulo de CRM completo, inventario por SKU y costeo. Habilita responder con datos reales las preguntas 2 ("¿dónde se pierde el dinero?") y 4 ("¿qué gastos puedo reducir?"), porque ya existe margen real por producto y cliente.

Capítulos planeados (a confirmar/ajustar al empezar cada uno, igual que en la Fase 2):

1. ~~**Proveedor de facturación electrónica**~~ — Hecho: se eligió **SimpleAPI** ([ADR-007](../01-arquitectura/decisiones-tecnicas-ADR.md); BaseAPI quedó descartada por cierre del servicio).
2. **Clientes**: tabla `cliente` real en Postgres, con un formulario simple para crearlos.
3. **Documentos de venta**: tabla `documento_venta`, primero con datos de prueba, después conectada al proveedor elegido.
4. ~~**Introducción a React**~~ — Hecho: API de Clientes convertida a JSON con CORS, y primera pantalla real en React (`app/frontend`) reemplazando el HTML generado por el servidor. Desde este capítulo el código lo escribe y corre el CTO directamente ([ADR-008](../01-arquitectura/decisiones-tecnicas-ADR.md)). El dashboard ejecutivo (Pantalla 1) se deja para cuando haya datos reales de venta/gasto/deuda que mostrar.
5. ~~**Inventario por SKU**~~ — Hecho: tablas `sku` y `movimientos_inventario`, stock calculado desde el historial de movimientos, costo promedio (PMP) recalculado en cada entrada. Pantalla nueva en React (`app/frontend/src/paginas/Inventario.jsx`).
6. ~~**Costeo y margen**~~ — Hecho: la venta se puede ligar a un SKU, congelando su costo promedio (PMP) al momento de la venta y calculando el margen; registrar la venta también descuenta el stock automáticamente. Pantalla `Ventas` migrada a React.
7. ~~**Cierre de fase**~~ — Hecho: ver [cierre de la Fase 3](../05-manual-desarrollo/13-cierre-de-fase.md).

## Fase 4 — V3: Remuneraciones, deuda y proyección de caja

Integración con BUK/Talana, módulo de deuda y leasing con tabla de amortización, y motor de proyección de caja a 60-90 días con alertas de necesidad de financiamiento. Cierra las preguntas 5 ("¿cuánto puedo retirar?") y 6 ("¿voy a necesitar financiamiento?").

Capítulos planeados (a confirmar/ajustar al empezar cada uno, igual que en la Fase 3):

1. ~~**Proveedor de nómina**~~ — Hecho: se eligió **Talana** ([ADR-009](../01-arquitectura/decisiones-tecnicas-ADR.md); BUK quedó como alternativa, descartada por no tener un ambiente sandbox documentado públicamente).
2. ~~**Remuneraciones**~~ — Hecho: tablas `empleados` y `liquidaciones`, pantalla en React con registro por periodo y marcado manual de pago.
3. ~~**Deuda y leasing**~~ — Hecho: tablas `deudas_leasing` y `cuotas_deuda`; al registrar una deuda se genera automáticamente la tabla de amortización completa (sistema francés, cuota fija).
4. ~~**Proyección de caja**~~ — Hecho: cruza movimientos bancarios, facturas por cobrar, cuotas de deuda y liquidaciones pendientes, con alerta si el saldo proyectado se pone negativo. Sin cuentas por pagar a proveedores todavía (módulo no construido).
5. ~~**Cierre de fase**~~ — Hecho: ver [cierre de la Fase 4](../05-manual-desarrollo/17-cierre-de-fase.md).

## Fase 5 — Conexión bancaria real (Fintoc)

Reemplazo de los datos de prueba del módulo de conciliación por la conexión real vía Fintoc ([ADR-001](../01-arquitectura/decisiones-tecnicas-ADR.md)), una vez que el resto del sistema ya está probado con datos controlados. Se deja para el final a propósito: es más fácil depurar errores de lógica de negocio con datos de prueba predecibles que con datos bancarios reales desde el día uno.

## Resumen de estado

| Fase | Contenido | Estado |
|---|---|---|
| 0 | Documentación | Cerrada |
| 1 | Instalación de herramientas | Completa (Git, GitHub, VS Code, Docker, Node verificados) |
| 2 | Primer producto funcionando (banco + centro de costo, datos de prueba) | Completa |
| 3 | CRM + Inventario por SKU | Completa |
| 4 | Remuneraciones + Deuda + Proyección de caja | Completa |
| 5 | Conexión bancaria real (Fintoc) | Próxima |
