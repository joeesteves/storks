const express = require('express'),
  router = express.Router(),
  DB = require('../couchdb'),
  Maybe = require('ramda-fantasy').Maybe,
  mailConfig = require('../mailConfig')

router.post('/', (req, res) => {
  DB.get('configuracion')
    .then(doc => DB.put(Object.assign({}, doc, req.body)))
    .then(() => {
      mailConfig.setMailConfig(req.body)
      res.status(201).send(req.body)
    })
    .catch(e => "ERROR GUARDANDO LA CONFIGURACION" + e)
})

router.get('/', (req, res) => {
  DB.get('configuracion')
  .then(doc => res.status(200).send(doc))
  .catch(e => console.log("ERROR GETTING CONF:" + e))
})

module.exports = router