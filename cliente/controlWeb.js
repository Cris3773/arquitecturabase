function ControlWeb(){
    var self = this;

    // Comprobar sesión
    this.comprobarSesion = function(){
    const nick = $.cookie("nick");
    if (nick){
        self.mostrarMensaje("Bienvenido al sistema, " + nick);
        $("#linkSalir").show();
        $("#linkInicio").hide();          
    }else{
        self.mostrarAgregarUsuario();
        $("#linkSalir").hide();
        $("#linkInicio").show();           
    }
    };

    this.mostrarMensaje = function(txt){
        $("#au").html('<div class="alert alert-info mt-3">'+txt+'</div>');
    };

    // Mostrar formulario de inicio
    this.mostrarAgregarUsuario = function(){ 
        $('#bnv').remove(); 
        $('#mAU').remove(); 

        let cadena = '<div id="mAU">';
        cadena += '<div class="card"><div class="card-body">';
        cadena += '<div class="form-group">';
        cadena += '<label for="nick">Nick:</label>';
        cadena += '<p><input type="text" class="form-control" id="nick" placeholder="Introduce un nick"></p>';
        cadena += '<button id="btnAU" type="submit" class="btn btn-primary">Submit</button>';
        
        // 🔹 Botón oficial de Google (según la práctica)
        cadena += '<div class="mt-3">';
        cadena += '<a href="/auth/google">';
        cadena += '<img src="./cliente/img/boton_google.png" style="height:40px;">';
        cadena += '</a></div>';

        cadena += '</div></div></div></div>'; 

        $("#au").append(cadena);

        // Handler para el botón normal de "Submit"
        $("#btnAU").off("click").on("click", () => {
            const nick = $("#nick").val().trim();
            if (nick){
            rest.agregarUsuario(nick);
            } else {
            alert("Por favor, introduce un nick antes de agregar.");
            }
        });
   };



    // Actualizar lista
    this.actualizarListaUsuarios = function() {
        rest.obtenerUsuarios()
            .then(usuarios => {
                const lista = $("#listaUsuarios");
                lista.empty();
                for(let nick in usuarios) {
                    lista.append(`
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            ${nick}
                            <button class="btn btn-danger btn-sm" onclick="cw.eliminarUsuario('${nick}')">
                                <i class="bi bi-trash"></i> Eliminar
                            </button>
                        </li>
                    `);
                }
                $("#numUsuarios").text(Object.keys(usuarios).length);
            })
            .catch(error => console.error("Error al obtener usuarios:", error));
    };

    // Eliminar usuario
    this.eliminarUsuario = function(nick) {
        rest.eliminarUsuario(nick)
            .then(() => self.actualizarListaUsuarios())
            .catch(error => console.error("Error al eliminar usuario:", error));
    };

    
    this.buscarUsuario = function(nick) {
        rest.usuarioActivo(nick)
            .then(resultado => {
                alert(resultado.activo ? 
                    `El usuario ${nick} está activo` : 
                    `El usuario ${nick} no existe`);
            })
            .catch(error => console.error("Error al buscar usuario:", error));
    };

    
    this.mostrarMenuInicio = function() {
        self.mostrarAgregarUsuario();
        self.actualizarListaUsuarios();
    };

    this.salir = function(){
        $.removeCookie("nick", { path: "/" });
        location.reload();
    };
}
