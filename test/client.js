/* global describe, it, before, beforeEach, afterEach */

const expect = require('chai').expect
const helper = require('./test-helper')
const Client = require('../lib/client')
const Token = require('../lib/token')
const Promise = require('bluebird')

require('chai').should()

describe('Client Model', function () {
  before(function (done) {
    helper.resetDb(done)
  })
  beforeEach(helper.beginTransaction)
  afterEach(helper.endTransaction)

  it('should allow a new client to be created', function (done) {
    Client.objects.create({
      name: 'foo security'
    }).then((client) => {
      client.client_id.should.match(/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/)
      client.client_secret.should.match(/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/)

      expect(client.homepage).to.equal(null)
      expect(client.description).to.equal(null)
      expect(client.callback).to.equal(null)

      expect(client.created instanceof Date).to.equal(true)

      return done()
    })
  })

  it('should not allow two clients with the same name to be created', function (done) {
    Promise.join(
      Client.objects.create({
        name: 'foo security'
      }),
      Client.objects.create({
        name: 'foo security'
      })
    ).catch((err) => {
      err.message.should.match(/duplicate key/)
      return done()
    })
  })

  it('allows a client to be fetched based on client_id and client_secret', function (done) {
    var assertClient = null

    Client.objects.create({
      name: 'bar security'
    }).then((client) => {
      assertClient = client
      return Client.objects.get({
        client_id: client.client_id,
        client_secret: client.client_secret
      })
    }).then((client) => {
      client.should.deep.equal(assertClient)
      return done()
    })
  })

  describe('tokens', function () {
    it('allows a token associated with a client to be created', function (done) {
      Token.objects.create({
        client: Client.objects.create({name: 'bar security'}),
        user_email: 'some@email.com'
      }).then((token) => {
        token.access_token.should.match(/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/)
        token.refresh_token.should.match(/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/)
        return token.client
      }).then((client) => {
        client.name.should.equal('bar security')
        return done()
      })
    })
  })
})
