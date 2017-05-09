const appSettings = () => {
  const port = process.env.PORT || 8282,
    serverUri = 'entregas.premiumfd.com',
    client_id = '1320434091455044'
  return {
    port,
    client_id,
    cliente_secret: 'x8CAePdu5PxjBcKxHGHmaqeXo6U7Isia',
    // redirect_uri: `https://${serverUri}:${port}/auth`,
    redirect_uri: `https://${serverUri}/auth`,
    authRedirectUrl: `https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=${client_id}`,
  }
}
// module.exports = appSettings()
