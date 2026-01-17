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
      console.log("Partida iniciada:", data.codigo);
      if (typeof controlWeb !== 'undefined') {
        controlWeb.actualizarListaPartidas();
      }
    });

    this.socket.on("movimientoRealizado", function(data){
      console.log("Movimiento realizado en partida:", data.codigo);
      if (typeof controlWeb !== 'undefined') {
        controlWeb.mostrarTablero(data.codigo);
      }
    });
  }

  this.ini();
}

