'use strict'

const Promise = require('bluebird')
const orm = require('ormnomnom')
const pg = require('pg')

orm.setConnection(function () {
  const deferred = Promise.defer()

  var config = require(process.env.DB_CONFIG ? process.env.DB_CONFIG : '../config-test')

  pg.connect(config.connection, function (err, conn, done) {
    if (err) {
      return deferred.reject(err)
    }
    orm._connection = conn
    return deferred.resolve({connection: conn, release: () => {
      return done()
    }})
  })

  return deferred.promise
})

module.exports = orm
