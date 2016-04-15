/* global describe, it, before, after, beforeEach, afterEach */

const _ = require('lodash')
const helper = require('./test-helper')
const Client = require('../lib/client')
const Token = require('../lib/token')
const request = require('request')
const Promise = require('bluebird')

require('chai').should()

console.info = function () {}

describe('OAuth2 Server', function () {
  var server = null

  before(function (done) {
    helper.startServer({
      port: 9999,
      privateRoutes: true
    }, function (err, _server) {
      if (err) return done(err)
      server = _server
      helper.resetDb(done)
    })
  })

  describe('oauth: client credentials flow', function () {
    var client = null

    before(helper.beginTransaction)
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

    after(helper.endTransaction)
  })

  describe('admin routes', function () {
    beforeEach(helper.beginTransaction)
    afterEach(helper.endTransaction)

    describe('GET /client', function () {
      beforeEach(function (done) {
        Client.objects.create({
          name: 'foo security'
        }).then(function (client) {
          return Promise.join(
            Token.objects.create({
              client: Client.objects.create({name: 'bar security'}),
              user_email: 'some@email.com'
            }),
            // create two tokens associated with the same
            // client so that we can test an edge-case.
            Token.objects.create({
              client: client,
              user_email: 'another@email.com'
            }),
            Token.objects.create({
              client: client,
              user_email: 'third@email.com'
            })
          )
        }).then(function () {
          return done()
        })
      })

      it('returns a list of clients if SHARED_FETCH_SECRET is correct', function (done) {
        process.env.SHARED_FETCH_SECRET = 'foobar'
        request.get({url: 'http://localhost:9999/client', json: true, qs: {
          sharedFetchSecret: 'foobar'
        }}, function (err, res, clients) {
          if (err) return done(err)
          clients.length.should.equal(2)
          var names = clients.map((client) => { return client.name })
          names.should.include('foo security')
          names.should.include('bar security')
          return done()
        })
      })

      it('returns a 404 status if SHARED_FETCH_SECRET is incorrect', function (done) {
        process.env.SHARED_FETCH_SECRET = 'foobar'
        request.get({url: 'http://localhost:9999/client', json: true, qs: {
          sharedFetchSecret: 'apple'
        }}, function (err, res, body) {
          if (err) return done(err)
          res.statusCode.should.equal(404)
          body.should.equal('not found')
          return done()
        })
      })
    })

    describe('POST /client', function () {
      it('creates a new client', function (done) {
        var payload = {
          email: 'ben@example.com',
          name: 'foo-integration',
          homepage: 'http://example.com',
          description: 'my awesome integration',
          callback: 'http://example.com/callback'
        }
        process.env.SHARED_FETCH_SECRET = 'foobar'
        request.post({
          url: 'http://localhost:9999/client',
          json: true,
          qs: {
            sharedFetchSecret: 'foobar'
          },
          body: payload
        }, (err, res, body) => {
          if (err) return done(err)
          res.statusCode.should.equal(201)
          _.pick(body, [
            'email',
            'name',
            'homepage',
            'description',
            'callback'
          ]).should.deep.equal(payload)
          return done()
        })
      })
    })

    describe('POST /client/:id/token', function () {
      var client = null
      beforeEach(function (done) {
        Client.objects.create({
          name: 'foo security'
        }).then((_client) => {
          client = _client
          return done()
        })
      })

      it('generates a token', function (done) {
        process.env.SHARED_FETCH_SECRET = 'foobar'
        request.post({
          url: 'http://localhost:9999/client/' + client.client_id + '/token',
          json: true,
          qs: {
            sharedFetchSecret: 'foobar'
          },
          body: {
            user_email: 'bob@example.com'
          }
        }, (err, res, body) => {
          if (err) return done(err)
          body.access_token.should.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)
          return done()
        })
      })
    })
  })

  after(function () {
    server.close()
  })
})
