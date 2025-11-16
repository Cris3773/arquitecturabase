const bodyParser = require("body-parser");
const passport = require("passport");
const cookieSession = require("cookie-session");
require("./servidor/passport-setup.js"); 

const express = require("express");
const path = require("path");
const modelo = require("./servidor/modelo.js");

const app = express();
const PORT = process.env.PORT || 3000;

let sistema = new modelo.Sistema({test:false})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/cliente", express.static(path.join(__dirname, "cliente")));
app.use(cookieSession({ 
  name: 'Sistema', 
  keys: ['key1', 'key2']
}));

app.use(passport.initialize());
app.use(passport.session());


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "cliente", "index.html"));
});
app.get("/auth/google",passport.authenticate('google', { scope: ['profile','email'] }));
app.get('/google/callback',  
  passport.authenticate('google', { failureRedirect: '/fallo' }), 
  function(req, res) { 
  res.redirect('/good'); 
}); 
app.get("/good", function(request,response){ 
  let email=request.user.emails[0].value; 
  sistema.usuarioGoogle({"email":email},function(obj){ 
   response.cookie('nick',obj.email); 
   response.redirect('/'); 
  }); 
}); 

app.get("/fallo",function(request,response){ 
response.send({nick:"nook"}) 
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
app.post(
  '/oneTap/callback',
  passport.authenticate('google-one-tap', { failureRedirect: '/fallo' }),
  function(req, res) {
    res.redirect('/good');
  }
);


app.listen(PORT, "0.0.0.0", () => console.log(`Listening on ${PORT}`));
