const express = require("express");
const fs = require("fs");            // <- necesario para leer el HTML
const path = require("path");
const modelo = require("./servidor/modelo.js"); // si ya integraste el modelo (3.5)

const app = express();
const PORT = process.env.PORT || 3000;

let sistema = new modelo.Sistema();  

// (opcional) servir estáticos de cliente si luego añades JS/CSS en /cliente
app.use("/cliente", express.static(path.join(__dirname, "cliente")));

// RUTA RAÍZ -> devolver cliente/index.html
app.get("/", (req, res) => {
  const contenido = fs.readFileSync(path.join(__dirname, "cliente", "index.html"));
  res.setHeader("Content-Type", "text/html");
  res.send(contenido);
});


app.get("/", (req, res) => {
  res.sendFile(require("path").join(__dirname, "cliente", "index.html"));
});

// === RUTAS REST ===
app.get("/agregarUsuario/:nick", (req, res) => {
  const nick = req.params.nick;
  const r = sistema.agregarUsuario(nick);
  console.log("agregarUsuario", nick, "->", r);
  res.json(r);
});

app.get("/obtenerUsuarios", (req, res) => {
  res.json(sistema.obtenerUsuarios());
});

app.get("/usuarioActivo/:nick", (req, res) => {
  const nick = req.params.nick;
  res.json({ nick, activo: sistema.usuarioActivo(nick) });
});

app.get("/numeroUsuarios", (req, res) => {
  res.json({ num: sistema.numeroUsuarios() });
});

app.get("/eliminarUsuario/:nick", (req, res) => {
  const nick = req.params.nick;
  sistema.eliminarUsuario(nick);
  res.json({ nick, eliminado: true });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});


