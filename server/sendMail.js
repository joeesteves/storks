const nodemailer = require('nodemailer'),
  mailConfig = require('./mailConfig'),
  Maybe = require('ramda-fantasy').Maybe
  DB = require('./couchdb')

const sendMail = (cb, mailData = {}) => {
  console.log("START SENDING MAIL")
  console.log(mailData)
  console.log(parseTemplate(mailData))
  const conf = mailConfig.getMailConfig()
  const smtpConfig = {
    service: 'gmail',
    auth: {
      user: conf.email,
      pass: conf.password
    }
    // host: conf.smtp,
    // port: 465,
    // // secure: true, // upgrade later with STARTTLS
    // auth: {
    //   user: conf.email,
    //   pass: conf.password
    // },
    // tls: { rejectUnauthorized: false }
  }
  transporter = nodemailer.createTransport(smtpConfig),
    mailOptions = {
      from: `"PremiumFD" <${conf.email}>`, // sender address
      to: mailData.email,  // list of receivers
      bcc: "francood_cb@hotmail.com", //AutoCopy
      subject: getSubject(mailData.template), // Subject line
      text: 'html no soportado por mail',
      html: parseTemplate(mailData)
    }
  transporter.sendMail(mailOptions, cb)
}


const regExpAsunto = /@asunto\((.*)\)/
const getSubject = (template) => {
  return Maybe(template)
    .chain(template => Maybe(template.match(regExpAsunto)))
    .map(match => match[1])
    .getOrElse('Gracias por su compra')
}
// nombre apodo email producto
const parseTemplate = (data) => {
  return ['codigo', 'link', 'nombre', 'apodo', 'email', 'producto'].reduce((prev, curr) => prev.replace(`@${curr}`, data[curr]), data.template.replace(regExpAsunto, ''))
}

module.exports = { sendMail }

// mailData = { nombre, apodo, email, producto, link, codigo, template}