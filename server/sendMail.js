const nodemailer = require('nodemailer')

const sendMail = (cb, conf) => {
  transporter = nodemailer.createTransport(`smtps://${conf.email.replace('@', '%40')}:${conf.password}@${conf.smtp}`),
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
  transporter.sendMail(mailOptions, cb)
}

module.exports = { sendMail }
