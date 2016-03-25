'use strict'

module.exports = Token

const Client = require('./client')
const moment = require('moment')
const orm = require('./connection')
const uuid = require('uuid')

function Token (opts) {
  this.id = opts.id
  this.client_id = opts.client_id
  this.access_token = opts.access_token
  this.refresh_token = opts.refresh_token
  this.user_email = opts.user_email
  this.refresh_expires = opts.refresh_expires
  this.access_expires = opts.access_expires
  this.created = opts.created
  this.deleted = opts.deleted
}

Token.prototype.client = function () {
  return Client.objects.get({
    id: this.client_id
  })
}

Token.objects = orm(Token, {
  id: orm.joi.number(),
  access_token: orm.joi.string().default(uuid.v4, 'uuid v4'),
  refresh_token: orm.joi.string().default(uuid.v4, 'uuid v4'),
  user_email: orm.joi.string().regex(/@/).required(),
  refresh_expires: orm.joi.date().default(function () {
    return moment().add(10, 'years').toDate()
  }, 'far off date'),
  access_expires: orm.joi.date().default(function () {
    return moment().add(10, 'years').toDate()
  }, 'far off date'),
  created: orm.joi.date().default(function () {
    return (new Date()).toISOString()
  }, 'date'),
  deleted: orm.joi.date(),
  client: orm.fk(Client)
})
