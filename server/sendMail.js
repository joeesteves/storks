const nodemailer = require('nodemailer'),
  transporter = nodemailer.createTransport('smtps://admin%40elcaminosoftware.com:Alfa17283946@smtp.zoho.com'),
  mailOptions = {
    from: '"Storks Compras" <admin@elcaminosoftware.com>', // sender address
    to: 'ajesteves@gmail.com', // list of receivers
    subject: 'Gracias por su compra ✔', // Subject line
    text: 'Prueba', // plaintext body
    html: `
  <html>
  <h1> MAIL DE PRUEBA </h1>
  </html>`
  }

const sendMail = (cb) => transporter.sendMail(mailOptions, cb)

module.exports = { sendMail }
