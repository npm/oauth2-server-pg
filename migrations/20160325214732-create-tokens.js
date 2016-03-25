var dbm = global.dbm || require('db-migrate')
var type = dbm.dataType

exports.up = function (db, callback) {
  db.createTable('tokens', {
    columns: {
      id: { type: type.INTEGER, primaryKey: true, autoIncrement: true },
      client_id: { type: type.INTEGER },
      access_token: { type: type.STRING },
      access_expires: { type: type.DATE_TIME },
      refresh_token: { type: type.STRING },
      refresh_expires: { type: type.DATE_TIME },
      user_email: { type: type.STRING },
      created: { type: type.DATE_TIME },
      deleted: { type: type.DATE_TIME }
    }
  }, function () {
    db.runSql('CREATE UNIQUE INDEX tokens_access_token_idx ON tokens (access_token) WHERE deleted IS NULL', function () {
      db.runSql('CREATE INDEX tokens_client_id_access_token_idx ON tokens (client_id, access_token) WHERE deleted IS NULL', function () {
        db.runSql('ALTER TABLE tokens ADD CONSTRAINT tokens_client_id_fk FOREIGN KEY (client_id) REFERENCES clients (id) MATCH FULL', function () {
          callback()
        })
      })
    })
  })
}

exports.down = function (db, callback) {
  db.dropTable('tokens', callback)
}
