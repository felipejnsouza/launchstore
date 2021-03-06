const express = require('express');
const routes = express.Router();

const HomeController = require('../app/controllers/HomeController');

const products = require('./products');
const users = require('./users');
const cart = require('./cart');
const orders = require('./orders');


// HOME
routes.get('/', HomeController.index);
routes.use('/users', users);
routes.use('/products', products);
routes.use('/cart', cart);
routes.use('/orders', orders);




// Alias
routes.get('/ads/create', (require, response) => {
    return response.redirect(`/products/create`)
});

routes.get('/accounts', (require, response) => {
    return response.redirect(`/users/login`)
});

module.exports = routes;