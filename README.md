# oauth2-server-pg

[![Build Status](https://travis-ci.org/npm/oauth2-server-pg.svg)](https://travis-ci.org/npm/oauth2-server-pg)
[![Coverage Status](https://coveralls.io/repos/github/npm/oauth2-server-pg/badge.svg?branch=tokens)](https://coveralls.io/github/npm/oauth2-server-pg?branch=tokens)
[![NPM version](https://img.shields.io/npm/v/oauth2-server-pg.svg)](https://www.npmjs.com/package/oauth2-server-pg)

A PostgreSQL OAuth 2.0 Server.

## Usage

**starting server:**

```sh
./bin/oauth2-server-pg.js start --help
```

**generating a client:**

```sh
POST /client
```

**generating a token:**

```sh
POST /client/:client_id/token
```

## License

ISC
