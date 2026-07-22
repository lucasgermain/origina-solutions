# Problema y cliente objetivo

## Perfil de cliente (ICP)

| Dimensión | Descripción |
|---|---|
| Tipo de empresa | PYME chilena formal, con facturación electrónica al día |
| Tamaño | Entre 2 y 40 sucursales/puntos de venta, o 2+ unidades de negocio distintas bajo la misma razón social |
| Facturación | Entre UF 5.000 y UF 100.000 anuales aprox. (rango a validar con clientes reales) |
| Personal | Con dotación contratada (por lo tanto usa o debería usar un sistema de remuneraciones tipo BUK/Talana) |
| Estructura financiera | Tiene al menos un crédito, línea o leasing bancario vigente |
| Perfil del dueño | No necesariamente contador; quiere respuestas rápidas, no reportes de 40 páginas a fin de mes |
| Dolor actual | Junta información de banco, ventas, gastos, sueldos y deuda a mano (Excel) o pide reportes distintos a distintas personas cada semana |

## Jobs-to-be-done (lo que el dueño intenta lograr)

1. Saber, sin pedirle nada a nadie, cómo le está yendo a cada sucursal por separado.
2. Detectar a tiempo una sucursal o línea de negocio que está perdiendo plata, antes de que sea un problema grande.
3. Decidir con datos reales cuánto puede retirar de la empresa sin dejarla en aprietos de caja.
4. Anticipar necesidades de financiamiento con semanas de anticipación, no cuando ya es urgente.
5. Tener una fuente de verdad única para mostrarle a un socio, un banco o un inversionista.

## Por qué ahora (y por qué en Chile)

- La facturación electrónica es obligatoria y universal en Chile, por lo que el dato de venta y compra ya existe en el SII (RCV) — no hay que pedirle al cliente que lo digite de nuevo.
- Ya existen agregadores bancarios locales certificados (Fintoc y otros) que resuelven la conectividad multibanco sin que el producto tenga que negociar con cada banco por separado.
- BUK y Talana, los dos líderes de remuneraciones en PYME chilena, exponen API propia, por lo que la nómina también se puede leer sin digitación manual.
- Es decir: la pieza que falta no es "más datos", es la capa que los cruza todos por centro de costo. Ese es el espacio que ocupa este producto.

## Cómo se prueba el problema con el primer cliente

Antes de construir todo el alcance, el objetivo es validar con un primer cliente real (o el propio negocio del fundador) que el cruce banco + centro de costo, aunque sea con datos de prueba o cargados a mano al inicio, ya genera una respuesta que hoy nadie tiene: "esta sucursal específica generó esta caja este mes". Ese es el criterio de éxito del primer producto funcionando (ver [`04-roadmap/roadmap.md`](../04-roadmap/roadmap.md)).

## Competencia y diferenciación (resumen)

Detalle completo en [`01-arquitectura/arquitectura-tecnica.md`](../01-arquitectura/arquitectura-tecnica.md), sección "Por qué no basta con lo que ya existe". En una línea: los facturadores muestran venta e inventario, las fintech de conciliación muestran el banco, nadie cruza ambos por centro de costo con remuneraciones y deuda incluidas.
