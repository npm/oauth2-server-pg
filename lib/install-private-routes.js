// routes that should only be accessible
// to internal services.
var Client = require('./client')
var Token = require('./token')

module.exports = function (app) {
  // used by the internal annotations-api to pull a list of
  // services providing annotations. TODO: this logic will serve the
  // usecase of npm Enterprise, which will have a small number of
  // tokens, but we will need to figure out how to approach this
  // problem differently for the SASS product.
  app.get('/client', function (req, res) {
    var tokens = null
    // the internal micro-service must provide a shared secret.
    if (req.query.sharedFetchSecret === process.env.SHARED_FETCH_SECRET) {
      Token.objects.all().then(function (_tokens) {
        tokens = _tokens

        return Client.objects.filter({
          'id:in': tokens.map(function (token) {
            return token.client_id
          })
        })
      }).then(function (clients) {
        clients.forEach(function (client) {
          client.tokens = tokens.filter(function (token) {
            return token.client_id === client.id
          })
        })

        res.setHeader('Content-Type', 'application/json')
        res.send(clients)
      })
    } else {
      res.status(404).send('not found')
    }
  })
}
