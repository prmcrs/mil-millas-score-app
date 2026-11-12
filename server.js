const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const GAME = require('./score');
const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'partidas', 'partidas.json');

app.use((req,res,next)=>{if(req.path.startsWith('/api/'))return next();const allowed=['/','/index.html','/partida.html','/style.css','/app.js','/score.js'];if(allowed.includes(req.path)||req.path.startsWith('/images/'))return next();return res.status(404).end();});
app.use(express.static(path.join(__dirname), { dotfiles: 'deny', index: false }));
app.use(express.json({limit:'256kb'}));
const APP_PASSWORD=process.env.APP_PASSWORD;
if(!APP_PASSWORD){console.error('Configurá APP_PASSWORD antes de iniciar Mil Millas Score.');process.exit(1);}
const sessions=new Map();
function cookie(req,name){const part=(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='));return part?part.slice(name.length+1):'';}
function authorized(req){const token=cookie(req,'mm_session');const expires=sessions.get(token);if(!expires)return false;if(expires<Date.now()){sessions.delete(token);return false;}return true;}
app.post('/api/login',(req,res)=>{const given=typeof req.body.password==='string'?req.body.password:'';const a=Buffer.from(given),b=Buffer.from(APP_PASSWORD);if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return res.status(401).json({error:'Contraseña incorrecta'});const token=crypto.randomBytes(32).toString('hex');sessions.set(token,Date.now()+12*60*60*1000);res.setHeader('Set-Cookie',`mm_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200${req.secure?'; Secure':''}`);res.json({ok:true});});
app.post('/api/logout',(req,res)=>{sessions.delete(cookie(req,'mm_session'));res.setHeader('Set-Cookie','mm_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');res.json({ok:true});});
app.get('/api/session',(req,res)=>res.json({authenticated:authorized(req),required:true}));
app.use('/api/partidas',(req,res,next)=>authorized(req)?next():res.status(401).json({error:'Iniciá sesión para continuar'}));
app.use('/api/partidas',(req,res,next)=>{if(!['GET','HEAD'].includes(req.method)&&req.headers.origin){try{const origin=new URL(req.headers.origin),host=req.headers.host;if(origin.host!==host)return res.status(403).json({error:'Origen no autorizado'});}catch(e){return res.status(403).json({error:'Origen no autorizado'});}}next();});

if (!fs.existsSync(DATA_FILE)) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, '[]', 'utf8');
}

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
      const segurosKey = `${participante}_seguridades`;
      const viajeCompletoKey = `${participante}_viajeCompleto`;
      const tkKey = `${participante}_tk`;
      const bonus4Key = `${participante}_bonus4seguridades`;
      const viajeSeguroKey = `${participante}_viajeSeguro`;
      const bloqueoKey = `${participante}_bloqueo`;
      const accionDemoradaKey = `${participante}_accionDemorada`;
      const alargueKey = `${participante}_alargue`;

      const recorrido = Number(manoNormalizada[recorridoKey] ?? 0);
      const seguridades = Number(manoNormalizada[segurosKey] ?? 0);
      const viajeCompleto = Boolean(manoNormalizada[viajeCompletoKey]);
      const tk = Boolean(manoNormalizada[tkKey]);
      const bonus4 = Boolean(manoNormalizada[bonus4Key]);
      const viajeSeguro = Boolean(manoNormalizada[viajeSeguroKey]);
      const bloqueo = Boolean(manoNormalizada[bloqueoKey]);
      const accionDemorada = Boolean(manoNormalizada[accionDemoradaKey]);
      const alargue = Boolean(manoNormalizada[alargueKey]);

      const puntos =
        recorrido +
        (viajeCompleto ? 400 : 0) +
        (tk ? 300 : 0) +
        seguridades * 100 +
        (bonus4 ? 300 : 0) +
        (viajeSeguro ? 300 : 0) +
        (bloqueo ? 500 : 0) +
        (accionDemorada ? 300 : 0) +
        (alargue ? 200 : 0);

      manoNormalizada[recorridoKey] = recorrido;
      manoNormalizada[segurosKey] = seguridades;
      manoNormalizada[viajeCompletoKey] = viajeCompleto;
      manoNormalizada[tkKey] = tk;
      manoNormalizada[bonus4Key] = bonus4;
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

