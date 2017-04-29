const loki = require('lokijs'),
  Maybe = require('ramda-fantasy').Maybe,
  db = new loki('productos.json')

module.exports = {
  db
} 