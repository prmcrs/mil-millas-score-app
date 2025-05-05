const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Updated to use process.env.PORT
const DATA_FILE = path.join(__dirname, 'partidas.json');

app.use(express.json());

// Obtener todas las partidas
app.get('/api/partidas', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error al leer el archivo de datos');
    res.json(JSON.parse(data || '[]'));
  });
});

// Obtener una partida por ID
app.get('/api/partidas/:id', (req, res) => {
  const id = req.params.id;
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error al leer el archivo de datos');
    const partidas = JSON.parse(data || '[]');
    const partida = partidas.find(p => p.id == id);
    if (!partida) return res.status(404).send('Partida no encontrada');
    res.json(partida);
  });
});

// Guardar una nueva partida
app.post('/api/partidas', (req, res) => {
  const nuevaPartida = req.body;
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error al leer el archivo de datos');
    const partidas = JSON.parse(data || '[]');
    partidas.push(nuevaPartida);
    fs.writeFile(DATA_FILE, JSON.stringify(partidas, null, 2), err => {
      if (err) return res.status(500).send('Error al guardar la partida');
      res.status(201).send('Partida guardada');
    });
  });
});

// Actualizar una partida existente
app.put('/api/partidas/:id', (req, res) => {
  const id = req.params.id;
  const partidaActualizada = req.body;
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error al leer el archivo de datos');
    let partidas = JSON.parse(data || '[]');
    partidas = partidas.map(p => (p.id == id ? partidaActualizada : p));
    fs.writeFile(DATA_FILE, JSON.stringify(partidas, null, 2), err => {
      if (err) return res.status(500).send('Error al actualizar la partida');
      res.send('Partida actualizada');
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
