const express = require('express'),
  router = express.Router(),
  R = require('ramda'),
  Maybe = require('ramda-fantasy').Maybe,
  request = require('request'),
  sendMail = require('../sendMail').sendMail,
  session = require('../session').getSession,
  Rx = require('rxjs'),
  refreshToken = require('./refreshToken').refreshToken,
  moment = require('moment'),
  DB = require('../couchdb')


router.post('/', (req, res) => {
  console.log("POST PAGO")
  procesarPagos(req, res)
})

const procesarPagos = (req, res) => {
  getPaymentData(req)
    .then(getOrderData)
    .then(flatDataForMailsAdapter)
    .then(filterFirstTime)
    .then(_sendDataStreamToMailSender.bind(this, res))
    .catch(_handlePagosErrors.bind(this, req, res))
}

const filterFirstTime = (obs) => {
  return obs
    .flatMap(firstTime)
    .filter(md => md.firstTime)
}


const firstTime = (mailData) => {
  console.log("FIRST TIME")
  return Rx.Observable.create(obs => {
    DB.get(`meliOrderId_${mailData.orderId}`)
      .then(reg => {
        console.log("REPEATED ORDER " + reg._id)
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


const _sendDataStreamToMailSender = (res, dataStream) => {
  dataStream.subscribe(
    mailData => sendMail(_sendMailCb(mailData), mailData), //onNext
    err => console.log(err),  // onError
    () => res.sendStatus(200) // onComplete
  )
}

const _handlePagosErrors = (req, res, e) => {
  Maybe(e.msg).map(console.log)
  Maybe(e.status)
    .chain(status => (status === 401) ? Maybe(status) : Maybe.Nothing())
    .isNothing ? res.sendStatus(200) : refreshToken().then(() => procesarPagos(req, res))
}


const saveMeliOrderId = (orderId) => DB.put({ _id: `meliOrderId_${orderId}`, doc_type: 'MELIOrders' })

const _saveMailForReTry = (mailData) => {
  console.log("SAVING MAIL FOR RETRY")
  DB.get(`pendingmails_${mailData._id}`)
    .then(m => Object.assign({}, m, mailData, { retry: Maybe(mailData.retry).getOrElse(0) + 1, doc_type: 'pendingmails' }))
    .then(() => setTimeout(_retrySendMail, 60000))
    .catch(e => {
      if (e.res.statusCode === 404)
        DB.put(Object.assign({ _id: `pendingmails_${new Date().toISOString()}` }, mailData, { retry: Maybe(mailData.retry).getOrElse(0) + 1, doc_type: 'pendingmails' }))
    })
}

const _retrySendMail = () => {
  DB.find({ doc_type: 'pendingmails' })
    .then(mails => {
      mails.forEach(pendingMail => {
        pendingMail.retry < 4 ? sendMail(_sendMailCb(pendingMail), pendingMail) : console.log("MAIL BAD CONFIGURATION")
      })
    })
}

const _sendMailCb = (mailData) => {
  console.log("CALLBACK GENERATION")
  return ((error, info) => {
    const { data, status } = error ? { data: error, status: 500 } : { data: info, status: 200 }
    if (status === 200) {
      console.log("MAIL SENT")
      saveMeliOrderId(mailData.orderId) // Guarda el ID
      updateLicencias(mailData.updateLicenciasData)
      _removeReTryMail(mailData)
      savePurchaseForAlertExpiration(mailData)
    } else {
      console.log(data)
      _saveMailForReTry(mailData)
    }
  })
}
const _removeReTryMail = (mailData) => {
  return DB.get(mailData._id)
    .then(m => DB.put(Object.assign({}, d, { _deleted: true })))
    .catch(e => console.log("REMOVE RETRY MAIL"))
}

//Agrego control de pagos rechazados. (Linea 92 donde dice rejected)
const getPaymentData = (req) => {
  console.log("PAYMENT")
  return new Promise((resolve, reject) => {
    if (!req.query.id)
      return reject({ msg: "IPN CONFIGURACION" })
    request(`https://api.mercadopago.com/collections/notifications/${req.query.id}?access_token=${session().access_token}`,
      (err, res, body) => {
        if (err || (res && res.statusCode >= 400))
          return reject({ res, status: res.statusCode, msg: "ERROR AL CONSULTAR LA API DE MERCADO PAGO" })
        Maybe(JSON.parse(body).collection)
          .chain(j => (j.status !== 'rejected') ? Maybe(j) : Maybe.Nothing())
          .chain(j => (j.marketplace === 'MELI') ? Maybe(j) : Maybe.Nothing())
          .chain(j => (moment(j.date_approved) > moment(new Date()).subtract(1, 'hour')) ? Maybe(j) : Maybe.Nothing())
          .map(j => resolve(j)).isNothing ? reject({ msg: "SOLO SE PROCESAN IPN MERCADOLIBRE o IPN NUEVOS" }) : null
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
        Maybe(JSON.parse(body))
          .chain(j => j.tags.includes('not_delivered') ? Maybe(j) : Maybe.Nothing() )
          .map(j => resolve({ order: j, pay })).isNothing ? reject({ res, status: res.statusCode, msg: "YA ESTABA ENTREGADO" }) : null

      })
  })
}
// Agrego OrderId para IPN tambien
const flatDataForMailsAdapter = ({ order, pay }) => {
  return flatDataForMails({
    orderId: order.id,
    productos: R.chain(n => R.times(() => n.item, n.quantity), order.order_items), // devuelve un item[]
    nombre: pay.payer.first_name,
    apodo: pay.payer.nickname,
    email: order.email,
  })
}

// returns Observable
const flatDataForMails = (mixParams) => {
  console.log("FLATTING DATA")
  return Rx.Observable.from(mixParams.productos)
    .flatMap(localProd => getLocalProducto(localProd))
    .filter(_isValidForMail)
    .map(producto => {
      const { codigo, link, updateLicenciasData } = getLicencia(producto)
      return {
        orderId: mixParams.orderId, // Para mercadoShops
        nombre: mixParams.nombre,
        apodo: mixParams.apodo,
        email: mixParams.email,
        producto: producto.title,
        template: producto.template,
        vigencia: producto.vigencia,
        codigo,
        link,
        updateLicenciasData
      }
    })
}
// devuelve el producto con datos de distintos origenes {title, template, lic}
const getLocalProducto = (product) => {
  console.log("EL PRODUCTO SOLICITADO ES:" + product.id)
  return Rx.Observable.create(function (obs) {
    DB.get(product.id)
      .then(localProduct => {
        obs.next(Object.assign(localProduct, product))
        obs.complete()
      })
      .catch(e => {
        obs.next({
          missing: true,
          msg: `El producto ${product.title}(${product.id}) no esta configurado para el envio`
        })
        obs.complete()
      })
  })
}

const getLicencia = (producto) => {
  console.log("LICENCIA")
  let licencias;
  const lic = producto.licencias ? producto.licencias[0] : null
  if (!lic || R.isEmpty(lic)) return { codigo: '', link: '', updateLicenciasData: null }
  if (lic.cantidad > 1) {
    licencias = [Object.assign({}, lic, { cantidad: lic.cantidad - 1 }), ...producto.licencias.slice(1)]
  } else {
    licencias = [...producto.licencias.slice(1)]
  }
  return Object.assign({}, lic, { updateLicenciasData: { productId: producto.id, licencias } })

}

const updateLicencias = (obj) => {
  console.log("UPDATING LICENCIA")
  Maybe(obj)
    .map(({ productId, licencias }) => {
      DB.get(productId)
        .then(p => {
          if (licencias && licencias.length === 0) {
            return DB.put(Object.assign({}, p, { licencias, template: '' }))
          } else {
            return DB.put(Object.assign({}, p, { licencias }))
          }
        })
        .then(() => console.log("LICENCIA UPATED"))
        .catch(e => console.log("ERROR UPDATING LICENCIAS:" + e))
    }).isNothing ? console.log("PRODUCTO SIN LICENCIAS") : null
}


const exists = a => a ? true : false
const _isValidForMail = (producto) => {
  if (producto.missing) {
    console.log(producto.msg)
    return false
  } else {
    return exists(producto.template)
  }
}

//savePurchase for alert expiration

const savePurchaseForAlertExpiration = (mailData) => {
  if(!mailData.vigencia){
    console.log('FALTA VENCIMIENTO')
    console.log(JSON.stringify(mailData))
    return false
  }
  return DB.put({
    _id: `vencimiento_${mailData.orderId}`,
    producto: mailData.producto,
    nombre: mailData.nombre,
    email: mailData.email,
    fechaCompra: moment().toISOString().slice(0,10),
    vencimiento: moment().add(mailData.vigencia, 'days').toISOString().slice(0,10),
    procesado: false
  })
    .then(() => console.log('SAVE EXPIRATION'))

}

module.exports = { getLicencia, flatDataForMails, router, updateLicencias, savePurchaseForAlertExpiration }