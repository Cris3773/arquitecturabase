function ControlWeb() {
    var self = this;

    // --------------------------------------------------
    // Mostrar un mensaje de información en la zona #au
    // --------------------------------------------------
    this.mostrarMensaje = function (msg) {
        $("#msg").remove(); // quita mensaje anterior (si lo hubiera)
        var cadena = '<div id="msg" class="alert alert-info mt-3">' + msg + '</div>';
        $("#au").prepend(cadena);
    };

    // --------------------------------------------------
    // Comprobar sesión (cookie "nick")
    //  - Si hay nick  -> muestra bienvenida + botón Salir
    //  - Si no hay    -> muestra pantalla de LOGIN
    // --------------------------------------------------
    this.comprobarSesion = function () {
        var nick = $.cookie("nick");

        if (nick) {
            // Hay sesión
            $("#registro").empty();
            $("#mAU").remove();
            $("#msg").remove();

            self.mostrarMensaje("Bienvenido al sistema, " + nick);

            $("#linkSalir").show();
            $("#linkInicio").hide();
            
            // Mostrar partidas cuando hay sesión
            var card = $("#listaPartidas").closest(".card");
            if (card.length) {
                card.show();
            }
        } else {
            // No hay sesión: mostramos LOGIN
            $("#registro").empty();
            $("#mAU").remove();
            $("#msg").remove();

            self.mostrarLogin();

            $("#linkSalir").hide();
            $("#linkInicio").show();
            
            // Ocultar partidas si no hay sesión
            var card = $("#listaPartidas").closest(".card");
            if (card.length) {
                card.hide();
            }
        }

        // A la derecha siempre mostramos la lista de usuarios
        self.actualizarListaUsuarios();
        
        // También actualizar lista de partidas
        self.actualizarListaPartidas();
    };

    // --------------------------------------------------
    // Pantalla de LOGIN (email + password + Google)
    // Carga: cliente/login.html #fmLogin
    // --------------------------------------------------
    this.mostrarLogin = function () {
        // Limpiamos posibles formularios anteriores
        $("#mAU").remove();
        $("#fmRegistro").remove();

        $("#registro").load("/cliente/login.html #fmLogin", function () {

            // Botón INICIAR SESIÓN
            $("#btnLogin").off("click").on("click", function (e) {
                e.preventDefault();

                var email = $("#email").val().trim();
                var pwd   = $("#pwd").val().trim();

                if (email && pwd) {
                    // Cuando tengas implementado el login local, descomenta:
                    // rest.loginUsuario(email, pwd);

                    rest.agregarUsuario(email);
                } else {
                    console.log("Introduce email y contraseña");
                }
            });

            // Botón QUIERO REGISTRARME -> pasa al formulario de registro local
            $("#btnIrRegistro").off("click").on("click", function (e) {
                e.preventDefault();
                self.mostrarRegistro();
            });
        });
    };

    // --------------------------------------------------
    // Pantalla de REGISTRO LOCAL
    // Carga: registro.html #fmRegistro
    // Usa:  rest.registrarUsuario(email, pwd) de ClienteRest
    // --------------------------------------------------
    this.mostrarRegistro = function () {
        $("#mAU").remove();
        $("#fmLogin").remove();

        $("#registro").load("/cliente/registro.html #fmRegistro", function () {

            $("#btnRegistro").off("click").on("click", function (e) {
                e.preventDefault();

                var apellidos = $("#apellidos").val().trim();
                var nombre    = $("#nombre").val().trim();
                var email     = $("#email").val().trim();
                var pwd       = $("#pwd").val().trim();
                console.log("CLICK REGISTRAR", { apellidos, nombre, email, pwd });
                if (apellidos && nombre && email && pwd) {
                    console.log("Voy a registrar: " + email);   // 👈 prueba
                    rest.registrarUsuario(email, pwd);
                } else {
                    console.log("Rellena todos los campos");
                }
            });
        });
    };
    this.mostrarModal=function(m){ 
        $('#mBody').html("");
        let cadena="<div id='msg'>"+ m +"</div>"; 
        $('#mBody').append(cadena) 
        $('#miModal').modal('show'); 
 
    } 

    // --------------------------------------------------
    // Lista de usuarios (columna derecha)
    // --------------------------------------------------
    this.actualizarListaUsuarios = function () {
        rest.obtenerUsuarios()
            .then(function (usuarios) {
                var lista = $("#listaUsuarios");
                lista.empty();

                for (var nick in usuarios) {
                    lista.append(
                        '<li class="list-group-item d-flex justify-content-between align-items-center">' +
                            nick +
                            '<button class="btn btn-danger btn-sm" onclick="cw.eliminarUsuario(\'' + nick + '\')">' +
                                '<i class="bi bi-trash"></i> Eliminar' +
                            '</button>' +
                        '</li>'
                    );
                }

                $("#numUsuarios").text(Object.keys(usuarios).length);
            })
            .catch(function (error) {
                console.error("Error al obtener usuarios:", error);
            });
    };

    // --------------------------------------------------
    // Eliminar usuario
    // --------------------------------------------------
    this.eliminarUsuario = function (nick) {
        rest.eliminarUsuario(nick)
            .then(function () {
                self.actualizarListaUsuarios();
            })
            .catch(function (error) {
                console.error("Error al eliminar usuario:", error);
            });
    };

    // --------------------------------------------------
    // Buscar usuario por nick (input de la derecha)
    // --------------------------------------------------
    this.buscarUsuario = function (nick) {
        rest.usuarioActivo(nick)
            .then(function (resultado) {
                if (resultado.activo) {
                console.log("El usuario " + nick + " está activo");
                } else {
                    console.log("El usuario " + nick + " no existe");
                }
            })
            .catch(function (error) {
                console.error("Error al buscar usuario:", error);
            });
    };

    // --------------------------------------------------
// Lista de partidas disponibles
// --------------------------------------------------
this.actualizarListaPartidas = function () {
  var nick = $.cookie("nick");
  
  // Limpiar la lista
  var lista = $("#listaPartidas");
  lista.empty();
  
  // Solo obtener si hay sesión
  if (!nick) {
    lista.append('<li class="list-group-item">Inicia sesión para ver partidas</li>');
    return;
  }
  
  rest.obtenerPartidas()
    .then(function (partidas) {
      lista.empty();

      if (partidas.length === 0) {
        lista.append('<li class="list-group-item">No hay partidas disponibles</li>');
      } else {
        for (var i = 0; i < partidas.length; i++) {
          var partida = partidas[i];
          var esPropietario = (nick === partida.propietario);
          var estaEnPartida = partida.jugadores && partida.jugadores.includes(nick);
          
          var botones = '';
          if (esPropietario) {
            // Botones para el propietario
            botones = '<div class="btn-group btn-group-sm" role="group">' +
              '<button class="btn btn-primary" onclick="cw.iniciarPartida(\'' + partida.codigo + '\')" ' + 
              (partida.numJugadores < 2 ? 'disabled' : '') + '>' +
                '<i class="bi bi-play"></i> Jugar' +
              '</button>' +
              '<button class="btn btn-danger" onclick="cw.abandonarPartida(\'' + partida.codigo + '\')">' +
                '<i class="bi bi-x"></i> Abandonar' +
              '</button>' +
            '</div>';
          } else if (estaEnPartida) {
            // Botón para usuarios que ya están en la partida
            botones = '<button class="btn btn-danger btn-sm" onclick="cw.abandonarPartida(\'' + partida.codigo + '\')">' +
              '<i class="bi bi-x"></i> Abandonar' +
            '</button>';
          } else {
            // Botón para otros usuarios que no están en la partida
            var deshabilitado = partida.numJugadores >= partida.maxJug ? 'disabled' : '';
            botones = '<button class="btn btn-success btn-sm" onclick="cw.unirseLaPartida(\'' + partida.codigo + '\')" ' + deshabilitado + '>' +
              '<i class="bi bi-door-open"></i> Unirse' +
            '</button>';
          }
          
          lista.append(
            '<li class="list-group-item d-flex justify-content-between align-items-center">' +
              '<span>Partida: ' + partida.codigo + '<br><small>Jugadores: ' + partida.numJugadores + '/' + partida.maxJug + '</small></span>' +
              botones +
            '</li>'
          );
        }
      }

      $("#numPartidas").text(partidas.length);
      
      // Agregar evento al botón crear partida
      $("#btnCrearPartida").off("click").on("click", function () {
        self.crearPartida();
      });
    })
    .catch(function (error) {
      console.error("Error al obtener partidas:", error);
      lista.empty();
      lista.append('<li class="list-group-item text-danger">Error al cargar partidas</li>');
    });
};

// --------------------------------------------------
// Unirse a una partida
// --------------------------------------------------
this.unirseLaPartida = function (codigo) {
  var nick = $.cookie("nick");
  if (!nick) {
    console.log("No hay usuario logueado");
    return;
  }
  
  rest.unirseLaPartida(nick, codigo)
    .then(function (resultado) {
      if (resultado.ok) {
        self.mostrarMensaje("Te has unido a la partida " + codigo);
        self.actualizarListaPartidas();
      } else {
        self.mostrarMensaje("Error: " + resultado.msg);
      }
    })
    .catch(function (error) {
      console.error("Error al unirse a la partida:", error);
    });
};

// --------------------------------------------------
// Crear partida
// --------------------------------------------------
this.crearPartida = function () {
  var nick = $.cookie("nick");
  if (!nick) {
    self.mostrarMensaje("Debes iniciar sesión para crear una partida");
    return;
  }
  
  rest.crearPartida(nick)
    .then(function (resultado) {
      if (resultado && resultado.codigo && resultado.codigo !== -1) {
        self.mostrarMensaje("Partida creada: " + resultado.codigo);
        self.actualizarListaPartidas();
      } else {
        self.mostrarMensaje("Error al crear la partida");
      }
    })
    .catch(function (error) {
      console.error("Error al crear partida:", error);
    });
};

// --------------------------------------------------
// Iniciar partida
// --------------------------------------------------
this.iniciarPartida = function (codigo) {
  var nick = $.cookie("nick");
  if (!nick) {
    self.mostrarMensaje("Debes iniciar sesión");
    return;
  }
  
  rest.iniciarPartida(nick, codigo)
    .then(function (resultado) {
      if (resultado.ok) {
        self.mostrarMensaje("Partida iniciada");
        self.actualizarListaPartidas();
      } else {
        self.mostrarMensaje("Error: " + resultado.msg);
      }
    })
    .catch(function (error) {
      console.error("Error al iniciar partida:", error);
    });
};

// --------------------------------------------------
// Abandonar partida
// --------------------------------------------------
this.abandonarPartida = function (codigo) {
  var nick = $.cookie("nick");
  if (!nick) {
    self.mostrarMensaje("Debes iniciar sesión");
    return;
  }
  
  rest.abandonarPartida(nick, codigo)
    .then(function (resultado) {
      if (resultado.ok) {
        self.mostrarMensaje(resultado.msg);
        self.actualizarListaPartidas();
      } else {
        self.mostrarMensaje("Error: " + resultado.msg);
      }
    })
    .catch(function (error) {
      console.error("Error al abandonar partida:", error);
    });
};

    // --------------------------------------------------
    // Salir: borra cookie de sesión y vuelve al estado inicial
    // --------------------------------------------------
  this.salir=function(){ 
    //localStorage.removeItem("nick"); 
    $.removeCookie("nick"); 
    location.reload(); 
    rest.cerrarSesion(); 
 }

    // --------------------------------------------------
    // (OPCIONAL) Formulario antiguo de nick + Google
    // Si no lo necesitas, puedes borrar todo este método.
    // --------------------------------------------------
    /*
    this.mostrarAgregarUsuario = function () {
        $("#bnv").remove();
        $("#mAU").remove();

        var cadena = '<div id="mAU">';
        cadena += '<div class="card"><div class="card-body">';
        cadena += '<div class="form-group">';
        cadena += '<label for="nick">Nick:</label>';
        cadena += '<p><input type="text" class="form-control" id="nick" placeholder="Introduce un nick"></p>';
        cadena += '<button id="btnAU" type="submit" class="btn btn-primary">Submit</button>';

        cadena += '<div class="mt-3">';
        cadena += '<a href="/auth/google">';
        cadena += '<img src="./cliente/img/boton_google.png" style="height:40px;">';
        cadena += '</a></div>';

        cadena += '</div></div></div></div>';

        $("#au").append(cadena);

        $("#btnAU").off("click").on("click", function () {
            var nick = $("#nick").val().trim();
            if (nick) {
                rest.agregarUsuario(nick);
            } else {
                console.log("Por favor, introduce un nick antes de agregar.");
            }
        });
    };
    */
}
