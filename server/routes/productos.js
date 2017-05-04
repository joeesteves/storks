const express = require('express'),
  router = express.Router(),
  db = require('../db').db,
  Maybe = require('ramda-fantasy').Maybe

router.get('/', function (req, res) {
  db.find({ doc_type: 'productos' }, (e, prods) => res.send(prods))
})

router.post('/', (req, res) => {
  db.update({ id: (req.body.id).toString(), doc_type: 'productos' }, { $set: { licencias: req.body.licencias, template: req.body.template } }, { upsert: true }, (err) => {
    err ? res.sendStatus(500) : res.sendStatus(201)
  })
})

module.exports = router