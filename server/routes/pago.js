const express = require('express'),
  router = express.Router(),
  db = require('../db').db,
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
    .then(flatDataForMailsAdapter)
    .then(dataStream => {
      dataStream.subscribe(mailData => {
        sendMail((error, info) => {
          const { data, status } = error ? { data: error, status: 500 } : { data: info, status: 200 }
          res.status(status).send(data)
          if (status === 200) {
            mailData.updateLicenciasFx()
          }
        }, mailData)

      }, err => {
        res.status(200).send(err)
        console.log(err)
      })
    })
    .catch(e => {
      if (e.status === 401) {
        console.log('REFRESHTOKEN')
        refreshToken().then(() => {
          procesarPagos(req, res)
        })
      } else {
        res.sendStatus(e.status)
      }
      console.log(e)
    })

}

const getPaymentData = (req) => {
  console.log("PAYMENT")
  return new Promise((resolve, reject) => {
    request(`https://api.mercadopago.com/collections/notifications/${req.query.id}?access_token=${session().access_token}`,
      (err, res, body) => {
        if (err || (res && res.statusCode >= 400)) return reject({ res, status: res.statusCode })
        const jsonBody = JSON.parse(body).collection
        if (jsonBody.marketplace === 'MELI') {
          resolve(jsonBody)
        } else {
          reject("SOLO SE PROCESAN IPN MERCADOLIBRE")
        }
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


const getLicencia = (producto, db) => {
  console.log("LICENCIA")
  const lic = producto.licencias[0]
  let licencias;
  if (!lic) return { codigo: '', link: '', updateLicenciasFx: () => console.log("NO HAY LIC DISPONIBLES") }
  if (lic.cantidad == 1) {
    licencias = [...producto.licencias.slice(1)]
  } else {
    licencias = [Object.assign(lic, { cantidad: lic.cantidad - 1 }), ...producto.licencias.slice(1)]
  }
  const updateLicenciasFx = () => {
    console.log("UPDATING LICENCIA")
    db.update({ id: producto.id }, { $set: { licencias } }, (e) => {
      e ? console.log(e) : console.log("LICENCIA UPATED")
    })
  }
  return Object.assign(lic, { updateLicenciasFx })
}

const noMail = (producto) => R.isEmpty(producto.template)

const flatDataForMailsAdapter = ({ order, pay }) => {
  return flatDataForMails({
    productos: order.order_items.map(p => p.item),
    nombre: pay.payer.first_name,
    apodo: pay.payer.nickname,
    email: pay.payer.email,
  })
}

const flatDataForMails = (mixParams) => {
  return Rx.Observable.from(mixParams.productos)
    .flatMap(localProd => getLocalProducto(localProd))
    .map(producto => {
      const { codigo, link, updateLicenciasFx } = getLicencia(producto, db)
      return {
        orderId: mixParams.orderId, // Para mercadoShops
        nombre: mixParams.nombre,
        apodo: mixParams.apodo,
        email: mixParams.email,
        producto: producto.title,
        template: producto.template,
        codigo,
        link,
        updateLicenciasFx
      }
    })
}

// devuelve el producto con datos de distintos origenes {title, template, lic}
const getLocalProducto = (product) => {
  return Rx.Observable.create(function (obs) {
    db.findOne({ id: product.id }, (err, localProduct) => {
      Maybe(localProduct)
        .map(localProduct => {
          return noMail(localProduct) ? Maybe.Nothing : Object.assign(localProduct, product)
        })
        .map(lo => obs.next(lo)).isNothing ? obs.error("No existe producto con id" + JSON.stringify(product)) : null
      obs.complete()
    })
  })
}

module.exports = { getLicencia, flatDataForMails, router }