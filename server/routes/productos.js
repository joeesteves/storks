const express = require('express'),
  router = express.Router(),
  db = require('../db'),
  Maybe = require('ramda-fantasy').Maybe

router.get('/', function (req, res) {
  db.find({ doc_type: 'productos' }, (e, prods) => res.send(prods))
})

router.post('/', (req, res) => {
  db.findOne({ id: req.body.id }, (e, doc) => {
    Maybe(doc).map(doc => {
      return db.update({ id: doc.id }, { $set: { licencias: req.body.licencias, template: req.body.template } })
    }).isNothing ? db.insert(Object.assign({}, req.body, { doc_type: 'productos' })) : null
  })
})

module.exports = router