const { Pool } = require('pg')

module.exports = new Pool({
    user: 'postgres',
    password: 'fjsouza',
    host: 'localhost',
    port: 5432,
    database: 'launchstoredb'
})