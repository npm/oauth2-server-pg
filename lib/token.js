'use strict'

module.exports = Token

const Client = require('./client')
const moment = require('moment')
const orm = require('./connection')
const Promise = require('bluebird')
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
  this._client = opts.client
}

Token.prototype = {
  get constructor () {
    return Token
  },
  get client () {
    if (this._client && this._client.id === this.client_id) {
      return Promise.resolve(this._client)
    } else {
      return Client.objects.get({
        id: this.client_id
      }).then((obj) => (this._client = obj))
    }
  },
  set client (c) {
    this._client = c
    this.client_id = c.id
  }
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
