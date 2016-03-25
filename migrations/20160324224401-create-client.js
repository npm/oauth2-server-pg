var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('clients', {
    columns: {
      id: { type: type.INTEGER, primaryKey: true, autoIncrement: true },
      client_id: { type: type.STRING },
      client_secret: { type: type.STRING },
      name: { type: type.STRING },
      homepage: { type: type.STRING },
      description: { type: type.STRING },
      callback: { type: type.STRING },
      created: { type: type.DATE_TIME },
      deleted: { type: type.DATE_TIME }
    }
  }, function () {
    db.runSql('CREATE UNIQUE INDEX client_id_idx ON clients (client_id) WHERE deleted IS NULL', function () {
      db.runSql('CREATE UNIQUE INDEX client_name_idx ON clients (name) WHERE deleted IS NULL', function () {
        callback()
      })
    })
  })
};

exports.down = function(db, callback) {
  db.dropTable('clients', callback)
};
