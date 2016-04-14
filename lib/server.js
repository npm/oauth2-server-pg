'use strict'

var bodyParser = require('body-parser')
var express = require('express')
var OAuthServer = require('@npmcorp/express-oauth-server')
var InstallPrivateRoutes = require('./install-private-routes')

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

  if (opts.privateRoutes) InstallPrivateRoutes(app)

  var server = app.listen(opts.port || 9999, function () {
    console.info('server listening on ', opts.port)
    return cb(null, server)
  })
}
