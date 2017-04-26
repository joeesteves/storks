const fs = require('fs'),
  https = require('https'),
  cors = require('cors'),
  express = require('express'),
  app = express(),
  authRedirectUrl = `https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=5894928571543101`,
  request = require('request')


https.createServer({
  key: fs.readFileSync(`${__dirname}/ssl/private.pem`),
  cert: fs.readFileSync(`${__dirname}/ssl/server.crt`)
}, app).listen(3000);

app.use(cors())

// Redirect to auth
app.get('/', (req, res) => {
  res.redirect(authRedirectUrl)
})

app.get('/auth', function (req, res) {
  if (req.query.code) {
    request.post('https://api.mercadolibre.com/oauth/token', {
      form: {
        grant_type: 'authorization_code',
        client_id: '5894928571543101',
        client_secret: 'NI64BVwyCD2TzZmWUY3uNo3slZBxte7a',
        code: req.query.code,
        redirect_uri: 'https://storks.elcaminosoftware.com:3000/auth'
      }
    }, (tokenError, tokenResponse, tokenBody) => {
      fs.writeFileSync('session.json', JSON.stringify(JSON.parse(tokenBody)))
      res.redirect('/home')
    })
  } else {

    return res.send('Ingresando a la app...');
  }
})

app.get('/home', function (req, res) {
  const sessionData = JSON.parse(fs.readFileSync('session.json','utf8'))
  console.log(sessionData.access_token)
  return res.send(`<h1>Hola este es su access token! ${sessionData.access_token}</h1>`);
})

