const datos = require("./cad.js"); // [cite: 375] Dependencia de la CAD

function Sistema() {
    this.usuarios = {};

    // 🔑 CONEXIÓN A LA CAD (Capa de Acceso a Datos) [cite: 377]
    this.cad = new datos.CAD();
    this.cad.conectar(function (db) {
        console.log("Conectado a Mongo Atlas"); // [cite: 381]
    });

    // --- Agregar usuario
    this.agregarUsuario = function (nick) {
        this.usuarios[nick] = new Usuario(nick);
        return { nick: nick };
    };

    // --- REGISTRAR USUARIO LOCAL (para solucionar el TypeError en index.js)
    this.registrarUsuario = function (obj, callback) {
        let modelo = this;
        // Se asegura de definir 'nick' si solo viene 'email' [cite: 611, 612]
        if (!obj.nick) {
            obj.nick = obj.email;
        }

        // Delega en la CAD para buscar si el usuario ya existe [cite: 613]
        this.cad.buscarUsuario(obj, function (usr) {
            if (!usr) {
                // Si no existe, lo inserta [cite: 615, 616]
                modelo.cad.insertarUsuario(obj, function (res) {
                    callback(res); // [cite: 617]
                });
            } else {
                // Si existe, devuelve error [cite: 622]
                callback({ "email": -1 });
            }
        });
    };


    // --- Obtener todos
    this.obtenerUsuarios = function () {
        return this.usuarios;
    };

    // --- Eliminar usuario
    this.eliminarUsuario = function (nick) {
        delete this.usuarios[nick];
    };

    // --- Número de usuarios
    this.numeroUsuarios = function () {
        return Object.keys(this.usuarios).length;
    };

    // --- Usuario activo
    this.usuarioActivo = function (nick) {
        return this.usuarios.hasOwnProperty(nick);
    };

    // Buscar usuario (usa función auxiliar buscar)
    this.buscarUsuario = function (obj, callback) {
        buscar(this.usuarios, obj, callback);
    };

    // Versión callback de agregarUsuario
    this.agregarUsuarioCB = function (nick, callback) {
        let res = this.agregarUsuario(nick);
        callback(res);
    };

    this.insertarUsuario = function (usuario, callback) {
        let res = this.agregarUsuario(usuario.nick);
        callback(res);
    };

    // Versión callback de eliminarUsuario
    this.eliminarUsuarioCB = function (nick, callback) {
        this.eliminarUsuario(nick);
        callback({ ok: true });
    };

    // Versión callback de usuarioActivo
    this.usuarioActivoCB = function (nick, callback) {
        let activo = this.usuarioActivo(nick);
        callback(activo);
    };
}

// ---------- Clase Usuario ----------
function Usuario(nick) {
    this.nick = nick;
}


function buscar(coleccion, obj, callback) {
    let encontrado = null;

    for (let k in coleccion) {
        if (k.toLowerCase() === obj.nick.toLowerCase()) {
            encontrado = coleccion[k];
            break;
        }
    }

    callback(encontrado);
}

module.exports.Sistema = Sistema;