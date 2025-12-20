# MIL MILLAS - Aplicación de Gestión de Partidas

## Descripción
Esta es una aplicación web para gestionar partidas del juego **Mil Millas**. Permite crear partidas en modo individual o por equipos, registrar manos jugadas, calcular puntajes y determinar un ganador.

## Requisitos del Sistema
- **Node.js** (versión 14 o superior)
- Navegador web moderno (Google Chrome, Firefox, Edge, etc.)

## Instalación
1. Clona este repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd mil-millas-score-app
   ```

2. Instala las dependencias necesarias:
   ```bash
   npm install express
   ```

3. Asegúrate de que la carpeta `partidas` existe en el directorio raíz del proyecto. Si no existe, el servidor la creará automáticamente.

## Ejecución
1. Inicia el servidor backend:
   ```bash
   node server.js
   ```

2. Abre tu navegador y accede a la aplicación en:
   ```
   http://localhost:3000
   ```

## Estructura del Proyecto
- **`index.html`**: Página principal para crear nuevas partidas y ver las partidas activas/finalizadas.
- **`partida.html`**: Página para gestionar una partida específica, registrar manos y calcular puntajes.
- **`app.js`**: Lógica principal de la aplicación (frontend).
- **`server.js`**: Servidor backend para manejar las partidas.
- **`partidas/partidas.json`**: Archivo donde se almacenan las partidas (creado automáticamente si no existe).

## Notas Importantes
- Las partidas se almacenan en el archivo `partidas/partidas.json`. Este archivo debe estar en la carpeta `partidas` dentro del directorio raíz del proyecto.
- El servidor backend debe estar en ejecución para que la aplicación funcione correctamente.
- Si el archivo `partidas.json` se elimina o se corrompe, se generará un archivo vacío automáticamente al iniciar el servidor.

## Funcionalidades
1. **Página de Inicio (`index.html`)**:
   - Crear nuevas partidas en modo individual (3 jugadores) o por equipos (2 equipos).
   - Ver una lista de partidas activas y finalizadas.

2. **Página de Partida (`partida.html`)**:
   - Registrar manos jugadas y calcular puntajes automáticamente.
   - Mostrar un resumen de puntos acumulados.
   - Determinar el ganador cuando un jugador o equipo alcanza 5000 puntos.

3. **Backend (`server.js`)**:
   - Maneja las solicitudes para guardar y recuperar partidas.
   - Almacena las partidas en el archivo `partidas/partidas.json`.

## Problemas Comunes
- **No se guardan las partidas**:
  - Asegúrate de que el servidor backend está en ejecución.
  - Verifica que tienes permisos de escritura en la carpeta `partidas`.

- **No se cargan las partidas activas**:
  - Asegúrate de que el archivo `partidas/partidas.json` existe y contiene datos válidos.
  - Revisa la consola del navegador para ver si hay errores en las solicitudes al servidor.

## Contribuciones
Si deseas contribuir a este proyecto, por favor abre un issue o envía un pull request.

## Licencia
Este proyecto está bajo la licencia MIT.