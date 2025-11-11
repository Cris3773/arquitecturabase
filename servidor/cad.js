function CAD(){ 
    const mongo=require("mongodb").MongoClient; 
    const ObjectId=require("mongodb").ObjectId; 
    this.usuarios;
    this.conectar=async function(callback){ 
let cad=this; 
let client= new 
mongo("mongodb+srv://cris3773:1234@cluster0.sqrzlk8.mongodb.net/?appName=Cluster0"); 
await client.connect(); 
const database=client.db("sistema"); 
cad.usuarios=database.collection("usuarios"); 
callback(database); 
}
} 
module.exports.CAD=CAD; 
