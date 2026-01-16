const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient(); 

async function accessCLAVECORREO() {
    const name = 'projects/arquitectura-base-475816/secrets/CLAVECORREO/versions/1';
    const [version] = await client.accessSecretVersion({
        name: name,
    });
    const datos = version.payload.data.toString("utf8");
    return datos;
}

async function accessCORREOUSUARIO() {
    const name = 'projects/arquitectura-base-475816/secrets/CORREOUSUARIO/versions/1';
    const [version] = await client.accessSecretVersion({ name });
    return version.payload.data.toString("utf8");
}

module.exports.obtenerOptions = async function(callback) {
    let options = {user: "", pass: "" };

    let user = await accessCORREOUSUARIO();
    let pass = await accessCLAVECORREO();

    options.user = user;
    options.pass = pass;

    callback(options);
};
