
const express = require('express');
const routes = express.Router();
const multer = require('../app/middlewares/multer');

const ProductController = require('../app/controllers/ProductController');
const SearchController = require('../app/controllers/SearchController');

const { OnlyUsers } = require('../app/middlewares/session');

const Validator = require('../app/validators/product');

// SEARCH
routes.get('/search', SearchController.index);

// PRODUCTS
routes.get('/create', OnlyUsers, ProductController.create);
routes.get('/:id/edit', ProductController.edit);
routes.get('/:id', ProductController.show);

routes.post('/',OnlyUsers, multer.array("photos", 6),Validator.post, ProductController.post);
routes.put('/',OnlyUsers, multer.array("photos", 6),Validator.put, ProductController.put);
routes.delete('/',OnlyUsers, ProductController.delete);

module.exports = routes;
