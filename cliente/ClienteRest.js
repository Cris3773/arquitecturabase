function ClienteRest () {

  // --- Agregar usuario por nick (la que ya tenías) ---
  this.agregarUsuario = function(nick){
    $.getJSON("/agregarUsuario/" + nick, function(data){
        let msg = "El nick " + nick + " está ocupado";
        if (data.nick != -1){
            console.log("Usuario " + nick + " ha sido registrado");
            msg = "Bienvenido al sistema, " + nick;

            // guardamos cookie de sesión
            $.cookie("nick", nick, { path: "/" });

            // refrescamos la UI según la sesión
            cw.comprobarSesion();
        }
        else{
            console.log("El nick ya está ocupado");
        }

        cw.mostrarMensaje(msg);
        cw.mostrarMensaje("El usuario no existe o el nick es incorrecto");
        cw.mostrarModal("No se ha podido iniciar sesión");
    });
  };

  // --- Lista de usuarios ---
  this.obtenerUsuarios = function () {
    return $.getJSON("/obtenerUsuarios")
      .then(function (data) {
        console.log("obtenerUsuarios:", data);
        return data;
      })
      .catch(function (err) {
        console.error("obtenerUsuarios error:", err);
        throw err;
      });
  };

  // --- Número de usuarios ---
  this.numeroUsuarios = function () {
    return $.getJSON("/numeroUsuarios")
      .then(function (data) {
        console.log("numeroUsuarios:", data);
        return data;
      })
      .catch(function (err) {
        console.error("numeroUsuarios error:", err);
        throw err;
      });
  };

  // --- Usuario activo ---
  this.usuarioActivo = function (nick) {
    const url = "/usuarioActivo/" + encodeURIComponent(nick);
    return $.getJSON(url)
      .then(function (data) {
        console.log("usuarioActivo(" + nick + "):", data);
        return data;
      })
      .catch(function (err) {
        console.error("usuarioActivo error:", err);
        throw err;
      });
  };

  // --- Eliminar usuario ---
  this.eliminarUsuario = function (nick) {
    const url = "/eliminarUsuario/" + encodeURIComponent(nick);
    return $.getJSON(url)
      .then(function (data) {
        console.log("eliminarUsuario(" + nick + "):", data);
        return data;
      })
      .catch(function (err) {
        console.error("eliminarUsuario error:", err);
        throw err;
      });
  };

  // --- Versión alternativa de agregarUsuario (si la usas) ---
  this.agregarUsuario2 = function (nick) {
    return $.ajax({
      type: "GET",
      url: "/agregarUsuario/" + encodeURIComponent(nick),
      dataType: "json"
    })
    .then(function (data) {
      if (data && data.nick !== -1) {
        console.log("Usuario " + nick + " ha sido registrado (método 2)");
        return data;
      } else {
        console.log("El nick ya está ocupado (método 2)");
        const err = new Error("Nick ocupado");
        err.code = "NICK_TAKEN";
        throw err;
      }
    })
    .catch(function (err) {
      console.error("agregarUsuario2 error:", err);
      throw err;
    });
  };

  
  this.registrarUsuario = function(email, password){ 
  console.log("Voy a hacer POST /registrarUsuario", email, password);

  $.ajax({ 
    type: 'POST', 
    url: window.location.origin + '/registrarUsuario',              
    data: JSON.stringify({ 
      email: email, 
      password: password 
    }), 
    contentType: 'application/json',

    success: function(data){ 
      console.log("Respuesta /registrarUsuario:", data);

      if (data && data.nick && data.nick != -1){              
        console.log("Usuario "+data.nick+" ha sido registrado"); 

   

        // Mensaje informativo
        cw.mostrarMensaje(
          "Te hemos enviado un correo a " + data.nick +
          ". Por favor, confirma tu cuenta antes de iniciar sesión."
        );

        //Volvemos a la pantalla de login
        cw.mostrarLogin();     
      } 
      else { 
        console.log("El nick está ocupado o respuesta inválida", data); 
        cw.mostrarMensaje(data.msg || "Hay un usuario registrado con ese email");
        cw.mostrarModal("No se ha podido registrar el usuario");
      } 
    }, 

    error: function(xhr, textStatus, errorThrown){ 
      console.log("Status: " + textStatus);  
      console.log("Error: " + errorThrown);  

      let msg = "No se ha podido registrar.";
      try {
        const json = xhr.responseJSON;
        if (json && json.msg) msg = json.msg;
      } catch(e){}

      cw.mostrarMensaje(msg);
      cw.mostrarModal("No se ha podido registrar el usuario");
    }

  }); 
};

// --- Obtener partidas disponibles ---
this.obtenerPartidas = function () {
  return $.getJSON("/obtenerPartidas")
    .then(function (data) {
      console.log("obtenerPartidas:", data);
      return data;
    })
    .catch(function (err) {
      console.error("obtenerPartidas error:", err);
      throw err;
    });
};

// --- Obtener todas las partidas (iniciadas e no iniciadas) ---
this.obtenerTodasLasPartidas = function () {
  return $.getJSON("/obtenerTodasLasPartidas")
    .then(function (data) {
      console.log("obtenerTodasLasPartidas:", data);
      return data;
    })
    .catch(function (err) {
      console.error("obtenerTodasLasPartidas error:", err);
      throw err;
    });
};

// --- Unirse a partida ---
this.unirseLaPartida = function (nick, codigo) {
  const url = "/unirseLaPartida/" + encodeURIComponent(nick) + "/" + encodeURIComponent(codigo);
  return $.getJSON(url)
    .then(function (data) {
      console.log("unirseLaPartida(" + nick + ", " + codigo + "):", data);
      return data;
    })
    .catch(function (err) {
      console.error("unirseLaPartida error:", err);
      throw err;
    });
};

// --- Crear partida ---
this.crearPartida = function (nick) {
  const url = "/crearPartida/" + encodeURIComponent(nick);
  return $.getJSON(url)
    .then(function (data) {
      console.log("crearPartida(" + nick + "):", data);
      return data;
    })
    .catch(function (err) {
      console.error("crearPartida error:", err);
      throw err;
    });
};

// --- Iniciar partida ---
this.iniciarPartida = function (nick, codigo) {
  const url = "/iniciarPartida/" + encodeURIComponent(nick) + "/" + encodeURIComponent(codigo);
  return $.getJSON(url)
    .then(function (data) {
      console.log("iniciarPartida(" + nick + ", " + codigo + "):", data);
      return data;
    })
    .catch(function (err) {
      console.error("iniciarPartida error:", err);
      throw err;
    });
};

// --- Abandonar partida ---
this.abandonarPartida = function (nick, codigo) {
  const url = "/abandonarPartida/" + encodeURIComponent(nick) + "/" + encodeURIComponent(codigo);
  return $.getJSON(url)
    .then(function (data) {
      console.log("abandonarPartida(" + nick + ", " + codigo + "):", data);
      return data;
    })
    .catch(function (err) {
      console.error("abandonarPartida error:", err);
      throw err;
    });
};

// --- Hacer movimiento ---
this.hacerMovimiento = function (nick, codigo, fila, columna) {
  const url = "/hacerMovimiento/" + encodeURIComponent(nick) + "/" + encodeURIComponent(codigo) + "/" + fila + "/" + columna;
  return $.getJSON(url)
    .then(function (data) {
      console.log("hacerMovimiento:", data);
      return data;
    })
    .catch(function (err) {
      console.error("hacerMovimiento error:", err);
      throw err;
    });
};

this.cerrarSesion=function(){ 
$.getJSON("/cerrarSesion",function(){    
console.log("Sesión cerrada");   
$.removeCookie("nick");      
}); 
} 


}
