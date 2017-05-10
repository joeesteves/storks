const express = require('express'),
  router = express.Router(),
  Maybe = require('ramda-fantasy').Maybe,
  sessionApi = require('../session'),
  session = sessionApi.getSession,
  appSettings = require('../appSettings'),
  fs = require('fs'),
  request = require('request')


router.get('/', (req, res) => {
  refreshToken()
  .then(()=> res.sendStatus(200))
  .catch(e => res.status(401).send(e))
})

const refreshToken = () => {
  console.log("OTHER TOKEN")
  return new Promise((resolve, reject) => {
    request(`https://api.mercadolibre.com/oauth/token?grant_type=refresh_token&client_id=${appSettings.client_id}&client_secret=${appSettings.cliente_secret}&refresh_token=${session().refresh_token}`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json'
      }
    }, (err, res, body) => {
      if (err || (res && res.statusCode >= 400)) return reject({ error: err, res })
      const newSession = Object.assign({}, JSON.parse(body), { user_id: session().user_id })
      fs.writeFileSync('session.json', JSON.stringify(newSession))
      sessionApi.updateSession( newSession )
      resolve(body)
    })
  })
}

module.exports = { router, refreshToken }