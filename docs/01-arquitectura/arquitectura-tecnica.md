# Arquitectura técnica

*Ver también: [visión](../00-vision-y-negocio/vision.md) · [modelo de datos](../02-modelo-de-datos/modelo-de-datos.md) · [decisiones técnicas (ADRs)](./decisiones-tecnicas-ADR.md) · [roadmap](../04-roadmap/roadmap.md)*

# 1. Por qué no basta con lo que ya existe

| Sistema | Qué resuelve | Qué NO resuelve |
|---|---|---|
| Bsale / facturadores | Emite DTE, descuenta inventario por sucursal, reporta ventas | No conecta al banco, no muestra si la venta se cobró, no consolida gasto ni remuneraciones, no arma flujo de caja |
| Nubox / Defontana / ERPs contables | Contabilidad, libros SII, balances | Datos con rezago (mes vencido), poco útil para decisiones semanales, no está pensado por centro de costo operacional sino por cuenta contable |
| Chipax / Fintoc (conciliación) | Trae el movimiento bancario multibanco y lo concilia contra facturas | No tiene CRM, no tiene inventario por SKU, no conecta remuneraciones, no modela deuda/leasing, no reparte por sucursal |
| Excel del dueño | Flexible, a medida | No escala, no se actualiza solo, depende de una persona, sin trazabilidad |

La propuesta de valor no es "otro facturador" ni "otro conciliador": es la capa de **gestión integral por centro de costo** que ninguno de los anteriores cubre completa.

# 2. Visión general de la arquitectura

## 2.1 Principio de diseño: todo tiene un centro de costo

La decisión arquitectónica central del sistema es que **cada transacción — bancaria, de venta, de gasto, de remuneración o de deuda — se etiqueta con un centro de costo** (sucursal, unidad de negocio, o "overhead/casa matriz" cuando el gasto es corporativo y no asignable directamente). Esto permite que el motor de reportería arme un P&L y un flujo de caja por sucursal sin trabajo manual, y que el overhead se pueda prorratear con reglas configurables (por venta, por headcount, por m², o monto fijo).

## 2.2 Capas del sistema

1. **Capa de ingesta (conectores)**: agregador bancario multibanco, API de facturación electrónica/SII, API de BUK/Talana, carga manual/API de deuda y leasing.
2. **Capa de normalización**: cada conector entrega datos en formatos distintos; se normalizan a un modelo canónico (movimiento bancario, documento de venta, documento de compra, línea de remuneración, cuota de deuda).
3. **Capa de negocio**: motores de conciliación bancaria, CRM/ventas, gasto e inventario por SKU, remuneraciones, deuda/leasing, y el motor de asignación a centros de costo.
4. **Capa de reportería y decisión**: P&L por sucursal, flujo de caja consolidado y proyectado, capacidad de retiro, alertas de necesidad de financiamiento.
5. **Capa de presentación**: dashboard web (rol dueño, rol administración/contabilidad, rol jefe de sucursal), exportables y alertas (email/WhatsApp).

## 2.3 Diagrama lógico

```
[Bancos CL] --(agregador multibanco)--> Ingesta Bancaria ---\
[SII / Facturación electrónica] --(API DTE/RCV)--> Ventas y Compras ---\
[BUK / Talana] --(API remuneraciones)--> Nómina ------------------------> Normalización -> Motor de Centro de Costo -> Reportería (P&L, Flujo de Caja, Alertas) -> Dashboard
[Carga manual/planillas] --(deuda y leasing)--> Deuda ------------------/
[Inventario por SKU] --(compras/ventas)--> Costeo -----------------------/
```

# 3. Módulos funcionales

## 3.1 Módulo de conciliación bancaria multibanco (la "cartola" consolidada)

**Objetivo**: traer, en un solo lugar y sin digitación manual, todos los movimientos de todas las cuentas corrientes y líneas de la empresa, sin importar el banco, y conciliarlos contra ventas, compras y remuneraciones.

