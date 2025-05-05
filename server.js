const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; 
const DATA_FILE = path.join(__dirname, 'partidas', 'partidas.json');

// Middleware para servir archivos estáticos desde el root del sitio
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Verificar si el archivo JSON existe, si no, crearlo vacío
if (!fs.existsSync(DATA_FILE)) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true }); // Crear carpeta si no existe
  fs.writeFileSync(DATA_FILE, '[]', 'utf8'); // Crear archivo vacío
}

// Helper to read and write JSON with error handling
function readPartidas() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (error) {
    console.error('Error al leer el archivo de datos:', error.message);
    throw new Error('No se pudo leer el archivo de datos. Verifica los permisos o la existencia del archivo.');
  }
}

function writePartidas(partidas) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(partidas, null, 2));
  } catch (error) {
    console.error('Error al escribir en el archivo de datos:', error.message);
    throw new Error('No se pudo guardar en el archivo de datos. Verifica los permisos.');
  }
}

// Ruta para servir el archivo principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Obtener todas las partidas
app.get('/api/partidas', (req, res) => {
  try {
    const partidas = readPartidas();
    res.json(partidas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener una partida por ID
app.get('/api/partidas/:id', (req, res) => {
  try {
    const partidas = readPartidas();
    const partida = partidas.find(p => p.id == req.params.id);
    if (!partida) {
      return res.status(404).json({ error: 'Partida no encontrada' });
    }
    res.json(partida);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Guardar una nueva partida
app.post('/api/partidas', (req, res) => {
  try {
    const partidas = readPartidas();
    const nuevaPartida = req.body;

    if (!nuevaPartida.id || !nuevaPartida.nombre || !nuevaPartida.participantes) {
      return res.status(400).json({ error: 'Datos de partida incompletos' });
    }

    partidas.push(nuevaPartida);
    writePartidas(partidas);

    res.status(201).json(nuevaPartida);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar una partida existente
app.put('/api/partidas/:id', (req, res) => {
  try {
    const partidas = readPartidas();
    const id = req.params.id;
    const partidaActualizada = req.body;

    const index = partidas.findIndex(p => p.id == id);
    if (index === -1) {
      return res.status(404).json({ error: 'Partida no encontrada' });
    }

    partidas[index] = partidaActualizada;
    writePartidas(partidas);

    res.send('Partida actualizada');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
