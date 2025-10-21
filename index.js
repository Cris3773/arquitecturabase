const express = require("express");
const path = require("path");
const modelo = require("./servidor/modelo.js");

const app = express();
const PORT = process.env.PORT || 3000;

let sistema = new modelo.Sistema();


app.use("/cliente", express.static(path.join(__dirname, "cliente")));


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "cliente", "index.html"));
});


app.get("/agregarUsuario/:nick", (req, res) => {
  const r = sistema.agregarUsuario(req.params.nick);
  res.json(r);
});
app.get("/obtenerUsuarios", (req, res) => res.json(sistema.obtenerUsuarios()));
app.get("/usuarioActivo/:nick", (req, res) =>
  res.json({ nick: req.params.nick, activo: sistema.usuarioActivo(req.params.nick) })
);
app.get("/numeroUsuarios", (req, res) => res.json({ num: sistema.numeroUsuarios() }));
app.get("/eliminarUsuario/:nick", (req, res) => {
  sistema.eliminarUsuario(req.params.nick);
  res.json({ nick: req.params.nick, eliminado: true });
});

app.listen(PORT, "0.0.0.0", () => console.log(`Listening on ${PORT}`));
