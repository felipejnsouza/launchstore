const Category = require('../models/Category');
const Product = require('../models/Product');
const File = require('../models/File');
const LoadProductService = require('../services/LoadProductService');

const { unlinkSync } = require('fs');

module.exports = {
    async create(require, response){
        try {
            const categories = await Category.findAll();

            return response.render('products/create', { categories });

        } catch (error) {
            console.error(error);
        };

    },
    async post(require, response){
        try {
            //lógica de salvar
            

            let { category_id, name, description, old_price, price, quantity, status } = require.body;

            price = price.replace(/\D/g, "");

            const product_id = await Product.create({
                category_id, 
                user_id: require.session.userId,
                name, 
                description, 
                old_price: old_price || price, 
                price, 
                quantity, 
                status: status || 1
            })

            const filesPromise = require.files.map(file => File.create({name: file.filename, path: file.path, product_id}));
            await Promise.all(filesPromise);

            return response.redirect(`products/${product_id}/edit`);

            
        } catch (error) {
            console.error(error);            
        };

    },
    async show(require, response){
        try {
            const product = await LoadProductService.load('product', {where: {
                id: require.params.id
            }});

            return response.render('products/show', {product});
        } catch (error) {
            console.error(error);
        };
        
    },
    async edit(require, response){
        try {
            const product = await LoadProductService.load('product', {where: {
                id: require.params.id
            }});

            // get categories
            const categories = await Category.findAll();

            return response.render('products/edit', { product, categories });
            
        } catch (error) {
            console.error(error);
        };
        
    },
    async put(require, response){
        try {
            if(require.files.length != 0){
                const newFilesPromise = require.files.map( file => {
                    File.create({...file, product_id: require.body.id})
                })

                await Promise.all(newFilesPromise);
            };

            if(require.body.removed_files){
                const removedFiles = require.body.removed_files.split(",");
                const lastIndex = removedFiles.length - 1;
                
                removedFiles.splice(lastIndex,1);

                const removedFilesPromises = removedFiles.map( id => File.delete(id));

                await Promise.all(removedFilesPromises);
            };

            require.body.price = require.body.price.replace(/\D/g,"");
            
            if(require.body.old_price != require.body.price){
                const oldProduct = await Product.find(require.body.id)

                require.body.old_price = oldProduct.price
            }

            await Product.update(require.body.id, {
                category_id: require.body.category_id,
                name: require.body.name,
                description: require.body.description,
                old_price: require.body.old_price,
                price: require.body.price,
                quantity: require.body.quantity,
                status: require.body.status,
            });

            return response.redirect(`/products/${require.body.id}`);

        } catch (error) {
            console.error(error);
        };
        
    },
    async delete(require, response){
        const files = await Product.files(require.body.id);
        await Product.delete(require.body.id);


        files.map(file => {
            try {
                unlinkSync(file.path);
            } catch (err) {
                console.error(err)
            };
        });
    


        return response.redirect('/products/create');
    }
};