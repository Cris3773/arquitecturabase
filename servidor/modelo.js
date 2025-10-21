function Sistema() {
  this.usuarios = {};

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

