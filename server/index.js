const fs = require('fs'),
  https = require('https'),
  cors = require('cors'),
  app = require('express')(),
  bodyParser = require('body-parser'),
  routes = require('./routes'),
  appSettings = require('./appSettings'),
  mailConfig = require('./mailConfig'),
  worker = require('./worker'),
  session = require('./session')
  DB = require('./couchdb')
module.exports = () => {
  // Levanto Configuración del mail
  DB.get('configuracion')
  .then(conf => mailConfig.setMailConfig(conf))
  .catch(e => console.log("ERROR AL CARGAR CONFIGURACION:" + e))

  // CommonMiddleware
  app.use(cors())
  app.use(bodyParser.json()) // support json encoded bodies
  app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

  // Routes Settings
  app.get('/', (req, res) => res.redirect(appSettings.authRedirectUrl))
  app.use('/home', routes.home)
  app.use('/configuracion', routes.configuracion)
  app.use('/productos', routes.productos)
  app.use('/pago', routes.pago)
  app.use('/refresh', routes.refreshToken)
  app.use('/auth', routes.auth)

  // Create SSL server with autoSigned certs
  https.createServer({
    key: fs.readFileSync(`${__dirname}/ssl/private.pem`),
    cert: fs.readFileSync(`${__dirname}/ssl/server.crt`)
  }, app).listen(appSettings.port, '0.0.0.0')

  // app.listen(appSettings.port, '0.0.0.0')

  // worker.checkMercadoShops(60)
}