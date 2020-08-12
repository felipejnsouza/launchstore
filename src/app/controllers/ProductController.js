const Category = require('../models/Category');
const Product = require('../models/Product');
const { formatPrice } = require('../../lib/utils');

module.exports = {
    create(require, response){
        //Pegar Categorias
        Category.all()
            .then(function(results){
                const categories = results.rows;

                return response.render('products/create.njk', { categories })
            }).catch(function(err){
                throw new Error(err)
            });

    },
    async post(require, response){
        //lógica de salvar
        const keys = Object.keys(require.body);

        for(key of keys){
            if(require.body[key] == "") {
                return response.send('Please, fill all fields!')
            };
        };
        let results = await Product.create(require.body);
        const productId = results.rows[0].id;

        return response.redirect(`products/${productId}`);

    },
    async edit(require, response){
        let results = await Product.find(require.params.id);
        const product = results.rows[0];

        if(!product) results.send('Product not found!');

        product.price = formatPrice(product.price);
        product.old_price = formatPrice(product.old_price);

        results = await Category.all();
        const categories = results.rows;

        return response.render('products/edit.njk', { product, categories });
    },
    async put(require, response){
        const keys = Object.keys(require.body);

        for(key of keys){
            if(require.body[key] == "") {
                return response.send('Please, fill all fields!')
            };
        };

        require.body.price = require.body.price.replace(/\D/g,"");
        
        if(require.body.old_price != require.body.price){
            const oldProduct = await Product.find(require.body.id)

            require.body.old_price = oldProduct.rows[0].price
        }

        await Product.update(require.body)

        return response.redirect(`/products/${require.body.id}/edit`)


    },
    async delete(require, response){
        await Product.delete(require.body.id);

        return response.redirect('/products/create');
    }
};