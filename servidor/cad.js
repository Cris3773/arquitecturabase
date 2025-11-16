const mongo = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

function CAD() {
    this.usuarios;
    this.conectado = false;

    this.conectar = async function (callback) {
        let cad = this;
        const uri = process.env.mongo_uri; 
        let client = await mongo.connect(uri);  
        const database = client.db("sistema"); 
        cad.usuarios = database.collection("usuarios");
        cad.conectado = true;
        console.log("Conectado a Mongo Atlas (CAD)");
        callback(database);
    };

    this.buscarOCrearUsuario = function (usr, callback) {
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
}

module.exports.CAD = CAD;

