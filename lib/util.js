const exec = require('child_process').exec
const figures = require('figures')
const Promise = require('bluebird')
const request = require('request')
const resolve = require('url').resolve

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
      return deferred.resolve()
    })

    return deferred.promise
  },
  exists (addon, argv) {
    const deferred = Promise.defer()

    request.get(resolve(argv.registry, addon), function (err, res) {
      if (err) return deferred.reject(err)
      if (res.statusCode >= 400) {
        var msg = figures.cross + ' could not find addon "' + argv.addon + '" in registry ' + argv.registry
        return deferred.reject(Error(msg))
      }
      return deferred.resolve()
    })

    return deferred.promise
  }
}
