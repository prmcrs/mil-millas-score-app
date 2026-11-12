# Mil Millas Score

## Descripción
Esta aplicación web está pensada para registrar partidas de Mil Millas, mantener el historial y calcular puntajes en tiempo real. Actualmente la app funciona como una herramienta de mesa para partidas rápidas, con soporte para modo individual y equipos, almacenamiento local vía archivo JSON y un flujo simple de carga/guardado.

## Requisitos
- Node.js 18+ recomendado
- npm
- navegador moderno

## Instalación local
1. Clona el repositorio y entra al proyecto:
   ```bash
   git clone <url-del-repo>
   cd mil-millas-score-app
   ```

2. Instala dependencias:
   ```bash
   npm install
   ```

3. Inicia la app:
   ```bash
   npm start
   ```

4. Abre en el navegador:
   ```text
   http://localhost:3000
   ```

## Estructura
- `server.js`: backend Express con API REST y persistencia local.
- `app.js`: lógica del frontend y reglas de puntaje.
- `index.html`: pantalla principal para crear y listar partidas.
- `partida.html`: pantalla de la partida activa.
- `style.css`: estilos modernos y responsivos.
- `partidas/partidas.json`: almacenamiento de todas las partidas.

## Funcionalidades actuales
- Crear partidas en modo individual o por equipos.
- Registrar manos por participante.
- Validar recorrido y valores numéricos.
- Calcular puntajes por ronda y total acumulado.
- Detectar ganador cuando se supera la meta de 5000 puntos.
- Persistir datos en archivo local JSON.

## Reglas de Mil Millas implementadas
La lógica de puntaje usada por la app sigue el flujo de reglas del juego que ya estaba definido en el proyecto:
- Recorrido: 0 a 1000, múltiplo de 25.
- Viaje completo: +400.
- TK: +300.
- Seguridad: +100 por seguridad.
- Bonus por 4 seguridades: +300.
- Viaje seguro: +300.
- Bloqueo: +500.
- Acción demorada: +300.
- Alargue: +200.
- Meta para ganador: 5000 puntos.

## Qué falta para sistematizar todo el juego
La app ya cubre la parte operativa más importante, pero para que el sistema quede completo como herramienta de mesa todavía falta avanzar en varios puntos:

1. Reglas del juego más avanzadas
   - manejar variantes de mesa, reglas caseras, errores de puntuación y bonificaciones especiales.
   - definir si hay formato de equipos con doble puntaje, desempates o reglas de reinicio.

2. Historial más detallado
   - mostrar cada mano con la lista exacta de opciones elegidas por participante.
   - permitir edición de manos ya cargadas.

3. Control de finalización más robusto
   - bloquear la carga de nuevas manos al llegar a la meta.
   - evitar que una partida siga sin declarar ganador claro.

4. Mejoras de UX
   - permitir volver atrás, anular la última mano, exportar partidas.
   - agregar vista de ranking, historial de rondas y filtros por estado.

5. Seguridad y despliegue
   - mover la contraseña a backend/configuración de entorno.
   - usar variables de entorno para puerto y secretos.
   - preparar despliegue en servicios como Render, Vercel + Railway, Docker, o un VPS simple.

## Flujo de despliegue sugerido
Sin infraestructura aún, una evolución razonable sería:

- Local: `npm install` + `npm start`
- Staging: subir a un servicio con Node.js y persistencia en volumen
- Producción: usar un contenedor simple o un servicio PaaS
- Persistencia: migrar de JSON local a base de datos o almacenamiento externo en futuro
- Seguridad: sacar la contraseña del cliente y moverla a un backend con sesión o token

## Observaciones técnicas
- La app guarda datos en JSON local para simplificar el prototipo.
- Se unificó la convención de `participantes` para evitar inconsistencias entre `jugadores` y `participantes`.
- La lógica de cálculo fue centralizada para evitar duplicación y mantener la misma regla en todo el flujo.
- La validación de campos numéricos y booleanos se hace de forma explícita para evitar errores de tipo.

## Licencia
MIT

## Cambios en desarrollo (PR #1)
- `score.js`: motor de puntuación compartido entre navegador y servidor.
- Participantes configurables entre 2 y 6, en modo individual o equipos.
- Historial de manos con edición completa y anulación; se puede corregir una partida finalizada.
- Cálculo de ganadores por máximo puntaje, con soporte para empates.
- Validación de manos en la API y protección contra guardados concurrentes mediante `version` (los registros antiguos comienzan en versión 0).
- Escritura atómica del archivo de partidas; el JSON existente no se modifica en el PR.
- Pruebas de puntuación con `npm test`.

### Antes de integrar
1. Respaldar `partidas/partidas.json` del servidor donde se usa la aplicación.
2. Probar carga, edición y anulación con copias de partidas reales, incluyendo partidas antiguas.
3. Probar dos navegadores editando la misma partida y comprobar que se recibe HTTP 409.
4. Revisar la autenticación antes de publicar la aplicación en Internet: **la API todavía no tiene control de acceso**. No exponerla públicamente hasta implementar una sesión autenticada en el backend.
5. Verificar los checks de GitHub Actions y realizar una prueba manual del frontend antes de fusionar.

