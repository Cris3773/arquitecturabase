function WSServer(io, sistema){ 
  this.io = io;
  this.sistema = sistema;
  var self = this;

  this.manejarSalirPartida = function(jugador){
    // Cierra la partida y limpia el estado del jugador que sale
    let codigo = jugador.partida || jugador.codigo;
    let nick = jugador.nick;
    let partida = self.sistema.partidas[codigo];
    if (!partida) return;

    let numJugador = 0;
    let nickNorm = (nick || "").toLowerCase();
    let propietarioNorm = (partida.propietario || "").toLowerCase();
    let jugador2Norm = (partida.jugadores.length > 1 && partida.jugadores[1].nick) ? partida.jugadores[1].nick.toLowerCase() : "";
    if (propietarioNorm === nickNorm) numJugador = 1;
    else if (jugador2Norm === nickNorm) numJugador = 2;

    if (numJugador > 0) {
      partida.jugadoresActivos[numJugador] = false;
    }

    if (partida.solicitudesNuevaRonda && nick) {
      delete partida.solicitudesNuevaRonda[nick];
    }

    partida.cerrada = true;

    let otroNum = numJugador === 1 ? 2 : 1;
    if (partida.jugadoresActivos[otroNum]) {
      jugador.to(codigo).emit("jugador_salio", {
        tipo: "jugador_salio",
        mensaje: "El otro jugador ha abandonado la partida."
      });
    }

    if (!partida.jugadoresActivos[1] && !partida.jugadoresActivos[2]) {
      delete self.sistema.partidas[codigo];
    }
  };

  this.lanzarServer = function(){ 
    io.on('connection', function(socket){ 
      console.log("Cliente conectado por WebSocket");

      // Evento para todos los clientes
      io.emit("notificacion", {
        msg: "Un cliente se ha conectado al sistema"
      });

      socket.on("entrar_partida", function(data){
        if (!data || !data.codigo) return;
        let partida = self.sistema.partidas[data.codigo];
        if (!partida || partida.cerrada) return;
        if (socket.data.codigo && socket.data.codigo !== data.codigo) {
          socket.leave(socket.data.codigo);
        }
        socket.data.codigo = data.codigo;
        socket.data.partida = data.codigo;
        socket.data.nick = data.nick;
        socket.join(data.codigo);
      });

      socket.on("pedir_nueva_ronda", function(data){
        if (!data || !data.codigo || !data.nick) return;
        let partida = self.sistema.partidas[data.codigo];
        if (!partida) return;
        if (!partida.finalizada) return;
        if (!partida.solicitudesNuevaRonda) {
          partida.solicitudesNuevaRonda = {};
        }
        partida.solicitudesNuevaRonda[data.nick] = true;
        socket.join(data.codigo);

        io.to(data.codigo).emit("aceptar_nueva_ronda", { codigo: data.codigo, nick: data.nick });

        if (partida.jugadores.length >= 2) {
          let ambosAceptaron = partida.jugadores.every(j => partida.solicitudesNuevaRonda[j.nick]);
          if (ambosAceptaron && partida.finalizada) {
            const resultado = self.sistema.reiniciarPartida(data.nick, data.codigo);
            if (resultado.ok) {
              partida.solicitudesNuevaRonda = {};
              io.to(data.codigo).emit("iniciar_nueva_ronda", {
                codigo: data.codigo,
                tablero: resultado.tablero,
                turno: resultado.turno,
                ganador: resultado.ganador,
                celdasGanadoras: resultado.celdasGanadoras,
                marcador: resultado.marcador
              });
            }
          }
        }
      });

      socket.on("salir_partida", function(data){
        if (!data || !data.codigo) return;
        socket.data.partida = data.codigo;
        socket.data.nick = data.nick;
        self.manejarSalirPartida(socket);
        socket.leave(data.codigo);
        if (socket.data.codigo === data.codigo) {
          socket.data.codigo = null;
          socket.data.partida = null;
          socket.data.nick = null;
        }
      });

      socket.on("close", function(){
        if (!socket.data.partida) return;
        self.manejarSalirPartida(socket);
      });

      socket.on("disconnect", function(){
        if (!socket.data.partida) return;
        self.manejarSalirPartida(socket);
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

  this.notificarMovimiento = function(codigo, tablero, turno, ganador, celdasGanadoras) {
    io.emit("movimientoRealizado", { codigo, tablero, turno, ganador, celdasGanadoras });
  };

  this.notificarFinPartida = function(codigo, ganador, celdasGanadoras, marcador) {
    io.to(codigo).emit("fin_partida", { codigo, ganador, celdasGanadoras, marcador });
  };

  this.notificarReinicioPartida = function(codigo, tablero, turno, ganador, celdasGanadoras, marcador) {
    io.to(codigo).emit("iniciar_nueva_ronda", { codigo, tablero, turno, ganador, celdasGanadoras, marcador });
  };
}

module.exports.WSServer = WSServer;

