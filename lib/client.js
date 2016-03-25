'use strict'

const orm = require('./connection')
const uuid = require('uuid')

class Client {
  constructor (opts) {
    this.id = opts.id
    this.client_id = opts.client_id
    this.secret = opts.secret
    this.name = opts.name
    this.homepage = opts.homepage
    this.description = opts.homepage
    this.callback = opts.callback
    this.created = opts.created
    this.deleted = opts.deleted
  }
}

const ClientObjects = orm(Client, {
  id: orm.joi.number(),
  client_id: orm.joi.string().default(uuid.v4, 'uuid v4'),
  secret: orm.joi.string().default(uuid.v4, 'uuid v4'),
  name: orm.joi.string(),
  homepage: orm.joi.string(),
  description: orm.joi.string(),
  callback: orm.joi.string(),
  created: orm.joi.date(),
  deleted: orm.joi.date()
})

module.exports = ClientObjects
