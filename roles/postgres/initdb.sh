#!/bin/sh

set -e

# Perform all actions as $POSTGRES_USER
export PGUSER="$POSTGRES_USER"

# Create the oauth2-server database.
psql --dbname="$POSTGRES_DB" <<- 'EOSQL'
CREATE DATABASE oauth2_server;
EOSQL
