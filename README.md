# Mil Millas Score App

Aplicación web para llevar el puntaje de un juego de cartas llamado "Mil Millas". La app permite crear partidas, agregar manos, y calcular el puntaje acumulado de los jugadores o equipos.

## Tecnologías usadas
- **Backend**: Node.js con Express
- **Frontend**: HTML, CSS (con estilo básico), JavaScript
- **Persistencia de datos**: Archivos JSON (uno por partida)

## Funcionalidades
- **Crear partida**: Permite a los jugadores crear una nueva partida con nombre y equipos.
- **Agregar mano**: Los jugadores pueden agregar las manos jugadas a medida que avanza el juego.
- **Ver puntaje acumulado**: Calcula y muestra el puntaje total de cada jugador/equipo en tiempo real.
- **Puntajes y Bonificaciones**: Al agregar cada mano, la app calcula las bonificaciones por "viaje completo", "seguridad", "bloqueo", entre otras.

## Cómo usar la app

1. **Instalar dependencias**:  
  Primero, instala las dependencias del proyecto ejecutando:
  ```bash
  npm install
  ```
2. **Iniciar el servidor**:
Luego, inicia el servidor con el siguiente comando:
  ```bash
  Copy
  Edit
  npm start
  ```
3. **Acceder a la aplicación**:
Abre tu navegador y ve a http://localhost:3000 para usar la app.

## Despliegue
Puedes desplegar esta aplicación en un App Service de Azure de forma gratuita, subiendo el código a tu cuenta de GitHub y conectando el repositorio con Azure.

## Contribución
Si deseas contribuir al proyecto, siéntete libre de abrir un pull request o un issue con sugerencias.

## Licencia
Este proyecto está bajo la Licencia MIT.
