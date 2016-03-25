const helper = require('./test-helper')
const Client = require('../lib/client')

require('chai').should()

describe('client', function () {
  before(function (done) {
    helper.resetDb(done)
  })

  it('should allow a new client to be created', function (done) {
    Client.create({
      name: 'foo app'
    }).then(client => {
      client.client_id.should.match(/[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}/)
      return done()
    })
  })
})
