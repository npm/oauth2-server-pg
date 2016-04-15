// routes that should only be accessible
// to internal services. Do not mount these
// endpoints on a public-facing deployment
// of this service.
const Client = require('./client')
const Token = require('./token')
const _ = require('lodash')

module.exports = function (app) {
  app.get('/client', function (req, res) {
    var tokens = null
    // the internal micro-service must provide a shared secret.
    if (allowed(req, res)) {
      Token.objects.all().then(function (_tokens) {
        tokens = _tokens

        return Client.objects.filter({
          'id:in': tokens.map(function (token) {
            return token.client_id
          }),
          'deleted:isNull': true
        }).order(['-name'])
      }).then(function (clients) {
        clients.forEach(function (client) {
          client.tokens = tokens.filter(function (token) {
            return token.client_id === client.id
          })
        })

        res.setHeader('Content-Type', 'application/json')
        res.send(clients)
      })
    }
  })

  app.post('/client', function (req, res) {
    if (allowed(req, res)) {
      res.setHeader('Content-Type', 'application/json')
      var payload = _.pick(req.body, [
        'email',
        'name',
        'homepage',
        'description',
        'callback',
        'webhook',
        'type'
      ])
      Client.objects.create(payload)
        .then((client) => {
          res.status(201).send(JSON.stringify(client))
        }).catch((err) => {
          res.status(500).send(err.message)
        })
    }
  })

  app.post('/client/:id/token', function (req, res) {
    if (allowed(req, res)) {
      res.setHeader('Content-Type', 'application/json')
      Token.objects.create({
        client: Client.objects.get({client_id: req.params.id}),
        user_email: req.body.user_email
      }).then((token) => {
        res.status(201).send(JSON.stringify(token))
      }).catch((err) => {
        res.status(500).send(err.message)
      })
    }
  })
}

function allowed (req, res) {
  if (req.query.sharedFetchSecret === process.env.SHARED_FETCH_SECRET) {
    return true
  } else {
    res.status(404).send('not found')
    return false
  }
}
