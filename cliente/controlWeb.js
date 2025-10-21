function ControlWeb(){
    // Función para actualizar la lista de usuarios
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
                
                // Actualizar contador
                $("#numUsuarios").text(Object.keys(usuarios).length);
            })
            .catch(error => {
                console.error("Error al obtener usuarios:", error);
            });
    };

    // Eliminar usuario
    this.eliminarUsuario = function(nick) {
        rest.eliminarUsuario(nick)
            .then(() => {
                this.actualizarListaUsuarios();
            })
            .catch(error => {
                console.error("Error al eliminar usuario:", error);
            });
    };

    // Buscar usuario
    this.buscarUsuario = function(nick) {
        rest.usuarioActivo(nick)
            .then(resultado => {
                alert(resultado.activo ? 
                    `El usuario ${nick} está activo` : 
                    `El usuario ${nick} no existe`);
            })
            .catch(error => {
                console.error("Error al buscar usuario:", error);
            });
    };

    this.mostrarMenuInicio = function() {
        // Creamos la cadena HTML que contendrá el formulario
        let cadena = '<div id="mAU">'; // Contenedor principal
        cadena += '<div class="form-group mb-3">';
        cadena += '<label for="usr">Name:</label>';
        cadena += '<input type="text" class="form-control" id="usr" placeholder="Introduce el nick">';
        cadena += '</div>';
        // Botones (dentro del div mAU)
        cadena += '<button id="btnAU" type="button" class="btn btn-primary">Agregar usuario</button>';
        cadena += '</div>';
        
        $("#au").append(cadena);

        // Handler para agregar usuario
        $("#btnAU").on("click", () => {
            const nick = $("#usr").val().trim();
            if (nick) {
                rest.agregarUsuario(nick)
                    .then(() => {
                        this.actualizarListaUsuarios();
                        $("#usr").val('');
                    })
                    .catch(error => {
                        console.error("Error al agregar usuario:", error);
                    });
            } else {
                alert("Por favor, introduce un nick antes de agregar.");
            }
        });

        // Handler para buscar usuario
        $("#btnBuscar").on("click", () => {
            const nick = $("#nickBuscar").val().trim();
            if (nick) {
                this.buscarUsuario(nick);
            }
        });

        // Cargar lista inicial
        this.actualizarListaUsuarios();
    };
}
