const nodemailer = require('nodemailer'),
  mailConfig = require('./mailConfig'),
  Maybe = require('ramda-fantasy').Maybe


const sendMail = (cb, mailData = {}) => {
  const conf = mailConfig.getMailConfig()
  transporter = nodemailer.createTransport(`smtps://${conf.email.replace('@', '%40')}:${conf.password}@${conf.smtp}`),
    mailOptions = {
      from: `"PremiumFD" <${conf.email}>`, // sender address
      to: mailData.email, // list of receivers
      subject: getSubject(mailData.template), // Subject line
      text: 'Mail diseñado para verse con soporte HTML', // plaintext body
      html: parseTemplate(mailData)
    }
  transporter.sendMail(mailOptions, cb)
}

const regExpAsunto =  /@asunto\((.*)\)/
const getSubject = (template) => {
  return Maybe(template)
  .chain(template => Maybe(template.match(regExpAsunto)))
  .map(match => match[1])
  .getOrElse('Gracias por su compra')
}
// nombre apodo email producto
const parseTemplate = (data) => {
  return ['codigo', 'link', 'nombre', 'apodo', 'email', 'producto'].reduce((prev, curr) => prev.replace(`@${curr}`, data[curr]), data.template.replace(regExpAsunto,''))
}

module.exports = { sendMail }

// mailData = { nombre, apodo, email, producto, link, codigo, template}