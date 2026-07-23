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

## ADR-007 — Proveedor de facturación electrónica (API DTE/RCV): SimpleAPI

**Estado**: Aceptado

**Contexto**: Se necesita un proveedor de API que permita leer el Registro de Compras y Ventas (RCV) y, más adelante, emitir DTE, para alimentar el módulo de Clientes/CRM de la Fase 3. En la arquitectura original ([arquitectura-tecnica.md](./arquitectura-tecnica.md)) se habían listado varias opciones sin comprometerse a una: BaseAPI, SimpleAPI, Factronica, Tupana.

Al momento de decidir (julio 2026), se confirmó que **BaseAPI discontinuó el servicio**: dejó de aceptar clientes nuevos y cierra por completo el 11 de diciembre de 2026, según su propio sitio. Queda descartada de inmediato, independiente de sus méritos técnicos.

**Decisión**: Se usará **SimpleAPI** (de Chilesystems, la misma empresa detrás de SimpleFactura) como proveedor de API DTE/RCV.

**Por qué**:
- Integra directo contra los webservices del SII, sin depender de un tercero adicional en el medio.
- Tiene documentación pública (documentacion.simplefactura.cl) y un repositorio de ejemplo en GitHub (`chilesystems/samples-dte`) — buena señal para una integración guiada paso a paso.
- Ofrece un nivel gratuito (con límite de consultas mensuales) suficiente para desarrollo y aprendizaje antes de comprometerse a un plan pago.
- Cubre tanto DTE (emisión/timbre/firma) como Folios (CAF), que es lo que vamos a necesitar según vayamos avanzando en la Fase 3.

**Alternativas consideradas**:
- **BaseAPI**: descartada por cierre anunciado del servicio.
- **Factronica**: ofrece modalidad SaaS y standalone, pero el trial es de solo 5 días y no se encontró tabla de precios pública clara — más difícil de evaluar sin contacto comercial directo.
- **Tupana**: se investigó menos en detalle; queda como alternativa de respaldo si SimpleAPI no cubre algo que necesitemos más adelante.

**Consecuencias**: Los planes de SimpleAPI son anuales, cotizados en UF + IVA, pagados de una vez. Para el desarrollo y aprendizaje de la Fase 3 basta el nivel gratuito; **antes de pasar a producción con datos reales de un cliente, hay que revisar el plan pago y su costo real** — eso queda pendiente como decisión de negocio, no técnica, cuando se acerque ese momento.

---

## ADR-008 — Modalidad de aprendizaje: se reemplaza ADR-005, el CTO escribe y corre el código directamente

**Estado**: Aceptado (reemplaza [ADR-005](#adr-005--modalidad-de-aprendizaje-el-fundador-escribe-el-código-guiado-línea-a-línea))

**Contexto**: Bajo ADR-005, el fundador escribía cada línea de código en VS Code, guiado por el CTO. Al llegar a la introducción de React (Fase 3, capítulo 4), el fundador preguntó explícitamente si el CTO podía encargarse de escribir y correr el código directamente de ahí en adelante.

**Decisión**: De aquí en adelante, el CTO escribe y prueba el código directamente (usando acceso a archivos y terminal), en vez de dictarlo línea por línea para que el fundador lo escriba a mano. El fundador sigue a cargo de las decisiones de producto, de correr los comandos que dependen de su máquina (Docker, `npm run dev`, `node server.js`, `git push`), y de validar cada resultado en su navegador antes de avanzar.

**Consecuencias**: El avance es más rápido, pero el fundador deja de practicar la mecánica de escribir y depurar código a mano. Cada capítulo del manual de desarrollo sigue documentando **qué se construyó y por qué**, para que el fundador mantenga trazabilidad y entendimiento del sistema aunque no haya tipeado cada línea. Si en algún punto el fundador quiere retomar el modo línea a línea (por ejemplo, para un módulo que le interese aprender en detalle), puede pedirlo para ese capítulo específico.

---

## ADR-009 — Proveedor de nómina (API de remuneraciones): Talana

**Estado**: Aceptado

**Contexto**: La Fase 4 necesita un proveedor de API para leer datos de remuneraciones (liquidaciones por periodo, empleado y centro de costo) y alimentar el módulo de Remuneraciones. En la arquitectura original ([arquitectura-tecnica.md](./arquitectura-tecnica.md)) se dejaron abiertas dos opciones equivalentes: BUK y Talana, ambas con API REST propia y usadas ampliamente en Chile.

Al momento de decidir (julio 2026), ambas plataformas siguen activas y con API vigente:
- **BUK**: API Restful, credenciales vía Configuración → Acceso API dentro de la cuenta contratada, más de 30 integraciones con socios (Oracle, Chipax, LinkedIn, etc.). El precio de la plataforma se calcula por colaborador vigente registrado.
- **Talana**: portal de desarrolladores dedicado (developers.talana.com) con documentación, ejemplos, y **ambiente sandbox** para probar y validar integraciones antes de tocar datos reales. Ya se usa en integraciones existentes con ERPs contables (Laudus, SAP) y sistemas de gasto (Rindegastos).

Ninguna de las dos publica una tabla de precios específica para el acceso a la API (ambas requieren contacto comercial para credenciales de integración) — en eso quedan parejas.

**Decisión**: Se usará **Talana** como proveedor de API de remuneraciones.

**Por qué**:
- Tiene un **portal de desarrolladores separado**, con documentación pública y explícita para integraciones (a diferencia de BUK, donde el API Key se genera dentro de la cuenta de producción de la empresa).
- Ofrece un **ambiente sandbox** para probar la integración con datos de prueba antes de conectar datos reales de sueldos — coherente con el criterio ya usado para Fintoc (Fase 5) y SimpleAPI (Fase 3): probar la lógica de negocio con datos controlados antes de tocar información sensible real.
- Ya está probada en integraciones con herramientas del mismo tipo que las que este proyecto va a necesitar más adelante (ERP contable, gasto).

**Alternativas consideradas**:
- **BUK**: plataforma sólida y con más integraciones publicadas, pero su API se administra desde dentro de la cuenta de producción (sin un ambiente de pruebas dedicado y documentado públicamente), lo que la hace menos práctica para desarrollar y aprender antes de tener datos reales de nómina.

**Consecuencias**: Se necesitan credenciales de ambiente sandbox de Talana (se solicitan directo a su equipo de soporte) para desarrollar la Fase 4 con datos de prueba. **Antes de pasar a producción con sueldos reales, hay que cotizar el plan pago real** — igual que quedó pendiente con SimpleAPI, es una decisión de negocio, no técnica, para cuando se acerque ese momento. Dado que los datos de remuneraciones son especialmente sensibles, esa conexión real debe esperar a que el módulo de autenticación/roles (pendiente señalado en el [cierre de la Fase 3](../05-manual-desarrollo/13-cierre-de-fase.md)) exista.

Fuentes consultadas: [Buk — precios](https://www.buk.cl/precios), [Preguntas frecuentes de Buk](https://www.buk.co/preguntas-frecuentes-buk), [Portal de Desarrolladores Talana](https://developers.talana.com/docs/getting-started), [Integra Talana a tu Ecosistema](https://developers.talana.com/docs/integra-talana-a-tu-ecosistema).

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
