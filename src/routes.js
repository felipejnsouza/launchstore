const express = require('express')
const routes = express.Router()

routes.get('/', (require, response) => {
    return response.send('ok')
})

module.exports = routes