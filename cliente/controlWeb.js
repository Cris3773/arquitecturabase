function ControlWeb() {
    var self = this;
    this.intervaloPartidas = null;
    this.codigoPartidaActual = null;  // Guardar partida actual en juego
    this.intervaloVerificarPartida = null; // Polling para verificar partida en curso
    this.intervaloActualizarTablero = null; // Polling para actualizar tablero durante el juego

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
            
            // Detener polling si estaba activo
            if (self.intervaloPartidas) {
                clearInterval(self.intervaloPartidas);
                self.intervaloPartidas = null;
            }
            
            // Detener verificación de partida
            if (self.intervaloVerificarPartida) {
                clearInterval(self.intervaloVerificarPartida);
                self.intervaloVerificarPartida = null;
            }
        } 
        
        if (nick) {
            // Hay sesión: iniciar polling automático y verificación de partida
            if (self.intervaloPartidas) {
                clearInterval(self.intervaloPartidas);
            }
            self.intervaloPartidas = setInterval(function() {
                self.actualizarListaPartidas();
            }, 2000); // Actualizar cada 2 segundos
            
            // Iniciar verificación de partida en curso
            if (self.intervaloVerificarPartida) {
                clearInterval(self.intervaloVerificarPartida);
            }
            self.intervaloVerificarPartida = setInterval(function() {
                self.verificarPartidaEnCurso();
            }, 1000); // Verificar cada 1 segundo
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
// Actualizar lista de partidas
// --------------------------------------------------
this.actualizarListaPartidas = function (forzar) {
  var nick = $.cookie("nick");
  
  // Si hay una partida activa y no se fuerza, no actualizar el listado
  if (this.codigoPartidaActual && !forzar) {
    return;
  }
  
  // Solo obtener si hay sesión
  if (!nick) {
    var lista = $("#listaPartidas");
    lista.empty();
    lista.append('<li class="list-group-item">Inicia sesión para ver partidas</li>');
    return;
  }
  
  rest.obtenerPartidas()
    .then(function (partidas) {
      var lista = $("#listaPartidas");
      
      // Guardar los elementos actuales para evitar parpadeo
      var anteriorPartidas = lista.find('li[data-codigo]');
      var codigosAnteriores = {};
      anteriorPartidas.each(function() {
        codigosAnteriores[$(this).data('codigo')] = true;
      });
      
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
            '<li class="list-group-item d-flex justify-content-between align-items-center" data-codigo="' + partida.codigo + '">' +
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
      var lista = $("#listaPartidas");
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
  
  // Reactivar polling si estaba pausado
  if (!self.intervaloVerificarPartida) {
    self.intervaloVerificarPartida = setInterval(function() {
      self.verificarPartidaEnCurso();
    }, 1000);
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
  
  // Reactivar polling si estaba pausado
  if (!self.intervaloVerificarPartida) {
    self.intervaloVerificarPartida = setInterval(function() {
      self.verificarPartidaEnCurso();
    }, 1000);
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
        // Guardar la partida actual
        self.codigoPartidaActual = codigo;
        
        // Actualizar listado inmediatamente para remover la partida (forzar actualización)
        self.actualizarListaPartidas(true);
        
        // Esperar un poco y luego mostrar el tablero
        setTimeout(function() {
          self.mostrarTablero(codigo);
        }, 500);
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
  
  // Limpiar partida actual si estamos abandonando
  if (this.codigoPartidaActual === codigo) {
    this.codigoPartidaActual = null;
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
    if (this.intervaloPartidas) {
      clearInterval(this.intervaloPartidas);
      this.intervaloPartidas = null;
    }
    if (this.intervaloVerificarPartida) {
      clearInterval(this.intervaloVerificarPartida);
      this.intervaloVerificarPartida = null;
    }
    if (this.intervaloActualizarTablero) {
      clearInterval(this.intervaloActualizarTablero);
      this.intervaloActualizarTablero = null;
    }
    $.removeCookie("nick"); 
    location.reload(); 
    rest.cerrarSesion(); 
 }

// --------------------------------------------------
// Mostrar tablero de tres en raya
// --------------------------------------------------
this.mostrarTablero = function (codigo) {
  var nick = $.cookie("nick");
  
  // Ocultar el listado de partidas mientras se juega
  var cardListado = $("#listaPartidas").closest(".card");
  if (cardListado.length) {
    cardListado.hide();
  }
  
  // Obtener todas las partidas (incluyendo iniciadas)
  rest.obtenerTodasLasPartidas()
    .then(function (partidas) {
      var partida = partidas.find(p => p.codigo === codigo);
      
      if (!partida) {
        self.mostrarMensaje("Partida no encontrada");
        return;
      }

      // Verificar si el usuario está en la partida
      if (!partida.jugadores.includes(nick)) {
        self.mostrarMensaje("No estás en esta partida");
        return;
      }

      // Obtener nicks de los jugadores
      var jugador1Nick = partida.jugadores[0] || "Jugador 1";
      var jugador2Nick = partida.jugadores[1] || "Jugador 2";

      // Verificar si el tablero ya está visible
      var tablaExistente = $("#tablero-" + codigo);
      
      if (tablaExistente.length > 0) {
        // Actualizar tablero existente sin parpadeo
        for (var i = 0; i < 3; i++) {
          for (var j = 0; j < 3; j++) {
            var valor = partida.tablero ? partida.tablero[i][j] : 0;
            var simbolo = valor === 0 ? '' : (valor === 1 ? 'X' : 'O');
            var cellId = "celda-" + i + "-" + j;
            $("#" + cellId).text(simbolo);
          }
        }
        
        // Actualizar estado
        var estadoDiv = $("#estado-juego");
        var estadoHtml = '';
        if (partida.ganador) {
          if (partida.ganador === 'empate') {
            estadoHtml = '<p class="text-warning mt-3">¡Empate!</p>';
          } else {
            var ganadorNick = partida.ganador === 1 ? jugador1Nick : jugador2Nick;
            estadoHtml = '<p class="text-success mt-3">¡Ganador: ' + ganadorNick + ' (Jugador ' + partida.ganador + ')!</p>';
          }
        } else {
          var turnoNick = partida.turno === 1 ? jugador1Nick : jugador2Nick;
          estadoHtml = '<p class="mt-3"><strong>Turno:</strong> ' + turnoNick + ' (' + (partida.turno === 1 ? 'X' : 'O') + ')</p>';
        }
        estadoDiv.html(estadoHtml);
        
        // Iniciar polling automático si no está activo
        if (!self.intervaloActualizarTablero) {
          self.iniciarActualizacionAutomaticaTablero(codigo);
        }
        
        return;
      }

      // Crear HTML del tablero
      var html = '<div class="card mt-4">';
      html += '<div class="card-header d-flex justify-content-between align-items-center">';
      html += '<h5>Partida: ' + codigo + '</h5>';
      html += '<button class="btn btn-sm btn-secondary" onclick="cw.volverAlListado()"><i class="bi bi-arrow-left"></i> Volver</button>';
      html += '</div>';
      html += '<div class="card-body">';
      
      // Mostrar info de los jugadores
      html += '<div class="mb-3">';
      html += '<p><strong>Jugadores:</strong></p>';
      html += '<p><strong style="color: #007bff;">X</strong> - ' + jugador1Nick + '</p>';
      html += '<p><strong style="color: #dc3545;">O</strong> - ' + jugador2Nick + '</p>';
      html += '</div>';
      
      // Mostrar tablero
      html += '<div class="tablero-3raya" id="tablero-' + codigo + '">';
      for (var i = 0; i < 3; i++) {
        html += '<div class="fila-tablero">';
        for (var j = 0; j < 3; j++) {
          var valor = partida.tablero ? partida.tablero[i][j] : 0;
          var simbolo = valor === 0 ? '' : (valor === 1 ? 'X' : 'O');
          html += '<button class="casilla-tablero" id="celda-' + i + '-' + j + '" onclick="cw.hacerMovimiento(\'' + codigo + '\', ' + i + ', ' + j + ')">' + simbolo + '</button>';
        }
        html += '</div>';
      }
      html += '</div>';
      
      // Estado del juego
      html += '<div id="estado-juego">';
      if (partida.ganador) {
        if (partida.ganador === 'empate') {
          html += '<p class="text-warning mt-3">¡Empate!</p>';
        } else {
          var ganadorNick = partida.ganador === 1 ? jugador1Nick : jugador2Nick;
          html += '<p class="text-success mt-3">¡Ganador: ' + ganadorNick + ' (Jugador ' + partida.ganador + ')!</p>';
        }
      } else {
        var turnoNick = partida.turno === 1 ? jugador1Nick : jugador2Nick;
        html += '<p class="mt-3"><strong>Turno:</strong> ' + turnoNick + ' (' + (partida.turno === 1 ? 'X' : 'O') + ')</p>';
      }
      html += '</div>';
      
      html += '</div></div>';
      
      $("#au").html(html);
      
      // Iniciar polling automático del tablero
      self.iniciarActualizacionAutomaticaTablero(codigo);
    })
    .catch(function (error) {
      console.error("Error al obtener partida:", error);
      self.mostrarMensaje("Error al cargar el tablero");
    });
};

// --------------------------------------------------
// Verificar si hay una partida en curso para este usuario
// --------------------------------------------------
this.verificarPartidaEnCurso = function () {
  var nick = $.cookie("nick");
  if (!nick || this.codigoPartidaActual) {
    return; // Ya hay una partida en curso o sin sesión
  }
  
  rest.obtenerTodasLasPartidas()
    .then(function (partidas) {
      // Buscar una partida iniciada donde este usuario esté
      var partidaActiva = partidas.find(function(p) {
        return p.iniciada && p.jugadores.includes(nick);
      });
      
      if (partidaActiva) {
        // Encontramos una partida en curso, mostrarla
        self.codigoPartidaActual = partidaActiva.codigo;
        self.mostrarTablero(partidaActiva.codigo);
      }
    })
    .catch(function (error) {
      // Error silencioso en polling
      console.log("Error en verificarPartidaEnCurso:", error);
    });
};

// --------------------------------------------------
// Volver al listado de partidas
// --------------------------------------------------
this.volverAlListado = function () {
  this.codigoPartidaActual = null;
  
  // Detener polling automático del tablero
  this.detenerActualizacionAutomaticaTablero();
  
  // Pausar la verificación de partida en curso para evitar que vuelva a mostrar el tablero
  if (this.intervaloVerificarPartida) {
    clearInterval(this.intervaloVerificarPartida);
    this.intervaloVerificarPartida = null;
  }
  
  // Limpiar el área del tablero
  $("#au").empty();
  
  // Mostrar el listado de partidas nuevamente
  var cardListado = $("#listaPartidas").closest(".card");
  if (cardListado.length) {
    cardListado.show();
  }
  
  this.actualizarListaPartidas();
};

// --------------------------------------------------
// Actualizar tablero en tiempo real vía WebSocket
// --------------------------------------------------
this.actualizarTableroEnTiempoReal = function (data) {
  // Actualizar celdas del tablero
  if (data.tablero) {
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        var valor = data.tablero[i][j];
        var simbolo = valor === 0 ? '' : (valor === 1 ? 'X' : 'O');
        var cellId = "celda-" + i + "-" + j;
        $("#" + cellId).text(simbolo);
      }
    }
  }
  
  // Solo resaltar celdas ganadoras si hay un ganador
  if (data.ganador && data.celdasGanadoras && data.celdasGanadoras.length > 0) {
    // Si no hay resaltado previo, agregarlo
    for (var i = 0; i < data.celdasGanadoras.length; i++) {
      var fila = data.celdasGanadoras[i][0];
      var col = data.celdasGanadoras[i][1];
      var cellId = "celda-" + fila + "-" + col;
      $("#" + cellId).addClass("celda-ganadora");
    }
  }
  
  // Actualizar estado del juego
  var estadoDiv = $("#estado-juego");
  if (estadoDiv.length > 0) {
    var estadoHtml = '';
    if (data.ganador) {
      if (data.ganador === 'empate') {
        estadoHtml = '<p class="text-warning mt-3">¡Empate!</p>';
      } else {
        var ganadorNick = data.ganador === 1 ? data.jugador1Nick : data.jugador2Nick;
        estadoHtml = '<p class="text-success mt-3">¡Ganador: ' + ganadorNick + ' (Jugador ' + data.ganador + ')!</p>';
      }
    } else {
      var turnoNick = data.turno === 1 ? data.jugador1Nick : data.jugador2Nick;
      estadoHtml = '<p class="mt-3"><strong>Turno:</strong> ' + turnoNick + ' (' + (data.turno === 1 ? 'X' : 'O') + ')</p>';
    }
    estadoDiv.html(estadoHtml);
  }
};

// --------------------------------------------------
// Polling automático para actualizar tablero durante el juego
// --------------------------------------------------
this.iniciarActualizacionAutomaticaTablero = function (codigo) {
  // Detener polling anterior si existe
  if (this.intervaloActualizarTablero) {
    clearInterval(this.intervaloActualizarTablero);
  }
  
  // Iniciar nuevo polling cada 500ms
  this.intervaloActualizarTablero = setInterval(function() {
    if (self.codigoPartidaActual === codigo) {
      rest.obtenerTodasLasPartidas()
        .then(function(partidas) {
          var partida = partidas.find(p => p.codigo === codigo);
          if (partida && partida.iniciada) {
            var data = {
              tablero: partida.tablero,
              turno: partida.turno,
              ganador: partida.ganador,
              celdasGanadoras: partida.celdasGanadoras || [],
              jugador1Nick: partida.jugadores[0] || "Jugador 1",
              jugador2Nick: partida.jugadores[1] || "Jugador 2"
            };
            self.actualizarTableroEnTiempoReal(data);
          }
        })
        .catch(function(error) {
          console.log("Error en polling de tablero:", error);
        });
    }
  }, 500); // Actualizar cada 500ms
};

// --------------------------------------------------
// Detener polling automático del tablero
// --------------------------------------------------
this.detenerActualizacionAutomaticaTablero = function () {
  if (this.intervaloActualizarTablero) {
    clearInterval(this.intervaloActualizarTablero);
    this.intervaloActualizarTablero = null;
  }
};

// --------------------------------------------------
// Hacer movimiento en tablero
// --------------------------------------------------
this.hacerMovimiento = function (codigo, fila, columna) {
  var nick = $.cookie("nick");
  if (!nick) return;
  
  rest.hacerMovimiento(nick, codigo, fila, columna)
    .then(function (resultado) {
      if (resultado.ok) {
        // Obtener la partida actual para tener los nicks
        rest.obtenerTodasLasPartidas()
          .then(function(partidas) {
            var partida = partidas.find(p => p.codigo === codigo);
            if (partida) {
              // Actualizar el tablero inmediatamente con los datos del servidor
              var data = {
                tablero: resultado.tablero,
                turno: resultado.turno,
                ganador: resultado.ganador,
                celdasGanadoras: resultado.celdasGanadoras || [],
                jugador1Nick: partida.jugadores[0] || "Jugador 1",
                jugador2Nick: partida.jugadores[1] || "Jugador 2"
              };
              self.actualizarTableroEnTiempoReal(data);
              console.log("Movimiento realizado y tablero actualizado localmente");
            }
          })
          .catch(function(error) {
            // Si no se pueden obtener los nicks, al menos actualizar el tablero
            var data = {
              tablero: resultado.tablero,
              turno: resultado.turno,
              ganador: resultado.ganador,
              celdasGanadoras: resultado.celdasGanadoras || []
            };
            self.actualizarTableroEnTiempoReal(data);
          });
      } else {
        self.mostrarMensaje("Error: " + resultado.msg);
      }
    })
    .catch(function (error) {
      console.error("Error al hacer movimiento:", error);
    });
};

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