function readPartidas() {
  try {
    const contenido = fs.readFileSync(DATA_FILE, 'utf8') || '[]';
    const partidas = JSON.parse(contenido);
    return Array.isArray(partidas) ? partidas.map(normalizeParticipantes).filter(Boolean) : [];
  } catch (error) {
    console.error('Error al leer el archivo de datos:', error.message);
    throw new Error('No se pudo leer el archivo de datos. Verifica los permisos o la existencia del archivo.');
  }
}

function writePartidas(partidas) {
  try {
    const datos = partidas.map(normalizeParticipantes).filter(Boolean);
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(datos, null, 2));
    fs.renameSync(tempFile, DATA_FILE);
  } catch (error) {
    console.error('Error al escribir en el archivo de datos:', error.message);
    throw new Error('No se pudo guardar en el archivo de datos. Verifica los permisos.');
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/partidas', (req, res) => {
  try {
    res.json(readPartidas());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/partidas/:id', (req, res) => {
  try {
    const partidas = readPartidas();
    const partida = partidas.find((p) => String(p.id) === String(req.params.id));

    if (!partida) {
      return res.status(404).json({ error: 'Partida no encontrada' });
    }

    res.json(partida);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/partidas', (req, res) => {
  try {
    const partidas = readPartidas();
    const nuevaPartida = normalizeParticipantes(req.body);
    if(nuevaPartida && (!Array.isArray(nuevaPartida.manos)||nuevaPartida.manos.length!==0))return res.status(400).json({error:'La partida nueva no puede incluir manos'});

    if (!nuevaPartida || !nuevaPartida.id || !nuevaPartida.nombre || !Array.isArray(nuevaPartida.participantes) || nuevaPartida.participantes.length === 0) {
      return res.status(400).json({ error: 'Datos de partida incompletos' });
    }

    if (partidas.some((p) => String(p.id) === String(nuevaPartida.id))) {
      return res.status(409).json({ error: 'Ya existe una partida con ese ID' });
    }
    if (nuevaPartida.participantes.length < 2 || nuevaPartida.participantes.length > 6 || nuevaPartida.participantes.some(n=>typeof n!=='string'||!n.trim()||n.length>60) || new Set(nuevaPartida.participantes.map((n) => String(n).trim().toLowerCase())).size !== nuevaPartida.participantes.length) {
      return res.status(400).json({ error: 'Se requieren entre 2 y 6 participantes con nombres distintos' });
    }
    nuevaPartida.version=1;
    partidas.push(nuevaPartida);
    writePartidas(partidas);

    res.status(201).json(nuevaPartida);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/partidas/:id', (req, res) => {
  try {
    const partidas = readPartidas();
    const id = req.params.id;
    const partidaActualizada = normalizeParticipantes(req.body);

    const index = partidas.findIndex((p) => String(p.id) === String(id));
    if (index === -1) {
      return res.status(404).json({ error: 'Partida no encontrada' });
    }

    if (!partidaActualizada || String(partidaActualizada.id) !== String(id) || !Array.isArray(partidaActualizada.participantes) || !Array.isArray(partidaActualizada.manos)) {
      return res.status(400).json({ error: 'Datos de partida inválidos' });
    }
    if (Number(req.body.version||0)!==Number(partidas[index].version||0)) return res.status(409).json({error:'La partida cambió en otra sesión. Recargá antes de guardar.'});
    if (partidaActualizada.modo!==partidas[index].modo || partidaActualizada.nombre!==partidas[index].nombre) return res.status(400).json({error:'No se pueden cambiar los datos principales de la partida'});
    if (partidaActualizada.participantes.join('\u0000') !== partidas[index].participantes.join('\u0000')) return res.status(400).json({error:'No se pueden cambiar participantes existentes'});
    if (partidaActualizada.manos.length > 500) return res.status(400).json({error:'Demasiadas manos'});
    try { partidaActualizada.manos = partidaActualizada.manos.map(m=>GAME.hand(partidaActualizada.participantes,m,true)); }
    catch(error){return res.status(400).json({error:error.message});}
    const winners=GAME.winner(partidaActualizada);
    partidaActualizada.finalizada=winners.length>0;
    partidaActualizada.ganador=winners.join(' / ')||null;
    partidaActualizada.version=Number(partidas[index].version||0)+1;
    partidas[index] = partidaActualizada;
    writePartidas(partidas);

    res.json(partidaActualizada);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
