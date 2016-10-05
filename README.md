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

## Development and Testing

For convenience, this project can leverage Docker to run Postgres for you. If you have Docker installed (and the daemon running), then a Postgres db will automatically be created and destroyed when running tests via `npm test`. If you _don't_ have Docker installed, you will need to run Postgres manually before testing.

When developing and testing locally (outside of just running `npm t`) with Docker installed, you can use the following npm run scripts for convenience:

- `npm run pg-test`: Initialize a Postgres db within a Docker container and leave it running
- `npm run psql`: Login to the running Postgres container to run some manual queries
- `npm run pg-test-down`: Destroy the running Postgres container

## License

ISC
