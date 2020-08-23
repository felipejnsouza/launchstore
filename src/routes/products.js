
const express = require('express');
const routes = express.Router();
const multer = require('../app/middlewares/multer');

const { OnlyUsers } = require('../app/middlewares/session');

const ProductController = require('../app/controllers/ProductController');
const SearchController = require('../app/controllers/SearchController');


// SEARCH
routes.get('/search', SearchController.index);

// PRODUCTS
routes.get('/create', OnlyUsers, ProductController.create);
routes.get('/:id/edit', ProductController.edit);
routes.get('/:id', ProductController.show);

routes.post('/',OnlyUsers, multer.array("photos", 6),ProductController.post);
routes.put('/',OnlyUsers, multer.array("photos", 6), ProductController.put);
routes.delete('/',OnlyUsers, ProductController.delete);

module.exports = routes;
