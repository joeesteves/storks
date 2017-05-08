const express = require('express'),
  router = express.Router(),
  session = require('../session'),
  cookieParser = require('cookie-parser')

router.use(cookieParser())

router.use((req, res, next) => {
  const authSession = session.getSession()
  const { access_token, user_id } = req.cookies
  if (access_token == authSession.access_token && user_id == authSession.user_id) {
    next()
  } else {
    res.redirect('/')
  }
})

router.use(express.static(__dirname + '/../../client/dist'))



module.exports = router