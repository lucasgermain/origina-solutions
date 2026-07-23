# Hábitos de equipo: ramas de Git

*Fase 2, capítulo 6.*

## Qué se practicó

Un ejercicio guiado para entender qué es una rama de Git:

1. `git checkout -b feature/probar-ramas` — crea una rama nueva y te mueve a ella.
2. Se agregó un comentario a `server.js` y se guardó con `git commit` **estando en esa rama**.
3. Al volver a `master` (`git checkout master`), el comentario no estaba — quedó aislado en la rama.
4. Al fusionar (`git merge feature/probar-ramas`), el cambio pasó a `master`.

## Por qué importa

Trabajar directo en `master` funciona mientras el proyecto lo lleva una sola persona probando cosas simples. En cuanto haya más de una persona, o quieras probar algo que podría no funcionar, las ramas evitan que un experimento a medio hacer rompa la versión que ya sirve. El flujo típico es: crear una rama por cada funcionalidad nueva, trabajar ahí, y fusionar a `master` solo cuando ya funciona.

## Comandos de referencia

| Comando | Qué hace |
|---|---|
| `git checkout -b nombre-rama` | Crea una rama nueva y se mueve a ella |
| `git checkout nombre-rama` | Se mueve a una rama que ya existe |
| `git branch` | Lista las ramas que existen localmente |
| `git merge nombre-rama` | Trae los cambios de esa rama a la rama en la que estás parado |

---

**Checkpoint de este capítulo**: `head -3 server.js` mostró contenido distinto antes y después del merge, confirmando que el cambio vivió aislado en la rama hasta que se fusionó. ✅ Cumplido.
