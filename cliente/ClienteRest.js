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

  // --- Registrar usuario LOCAL (profesor) ---
  this.registrarUsuario = function(email, password){ 
    $.ajax({ 
      type: 'POST', 
      url: '/registrarUsuario',               
      data: JSON.stringify({ 
        email: email, 
        password: password 
      }), 
      contentType: 'application/json',

      success: function(data){ 
        // En nuestro servidor, si todo va bien devuelve algo tipo: { nick: "correo@..." }
        // Si usas la convención antigua de -1, también lo controlamos.
         console.log("Respuesta /registrarUsuario:", data);
        if (data && data.nick && data.nick != -1){              

          console.log("Usuario "+data.nick+" ha sido registrado"); 

          // Creamos cookie de sesión con el nick/email devuelto
          $.cookie("nick", data.nick, { path: "/" }); 

          cw.mostrarMensaje("Bienvenido al sistema, "+data.nick); 
          cw.comprobarSesion();     
        } 
        else { 
          console.log("El nick está ocupado o respuesta inválida", data); 
          alert(data.msg || "No se ha podido registrar (nick ocupado)");
        } 
      }, 

      error: function(xhr, textStatus, errorThrown){ 
        console.log("Status: " + textStatus);  
        console.log("Error: " + errorThrown);  

        // Intentamos sacar un mensaje útil del servidor
        let msg = "No se ha podido registrar.";
        try {
          const json = xhr.responseJSON;
          if (json && json.msg) msg = json.msg;  // p.ej. "Email ya en uso"
        } catch(e){}

        alert(msg);   // 👈 AHORA SÍ ves algo en pantalla
      }
    }); 
  };


}
