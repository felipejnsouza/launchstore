const User = require('../models/User');
const Product = require('../models/Product');

const { unlinkSync } = require('fs');
const { hash } = require('bcryptjs');

const { formatCep, formatCpfCnpj } = require('../../lib/utils');

module.exports = {
    registerForm(require, response){

        return response.render('user/register');
    },
    async show(require, response){
        try {
            const { user } = require;

            user.cpf_cnpj = formatCpfCnpj(user.cpf_cnpj);
            user.cep = formatCep(user.cep);

            response.render("user/index", { user });
        } catch (error) {
            console.error(error);
        };
        
    },
    async post(require, response){
        try {
            let { name, email, password, cpf_cnpj, cep, address } = require.body;

            //hash of password
            password = await hash(password, 8);
            cpf_cnpj = cpf_cnpj.replace(/\D/g, "");
            cep = cep.replace(/\D/g, "");

            const userId = await User.create({
                name,
                email,
                password,
                cpf_cnpj,
                cep,
                address
            });

            require.session.userId = userId;

            return response.redirect('/users');
        } catch (error) {
            console.error(error);
        };       
        
    },
    async update(require, response){
        try {
            const { user } = require;
            let { name, email, cpf_cnpj, cep, address } = require.body;

            cpf_cnpj = cpf_cnpj.replace(/\D/g, "");
            cep = cep.replace(/\D/g, "");

            await User.update(user.id, {
                name,
                cpf_cnpj,
                email,
                cep,
                address
            });

            return response.render('user/index',{
                user: require.body,
                success: "conta atualizada com sucesso!"
            })
            
        } catch (err) {
            console.error(err);
            return response.render('user/index', {
                error: "Algum erro aconteceu!"
            })
        }
    },
    async delete(require, response){
        try {
            const products = await Product.findAll({ where: {user_id: require.body.id}});

            //dos produtos, pegar todas as imagens
            const allFilesPromise = products.map(product => {
                return Product.files(product.id);
            });

            let promiseResults = await Promise.all(allFilesPromise);

            //rodar a remoção do usuário
            await User.delete(require.body.id);
            require.session.destroy();
            
            //remover as imagens da pasta public
            promiseResults.map(files => {
                
                files.map(file => {
                    try {
                        unlinkSync(file.path);
                    } catch (err) {
                        console.error(err)
                    };
                });
            });

            return response.render("session/login", {
                success: "Conta deletada com sucesso!"
            })
            
        } catch (err) {
            console.error(err);
            return response.render("user/index",{
                user: require.body,
                error: "Erro ao tentar deletar sua conta!"
            });
        };
    }
};