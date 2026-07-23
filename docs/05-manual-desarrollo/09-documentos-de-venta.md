# Documentos de venta

*Fase 3, capítulo 3. Ventas de prueba conectadas a clientes reales, vía `JOIN`.*

## Qué se construyó

Una tercera ruta, `/ventas`, con:

- Tabla `documentos_venta` en PostgreSQL, con `cliente_id` como **llave foránea** hacia `clientes(id)`.
- Un formulario que arma su `<select>` de clientes consultando la tabla `clientes` antes de mostrar la página.
- Al listar ventas, la consulta usa `JOIN` para traer, en una sola fila, cada venta junto con el nombre del cliente correspondiente.

## Conceptos nuevos usados

| Concepto | Qué es |
|---|---|
| Llave foránea (`REFERENCES clientes(id)`) | Restricción de la base de datos: el valor de `cliente_id` tiene que existir de verdad en la tabla `clientes`. Evita ventas "huérfanas" apuntando a un cliente inexistente |
| `DEFAULT CURRENT_DATE` | Valor automático si no se manda uno explícito — la fecha de emisión queda en "hoy" salvo que se indique otra |
| `JOIN` | Combina filas de dos tablas relacionadas en una sola consulta, en vez de traerlas por separado y cruzarlas a mano en el código |

## Alcance de este capítulo

Las ventas registradas acá son de prueba (folio y fecha generados localmente, no por el SII). Conectar la emisión real contra **SimpleAPI** ([ADR-007](../01-arquitectura/decisiones-tecnicas-ADR.md)) requiere primero crear una cuenta y credenciales ahí — queda como capítulo separado para cuando se quiera dar ese paso, siguiendo el mismo criterio que se usó con Fintoc (Fase 5): probar la lógica de negocio con datos controlados antes de conectar un proveedor externo real.

## Cómo correrlo

```bash
cd app/backend
docker compose up -d
node server.js
```

`http://localhost:3000/ventas` muestra el formulario (con los clientes ya creados) y la tabla de ventas con el nombre del cliente, no su ID.

---

**Checkpoint de este capítulo**: se registró una venta para un cliente existente y apareció en la tabla con su nombre (confirmando que el `JOIN` trajo el dato correcto). ✅ Cumplido.
