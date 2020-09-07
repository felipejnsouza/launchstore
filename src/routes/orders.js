const express = require('express');
const routes = express.Router();

const OrderController = require('../app/controllers/OrderController');

const { OnlyUsers } = require('../app/middlewares/session');


routes.post('/',OnlyUsers, OrderController.post);
routes.get('/',OnlyUsers, OrderController.index);

routes.get('/sales',OnlyUsers, OrderController.sales);
routes.get('/:id',OnlyUsers, OrderController.show);

module.exports = routes;