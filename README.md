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
- [Instalación de herramientas](docs/05-manual-desarrollo/00-instalacion-de-herramientas.md) — guía paso a paso para dejar Git, GitHub, VS Code, Docker y Node funcionando desde cero.

## Estado actual

Fase 0 (Documentación) cerrada. Fase 1 (Manual de instalación) redactada — pendiente que el fundador la siga e instale las herramientas en su computador. Ver el detalle de qué falta y qué sigue en el [roadmap](docs/04-roadmap/roadmap.md).
