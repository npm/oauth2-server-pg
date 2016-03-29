#!/usr/bin/env node

require('yargs')
  .usage('$0 <cmd> [options]')
  .demand(1)
  .command('start', 'start the oauth2 server', function (yargs) {
    return yargs
      .option('port', {
        alias: 'p',
        describe: 'port to run server on',
        default: 9999
      })
      .option('model', {
        alias: 'm',
        describe: 'oauth grant model to use',
        default: './client-credentials'
      })
  }, function (argv) {
    require('../lib/server')(argv)
  })
  .help()
  .alias('help', 'h')
  .argv
