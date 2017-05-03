const express = require('express'),
  router = express.Router(),
  db = require('../db'),
  R = require('ramda'),
  Maybe = require('ramda-fantasy').Maybe,
  request = require('request'),
  sendMail = require('../sendMail').sendMail,
  session = require('../session').getSession,
  Rx = require('rxjs'),
  refreshToken = require('./refreshToken').refreshToken


router.post('/', (req, res) => {
  procesarPagos(req, res)
})


//pay.payer
//pay.order_id
const procesarPagos = (req, res) => {
  getPaymentData(req)
    .then(getOrderData)
    .then(flatDataForMails)
    .then(dataStream => {
      dataStream.subscribe(mailData => {
        sendMail((error, info) => {
          const { data, status } = error ? { data: error, status: 500 } : { data: info, status: 200 }
          res.status(status).send(data)
        }, mailData)

      })
    })
    .catch(e => {
      if (e.status === 401) {
        console.log('REFRESHTOKEN')
        refreshToken().then(() => {
          console.log(err)
          procesarPagos(req, res)
        })
      } else {
        res.sendStatus(e.status)
      }
    })

}

const getPaymentData = (req) => {
  console.log("PAYMENT")
  return new Promise((resolve, reject) => {
    request(`https://api.mercadopago.com/collections/notifications/${req.query.id}?access_token=${session().access_token}`,
      (err, res, body) => {
        if (err || (res && res.statusCode >= 400)) return reject({ res, status: res.statusCode })
        resolve(JSON.parse(body).collection)
      })
  })
}

const getOrderData = (pay) => {
  console.log("ORDER")
  return new Promise((resolve, reject) => {
    request(`https://api.mercadolibre.com/orders/${pay.order_id}?access_token=${session().access_token}`,
      (err, res, body) => {
        if (err || (res && res.statusCode >= 400)) return reject({ res, status: res.statusCode })
        resolve({ order: JSON.parse(body), pay })
      })
  })
}


const getLicencia = (producto) => {
  console.log("LICENCIA")
  const lic = producto.licencias[0]
  if (!lic) return { codigo: '', link: '' }
  if (lic.cantidad == 1) {
    licencias = [...producto.licencias.slice(1)]
  } else {
    licencias = [Object.assign({}, lic, { cantidad: lic.cantidad - 1 }), ...producto.licencias.slice(1)]
  }
  db.update({ id: producto.id }, { $set: { licencias } })
  return lic
}

const noMail = (producto) => R.isEmpty(producto.template)

const flatDataForMails = ({ order, pay }) => {
  return Rx.Observable.from(order.order_items)
    .flatMap(col => getLocalProducto(col.item))
    .map(producto => {
      const { codigo, link } = getLicencia(producto)
      return {
        nombre: pay.payer.first_name,
        apodo: pay.payer.nickname,
        email: pay.payer.email,
        producto: producto.title,
        template: producto.template,
        codigo,
        link
      }
    })
}

// array de productos {title, template, lic}


const getLocalProducto = (product) => {
  return Rx.Observable.create(function (obs) {
    db.findOne({ id: product.id }, (err, localProduct) => {
      Maybe(localProduct)
        .map(localProduct => {
          return noMail(localProduct) ? Maybe.Nothing : Object.assign(localProduct, product)
        })
        .map(lo => obs.next(lo)).isNothing ? console.log('no existe producto con id' + JSON.stringify(product)) : null
      obs.complete()
    })
  })
}

module.exports = router