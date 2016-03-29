/* global describe, it, before, after */

const helper = require('./test-helper')
const Client = require('../lib/client')
const Token = require('../lib/token')
const request = require('request')

require('chai').should()

console.info = function () {}

describe('OAuth2 Server', function () {
  var server = null

  before(function (done) {
    helper.startServer(9999, function (err, _server) {
      if (err) return done(err)
      server = _server
      helper.resetDb(done)
    })
  })

  describe('oauth', function () {
    var client = null

    before(function (done) {
      Client.objects.create({
        name: 'foo security',
        email: 'foo@example.com'
      }).then((_client) => {
        client = _client
        return done()
      })
    })

    it('allows token to be generated if client exists', function (done) {
      var credentials = {
        clientID: client.client_id,
        clientSecret: client.client_secret,
        site: 'http://localhost:9999'
      }
      var oauth2 = require('simple-oauth2')(credentials)

      oauth2.client.getToken({}, function saveToken (err, result) {
        if (err) return done(err)
        var token = oauth2.accessToken.create(result)
        token.token.access_token.should.match(/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/)
        token.token.refresh_token.should.match(/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/)
        token.expired().should.equal(false)
        return done()
      })
    })

    it('responds with error if client does not exist', function (done) {
      var credentials = {
        clientID: 'fake-id',
        clientSecret: 'fake-secret',
        site: 'http://localhost:9999'
      }
      var oauth2 = require('simple-oauth2')(credentials)

      oauth2.client.getToken({}, function saveToken (err, result) {
        if (err) return done(err)
        result.error_description.should.equal('Client not found')
        return done()
      })
    })

    it('allows protected resources to be accessed with token', function (done) {
      Token.objects.get({})
        .then((token) => {
          request.get('http://localhost:9999/ping', {
            auth: {
              bearer: token.access_token
            }
          }, function (err, res, body) {
            if (err) return done(err)
            res.statusCode.should.equal(200)
            body.should.equal('pong')
            return done()
          })
        })
    })

    it('protects a resource', function (done) {
      request.get('http://localhost:9999/ping', function (err, res, body) {
        if (err) return done(err)
        res.statusCode.should.equal(401)
        res.body.should.equal('unauthorized')
        return done()
      })
    })
  })

  after(function () {
    server.close()
  })
})