**Cómo se construye en Chile**: no existe un estándar de open banking obligatorio como en Europa (PSD2), por lo que la conectividad bancaria en Chile se resuelve vía agregadores privados que ya certificaron el acceso con cada banco. Los dos jugadores relevantes son:

- **Fintoc**: expone una API de conexión bancaria (Account Aggregation / Movimientos) que entrega saldos y movimientos históricos y en tiempo real de cuentas en los principales bancos chilenos (Banco Estado, BCI, BICE, Banco de Chile, Falabella, Itaú, entre otros), pensada explícitamente para alimentar módulos de conciliación de ERPs y fintechs.
- **Chipax**, como referencia de mercado, ya integra más de 40 bancos chilenos combinando conciliación automática + facturación + tesorería; confirma que el patrón (agregador + reglas de matching) es el camino validado en el mercado local, no uno experimental.

**Diseño del módulo**:

1. Conexión OAuth-like por cuenta bancaria vía el agregador (Fintoc u homólogo), con refresco periódico (polling o webhook cuando el proveedor lo soporte).
2. Cada movimiento bancario se normaliza a: fecha, monto, tipo (cargo/abono), glosa, cuenta origen, banco.
3. **Motor de matching**: reglas determinísticas primero (número de documento/folio en la glosa, monto exacto + fecha ± N días) y luego un clasificador de reglas configurables/ML liviano para la "cola larga" de movimientos sin folio (transferencias, comisiones, pagos de nómina, servicios).
4. Todo movimiento concilia contra: una venta (cobro de factura/boleta), una compra (pago a proveedor), una remuneración (pago de sueldos/Previred), una cuota de deuda/leasing, o queda clasificado como gasto operacional directo por centro de costo.
5. Lo que no concilia automáticamente entra a una bandeja de "conciliación manual asistida" para que contabilidad lo cierre con dos clics.

**Resultado**: una "cartola consolidada" real-time, no una carga de cartola en Excel a fin de mes. Este es el módulo elegido como primer producto funcionando — ver [roadmap](../04-roadmap/roadmap.md).

## 3.2 Módulo de clientes — Ventas y CRM

- **Ingesta de ventas**: vía integración con el emisor de DTE (boletas y facturas electrónicas). En Chile este dato no nace en un ERP propio sino que debe timbrarse ante el SII; existen múltiples proveedores de API DTE (BaseAPI, SimpleAPI, Factronica, Tupana, entre otros) que permiten emitir y también leer el Registro de Compras y Ventas (RCV) directamente desde el SII, lo que sirve como fuente de verdad y como respaldo si la empresa ya emite en otro sistema.
- **CRM**: pipeline comercial (prospecto → cotización → venta), historial de compra por cliente, cliente por sucursal/vendedor, y — clave para la pregunta "qué negocio genera caja" — **días promedio de cobro real por cliente**, cruzando la fecha de la factura con la fecha en que efectivamente se concilió el pago bancario (no la fecha contable).
- **Métricas por sucursal**: ticket promedio, mix de productos, margen bruto por venta (cruzando con costo del SKU vendido), recaudación efectiva vs. facturado.

## 3.3 Módulo de proveedores — Gasto e Inventario por SKU

- **Gasto**: ingesta de facturas de compra (misma vía DTE/RCV), categorización de gasto (arriendo, insumos, servicios, marketing, etc.), asignación a centro de costo, y estado de pago (cruzado contra el módulo bancario: ¿ya se pagó? ¿está vencido?).
- **Inventario por SKU**: kardex por SKU y por sucursal (costeo PMP o FIFO configurable), entradas por orden de compra, salidas por venta, mermas y traspasos entre sucursales. El costo de venta por SKU alimenta directamente el margen bruto del módulo de CRM.
- Esto es exactamente lo que Bsale hace bien (venta e inventario por sucursal) y lo que este producto absorbe como capacidad base, pero conectándolo a gasto y recaudación real, que es lo que Bsale no cubre.

