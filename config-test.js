module.exports = {
  connection: {
    driver: "pg",
    user: "postgres",
    host: "0.0.0.0",
    database: "oauth2_server"
  },
  pool: {
    min: 0,
    max: 7
  }
}
