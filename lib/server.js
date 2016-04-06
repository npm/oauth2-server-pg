'use strict'

var bodyParser = require('body-parser')
var express = require('express')
var OAuthServer = require('@npmcorp/express-oauth-server')
var Client = require('./client')
var Token = require('./token')

module.exports = function (opts, cb) {
  var app = express()

  opts = opts || {}

  // OAuth endpoints.
  app.oauth = new OAuthServer({
    model: require(opts.model || './client-credentials')
  })
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: false}))
  app.post('/oauth/token', app.oauth.token())

  // used to test OAuth credentials.
  app.get('/ping', app.oauth.authenticate(), function (req, res) {
    if (res.statusCode === 200) {
      res.send('pong')
    } else {
      res.send('unauthorized')
    }
  })

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

  var server = app.listen(opts.port || 9999, function () {
    console.info('server listening on ', opts.port)
    return cb(null, server)
  })
}
