const User = require('../models/User');
const crypto = require('crypto');
const mailer = require('../../lib/mailer');

const { hash } = require('bcryptjs');

module.exports = {
    loginForm(require, response){
        return response.render("session/login");
    },
    login(require, response){
        require.session.userId = require.user.id;

        return response.redirect('/users');
        
    },
    logout(require, response){
        require.session.destroy();
        
        return response.redirect('/');
    },
    forgotForm(require, response){
        return response.render('session/forgot-password');
    },
    async forgot(require, response){
        const user = require.user;

        try {
            // criar um token para user
            const token = crypto.randomBytes(20).toString("hex");

            // criar uma expiração do token
            let now = new Date();
            now = now.setHours(now.getHours() + 1);

            await User.update(user.id, {
                reset_token: token,
                reset_token_expires: now
            })

            //enviar um email com link de recuperação de senha
            await mailer.sendMail({
                to: user.email,
                from: 'no-reply@launchstore.com.br',
                subject: 'Recuperação de senha',
                html: `<h2>Perdeu a chave?</h2>
                <p>Não se preocupe, clique no link abaixo para recuperar sua senha!</p>
                <p>
                    <a href="http://localhost:5000/users/password-reset?token=${token}" target="_blank">
                        RECUPERAR SENHA
                    </a>
                </p>
                `,
            })

            //avisar o usuário que enviamos o email

            return response.render('session/forgot-password',{
                success: "Verifique seu email para resetar sua senha!"
            })
            
        } catch (err) {
            console.error(err);

            return response.render("session/forgot-password", {
                error: "Erro inesperado, tente novamente!"
            })
        }

        
    },
    resetForm(require, response){
        return response.render('session/password-reset', { token: require.query.token})
    },
    async reset(require, response){
        const { user } = require;
        const { password, token } = require.body;

        try {
            // cria um novo hash de senha
            const newPassword = await hash(password, 8);

            // atualiza o usuário
            await User.update(user.id, {
                password: newPassword,
                reset_token: "",
                reset_token_expires: ""
            })

            // avisa o usuário que ele tem uma nova senha
            return response.render('session/login', {
                user: require.body,
                success: "Senha atualizada! Faça o seu login."
            })

            
        } catch (err) {
            console.error(err);

            return response.render("session/password-reset", {
                user: require.body,
                token,
                error: "Erro inesperado, tente novamente!"
            })
        }

    }
}