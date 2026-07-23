# Proyección de caja

*Fase 4, capítulo 4. El motor que cruza todos los módulos construidos hasta ahora en una sola respuesta: "¿me va a alcanzar la plata?"*

## Qué se construyó

**Backend** (`app/backend/server.js`, función `calcularProyeccionCaja`):

Cruza cuatro fuentes distintas para proyectar el saldo bancario día a día, dentro de un horizonte (60 o 90 días):

1. **Saldo actual**: suma de todos los `movimientos_bancarios` (los montos ya vienen con signo: positivo si es abono, negativo si es cargo).
2. **Facturas por cobrar**: documentos de venta tipo `factura`, asumiendo que se cobran a 30 días de emitidas (las boletas se tratan como cobradas al contado, no entran a la proyección).
3. **Cuotas de deuda pendientes**: de la tabla de amortización construida en el capítulo anterior, las que caen dentro del horizonte.
4. **Liquidaciones pendientes**: asumiendo que el sueldo se paga el último día del mes del periodo liquidado.

Con esos eventos ordenados por fecha, se recorre uno por uno sumando o restando al saldo, y se guarda el **saldo proyectado después de cada evento**. Si en algún punto ese saldo se pone negativo, se marca una alerta con la fecha exacta — la respuesta a la pregunta de negocio "¿voy a necesitar financiamiento?".

`GET /api/proyeccion-caja?dias=90` devuelve el saldo actual, la lista de eventos con su saldo proyectado, y la alerta (o `null` si no hay riesgo en el horizonte).

**Frontend**: nueva pantalla `src/paginas/ProyeccionCaja.jsx`. Selector de horizonte (60/90 días), aviso de alerta bien visible si corresponde, y una tabla con cada evento futuro y el saldo que quedaría después de él (las filas que caen en saldo negativo se pintan en rojo).

## Conceptos nuevos usados

| Concepto | Qué es |
|---|---|
| Proyección vs. contabilidad | Este módulo no registra nada nuevo — **lee** datos que ya existen en otras tablas (ventas, cuotas, liquidaciones) y los reorganiza en una línea de tiempo futura. Es la primera pantalla del sistema que es puramente de lectura/cálculo, sin formulario para crear datos |
| Saldo acumulado (running balance) | En vez de calcular cada evento por separado, se recorre la lista ordenada por fecha llevando una variable `saldo` que se actualiza en cada paso — el mismo patrón que una cartola bancaria real |
| Supuestos de negocio explícitos en el código | A falta de un módulo de cuentas por pagar a proveedores (que no se construyó en la Fase 3) y de fechas de vencimiento reales en las ventas, se usaron reglas simples y declaradas (factura a 30 días, sueldo a fin de mes) — quedan documentadas acá y comentadas en el código para que sea fácil ajustarlas cuando haya datos reales |

## Alcance de este capítulo

- **No incluye cuentas por pagar a proveedores**: el [modelo de datos](../02-modelo-de-datos/modelo-de-datos.md) contempla un `documento_compra`, pero ese módulo nunca se construyó (la Fase 3 se enfocó en Clientes/Ventas/Inventario, no en Proveedores). Por ahora la proyección solo ve gastos de deuda y remuneraciones, no compras a proveedores — es una subestimación real de los egresos futuros, importante tenerlo presente.
- El plazo de cobro de facturas (30 días) y la fecha de pago de sueldos (fin de mes) son **supuestos fijos**, no configurables todavía.
- No hay gráfico, solo tabla — un gráfico de línea es una mejora natural más adelante si hace falta.

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

`http://localhost:5173` — botón "Proyección de caja".

---

**Checkpoint de este capítulo**: pendiente de confirmación del fundador — ver la proyección con los datos de prueba ya cargados (deuda, liquidaciones, ventas) y confirmar que la tabla y la alerta (si aparece) tienen sentido.
