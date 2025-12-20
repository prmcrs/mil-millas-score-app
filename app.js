document.addEventListener('DOMContentLoaded', () => {
  // INDEX.HTML
  const modoJuego = document.getElementById('modoJuego');
  const nombresContainer = document.getElementById('nombresContainer');
  const formIndex = document.getElementById('formNuevaPartida');
  const partidasActivasContainer = document.getElementById('partidasActivas');
  const subtitulo = document.getElementById('subtitulo');

  if (modoJuego && nombresContainer && formIndex && partidasActivasContainer && subtitulo) {
    modoJuego.addEventListener('change', actualizarCampos);
    formIndex.addEventListener('submit', crearPartida);

    // Mostrar partidas activas al cargar la página
    mostrarPartidasActivas();

    // Agregar subtitulo con tono divertido
    subtitulo.innerHTML = 'La super aplicación de suma de millas 🚀';

    function actualizarCampos() {
      const modo = modoJuego.value;
      nombresContainer.innerHTML = '';
      const cantidad = (modo === 'equipos') ? 2 : 3;
      for (let i = 1; i <= cantidad; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.required = true;
        input.placeholder = (modo === 'equipos') ? `Nombre equipo ${i}` : `Nombre jugador ${i}`;
        input.name = `nombre_${i}`;
        input.style.marginBottom = '10px';
        nombresContainer.appendChild(input);
      }
    }

    async function crearPartida(e) {
      e.preventDefault();
      const nombre = document.getElementById('nombrePartida').value;
      const jugadores = [...nombresContainer.querySelectorAll('input')].map(inp => inp.value);
      const fecha = new Date().toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

      const nuevaPartida = {
        id: Date.now(),
        nombre: `${nombre} (${fecha})`,
        modo: modoJuego.value,
        jugadores,
        manos: [],
        finalizada: false,
        fechaCreacion: new Date().toISOString()
      };

      try {
        const response = await fetch('/api/partidas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevaPartida)
        });
        if (response.ok) {
          console.log('Partida guardada en el servidor:', nuevaPartida);
          window.location.href = 'partida.html?id=' + nuevaPartida.id;
        } else {
          throw new Error('Error al guardar la partida en el servidor');
        }
      } catch (error) {
        console.error(error);
        alert('No se pudo guardar la partida. Verifica el servidor.');
      }
    }

    async function mostrarPartidasActivas() {
      try {
        const response = await fetch('/api/partidas');
        if (response.ok) {
          const partidasGuardadas = await response.json();
          partidasActivasContainer.innerHTML = '';

          partidasGuardadas
            .filter(p => !p.finalizada)
            .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
            .forEach(partida => {
              const li = document.createElement('li');
              li.innerHTML = `<a href="partida.html?id=${partida.id}">${partida.nombre}</a>`;
              partidasActivasContainer.appendChild(li);
            });
        } else {
          throw new Error('Error al obtener las partidas del servidor');
        }
      } catch (error) {
        console.error(error);
        alert('No se pudieron cargar las partidas activas. Verifica el servidor.');
      }
    }

    actualizarCampos();
  }

  // PARTIDA.HTML
  const formPartida = document.getElementById("formMano");
  const formContainer = document.getElementById("formJugadores");
  const resumenDiv = document.getElementById("tablaResumen");

  const urlParams = new URLSearchParams(window.location.search);
  const partidaId = urlParams.get('id');

  if (formPartida && formContainer && resumenDiv && partidaId) {
    async function obtenerPartida() {
      try {
        const response = await fetch(`/api/partidas/${partidaId}`);
        if (response.ok) {
          return await response.json();
        } else {
          throw new Error('Error al obtener la partida del servidor');
        }
      } catch (error) {
        console.error(error);
        alert('No se pudo cargar la partida. Verifica el servidor.');
        return null;
      }
    }

    obtenerPartida().then(partida => {
      if (!partida) {
        resumenDiv.innerHTML = "<p>No hay partida cargada</p>";
        return;
      }

      // Mostrar nombre de la partida y jugadores/equipos
      const tituloPartida = document.getElementById('tituloPartida');
      if (tituloPartida) {
        tituloPartida.innerText = `Partida: ${partida.nombre} (${partida.modo})`;
      }

      const jugadoresContainer = document.getElementById('listaJugadores');
      if (jugadoresContainer) {
        jugadoresContainer.innerHTML = '';
        partida.jugadores.forEach(j => {
          const li = document.createElement('li');
          li.innerText = j;
          jugadoresContainer.appendChild(li);
        });
      }

      const jugadores = partida.jugadores;

      // Limpiar el contenedor antes de generar los campos
      formContainer.innerHTML = '';
      jugadores.forEach(jugador => {
        const div = document.createElement("div");
        div.innerHTML = `
          <h3>${jugador}</h3>
          <label>Recorrido (0 a 1000): <input type="number" name="${jugador}_recorrido" required></label>
          <label>Viaje completo (1000 millas): <input type="checkbox" name="${jugador}_viajeCompleto"></label>
          <label>TK (bota justo al frenar): <input type="checkbox" name="${jugador}_tk"></label>
          <label>Seguridades (cantidad de botas): <input type="number" name="${jugador}_seguridades" min="0" max="4"></label>
          <label>Las 4 seguridades (bonus): <input type="checkbox" name="${jugador}_bonus4seguridades"></label>
          <label>Viaje seguro (sin 200): <input type="checkbox" name="${jugador}_viajeSeguro"></label>
          <label>Bloqueo (shutout): <input type="checkbox" name="${jugador}_bloqueo"></label>
          <label>Acción demorada (sin usar millas hasta mitad de juego): <input type="checkbox" name="${jugador}_accionDemorada"></label>
          <label>Alargue (terminar en el alargue): <input type="checkbox" name="${jugador}_alargue"></label>
          <hr>
        `;
        formContainer.appendChild(div);
      });

      formPartida.addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.target;
        const mano = {};

        jugadores.forEach(jugador => {
          const recorrido = parseInt(form[`${jugador}_recorrido`].value) || 0;
          const viajeCompleto = form[`${jugador}_viajeCompleto`].checked;
          const tk = form[`${jugador}_tk`].checked;
          const seguridades = parseInt(form[`${jugador}_seguridades`].value) || 0;
          const bonus4 = form[`${jugador}_bonus4seguridades`].checked;
          const viajeSeguro = form[`${jugador}_viajeSeguro`].checked;
          const bloqueo = form[`${jugador}_bloqueo`].checked;
          const accionDemorada = form[`${jugador}_accionDemorada`].checked;
          const alargue = form[`${jugador}_alargue`].checked;

          const puntos = recorrido +
            (viajeCompleto ? 400 : 0) +
            (tk ? 300 : 0) +
            (seguridades * 100) +
            (bonus4 ? 300 : 0) +
            (viajeSeguro ? 300 : 0) +
            (bloqueo ? 500 : 0) +
            (accionDemorada ? 300 : 0) +
            (alargue ? 200 : 0);

          mano[jugador] = {
            recorrido,
            viajeCompleto,
            tk,
            seguridades,
            bonus4,
            viajeSeguro,
            bloqueo,
            accionDemorada,
            alargue,
            puntos
          };
        });

        partida.manos.push(mano);

        try {
          const response = await fetch(`/api/partidas/${partidaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(partida)
          });
          if (response.ok) {
            alert("Mano guardada 🎉");
            location.reload();
          } else {
            throw new Error('Error al guardar la mano en el servidor');
          }
        } catch (error) {
          console.error(error);
          alert('No se pudo guardar la mano. Verifica el servidor.');
        }
      });

      // Mostrar resumen de puntos acumulados si hay manos
      if (partida.manos.length > 0) {
        const totales = {};
        let maxPuntos = 0;
        let ganador = '';

        partida.manos.forEach(mano => {
          for (let jugador of jugadores) {
            if (!totales[jugador]) totales[jugador] = 0;
            totales[jugador] += mano[jugador]?.puntos || 0;
            if (totales[jugador] > maxPuntos) {
              maxPuntos = totales[jugador];
              ganador = jugador;
            }
          }
        });

        let html = "<h2>Totales acumulados</h2><table class='table'>";
        for (let j of jugadores) {
          html += `<tr><td><strong>${j}</strong></td><td>${totales[j]} pts</td></tr>`;
        }
        html += "</table>";

        if (maxPuntos >= 5000) {
          partida.finalizada = true;
          html += `<h3>🎉 Ganador: ${ganador} 🎉</h3>`;
          formPartida.style.display = 'none';
        }

        resumenDiv.innerHTML = html;
      }
    });
  }
});
