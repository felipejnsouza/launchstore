const Cart = require('../../lib/cart');

const LoadProductsService = require('../services/LoadProductService');
const { addOne, removeOne } = require('../../lib/cart');

module.exports = {
    async index(require, response){

        try {
            let { cart } = require.session

            // gerenciador de carrinho
            cart = Cart.init(cart);

            return response.render('cart/index', {cart});

        } catch (error) {
            console.error(error);
        };
    },
    async addOne(require, response){
        // pegar o id do produto e o produto
        const { id } = require.params;

        const product = await LoadProductsService.load('product', {where: {id}});

        // pegar o carrinho da sessão
        let { cart } = require.session;

        // adicionar o produto ao carrinho (gerenciador de carrinho)
        cart = Cart.init(cart).addOne(product);

        // atualizar o carrinho da sessão
        require.session.cart = cart;

        // redirecionar o usuário para a tela do carrinho
        return response.redirect('/cart');

    },
    async removeOne(require, response){
        // pegar o id do produto e o produto
        const { id } = require.params;

        // pegar o carrinho da sessão
        let { cart } = require.session;

        // se não tiver carrinho, retornar
        if(!cart) return response.redirect('/cart');
        // iniciar o carrinho (gerenciador de carrinho) e remover
        cart = Cart.init(cart).removeOne(id);

        // atualizar o carrinho da sessão, removendo 1 item
        require.session.cart = cart;

        // redirecionamento para a pagina cart
        return response.redirect('/cart');

    },
    delete(require, response){
        let {id} = require.params;
        let {cart} = require.session;

        if(!cart) return;

        cart = Cart.init(cart).delete(id);

        require.session.cart = cart;

        return response.redirect('/cart');
    }



};