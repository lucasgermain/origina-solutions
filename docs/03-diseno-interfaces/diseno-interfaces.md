# Diseño de interfaces

Estos son wireframes de contenido (qué información y qué acciones tiene cada pantalla), no diseño visual final. El objetivo es fijar qué debe mostrar cada pantalla antes de programarla, no cómo se ve exactamente en píxeles — eso se puede refinar cuando ya haya una versión funcionando.

## Elemento transversal: selector de centro de costo

Aparece en la barra superior de **todas** las pantallas, porque el principio de arquitectura es que todo se puede mirar por centro de costo (ver [arquitectura](../01-arquitectura/arquitectura-tecnica.md)).

```
┌──────────────────────────────────────────────────────────┐
│  Centro de Control PYME     [Centro de costo: TODOS ▾]    │
└──────────────────────────────────────────────────────────┘
```

Opciones del selector: "Todos" (consolidado empresa), cada sucursal individual, y "Overhead" para ver el gasto corporativo aislado.

---

## Pantalla 1 — Dashboard principal (visión ejecutiva)

Responde de un vistazo las 6 preguntas de negocio (ver [visión](../00-vision-y-negocio/vision.md)).

```
┌──────────────────────────────────────────────────────────┐
│ Centro de costo: TODOS ▾              Julio 2026 ▾        │
├──────────────────────────────────────────────────────────┤
│  CAJA DISPONIBLE HOY          CAPACIDAD DE RETIRO ESTE MES│
│  $ 12.400.000                 $ 3.100.000                 │
├──────────────────────────────────────────────────────────┤
│  P&L POR SUCURSAL (mes actual)                            │
│  ┌───────────────┬─────────┬─────────┬──────────┐         │
│  │ Sucursal       │ Venta   │ Margen  │ Resultado│         │
│  ├───────────────┼─────────┼─────────┼──────────┤         │
│  │ Providencia    │ 8.200k  │ 3.100k  │  +900k   │         │
│  │ Ñuñoa          │ 5.400k  │ 1.900k  │  -200k   │  ⚠      │
│  │ Overhead       │    —    │    —    │  -600k   │         │
│  └───────────────┴─────────┴─────────┴──────────┘         │
├──────────────────────────────────────────────────────────┤
│  PROYECCIÓN DE CAJA (60 días)        [gráfico de línea]    │
│  ⚠ Alerta: caja proyectada negativa el 14 de septiembre    │
└──────────────────────────────────────────────────────────┘
```

Componentes: tarjetas de caja/retiro, tabla de P&L por centro de costo (con alerta visual en sucursales con resultado negativo), gráfico de proyección de caja con alertas de financiamiento.

---

## Pantalla 2 — Conciliación bancaria (cartola consolidada) — **primer producto funcionando**

```
┌──────────────────────────────────────────────────────────┐
│ Centro de costo: TODOS ▾     Cuenta: Todas las cuentas ▾  │
├──────────────────────────────────────────────────────────┤
│ Fecha    │ Banco      │ Glosa            │ Monto  │ Estado│
├──────────┼────────────┼──────────────────┼────────┼───────┤
│ 20-jul   │ BCI        │ Transf. Cliente X│ +450k  │  ✅   │
│ 19-jul   │ B.Chile    │ Pago Proveedor Y │ -180k  │  ✅   │
│ 18-jul   │ BCI        │ TEF 88213        │ -75k   │  ❓    │
│ 17-jul   │ Estado     │ Comisión mant.   │  -8k   │  ✅   │
└──────────────────────────────────────────────────────────┘
  ✅ = conciliado autom.   ❓ = pendiente de conciliar manualmente
```

Al hacer clic en una fila "❓", se abre un panel para asignarla manualmente a un centro de costo y a un tipo (venta, compra, remuneración, deuda o gasto directo). Esta es la pantalla del **módulo elegido como primer producto funcionando** (ver [roadmap](../04-roadmap/roadmap.md)): en la primera versión, los movimientos se cargan de prueba (no conectados a Fintoc todavía) para validar la lógica de centro de costo antes de conectar el banco real.

---

## Pantalla 3 — Clientes / CRM (Fase 2)

```
┌──────────────────────────────────────────────────────────┐
│ Centro de costo: Providencia ▾                            │
├──────────────────────────────────────────────────────────┤
│ Cliente        │ Últ. compra │ Días prom. cobro │ Estado  │
├────────────────┼─────────────┼──────────────────┼─────────┤
│ Comercial ABC   │ 15-jul      │ 12 días          │ Al día  │
│ Distribuidora Z │ 02-jul      │ 45 días          │ ⚠ Lento │
└──────────────────────────────────────────────────────────┘
```

Ficha de cliente (al hacer clic): historial de documentos de venta, margen generado, y si el cobro fue puntual o atrasado respecto de la fecha de conciliación bancaria real.

---

## Pantalla 4 — Proveedores / Gasto e Inventario (Fase 2)

Dos pestañas dentro de la misma sección:

**Gasto**: tabla de facturas de compra por proveedor, categoría y estado de pago, igual estructura que la pantalla de clientes pero en la dirección contraria.

**Inventario (kardex)**:
```
┌──────────────────────────────────────────────────────────┐
│ SKU: CAM-001 — Camiseta algodón   Centro de costo: Ñuñoa  │
├──────────────────────────────────────────────────────────┤
│ Fecha   │ Tipo     │ Cantidad │ Saldo  │ Costo unitario   │
│ 10-jul  │ Entrada  │  +50     │  120   │ $4.200            │
│ 15-jul  │ Salida   │  -8      │  112   │ $4.200 (PMP)      │
└──────────────────────────────────────────────────────────┘
```

---

## Pantalla 5 — Remuneraciones (Fase 3)

```
┌──────────────────────────────────────────────────────────┐
│ Periodo: Julio 2026 ▾        Centro de costo: TODOS ▾     │
├──────────────────────────────────────────────────────────┤
│ Empleado       │ Sucursal    │ Líquido  │ Estado de pago  │
│ Juan Pérez     │ Providencia │ $850.000 │ ✅ Pagado        │
│ María Soto     │ Ñuñoa       │ $780.000 │ ⚠ Pendiente      │
└──────────────────────────────────────────────────────────┘
```

Datos vienen de BUK/Talana (ver [ADR](../01-arquitectura/decisiones-tecnicas-ADR.md) e [integraciones](../01-arquitectura/arquitectura-tecnica.md)); el estado de pago se marca automáticamente al conciliar con el banco.

---

## Pantalla 6 — Deudas y leasing (Fase 3)

```
┌──────────────────────────────────────────────────────────┐
│ Deuda/Leasing        │ Acreedor  │ Saldo    │ Próx. cuota │
├───────────────────────┼───────────┼──────────┼─────────────┤
│ Leasing camioneta      │ Banco BCI │ $4.200k  │ 05-ago      │
│ Línea de crédito       │ Bco Estado│ $8.000k  │ —           │
└──────────────────────────────────────────────────────────┘
```

Al hacer clic en un instrumento: tabla de amortización completa (capital/interés por cuota) y estado de conciliación de cada cuota pagada.

## Roles y qué ve cada uno

| Rol | Qué ve |
|---|---|
| Dueño/fundador | Todas las pantallas, todos los centros de costo |
| Administración/contabilidad | Todas las pantallas, todos los centros de costo, con permiso de conciliar manualmente |
| Jefe de sucursal | Dashboard y conciliación bancaria filtrados solo a su propia sucursal; sin acceso a remuneraciones de otras sucursales |
