const User = require('../models/User');
const { formatCep, formatCpfCnpj } = require('../../lib/utils');

module.exports = {
    registerForm(require, response){

        return response.render('user/register');
    },
    async show(require, response){

        const { user } = require;

        user.cpf_cnpj = formatCpfCnpj(user.cpf_cnpj);
        user.cep = formatCep(user.cep);

        response.render("user/index", { user });
    },
    async post(require, response){
        
        const userId = await User.create(require.body);

        require.session.userId = userId;

        return response.redirect('/users');
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
            await User.delete(require.body.id);
            require.session.destroy();

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