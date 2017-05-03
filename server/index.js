const fs = require('fs'),
  http = require('http'),
  https = require('https'),
  request = require('request'),
  cors = require('cors'),
  express = require('express'),
  app = express(),
  RF = require('ramda-fantasy'),
  R = require('ramda'),
  myAppKeys = { client_id: '5894928571543101', cliente_secret: 'NI64BVwyCD2TzZmWUY3uNo3slZBxte7a', redirect_uri: 'https://storks.elcaminosoftware.com:3000/auth' },
  authRedirectUrl = `https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=${myAppKeys.client_id}`,
  bodyParser = require('body-parser'),
  Maybe = require('ramda-fantasy').Maybe,
  sendMail = require('./sendMail').sendMail,
  Datastore = require('nedb'),
  db = new Datastore({ filename: 'db', autoload: true })

//AutoCompact every 20 min
db.persistence.setAutocompactionInterval(1200000)
// 

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
          client_id: myAppKeys.client_id,
          client_secret: myAppKeys.cliente_secret,
          code,
          redirect_uri: myAppKeys.redirect_uri
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
  db.find({ doc_type: 'productos' }, (e, prods) => res.send(prods))
})

app.post('/producto', (req, res) => {
  db.findOne({ id: req.body.id }, (e, doc) => {
    Maybe(doc).map(doc => {
      return db.update({ id: doc.id }, { $set: { licencias: req.body.licencias, template: req.body.template } })
    }).isNothing ? db.insert(Object.assign({}, req.body, { doc_type: 'productos' })) : null
  })
})

app.post('/pago', (req, res) => {
  // {"message":"invalid_token","cause":[],"error":"not_found","status":401} 
  // req.query {topic: 'payment', id: ## }
  // Get PaymentData
  // https://api.mercadopago.com/collections/notifications/[ID]?access_token=[ACCESS_TOKEN]
  // Guardar Nombre de comprador y mail 
  // Con el order_id
  // Consulto la orden y tendo el id de la publicacion. Con eso puedo buscar las licencias
  // https://api.mercadolibre.com/orders/1363452782?access_token=APP_USR-5894928571543101-042912-3846c4032335fd66f1b78aaa02628872__M_J__-254307406 
  // GUardar ID y nombre del producto
  // Busco el producto y la licencia //
  // Pasar toda esa data al mail para armar un mail asi
  // Estimado
  procesarPagos(req, res)

})

const procesarPagos = (req, res) => {
  let datos;
  getPaymentData(req)
    .then(pay => {
      datos = {
        cliente: pay.payer,
        orderId: pay.order_id
      }
      return getOrderData(pay.order_id)
    })
    .then(order => {
      console.log(JSON.stringify(order.order_items[0].item.title))

      datos['producto'] = {
        id: order.order_items[0].item.id,
        title: order.order_items[0].item.title
      }
      db.findOne({ id: datos.producto.id }, (e, pDoc) => {
        console.log("LICENCIA" + datos.producto.id)
        console.log(pDoc)
        if (!pDoc) return res.sendStatus(200)
        if (noMail(pDoc)) { // Cuando no hay template se devuelve 200 y no se envia mail
          console.log('NO MMAIL')
          return res.sendStatus(200)
        }
        db.findOne({ id: 'configuracion' }, (e, conf) => {

          sendMail((error, info) => {
            const { data, status } = error ? { data: error, status: 500 } : { data: info, status: 200 }
            res.status(status).send(data)
          }, conf, Object.assign({}, getLicencia(pDoc),
            {
              template: pDoc.template,
              nombre: datos.cliente.first_name,
              apodo: datos.cliente.nickname,
              email: datos.cliente.email,
              producto: datos.producto.title
            })
          )
        })
      })
    })
    .catch(e => {
      console.log(e.status)
      if (e.status === 401) {
        console.log("Refresh Token")
        refreshToken()
          .then(() => {
            procesarPagos(req, res)
          })
      } else {
        // console.log(e)
        res.sendStatus(e.status)
      }
    })

}
const getPaymentData = (req) => {
  console.log(req.query)
  return new Promise((resolve, reject) => {
    request(`https://api.mercadopago.com/collections/notifications/${req.query.id}?access_token=${session.access_token}`,
      (err, res, body) => {
        console.log('PAYMENT')
        if (err || (res && res.statusCode >= 400)) return reject({ res, status: res.statusCode })
        console.log("LLEGA??")
        resolve(JSON.parse(body).collection)
      })
  })
}

const getOrderData = (orderId) => {
  return new Promise((resolve, reject) => {
    request(`https://api.mercadolibre.com/orders/${orderId}?access_token=${session.access_token}`,
      (err, res, body) => {
        console.log('ORDER')
        if (err || (res && res.statusCode >= 400)) return reject({ res, status: res.statusCode })
        resolve(JSON.parse(body))
      })
  })
}

app.get('/refresh', (req, res) => {
  refreshToken()
    .then((body) => {
      res.send(body)
    })

})


const refreshToken = () => {
  return new Promise((resolve, reject) => {
    request(`https://api.mercadolibre.com/oauth/token?grant_type=refresh_token&client_id=${myAppKeys.client_id}&client_secret=${myAppKeys.cliente_secret}&refresh_token=${session.refresh_token}`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
      }
    }, (err, res, body) => {
      if (err || (res && res.statusCode >= 400)) return reject({ error: err, res })
      const newSession = Object.assign({}, JSON.parse(body), { user_id: session.user_id })
      fs.writeFileSync('session.json', JSON.stringify(newSession))
      session = newSession
      resolve(body)
    })

  })
}

const getLicencia = (producto) => {
  const lic = producto.licencias[0]
  if (!lic) return {}
  if (lic.cantidad == 1) {
    licencias = [...producto.licencias.slice(1)]
  } else {
    licencias = [Object.assign({}, lic, { cantidad: lic.cantidad - 1 }), ...producto.licencias.slice(1)]
  }
  db.update({ id: producto.id }, { $set: { licencias } })
  return lic
}

const noMail = (producto) => R.isEmpty(producto.template)


app.post('/configuracion', (req, res) => {
  db.findOne({ id: 'configuracion' }, (err, doc) => {
    Maybe(doc).map(doc => {
      return db.update({ id: doc.id }, Object.assign({}, req.body, { id: 'configuracion' }))
    }).isNothing ? db.insert(Object.assign({}, req.body, { id: 'configuracion' })) : null
    res.status(201).send(req.body)
  })
})

app.get('/configuracion', (req, res) => {
  db.findOne({ id: 'configuracion' }, (err, doc) => {
    res.status(200).send(Maybe(doc).getOrElse({ email: '--', smtp: '--', password: '--' }))
  })
})
