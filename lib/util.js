const exec = require('child_process').exec
const figures = require('figures')
const Promise = require('bluebird')
const request = require('request')
const resolve = require('url').resolve
const isUrl = require('is-url')

module.exports = {
  // npm install a module from an npm module.
  npmInstall (addon, argv) {
    const deferred = Promise.defer()

    console.info('running npm install for ' + argv.addon + ' ' + figures.ellipsis)
    exec('npm install ' + addon + '@latest --registry=' + argv.registry, function (err, stdout, stderr) {
      var errMessage = null
      if (err) errMessage = err.message
      if (stderr) errMessage = stderr
      if (errMessage) {
        var msg = figures.cross + ' failed to install ' + argv.addon
        return deferred.reject(Error(msg))
      }

      return deferred.resolve(require(addon))
    })

    return deferred.promise
  },
  exists (addon, argv) {
    const deferred = Promise.defer()
    var url = argv.addon
    if (!isUrl(url)) {
      url = resolve(argv.registry, addon)
    }

    request.get(url, function (err, res) {
      if (err) return deferred.reject(err)
      if (res.statusCode >= 400) {
        var msg = figures.cross + ' could not find addon "' + argv.addon + '" in registry ' + argv.registry
        return deferred.reject(Error(msg))
      }
      return deferred.resolve()
    })

    return deferred.promise
  },
  getMeta (url, argv) {
    const deferred = Promise.defer()

    request.get({
      url: url,
      json: true
    }, function (err, res, meta) {
      if (err) return deferred.reject(err)
      if (res.statusCode >= 400) {
        var msg = figures.cross + ' could not find addon "' + argv.addon + '" in registry ' + argv.registry
        return deferred.reject(Error(msg))
      }
      return deferred.resolve(meta)
    })

    return deferred.promise
  }
}
