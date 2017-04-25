const fs = require('fs'),
  https = require('https'),
  cors = require('cors'),
  express = require('express'),
  app = express(),
  authRedirectUrl = `https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=5894928571543101`


https.createServer({
  key: fs.readFileSync(`${__dirname}/ssl/private.pem`),
  cert: fs.readFileSync(`${__dirname}/ssl/server.crt`)
}, app).listen(3000);

app.use(cors())

// Redirect to auth
app.get('/', (req, res) => {
  res.redirect(authRedirectUrl)
})

app.get('/home', function (req, res) {
  res.header('Content-type', 'text/html')
  fs.writeFileSync('session.json', JSON.stringify(req.query))
  return res.end(`<h1>Hello, Secure Worlds! ${JSON.stringify(req.params)}</h1>`);
})