const exec = require('child_process').exec
const pg = require('pg')
const Promise = require('bluebird')
const Server = require('../lib/server')
var conn = null
var helper = {}

pg.defaults.poolSize = 1
helper.beginTransaction = function (done) {
  conn.query('BEGIN', done)
}

helper.endTransaction = function (done) {
  conn.query('ROLLBACK', done)
}

helper.resetDb = function (cb) {
  var config = require('../config-test')

  pg.connect(config.connection, function (err, _conn, done) {
    if (err) console.log(err)
    conn = _conn

    Promise.all([
      dropTable(conn, 'migrations'),
      dropTable(conn, 'tokens'),
      dropTable(conn, 'clients')
    ])
    .catch(function (err) {
      if (err) console.log(err)
      // the problem is probably that we
      // dropped the table already.
      return true
    })
    .done(function () {
      // repopulate the schema.
      exec('npm run-script migrate -- up', function (e, stdout, stderr) {
        done() // return the PG resource.
        return cb() // return to tests.
      })
    })
  })
}

function dropTable (conn, name) {
  const deferred = Promise.defer()

  conn.query('DROP TABLE ' + name + ';', function (err, result) {
    if (err) deferred.reject(err)
    else deferred.resolve(result)
  })

  return deferred.promise
}

helper.startServer = function (port, cb) {
  Server({port: port}, cb)
}

module.exports = helper
