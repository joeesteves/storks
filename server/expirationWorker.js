const Rx = require('rxjs'),
  DB = require('./couchdb'),
  sendMail = require('./sendMail').sendMail,
  Maybe = require('ramda-fantasy').Maybe,
  moment = require('moment')


const checkForExpirations = () => {
  console.log("LOOKING FOR EXPIRATIONS")
  DB.find({
    _id: { "$regex": "vencimiento" },
    procesado: false,
    vencimiento: moment().toISOString().slice(0, 10)
  })
    // .then(vencimientos => vencimientos.map(venc => sendMail(sandMailCb(venc),venc)))
}



const sendMailCb = (doc) => {
  return (error, info) => {
    const { data, status } = error ? { data: error, status: 500 } : { data: info, status: 200 }
    if (status === 200) {
      DB.put(Object.assign(doc, { procesado: true }))
        .then(() => console.log('EXPIRATION PROCESED'))
    }
  }
}

module.exports = { checkForExpirations }