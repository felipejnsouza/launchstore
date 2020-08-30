const LoadProductsService = require('../services/LoadProductService');
const User = require('../models/User');

const mailer = require('../../lib/mailer');
const { product } = require('../services/LoadProductService');

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
    async post(require, response){
        try {
            // pegar os dados do produto
            const product = await LoadProductsService.load('product', {
                where: { id: require.body.id}
            })

            // os dados do vendedor
            const seller = await User.findOne({where: {id: product.user_id}});

            // os dados do comprador
            const buyer = await User.findOne({where: {id: require.session.userId}});

            // enviar email com dados da compra para o vendedor
            await mailer.sendMail({
                to: seller.email,
                from: 'no-reply@launchstore.com.br',
                subject: 'Novo pedido de compra',
                html: email(seller, product, buyer)
            });

            // notificar o usuário com alguma mensagem de sucesso
            return response.render('orders/success');

        } catch (error) {
            // ou erro
            console.error(error);
            return response.render('orders/error');

        };
        
    }
};