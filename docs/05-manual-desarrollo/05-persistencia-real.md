# Persistencia real (PostgreSQL)

*Fase 2, capítulo 5. Los movimientos bancarios dejan de vivir en la memoria del programa.*

## Qué se construyó

1. **PostgreSQL vía Docker**: `app/hello-world/docker-compose.yml` define un servicio `db` con la imagen oficial `postgres:16`, usuario/contraseña/base de datos `centrocontrol`, puerto `5432` expuesto al computador, y un volumen para que los datos sobrevivan aunque se apague el contenedor.
2. **Conector `pg`**: se inicializó `package.json` (`npm init -y`) y se instaló la librería `pg` (`npm install pg`), que permite a Node conversar con PostgreSQL.
3. **`server.js` reescrito** para, al arrancar, crear la tabla `movimientos_bancarios` si no existe y sembrarla con los 4 movimientos de prueba solo la primera vez, y para responder cada petición consultando la base de datos en vez de un arreglo en memoria — con filtro por centro de costo vía SQL parametrizado (`WHERE centro_costo = $1`).

## Conceptos nuevos usados

| Concepto | Qué es |
|---|---|
| Docker Compose (`docker-compose.yml`) | Receta declarativa para levantar uno o más "servicios" (acá, la base de datos) con Docker |
| `npm init` / `package.json` | Ficha de identidad del proyecto de código: nombre, dependencias, scripts |
| `npm install <paquete>` / `node_modules/` | Cómo se descargan e instalan librerías externas en un proyecto Node |
| `.gitignore` | Lista de archivos/carpetas que Git debe ignorar (acá, `node_modules/`, que no se sube nunca al repositorio) |
| `async` / `await` | Forma de esperar resultados que toman tiempo (como una consulta a una base de datos) sin bloquear el resto del programa |
| `Pool` (de `pg`) | Grupo de conexiones reutilizables a la base de datos, más eficiente que abrir una conexión nueva por cada consulta |
| SQL: `CREATE TABLE IF NOT EXISTS` | Crea una tabla solo si no existe todavía — permite reiniciar el programa sin error |
| SQL parametrizado (`$1`, `$2`, ...) | Forma segura de meter valores dinámicos en una consulta SQL, evitando inyección SQL |

## Cómo correrlo

```bash
cd app/hello-world
docker compose up -d      # si el contenedor de Postgres no está corriendo
node server.js
```

`http://localhost:3000` muestra la misma tabla con selector de antes, pero ahora los datos viven en PostgreSQL. Se puede comprobar deteniendo el servidor (`Ctrl+C`) y volviéndolo a correr: ya no vuelve a imprimir "Datos de prueba insertados." (porque la tabla ya tiene datos) y la tabla se sigue viendo igual en el navegador.

## Problemas encontrados

Al levantar Docker Desktop por primera vez después de la instalación, el motor se quedó pegado en "Starting the Docker Engine..." sin avanzar (0% CPU, 0 GB RAM). Se resolvió actualizando el subsistema WSL2 desde una consola de administrador:

```powershell
wsl --update
wsl --shutdown
```

seguido de un reinicio completo del computador. Después de eso, Docker Desktop arrancó con normalidad. **Lección para el futuro**: si Docker Desktop no arranca, sospechar primero de WSL2 antes que de la configuración de Docker mismo.

---

**Checkpoint de este capítulo**: el servidor reiniciado no vuelve a sembrar datos de prueba, y la tabla se sigue viendo en el navegador con los mismos movimientos. ✅ Cumplido.
