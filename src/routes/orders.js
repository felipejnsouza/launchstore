const express = require('express');
const routes = express.Router();

const OrderController = require('../app/controllers/OrderController');

const { OnlyUsers } = require('../app/middlewares/session');


routes.post('/',OnlyUsers, OrderController.post);
routes.get('/',OnlyUsers, OrderController.index);

module.exports = routes;