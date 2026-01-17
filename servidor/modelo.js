var datos=require("./cad.js"); 
var correo=require("./email.js"); 
var bcrypt = require('bcrypt');

function Sistema(test) {
  this.usuarios = {};
  this.cad=new datos.CAD();
  let self = this;
  this.partidas = {};
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

  this.obtenerCodigo = function(){
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  this.crearPartida = function(email){
  // Buscar usuario por email
  let usuario = this.usuarios[email];

  // Si el usuario no existe, lo creamos
  if (!usuario){
    this.agregarUsuario(email);
    usuario = this.usuarios[email];
  }

  if (!usuario){
    return { codigo: -1 }; // usuario no existe
  }

  // Obtener código único
  let codigo = this.obtenerCodigo();

  // Crear partida con propietario
  let partida = new Partida(codigo, email);

  // Añadir usuario como jugador
  partida.jugadores.push(usuario);

  // Guardar la partida en el sistema
  this.partidas[codigo] = partida;

  return { codigo: partida.codigo, numJugadores: partida.jugadores.length, iniciada: partida.iniciada };
}

  this.unirAPartida = function(email, codigo){

    let usuario = this.usuarios[email];

    // Si el usuario no existe, lo creamos
    if (!usuario){
      this.agregarUsuario(email);
      usuario = this.usuarios[email];
    }

    let partida = this.partidas[codigo];

    if (!usuario || !partida){
      return { ok: false, msg: "Usuario o partida no existe" };
    }

    if (partida.jugadores.length >= partida.maxJug){
      return { ok: false, msg: "La partida está completa" };
    }

    // Verificar si el usuario ya está en la partida
    if (partida.jugadores.some(j => j.nick === email)){
      return { ok: false, msg: "Ya estás en esta partida" };
    }

    partida.jugadores.push(usuario);

    return { ok: true, partida: partida };
  }

  this.obtenerPartidasDisponibles = function(){
  let lista = [];

  console.log("obtenerPartidasDisponibles - Partidas almacenadas:", Object.keys(this.partidas));

  for (let codigo in this.partidas){
    let partida = this.partidas[codigo];

    console.log("Revisando partida:", codigo, "iniciada:", partida.iniciada);

    // comprobar si la partida NO ha iniciado
    if (!partida.iniciada){

      // obtener el email del creador (primer jugador)
      let creador = partida.jugadores[0].nick;
      
      // obtener lista de nicks de jugadores
      let jugadores = partida.jugadores.map(j => j.nick);

      // crear objeto JSON con los datos
      let obj = {
        codigo: codigo,
        creador: creador,
        propietario: partida.propietario,
        numJugadores: partida.jugadores.length,
        maxJug: partida.maxJug,
        jugadores: jugadores
      };

      // meter el objeto en la lista
      lista.push(obj);
    }
  }

  console.log("Partidas disponibles a devolver:", lista);
  return lista;
}

  this.obtenerTodasLasPartidas = function(){
    let lista = [];

    for (let codigo in this.partidas){
      let partida = this.partidas[codigo];

      // obtener lista de nicks de jugadores
      let jugadores = partida.jugadores.map(j => j.nick);

      // crear objeto JSON con los datos
      let obj = {
        codigo: codigo,
        propietario: partida.propietario,
        numJugadores: partida.jugadores.length,
        maxJug: partida.maxJug,
        jugadores: jugadores,
        iniciada: partida.iniciada,
        tablero: partida.tablero,
        turno: partida.turno,
        ganador: partida.ganador,
        celdasGanadoras: partida.celdasGanadoras
      };

      // meter el objeto en la lista
      lista.push(obj);
    }

    return lista;
  }

  this.iniciarPartida = function(email, codigo){
    let partida = this.partidas[codigo];

    if (!partida){
      return { ok: false, msg: "Partida no existe" };
    }

    // Solo el propietario puede iniciar
    if (partida.propietario !== email){
      return { ok: false, msg: "Solo el propietario puede iniciar" };
    }

    // Necesita al menos 2 jugadores
    if (partida.jugadores.length < 2){
      return { ok: false, msg: "Se necesita al menos 2 jugadores" };
    }

    partida.iniciada = true;
    return { ok: true, msg: "Partida iniciada" };
  }

  this.abandonarPartida = function(email, codigo){
    let partida = this.partidas[codigo];

    if (!partida){
      return { ok: false, msg: "Partida no existe" };
    }

    // No se puede abandonar si ya comenzó
    if (partida.iniciada){
      return { ok: false, msg: "No puedes abandonar una partida en curso" };
    }

    // Buscar y eliminar el usuario
    partida.jugadores = partida.jugadores.filter(j => j.nick !== email);

    // Si no quedan jugadores, eliminar la partida
    if (partida.jugadores.length === 0){
      delete this.partidas[codigo];
    }

    return { ok: true, msg: "Abandonaste la partida" };
  }

  this.hacerMovimiento = function(email, codigo, fila, columna){
    let partida = this.partidas[codigo];

    if (!partida){
      return { ok: false, msg: "Partida no existe" };
    }

    if (!partida.iniciada){
      return { ok: false, msg: "La partida no ha comenzado" };
    }

    // Determinar qué número de jugador es
    let numJugador = 0;
    if (partida.propietario === email) numJugador = 1;
    else if (partida.jugadores.length > 1 && partida.jugadores[1].nick === email) numJugador = 2;

    if (numJugador === 0){
      return { ok: false, msg: "No estás en esta partida" };
    }

    if (partida.turno !== numJugador){
      return { ok: false, msg: "No es tu turno" };
    }

    if (fila < 0 || fila > 2 || columna < 0 || columna > 2){
      return { ok: false, msg: "Posición inválida" };
    }

    if (partida.tablero[fila][columna] !== 0){
      return { ok: false, msg: "Esa casilla ya está ocupada" };
    }

    // Hacer el movimiento
    partida.tablero[fila][columna] = numJugador;

    // Verificar ganador
    let resultadoGanador = this.verificarGanador(partida.tablero);
    if (resultadoGanador){
      partida.ganador = resultadoGanador.ganador === 3 ? 'empate' : resultadoGanador.ganador;
      partida.celdasGanadoras = resultadoGanador.celdas;
    }

    // Cambiar turno
    partida.turno = partida.turno === 1 ? 2 : 1;

    return { 
      ok: true, 
      tablero: partida.tablero,
      turno: partida.turno,
      ganador: partida.ganador,
      celdasGanadoras: partida.celdasGanadoras
    };
  }

  this.verificarGanador = function(tablero){
    // Verificar filas
    for (let i = 0; i < 3; i++){
      if (tablero[i][0] !== 0 && tablero[i][0] === tablero[i][1] && tablero[i][1] === tablero[i][2]){
        return {
          ganador: tablero[i][0],
          celdas: [[i, 0], [i, 1], [i, 2]]
        };
      }
    }

    // Verificar columnas
    for (let j = 0; j < 3; j++){
      if (tablero[0][j] !== 0 && tablero[0][j] === tablero[1][j] && tablero[1][j] === tablero[2][j]){
        return {
          ganador: tablero[0][j],
          celdas: [[0, j], [1, j], [2, j]]
        };
      }
    }

    // Verificar diagonales
    if (tablero[0][0] !== 0 && tablero[0][0] === tablero[1][1] && tablero[1][1] === tablero[2][2]){
      return {
        ganador: tablero[0][0],
        celdas: [[0, 0], [1, 1], [2, 2]]
      };
    }

    if (tablero[0][2] !== 0 && tablero[0][2] === tablero[1][1] && tablero[1][1] === tablero[2][0]){
      return {
        ganador: tablero[0][2],
        celdas: [[0, 2], [1, 1], [2, 0]]
      };
    }

    // Verificar empate
    let estaLleno = true;
    for (let i = 0; i < 3; i++){
      for (let j = 0; j < 3; j++){
        if (tablero[i][j] === 0){
          estaLleno = false;
          break;
        }
      }
    }

    if (estaLleno) return { ganador: 3, celdas: [] }; // 3 = empate

    return null; // Juego continúa
  }


}

function Usuario(nick) {
  this.nick = nick;
}

function Partida(codigo, propietario){
  this.codigo = codigo;
  this.propietario = propietario;
  this.jugadores = [];
  this.maxJug = 2;
  this.iniciada = false;
  
  // Tres en raya
  this.tablero = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ]; // 0 = vacío, 1 = jugador 1, 2 = jugador 2
  this.turno = 1; // 1 o 2
  this.ganador = null; // null, 1, 2 o 'empate'
  this.celdasGanadoras = []; // [[fila, col], [fila, col], [fila, col]] - celdas de la línea ganadora
}

module.exports.Partida = Partida;


// EXPORTA para Node
module.exports.Sistema = Sistema;

