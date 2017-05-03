const express = require('express'),
  router = express.Router(),
  Maybe = require('ramda-fantasy').Maybe
  appSettings = require('../appSettings'),
  request = require('request'),
  session = require('../session')

router.get('/', function (req, res) {
  Maybe(req.query.code)
    .map(code => {
      request.post('https://api.mercadolibre.com/oauth/token', {
        form: {
          grant_type: 'authorization_code',
          client_id: appSettings.client_id,
          client_secret: appSettings.cliente_secret,
          code,
          redirect_uri: appSettings.redirect_uri
        }
      }, (tokenError, tokenResponse, tokenBody) => {
        console.log("tokenError" + tokenError)
        console.log("tokenResponse" + tokenResponse)
        if (tokenError || Maybe(tokenResponse).map(tr => tr.Error).value) return res.send("API de Marcado Libre No disponible :( . Intentelo en unos minutos")
        session.updateSession(JSON.parse(tokenBody))
        console.log("REDIRECTING TO HOME...")
        res.redirect('/home') 
      })
    }).isJust || res.redirect(appSettings.authRedirectUrl)
})

module.exports = router