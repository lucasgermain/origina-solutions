# Centros de costo

*Fase 2, capítulo 4. El corazón diferenciador del producto (ver [visión](../00-vision-y-negocio/vision.md)).*

## Qué se construyó

Cada movimiento de prueba en `app/hello-world/server.js` ahora tiene un campo `centroCosto` (Providencia, Ñuñoa u Overhead), y la página incluye un selector — el elemento transversal descrito en el [diseño de interfaces](../03-diseno-interfaces/diseno-interfaces.md) — que filtra la tabla según el centro de costo elegido.

El filtro funciona sin JavaScript en el navegador: al elegir una opción, el formulario se reenvía (`onchange="this.form.submit()"`) agregando `?centroCosto=Providencia` a la URL, y es el **servidor** quien lee ese parámetro y decide qué mostrar.

## Conceptos nuevos usados

| Concepto | Qué es |
|---|---|
| `url.parse(peticion.url, true)` | Módulo incorporado de Node para leer la URL completa de la petición, incluyendo los parámetros después del `?` |
| Query params (`?centroCosto=...`) | Forma estándar de mandarle datos a un servidor a través de la URL, típica en formularios `GET` |
| `.filter()` | Recorre un arreglo y deja solo los elementos que cumplen una condición (a diferencia de `.map()`, que transforma todos) |
| Operador ternario (`condición ? siTrue : siFalse`) | Un if/else corto, en una sola expresión |
| `<form method="GET">` | Formulario HTML que, al enviarse, agrega sus valores como query params a la URL en vez de mandarlos "escondidos" |

## Cómo correrlo

```bash
cd app/hello-world
node server.js
```

En `http://localhost:3000`, el selector de centro de costo filtra la tabla al cambiar de opción.

---

**Checkpoint de este capítulo**: la tabla se ve completa con "Todos", y se filtra correctamente al elegir Providencia, Ñuñoa u Overhead. ✅ Cumplido.
