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
        } else {
            // No hay sesión: mostramos LOGIN
            $("#registro").empty();
            $("#mAU").remove();
            $("#msg").remove();

            self.mostrarLogin();

            $("#linkSalir").hide();
            $("#linkInicio").show();
        }

        // A la derecha siempre mostramos la lista de usuarios
        self.actualizarListaUsuarios();
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
