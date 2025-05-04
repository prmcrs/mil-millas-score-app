const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Cambiar la ruta para que el archivo esté en la carpeta "partidas"
const DATA_FILE = path.join(__dirname, 'partidas', 'partidas.json');

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Crear la carpeta "partidas" si no existe
if (!fs.existsSync(path.join(__dirname, 'partidas'))) {
  fs.mkdirSync(path.join(__dirname, 'partidas'));
}

// Obtener partidas
app.get('/api/partidas', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo:', err);
      return res.status(500).json({ error: 'Error al leer el archivo' });
    }
    res.json(JSON.parse(data || '[]'));
  });
});

// Guardar partidas
app.post('/api/partidas', (req, res) => {
  const nuevaPartida = req.body;
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo:', err);
      return res.status(500).json({ error: 'Error al leer el archivo' });
    }
    const partidas = JSON.parse(data || '[]');
    partidas.push(nuevaPartida);
    fs.writeFile(DATA_FILE, JSON.stringify(partidas, null, 2), (err) => {
      if (err) {
        console.error('Error al escribir el archivo:', err);
        return res.status(500).json({ error: 'Error al escribir el archivo' });
      }
      res.status(201).json(nuevaPartida);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
