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
    $("#linkSalir").hide();
    $("#linkInicio").show();

    $("#au").empty();
    let cadena = `
      <div class="form-group mb-3">
        <label for="usr">Name:</label>
        <input type="text" class="form-control" id="usr" placeholder="Introduce el nick">
      </div>
      <button id="btnAU" type="button" class="btn btn-primary">Agregar usuario</button>
    `;
    $("#au").append(cadena);

    $("#btnAU").off("click").on("click", () => {
        const nick = $("#usr").val().trim();
        if (nick){
            rest.agregarUsuario(nick)
                .then(() => {
                    self.actualizarListaUsuarios();

                 
                    //localStorage.setItem("nick", nick);
                    self.mostrarMensaje("Bienvenido al sistema, "+nick);

                    // Mostrar "Salir" y ocultar "Inicio sesión"
                    $("#linkSalir").show();
                    $("#linkInicio").hide();
                })
                .catch(error => console.error("Error al agregar usuario:", error));
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
