const mongo = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

function CAD() {
    this.usuarios; // Colección de usuarios OAuth/Confirmados
    this.usuariosLocal; // Colección de usuarios locales (si la usas)
    this.conectado = false;

    this.conectar = async function (callback) {
        let cad = this;
        const uri = process.env.mongo_uri; 
        let client = await mongo.connect(uri);  
        const database = client.db("sistema"); 
        cad.usuarios = database.collection("usuarios");
        cad.usuariosLocal = database.collection("usuariosLocal"); 
        cad.conectado = true;
        console.log("Conectado a Mongo Atlas (CAD)");
        callback(database);
    };

    // --- FUNCIONES PRIVADAS (usadas por los métodos públicos) ---

    // Función privada: Busca un documento y devuelve el primero o 'undefined'
    function buscar(coleccion,criterio,callback){ 
        coleccion.find(criterio).toArray(function(error,usuarios){ 
            if (usuarios.length==0){ 
                callback(undefined);              
            } 
            else{ 
                callback(usuarios[0]); 
            } 
        }); 
    } 
    
    // Función privada: Inserta un documento y devuelve el elemento insertado
    function insertar(coleccion,elemento,callback){ 
        coleccion.insertOne(elemento,function(err,result){ 
            if(err){ 
                console.log("error"); 
            } 
            else{ 
                console.log("Nuevo elemento creado"); 
                callback(elemento); 
            } 
        }); 
    } 

    // Método público: busca en la colección 'usuarios'
// Espera a que la conexión esté lista (this.usuarios definido)
this.buscarUsuario = function (criterio, callback) {
    const cad = this;
    const MAX_INTENTOS = 50;
    let intentos = 0;

    function intentar() {
        if (cad.usuarios) {
            // Ya tenemos la colección -> usamos la función privada 'buscar'
            buscar(cad.usuarios, criterio, callback);
        } else if (intentos < MAX_INTENTOS) {
            intentos++;
            setTimeout(intentar, 100); // reintenta en 100 ms
        } else {
            console.error("BD no conectada en buscarUsuario");
            callback(undefined); // se comporta como "usuario no encontrado"
        }
    }

    intentar();
};

        // Método público: inserta en la colección 'usuarios'
        // También espera a que la conexión esté lista
        this.insertarUsuario = function (usuario, callback) {
            const cad = this;
            const MAX_INTENTOS = 50;
            let intentos = 0;

            function intentar() {
                if (cad.usuarios) {
                    // Usamos la función privada 'insertar'
                    insertar(cad.usuarios, usuario, function (elemento) {
                        // Adaptamos el resultado al formato que espera index.js:
                        // res = { ok: true, email: ... }
                        callback({ ok: true, email: elemento.email });
                    });
                } else if (intentos < MAX_INTENTOS) {
                    intentos++;
                    setTimeout(intentar, 100);
                } else {
                    console.error("BD no conectada en insertarUsuario");
                    callback({ ok: false, msg: "BD no conectada" });
                }
            }

            intentar();
        };


    // --- OTROS MÉTODOS EXISTENTES ---

    this.buscarOCrearUsuario = function (usr, callback) {
        // ... (Tu implementación de buscarOCrearUsuario)
        let cad = this;
        let intentos = 0;
        
        const intentar = () => {
            if (cad.usuarios && cad.conectado) {
                buscarOCrear(cad.usuarios, usr, callback);
            } else if (intentos < 50) {
                intentos++;
                setTimeout(intentar, 100);
            } else {
                console.error("Timeout: coleccion usuarios no esta lista");
                callback({ email: usr.email || "desconocido" });
            }
        };
        
        intentar();
    };

    async function buscarOCrear(coleccion, criterio, callback) {
        // ... (Tu implementación de buscarOCrear)
        try {
            const result = await coleccion.findOneAndUpdate(
                criterio,
                { $set: criterio },
                { upsert: true, returnDocument: "after", projection: { email: 1 } }
            );
            
            if (result && result.value && result.value.email) {
                console.log("Elemento actualizado");
                console.log(result.value.email);
                callback({ email: result.value.email });
            } else {
                console.error("No se pudo actualizar el usuario");
                callback({ email: criterio.email });
            }
        } catch (err) {
            console.error("Error en buscarOCrear:", err);
            callback({ email: criterio.email });
        }
    }
    
    // Nota: Este método ya existe en tu archivo y trabaja con 'usuariosLocal'. 
    // Lo mantengo aquí pero si quieres usar una sola colección ('usuarios') para todos, 
    // tendrías que refactorizar el código de registro local en index.js.
    this.registrarUsuario = async function (usr, callback) {
    // usr = { email, password }
    if (!this.usuariosLocal) {
        console.error("Falta colección usuariosLocal");
        callback({ ok: false, msg: "BD no conectada" });
        return;
    }
    try {
        // comprobar si existe
        const existe = await this.usuarios.findOne({ email: usr.email });
        if (existe) {
            callback({ ok: false, msg: "Email ya en uso" });
            return;
        }
        // insertar nuevo usuario
        await this.usuarios.insertOne({
            email: usr.email,
            password: usr.password
        });

        console.log("Usuario local registrado en Mongo:", usr.email);

        callback({ ok: true, email: usr.email });
    } catch (err) {
        console.error("Error en registrarUsuario (CAD):", err);
        callback({ ok: false, msg: "Error en BD" });
    }
    }; // Cierre de this.registrarUsuario
    

} // Cierre de CAD()

module.exports.CAD = CAD;

