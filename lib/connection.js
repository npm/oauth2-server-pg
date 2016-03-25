const Promise = require('bluebird')
const orm = require('ormnomnom')
const pg = require('pg')

orm.setConnection(function () {
  const deferred = Promise.defer()

  var config = require('../config-test')

  pg.connect(config.connection, function (err, conn, done) {
    if (err) {
      return deferred.reject(err)
    }
    return deferred.resolve({connection: conn, release: done})
  })

  return deferred.promise
})

module.exports = orm
