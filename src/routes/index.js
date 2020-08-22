const express = require('express');
const routes = express.Router();

const HomeController = require('../app/controllers/HomeController');

const products = require('./products');
const users = require('./users');


// HOME
routes.get('/', HomeController.index);
routes.use('/users', users);
routes.use('/products', products);




// Alias
routes.get('/ads/create', (require, response) => {
    return response.redirect(`/products/create`)
});

routes.get('/accounts', (require, response) => {
    return response.redirect(`/users/login`)
});

module.exports = routes;