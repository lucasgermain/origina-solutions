# Inventario por SKU

*Fase 3, capítulo 5. Kardex básico: stock y costo promedio por SKU.*

## Qué se construyó

**Backend** (`app/backend/server.js`):

- Tabla `sku` (código, descripción, costo promedio).
- Tabla `movimientos_inventario` (SKU, centro de costo, tipo de movimiento, cantidad, costo unitario cuando aplica, fecha).
- `GET /api/skus`: lista los SKU con su **stock actual**, calculado sumando entradas y restando salidas/mermas de `movimientos_inventario` (no se guarda un campo "stock" aparte — se calcula siempre desde el historial de movimientos, para que nunca quede desincronizado).
- `POST /api/skus`: crea un SKU nuevo (arranca con costo promedio 0, sin stock).
- `POST /api/movimientos-inventario`: registra un movimiento y, si es una **entrada**, recalcula el costo promedio del SKU.

**Frontend** (`app/frontend`):

- El proyecto se separó en pantallas: `src/paginas/Clientes.jsx` (el código que antes vivía en `App.jsx`) y `src/paginas/Inventario.jsx` (pantalla nueva). `App.jsx` ahora es solo un cascarón con una barra de navegación que cambia entre pantallas.
- La pantalla de Inventario tiene dos formularios (crear SKU, registrar movimiento) y una tabla con el stock y costo promedio de cada SKU, que se refresca sola después de cada acción.

## Conceptos nuevos usados

| Concepto | Qué es |
|---|---|
| Kardex | Registro cronológico de movimientos de un producto (entradas, salidas, mermas) del cual se puede derivar el stock en cualquier momento — es lo que implementan `movimientos_inventario` + el cálculo de stock |
| PMP (Precio Medio Ponderado) | Método de costeo: cuando entra stock nuevo a un precio distinto del que ya había, el costo promedio se recalcula ponderando por cantidad. Fórmula usada en `registrarMovimientoInventario`: `(stock_anterior × costo_anterior + cantidad_entrada × costo_entrada) / stock_nuevo` |
| Stock calculado vs. stock guardado | Se decidió **no** guardar un campo `stock` que se actualiza a mano en cada movimiento (fuente de bugs si algo falla a mitad de camino), sino calcularlo siempre sumando el historial completo — más simple de razonar, aunque más lento a gran escala (no es un problema al tamaño de este proyecto) |
| Componentes por pantalla | Con dos pantallas ya (`Clientes`, `Inventario`), tenerlas todas en `App.jsx` se vuelve difícil de leer. Se separó cada una en su propio archivo dentro de `src/paginas/`, y `App.jsx` pasó a encargarse solo de decidir cuál mostrar |

## Alcance de este capítulo

- El movimiento `traspaso` (mover stock entre sucursales) está contemplado en la base de datos pero no expuesto todavía en el formulario — se deja para cuando haga falta de verdad.
- No hay una vista de "kardex detallado" por SKU (el historial completo de movimientos de un producto) — solo el resumen de stock y costo actual. Es una extensión natural si se necesita más adelante.
- El costo promedio solo se recalcula en `entrada`; salidas y mermas no lo modifican (consumen al costo promedio vigente, que es el criterio estándar de PMP).

## Cómo correrlo

```bash
# Terminal 1 — la API
cd app/backend
docker compose up -d
node server.js
```

```bash
# Terminal 2 — la interfaz visual
cd app/frontend
npm run dev
```

`http://localhost:5173` — el botón "Inventario" de la barra superior lleva a la pantalla nueva.

---

**Checkpoint de este capítulo**: pendiente de confirmación del fundador — crear un SKU, registrar una entrada con costo unitario, y ver que el stock y el costo promedio se actualizan en la tabla.
