function WSServer(io){ 
  this.io = io;

  this.lanzarServer = function(){ 
    io.on('connection', function(socket){ 
      console.log("Cliente conectado por WebSocket");

      // Evento para todos los clientes
      io.emit("notificacion", {
        msg: "Un cliente se ha conectado al sistema"
      });
    }); 
  };

  this.notificarPartidaCreada = function(partida) {
    io.emit("partidaCreada", partida);
  };

  this.notificarUsuarioUnido = function(codigo, jugadores) {
    io.emit("usuarioUnido", { codigo, jugadores });
  };

  this.notificarPartidaIniciada = function(codigo) {
    io.emit("partidaIniciada", { codigo });
  };

  this.notificarUsuarioAbandono = function(codigo, jugadores) {
    io.emit("usuarioAbandono", { codigo, jugadores });
  };

  this.notificarMovimiento = function(codigo, tablero, turno, ganador) {
    io.emit("movimientoRealizado", { codigo, tablero, turno, ganador });
  };
}

module.exports.WSServer = WSServer;