## 3.4 Módulo de remuneraciones (BUK / Talana)

- Ambas plataformas (BUK y Talana) exponen **API REST propia** para integraciones externas:
  - **BUK**: se genera un API Key desde Configuración → Acceso API, con permisos explícitos para exponer o no datos sensibles (sueldos). Permite exportar, inyectar y actualizar información de remuneraciones.
  - **Talana**: expone una API de integración documentada en developers.talana.com, con módulos de Gestión de Personas, Remuneraciones, Asistencia/Turnos y Firma Digital, ya usada por integraciones existentes con ERPs contables (Laudus, SAP) y sistemas de gasto (Rindegastos).
- El conector trae, por periodo y por empleado: sueldo líquido, imponible, cotizaciones (AFP/Previred/isapre), y **centro de costo del empleado**, para que la remuneración se impute a la sucursal correcta y no como un solo bloque "gasto de personal" a nivel empresa.
- El pago real de la nómina se concilia contra el módulo bancario para confirmar que el líquido pagado coincide con lo liquidado y detectar diferencias.

## 3.5 Módulo de deudas bancarias y leasing

- Registro de cada instrumento de deuda (crédito comercial, línea de crédito, leasing financiero/operativo, factoring): monto original, tasa, plazo, cuotas, banco/leasing acreedor, y **centro de costo o activo asociado** (ej. leasing de un vehículo o maquinaria de una sucursal específica).
- Tabla de amortización proyectada (capital + interés) por cuota, para alimentar el flujo de caja futuro.
- Conciliación de cada cuota pagada contra el movimiento bancario real.
- Alertas de vencimiento próximo y de covenants simples (ej. relación deuda/EBITDA si el usuario lo configura).
- Esta es la pieza que permite responder "¿voy a necesitar financiamiento en 60 días?": el sistema no solo mira el pasado (cartola), sino que proyecta 60-90 días combinando cuentas por cobrar esperadas, cuentas por pagar comprometidas y cuotas de deuda ya pactadas.

## 3.6 Centros de costo, sucursales y overhead

- Estructura jerárquica configurable: Empresa → Unidad de negocio → Sucursal, con un nodo especial "Overhead / Casa matriz" para gastos corporativos no asignables 1:1.
- Reglas de prorrateo de overhead configurables por el usuario: % de ventas, headcount, m² de sucursal, o monto fijo mensual — de forma que el dueño pueda ver el P&L de cada sucursal "cargado" con su parte justa de gastos centrales, o "sin cargar" para comparar operación pura.
- Todas las transacciones (banco, venta, compra, remuneración, deuda) llevan el campo `centro_costo_id` desde el momento en que se normalizan, no como un cálculo posterior.

# 4. Stack tecnológico recomendado

| Capa | Recomendación | Justificación |
|---|---|---|
| Backend | Node.js (NestJS) o Python (FastAPI/Django) | Ecosistema maduro para integraciones REST/webhooks, buena disponibilidad de desarrolladores en Chile |
| Base de datos transaccional | PostgreSQL | Modelo relacional natural para el esquema de datos, soporte robusto de particiones por empresa (multi-tenant) |
| Motor de reportería | Modelo dimensional (star schema) sobre el mismo Postgres o un warehouse liviano (DuckDB/ClickHouse) si el volumen crece | Los reportes por centro de costo son consultas analíticas repetidas; conviene separarlas de la carga transaccional |
| Colas / jobs | Redis + BullMQ (o Celery en Python) | Los conectores (banco, SII, BUK/Talana) son procesos asíncronos con reintentos y rate limits |
| Frontend | React + TypeScript | Dashboard interactivo, gráficos de flujo de caja y P&L por sucursal |
| Autenticación | Multi-tenant con roles (dueño, contabilidad, jefe de sucursal) | Cada rol ve un recorte distinto de la información (ej. jefe de sucursal no ve remuneraciones de otras sucursales) |
| Entorno de desarrollo | Local, con Docker para levantar Postgres/Redis (ver [ADR-004](./decisiones-tecnicas-ADR.md)) | Reproducibilidad del entorno sin depender de instalaciones nativas de base de datos |
| Hosting (producción, a definir) | Cloud con presencia/latencia razonable a Chile (AWS sa-east-1 São Paulo o GCP southamerica-west1 Santiago) | Cumplimiento y latencia de integraciones locales |

