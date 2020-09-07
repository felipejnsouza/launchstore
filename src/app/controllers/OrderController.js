const LoadProductService = require('../services/LoadProductService');
const LoadOrderService = require('../services/LoadOrderService');
const User = require('../models/User');
const Order = require('../models/Order');

const Cart = require('../../lib/cart');
const mailer = require('../../lib/mailer');
const { update } = require('../models/Order');

const email = (seller, product, buyer) => `
<h2>Olá ${seller.name},</h2>
<p>Você tem um novo pedido de compra do seu produto!</p>
<p>Produto: ${product.name}</p>
<p>Produto: ${product.formattedPrice}</p>
<p><br/><br/></p>
<h3>Dados do comprador</h3>
<p>Nome: ${buyer.name}</p>
<p>Email: ${buyer.email}</p>
<p>Endereço: ${buyer.address}</p>
<p>CEP: ${buyer.cep}</p>
<p><br/><br/></p>
<p><strong>Entre em contato com o comprador para finalizar a venda!</strong></p>
<p><br/><br/></p>
<p>Atenciosamente, Equipe Launchstore</p>
`

module.exports = {
    async index(require, response){
        const orders = await LoadOrderService.load('orders', {
            where: { buyer_id: require.session.userId }
        });

        return response.render("orders/index", { orders });

    },
    async sales(require, response){
        const sales = await LoadOrderService.load('orders', {
            where: { seller_id: require.session.userId }
        });

        return response.render("orders/sales", { sales });

    },
    async show(require, response){
        const order = await LoadOrderService.load('order', {
            where: {id: require.params.id}
        })

        return response.render('orders/details', {order})

    },
    async post(require, response){
        try {
            // pegar os produtos do carrinho
            const cart = Cart.init(require.session.cart);

            const buyer_id = require.session.userId;
            const filteredItems = cart.items.filter( item =>
                item.product.user_id != require.session.userId);

            // criar o pedido
            const createOrdersPromise = filteredItems.map(async item => {
                let { product, price:total, quantity } = item;
                const { price, id: product_id, user_id: seller_id } = product;
                const status = "open";

                const order = await Order.create({
                    seller_id,
                    buyer_id,
                    product_id,
                    price,
                    total,
                    quantity,
                    status
                });

                // pegar os dados do produto
                product = await LoadProductService.load('product', {
                    where: { id: product_id}
                })

                // os dados do vendedor
                const seller = await User.findOne({where: {id: seller_id}});

                // os dados do comprador
                const buyer = await User.findOne({where: {id: buyer_id}});

                // enviar email com dados da compra para o vendedor
                await mailer.sendMail({
                    to: seller.email,
                    from: 'no-reply@launchstore.com.br',
                    subject: 'Novo pedido de compra',
                    html: email(seller, product, buyer)
                });

                return order
            })


            await Promise.all(createOrdersPromise);

            // Clear cart

            delete require.session.cart;
            Cart.init();
            

            // notificar o usuário com alguma mensagem de sucesso
            return response.render('orders/success');

        } catch (error) {
            // ou erro
            console.error(error);
            return response.render('orders/error');

        };
        
    },
    async update(require, response){
        try {
            const { id, action } = require.params;

            const acceptedActions = ['close', 'cancel'];

            if(!acceptedActions.includes(action)) return response.send("Can't do this action");

            // pegar pedido
            const order = await Order.findOne({ where: { id }});

            if(!order) return response.send("Order not found");

            // verificar se ele está aberto
            if(order.status != "open") return response.send("Can't do this action");

            // atualizar o pedido
            const statuses = {
                close: "sold",
                cancel: "canceled"
            }

            order.status = statuses[action];

            await Order.update(id, {
                status: order.status
            });

            // redirecionar
            return response.redirect('/orders/sales')
            
        } catch (error) {
            console(error);       
        };
    }
    
};