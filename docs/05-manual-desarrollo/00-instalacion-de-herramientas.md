# Manual de instalación de herramientas

*Fase 1 del [roadmap](../04-roadmap/roadmap.md). Escrito para alguien que nunca ha instalado herramientas de desarrollo, en Windows.*

## Qué vamos a instalar y por qué

| Herramienta | Para qué sirve | Por qué la necesitamos |
|---|---|---|
| Cuenta de GitHub | Guardar el código del proyecto en la nube, con historial de cambios | Ahí va a vivir el repositorio del proyecto ([ADR-004](../01-arquitectura/decisiones-tecnicas-ADR.md)) |
| Git | Programa que registra el historial de cambios del código | Es la herramienta de control de versiones que usa todo el mundo en software |
| Visual Studio Code (VS Code) | El editor donde vas a escribir el código | Es gratis, liviano, y el más usado para el stack que elegimos ([ADR-002](../01-arquitectura/decisiones-tecnicas-ADR.md)) |
| Docker Desktop | Permite levantar PostgreSQL sin instalarlo directamente en Windows | Evita conflictos de versiones e instalación nativa de la base de datos ([ADR-004](../01-arquitectura/decisiones-tecnicas-ADR.md)) |
| Node.js | El motor que ejecuta el código JavaScript/TypeScript del backend y del frontend | Es la base de NestJS y React ([ADR-002](../01-arquitectura/decisiones-tecnicas-ADR.md)) |

No vamos a instalar PostgreSQL "de verdad" en Windows — va a vivir dentro de Docker. Esto es intencional: menos cosas que se puedan romper distinto en cada computador.

## Requisitos previos

- Windows 10 (versión 2004 o superior) o Windows 11. Docker Desktop necesita esto para funcionar bien.
- Ser administrador de tu computador (o tener a alguien que te dé el usuario de administrador para instalar programas).
- Una cuenta de correo para crear la cuenta de GitHub (puede ser la misma que usas siempre).
- Conexión a internet estable — vamos a descargar varios instaladores grandes (Docker Desktop en particular pesa varios cientos de MB).

Tiempo estimado total: entre 1 y 2 horas, dependiendo de la velocidad de tu internet y si Windows te pide reiniciar (Docker suele pedirlo).

---

## Paso 1 — Crear cuenta de GitHub

