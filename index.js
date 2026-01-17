const bodyParser = require("body-parser");
const passport = require("passport");
const cookieSession = require("cookie-session");
const fs = require("fs");
const express = require("express");
const path = require("path");
const modelo = require("./servidor/modelo.js");
const moduloWS = require("./servidor/servidorWS.js");
require("dotenv").config();
require("./servidor/passport-setup.js");

const app = express();
const PORT = process.env.PORT || 3000;
const httpServer = require("http").Server(app);
const { Server } = require("socket.io");
const io = new Server(httpServer);
const wsServer = new moduloWS.WSServer(io);
wsServer.lanzarServer();

app.use((req, res, next) => {
  console.log("REQ:", req.method, req.url);
  next();
});

// ----- MODELO -----
let sistema = new modelo.Sistema({ test: false });

// ----- ESTRATEGIA LOCAL (usa sistema.loginUsuario) -----
const LocalStrategy = require("passport-local").Strategy;

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    function (email, password, done) {
      sistema.loginUsuario({ email, password }, function (user) {
        return done(null, user);
      });
    }
  )
);

// ----- MIDDLEWARES -----
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/cliente", express.static(path.join(__dirname, "cliente")));

app.use(
  cookieSession({
    name: "Sistema",
    keys: ["key1", "key2"],
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Middleware para securizar rutas
const haIniciado = function (request, response, next) {
  if (request.user) {
    // Hay usuario en sesión (Google / local / One Tap)
    next(); // dejamos pasar
  } else {
    // No hay nadie logueado -> a la portada (login)
    response.redirect("/");
  }
};


// ======================================================
//                 RUTAS  (BACKEND)
// ======================================================

// ---------- REGISTRO LOCAL ----------
app.post("/registrarUsuario", function (request, response) {
  console.log("POST /registrarUsuario", request.body);

  sistema.registrarUsuario(request.body, function (res) {
    console.log("Resultado registrarUsuario en modelo:", res);

    // res = { nick: "correo" }  ó  { nick: -1 }
    if (res && res.nick && res.nick !== -1) {
      response.json(res);
    } else {
      response
        .status(400)
        .json({ msg: "No se ha podido registrar (email ocupado o error)." });
    }
  });
});

// ---------- GOOGLE OAUTH ----------
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/fallo" }),
  function (req, res) {
    res.redirect("/good");
  }
);

app.get("/good", function (request, response) {
  let email = request.user.emails[0].value;
  sistema.usuarioGoogle({ email: email }, function (obj) {
    response.cookie("nick", obj.email);
    response.redirect("/");
  });
});

// ---------- CONFIRMAR USUARIO (EMAIL) ----------
app.get("/confirmarUsuario/:email/:key", function (request, response) {
  let email = request.params.email;
  let key = request.params.key;

  sistema.confirmarUsuario({ email: email, key: key }, function (usr) {
    if (usr.email !== -1) {
      response.cookie("nick", usr.email);
    }
    response.redirect("/");
  });
});

// ---------- ONE TAP ----------
app.post(
  "/oneTap/callback",
  passport.authenticate("google-one-tap", { failureRedirect: "/fallo" }),
  function (req, res) {
    res.redirect("/good");
  }
);

// ---------- LOGIN LOCAL ----------
app.post(
  "/loginUsuario",
  passport.authenticate("local", {
    failureRedirect: "/fallo",
    successRedirect: "/ok",
  })
);

// ÉXITO LOGIN LOCAL
app.get("/ok", function (request, response) {
  response.send({ nick: request.user.email });
});

// FALLO LOGIN (local / google / onetap)
app.get("/fallo", function (req, res) {
  res.send({ nick: -1 });
});

// ======================================================
//       RUTAS HTML + API USUARIOS DEL SISTEMA
// ======================================================

// Página principal: devuelve cliente/index.html inyectando variables
app.get("/", (req, res) => {
  let contenido = fs.readFileSync(
    path.join(__dirname, "cliente/index.html"),
    "utf8"
  );

  contenido = contenido.replace(
    "%%GOOGLE_CLIENT_ID%%",
    process.env.GOOGLE_CLIENT_ID
  );

  contenido = contenido.replace(
    "%%GOOGLE_ONETAP_CALLBACK%%",
    process.env.BASE_URL + "/oneTap/callback"
  );

  res.setHeader("Content-Type", "text/html");
  res.send(contenido);
});

// Formulario de registro (solo HTML)
app.get("/registro.html", (req, res) => {
  res.sendFile(path.join(__dirname, "cliente/registro.html"));
});

// API "usuarios vivos" en memoria (para la tarjeta derecha)
app.get("/agregarUsuario/:nick", (req, res) => {
  const r = sistema.agregarUsuario(req.params.nick);
  res.json(r);
});

app.get("/obtenerUsuarios",haIniciado, (req, res) =>
  res.json(sistema.obtenerUsuarios())
);

app.get("/usuarioActivo/:nick",haIniciado, (req, res) =>
  res.json({ nick: req.params.nick, activo: sistema.usuarioActivo(req.params.nick) })
); 

app.get("/numeroUsuarios", haIniciado, (req, res) =>
  res.json({ num: sistema.numeroUsuarios() })
);

app.get("/eliminarUsuario/:nick", haIniciado, (req, res) => {
  sistema.eliminarUsuario(req.params.nick);
  res.json({ nick: req.params.nick, eliminado: true });
});

app.get("/cerrarSesion",haIniciado,function(request,response){ 
let nick=request.user.nick; 
request.logout(); 
response.redirect("/"); 
if (nick){ 
sistema.eliminarUsuario(nick); 
} 
}); 

app.get("/obtenerPartidas", haIniciado, (req, res) => {
  console.log("REQ obtenerPartidas - usuarios en sistema:", Object.keys(sistema.obtenerUsuarios()));
  console.log("REQ obtenerPartidas - partidas en sistema:", Object.keys(sistema.partidas));
  const partidas = sistema.obtenerPartidasDisponibles();
  res.json(partidas);
});

app.get("/crearPartida/:nick", haIniciado, (req, res) => {
  const resultado = sistema.crearPartida(req.params.nick);
  res.json(resultado);
});

app.get("/unirseLaPartida/:nick/:codigo", haIniciado, (req, res) => {
  const resultado = sistema.unirAPartida(req.params.nick, req.params.codigo);
  res.json(resultado);
});

app.get("/iniciarPartida/:nick/:codigo", haIniciado, (req, res) => {
  const resultado = sistema.iniciarPartida(req.params.nick, req.params.codigo);
  res.json(resultado);
});

app.get("/abandonarPartida/:nick/:codigo", haIniciado, (req, res) => {
  const resultado = sistema.abandonarPartida(req.params.nick, req.params.codigo);
  res.json(resultado);
});


// ======================================================
//              ARRANCAR SERVIDOR
// ======================================================
httpServer.listen(PORT, "0.0.0.0", () =>
  console.log(`Listening on ${PORT}`)
);
