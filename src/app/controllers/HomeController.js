const LoadProductsService = require('../services/LoadProductService');


module.exports = {
    async index(require, response){

        const allProducts = await LoadProductsService.load('products')
        const products = allProducts
        
        .filter((product, index) => index > 2 ? false : true);


        return response.render('home/index', {products});
    }
};