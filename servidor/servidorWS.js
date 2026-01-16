function WSServer(io){ 
  this.lanzarServer = function(){ 
    io.on('connection', function(socket){ 
      console.log("Cliente conectado por WebSocket");

      // Evento para todos los clientes
      io.emit("notificacion", {
        msg: "Un cliente se ha conectado al sistema"
      });
    }); 
  } 
}

module.exports.WSServer = WSServer;

