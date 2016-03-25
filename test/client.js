const expect = require('chai').expect
const helper = require('./test-helper')
const Client = require('../lib/client')

require('chai').should()

describe('client', function () {
  before(function (done) {
    helper.resetDb(done)
  })

  it('should allow a new client to be created', function (done) {
    Client.create({
      name: 'lift security'
    }).then(client => {
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
    Client.create({
      name: 'lift security'
    }).catch(err => {
      err.message.should.match(/duplicate key/)
      return done()
    })
  })
})
