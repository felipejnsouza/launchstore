const Category = require('../models/Category');
const Product = require('../models/Product');
const File = require('../models/File');

const { formatPrice, date } = require('../../lib/utils');

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
            const keys = Object.keys(require.body);

            for(key of keys){
                if(require.body[key] == "") {
                    return response.send('Please, fill all fields!')
                };
            };

            if(require.files.length == 0) {
                return response.send('Please, send at least one image')
            };

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

            const filesPromise = require.files.map(file => File.create({...file, product_id}));
            await Promise.all(filesPromise);

            return response.redirect(`products/${productId}/edit`);

            
        } catch (error) {
            console.error(error);            
        };

    },
    async show(require, response){
        try {
            const product = await Product.find(require.params.id);

            if(!product) return response.send("Product not found!");

            const { day, hour, minutes, month } = date(product.updated_at);

            product.published = {
                day: `${day}/${month}`,
                hour: `${hour}h${minutes}`
            };

            product.oldPrice = formatPrice(product.old_price);
            product.price = formatPrice(product.price);

            let files = await Product.files(product.id)
            files = files.map( file => ({
                ...file,
                src: `${require.protocol}://${require.headers.host}${file.path.replace("public", "")}`
            }));

            return response.render('products/show', {product, files});
        } catch (error) {
            console.error(error);
        };
        
    },
    async edit(require, response){
        try {
            const product = await Product.find(require.params.id);

            if(!product) response.send('Product not found!');

            product.price = formatPrice(product.price);
            product.old_price = formatPrice(product.old_price);

            // get categories
            const categories = await Category.findAll();

            // get images
            let files = await Product.files(product.id);

            files = files.map(file => ({
                ...file,
                src: `${require.protocol}://${require.headers.host}${file.path.replace("public", "")}`
            }));

            return response.render('products/edit', { product, categories, files });
            
        } catch (error) {
            console.error(error);
        };
        
    },
    async put(require, response){
        try {
            const keys = Object.keys(require.body);

            for(key of keys){
                if(require.body[key] == "" && key != "removed_files") {
                    return response.send('Please, fill all fields!')
                };
            };

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

                require.body.old_price = oldProduct.rows[0].price
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
        await Product.delete(require.body.id);

        return response.redirect('/products/create');
    }
};