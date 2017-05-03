const nodemailer = require('nodemailer')

const sendMail = (cb, conf, template, lic) => {
  transporter = nodemailer.createTransport(`smtps://${conf.email.replace('@', '%40')}:${conf.password}@${conf.smtp}`),
    mailOptions = {
      from: '"Storks Compras" <admin@elcaminosoftware.com>', // sender address
      to: 'ajesteves@gmail.com', // list of receivers
      subject: 'Gracias por su compra ✔', // Subject line
      text: 'Prueba', // plaintext body
      html: parseTemplate(template, lic)
    }
  transporter.sendMail(mailOptions, cb)
}

const parseTemplate = (template, lic) => ['codigo', 'downloadLink'].reduce((prev, curr) => prev.replace(`@${curr}`, lic[curr]), template)



module.exports = { sendMail }
