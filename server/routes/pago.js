const express = require('express'),
  router = express.Router(),
  db = require('../db').db,
  mailsdb = require('../db').mailsdb,
  R = require('ramda'),
  Maybe = require('ramda-fantasy').Maybe,
  request = require('request'),
  sendMail = require('../sendMail').sendMail,
  session = require('../session').getSession,
  Rx = require('rxjs'),
  refreshToken = require('./refreshToken').refreshToken

router.post('/', (req, res) => {
  console.log("POST PAGO")
  procesarPagos(req, res)
})

const procesarPagos = (req, res) => {
  getPaymentData(req)
    .then(getOrderData)
    .then(flatDataForMailsAdapter)
    .then(_sendDataStreamToMailSender.bind(this, res))
    .catch(_handlePagosErrors)
}

const _sendDataStreamToMailSender = (res, dataStream) => {
  dataStream.subscribe(
    mailData => {
      sendMail(_sendMailCb(mailData), mailData)
    },
    err => console.log(err),  // onError
    () => res.sendStatus(200) // onComplete
  )
}

const _handlePagosErrors = (e) => {
  Maybe(e.status)
    .map(status => {
      if (status === 401) {
        refreshToken().then(() => procesarPagos(req, res))
      } else {
        res.status(200).send(e)
      }
    }).isNothing ? res.sendStatus(200) : null
}

const _saveMailForReTry = (mailData) => {
  mailsdb.update({ _id: mailData._id }, mailData, { upsert: true }, err => {
    err ? _saveMailForReTry(mailData) : _retrySendMail()
  })
}

const _retrySendMail = () => {
  mailsdb.find({}, (err, pendingMails) => {
    pendingMails.forEach(pendingMail => {
      sendMail(_sendMailCb(pendingMail), pendingMail)
    })
  })
}

const _sendMailCb = (mailData) => {
  return (error, info) => {
    const { data, status } = error ? { data: error, status: 500 } : { data: info, status: 200 }
    if (status === 200) {
      updateLicencias(mailData.updateLicenciasData)
      _removeReTryMail(mailData)
    } else {
      _saveMailForReTry(mailData)
    }
  }
}
const _removeReTryMail = (mailData) => {
  mailsdb.remove({ _id: mailData._id })
}

const getPaymentData = (req) => {
  console.log("PAYMENT")
  return new Promise((resolve, reject) => {
    if (!req.query.id)
      return reject("IPN CONFIGURACION")
    request(`https://api.mercadopago.com/collections/notifications/${req.query.id}?access_token=${session().access_token}`,
      (err, res, body) => {
        if (err || (res && res.statusCode >= 400))
          return reject({ res, status: res.statusCode })
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
        if (err || (res && res.statusCode >= 400))
          return reject({ res, status: res.statusCode })
        resolve({ order: JSON.parse(body), pay })
      })
  })
}

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
    .filter(_isValidForMail)
    .map(producto => {
      const { codigo, link, updateLicenciasData } = getLicencia(producto, db)
      return {
        orderId: mixParams.orderId, // Para mercadoShops
        nombre: mixParams.nombre,
        apodo: mixParams.apodo,
        email: mixParams.email,
        producto: producto.title,
        template: producto.template,
        codigo,
        link,
        updateLicenciasData
      }
    })
}
// devuelve el producto con datos de distintos origenes {title, template, lic}
const getLocalProducto = (product) => {
  console.log(product.id)
  return Rx.Observable.create(function (obs) {
    db.findOne({ id: product.id }, (err, localProduct) => {
      Maybe(localProduct)
        .map(localProduct => obs.next(Object.assign(localProduct, product)))
        .isNothing ? obs.next({
          missing: true,
          msg: `El producto ${product.title}(${product.id}) no esta configurado para el envio`
        }) : null
      obs.complete()
    })
  })
}

const getLicencia = (producto, db) => {
  console.log("LICENCIA")
  let licencias;
  const lic = producto.licencias ? producto.licencias[0] : null
  if (!lic || R.isEmpty(lic)) return { codigo: '', link: '', updateLicenciasData: null }
  if (lic.cantidad == 1) {
    licencias = [...producto.licencias.slice(1)]
  } else {
    licencias = [Object.assign(lic, { cantidad: lic.cantidad - 1 }), ...producto.licencias.slice(1)]
  }
  return Object.assign({}, lic, { updateLicenciasData: { productId: producto.id, licencias } })

}

const updateLicencias = ({ productId, licencias }) => {
  console.log("UPDATING LICENCIA")
  db.update({ id: productId }, { $set: { licencias } }, (e) => {
    e ? console.log("error") : console.log("LICENCIA UPATED")
  })
}


const exists = a => a ? true : false
const _isValidForMail = (producto) => exists(producto.template)

module.exports = { getLicencia, flatDataForMails, router, updateLicencias }