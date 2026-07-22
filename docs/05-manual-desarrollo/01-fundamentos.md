# Fundamentos

*Fase 2, capítulo 1. Antes de escribir la primera línea de código.*

## Qué es "programar" en la práctica

Programar es escribir instrucciones, en un lenguaje muy estricto, que otro programa (el "intérprete" o "compilador") lee y ejecuta al pie de la letra. No hay ambigüedad como en el lenguaje humano: si el programa espera una coma y no la pones, no "entiende por contexto" — falla. Esa rigidez es una ventaja una vez que la internalizas: el código hace exactamente lo que dice, ni más ni menos, así que un error casi siempre significa "el código no dice lo que tú creías que decía".

En este proyecto vamos a escribir en **TypeScript** (una versión de JavaScript con tipos, ver [ADR-002](../01-arquitectura/decisiones-tecnicas-ADR.md)), tanto en el backend (NestJS) como en el frontend (React). Un solo lenguaje para todo el stack, para no duplicar la curva de aprendizaje.

## Qué es un repositorio (repo)

Un repositorio es una carpeta cuyo historial de cambios está siendo llevado por Git. Cada vez que guardas un avance con `git commit`, Git toma una "foto" del estado completo de la carpeta en ese momento, con un mensaje que describe qué cambió. Con eso puedes: volver atrás si algo se rompe, ver quién cambió qué y cuándo, y trabajar en paralelo en distintas líneas de trabajo (ramas) sin pisarse.

`CentroControlPYME` ya es un repositorio — lo inicializaste en el Paso 6 del [manual de instalación](./00-instalacion-de-herramientas.md). Todo lo que hagamos de ahora en adelante (documentación y código) se va a ir guardando ahí con commits.

## Qué es la terminal

La terminal (en tu caso, Git Bash) es una forma de darle instrucciones a tu computador escribiendo texto en vez de hacer clic. En vez de abrir una carpeta con doble clic, escribes `cd nombre-carpeta` ("change directory"). En vez de ver los archivos con el Explorador, escribes `ls` ("list"). Cualquier programa que instalamos (`git`, `node`, `docker`) se maneja también escribiendo comandos en la terminal — es el lenguaje común de las herramientas de desarrollo.

Tres comandos que vamos a usar todo el tiempo:

| Comando | Qué hace |
|---|---|
| `pwd` | Muestra en qué carpeta estás parado ("print working directory") |
| `cd nombre-carpeta` | Entra a esa carpeta. `cd ..` sube un nivel |
| `ls` | Lista los archivos y carpetas de donde estás parado |

## Cómo se conecta esto con lo que ya documentamos

Todo lo que escribimos en `docs/` (visión, arquitectura, modelo de datos, diseño de interfaces) no era un ejercicio de escritura — es el plano de lo que el código va a implementar. Concretamente, en este primer capítulo de código vamos a construir el punto de partida de la **Pantalla 2 — Conciliación bancaria** del [diseño de interfaces](../03-diseno-interfaces/diseno-interfaces.md), usando como base el campo `movimiento_bancario` del [modelo de datos](../02-modelo-de-datos/modelo-de-datos.md). Nada de lo que programemos es improvisado: cada tabla y cada pantalla ya tiene su decisión tomada, así que programar pasa a ser "traducir el diseño a código", no "inventar sobre la marcha".

## Cómo vamos a trabajar de acá en adelante

Según [ADR-005](../01-arquitectura/decisiones-tecnicas-ADR.md), tú escribes el código y yo te guío línea por línea. En la práctica eso significa: en cada paso te voy a decir exactamente qué archivo crear o abrir, qué escribir, y por qué esa línea hace lo que hace — nunca "copia y pega esto" sin explicación. Cuando algo falle (y va a fallar, es parte normal de programar), me pegas el mensaje de error exacto y lo resolvemos juntos.

---

**Checkpoint de este capítulo**: no hay comandos que correr todavía. Solo confirma que estos tres conceptos — repositorio, terminal, y "el código implementa lo ya documentado" — te hacen sentido antes de que abramos VS Code de verdad en el próximo capítulo (Hello World).
