const express = require('express'),
  router = express.Router(),
  DB = require('../couchdb'),
  Maybe = require('ramda-fantasy').Maybe

router.get('/', function (req, res) {
  DB.find({ doc_type: 'productos' })
    .then(prods => res.send(prods))
    .catch(e => res.sendStatus(e.res.sendStatus))
})

router.post('/', (req, res) => {
  const _id = `${(req.body.id).toString()}`
  DB.get(_id)
    .then(prod => DB.put(Object.assign({}, prod, { licencias: req.body.licencias, template: req.body.template })))
    .then(prod => res.send(prod))
    .catch(e => {
      if (e.res.statusCode === 404) {
        DB.put({ _id, doc_type: 'productos', licencias: req.body.licencias, template: req.body.template })
          .then(prod => res.send(prod)).catch(e => console.log("ERROR: " + JSON.stringify(e)))
      } else {
        res.sendStatus(e.res.statusCode)
      }
    })
})

module.exports = router