Justificación detallada de cada elección en [decisiones-tecnicas-ADR.md](./decisiones-tecnicas-ADR.md).

# 5. Integraciones externas — resumen técnico

| Integración | Proveedor(es) | Qué entrega | Notas de implementación |
|---|---|---|---|
| Conexión bancaria multibanco | Fintoc (principal); alternativa de referencia: modelo Chipax | Saldos y movimientos por cuenta, multi-banco | Requiere autorización del cliente final por cuenta bancaria; refresco periódico + webhooks cuando estén disponibles |
| Facturación electrónica / RCV | BaseAPI, SimpleAPI, Factronica, Tupana (u otro proveedor de API DTE del SII) | Emisión y lectura de boletas/facturas, Registro de Compras y Ventas | Puede usarse solo como fuente de lectura (RCV) si la empresa ya emite en otro sistema, o como emisor si se integra completo |
| Remuneraciones | BUK (API Key vía Configuración → Acceso API) y Talana (developers.talana.com) | Liquidaciones por periodo, empleado y centro de costo | Definir en el token si se autoriza lectura de datos sensibles (sueldo); sincronización por periodo cerrado |
| Deuda y leasing | Carga manual / planilla inicial; API bancaria del mismo agregador para saldos de línea de crédito si el banco la expone | Saldo y tabla de amortización | Partir con carga manual es razonable para MVP; automatizar según lo que exponga cada banco |

# 6. Motor de reportería: cómo se responden las 6 preguntas de negocio

1. **¿Cuánta plata ganó realmente cada sucursal?** → P&L por centro de costo cruzando venta (facturado y cobrado), costo de venta por SKU, gasto directo y overhead prorrateado.
2. **¿Dónde se está perdiendo el dinero?** → Comparación de margen por sucursal/SKU/cliente y detección de gasto que crece más rápido que la venta en el mismo centro de costo.
3. **¿Qué negocio genera caja?** → Flujo de caja real (no devengado) por centro de costo, usando movimiento bancario conciliado, no la fecha de la factura.
4. **¿Qué gastos puedo reducir?** → Ranking de categorías de gasto por centro de costo, con comparación mes contra mes y contra el promedio de otras sucursales.
5. **¿Cuánto puedo retirar este mes?** → Caja disponible menos compromisos ya conciliados/proyectados a 30 días (proveedores por vencer, nómina del periodo, cuotas de deuda), no solo el saldo bancario del día.
6. **¿Voy a necesitar financiamiento en 60 días?** → Proyección de flujo de caja a 60-90 días combinando cuentas por cobrar esperadas (con probabilidad de cobro según historial del cliente), cuentas por pagar comprometidas y calendario de cuotas de deuda/leasing ya pactado.

# 7. Seguridad y cumplimiento

- Datos financieros y de remuneraciones son especialmente sensibles: cifrado en tránsito y en reposo, control de acceso por rol y por centro de costo.
- Tokens de conexión bancaria y de BUK/Talana almacenados en un vault de secretos, nunca en la base de datos de aplicación en texto plano.
- Registro de auditoría de quién vio o exportó datos de sueldos.
- Cumplimiento con la Ley 19.628 (protección de datos personales) y buenas prácticas frente a la futura ley de protección de datos actualizada.
