#!/usr/bin/env node

require('yargs')
  .usage('$0 <cmd> [options]')
  .demand(1)
  .command('start', 'start the oauth2 server', function (yargs) {
    return yargs
      .option('port', {
        alias: 'p',
        describe: 'port to run server on',
        default: 8084
      })
      .option('model', {
        alias: 'm',
        describe: 'oauth grant model to use',
        default: './client-credentials'
      })
      .option('private-routes', {
        default: false,
        type: 'boolean',
        describe: "should admin-routes, e.g., client list endpoint, be installed (don't run this if service is Internet-facing)"
      })
  }, function (argv) {
    require('../lib/server')(argv)
  })
  .command(require('../lib/install'))
  .command(require('../lib/remove'))
  .help()
  .alias('help', 'h')
  .argv
