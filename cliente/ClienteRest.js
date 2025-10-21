function ClienteRest () {

  // --- Alta con control de nick ocupado ---
  this.agregarUsuario = function (nick) {
    const url = "/agregarUsuario/" + encodeURIComponent(nick);
    return $.getJSON(url)
      .then(function (data) {
        if (data && data.nick !== -1) {
          console.log("Usuario " + nick + " ha sido registrado");
          return data;
        } else {
          console.log("El nick ya está ocupado");
          const err = new Error("Nick ocupado");
          err.code = "NICK_TAKEN";
          throw err;
        }
      })
      .catch(function (err) {
        console.error("agregarUsuario error:", err);
        throw err; // re-lanza para que el caller pueda capturarlo
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

  // --- Marcar usuario activo ---
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

  
  this.agregarUsuario2 = function (nick) {
    return $.ajax({
      type: "GET",
      url: "/agregarUsuario/" + encodeURIComponent(nick),
      dataType: "json" // no uses contentType en GET sin body
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
}

