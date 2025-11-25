const nodemailer = require('nodemailer');

// ---------------------------------------
// URL A USAR
// ---------------------------------------

// Modo LOCAL
const url = "http://localhost:3000/";

// Modo PRODUCCIÓN (Cloud Run)
// const url = "https://arquitecturabase-582016504675.europe-north2.run.app/";



// Configuración del proveedor Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'cristilou965@gmail.com',         
        pass: 'sexyxqglbofkigxa'         
    }
});

// ENVIAR EMAIL DE CONFIRMACIÓN
module.exports.enviarEmail = async function (direccion, key, men) {
    const result = await transporter.sendMail({
        from: 'cristilou965@gmail.com',
        to: direccion,
        subject: men,
        text: 'Pulsa aquí para confirmar cuenta',
        html: `
            <p>Bienvenido a Sistema</p>
            <p><a href="${url}confirmarUsuario/${direccion}/${key}">
                Pulsa aquí para confirmar cuenta
            </a></p>
        `
    });

    return result;
};
