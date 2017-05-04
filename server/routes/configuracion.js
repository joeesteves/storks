const express = require('express'),
  router = express.Router(),
  db = require('../db').db,
  Maybe = require('ramda-fantasy').Maybe,
  mailConfig = require('../mailConfig')

router.post('/', (req, res) => {
  db.update({ id: 'configuracion' }, Object.assign({}, req.body, { id: 'configuracion' }), { upsert: true })
  mailConfig.setMailConfig(req.body)
  res.status(201).send(req.body)
})

router.get('/', (req, res) => {
  db.findOne({ id: 'configuracion' }, (err, doc) => {
    res.status(200).send(Maybe(doc).getOrElse({ email: '--', smtp: '--', password: '--' }))
  })
})

module.exports = router