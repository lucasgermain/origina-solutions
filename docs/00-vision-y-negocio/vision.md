# Visión del producto

## Nombre de trabajo

**Centro de Control PYME**

## Declaración de visión

Ser la capa de control financiero y operacional que todo dueño de PYME con más de una sucursal necesita para saber, en cualquier momento y sin pedirle un reporte a nadie, cuánta plata gana realmente cada parte de su negocio, cuánta puede retirar y si va a necesitar financiamiento.

## El problema

Un dueño de PYME chilena con 2 o más sucursales hoy arma su visión del negocio juntando pedazos sueltos: lo que factura el sistema de venta, lo que dice la cartola del banco, un Excel de gastos, otro de sueldos, y un tercero de las deudas y leasings. Nada de eso está cruzado por sucursal. El resultado es que preguntas básicas — ¿cuánta plata ganó realmente cada sucursal?, ¿dónde se está perdiendo el dinero?, ¿cuánto puedo retirar este mes?, ¿voy a necesitar financiamiento en 60 días? — no se pueden responder con datos, se responden a ojo.

Los sistemas que existen hoy resuelven pedazos:

- Los facturadores (Bsale y similares) emiten boletas/facturas y descuentan inventario por sucursal, pero no saben si esa venta se cobró de verdad ni cruzan eso con gasto o remuneraciones.
- Los ERPs contables (Nubox, Defontana) entregan contabilidad y libros SII, con rezago de un mes, poco útiles para decidir esta semana.
- Las fintech de conciliación (Chipax, Fintoc) traen el movimiento bancario multibanco, pero no lo parten por sucursal ni lo conectan con inventario, remuneraciones o deuda.

Ninguno junta las cuatro dimensiones que importan — banco, operación (venta/gasto/inventario), gente (remuneraciones) y deuda — partidas por centro de costo.

## Propuesta de valor

Centro de Control PYME conecta los bancos (multibanco), el sistema de remuneraciones (BUK/Talana) y la operación de venta, gasto e inventario de la empresa, y reparte cada transacción por centro de costo (sucursal, unidad de negocio u overhead), para entregar en un solo lugar:

1. Cuánta plata ganó realmente cada sucursal (P&L real, no solo facturado).
2. Dónde se está perdiendo el dinero (margen y gasto comparado entre sucursales).
3. Qué negocio genera caja (flujo de caja real, no devengado).
4. Qué gastos se pueden reducir (ranking de gasto por categoría y centro de costo).
5. Cuánto se puede retirar este mes (caja disponible menos compromisos ya conocidos).
6. Si se va a necesitar financiamiento en 60 días (proyección de flujo de caja).

## Para quién es (resumen)

Dueños de PYME chilena con más de una sucursal o unidad de negocio, que ya tienen algo de venta formalizada (facturación electrónica) y personal contratado, y que hoy arman su visión del negocio a mano en Excel. El detalle del perfil de cliente está en [`problema-y-cliente.md`](./problema-y-cliente.md).

## Qué NO es este producto (por ahora)

- No es un facturador electrónico de reemplazo — se apoya en proveedores de API DTE existentes o en lo que la empresa ya use.
- No es un ERP contable completo (libros, balances, impuestos) — complementa a la contabilidad, no la reemplaza.
- No ejecuta pagos ni transferencias — es una capa de visibilidad y decisión, no de movimiento de dinero.

## Cómo se construye este documento

Este proyecto se está desarrollando siguiendo una metodología de **documentación antes que código**: primero se fija la visión, el problema, la arquitectura, el modelo de datos y el diseño de interfaces; recién cuando ese diseño está validado se pasa a construir el sistema, que es la implementación de lo documentado acá. Ver [`README.md`](../../README.md) para el índice completo.
