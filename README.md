# Centro de Control PYME

Plataforma de gestión financiera y operacional para PYMEs chilenas con múltiples sucursales: conecta bancos, remuneraciones, ventas, gasto e inventario, y deuda, todo partido por centro de costo, para responder las preguntas que un dueño de PYME realmente necesita responder (ver [visión](docs/00-vision-y-negocio/vision.md)).

## Cómo está organizado este proyecto

Este proyecto se construye con una metodología de **documentación antes que código** ([ADR-006](docs/01-arquitectura/decisiones-tecnicas-ADR.md)): primero se define y valida el diseño completo, y recién después se escribe el sistema como implementación de ese diseño. Nada de lo que hay en `docs/` es definitivo — es la mejor decisión tomada hasta hoy, y cambia a medida que el proyecto aprende cosas nuevas (cada cambio de fondo se registra como un [ADR nuevo](docs/01-arquitectura/decisiones-tecnicas-ADR.md), nunca se borra el anterior).

## Roles del proyecto

- **Product Owner / fundador**: define el problema de negocio, el cliente, prioriza qué se construye y valida que cada funcionalidad resuelva el problema real.
- **CTO / arquitecto**: traduce esas decisiones de negocio en arquitectura, modelo de datos y código, y guía la implementación.

## Índice de documentación

### 00 — Visión y negocio
- [Visión del producto](docs/00-vision-y-negocio/vision.md) — qué problema resuelve, para quién, propuesta de valor, qué NO es.
- [Problema y cliente objetivo](docs/00-vision-y-negocio/problema-y-cliente.md) — perfil de cliente, jobs-to-be-done, por qué ahora.
- [Glosario y lenguaje de negocio](docs/00-vision-y-negocio/glosario-lenguaje-negocio.md) — vocabulario compartido entre negocio y desarrollo.

### 01 — Arquitectura
- [Arquitectura técnica](docs/01-arquitectura/arquitectura-tecnica.md) — módulos, capas, stack, integraciones, motor de reportería, seguridad.
- [Decisiones técnicas (ADRs)](docs/01-arquitectura/decisiones-tecnicas-ADR.md) — registro de cada decisión técnica relevante y por qué se tomó.

### 02 — Modelo de datos
- [Modelo de datos](docs/02-modelo-de-datos/modelo-de-datos.md) — entidades, campos, relaciones, diagrama ER.

### 03 — Diseño de interfaces
- [Diseño de interfaces](docs/03-diseno-interfaces/diseno-interfaces.md) — wireframes de contenido de cada pantalla clave.

### 04 — Roadmap
- [Roadmap](docs/04-roadmap/roadmap.md) — fases del proyecto, desde esta documentación hasta la conexión bancaria real.

### 05 — Manual de desarrollo
- [Índice del manual de desarrollo](docs/05-manual-desarrollo/README.md) — instalación de herramientas, fundamentos, y los capítulos de las Fases 2 a 5 (primer producto funcionando, CRM/Inventario/React, Remuneraciones/Deuda/Proyección de caja, conexión bancaria real).

## Estado actual

**Roadmap original completo (Fases 0 a 5).** La aplicación en React tiene 7 pantallas (Bancos, Clientes, Ventas, Inventario, Remuneraciones, Deuda, Proyección de caja) sobre una API propia en Node + PostgreSQL, con una conexión externa real funcionando (Fintoc, en modo sandbox) y dos más elegidas y pendientes de conectar (SimpleAPI, Talana). Todo documentado capítulo a capítulo y en Git. Los próximos pasos (autenticación y roles, dashboard ejecutivo, módulo de proveedores) ya no vienen de un roadmap predefinido — quedan como decisiones de producto nuevas, detalladas en el [cierre de la Fase 5](docs/05-manual-desarrollo/19-cierre-de-fase.md). Ver el detalle completo en el [roadmap](docs/04-roadmap/roadmap.md).
