const express = require("express");
const path = require("path");
const modelo = require("./servidor/modelo.js");

const app = express();
const PORT = process.env.PORT || 3000;

let sistema = new modelo.Sistema();

// === Servir archivos estáticos del cliente ===
// Esto permite acceder a: /cliente/clienteRest.js, /cliente/controlWeb.js, etc.
app.use(express.static(path.join(__dirname, "cliente")));

// === Ruta raíz ===
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "cliente", "index.html"));
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

// === Arranque del servidor ===
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});



