const LoadProductsService = require('../services/LoadProductService');
const User = require('../models/User');
const Order = require('../models/Order');

const Cart = require('../../lib/cart');
const mailer = require('../../lib/mailer');
const { formatPrice, date } = require('../../lib/utils');

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
        // pegar os pedidos do usuário
        let orders = await Order.findAll({ where: { buyer_id: require.session.userId }});

        const getOrdersPromise = orders.map(async order => {
            // detalhes do produto
            order.product = await LoadProductsService.load('product', {
                where: { id: order.product_id }
            });

            // detalhes do comprador
            order.buyer = await User.findOne({
                where: { id: order.buyer_id}
            });

            // detalhes do vendedor
            order.seller = await User.findOne({
                where: { id: order.seller_id}
            });

            // formatação de preço
            order.formattedPrice = formatPrice(order.price);
            order.formattedTotal = formatPrice(order.total);

            // formatação do status
            const statuses = {
                open: 'Aberto',
                sold: 'Vendido',
                canceled: 'Cancelado'
            }

            order.formattedStatus = statuses[order.status];

            // formatação de atulizado em..
            const updatedAt = date(order.updated_at)
            order.formattedUpdatedAt = `${order.formattedStatus} em ${updatedAt.day}/${updatedAt.month}/${updatedAt.year}`

            return order
        });

        orders = await Promise.all(getOrdersPromise);

        return response.render("orders/index", { orders });


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
                product = await LoadProductsService.load('product', {
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
        
    }
};