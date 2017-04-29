const fs = require('fs'),
  http = require('http'),
  https = require('https'),
  cors = require('cors'),
  express = require('express'),
  app = express(),
  authRedirectUrl = `https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=5894928571543101`,
  request = require('request'),
  RF = require('ramda-fantasy'),
  db = require('./lokidb').db,
  bodyParser = require('body-parser'),
  Maybe = require('ramda-fantasy').Maybe,
  sendMail = require('./sendMail').sendMail

// ToDo La session enviarla  a lokijs
// Todo Implementar refresh_token

let session = JSON.parse(fs.readFileSync('session.json'))

// Create SSL server with autoSigned certs
https.createServer({
  key: fs.readFileSync(`${__dirname}/ssl/private.pem`),
  cert: fs.readFileSync(`${__dirname}/ssl/server.crt`)
}, app).listen(3000)

http.createServer(app).listen(8080)

app.use(cors())
app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies

// Redirect to auth
app.get('/', (req, res) => {
  res.redirect(authRedirectUrl)
})

app.get('/auth', function (req, res) {
  RF.Maybe(req.query.code)
    .map(code => {
      request.post('https://api.mercadolibre.com/oauth/token', {
        form: {
          grant_type: 'authorization_code',
          client_id: '5894928571543101',
          client_secret: 'NI64BVwyCD2TzZmWUY3uNo3slZBxte7a',
          code,
          redirect_uri: 'https://storks.elcaminosoftware.com:3000/auth'
        }
      }, (tokenError, tokenResponse, tokenBody) => {
        console.log("tokenError" + tokenError)
        console.log("tokenResponse" + tokenResponse)
        if (tokenError || RF.Maybe(tokenResponse).map(tr => tr.Error).value) return res.send("API de Marcado Libre No disponible :( . Intentelo en unos minutos")
        fs.writeFileSync('session.json', JSON.stringify(JSON.parse(tokenBody)))
        res.redirect('/home')
      })
    }).isJust || res.send('Ingresando a la APP...... :)')
})


// Home middleware para settear cookies
app.use('/home', (req, res, next) => {
  session = JSON.parse(fs.readFileSync('session.json'))
  res.cookie("access_token", session.access_token)
  res.cookie("user_id", session.user_id)
  next()
})

app.use('/home', express.static(__dirname + '/../client/dist'))

app.get('/productos', function (req, res) {
  db.loadDatabase({}, () => {
    res.send(db.getCollection('adicionales').find())
  })
})

app.post('/producto', (req, res) => {
  db.loadDatabase({}, () => {
    const col = db.getCollection('adicionales') ? db.getCollection('adicionales') : db.addCollection('adicionales')
    Maybe(col.findOne({ id: req.body.id }))
      .map(prod => {
        prod.licencias = req.body.licencias
        col.update(prod)
        return prod
      }).isNothing ? col.insert(req.body) : null
    db.saveDatabase()
    res.status(201).send(req.body)
  })
})

app.post('/pago', (req, res) => {
  // req.query {topic: 'payment', id: ## }
  // Get PaymentData
  //  https://api.mercadopago.com/collections/notifications/[ID]?access_token=[ACCESS_TOKEN]
  // Con el order_id
  // Consulto la orden y tendo el id de la publicacion. Con eso puedo buscar las licencias
  //https://api.mercadolibre.com/orders/1363452782?access_token=APP_USR-5894928571543101-042912-3846c4032335fd66f1b78aaa02628872__M_J__-254307406 

  sendMail((error, info) => {
    const { data, status } = error ? { data: error, status: 500 } : { data: info, status: 200 }
    res.status(status).send(data)
  })
})
