# Glosario y lenguaje de negocio (ubiquitous language)

Este glosario existe para que negocio (Product Owner) y desarrollo (CTO/implementación) usen exactamente las mismas palabras para las mismas cosas. Todo nombre de tabla, campo o pantalla del sistema debería poder rastrearse a un término de esta lista. Si en algún momento el código usa un nombre distinto al de acá, el glosario manda y el código se corrige — no al revés.

| Término | Definición en el negocio | Dónde vive en el sistema |
|---|---|---|
| **Centro de costo** | Unidad contra la que se mide resultado: una sucursal, una unidad de negocio, o el "overhead" (gasto corporativo no asignable a una sucursal específica) | Entidad `centro_costo`, presente en casi toda transacción |
| **Sucursal** | Tipo de centro de costo que representa un punto físico de operación | Subtipo de `centro_costo` |
| **Overhead** | Gasto corporativo (administración central, gerencia, sistemas) que no pertenece a una sola sucursal y se reparte con una regla de prorrateo | Subtipo especial de `centro_costo` |
| **Regla de prorrateo** | Método para repartir el overhead entre sucursales: por % de venta, por headcount, por m², o monto fijo | Configuración asociada a `centro_costo` tipo overhead |
| **Cartola** | Extracto de movimientos de una cuenta bancaria en un periodo | Vista derivada de `movimiento_bancario` |
| **Cartola consolidada** | Cartola de todas las cuentas y bancos de la empresa, unificada en una sola vista | Vista agregada del módulo bancario |
| **Movimiento bancario** | Cada cargo o abono individual en una cuenta bancaria | Entidad `movimiento_bancario` |
| **Conciliación bancaria** | Proceso de hacer calzar cada movimiento bancario con el documento de negocio que lo explica (una venta cobrada, una compra pagada, una remuneración pagada, una cuota de deuda) | Proceso sobre `movimiento_bancario` → estado `estado_conciliacion` |
| **DTE (Documento Tributario Electrónico)** | Nombre genérico del SII para boletas, facturas, notas de crédito/débito electrónicas | Fuente de `documento_venta` / `documento_compra` |
| **RCV (Registro de Compras y Ventas)** | Reporte del SII con todas las compras y ventas declaradas de un contribuyente | Fuente de datos para ventas y compras |
| **SKU (Stock Keeping Unit)** | Código único de un producto o variante que se vende o compra | Entidad `sku` |
| **Kardex** | Historial de entradas, salidas y saldo de un SKU en una sucursal | Vista derivada de `movimiento_inventario` |
| **Costo promedio (PMP)** | Método de costeo de inventario donde el costo de un SKU es el promedio ponderado de sus compras | Campo `costo_promedio` en `sku` |
| **Margen bruto** | Venta menos costo de venta (el costo del SKU vendido) | Cálculo derivado, por venta / SKU / sucursal |
| **Liquidación de sueldo** | Detalle de lo pagado a un trabajador en un periodo: líquido, imponible, cotizaciones | Entidad `liquidacion`, viene de BUK/Talana |
| **Leasing** | Contrato de arriendo con opción de compra de un bien (vehículo, maquinaria, local), tratado como deuda para efectos de flujo de caja | Entidad `deuda_leasing` |
| **Cuota** | Pago periódico de una deuda o leasing, compuesto de capital e interés | Entidad `cuota_deuda` |
| **Flujo de caja real** | Movimiento efectivo de dinero (según banco conciliado), a diferencia del devengado contable | Reportería, no una entidad propia |
| **P&L (Estado de resultados) por centro de costo** | Venta menos costo de venta menos gasto directo menos overhead asignado, calculado para cada centro de costo | Reporte del motor de reportería |
| **Capacidad de retiro** | Caja disponible menos compromisos ya conciliados o proyectados a 30 días (proveedores, nómina, cuotas de deuda) | Reporte del motor de reportería |
| **Proyección de caja 60/90 días** | Estimación de caja futura combinando cuentas por cobrar esperadas, cuentas por pagar comprometidas y calendario de deuda | Reporte del motor de reportería |

## Convenciones de nombres

- Los nombres de entidades en el modelo de datos van en **español, en minúscula y singular** (`cliente`, no `Clients`), salvo que el código termine adoptando convención en inglés por el framework elegido — en ese caso se documenta el mapeo en [`02-modelo-de-datos/modelo-de-datos.md`](../02-modelo-de-datos/modelo-de-datos.md).
- "Sucursal" y "centro de costo" no son sinónimos: toda sucursal es un centro de costo, pero no todo centro de costo es una sucursal (el overhead no lo es).
- "Facturado" y "cobrado" no son lo mismo: facturado es lo que dice el DTE, cobrado es lo que confirma la conciliación bancaria. El sistema siempre debe distinguir ambos.
