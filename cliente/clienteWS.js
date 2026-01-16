function ClienteWS(){
  this.socket = undefined;

  this.ini = function(){
    this.socket = io.connect();

    // Escuchamos el evento del servidor
    this.socket.on("notificacion", function(data){
      console.log("WS:", data.msg);
    });
  }

  this.ini();
}