1. Ve a [github.com](https://github.com) y haz clic en "Sign up".
2. Sigue el flujo con tu correo, un nombre de usuario, y una contraseña.
3. Verifica tu correo cuando GitHub te lo pida.
4. Guarda en un lugar seguro tu nombre de usuario y contraseña — los vas a usar seguido.

**Checkpoint**: puedes entrar a github.com y ver tu perfil arriba a la derecha.

---

## Paso 2 — Instalar Git

Git es el programa (distinto de GitHub, que es la web) que corre en tu computador y maneja el historial de cambios.

1. Ve a [git-scm.com/download/win](https://git-scm.com/download/win) y descarga el instalador de 64-bit.
2. Ejecuta el instalador. En casi todas las pantallas puedes dejar la opción que viene marcada por defecto y hacer clic en "Next". Dos detalles a los que prestar atención:
   - En la pantalla "Choosing the default editor", si no tienes preferencia, deja "Use Visual Studio Code as Git's default editor" si esa opción aparece (si no aparece porque instalarás VS Code después, no importa, se puede cambiar más adelante).
   - En "Adjusting your PATH environment", deja la opción recomendada ("Git from the command line and also from 3rd-party software").
3. Termina la instalación.
4. Abre el programa **"Git Bash"** que quedó instalado (búscalo en el menú inicio de Windows) y escribe:

```bash
git --version
```

Debería mostrarte algo como `git version 2.4x.x`.

5. Configura tu identidad (Git necesita saber quién eres para registrar los cambios). En la misma ventana de Git Bash:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "el-correo-de-tu-cuenta-de-github@ejemplo.com"
```

**Checkpoint**: `git --version` muestra un número de versión, no un error.

---git

## Paso 3 — Instalar Visual Studio Code

1. Ve a [code.visualstudio.com](https://code.visualstudio.com) y descarga la versión para Windows.
2. Ejecuta el instalador. Recomendado: marca la casilla "Add to PATH" si aparece (normalmente viene marcada) y "Register Code as an editor for supported file types".
3. Abre VS Code una vez instalado.
4. Instala estas dos extensiones (ícono de cuadrados en la barra izquierda → buscar → Install):
   - **ESLint** (ayuda a detectar errores en el código mientras escribes)
   - **Docker** (te deja ver y manejar contenedores de Docker desde VS Code)

**Checkpoint**: VS Code abre sin errores y puedes ver el ícono de extensiones instaladas en la barra lateral.

---

## Paso 4 — Instalar Docker Desktop

1. Ve a [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) y descarga Docker Desktop para Windows.
2. Ejecuta el instalador. Va a pedirte habilitar **WSL2** (Windows Subsystem for Linux) — acepta esa opción, es requisito.
3. Es probable que Windows te pida **reiniciar el computador** en este paso. Hazlo.
4. Después de reiniciar, abre Docker Desktop desde el menú inicio. La primera vez puede pedir aceptar términos de servicio y puede tardar uno o dos minutos en levantar.
5. Verifica en una ventana de Git Bash o PowerShell:

```bash
docker --version
docker run hello-world
```

El segundo comando descarga una imagen mínima de prueba y debería terminar mostrando un mensaje que empieza con "Hello from Docker!".

**Checkpoint**: `docker run hello-world` muestra el mensaje de saludo, no un error de conexión.

### Si algo falla en este paso

Docker Desktop es, en la práctica, el instalador que más problemas da en Windows. Los errores más comunes:

- **"WSL2 no está habilitado" o similar**: Docker Desktop suele traer un botón para habilitarlo automáticamente y reiniciar. Si no, se resuelve abriendo PowerShell como administrador y ejecutando `wsl --install`, luego reiniciando.
- **Windows Home vs Windows Pro**: Docker Desktop funciona en ambas versiones de Windows 10/11 usando el backend WSL2 (ya no requiere Windows Pro como versiones antiguas de Docker).
- Si te trabas en este paso, es razonable pausar acá y retomar en otra sesión — es normal que sea el paso más largo del manual.

---

## Paso 5 — Instalar Node.js

1. Ve a [nodejs.org](https://nodejs.org) y descarga la versión **LTS** (no la "Current"), que es la más estable.
2. Ejecuta el instalador dejando las opciones por defecto.
3. Verifica en Git Bash:

```bash
node --version
npm --version
```

Deberías ver dos números de versión (npm es el gestor de paquetes que viene incluido con Node).

**Checkpoint**: ambos comandos muestran un número de versión.

---

## Verificación final — todo instalado

Abre una ventana de Git Bash y corre, uno por uno:

```bash
git --version
code --version
docker --version
node --version
npm --version
```

Los cinco comandos deberían mostrar un número de versión, sin errores de "comando no encontrado". Si alguno falla, revisa el paso correspondiente antes de seguir — vale la pena resolverlo ahora y no arrastrar el problema a la Fase 2.

---

## Paso 6 — Conectar este proyecto con Git y GitHub

Con todo instalado, el último paso de esta fase es convertir la carpeta del proyecto en un repositorio de Git y subirla a GitHub, para empezar a llevar historial de cambios desde ahora.

1. Abre Git Bash **dentro de la carpeta del proyecto** (`CentroControlPYME`): en el Explorador de Windows, entra a la carpeta, haz clic derecho dentro de ella y elige "Git Bash Here" (esta opción la agrega el instalador de Git).
2. Inicializa el repositorio:

```bash
git init
git add .
git commit -m "Documentación inicial del proyecto"
```

3. Crea un repositorio nuevo y vacío en GitHub (botón "New" en github.com, dale el nombre `centro-control-pyme`, sin agregar README ni licencia porque ya tenemos contenido local).
4. GitHub te va a mostrar un bloque de comandos para conectar tu carpeta local con ese repositorio remoto — algo parecido a:

```bash
git remote add origin https://github.com/TU-USUARIO/centro-control-pyme.git
git branch -M main
git push -u origin main
```

Reemplaza `TU-USUARIO` por tu nombre de usuario real de GitHub. La primera vez que hagas `push`, es posible que te pida iniciar sesión — sigue las instrucciones en pantalla (puede abrir una ventana del navegador para autenticarte).

**Checkpoint**: al recargar la página del repositorio en GitHub, ves los mismos archivos y carpetas que tienes localmente (`README.md`, `docs/`, etc.).

---

## Qué sigue

Con esto termina la Fase 1. La Fase 2 (primer producto funcionando) empieza recién cuando confirmes que los cinco checkpoints de este manual funcionaron. Ver [roadmap](../04-roadmap/roadmap.md).
