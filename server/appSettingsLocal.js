const appSettings = () => {
  const port = process.env.PORT || 8282,
    serverUri = 'localhost',
    client_id = '5272706309971562'
  return {
    port,
    client_id,
    cliente_secret: 's2MLYI7GXfNAsNXDAfUwVKJ5URUFeHJt',
    redirect_uri: `https://${serverUri}:${port}/auth`,
    // redirect_uri: `https://${serverUri}/auth`,
    authRedirectUrl: `https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=${client_id}`,
  }
}
// module.exports = appSettings()
