const nodemailer = require('nodemailer'),
  mailConfig = require('./mailConfig')


const sendMail = (cb, mailData = {}) => {
  console.log("MAIL SENT")
  const conf = mailConfig.getMailConfig()
  transporter = nodemailer.createTransport(`smtps://${conf.email.replace('@', '%40')}:${conf.password}@${conf.smtp}`),
    mailOptions = {
      from: '"Storks Compras" <admin@elcaminosoftware.com>', // sender address
      to: mailData.email, // list of receivers
      subject: 'Aquí esta su pedido', // Subject line
      text: 'Mail diseñado para verse con soporte HTML', // plaintext body
      html: parseTemplate(mailData)
    }
  transporter.sendMail(mailOptions, cb)
}


// nombre apodo email producto
const parseTemplate = (data) => ['codigo', 'link', 'nombre', 'apodo', 'email', 'producto'].reduce((prev, curr) => prev.replace(`@${curr}`, data[curr]), data.template)

module.exports = { sendMail }

// mailData = { nombre, apodo, email, producto, link, codigo, template}