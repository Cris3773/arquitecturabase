const nodemailer = require('nodemailer');
const gv = require('./gestorVariables.js'); 

// ---------------------------------------
// URL A USAR
// ---------------------------------------

const url = (process.env.BASE_URL || 'http://localhost:3000')
  .replace(/\/$/, '');


let transporter;

gv.obtenerOptions(function(res){ 
    let options = res;

    transporter = nodemailer.createTransport({ 
        service: 'gmail', 
        auth: options 
    }); 
});

// ENVIAR EMAIL DE CONFIRMACIÓN
module.exports.enviarEmail = async function (direccion, key, men) {
    const result = await transporter.sendMail({
        from: 'cristilou965@gmail.com',   // o mejor: options.user si lo pasas también
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
