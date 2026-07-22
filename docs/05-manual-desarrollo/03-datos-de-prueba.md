# Datos de prueba: movimientos bancarios

*Fase 2, capítulo 3. Primera versión, aunque sea con datos inventados, de la [Pantalla 2 — Conciliación bancaria](../03-diseno-interfaces/diseno-interfaces.md).*

## Qué se construyó

El servidor de `app/hello-world/server.js` pasó de devolver un texto fijo a construir una tabla HTML a partir de un arreglo de movimientos bancarios de prueba, con los mismos campos que la entidad `movimiento_bancario` del [modelo de datos](../02-modelo-de-datos/modelo-de-datos.md) (fecha, glosa, monto, tipo).

```js
const movimientos = [
  { fecha: '2026-07-20', glosa: 'Transferencia Cliente X', monto: 450000, tipo: 'abono' },
  { fecha: '2026-07-19', glosa: 'Pago Proveedor Y', monto: -180000, tipo: 'cargo' },
  { fecha: '2026-07-18', glosa: 'TEF 88213', monto: -75000, tipo: 'cargo' },
  { fecha: '2026-07-17', glosa: 'Comisión mantención', monto: -8000, tipo: 'cargo' },
];
```

Una función `construirTabla(lista)` recorre el arreglo con `.map()`, genera una fila `<tr>` de HTML por cada movimiento usando template literals, las une con `.join('')`, y arma la página completa. El servidor ahora responde con `Content-Type: text/html` en vez de `text/plain`, para que el navegador la renderice como página en vez de mostrar el texto crudo.

## Conceptos nuevos usados

| Concepto | Qué es |
|---|---|
| Arreglo de objetos | Una lista donde cada elemento (`m`) tiene varios campos con nombre (`m.fecha`, `m.monto`, etc.) |
| `.map()` | Recorre cada elemento del arreglo y lo transforma en otra cosa (acá, en una fila de HTML) |
| Template literals (`` `texto ${variable}` ``) | Forma de meter el valor de una variable directo dentro de un texto |
| `.join('')` | Une un arreglo de textos en un solo texto |

## Cómo correrlo

Igual que el capítulo anterior:

```bash
cd app/hello-world
node server.js
```

`http://localhost:3000` ahora muestra una tabla con los 4 movimientos de prueba en vez de un texto fijo.

---

**Checkpoint de este capítulo**: la tabla se ve en el navegador con las 4 filas y sus columnas (fecha, glosa, monto, tipo). ✅ Cumplido.
