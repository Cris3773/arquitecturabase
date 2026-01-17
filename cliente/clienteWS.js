function ClienteWS(){
  this.socket = undefined;

  this.ini = function(){
    this.socket = io.connect();

    // Escuchamos el evento del servidor
    this.socket.on("notificacion", function(data){
      console.log("WS:", data.msg);
    });

    // Eventos de partidas
    this.socket.on("partidaCreada", function(partida){
      console.log("Nueva partida creada:", partida);
      if (typeof controlWeb !== 'undefined') {
        controlWeb.actualizarListaPartidas();
      }
    });

    this.socket.on("usuarioUnido", function(data){
      console.log("Usuario se unió a partida:", data.codigo);
      if (typeof controlWeb !== 'undefined') {
        controlWeb.actualizarListaPartidas();
      }
    });

    this.socket.on("usuarioAbandono", function(data){
      console.log("Usuario abandonó partida:", data.codigo);
      if (typeof controlWeb !== 'undefined') {
        controlWeb.actualizarListaPartidas();
      }
    });

    this.socket.on("partidaIniciada", function(data){
      console.log("Partida iniciada (WebSocket):", data.codigo);
      if (typeof controlWeb !== 'undefined') {
        var nick = $.cookie("nick");
        // Obtener todas las partidas para verificar si el usuario está en esta
        if (typeof rest !== 'undefined') {
          rest.obtenerTodasLasPartidas()
            .then(function(partidas) {
              var partida = partidas.find(p => p.codigo === data.codigo);
              if (partida && partida.jugadores.includes(nick)) {
                // El usuario está en esta partida, mostrar tablero
                controlWeb.codigoPartidaActual = data.codigo;
                controlWeb.mostrarTablero(data.codigo);
              }
              controlWeb.actualizarListaPartidas();
            })
            .catch(function(err) {
              console.error("Error obteniendo partidas:", err);
              controlWeb.actualizarListaPartidas();
            });
        }
      }
    });

    this.socket.on("movimientoRealizado", function(data){
      console.log("Movimiento realizado en partida (WebSocket):", data.codigo);
      if (typeof controlWeb !== 'undefined') {
        // Si estamos viendo esa partida, actualizar el tablero directamente
        if (controlWeb.codigoPartidaActual === data.codigo) {
          // Obtener los nicks de la partida para mostrar el estado correctamente
          if (typeof rest !== 'undefined') {
            rest.obtenerTodasLasPartidas()
              .then(function(partidas) {
                var partida = partidas.find(p => p.codigo === data.codigo);
                if (partida) {
                  data.jugador1Nick = partida.jugadores[0] || "Jugador 1";
                  data.jugador2Nick = partida.jugadores[1] || "Jugador 2";
                  controlWeb.actualizarTableroEnTiempoReal(data);
                }
              })
              .catch(function(err) {
                console.log("Error obteniendo nicks:", err);
                // Actualizar de todas formas aunque no tengamos los nicks
                controlWeb.actualizarTableroEnTiempoReal(data);
              });
          }
        }
      }
    });
  }

  this.ini();
}

