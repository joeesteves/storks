const express = require('express'),
  router = express.Router(),
  session = require('../session').getSession
  
router.use((req, res, next) => {
  res.cookie("access_token", session().access_token)
  res.cookie("user_id", session().user_id)
  next()
})

router.use(express.static(__dirname + '/../../client/dist'))

module.exports = router