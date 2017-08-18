const request = require('request'),
  session = require('./session'),
  refreshToken = require('./routes/refreshToken').refreshToken,
  Rx = require('rxjs'),
  pago = require('./routes/pago'),
  DB = require('./couchdb'),
  sendMail = require('./sendMail').sendMail,
  Maybe = require('ramda-fantasy').Maybe

// EndPoints
const orderEndPoint = (session) => (
  `https://api.mercadoshops.com/v1/shops/${session.user_id}/orders/search?paid=true&channel=mshops&closed=false&access_token=${session.access_token}`)

const checkMercadoShops = (intervaloEnSegundos) => {
  setInterval(() => {
    if(!session.getSession())
      return false
    getPaidOpenOrders(session.getSession())
      .flatMap(flatDataForMailsAdapter)
      .flatMap(firstTime)
      .filter(md => md.firstTime)
      .subscribe(mailData => {
        saveOrderId(mailData.orderId)
          .then(() => {
            sendMail((error, info) => {
              const { data, status } = error ? { data: error, status: 500 } : { data: info, status: 200 }
              Maybe(status).chain(s => s === 200 ? Maybe.Just(s) : Maybe.Nothing())
                .map(m => {
                  console.log('MAIL SENT')
                  Maybe(mailData.updateLicenciasData)
                    .map(m => pago.updateLicencias(m)).isNothing ? console.log("NO LICENCIA TO UPDATE") : null
                }).isNothing ? console.log("ERROR: " + data) : null
            }, mailData)
          }).catch(e => console.log("SAVING ORDER ID" + e))
      },
      (e) => console.log(e),
      () => console.log("COMPLETED"))
  }, intervaloEnSegundos * 1000)
}

const saveOrderId = (orderId) => DB.put({ _id: `orderId_${orderId}`, doc_type: 'MSOrders' })

const firstTime = (mailData) => {
  console.log("FIRST TIME")
  return Rx.Observable.create(obs => {
    DB.get(`orderId_${mailData.orderId}`)
      .then(reg => {
        console.log("REPEATED ORDER" + reg._id)
        obs.next(Object.assign(mailData, { firstTime: false }))
        obs.complete()
      })
      .catch((e) => {
        if (e.res && e.res.statusCode === 404) {
          obs.next(Object.assign(mailData, { firstTime: true }))
          obs.complete()
        }
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
  return pago.flatDataForMails({
    orderId: results.id,
    productos: results.products.map(p => ({ id: p.external_reference, title: p.title })),
    nombre: results.buyer.name,
    apodo: results.buyer.nickname || results.buyer.name,
    email: results.buyer.mail,
  })
}

module.exports = { getPaidOpenOrders, checkMercadoShops }