const request = require('request'),
  session = require('./session'),
  refreshToken = require('./routes/refreshToken').refreshToken,
  Rx = require('rxjs'),
  pago = require('./routes/pago'),
  msdb = require('./db').msdb,
  sendMail = require('./sendMail').sendMail

// EndPoints
const orderEndPoint = (session) => (
  `https://api.mercadoshops.com/v1/shops/${session.user_id}/orders/search?paid=true&channel=mshops&closed=false&access_token=${session.access_token}`)

const checkMercadoShops = (intervaloEnSegundos) => {
  setInterval(() => {
    getPaidOpenOrders(session.getSession())
      .flatMap(flatDataForMailsAdapter)
      .flatMap(firstTime)
      .filter(md => md.firstTime)
      .subscribe(mailData => {
        sendMail((error, info) => {
          const { data, status } = error ? { data: error, status: 500 } : { data: info, status: 200 }
          if (status === 200) {
            saveOrderId(mailData.orderId)
            pago.updateLicencias(mailData.updateLicenciasData)
          }
        }, mailData)
      },
      (e) => console.log(e),
      () => console.log("COMPLETED"))
  }, intervaloEnSegundos * 1000)
}

const saveOrderId = (orderId) => {
  msdb.insert({ orderId: orderId })
}
const firstTime = (mailData) => {
  console.log("FIRST TIME")
  return Rx.Observable.create(obs => {
    msdb.findOne({ orderId: mailData.orderId }, (err, reg) => {
      if (reg) console.log("REPEATED ORDER" + reg._id)
      obs.next(Object.assign(mailData, { firstTime: reg ? false : true }))
      obs.complete()
    })
  })
}


const getPaidOpenOrders = (injSession) => {
  console.log("GETING ORDERS")
  return Rx.Observable.create(obs => {
    request(orderEndPoint(injSession), (err, res, body) => {
      if (res && res.statusCode === 401) {
        return refreshToken()
          .then(() => {
            return getPaidOpenOrders(session.getSession())
          })
          .catch(console.log)
      }
      obs.next(JSON.parse(body))
      obs.complete()
    })

  })
    .flatMap(body => body.results)
}


const flatDataForMailsAdapter = (results) => {
  // return pago.flatDataForMails({
    orderId: results.id,
    productos: results.products.map(p => ({ id: p.external_reference, title: p.title })),
    nombre: results.buyer.name,
    apodo: results.buyer.nickname || results.buyer.name,
    email: results.buyer.mail,
  })
}

module.exports = { getPaidOpenOrders, checkMercadoShops }

// mailData = { nombre, apodo, email, producto, link, codigo}
// 
// nombre = buyer.name
// apodo = buyer.nickname || buyer.name
// email = buyer.mail
// producto = products[0].title
// codigo = getLicencia(productos[0]).codigo 
// link = getLicencia(productos[0]).link 
// template