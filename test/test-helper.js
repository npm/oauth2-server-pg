const exec = require('child_process').exec
const pg = require('pg')
const Promise = require('bluebird')
var helper = {}

helper.resetDb = function (cb) {
  var config = require('../config-test')

  pg.connect(config.connection, function (err, conn, done) {
    if (err) console.log(err)

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

module.exports = helper
