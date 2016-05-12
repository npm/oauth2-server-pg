const isUrl = require('is-url')
const request = require('request')
const Promise = require('bluebird')
const figures = require('figures')
const npmInstall = require('./util').npmInstall
const getMeta = require('./util').getMeta
const exists = require('./util').exists

const prefix = 'npm-addon-'

exports.command = 'remove <addon>'
exports.describe = 'remove an OAuth 2.0 client'
exports.builder = function (yargs) {
  return yargs
    .option('registry', {
      alias: 'r',
      describe: 'npm registry URL',
      default: 'https://registry.npmjs.org'
    })
    .option('port', {
      alias: 'p',
      describe: 'port server is running on',
      default: 8084
    })
}

exports.handler = function (argv) {
  var addon = prefix + argv.addon
  var meta = null

  exists(addon, argv)
    .then(function () {
      console.info(figures.tick + ' found addon "' + argv.addon + '"')
      if (isUrl(argv.addon)) {
        return getMeta(argv.addon, argv)
      } else {
        return npmInstall(addon, argv)
      }
    })
    .then(function (meta) {
      console.log(meta)
      console.info(figures.tick + ' installed addon for "' + argv.addon + '"')
      return deleteClient(meta, argv)
    })
    .then(function () {
      console.info(figures.tick + ' deleted client for "' + argv.addon + '"')
    })
    .catch(function (err) {
      console.error(err.message)
    })
}

function deleteClient (meta, argv) {
  const deferred = Promise.defer()

  request.del({
    url: 'http://localhost:' + argv.port + '/client',
    json: true,
    qs: {
      sharedFetchSecret: process.env.SHARED_FETCH_SECRET
    },
    body: {
      name: meta.name
    }
  }, (err, res, client) => {
    if (err || res.statusCode >= 400) {
      var msg = figures.cross + ' failed to delete client for "' + argv.addon + '"'
      return deferred.reject(Error(msg))
    }
    return deferred.resolve(client)
  })

  return deferred.promise
}
