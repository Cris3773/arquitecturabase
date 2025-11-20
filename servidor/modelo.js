const datos=require("./cad.js"); 

function Sistema(test) {
  this.usuarios = {};
  this.cad=new datos.CAD();
  let self = this;
  this.cad.conectar(function(db){ 
  console.log("Conectado a Mongo Atlas"); 
  }); 
  this.usuarioGoogle=function(usr,callback){ 
    self.cad.buscarOCrearUsuario(usr, function(obj){ 
      console.log("usuarioGoogle:", obj)
      self.agregarUsuario(obj.email); //lista usuariios vivos
      callback(obj);
    }); 
  }  

this.agregarUsuario = function (nick) {
  let res = { "nick": -1 };
  const nuevoNick = nick.toLowerCase();
  const claves = Object.keys(this.usuarios);

  // Si no hay otro con el mismo nombre (ignorando mayúsculas)
  if (!claves.some(k => k.toLowerCase() === nuevoNick)) {
    this.usuarios[nick] = new Usuario(nick);
    res.nick = nick;
  } else {
    console.log("El nick " + nick + " está en uso");
  }

  return res;
};
// --- REGISTRAR USUARIO LOCAL ---


 this.registrarUsuario = function (obj, callback) {
  // obj viene de request.body -> { email, password }

  // Delegamos todo en la CAD, que ya sabe trabajar con usuariosLocal
    this.cad.registrarUsuario(
      {
        email: obj.email,
        password: obj.password
      },
      function (res) {
        // res tendrá forma: { ok: true, email: "..."} o { ok: false, msg: "..." }
        callback(res);
      }
    );
  };


  this.obtenerUsuarios = function () {
    return this.usuarios;
  };

  this.usuarioActivo = function (nick) {
  const buscado = nick.toLowerCase();
  const claves = Object.keys(this.usuarios);
  return claves.some(k => k.toLowerCase() === buscado);
  };


  this.eliminarUsuario = function (nick) {
  const buscado = nick.toLowerCase();
  for (const k of Object.keys(this.usuarios)) {
    if (k.toLowerCase() === buscado) {
      delete this.usuarios[k];
      return true;  // eliminado
    }
  }
  return false;     // no existía
 };


  this.numeroUsuarios = function () {
    return Object.keys(this.usuarios).length;
  };
}

function Usuario(nick) {
  this.nick = nick;
}

// EXPORTA para Node
module.exports.Sistema = Sistema;

