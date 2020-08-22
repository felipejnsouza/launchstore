const User = require('../models/User');
const { compare } = require('bcryptjs');


async function login(require, response, next){
    const { email, password } = require.body;

    const user = await User.findOne({ where: {email} });

    if(!user) return response.render('session/login', {
        user: require.body,
        erro: "Usuário não cadastrado."
    })

    const passed = await compare(password, user.password);
    
    if(!passed) return response.render('session/login', {
        user: require.body,
        error: "Senha incorreta."
    });

    require.user = user;

    next();
};

module.exports = {
    login
};