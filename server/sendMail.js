const nodemailer = require('nodemailer')


const sendMail = (cb, conf, data = {}) => {
  console.log(JSON.stringify(conf))
  transporter = nodemailer.createTransport(`smtps://${conf.email.replace('@', '%40')}:${conf.password}@${conf.smtp}`),
    mailOptions = {
      from: '"Storks Compras" <admin@elcaminosoftware.com>', // sender address
      to: data.email, // list of receivers
      subject: 'Gracias por su compra ✔', // Subject line
      text: 'Mail diseñado para verse con soporte HTML', // plaintext body
      html: parseTemplate(data)
    }
  transporter.sendMail(mailOptions, cb)
}


// nombre apodo email producto
const parseTemplate = (data) => ['codigo', 'link', 'nombre', 'apodo', 'email', 'producto'].reduce((prev, curr) => prev.replace(`@${curr}`, data[curr]), data.template)

module.exports = { sendMail }
