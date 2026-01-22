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
  const enlace = `${url}/confirmarUsuario/${direccion}/${key}`;

  const result = await transporter.sendMail({
    from: 'cristilou965@gmail.com',
    to: direccion,
    subject: men,
    text: `Pulsa aquí para confirmar cuenta: ${enlace}`,
    html: `
      <p>Bienvenido a Sistema</p>
      <p>
        <a href="${enlace}">
          Pulsa aquí para confirmar cuenta
        </a>
      </p>
    `
  });

  return result;
};

