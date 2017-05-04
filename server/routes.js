module.exports = {
  home: require('./routes/home'),
  configuracion: require('./routes/configuracion'),
  productos: require('./routes/productos'),
  pago: require('./routes/pago').router,
  refreshToken: require('./routes/refreshToken').router,
  auth: require('./routes/auth')
}