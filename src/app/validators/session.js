const User = require('../models/User');
const { compare } = require('bcryptjs');


async function login(require, response, next){
    const { email, password } = require.body;

    const user = await User.findOne({ where: {email} });

    if(!user) return response.render('session/login', {
        user: require.body,
        error: "Usuário não cadastrado."
    })

    const passed = await compare(password, user.password);
    
    if(!passed) return response.render('session/login', {
        user: require.body,
        error: "Senha incorreta."
    });

    require.user = user;

    next();
};

async function forgot(require, response, next){
    const { email } = require.body;

    try {
        let user = await User.findOne({ where: { email }})

        if(!user) return response.render('session/forgot-password', {
            user: require.body,
            error: "Email não cadastrado."
        })

        require.user = user;

        next();
        
    } catch (err) {
        console.error(err);
    }

};

async function reset(require, response, next){
    // procurar o usuário
    const { email, password, passwordRepeat, token } = require.body;

    const user = await User.findOne({ where: {email} });

    if(!user) return response.render('session/password-reset', {
        user: require.body,
        token,
        error: "Usuário não cadastrado."
    })

    // ver se a senha bate
    if(password != passwordRepeat)
        return response.render('session/password-reset', {
            user: require.body,
            token,
            error: 'As senhas são diferentes!'
        });

    // verificar se o token bate
    if(token != user.reset_token) 
        return response.render('session/password-reset', {
            user: require.body,
            token,
            error: 'Token inválido! Solicite uma nova recuperação de senha.'
        });

    // verificar se o token não expirou
    let now = new Date();
    now = now.setHours(now.getHours());

    if (now > user.reset_token_expires)
        return response.render('session/password-reset', {
            user: require.body,
            token,
            error: 'Token expirado! Solicite uma nova recuperação de senha.'
        });

    require.user = user;

    next();
}


module.exports = {
    login,
    forgot,
    reset
};