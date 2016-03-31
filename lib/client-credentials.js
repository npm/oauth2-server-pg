'use strict'

const Client = require('../lib/client')
const Token = require('../lib/token')
const Promise = require('bluebird')
const uuid = require('uuid')

module.exports = {
  getAccessToken (bearerToken) {
    const getToken = Token.objects.get({access_token: bearerToken})
    const getClient = getToken.get('client')

    return Promise.join(
      getToken,
      getClient
    ).spread(function (token, client) {
      return {
        accessToken: token.access_token,
        client: client,
        accessTokenExpiresAt: token.access_expires,
        refreshTokenExpiresAt: token.refresh_expires,
        user: {
          email: token.user_email
        }
      }
    })
  },

  getClient (clientId, clientSecret) {
    return Client.objects.get({
      client_id: clientId,
      client_secret: clientSecret
    })
    .then(function (client) {
      return {
        clientId: client.client_id,
        clientSecret: client.client_secret,
        grants: ['client_credentials']
      }
    })
  },

  getUserFromClient (client) {
    return Client.objects.get({
      client_id: client.clientId,
      client_secret: client.clientSecret
    }).then(function (client) {
      return {
        email: client.email
      }
    })
  },

  saveToken (token, client, user) {
    return Token.objects.create({
      client: Client.objects.get({
        client_id: client.clientId,
        client_secret: client.clientSecret
      }),
      user_email: user.email
    }).then((token) => {
      return {
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        accessTokenExpiresAt: token.access_expires,
        refreshTokenExpiresAt: token.refresh_expires,
        client: client,
        user: user
      }
    })
  },

  validateScope (user, client, scope) {
    // we don't have any scopes that we
    // enforce yet. We will probably want
    // to eventually store this as a field on
    // tokens.
    return true
  },

  generateAccessToken () {
    return Promise.resolve(uuid.v4())
  }
}
