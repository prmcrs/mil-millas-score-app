document.addEventListener('DOMContentLoaded', () => {
  const GAME = window.MilMillas;
  const escapeHtml = (v) => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const GAME_RULES = {
    maxRecorrido: 1000,
    ganadorMeta: 5000,
    premios: {
      viajeCompleto: 400,
      tk: 300,
      seguridad: 100,
      bonusCuatroSeguridades: 300,
      viajeSeguro: 300,
      bloqueo: 500,
      accionDemorada: 300,
      alargue: 200,
    },
  };

  function normalizeParticipantes(partida) {
    if (!partida || typeof partida !== 'object') {
      return null;
    }

    const participantes = Array.isArray(partida.participantes)
      ? partida.participantes
      : Array.isArray(partida.jugadores)
        ? partida.jugadores
        : [];

    const partidaNormalizada = {
      ...partida,
      participantes,
      manos: Array.isArray(partida.manos) ? partida.manos : [],
      finalizada: Boolean(partida.finalizada),
    };

    delete partidaNormalizada.jugadores;

    partidaNormalizada.manos = partidaNormalizada.manos.map((mano) => {
      const manoNormalizada = { ...mano };

      participantes.forEach((participante) => {
        const recorridoKey = `${participante}_recorrido`;
        const seguridadesKey = `${participante}_seguridades`;
        const viajeCompletoKey = `${participante}_viajeCompleto`;
        const tkKey = `${participante}_tk`;
        const bonusKey = `${participante}_bonus4seguridades`;
        const viajeSeguroKey = `${participante}_viajeSeguro`;
        const bloqueoKey = `${participante}_bloqueo`;
        const accionDemoradaKey = `${participante}_accionDemorada`;
        const alargueKey = `${participante}_alargue`;

        const recorrido = Number(manoNormalizada[recorridoKey] ?? 0);
        const seguridades = Number(manoNormalizada[seguridadesKey] ?? 0);
        const viajeCompleto = Boolean(manoNormalizada[viajeCompletoKey]);
        const tk = Boolean(manoNormalizada[tkKey]);
        const bonus4 = Boolean(manoNormalizada[bonusKey]);
        const viajeSeguro = Boolean(manoNormalizada[viajeSeguroKey]);
        const bloqueo = Boolean(manoNormalizada[bloqueoKey]);
        const accionDemorada = Boolean(manoNormalizada[accionDemoradaKey]);
        const alargue = Boolean(manoNormalizada[alargueKey]);

        const puntos =
          recorrido +
          (viajeCompleto ? GAME_RULES.premios.viajeCompleto : 0) +
          (tk ? GAME_RULES.premios.tk : 0) +
          seguridades * GAME_RULES.premios.seguridad +
          (bonus4 ? GAME_RULES.premios.bonusCuatroSeguridades : 0) +
          (viajeSeguro ? GAME_RULES.premios.viajeSeguro : 0) +
          (bloqueo ? GAME_RULES.premios.bloqueo : 0) +
          (accionDemorada ? GAME_RULES.premios.accionDemorada : 0) +
          (alargue ? GAME_RULES.premios.alargue : 0);

        manoNormalizada[recorridoKey] = recorrido;
        manoNormalizada[seguridadesKey] = seguridades;
        manoNormalizada[viajeCompletoKey] = viajeCompleto;
        manoNormalizada[tkKey] = tk;
        manoNormalizada[bonusKey] = bonus4;
        manoNormalizada[viajeSeguroKey] = viajeSeguro;
        manoNormalizada[bloqueoKey] = bloqueo;
        manoNormalizada[accionDemoradaKey] = accionDemorada;
        manoNormalizada[alargueKey] = alargue;
        manoNormalizada[`${participante}_puntos`] = puntos;
      });

      return manoNormalizada;
    });

    return partidaNormalizada;
  }

  function toNumber(value, fallback = 0) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function parseBoolean(value) {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return value === 'true' || value === 'on' || value === 'yes';
    }
    return Boolean(value);
  }

  function scoreParticipantHand(participante, data) {
    const recorrido = toNumber(data[`${participante}_recorrido`], 0);
    const viajeCompleto = parseBoolean(data[`${participante}_viajeCompleto`]);
    const tk = parseBoolean(data[`${participante}_tk`]);
    const seguridades = toNumber(data[`${participante}_seguridades`], 0);
    const bonus4 = parseBoolean(data[`${participante}_bonus4seguridades`]);
    const viajeSeguro = parseBoolean(data[`${participante}_viajeSeguro`]);
    const bloqueo = parseBoolean(data[`${participante}_bloqueo`]);
    const accionDemorada = parseBoolean(data[`${participante}_accionDemorada`]);
    const alargue = parseBoolean(data[`${participante}_alargue`]);

    return (
      recorrido +
      (viajeCompleto ? GAME_RULES.premios.viajeCompleto : 0) +
      (tk ? GAME_RULES.premios.tk : 0) +
      seguridades * GAME_RULES.premios.seguridad +
      (bonus4 ? GAME_RULES.premios.bonusCuatroSeguridades : 0) +
      (viajeSeguro ? GAME_RULES.premios.viajeSeguro : 0) +
      (bloqueo ? GAME_RULES.premios.bloqueo : 0) +
      (accionDemorada ? GAME_RULES.premios.accionDemorada : 0) +
      (alargue ? GAME_RULES.premios.alargue : 0)
    );
  }

  function getTotales(partida) {
    const totales = {};
    partida.participantes.forEach((participante) => {
      totales[participante] = 0;
    });

    partida.manos.forEach((mano) => {
      partida.participantes.forEach((participante) => {
        const puntos = Number(mano[`${participante}_puntos`] ?? 0);
        totales[participante] += puntos;
      });
    });

    return totales;
  }

  function renderSummary(partida, summaryEl) {
    const totales = getTotales(partida);
    const maxPuntos = Math.max(...Object.values(totales), 0);
    const ganador = maxPuntos >= GAME_RULES.ganadorMeta ? Object.entries(totales).filter(([, puntos]) => puntos === maxPuntos).map(([nombre]) => nombre).join(' / ') : null;

    const rows = partida.participantes
      .map((participante) => `<tr><td><strong>${escapeHtml(participante)}</strong></td><td>${totales[participante]} pts</td></tr>`)
      .join('');

    const summary = `
      <h2>Totales acumulados</h2>
      <table class="table table-summary">
        <tbody>${rows}</tbody>
      </table>
    `;

    summaryEl.innerHTML = summary;

    if (ganador) {
      summaryEl.insertAdjacentHTML('beforeend', `<h3 class="winner-banner">🎉 Ganador: ${escapeHtml(ganador)} 🎉</h3>`);
    }

    return ganador;
  }

  function renderParticipantFields(participantes, targetEl) {
    targetEl.innerHTML = '';

    participantes.forEach((participante, index) => {
      const card = document.createElement('div');
      card.className = 'player-card';
      card.innerHTML = `
        <h3>${escapeHtml(participante)}</h3>
        <div class="field-row">
          <label for="field${index}_recorrido">Recorrido (0 a 1000)</label>
          <input type="number" id="field${index}_recorrido" name="${participante}_recorrido" min="0" max="1000" step="25" required>
        </div>
        <div class="field-row checkbox-row">
          <input type="checkbox" id="field${index}_viajeCompleto" name="${participante}_viajeCompleto">
          <label for="field${index}_viajeCompleto">Viaje completo</label>
        </div>
        <div class="field-row checkbox-row">
          <input type="checkbox" id="field${index}_tk" name="${participante}_tk">
          <label for="field${index}_tk">TK</label>
        </div>
        <div class="field-row">
          <label for="field${index}_seguridades">Seguridades</label>
          <input type="number" id="field${index}_seguridades" name="${participante}_seguridades" min="0" max="4" value="0">
        </div>
        <div class="field-row checkbox-row">
          <input type="checkbox" id="field${index}_bonus4seguridades" name="${participante}_bonus4seguridades">
          <label for="field${index}_bonus4seguridades">4 seguridades</label>
        </div>
        <div class="field-row checkbox-row">
          <input type="checkbox" id="field${index}_viajeSeguro" name="${participante}_viajeSeguro">
          <label for="field${index}_viajeSeguro">Viaje seguro</label>
        </div>
        <div class="field-row checkbox-row">
          <input type="checkbox" id="field${index}_bloqueo" name="${participante}_bloqueo">
          <label for="field${index}_bloqueo">Bloqueo</label>
        </div>
        <div class="field-row checkbox-row">
          <input type="checkbox" id="field${index}_accionDemorada" name="${participante}_accionDemorada">
          <label for="field${index}_accionDemorada">Acción demorada</label>
        </div>
        <div class="field-row checkbox-row">
          <input type="checkbox" id="field${index}_alargue" name="${participante}_alargue">
          <label for="field${index}_alargue">Alargue</label>
        </div>
      `;
      targetEl.appendChild(card);
    });
  }

  if (document.body.dataset.page === 'index') {
    const modoJuego = document.getElementById('modoJuego');
    const camposJugadores = document.getElementById('camposJugadores');
    const formNuevaPartida = document.getElementById('formNuevaPartida');
    const partidosActivos = document.getElementById('partidasActivas');
    const partidasFinalizadas = document.getElementById('partidasFinalizadas');
    const resumenActivas = document.getElementById('resumenPartidasActivas');
    const resumenFinalizadas = document.getElementById('resumenPartidasFinalizadas');

    function renderParticipantesInputs() {
      const modo = modoJuego.value;
      const cantidad = Number(document.getElementById('cantidadParticipantes').value);
      camposJugadores.innerHTML = '';

      for (let index = 1; index <= cantidad; index += 1) {
        const input = document.createElement('input');
        input.type = 'text';
        input.name = `participante_${index}`;
        input.placeholder = modo === 'equipos' ? `Nombre equipo ${index}` : `Nombre jugador ${index}`;
        input.required = true;
        input.className = 'form-control';
        camposJugadores.appendChild(input);
      }
    }

    async function cargarPartidas() {
      try {
        const response = await fetch('/api/partidas');
        if (!response.ok) {
          throw new Error('No se pudieron obtener las partidas');
        }

        const partidas = await response.json();

        const activas = partidas.filter((partida) => !partida.finalizada);
        const finalizadas = partidas.filter((partida) => partida.finalizada);

        partidosActivos.innerHTML = activas.length
          ? activas
              .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
              .map((partida) => `<li><a href="partida.html?id=${encodeURIComponent(partida.id)}">${escapeHtml(partida.nombre)}</a></li>`)
              .join('')
          : '<li class="empty-state">No hay partidas activas.</li>';

        partidasFinalizadas.innerHTML = finalizadas.length
          ? finalizadas
              .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
              .map((partida) => `<li><a href="partida.html?id=${encodeURIComponent(partida.id)}">${escapeHtml(partida.nombre)}</a></li>`)
              .join('')
          : '<li class="empty-state">No hay partidas finalizadas.</li>';

        resumenActivas.textContent = `${activas.length} activa${activas.length === 1 ? '' : 's'}`;
        resumenFinalizadas.textContent = `${finalizadas.length} finalizada${finalizadas.length === 1 ? '' : 's'}`;
      } catch (error) {
        console.error(error);
        alert('No se pudieron cargar las partidas. Verifica el servidor.');
      }
    }

    modoJuego.addEventListener('change', renderParticipantesInputs);
    document.getElementById('cantidadParticipantes').addEventListener('change', renderParticipantesInputs);

    formNuevaPartida.addEventListener('submit', async (event) => {
      event.preventDefault();

      const nombrePartida = document.getElementById('nombrePartida').value.trim();
      const participantes = Array.from(camposJugadores.querySelectorAll('input'))
        .map((input) => input.value.trim())
        .filter(Boolean);

      if (!nombrePartida || participantes.length !== Number(document.getElementById('cantidadParticipantes').value) || new Set(participantes.map(x=>x.toLowerCase())).size!==participantes.length) {
        alert('Completa el nombre de la partida y todos los participantes.');
        return;
      }

      const nuevaPartida = {
        id: `partida-${Date.now()}`,
        nombre: `${nombrePartida} (${new Date().toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })})`,
        modo: modoJuego.value,
        participantes,
        manos: [],
        finalizada: false,
        fechaCreacion: new Date().toISOString(),
      };

      try {
        const response = await fetch('/api/partidas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nuevaPartida),
        });

        if (!response.ok) {
          throw new Error('Error al guardar la partida');
        }

        window.location.href = `partida.html?id=${nuevaPartida.id}`;
      } catch (error) {
        console.error(error);
        alert('No se pudo guardar la partida. Verifica el servidor.');
      }
    });

    renderParticipantesInputs();
    cargarPartidas();
  }

  if (document.body.dataset.page === 'partida') {
    const urlParams = new URLSearchParams(window.location.search);
    const partidaId = urlParams.get('id');

    if (!partidaId) {
      alert('No se encontró el ID de la partida. Redirigiendo al inicio.');
      window.location.href = 'index.html';
      return;
    }

    const formPartida = document.getElementById('formMano');
    const formJugadores = document.getElementById('formJugadores');
    const tablaResumen = document.getElementById('tablaResumen');
    const mensajeFinalizada = document.getElementById('mensajeFinalizada');
    const mensajeGanador = document.getElementById('mensajeGanador');
    const nombreGanador = document.getElementById('nombreGanador');
    const agregarManoCard = document.getElementById('agregarManoCard');
    const tituloPartida = document.getElementById('tituloPartida');
    const subtituloPartida = document.getElementById('subtituloPartida');

    async function obtenerPartida() {
      try {
        const response = await fetch(`/api/partidas/${partidaId}`);
        if (!response.ok) {
          throw new Error('Partida no encontrada');
        }
        const partida = normalizeParticipantes(await response.json());
        return partida;
      } catch (error) {
        console.error(error);
        alert('No se pudo cargar la partida. Verifica el servidor.');
        return null;
      }
    }

    async function guardarPartida(partida) {
      try {
        const response = await fetch(`/api/partidas/${partidaId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(partida),
        });

        if (!response.ok) {
          throw new Error('Error al guardar la partida');
        }
      } catch (error) {
        console.error(error);
        alert('No se pudo guardar la mano. Verifica el servidor.');
        throw error;
      }
    }

    function activarEstadoFinal(partida, ganador) {
      if (partida.finalizada || ganador) {
        mensajeFinalizada.style.display = 'block';
        agregarManoCard.style.display = 'none';
      }

      if (ganador) {
        nombreGanador.textContent = ganador;
        mensajeGanador.style.display = 'block';
      }
    }

    function renderHistory(partida) {
      const el=document.getElementById('historialManos');el.textContent='';
      partida.manos.forEach((mano,index)=>{
        const row=document.createElement('div');row.className='history-row';
        const title=document.createElement('span');title.textContent='Mano '+(index+1)+' · '+partida.participantes.map(n=>n+': '+(mano[n+'_puntos']||0)+' pts').join(' · ');
        const edit=document.createElement('button');edit.type='button';edit.textContent='Editar';edit.disabled=partida.finalizada;edit.onclick=()=>editHand(partida,index);
        const remove=document.createElement('button');remove.type='button';remove.textContent='Anular';remove.disabled=partida.finalizada;remove.onclick=()=>removeHand(partida,index);
        row.append(title,edit,remove);el.appendChild(row);
      });if(!partida.manos.length)el.textContent='Todavía no hay manos cargadas.';
    }
    async function persistHistory(partida){
      const winners=GAME.winner(partida);partida.finalizada=winners.length>0;partida.ganador=winners.join(' / ')||null;
      await guardarPartida(partida);window.location.reload();
    }
    async function removeHand(partida,index){
      if(!confirm('¿Anular la mano '+(index+1)+'?'))return;
      partida.manos.splice(index,1);try{await persistHistory(partida);}catch(e){}
    }
    async function editHand(partida,index){
      const old=partida.manos[index],updated={...old};
      for(const name of partida.participantes){
        const miles=prompt(name+' — recorrido (0 a 1000)',String(old[name+'_recorrido']||0));if(miles===null)return;
        const safe=prompt(name+' — seguridades (0 a 4)',String(old[name+'_seguridades']||0));if(safe===null)return;
        updated[name+'_recorrido']=miles;updated[name+'_seguridades']=safe;
      }
      try{partida.manos[index]=GAME.hand(partida.participantes,updated,true);await persistHistory(partida);}catch(e){alert(e.message);}
    }
    async function cargarPartida() {
      const partida = await obtenerPartida();
      if (!partida) {
        tablaResumen.innerHTML = '<p class="empty-state">No se pudo cargar la partida.</p>';
        formPartida.style.display = 'none';
        return;
      }

      tituloPartida.textContent = `Partida: ${partida.nombre}`;
      subtituloPartida.textContent = `${partida.modo} · ${partida.participantes.join(' vs ')}`;
      renderParticipantFields(partida.participantes, formJugadores);
      renderHistory(partida);

      const ganador = renderSummary(partida, tablaResumen);
      if (partida.finalizada || ganador) {
        activarEstadoFinal(partida, ganador);
      }

      formPartida.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (partida.finalizada) {
          alert('Esta partida ya está finalizada.');
          return;
        }

        const formData = new FormData(event.target);
        const nuevaMano = {};
        const invalidos = [];

        partida.participantes.forEach((participante) => {
          const recorrido = toNumber(formData.get(`${participante}_recorrido`), 0);
          const seguridades = toNumber(formData.get(`${participante}_seguridades`), 0);
          if (recorrido < 0 || recorrido > GAME_RULES.maxRecorrido || recorrido % 25 !== 0 || seguridades < 0 || seguridades > 4 || (seguridades !== 4 && formData.has(`${participante}_bonus4seguridades`)) || (recorrido !== 1000 && formData.has(`${participante}_viajeCompleto`))) {
            invalidos.push(participante);
          }

          nuevaMano[`${participante}_recorrido`] = recorrido;
          nuevaMano[`${participante}_seguridades`] = toNumber(formData.get(`${participante}_seguridades`), 0);
          nuevaMano[`${participante}_viajeCompleto`] = parseBoolean(formData.get(`${participante}_viajeCompleto`));
          nuevaMano[`${participante}_tk`] = parseBoolean(formData.get(`${participante}_tk`));
          nuevaMano[`${participante}_bonus4seguridades`] = parseBoolean(formData.get(`${participante}_bonus4seguridades`));
          nuevaMano[`${participante}_viajeSeguro`] = parseBoolean(formData.get(`${participante}_viajeSeguro`));
          nuevaMano[`${participante}_bloqueo`] = parseBoolean(formData.get(`${participante}_bloqueo`));
          nuevaMano[`${participante}_accionDemorada`] = parseBoolean(formData.get(`${participante}_accionDemorada`));
          nuevaMano[`${participante}_alargue`] = parseBoolean(formData.get(`${participante}_alargue`));
          nuevaMano[`${participante}_puntos`] = scoreParticipantHand(participante, nuevaMano);
        });

        if (invalidos.length > 0) {
          alert(`Los recorridos de ${invalidos.join(', ')} deben estar entre 0 y 1000 y ser múltiplos de 25.`);
          return;
        }

        try { Object.assign(nuevaMano, GAME.hand(partida.participantes, nuevaMano, true)); }
        catch (error) { alert(error.message); return; }
        partida.manos.push(nuevaMano);

        const totals = getTotales(partida);
        const maxPuntos = Math.max(...Object.values(totals), 0);
        const ganador = maxPuntos >= GAME_RULES.ganadorMeta ? Object.entries(totals).filter(([, puntos]) => puntos === maxPuntos).map(([nombre]) => nombre).join(' / ') : null;
        if (ganador) {
          partida.finalizada = true;
          partida.ganador = ganador;
        }

        try {
          await guardarPartida(partida);
        } catch (error) {
          return;
        }
        alert(ganador ? `🎉 ¡Felicidades! El ganador es: ${ganador} 🏆` : 'Mano agregada exitosamente.');
        window.location.reload();
      });
    }

    cargarPartida();
  }
});
