var datos=require("./cad.js"); 
var correo=require("./email.js"); 
var bcrypt = require('bcrypt');

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
this.loginUsuario = function (obj, callback) {

    // Solo puede iniciar sesión si confirmada = true
    this.cad.buscarUsuario(
        { email: obj.email, confirmada: true },
        function (usr) {
          bcrypt.compare(obj.password, usr.password).then(esCorrecta => {
          if (esCorrecta) callback(usr)
          else callback({ email: -1 })
})
         
        }
    );
};


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

  this.confirmarUsuario = function (obj, callback) { 
      let modelo = this; 

      this.cad.buscarUsuario(
          { email: obj.email, confirmada: false, key: obj.key },
          function (usr) { 
              if (usr) { 
                  usr.confirmada = true; 

                  modelo.cad.actualizarUsuario(usr, function (res) { 
                      callback({ email: res.email }); 
                  }); 
              } 
              else { 
                  callback({ email: -1 }); 
              } 
          }
      ); 
  };




this.registrarUsuario = function (obj, callback) {
  let modelo = this;

  if (!obj.nick) {
    obj.nick = obj.email;
  }

  // ¿Existe ya ese email?
  // HACEMOS LA FUNCIÓN CALLBACK ASÍNCRONA (async)
  this.cad.buscarUsuario({ email: obj.email }, async function(usr) { 
    console.log(usr);
    if (!usr) {
      // Campos de confirmación (Punto 2.6)
      let key = Date.now().toString(); // Usamos let, no var
      obj.confirmada = false;
      obj.key = key;
      console.log("Registrando nuevo usuario:", obj.email);

      //CIFRADO DE LA CLAVE 
      const saltRounds = 10;
      const hash = await bcrypt.hash(obj.password, saltRounds);
      obj.password = hash; // Reemplazar la clave en texto plano con el hash

      // 2. Insertar usuario
      modelo.cad.insertarUsuario(obj, function (resCad) {
        
        // (El resto de tu lógica de inserción y comprobación)
        if (!resCad || !resCad.ok) {
          console.error("Error insertando usuario en BD", resCad);
          callback({ nick: -1 });
          return;
        }

        console.log("Usuario insertado en MongoDB:", obj.email);

        // Enviar email de confirmación (Punto 2.6)
        correo.enviarEmail(obj.email, obj.key, "Confirmar cuenta")
          .then(function () {
            console.log("Email enviado a:", obj.email);
          })
          .catch(function (err) {
            console.error("Error enviando email:", err);
          });

        callback({ nick: obj.email });
      });
    }
    else {
      console.log("Email ya registrado:", obj.email);
      callback({ nick: -1 });
    }
  });
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

function Partida(codigo){
  this.codigo = codigo;
  this.jugadores = [];
  this.maxJug = 2;
}

module.exports.Partida = Partida;


// EXPORTA para Node
module.exports.Sistema = Sistema;

