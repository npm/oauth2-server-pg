'use strict'

var bodyParser = require('body-parser')
var express = require('express')
var OAuthServer = require('@npmcorp/express-oauth-server')

module.exports = function (opts, cb) {
  var app = express()

  opts = opts || {}
  cb = cb || ((err) => { if (err) throw err })

  app.oauth = new OAuthServer({
    model: require(opts.model || './client-credentials')
  })
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({extended: false}))
  app.post('/oauth/token', app.oauth.token())

  app.get('/ping', app.oauth.authenticate(), function (req, res) {
    if (res.statusCode === 200) {
      res.send('pong')
    } else {
      res.send('unauthorized')
    }
  })

  var server = app.listen(opts.port || 9999, function () {
    console.info('server listening on ', opts.port)
    return cb(null, server)
  })
}
