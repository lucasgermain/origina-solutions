# Decisiones técnicas (ADRs)

Un ADR (Architecture Decision Record) es un registro corto de una decisión técnica: qué se decidió, por qué, y qué otras opciones se consideraron. Sirve para que, meses después, nadie tenga que preguntarse "¿por qué está hecho así?" — la respuesta está acá. Toda decisión técnica relevante del proyecto debería quedar registrada como un ADR nuevo, nunca modificando uno viejo (si una decisión cambia, se agrega un ADR nuevo que marca al anterior como "reemplazado").

---

## ADR-001 — Agregador bancario multibanco: Fintoc

**Estado**: Aceptado

**Contexto**: Chile no tiene un estándar de open banking obligatorio (a diferencia de PSD2 en Europa). La conectividad bancaria depende de agregadores privados que ya certificaron acceso banco por banco.

**Decisión**: Se usará Fintoc como agregador principal para la conexión bancaria multibanco (saldos y movimientos).

**Alternativas consideradas**: Integrar directamente con cada banco (descartado: cada banco tiene su propio proceso de certificación, inviable para una empresa recién partiendo); replicar el modelo de Chipax construyendo conectores propios (descartado para el MVP: altísimo costo de mantención).

**Consecuencias**: Dependencia de un proveedor externo y de sus costos por conexión/cuenta. Se revisará esta decisión si Fintoc no cubre algún banco relevante para un cliente específico.

---

## ADR-002 — Backend: Node.js con NestJS

**Estado**: Aceptado

**Contexto**: Se necesita un framework backend maduro, con buen soporte para integraciones REST/webhooks (bancos, SII, BUK/Talana) y curva de aprendizaje razonable para alguien que está aprendiendo a programar desde cero.

**Decisión**: Node.js con NestJS.

**Alternativas consideradas**: Python con FastAPI o Django (también válido; se descartó por ahora para no dividir el aprendizaje entre dos lenguajes distintos si el frontend ya va a ser JavaScript/TypeScript con React).

**Consecuencias**: Un solo lenguaje (TypeScript) en todo el stack (frontend y backend), lo que simplifica el aprendizaje. NestJS impone una estructura clara (módulos, controladores, servicios) que ayuda a alguien nuevo a no perderse.

---

## ADR-003 — Base de datos: PostgreSQL

**Estado**: Aceptado

**Contexto**: El modelo de datos es fuertemente relacional (empresas, centros de costo, movimientos, documentos, todos con relaciones claras entre sí).

**Decisión**: PostgreSQL como base de datos transaccional principal.

**Alternativas consideradas**: MongoDB / NoSQL (descartado: el dominio es relacional por naturaleza, forzar un modelo documental agregaría complejidad sin beneficio).

**Consecuencias**: Se requiere aprender SQL básico y el concepto de relaciones (llaves foráneas). Esto se cubre en el manual de desarrollo.

---

## ADR-004 — Entorno de desarrollo: local con Docker (reemplaza decisión anterior de nube)

**Estado**: Aceptado — reemplaza una decisión previa

**Contexto**: En una conversación anterior se había optado por un entorno 100% en la nube (GitHub Codespaces) para evitar cualquier instalación local, dado que el fundador parte sin nada instalado. Al definir el detalle de herramientas se decidió instalar localmente Visual Studio (Code), Git, Docker y Node directamente en el computador del fundador.

**Decisión**: Entorno de desarrollo local. Se usará Docker para levantar PostgreSQL (y Redis más adelante) sin instalar esas bases de datos de forma nativa en Windows, reduciendo fricción y conflictos de versiones.

**Alternativas consideradas**: GitHub Codespaces (nube, cero instalación) — descartado por ahora porque el fundador prefiere tener el entorno completo en su propio computador desde el día uno.

**Consecuencias**: La primera sesión del manual de desarrollo (instalación de herramientas) es más larga que con Codespaces, y algunos problemas de instalación pueden variar según el equipo de Windows del fundador. A cambio, se gana control total del entorno y funcionamiento sin depender de internet una vez instalado.

---

## ADR-005 — Modalidad de aprendizaje: el fundador escribe el código, guiado línea a línea

**Estado**: Aceptado

**Contexto**: El fundador no tiene experiencia previa de programación. Existían dos caminos: que el CTO (asistente) escriba el código y el fundador solo lo ejecute y valide, o que el fundador escriba el código con guía detallada para aprender de verdad.

**Decisión**: El fundador escribirá el código, con explicación línea por línea del asistente actuando como CTO/mentor.

**Consecuencias**: El ritmo de avance será más lento que si el CTO escribiera todo el código directamente, pero el fundador queda con capacidad técnica real y más independencia a futuro. El manual de desarrollo (fase siguiente a esta documentación) debe estar diseñado como tutorial paso a paso, no como changelog de cambios ya hechos.

---

## ADR-006 — Metodología del proyecto: documentación completa antes de código

**Estado**: Aceptado

**Contexto**: Existía el riesgo de empezar a programar "de oído" e ir improvisando el diseño sobre la marcha, lo cual es especialmente riesgoso para alguien que además está aprendiendo a programar por primera vez.

**Decisión**: Se construye primero toda la documentación de diseño (visión, arquitectura, modelo de datos, diseño de interfaces, roadmap, decisiones técnicas — este set de documentos) y solo después se escribe código, como implementación de lo ya documentado.

**Consecuencias**: El arranque del desarrollo se demora más, pero el fundador entra a programar con un mapa completo en vez de tener que tomar decisiones de diseño y de código al mismo tiempo mientras aprende.

---

## Plantilla para nuevos ADRs

```
## ADR-XXX — [Título corto de la decisión]

**Estado**: Propuesto / Aceptado / Reemplazado por ADR-YYY

**Contexto**: ¿Qué problema u opción estábamos resolviendo?

**Decisión**: ¿Qué se decidió?

**Alternativas consideradas**: ¿Qué otras opciones se evaluaron y por qué se descartaron?

**Consecuencias**: ¿Qué implica esta decisión hacia adelante (costos, riesgos, aprendizajes necesarios)?
```
