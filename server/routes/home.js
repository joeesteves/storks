const express = require('express'),
  router = express.Router(),
  session = require('../session'),
  cookieParser = require('cookie-parser')

router.use(cookieParser())

router.use((req, res, next) => {
  // const authSession = session.getSession()
  const access_token = req.cookies.access_token,
    user_id = req.cookies.user_id
  // res.cookie("access_token", session.getSession().access_token)
  // res.cookie("user_id", session.getSession().user_id)
  if (access_token == authSession.access_token && user_id == authSession.user_id) {
    next()
  } else {
    res.redirect('/')
  }
})

router.use(express.static(__dirname + '/../../client/dist'))



module.exports = router