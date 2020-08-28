const Product = require('../models/Product');

const LoadProductsService = require('../services/LoadProductService');

module.exports = {
    async index(require, response){
        
        try{

            let { filter, category } = require.query;

            if(!filter || filter.toLowerCase() == 'toda a loja') filter = null

            

            let products = await Product.search({filter, category});

            const productsPromise = products.map(LoadProductsService.format);

            products = await Promise.all(productsPromise);

            const search = {
                term: filter || 'Toda a loja',
                total: products.length
            }

            const categories = products.map(product => ({
                id: product.category_id,
                name: product.category_name
            })).reduce((categoriesFiltered, category) => {
                const found = categoriesFiltered.some(cat => cat.id == category.id)
                
                if(!found) categoriesFiltered.push(category);

                return categoriesFiltered
            }, []);
            


            return response.render('search/index', {products, search, categories});
        }
        catch(err){
            console.log(err);
        };

    }
};